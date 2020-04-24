var db = require('../../config');
var md5 = require('md5');
var empty = require('is-empty');
var api_ctrl = {};

api_ctrl.meetingDetails = function(req, res)
{
    const data = JSON.parse(JSON.stringify(req.body));
    const sql = "SELECT * FROM `zc_meeting` WHERE `mt_mid` = ? AND `mt_password` = ? limit 1";
    db.query({ sql, values: [data.meetingId, md5(data.meetingPassword)] }, function (error, result) {
        if(empty(result)) {
            var message = {
                response : false,
                message  : 'Meeting ID or Password mismatch'
            }
            res.write(JSON.stringify(message));
            res.end();
        }
        else
        {
            if(result[0].mt_status == 'Active'){
                var q = new Date();
                var currentDate = q.getFullYear() + "-" + ( '0' + (q.getMonth()+1) ).slice( -2 ) + "-" + q.getDate();
                var date   = new Date(currentDate);
                var mydate = new Date(result[0].mt_date);
                if(date  > mydate)
                {
                    var message = {
                        response : false,
                        message  : 'Meeting is over now.',
                        data     : result[0]
                    }
                    res.write(JSON.stringify(message));
                    res.end(); 
                }
                else
                {
                    if(result[0].mt_date == currentDate)
                    {
                        var currentTime = q.getHours() + ":" + q.getMinutes() + ":" + q.getSeconds();
                        var time   = new Date(currentDate +' '+ currentTime);
                        var myTime = new Date(result[0].mt_date + ' ' + result[0].mt_time);
                        if(time  > myTime)
                        {
                            var message = {
                                response : false,
                                message  : 'Meeting is over now.',
                                data     : result[0]
                            }
                            res.write(JSON.stringify(message));
                            res.end();
                        }
                        else
                        {
                            var diff =  Math.abs(new Date(time) - new Date(myTime));
                            var dseconds = Math.floor(diff/1000);
                            var minutes = Math.floor(dseconds/60); 
                            dseconds = dseconds % 60;
                            var hours = Math.floor(minutes/60);
                            minutes = minutes % 60;

                            var totalSeconds = ((+hours) * 60 * 60 + (+minutes) * 60 + (+dseconds));
                            var totalMinutes = totalSeconds/60;
                            if(totalMinutes <= 65)
                            {
                                var hms = result[0].mt_duration;
                                var a = hms.split(':');
                                var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 

                                var message = {
                                    response   : true,
                                    message    : 'Please wait, the meeting host will let you in soon.',
                                    data       : result[0],
                                    mseconds   : seconds,
                                    afterstart : ( totalSeconds * 1000)
                                }
                                res.write(JSON.stringify(message));
                                res.end(); 
                            }
                            else
                            {
                                var totalHours = totalMinutes/60;
                                var tHours     = totalHours | 0;
                                var message = {
                                    response : false,
                                    message  : 'Please wait, your meeting is ' + tHours + ' hour ahead.'
                                }
                                res.write(JSON.stringify(message));
                                res.end();
                            }
                        }
                    }
                    else
                    {
                        var message = {
                            response : false,
                            message  : 'Your Meeting has been scheduled at '+ result[0].mt_time +' on date: ' + result[0].mt_date
                        }
                        res.write(JSON.stringify(message));
                        res.end();
                    }
                }
            }
            else
            {
                var message = {
                    response : false,
                    message  : 'Sorry, Your meeting has been suspended by Host.'
                }
                res.write(JSON.stringify(message));
                res.end();
            }
        }
    });
}

module.exports = api_ctrl;