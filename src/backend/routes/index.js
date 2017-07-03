module.exports.admin = {permissions: {}};
module.exports.admin.Register = require('./admin/Register');
module.exports.admin.Login = require('./admin/Login');
module.exports.admin.Logout = require('./admin/Logout');
module.exports.admin.permissions.Grant = require('./admin/permissions/Grant');