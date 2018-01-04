module.exports = function(){
    var express = require('express');
    var router = express.Router();
    
    function getChainList(res, mysql, context, complete){
        mysql.pool.query("SELECT id, chain_name FROM chains ORDER BY chain_name ASC", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.chain  = results;
            complete();
        });
    }
        
    function getAllStore(res, mysql, context, complete){
        var sql = "SELECT stores.id, chain_name, store_name, store_address_1, store_address_2, store_address_city as city, store_address_state as state FROM stores JOIN chains ON stores.fk_chain_id = chains.id ORDER BY store_name";
        
        if(context.order == 'desc') {
            sql += " DESC";
        }
        
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.store  = results;
            complete();
        });  
    }

    function searchStores(res, mysql, context, complete){
        var sql = "SELECT stores.id, chain_name, store_name, store_address_1, store_address_2, store_address_city as city, store_address_state as state FROM stores JOIN chains ON stores.fk_chain_id = chains.id WHERE store_name LIKE ? ORDER BY store_name ASC";
        var inserts = ['%'+context.search+'%'];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.store = results;
            complete();
        });
    }

    function searchStoresChain(res, mysql, context, complete){
        var sql = "SELECT stores.id, chain_name, store_name, store_address_1, store_address_2, store_address_city as city, store_address_state as state FROM stores JOIN chains ON stores.fk_chain_id = chains.id WHERE chains.id = ? ORDER BY store_name ASC";
        var inserts = [context.searchchain];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.store = results;
            complete();
        });
    }
    
    function getStore(res, mysql, context, id, complete){
        var sql = "SELECT fk_chain_id, store_name, store_address_1, store_address_2, store_address_city as city, store_address_state as state, store_address_zipcode as zipcode FROM stores WHERE id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.store  = results[0];
            complete();
        });
    }


    /* Display main stores page */
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletestore.js", "selectchain.js"];
        var mysql = req.app.get('mysql');
        getChainList(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                res.render('store', context);
            }
        }
    });

    /* Display all stores with chains (asc or desc) */
    router.get('/display/:order', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.order = req.params.order;
        context.jsscripts = ["deletestore.js", "selectchain.js"];
        var mysql = req.app.get('mysql');
        getAllStore(res, mysql, context, complete);
        getChainList(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 2){
                if(context.store.length == 0) {
                    context.message = "No store match that query.";
                }
                res.render('store', context);
            }
        }
    });

    /* Search store by store keyword */
    router.post('/search', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.search = req.body.search;
        context.jsscripts = ["deletestore.js", "selectchain.js"];
        var mysql = req.app.get('mysql');
        searchStores(res, mysql, context, complete);
        getChainList(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 2){
                if(context.store.length == 0) {
                    context.message = "No store match that query.";
                }
                res.render('store', context);
            }
        }
    });
    
    /* Search store by chain */
    router.post('/searchchain', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.searchchain = req.body.searchchain;
        context.jsscripts = ["deletestore.js", "selectchain.js"];
        var mysql = req.app.get('mysql');
        searchStoresChain(res, mysql, context, complete);
        getChainList(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 2){
                if(context.store.length == 0) {
                    context.message = "No store match that query.";
                }
                res.render('store', context);
            }
        }
    });
    
    router.get('/newStore', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["addstore.js"];
        var mysql = req.app.get('mysql');
        getChainList(res, mysql, context, complete)
        function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                    res.render('newStore', context);
                }
            }
    });
    
    router.post('/', function(req,res){
        var context = {};
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO stores (fk_chain_id, store_name, store_address_1, store_address_2, store_address_city, store_address_state, store_address_zipcode) VALUES (?,?,?,?,?,?,?)";
        var inserts = [req.body.chain_id,req.body.store_name,req.body.address_line1,req.body.address_line2,req.body.city,req.body.state,req.body.zipcode];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                if(error.errno == 1062) {
                    res.render('storeFail');   
                } else {
                    res.write(JSON.stringify(error));
                    res.end();
                };
            }else{
                context.success_item = req.body.store_name;
                res.render('storeSuccess', context);
            }
        });
    });
 
    router.get('/:id', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectchain.js", "updatestore.js"];
        var mysql = req.app.get('mysql');
        getChainList(res, mysql, context, complete);
        getStore(res, mysql, context, req.params.id, complete);
        //console.log(" chain id:"+ JSON.stringify(context));
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                context.store.id = req.params.id;
                console.log(context);
                res.render('update-store', context);
            }

        }
    });    

    /* The URI that update data is sent to in order to update a store */
    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE stores SET fk_chain_id = ?, store_name=?, store_address_1=? , store_address_2=?, store_address_city=?, store_address_state=?, store_address_zipcode=? WHERE id=?";
        var inserts = [req.body.chain_id, req.body.store_name, req.body.address_line1, req.body.address_line2, req.body.city, req.body.state, req.body.zipcode, req.params.id];
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
    
    /* Route to delete a store, simply returns a 202 upon success. Ajax will handle this. */
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM stores WHERE id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.status(400).send(JSON.stringify(error));
            }else{
                res.status(200).end();
            }
        })
    })
    
    return router;
}();