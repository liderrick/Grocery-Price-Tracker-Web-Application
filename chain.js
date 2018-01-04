module.exports = function(){
    var express = require('express');
    var router = express.Router();
    
    function getChain(res, mysql, context, complete){
        var sql ="SELECT id, chain_name FROM chains ORDER BY chain_name";
        
        if(context.order == 'desc') {
            sql += " DESC";
        }
        
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.chain  = results;
            complete();
        });
    }

    function searchChains(res, mysql, context, complete){
        var sql = "SELECT id, chain_name FROM chains WHERE chain_name LIKE ? ORDER BY chain_name ASC";
        var inserts = ['%'+context.search+'%'];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.chain = results;
            complete();
        });
    }
    
    /* Display main chain page */
    router.get('/', function(req, res){
        var context = {};
        context.jsscripts = ["deletechain.js","updatechain.js"];
        res.render('chain', context);
    });
    
    /* Display all chains (asc or desc) */
    router.get('/display/:order', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.order = req.params.order;
        context.jsscripts = ["deletechain.js","updatechain.js"];
        var mysql = req.app.get('mysql');
        getChain(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                if(context.chain.length == 0) {
                    context.message = "No chain match that query.";
                }

                res.render('chain', context);
            }
        }
    });

    /* Search chain by chain keyword */
    router.post('/search', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.search = req.body.search;
        context.jsscripts = ["deletechain.js","updatechain.js"];
        var mysql = req.app.get('mysql');
        searchChains(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                if(context.chain.length == 0) {
                    context.message = "No chain match that query.";
                }
                
                res.render('chain', context);
            }
        }
    });
    
    router.post('/', function(req,res){
        var context = {};
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO chains (chain_name) VALUES (?)";
        var inserts = [req.body.chainName];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                if(error.errno == 1062) {
                    res.render('chainFail');   
                } else {
                    res.write(JSON.stringify(error));
                    res.end();
                }
            }else{
                context.success_item = req.body.chainName;
                res.render('chainSuccess', context);
            }
        });
    });
    
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM chains WHERE id = ?";
        var inserts = [req.params.id];
        console.log(req.params.id);

        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                if(error.errno == 1451) {
                    res.status(422).send(JSON.stringify(error));
                } else {
                    res.status(400).send(JSON.stringify(error));
                }
            }else{
                res.status(200).end();
            }
        })
    })
    
    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE chains SET chain_name=? WHERE id=?";
        var inserts = [req.body.chain_name,req.params.id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                if(error.errno == 1062) {
                    res.status(422).send(JSON.stringify(error));
                } else {
                    res.status(400).send(JSON.stringify(error));
                }
            }else{
                res.status(200).end();
            }
        });
    });
    
    return router;
}();