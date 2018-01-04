/*  
    Uses express, dbcon for database connection, body parser to parse form data 
    handlebars for HTML templates  
*/

var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MySQLStore = require('express-mysql-session')(session);
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('mysql', mysql);
app.set('port', process.argv[2]);

var options = {
  host: '<host>',
  user: '<username>',
  password: '<password>',
  database : '<database>'
};
var sessionStore = new MySQLStore(options);

app.use(session({
  secret: 'mysupersecret',
  resave: false,
  store: sessionStore, // needed for session store
  saveUninitialized: true,
  //cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use('/', require('./home.js'));
app.use('/signup', require('./signup.js'));
app.use('/login', require('./login.js'));
app.use('/logout', require('./logout.js'));
app.use('/chain', require('./chain.js'));
app.use('/item', require('./item.js'));
app.use('/category', require('./category.js'));
app.use('/store', require('./store.js'));
app.use('/pricing', require('./pricing.js'));


passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
  function(email, password, done) {
    var sql = "SELECT id,password FROM users WHERE email = ?";
    var inserts = [email];
    sql = mysql.pool.query(sql,inserts,function(error, results, fields){
      if (error) {done(error)}
      if (results.length ===0) {
        done(null,false);
      }
      else {
        if(results[0].password.toString() == password){
          return done(null,results[0].id);
        } else {
          return done(null,false);
        }
      }
    });
  }
));

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});