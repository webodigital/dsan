var express = require('express');
var router = express.Router();
var admin_ctrl = require('../controller/admin_ctrl');

router.post('/login', function(req,res) {
    admin_ctrl.login(req,res)
})

router.get('/logout', function(req,res){
  req.session.destroy(function(err){
    if(err)
    {
      console.log(err);
    }
    else
    {
      res.redirect('/');
    }
  })
})

module.exports = router;