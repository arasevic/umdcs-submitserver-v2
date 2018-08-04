const session = require('client-sessions');
const roles = require('./roles');

// Middleware to be used by express server;
// Exposes req.session in incoming requests
const cookies = session({
  cookieName: 'session',
  secret: process.env.SESSION_SECRET,
  duration: 48 * 60 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
});

/**
 * Set the request session cookie for some user
 */
cookies.setCookie = (req, user) => {
  const access = user.role === roles.admin
    ? roles.admin
    : user.courses.map(rc => ({
      role: rc.role, course: rc.course._id
    }));
  const cookie = { access, id: user._id, name: user.name };
  req.session.user = cookie;
};

/**
 * Get the session cookie from a request
 */
cookies.getCookie = (req) =>
  Boolean(req.session) && req.session.user;

/**
 * Creates middleware that validates that the session cookie in the
 * incoming request satisfies some predicate `p'
 */
cookies.validate = (p) => async (req, res, k) =>  {
  const cookie = cookies.getCookie(req);
  if (!cookie) res.sendStatus(401);
  else {
    const authorized = await p(req);
    if (!authorized) res.sendStatus(403);
    else k();
  }
};

module.exports = cookies;
