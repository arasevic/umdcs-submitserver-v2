const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');

const cookieParser = require('./auth/cookies');

const authFunc = require('./routes/auth');
const modelRouter = require('./routes/model');
const submitRouter = require('./routes/submit');

const caslogin = require('./auth/cas-login');
const jwt = require('./auth/jwt');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(session({secret:"thisisasecret"}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(caslogin);
passport.use(jwt);

app.set('trust proxy', 1);
app.use(express.static(path.join(__dirname, 'public')));


// Index should eventually show an API definition

//app.use('/', indexRouter);
app.use('/login', authFunc);

app.use('/api', modelRouter);
app.use('/api', submitRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log('Error:', err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
