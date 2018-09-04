const cookies = require('./cookies');
const roles = require('./roles');

/**
 * Does the given `role' satisfy the required role `req'?
 */
const roleAllows = (role, req) => {
  return req === roles.student
    || (req === roles.ta && role !== roles.student)
    || (req === roles.prof && (role === roles.admin || role === roles.prof))
    || role === roles.admin;
};

/**
 * Does the user with the given `cookie' satisfy the required role
 * `reqRole' (for a particular course, if `courseId' is given)?
 */
const authorized = (cookie, reqRole, courseId) => {
  const cid = parseInt(courseId, 10);
  if (isNaN(cid) || cookie.role) {
    return roleAllows(cookie.role, reqRole);
  } else {
    const access = cookie.courses.filter(c => c.id === cid);
    if (access.length > 0) {
      const course = access[0];
      return roleAllows(course.permission.role, reqRole);
    } else {
      return false;
    }
  }
};

/**
 * Creates middleware that validates that the session cookie in the
 * incoming request satisfies some predicate `p'
 */
const validate = p => async (req, res, k) => {
  const cookie = cookies.getCookie(req);
  if (!cookie) res.sendStatus(401);
  else {
    try {
      const authorized = await p(cookie, req);
      if (!authorized) res.sendStatus(403);
      else k();
    } catch (err) {
      console.log('Error during validation:', err);
      res.sendStatus(500);
    }
  }
};

// Is the user logged in?
const loggedIn = validate(c => true);

// Is the user an admin?
const isAdmin = validate(c => c.role === roles.admin);

module.exports = {
  roleAllows,
  validate,
  loggedIn,
  isAdmin,
  authorized
};
