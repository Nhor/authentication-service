const _ = require('lodash');
const utils = require('../../../utils');

class Revoke {

  static DELETE(req, res, next) {
    let context = res.locals.context;

    req.params.adminId = parseInt(req.params.adminId, 10);
    req.params.id = parseInt(req.params.id, 10);

    let validation = utils.Validator.validate(req.params, {
      adminId: utils.Validator.IntegerField,
      id: utils.Validator.IntegerField
    });

    if (!validation.success)
      return utils.Tools.validationFailed(res, next, validation);

    let sessionId = req.headers.authorization;
    let adminPermissionId = req.params.id;
    let adminId = req.params.adminId;

    context.models.admin
      .authenticate(sessionId)
      .then(id => context.models.adminPermission.has(context.models.adminPermission.CODE.REVOKE_ADMIN_PERMISSIONS, id))
      .then(() => context.models.adminPermission.revoke(adminPermissionId, adminId))
      .then(() => utils.Tools.actionSucceeded(res, next))
      .catch(err => utils.Tools.actionFailed(res, next, err, context.logger));
  }
}

module.exports = Revoke;
