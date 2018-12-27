const passport = require('passport');
const db = require('../models');
const config = require('../config/localconfig.js')

module.exports = new (require('passport-cas').Strategy)({
  ssoBaseURL: config.casRedirect,
  serverBaseURL: 'http://localhost:3001',
  validate: config.casValidate
}, async function(username, done) {
  const user = await db.user.findOne({
    where: { username },
    attributes: { exclude: [ 'createdAt', 'updatedAt' ] },
    include: [{
      model: db.course,
      attributes: { include: [ 'id' ] },
      through: { attributes: [ 'role' ] }
    }]
  });

  console.log("Found one " + user);

  if (user) {
      return done(null, user);
  } else {
      return done(null, false);
  }
});
