const { getCookie } = require('../../auth/cookies');
const roles = require('../../auth/roles');
const val = require('../../auth/validate');
const db = require('../../models');
const CRUD = require('./CRUD');


/**
 * Read options for the assignment model. Includes associated
 * submissions and their associated users.
 */
const read = {
  include: [{
    model: db.submission,
    include: [{ 
      model: db.user, 
      attributes: { exclude: [ 'createdAt', 'updatedAt' ] } }],
    attributes: {
      exclude: [ 'input', 'output', 'createdAt', 'updatedAt' ]
    }
  }]
};

/**
 * Only course TAs or profs may create, update, or delete assignments
 * for a particular course. The course ID must be present in the JSON
 * body of the POST request to create.
 */
const preCreate = val.validate((c, req) => {
  const courseId = req.body.courseId;
  if (!courseId) {
    return false;
  } else {
    return val.authorized(c, roles.ta, courseId);
  }
});

/**
 * The course ID must be present in the URL parameters of the request
 * to read, update, or delete.
 */
const validateIdParamPerm = role => val.validate((c, req) => {
  return req.params.id && db.assignment.findById(req.params.id)
    .then(assign => val.authorized(c, role, assign.courseId))
    .catch(err => false);
});
const preUpdate = validateIdParamPerm(roles.ta);
const preDelete = validateIdParamPerm(roles.ta);
const preRead = validateIdParamPerm(roles.student);

/**
 * Only return submissions from the user with the given user ID,
 * unless that user is a TA/Prof for the course, or an admin.
 */
const postRead = (assign, req) => {
  const cookie = getCookie(req);
  if (val.authorized(cookie, roles.ta, assign.courseId)) {
    return assign;
  } else if (!assign.visible) {
    return false;
  } else {
    assign.submissions = assign.submissions.filter(
      s => s.userId === cookie.id);
    return assign;
  }
};

module.exports = CRUD(db.assignment, {
  read, preCreate, preUpdate, preDelete, preRead, postRead
});
