const passport = require('passport');
var JwtStrategy = require('passport-jwt').Strategy;

var cookieExtractor = function(req) {
  var token = null;
  if (req && req.cookies)
  {
    token = req.cookies['jwt'];
  }
  return token;
};

var opts = {}

opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = 'thisisasecret';
opts.issuer = 'test.com';
opts.audience = 'test.com';
passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
  console.log(jwt_payload);
  //
  // const user = await db.user.findOne({
  //   where: { username },
  //   attributes: { exclude: [ 'createdAt', 'updatedAt' ] },
  //   include: [{
  //     model: db.course,
  //     attributes: { include: [ 'id' ] },
  //     through: { attributes: [ 'role' ] }
  //   }]
  // });
  //
  // console.log("Found one " + user);
  //
  // if (user) {
  //     return done(null, user);
  // } else {
  //     return done(null, false);
  // }
}));
