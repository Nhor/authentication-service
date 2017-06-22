const _ = require('lodash');
const utils = require('../../utils');

class Register {

  static POST(req, res, next) {
    let context = res.locals.context;
    let status;
    let body;

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
      .then(adminId => {
        status = 200;
        body = {success: true, adminId: adminId};
        utils.Tools.prepareResponse(res, next, status, body);
      })
      .catch(err => {
        if (!_.get(err, 'isCustom'))
          context.logger.error(err.message);
        utils.Tools.actionFailed(res, next, err);
      });
  }
}

module.exports = Register;
