const Config = require('./Config');
const utils = require('./backend/utils');
const models = require('./backend/models');
const routes = require('./backend/routes');

let logger = new utils.Logger(Config.logToFile);
let database = new utils.Database(Config.databaseHost, Config.databasePort, Config.databaseName, Config.databaseUser, Config.databasePassword, Config.databaseSchema);
let redis = new utils.Redis(Config.redisHost, Config.redisPort);

let router = new utils.Router(logger, {logger, database, redis, models: {
  admin: new models.Admin(database, redis)}});
router.addRoute('POST', '/admin/register', routes.admin.Register.POST);

let server = new utils.Server(Config.name, Config.version, Config.port);
server.addRouter('/api/v1', router);

server
  .listen()
  .then(params => logger.info(`${params.name} v${params.version} server listening on http://127.0.0.1:${params.port}...`));
