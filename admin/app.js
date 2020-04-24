var db = require('./config');
var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let indexRouter      = require('./application/routes/indexRoutes'),
    adminRoutes      = require('./application/routes/adminRoutes'),
    dashboardRoutes  = require('./application/routes/dashboardRoutes'),
    mettingRoutes    = require('./application/routes/mettingRoutes');
    apiRoutes        = require('./application/routes/apiRoutes');

var app = express();

app.use(session({secret: 'DSAN Meeting', cookie: { maxAge: 60 * 60 * 1000 }, saveUninitialized: false, resave: false}))
app.locals.vendorName = 'DSAN';

// view engine setup
app.set('views', path.join(__dirname, './application/views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './public')));

app.use('/', indexRouter);
app.use('/admin', adminRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/meeting', mettingRoutes);
app.use('/api', apiRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
  
var listener = app.listen(3000, function(){
    console.log('Listening on port ' + listener.address().port); //Listening on port 8888
});



module.db = app;
