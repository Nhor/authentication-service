const utils = require('../../utils');

class Deregister {

  static DELETE(req, res, next) {
    let context = res.locals.context;

    req.params.id = parseInt(req.params.id, 10);

    let validation = utils.Validator.validate(req.params, {
      id: utils.Validator.IntegerField
    });

    if (!validation.success)
      return utils.Tools.validationFailed(res, next, validation);

    let sessionId = req.headers.authorization;
    let id = req.params.id;

    context.models.admin
      .authenticate(sessionId)
      .then(adminId => context.models.adminPermission.has(context.models.adminPermission.CODE.DELETE_ADMINS, adminId))
      .then(() => context.models.admin.remove(id))
      .then(() => utils.Tools.actionSucceeded(res, next))
      .catch(err => utils.Tools.actionFailed(res, next, err, context.logger));
  }
}

module.exports = Deregister;
