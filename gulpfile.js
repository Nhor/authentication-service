const pjson = require('./package.json');
const config = require('./config.json');
const fs = require('fs');
const _ = require('lodash');
const pg = require('pg');
const es = require('event-stream');
const gulp = require('gulp');
const replace = require('gulp-replace');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const mocha = require('gulp-mocha');
const spawn = require('child_process').spawn;
let nodeProcess;
let exitOnFinish = true;
let exitCode = 0;


////////////////////////////////////////////////////////////////////////////////
//                                CONFIGURATION                               //
////////////////////////////////////////////////////////////////////////////////
let name = pjson.name;
let version = pjson.version;
let port = config.port;
let databaseHost = config.databaseHost;
let databasePort = config.databasePort;
let databaseName = config.databaseName;
let databaseUser = config.databaseUser;
let databasePassword = config.databasePassword;
let databaseSchema = config.databaseSchema;
let redisHost = config.redisHost;
let redisPort = config.redisPort;
let logToFile = config.logToFile;

gulp.task('configuration:apply', () => gulp
  .src('./src/Config.js.sample')
  .pipe(replace(/name\(\)(.*)/, `name() { return '${name}'; }`))
  .pipe(replace(/version\(\)(.*)/, `version() { return '${version}'; }`))
  .pipe(replace(/port\(\)(.*)/, `port() { return ${port}; }`))
  .pipe(replace(/databaseHost\(\)(.*)/, `databaseHost() { return '${databaseHost}'; }`))
  .pipe(replace(/databasePort\(\)(.*)/, `databasePort() { return ${databasePort}; }`))
  .pipe(replace(/databaseName\(\)(.*)/, `databaseName() { return '${databaseName}'; }`))
  .pipe(replace(/databaseUser\(\)(.*)/, `databaseUser() { return '${databaseUser}'; }`))
  .pipe(replace(/databasePassword\(\)(.*)/, `databasePassword() { return '${databasePassword}'; }`))
  .pipe(replace(/databaseSchema\(\)(.*)/, `databaseSchema() { return '${databaseSchema}'; }`))
  .pipe(replace(/redisHost\(\)(.*)/, `redisHost() { return '${redisHost}'; }`))
  .pipe(replace(/redisPort\(\)(.*)/, `redisPort() { return ${redisPort}; }`))
  .pipe(replace(/logToFile\(\)(.*)/, `logToFile() { return ${logToFile}; }`))
  .pipe(babel({presets: ['es2015']}))
  .pipe(uglify())
  .pipe(rename('Config.js'))
  .pipe(gulp.dest('./dist')));


////////////////////////////////////////////////////////////////////////////////
//                                 MIGRATIONS                                 //
////////////////////////////////////////////////////////////////////////////////
gulp.task('migrations:copy', () => gulp
  .src('./src/migrations/**/*.sql')
  .pipe(gulp.dest('./dist/migrations')));

