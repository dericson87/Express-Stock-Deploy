var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
var bodyParser = require("body-parser");
var mongoose = require('mongoose');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Loggin code
app.use(express.static("./build"));
// app.get("*", (req, res) =>{
//   console.log('>>> Req.URL: ' + req.url);
//   if(req.url == '/static/css/main.167b9785.css/')
//     req.url = '/static/css/main.167b9785.css';
//   if(req.url=='/' || req.url=='/index.html') {
//     res.sendFile(path.resolve("build", "index.html"));  
//     return;
//   }
//   res.sendFile(path.resolve("build", req.url));
// }
// );

// app.use(unless('/login', express.static("../build")));
// app.use(unless('/logout', express.static("../build")));
// app.use(unless('/loggedin', express.static("../build")));
// app.use(unless('/api/user_stocks', express.static("../build")));
// app.use(unless('/api/user_name', express.static("../build")));
// app.use(unless('/failed', express.static("../build")));

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
