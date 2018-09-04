const { permission } = require('../../models');
const { isAdmin } = require('../../auth/validate');
const CRUD = require('./CRUD');


module.exports = CRUD(permission, {
  preCreate: isAdmin,
  preRead: isAdmin,
  preUpdate: isAdmin,
  preDelete: isAdmin,
});
