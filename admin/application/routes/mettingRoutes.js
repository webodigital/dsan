var express = require('express');
var router = express.Router();
var meeting_ctrl = require('../controller/meeting_ctrl');
var stopwatch_ctrl = require('../controller/stopwatch_ctrl');

router.get('/', function(req, res, next) {
    if(req.session.is_auth)
    {
      res.render('templates/meeting.ejs', { path: '../components/meeting/list', base_url: req.protocol + '://' + req.get('host'), title: 'Meeting', vendor: req.app.locals.vendorName, username: req.session.userName });
    }
    else{
      res.redirect('/')
    }
});

router.get('/stopwatch', function(req, res, next) {
  if(req.session.is_auth)
  {
    res.render('templates/stopwatch.ejs', { path: '../components/meeting/stopwatch', base_url: req.protocol + '://' + req.get('host'), title: 'Stopwatch', vendor: req.app.locals.vendorName, username: req.session.userName });
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

router.post('/stopwatch/list', function(req,res) {
  if(req.session.is_auth)
  {
    stopwatch_ctrl.list(req,res)
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

router.post('/stopwatch/add', function(req,res) {
  if(req.session.is_auth)
  {
    stopwatch_ctrl.add(req,res)
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

router.post('/stopwatch/monitor', function(req,res) {
  if(req.session.is_auth)
  {
    stopwatch_ctrl.monitor(req,res)
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

router.post('/stopwatch/update-monitor-time', function(req,res) {
  stopwatch_ctrl.updateMonitorTime(req, res)
})

router.post('/stopwatch/add-monitor-time', function(req, res) {
    stopwatch_ctrl.addMonitorTime(req, res)
})

router.post('/stopwatch/control-action', function(req, res) {
  stopwatch_ctrl.controlAction(req, res)
})

router.post('/stopwatch/reuse', function(req, res) {
  stopwatch_ctrl.reUse(req, res)
})


module.exports = router;