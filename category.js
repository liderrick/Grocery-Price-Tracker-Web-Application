module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getCategories(res, mysql, context, complete){
        var sql = "SELECT id, category_name FROM categories ORDER BY category_name";
        
        if(context.order == 'desc') {
            sql += " DESC";
        }
        
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.category = results;
            complete();
        });
    }

    function searchCategories(res, mysql, context, complete){
        var sql = "SELECT id, category_name FROM categories WHERE category_name LIKE ? ORDER BY category_name ASC";
        var inserts = ['%'+context.search+'%'];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.category = results;
            complete();
        });
    }
    
    /* Display main categories page */
    router.get('/', function(req, res){
        var context = {};
        context.jsscripts = ["updatecategory.js","deletecategory.js"];
        res.render('category', context);
    });
    
    /* Display all categories (asc or desc) */
    router.get('/display/:order', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.order = req.params.order;
        context.jsscripts = ["updatecategory.js","deletecategory.js"];
        var mysql = req.app.get('mysql');
        getCategories(res, mysql, context, complete);
        
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                if(context.category.length == 0) {
                    context.message = "No category match that query.";
                }

                res.render('category', context);
            }
        }
    });
    
    /* Search categories by category keyword */
    router.post('/search', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.search = req.body.search;
        context.jsscripts = ["updatecategory.js","deletecategory.js"];
        var mysql = req.app.get('mysql');
        searchCategories(res, mysql, context, complete);
        
        
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                if(context.category.length == 0) {
                    context.message = "No category match that query.";
                }
                
                res.render('category', context);
            }
        }
    });

    /* Adds a category, reloads page after adding */
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var context = {};
        var sql = "INSERT INTO categories (category_name) VALUES (?)";
        var inserts = [req.body.categoryName];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                if(error.errno == 1062) {
                    res.render('categoryFail');   
                } else {
                    res.write(JSON.stringify(error));
                    res.end();
                }
            }else{
                context.success_item = req.body.categoryName;
                res.render('categorySuccess', context);
            }
        });
    });
    
    /* The URI that update data is sent to in order to update a category */
    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE categories SET category_name = ? WHERE id=?";
        var inserts = [req.body.category_name, req.params.id];
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
    
    /* Route to delete a category, simply returns a 202 upon success. Ajax will handle this. */
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM categories WHERE id = ?";
        var inserts = [req.params.id];
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
        });
    })

    return router;
}();