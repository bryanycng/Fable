///<reference path='types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='types/DefinitelyTyped/express/express.d.ts'/>

interface Error {
  status?: number;
}

class Application {
  constructor() {
  }
  start() {
    var express = require('express');
    var path = require('path');
    var favicon = require('serve-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');

    //Mongoose
    var mongoose = require('mongoose');

    //Passport
    var passport = require('passport');
    var flash = require('connect-flash');

    //Session
    var session = require('express-session');
    var mongoStore = require('connect-mongo')(session);

    var routes = require('./routes/index');
    var users = require('./routes/users');

    var configDB = require('./config/database.js');
    require('./config/passport');

    var app = express();

    //Setting up templating engine
    var exphbs = require('express-handlebars');
    app.engine('html', exphbs({ defaultLayout: 'main' }));
    app.set('view engine', 'html');
    app.set('views', path.join(__dirname, 'views'));

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    //Connect to mongoDB
    mongoose.connect(configDB.url);

    //Check database connection
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log("Successfully connected to mongoDB");
    });

    //Required setup for passport
    app.use(session({
      secret: process.env.SESSION_SECRET || 'whenyoufeelitintherainbow',
      httpOnly: true,
      resave: false,
      saveUninitialized: false,
      store: new mongoStore({ mongooseConnection: db })
    })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session


    // Make our db accessible to our router
    app.use(function(req, res, next) {
      req.db = db;
      next();
    });

    app.use('/', routes);
    app.use('/users', users);

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
        res.render('error', {
          message: err.message,
          error: err
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
  }
}

var application = new Application();
application.start();
