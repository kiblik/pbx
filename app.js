var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');

var routes = require('./routes/index');
var directory = require('./routes/directory');
var cdr = require('./routes/cdr');
//var mgmt = require('./routes/mgmt');
var mgmt_phones = require('./routes/mgmt_phones');
var mgmt_ext = require('./routes/mgmt_ext');
var mgmt_defaults = require('./routes/mgmt_defaults');
var mgmt_e2p = require('./routes/mgmt_e2p');
var mgmt_users = require('./routes/mgmt_users');
var mgmt_updates = require('./routes/mgmt_updates');
var config = require('./routes/config');

var pc = require('./utils/permitions_checker');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'www'))); // toto by nemalo byt postrebne, ale ak by nahodou zlyhal apache, tak nech to aspon ide
app.use(compression());

app.use('/', routes);
app.use('/directory', directory);
app.use('/cdr', cdr);
//app.use('/mgmt', mgmt);
app.use('/mgmt/phones', mgmt_phones);
app.use('/mgmt/ext', mgmt_ext);
app.use('/mgmt/defaults', mgmt_defaults);
app.use('/mgmt/e2p', mgmt_e2p);
app.use('/mgmt/users', mgmt_users);
app.use('/mgmt/updates', mgmt_updates);
app.use('/config', config);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    ip = req.headers['x-forwarded-for'];
    pc(ip,function(perm){
      if(perm < 3 )
        err = {}
      res.render('error', {
        message: err.message,
        error: err
      });

    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
