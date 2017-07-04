const utils = require('../../utils');

class Register {

  static POST(req, res, next) {
    let context = res.locals.context;

    let validation = utils.Validator.validate(req.body, {
      email: utils.Validator.EmailField,
      username: utils.Validator.UsernameField,
      password: utils.Validator.PasswordField
    });

    if (!validation.success)
      return utils.Tools.validationFailed(res, next, validation);

    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;

    context.models.admin
      .create(email, username, password)
      .then(adminId => utils.Tools.actionSucceeded(res, next, {adminId}))
      .catch(err => utils.Tools.actionFailed(res, next, err, context.logger));
  }
}

module.exports = Register;
