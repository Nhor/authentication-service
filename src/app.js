const Config = require('./Config');
const utils = require('./backend/utils');
const routes = require('./backend/routes');

let logger = new utils.Logger(Config.logToFile);
let database = new utils.Database(Config.databaseHost, Config.databasePort, Config.databaseName, Config.databaseUser, Config.databasePassword, Config.databaseSchema);
let redis = new utils.Redis(Config.redisHost, Config.redisPort);
let router = new utils.Router(logger, {logger, database, redis});
let server = new utils.Server(Config.name, Config.version, Config.port);

server.addRouter('/api/v1', router);

server
  .listen()
  .then(params => logger.info(`${params.name} v${params.version} server listening on http://127.0.0.1:${params.port}...`));
