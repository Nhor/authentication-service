const utils = require('../../utils');

class Login {

  static POST(req, res, next) {
    let context = res.locals.context;

    let validation = utils.Validator.validate(req.body, {
      username: utils.Validator.NotEmptyStringField,
      password: utils.Validator.NotEmptyStringField
    });

    if (!validation.success)
      return utils.Tools.validationFailed(res, next, validation);

    let username = req.body.username;
    let password = req.body.password;

    context.models.admin
      .login(username, password)
      .then(sessionId => utils.Tools.actionSucceeded(res, next, {sessionId: sessionId}))
      .catch(err => utils.Tools.actionFailed(res, next, err, context.logger));
  }
}

module.exports = Login;
