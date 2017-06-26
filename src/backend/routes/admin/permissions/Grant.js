const _ = require('lodash');
const utils = require('../../../utils');

class Grant {

  static POST(req, res, next) {
    let context = res.locals.context;
    let status;
    let body;

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
      .then(() => {
        status = 200;
        body = {success: true};
        utils.Tools.prepareResponse(res, next, status, body);
      })
      .catch(err => {
        if (!_.get(err, 'isCustom'))
          context.logger.error(err.message);
        utils.Tools.actionFailed(res, next, err);
      });
  }
}

module.exports = Grant;
