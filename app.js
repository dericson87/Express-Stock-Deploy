var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var cors = require('cors');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var whitelist = [
  'https://stocktracka.herokuapp.com',
];
var corsOptions = {
  origin: function(origin, callback){
      var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
      callback(null, originIsWhitelisted);
  },
  credentials: true
};
app.use(cors(corsOptions));

// Loggin code
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/stock-tracker';
mongoose.connect(MONGODB_URI, {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!–––
  if (db.collection('users') == null) {
    db.createCollection('users', (err, res) => {
      if(err) throw err;
      console.log('Created users collection.');
    });
  }
});


app.use(session({ secret: "iohfwohifhiowe" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);


app.get('/api/user_name', (req, res)=> {
  if(req.user) {
    res.send(req.user.displayName);
    return;
  }
  res.send('');
});
app.use('/api/user_stocks', (req, res)=>{
  console.log('>> in /api/user_stocks');
  console.log(req);
  if(req.user != null) {
    //res.send( users[req.user.google_id]);
    db.collection('users').findOne({
      id: req.user.google_id
    }, (err, user) => {
      if(err) throw err;
      console.log('>>> user.stocks');
      console.log(user);
      if (!user.stocks)
        user.stocks = [null, null, null, null, null];
      res.send(user.stocks);
    });
  }
});
app.use('/api/set-stocks', (req, res)=>{
  console.log('>>> set-stocks user: ' + req.user);
  //users[req.user.google_id] = req.body.stocks;
  db.collection('users').updateOne({
    id: req.user.google_id
  },
  {
   $set:{ stocks: req.body.stocks }
  }, (err, result) => {
    if (err) throw err;
    res.send('OK');
  });
});

passport.serializeUser(function(user, done) {
  console.log('serializeUser: ');
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log('deserializeUser: ');
  console.log(user);
  done(null, { google_id: user.id, displayName: user.displayName });
});

passport.use(new GoogleStrategy({
    clientID: '561311346728-12kk21om7rjfksssh4qg9qi27qu568kp.apps.googleusercontent.com',
    clientSecret: 'RaSICxnN0JwM9XYc7Oli0_Z2',
    callbackURL: "https://stockappbackend.herokuapp.com/loggedin"
  },
  function(accessToken, refreshToken, profile, done) {
      console.log("After login");
      console.log(profile);

      db.collection('users').findOne({id: profile.id}, (err, user) => {
        if (err) throw err;
        if(user) return;

        db.collection('users').insertOne({
          id: profile.id,
          stocks: [null, null, null, null, null]
        }, function(err, res) {
          if (err) throw err;
          console.log("Added new user: " + profile.displayName);
        });
      });

      return done(null, profile);
  }
));

app.use('/logout',
function(req, res){
  req.logout();
  res.redirect('https://stocktracka.herokuapp.com/');
});

app.get('/login', 
  passport.authenticate('google', {
    scope: 'https://www.googleapis.com/auth/plus.login'
  }));

  app.get('/loggedin',
	passport.authenticate( 'google', {
		successRedirect: 'https://stocktracka.herokuapp.com/',
		failureRedirect: '/failed'
  })
);

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


module.exports = app;
