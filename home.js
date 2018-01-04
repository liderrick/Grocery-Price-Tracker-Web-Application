module.exports = function(){
    var express = require('express');
    var router = express.Router();
    
    function getUsername(res, mysql, context, id, complete){
        var sql = "SELECT username FROM users WHERE id = ?";
        var inserts = [id];

        mysql.pool.query(sql, inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.username = results[0].username;
            complete();
        });
    }

    router.get('/', function(req, res){
        if (req.isAuthenticated())
        {       
            var user_id = req.user;
            //console.log(user_id);
            var callbackCount = 0;
            var context = {};
            var mysql = req.app.get('mysql');
            getUsername(res, mysql, context, user_id, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                    res.render('home', context);
                }
            }
        }
        else res.render('home');

        
    });
   
    return router;
}();