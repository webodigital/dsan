var express = require('express');
var router = express.Router();
var meeting_ctrl = require('../controller/meeting_ctrl');

router.get('/', function(req, res, next) {
    if(req.session.is_auth)
    {
      res.render('templates/meeting.ejs', { path: '../components/meeting/list', base_url: req.protocol + '://' + req.get('host'), title: 'Meeting', vendor: req.app.locals.vendorName, username: req.session.userName });
    }
    else{
      res.redirect('/')
    }
});

router.post('/list', function(req,res) {
  if(req.session.is_auth)
  {
    meeting_ctrl.list(req,res)
  }
 else{
   res.redirect('/')
  }
})


router.post('/add', function(req,res) {
  if(req.session.is_auth)
  {
    meeting_ctrl.add(req,res)
  }
  else{
    res.redirect('/')
  }
})

router.post('/add-modal', function(req,res) {
  if(req.session.is_auth)
  {
    meeting_ctrl.addModal(req,res)
  }
  else{
    res.redirect('/')
  }
})

router.post('/change-status', function(req,res) {
  if(req.session.is_auth)
  {
    meeting_ctrl.changeStatus(req,res)
  }
  else{
    res.redirect('/')
  }
})

router.post('/details', function(req,res) {
  if(req.session.is_auth)
  {
    meeting_ctrl.details(req,res)
  }
  else{
    res.redirect('/')
  }
})

router.post('/update', function(req,res) {
  if(req.session.is_auth)
  {
    meeting_ctrl.update(req,res)
  }
  else{
    res.redirect('/')
  }
})

router.post('/monitor', function(req,res) {
  if(req.session.is_auth)
  {
    meeting_ctrl.monitor(req,res)
  }
  else{
    res.redirect('/')
  }
})

router.post('/change-cstatus', function(req,res) {
  if(req.session.is_auth)
  {
    meeting_ctrl.changeCstatus(req,res)
  }
  else{
    res.redirect('/')
  }
})

router.post('/update-monitor-time', function(req,res) {
  meeting_ctrl.updateMonitorTime(req,res)
})



module.exports = router;