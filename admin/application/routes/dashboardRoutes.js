var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    if(req.session.is_auth)
    {
        res.render('templates/dashboard.ejs', { path: '../components/dashboard/dashboard', base_url: req.protocol + '://' + req.get('host'), title: 'Dashboard', vendor: req.app.locals.vendorName, username: req.session.userName });
    }
    else{
      res.redirect('/')
    }
});

module.exports = router;