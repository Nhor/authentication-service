const utils = require('../../utils');

class Service {

  static POST(req, res, next) {
    let context = res.locals.context;

    let validation = utils.Validator.validate(req.body, {
      code: utils.Validator.CodeField,
      name: utils.Validator.NotEmptyStringField
    });

    if (!validation.success)
      return utils.Tools.validationFailed(res, next, validation);

    let adminId;
    let sessionId = req.headers.authorization;
    let code = req.body.code;
    let name = req.body.name;

    context.models.admin
      .authenticate(sessionId)
      .then(id => {
        adminId = id;
        return context.models.adminPermission.has(context.models.adminPermission.CODE.CREATE_SERVICES, adminId);
      })
      .then(() => context.models.service.create(code, name, adminId))
      .then(serviceId => utils.Tools.actionSucceeded(res, next, {serviceId}))
      .catch(err => utils.Tools.actionFailed(res, next, err, context.logger));
  }
}

module.exports = Service;
