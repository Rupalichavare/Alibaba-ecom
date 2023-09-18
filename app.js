var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var user = require('./routes/users');


// session & validation 
var session = require('express-session');
var validator = require('express-validator');
var passport = require('passport');
var flash = require('connect-flash');






var app = express;

var expresshbs = require('express-handlebars');



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var user_session = require('connect-mongo');
const { log } = require('console');

var app = express();

// view engine setup
app.engine('.hbs', expresshbs.engine({ defaultLayout: 'layout', extname: '.hbs' }));
app.set('view engine', '.hbs');

var Product = require('./models/product');
var mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
mongoose.connect('mongodb://127.0.0.1:27017/chavare', function (err) {
  if (err)
    console.log("not connected");
  else {
    console.log("connected");
  }
});

require('./config/passport');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(validator());

app.use(cookieParser());

app.use(session({
  secret: 'mysecret',
  cookiie: {maxAge:1000*90*80},
  resave: false,
  saveinitialize: false,
  store:MongoStore.create({mongoUrl:'mongodb://127.0.0.1:27017/chavare'})

}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));




app.use(function (req, res, next) {
  res.locals.login_var = req.isAuthenticated();
  next();
});






app.use('/', indexRouter);
app.use('//', usersRouter);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
