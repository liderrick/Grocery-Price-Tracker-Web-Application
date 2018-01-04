module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var passport = require('passport');
    
    router.get('/',function(req,res){
      if (req.isAuthenticated())
      {
        req.logout();
        req.session.destroy();
        res.redirect('/');
      } else{
        res.redirect('/');
      }
      
    });
    
    return router;
}();