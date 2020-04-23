var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.is_auth)
  {
    res.redirect('/dashboard')
  }
  else
  {
    res.render('templates/login.ejs',  { path: '../components/login/login', base_url: req.protocol + '://' + req.get('host'), title: 'Login', vendor: req.app.locals.vendorName });
  }	  
});


module.exports = router;
