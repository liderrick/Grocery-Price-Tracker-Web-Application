module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getItems(res, mysql, context, complete){
        var sql = "SELECT id AS item_id, item_name FROM items ORDER BY item_name";
        if(context.item_name_order == 'desc') {
            sql += " DESC";
        }
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.item = results;
            complete();
        });
    }

    function getItemsPricing(res, mysql, context, complete){
        var sqlCallbackCount = 0;
        
        /* If no items, display nothing */
        if(context.item.length == 0){
            complete();
        } else {
            /* Else, for each item, give store and pricing to it */
            for(var i=0; i < context.item.length; i++){
                var sql = "SELECT stores.id AS store_id, store_name, price, DATE_FORMAT(created_at, '%b %d %Y %T GMT') AS created_at, username FROM items INNER JOIN pricing ON pricing.fk_item_id = items.id INNER JOIN stores ON stores.id = pricing.fk_store_id INNER JOIN users on users.id = pricing.submitted_by WHERE items.id = ?";
                var inserts = [context.item[i].item_id];
                
                if(context.searchstore && context.searchstore != 0) {
                    sql += " AND stores.id = ?";
                    inserts.push(context.searchstore);
                }
                
                sql += " ORDER BY price"
                if(context.price_order == 'desc') {
                    sql += " DESC";
                }

                mysql.pool.query(sql, inserts, function(error, results, fields){
                    if(error){
                        res.write(JSON.stringify(error));
                        res.end();
                    }
                    
                    context.item[sqlCallbackCount].pricing = results;
                    
                    if(results.length > 0){
                         context.item[sqlCallbackCount].hasPricing = true;
                         
                         for(var j=0; j < results.length; j++) {
                             context.item[sqlCallbackCount].pricing[j].price = context.item[sqlCallbackCount].pricing[j].price.toFixed(2);
                         }
                    }
                    
                    sqlCallbackCount++;
                    
                    if(sqlCallbackCount == context.item.length){
                        complete();
                    }
                });
            }
        }
    }
    
    function getStores(res, mysql, context, complete){
        var sql = "SELECT id AS store_id, store_name FROM stores ORDER BY store_name ASC";
        
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.store  = results;
            complete();
        });  
    }
    
    function getPricing(req, res, mysql, context, complete){
        var sql = "SELECT item_name, store_name, price FROM items INNER JOIN pricing on pricing.fk_item_id = items.id INNER JOIN stores ON stores.id = pricing.fk_store_id WHERE items.id = ? AND stores.id = ?";
        var inserts = [req.params.item_id, req.params.store_id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.pricing = results[0];
            context.pricing.price = context.pricing.price.toFixed(2);
            complete();
        });
    }

    function addPricing(req, res, mysql, context, complete){
        var item_input = JSON.parse(req.body.item);
        var store_input = JSON.parse(req.body.store);
        
        context.item_name = item_input.item_name;
        context.store_name = store_input.store_name;
        
        var sql = "INSERT INTO pricing(fk_item_id, fk_store_id, price, submitted_by) VALUES (?,?,?,?)";
        var inserts = [item_input.item_id, store_input.store_id, req.body.price, req.user];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                if(error.errno == 1062) {
                    res.render('pricingFail', context);   
                } else {
                    res.write(JSON.stringify(error));
                    res.end();
                }
            } else {
                complete();
            }
        });
    }

    function updatePriceSQL(req, res, mysql, context, complete) {
        var sql = "UPDATE pricing SET price=?, submitted_by=? WHERE fk_item_id=? AND fk_store_id=?";
        var inserts = [req.body.price, req.user, req.params.item_id, req.params.store_id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.status(400).send(JSON.stringify(error));
            } else {
                complete();
            }
        });
    }

    function searchItems(res, mysql, context, complete){
        var sql = "SELECT id AS item_id, item_name FROM items WHERE item_name LIKE ? ORDER BY item_name ASC";
        var inserts = ['%'+context.search+'%'];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.item = results;
            complete();
        });
    }

    /* Display main pricing page */
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletepricing.js", "selectpricing.js"];
        context.searchstore = "0";
        context.item_name_order = "asc";
        context.price_order = "asc";
        var mysql = req.app.get('mysql');
        getStores(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                res.render('pricing', context);
            }
        }
    });
    
    /* Display all pricings with stores (asc or desc) */
    router.post('/display', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.item_name_order = req.body.item_name_order;
        context.price_order = req.body.price_order;
        context.jsscripts = ["deletepricing.js", "selectpricing.js"];
        var mysql = req.app.get('mysql');
        getItems(res, mysql, context, complete);
        getStores(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 2){
                getItemsPricing(res, mysql, context, complete);
            } else if(callbackCount == 3){
                var isTherePricing = false;
                
                for(var i = 0; i<context.item.length; i++) {
                    if(context.item[i].hasPricing){
                        isTherePricing = true;
                        break;
                    }
                }
                
                if(isTherePricing == false) {
                    context.message = "No item match that query.";
                    context.item = [];
                }
                res.render('pricing', context);
            }
        }
    });

    /* Search item by item and location */
    router.post('/search', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.search = req.body.search;
        context.searchstore = req.body.searchstore;
        context.jsscripts = ["deletepricing.js", "selectpricing.js"];
        var mysql = req.app.get('mysql');
        searchItems(res, mysql, context, complete);
        getStores(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 2){
                getItemsPricing(res, mysql, context, complete);
            } else if(callbackCount == 3){
                var isTherePricing = false;
                
                for(var i = 0; i<context.item.length; i++) {
                    if(context.item[i].hasPricing){
                        isTherePricing = true;
                        break;
                    }
                }
                
                if(isTherePricing == false) {
                    context.message = "No item match that query.";
                    context.item = [];
                }
                res.render('pricing', context);
            }
        }
    });
    
    /* Render newPricing page */
    router.get('/newpricing', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getItems(res, mysql, context, complete);
        getStores(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 2){
                res.render('newPricing', context);
            }
        }
    });
    
    /* Adds a pricing, redirects to the pricingSuccess page after adding */
    router.post('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        addPricing(req, res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                res.render('pricingSuccess', context);
            }
        }
    });
    
    /* Display one pricing for the specific purpose of updating pricing */
    router.get('/:item_id/:store_id', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["updatepricing.js"];
        context.item_id = req.params.item_id;
        context.store_id = req.params.store_id;
        var mysql = req.app.get('mysql');
        getPricing(req, res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                res.render('update-pricing', context);
            }
        }
    });

    /* The URI that update data is sent to in order to update a pricing  */
    router.put('/:item_id/:store_id', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        updatePriceSQL(req, res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                res.status(200).end();
            }
        }
    });
    
    /* Route to delete a pricing, simply returns a 200 upon success. Ajax will handle this. */
    router.delete('/:item_id/:store_id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM pricing WHERE fk_item_id = ? AND fk_store_id = ?";
        var inserts = [req.params.item_id, req.params.store_id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.status(400).send(JSON.stringify(error));
            }else{
                res.status(200).end();
            }
        })
    })
    
    router.get('/*', function(req, res){
      res.redirect('/pricing');
    });
    
    return router;
}();