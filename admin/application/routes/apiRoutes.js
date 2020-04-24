var express = require('express');
var router = express.Router();
var api_ctrl = require('../controller/api_ctrl');

router.post('/meeting-details', function(req,res) {
    api_ctrl.meetingDetails(req,res)
})

module.exports = router;