gulp.task('migrations:run', ['migrations:copy'], callback => {
  let sql;
  let args;
  let migrations;
  let migrationsRange = {};
  let client = new pg.Client({
    host: databaseHost,
    port: databasePort,
    database: databaseName,
    user: databaseUser,
    password: databasePassword
  });

  let doesSchemaExist = () => {
    sql = 'SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1;';
    args = [databaseSchema];
    client.query(sql, args, (err, res) => {
      if (err) throw err;
      if (_.isEmpty(res.rows)) {
        sql = `CREATE SCHEMA ${databaseSchema};`;
        args = [];
        return client.query(sql, args, (err, res) => {
          if (err) throw err;
          doesTableExist();
        });
      }
      doesTableExist();
    });
  };

  let doesTableExist = () => {
    sql = 'SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2';
    args = [databaseSchema, 'migration'];
    client.query(sql, args, (err, res) => {
      if (err) throw err;
      if (_.isEmpty(res.rows)) {
        sql = `CREATE TABLE ${databaseSchema}.migration (` +
          '  id          BIGSERIAL PRIMARY KEY, ' +
          '  number      BIGINT    NOT NULL UNIQUE, ' +
          '  name        TEXT      NOT NULL, ' +
          '  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(), ' +
          '  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()' +
          ');';
        args = [];
        return client.query(sql, args, (err, res) => {
          if (err) throw err;
          getMigrationsRange();
        });
      }
      getMigrationsRange();
    });
  };

  let getMigrationsRange = () => {
    let migrationFileNameRegExp = /([0-9]+)-(.*)\.sql/;

    migrations = _
      .chain(fs.readdirSync(`${__dirname}/dist/migrations`))
      .filter(fileName => migrationFileNameRegExp.test(fileName))
      .map(fileName => ({
        fileName: fileName,
        number: parseInt(_.nth(fileName.match(migrationFileNameRegExp), 1), 10),
        name: _.nth(fileName.match(migrationFileNameRegExp), 2)
      }))
      .sortBy('number')
      .value();

    migrationsRange.end = _.last(migrations).number;

    sql = `SELECT number FROM ${databaseSchema}.migration ORDER BY number ASC;`;
    args = [];
    client.query(sql, args, (err, res) => {
      if (err) throw err;
      if (_.isEmpty(res.rows))
        migrationsRange.start = 0;
      else
        migrationsRange.start = parseInt(_.last(res.rows).number, 10) + 1;
      if (migrationsRange.start > migrationsRange.end)
        return callback();
      applyMigration(migrationsRange.start);
    });
  };

  let applyMigration = migrationNumber => {
    let migration = _.find(migrations, {number: migrationNumber});
    sql = fs
      .readFileSync(`${__dirname}/dist/migrations/${migration.fileName}`)
      .toString()
      .replace(/(?:\r\n|\r|\n)/g, '');
    args = [];
    client.query(sql, args, (err, res) => {
      if (err) throw err;
      sql = `INSERT INTO ${databaseSchema}.migration (name, number) VALUES ($1, $2)`;
      args = [migration.name, migration.number];
      client.query(sql, args, (err, res) => {
        if (err) throw err;
        if (migration.number === migrationsRange.end)
          return callback();
        applyMigration(migration.number + 1);
      });
    });
  };

  client.connect(err => {
    if (err) throw err;
    doesSchemaExist();
  });
});

gulp.task('migrations:apply', [
  'migrations:run'
]);


////////////////////////////////////////////////////////////////////////////////
//                                   BACKEND                                  //
////////////////////////////////////////////////////////////////////////////////
gulp.task('backend:js', () => gulp
  .src('./src/backend/**/*.js')
  .pipe(babel({presets: ['es2015']}))
  .pipe(uglify())
  .pipe(gulp.dest('./dist/backend')));

gulp.task('backend:build', [
  'backend:js'
]);


////////////////////////////////////////////////////////////////////////////////
//                                    TEST                                    //
////////////////////////////////////////////////////////////////////////////////
gulp.task('test:js', () => gulp
  .src('./src/test/**/*.js')
  .pipe(babel({presets: ['es2015']}))
  .pipe(uglify())
  .pipe(gulp.dest('./dist/test')));

gulp.task('test:build', [
  'test:js'
]);


////////////////////////////////////////////////////////////////////////////////
//                                   COMMON                                   //
////////////////////////////////////////////////////////////////////////////////
gulp.task('common:js', () => gulp
  .src('./src/*.js')
  .pipe(babel({presets: ['es2015']}))
  .pipe(uglify())
  .pipe(gulp.dest('./dist')));

gulp.task('common:build', [
  'common:js'
]);


////////////////////////////////////////////////////////////////////////////////
//                                   GLOBAL                                   //
////////////////////////////////////////////////////////////////////////////////
gulp.task('build', [
  'configuration:apply',
  'migrations:apply',
  'backend:build',
  'test:build',
  'common:build'
]);

gulp.task('server', callback => {
  exitOnFinish = false;
  nodeProcess = spawn('node', ['./dist/app.js'], {stdio: 'inherit'});
  setTimeout(callback, 1000);
});

gulp.task('kill', callback => {
  exitOnFinish = true;
  nodeProcess && nodeProcess.kill();
  setTimeout(callback, 1000);
});

gulp.task('test', ['server'], () => gulp
  .src(['./dist/test/**/*.js', '!./dist/test/Helpers.js'])
  .pipe(mocha())
  .on('error', () => { exitCode = 1; gulp.start('kill'); })
  .on('end',   () => { exitCode = 0; gulp.start('kill'); }));

gulp.task('default', ['build'], () => gulp.start('server'));

gulp.on('stop', () => exitOnFinish
  ? process.nextTick(() => process.exit(exitCode))
  : undefined);
