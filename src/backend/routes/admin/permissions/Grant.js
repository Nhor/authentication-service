const _ = require('lodash');
const utils = require('../../../utils');

class Grant {

  static POST(req, res, next) {
    let context = res.locals.context;

    req.params.adminId = parseInt(req.params.adminId, 10);

    let validation = utils.Validator.validate(_.merge({}, req.params, req.body), {
      id: utils.Validator.IntegerField,
      adminId: utils.Validator.IntegerField
    });

    if (!validation.success)
      return utils.Tools.validationFailed(res, next, validation);

    let adminPermissionId = req.body.id;
    let adminId = req.params.adminId;

    context.models.adminPermission
      .grant(adminPermissionId, adminId)
      .then(() => utils.Tools.actionSucceeded(res, next))
      .catch(err => utils.Tools.actionFailed(res, next, err, context.logger));
  }
}

module.exports = Grant;
