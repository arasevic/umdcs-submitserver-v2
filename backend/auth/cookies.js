const session = require('client-sessions');
const roles = require('./roles');

// Middleware to be used by express server;
// Exposes req.session in incoming requests
const cookies = session({
  cookieName: 'session',
  secret: "thisisasecret",
  duration: 48 * 60 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
});

/**
 * Set the request session cookie
 */
cookies.setCookie = (req, token) => {
  req.session.user = token;
};

/**
 * Get the session cookie from a request
 */
cookies.getCookie = (req) =>
  Boolean(req.session) && req.session.user;

module.exports = cookies;
