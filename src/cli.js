const _ = require('lodash');
const Config = require('./Config');
const utils = require('./backend/utils');
const models = require('./backend/models');

let _stdout = (data, finishWithNewline = true) => {
  let output = data instanceof Error
    ? `Error: ${data.isCustom ? _.invert(utils.Error.Code)[data.code] : data.message}`
    : _.isNil(data) ? '' : data;
  return process.stdout.write(`${output}${finishWithNewline ? '\n' : ''}`);
};

let _stdin = args => {
  let answers = {};
  let currentArg = 0;

  let getStdin = () => _stdout(`${args[currentArg]}: `, false);

  return new Promise((resolve, reject) => {
    process.stdin.on('readable', () => {
      let chunk = process.stdin.read();
      let data = chunk && _.trim(chunk.toString());
      if (_.isEmpty(data)) {
        return getStdin();
      } else {
        answers[args[currentArg]] = data;
        currentArg += 1;
        return currentArg === _.size(args) ? resolve(answers) : getStdin();
      }
    });
  });
};

let _database;
let _getDatabase = () => {
  _database = _database || new utils.Database(Config.databaseHost, Config.databasePort, Config.databaseName, Config.databaseUser, Config.databasePassword, Config.databaseSchema);
  return _database;
};

let _redis;
let _getRedis = () => {
  _redis = _redis || new utils.Redis(Config.redisHost, Config.redisPort);
  return _redis;
};

let createAdmin = () => {
  return _stdin(['email', 'username', 'password'])
    .then(answers => {
      _stdout();

      let validation = utils.Validator.validate(answers, {
        email: utils.Validator.EmailField,
        username: utils.Validator.UsernameField,
        password: utils.Validator.PasswordField
      });

      if (!validation.success) {
        _.each(validation.err, err => _stdout(err));
        throw _.first(validation.err);
      }

      let admin = new models.Admin(_getDatabase(), _getRedis());

      return admin
        .create(answers.email, answers.username, answers.password)
        .then(adminId => _stdout(`Created admin ID: ${adminId}`))
        .catch(err => {
          _stdout(err);
          throw err;
      });
    });
};

(() => {
  switch (_.nth(process.argv, 2)) {
    case 'create-admin':
      return createAdmin();
    default:
      return Promise.resolve();
  }
})().catch(() => {}).then(() => { _stdout(); process.exit(0); });
