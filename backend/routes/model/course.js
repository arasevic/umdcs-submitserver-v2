const { getCookie } = require('../../auth/cookies');
const roles = require('../../auth/roles');
const val = require('../../auth/validate');
const db = require('../../models');
const CRUD = require('./CRUD');


/**
 * Read options for the course model. Includes associated course
 * assignments.
 */
const read = {
  include: [{
    model: db.assignment,
    attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
  }]
};

/**
 * Ensure that the user has permissions to access the course. The
 * course ID is given as a URL parameter.
 */
const preRead = val.validate((c, req) => {
  const id = req.params.id;
  return id && val.authorized(c, roles.student, parseInt(id, 10));
});

/**
 * Only return visible assignments to students.
 */
const postRead = (course, req) => {
  const cookie = getCookie(req);
  if (val.authorized(cookie, roles.ta, course.id)) {
    return course;
  } else {
    course.assignments = course.assignments.filter(
      assign => assign.visible);
    return course;
  }
};

module.exports = CRUD(db.course, {
  read,
  preRead,
  postRead,
  preCreate: val.isAdmin,
  preUpdate: val.isAdmin,
  preDelete: val.isAdmin
});
