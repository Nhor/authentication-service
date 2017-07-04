const utils = require('../../utils');

class ChangePassword {

  static PUT(req, res, next) {
    let context = res.locals.context;

    let validation = utils.Validator.validate(req.body, {
      oldPassword: utils.Validator.NotEmptyStringField,
      newPassword: utils.Validator.PasswordField
    });

    if (!validation.success)
      return utils.Tools.validationFailed(res, next, validation);

    let sessionId = req.headers.authorization;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    context.models.admin
      .authenticate(sessionId)
      .then(id => context.models.admin.changePassword(id, oldPassword, newPassword))
      .then(() => utils.Tools.actionSucceeded(res, next))
      .catch(err => utils.Tools.actionFailed(res, next, err, context.logger));
  }
}

module.exports = ChangePassword;
