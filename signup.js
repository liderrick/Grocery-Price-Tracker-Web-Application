module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var passport = require('passport');

    // register form
    router.get('/', function(req, res){
        res.render('signup');
    });
 
    
    router.post('/', function(req,res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO users (username,email, password) VALUES (?,?,?)";
        var inserts = [req.body.username, req.body.email, req.body.password];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
              //console.log();
              req.login(results.insertId, (err)=>{
                res.redirect('/');
              });
            }
        });
    })
    
    passport.serializeUser(function(user_id, done) {
      done(null, user_id);
    });
    
    passport.deserializeUser(function(user_id, done) {
      done(null, user_id);
    });
    
    //https://gist.github.com/christopher4lis/f7121a07740e5dbca860c9beb2910565
    function authenticationMiddleware () {
    	return (req, res, next) => {
    		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
    
    	    if (req.isAuthenticated()) return next();
    	    res.redirect('/login')
    	}
    }
    
    return router;
}();