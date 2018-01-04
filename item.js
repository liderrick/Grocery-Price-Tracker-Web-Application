module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getItem(res, mysql, context, id, complete){
        var sql = "SELECT id, item_name, item_unit, item_barcode FROM items WHERE id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.item = results;
            complete();
        });
    }

    function getItems(res, mysql, context, complete){
        var sql = "SELECT id, item_name, item_unit, item_barcode FROM items ORDER BY item_name";
        if(context.order == 'desc') {
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

    function searchItems(res, mysql, context, complete){
        var sql = "SELECT id, item_name, item_unit, item_barcode FROM items WHERE item_name LIKE ? ORDER BY item_name ASC";
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
    
    function searchItemsCategories(res, mysql, context, complete){
        var sql = "SELECT items.id AS id, item_name, item_unit, item_barcode FROM items INNER JOIN items_categories ON items_categories.fk_item_id = items.id INNER JOIN categories ON categories.id = items_categories.fk_category_id WHERE categories.id = ? ORDER BY item_name ASC";
        var inserts = [context.searchcategory];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.item = results;
            complete();
        });
    }

    function getItemsCategories(res, mysql, context, complete){
        var sqlCallbackCount = 0;
        
        /* If no items, display nothing */
        if(context.item.length == 0){
            complete();
        }
        else {
            /* Else, for each item, give categories to it */
            for(var i=0; i < context.item.length; i++){
                var sql = "SELECT categories.id, category_name FROM items INNER JOIN items_categories ON items_categories.fk_item_id = items.id INNER JOIN categories ON categories.id = items_categories.fk_category_id WHERE items.id=?";
                var inserts = [context.item[i].id];
                // var sql = "SELECT categories.id, category_name FROM items INNER JOIN items_categories ON items_categories.fk_item_id = items.id INNER JOIN categories ON categories.id = items_categories.fk_category_id WHERE item_name=?";
                // var inserts = [context.item[i].item_name];
                mysql.pool.query(sql, inserts, function(error, results, fields){
                    if(error){
                        res.write(JSON.stringify(error));
                        res.end();
                    }
                    
                    context.item[sqlCallbackCount].array = [];
                    for(var j = 0; j < results.length; j++){
                        context.item[sqlCallbackCount].array.push(results[j].id);
                    }
                    
                    context.item[sqlCallbackCount].category = results;
                    sqlCallbackCount++;
                    
                    if(sqlCallbackCount == context.item.length){
                        complete();
                    }
                });
            }
        }
    }
    
    function getCategories(res, mysql, context, complete){
        mysql.pool.query("SELECT id, category_name FROM categories ORDER BY category_name ASC", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.category = results;
            complete();
        });
    }

    function addItems(req, res, mysql, context, complete){
        var sql = "INSERT INTO items(item_name, item_unit, item_barcode) VALUES (?,?,?)";
        var inserts = [req.body.item_name, req.body.item_unit, req.body.item_barcode];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                if(error.errno == 1062) {
                    res.render('itemFail');   
                } else {
                    res.write(JSON.stringify(error));
                    res.end();
                }
            } else {
                context.success_item = req.body.item_name;
                context.id = results.insertId;
                complete();
            }
        });
    }

    function addItemsCategories(req, res, mysql, context, complete){
        var sqlCallbackCount = 0;
        
        /* If no category selected, done */
        if(!req.body.hasOwnProperty("category")){
            complete();
        } else if(typeof(req.body.category) == 'string') {
            /* Else if only 1 category selected */
            var sql = "INSERT INTO items_categories(fk_item_id, fk_category_id) VALUES (?, ?)";
            var inserts = [context.id, req.body.category];
            
            mysql.pool.query(sql, inserts, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                complete();
            });
        } else {
            /* Else, for each category, add it to item */
            for(var i=0; i < req.body.category.length; i++){
                var sql = "INSERT INTO items_categories(fk_item_id, fk_category_id) VALUES (?, ?)";
                var inserts = [context.id, req.body.category[i]];

                mysql.pool.query(sql, inserts, function(error, results, fields){
                    if(error){
                        res.write(JSON.stringify(error));
                        res.end();
                    }
                    
                    sqlCallbackCount++;
                    
                    if(sqlCallbackCount == req.body.category.length){
                        complete();
                    }
                });
            }
        }
    }

    function updateItemSQL(req, res, mysql, context, complete) {
        var sql = "UPDATE items SET item_name=?, item_unit=?, item_barcode=? WHERE id=?";
        var inserts = [req.body.item_name, req.body.item_unit, req.body.item_barcode, req.params.id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                if(error.errno == 1062) {
                    res.status(422).send(JSON.stringify(error));
                } else {
                    res.status(400).send(JSON.stringify(error));
                }
            } else {
                context.success_item = req.body.item_name;
                context.id = req.params.id;
                complete();
            }
        });
    }
    
    function deleteItemCategories(req, res, mysql, context, complete){
        var sql = "DELETE FROM items_categories WHERE fk_item_id = ?";
        var inserts = [context.id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            complete();
        });
    }

    /* Display main items page */
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteitem.js", "selectcategory.js"];
        var mysql = req.app.get('mysql');
        getCategories(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                res.render('item', context);
            }
        }
    });
    
    /* Display all items with categories (asc or desc) */
    router.get('/display/:order', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.order = req.params.order;
        context.jsscripts = ["deleteitem.js", "selectcategory.js"];
        var mysql = req.app.get('mysql');
        getItems(res, mysql, context, complete);
        getCategories(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 2){
                getItemsCategories(res, mysql, context, complete);
            } else if(callbackCount == 3){
                if(context.item.length == 0) {
                    context.message = "No item match that query.";
                }
                res.render('item', context);
            }
        }
    });
    
    /* Search item by item keyword */
    router.post('/search', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.search = req.body.search;
        context.jsscripts = ["deleteitem.js", "selectcategory.js"];
        var mysql = req.app.get('mysql');
        searchItems(res, mysql, context, complete);
        getCategories(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 2){
                getItemsCategories(res, mysql, context, complete);
            } else if(callbackCount == 3){
                if(context.item.length == 0) {
                    context.message = "No item match that query.";
                }
                res.render('item', context);
            }
        }
    });
    
    /* Search item by category */
    router.post('/searchcategory', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.searchcategory = req.body.searchcategory;
        context.jsscripts = ["deleteitem.js", "selectcategory.js"];
        var mysql = req.app.get('mysql');
        searchItemsCategories(res, mysql, context, complete);
        getCategories(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 2){
                getItemsCategories(res, mysql, context, complete);
            } else if(callbackCount == 3){
                if(context.item.length == 0) {
                    context.message = "No item match that query.";
                }
                res.render('item', context);
            }
        }
    });

    
    /* Render newItem page */
    router.get('/newitem', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getCategories(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('newItem', context);
            }
        }
    });
    
    /* Adds an item, redirects to the itemSuccess page after adding */
    router.post('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        addItems(req, res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                addItemsCategories(req, res, mysql, context, complete);
            } else if(callbackCount == 2){
                res.render('itemSuccess', context);
            }
        }
    });
    
    /* Display one item for the specific purpose of updating item */
    router.get('/:id', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateitem.js","selectcategory.js"];
        var mysql = req.app.get('mysql');
        getItem(res, mysql, context, req.params.id, complete);
        getCategories(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 2){
                getItemsCategories(res, mysql, context, complete);
            }else if(callbackCount == 3){
                res.render('update-item', context);
            }
        }
    });

    /* The URI that update data is sent to in order to update an item  */
    router.put('/:id', function(req, res){
        if(!req.body.category) {
            res.status(406).end()
        } else {
            var callbackCount = 0;
            var context = {};
            var mysql = req.app.get('mysql');
            updateItemSQL(req, res, mysql, context, complete);
            
            function complete(){
                callbackCount++;
                if(callbackCount == 1){
                    deleteItemCategories(req, res, mysql, context, complete);
                }else if(callbackCount == 2){
                    addItemsCategories(req, res, mysql, context, complete);
                }else if(callbackCount == 3){
                    res.status(200).end();
                }
            }
        }
    });
    
    /* Route to delete an item, simply returns a 200 upon success. Ajax will handle this. */
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM items WHERE id = ?";
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