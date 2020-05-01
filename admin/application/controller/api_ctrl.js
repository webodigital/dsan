var db = require('../../config');
var md5 = require('md5');
var empty = require('is-empty');
var api_ctrl = {};
var moment = require('moment-timezone');


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
                if(result[0].mt_cstatus == 'Suspend' || result[0].mt_cstatus == 'Pause')
                {
                    if(result[0].mt_cstatus == 'Pause')
                    {
                        var message = {
                            response : false,
                            message  : 'Sorry, Your meeting has been paused by Host.'
                        }
                        res.write(JSON.stringify(message));
                        res.end();
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
                else
                {
                    var currentDate = moment().tz("America/New_York").format('YYYY-MM-DD');
                    if(currentDate  > result[0].mt_date)
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
                            var myTime = result[0].mt_date + ' ' + result[0].mt_time;
                            var time = moment().tz("America/New_York").format('YYYY-MM-DD hh:mm:ss A');

                            if(time > myTime)
                            {
                                const sql = "SELECT * FROM `zc_timing` WHERE `mt_id` = ? ORDER BY tm_id DESC limit 1";
                                db.query({ sql, values: [result[0].mt_id] }, function (error1, result1) {
                                    if(empty(result1))
                                    {
                                        var expireDuration = moment.utc(moment(time,"YYYY-MM-DD hh:mm:ss A").diff(moment(result[0].mt_date + ' ' + result[0].mt_time,"YYYY-MM-DD hh:mm:ss A"))).format("HH:mm:ss");
                                        var ed = expireDuration.split(':');
                                        var expireSeconds  = (+ed[0]) * 60 * 60 + (+ed[1]) * 60 + (+ed[2]);

                                        var hms = result[0].mt_duration;
                                        var a = hms.split(':');
                                        var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]) - 60; 

                                        if(expireSeconds <= seconds)
                                        {
                                            var hms = result[0].mt_duration;
                                            var a = hms.split(':');
                                            var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 

                                            var message = {
                                                response   : true,
                                                instant    : false,
                                                message    : 'Please wait, the meeting host will let you in soon.',
                                                data       : result[0],
                                                mseconds   : seconds - expireSeconds -1,
                                                afterstart : ( 0 )
                                            }
                                            res.write(JSON.stringify(message));
                                            res.end();
                                        }
                                        else
                                        {
                                            var message = {
                                                response : false,
                                                message  : 'Meeting is over now.'
                                            }
                                            res.write(JSON.stringify(message));
                                            res.end();
                                        }   
                                    }
                                    else
                                    {
                                        if(result1[0].tm_status == 'Suspend')
                                        {
                                            var message = {
                                                response : false,
                                                message  : 'Sorry, Your meeting has been suspended by Host.'
                                            }
                                            res.write(JSON.stringify(message));
                                            res.end();
                                        }
                                        else
                                        {
                                            if(result1[0].tm_status == 'On')
                                            {
                                                var expireDuration = moment.utc(moment(time,"YYYY-MM-DD hh:mm:ss A").diff(moment(result[0].mt_date + ' ' + result1[0].tm_time,"YYYY-MM-DD hh:mm:ss A"))).format("HH:mm:ss");
                                                var ed = expireDuration.split(':');
                                                var expireSeconds  = (+ed[0]) * 60 * 60 + (+ed[1]) * 60 + (+ed[2]);

                                                var seconds = result1[0].tm_remaining_sec; 

                                                if(expireSeconds <= seconds)
                                                {
                                                    var message = {
                                                        response   : true,
                                                        instant    : false,
                                                        message    : 'Please wait, the meeting host will let you in soon.',
                                                        data       : result[0],
                                                        mseconds   : seconds - expireSeconds,
                                                        afterstart : ( 0 )
                                                    }
                                                    res.write(JSON.stringify(message));
                                                    res.end();
                                                }
                                                else
                                                {
                                                    var message = {
                                                        response : false,
                                                        message  : 'Meeting is over now.'
                                                    }
                                                    res.write(JSON.stringify(message));
                                                    res.end();
                                                }
                                            }
                                            else
                                            {
                                                var message = {
                                                    response : false,
                                                    message  : 'Sorry, Your meeting has been paused by Host.'
                                                }
                                                res.write(JSON.stringify(message));
                                                res.end();
                                            }
                                        }
                                    }
                                }); 
                            }
                            else
                            {
                                var startSeconds = moment.utc(moment(myTime,"YYYY-MM-DD hh:mm:ss A").diff(moment(time,"YYYY-MM-DD hh:mm:ss A"))).format("HH:mm:ss");
                                var es = startSeconds.split(':');
                                var afterSecondsTimer  = ((+es[0]) * 60 * 60 + (+es[1]) * 60 + (+es[2]));
                                var ast = (afterSecondsTimer/60) | 0;
                                if(ast <= 65)
                                {
                                    var hms = result[0].mt_duration;
                                    var a = hms.split(':');
                                    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 

                                    var message = {
                                        response   : true,
                                        instant    : true,
                                        message    : 'Please wait, the meeting host will let you in soon.',
                                        data       : result[0],
                                        mseconds   : seconds-1,
                                        afterstart : ( afterSecondsTimer * 1000)
                                    }
                                    res.write(JSON.stringify(message));
                                    res.end(); 
                                }
                                else
                                {
                                    var time = moment().tz("America/New_York").format('YYYY-MM-DD, hh:mm:ss A');
                                    var message = {
                                        response : false,
                                        message  : 'Please wait, your meeting is ' + startSeconds + ' hour ahead.'
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