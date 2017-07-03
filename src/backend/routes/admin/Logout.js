const utils = require('../../utils');

class Logout {

  static POST(req, res, next) {
    let context = res.locals.context;

    let sessionId = req.headers.authorization;

    context.models.admin
      .authenticate(sessionId)
      .then(adminId => context.models.admin.logout(adminId, sessionId))
      .then(sessionId => utils.Tools.actionSucceeded(res, next))
      .catch(err => utils.Tools.actionFailed(res, next, err, context.logger));
  }
}

module.exports = Logout;
