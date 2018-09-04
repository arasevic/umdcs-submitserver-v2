const db = require('../../models');
const roles = require('../../auth/roles');
const val = require('../../auth/validate');
const CRUD = require('./CRUD');


/**
 * Read options for the user Sequelize model. User courses are
 * included through the permissions join table.
 */
const read = {
  include: [{
    model: db.course,
    attributes: { exclude: [ 'createdAt', 'updatedAt' ] },
    through: { attributes: [ 'role' ] }
  }]
};

/**
 * Admins have access to all users. Others may only access their own
 * user state and courses.
 */
const preRead = val.validate((c, req) => {
  const isAdmin = val.roleAllows(c.role, roles.admin);
  if (isAdmin) return true;
  else {
    const idParam = req.params.id;
    return idParam && c.id === parseInt(idParam, 10);
  }
});

/**
 * Admins have full permissions to all classes, but rather than
 * generate permissions table rows for all courses for all admins,
 * just populate the courses here as a special case.
 */
const postRead = user => {
  if (user && user.role === roles.admin) {
    return db.course.findAll({ attributes: { exclude: [ 'createdAt', 'updatedAt' ] } })
      .then(courses => {
        courses.forEach(c => c.permission = { role: roles.admin });
        user.courses = courses;
        return user;
      }).catch(err => user);
  } else {
    return user;
  }
};

module.exports = CRUD(db.user, {
  read,
  preRead,
  postRead,
  preCreate: val.isAdmin,
  preUpdate: val.isAdmin,
  preDelete: val.isAdmin
});
