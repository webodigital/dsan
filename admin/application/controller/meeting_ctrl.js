var db = require('../../config');
var md5 = require('md5');
var empty = require('is-empty');
var meeting_ctrl = {};
var moment = require('moment-timezone');

meeting_ctrl.list = function(req,res)
{

    var sTable  = 'zc_meeting';
    const obj   = JSON.parse(JSON.stringify(req.body));
    let page    = '';
    let perpage = '';

    Object.entries(obj).forEach(([key, value]) => {
        if(`${key}` == 'pagination[page]')
        {
            page = `${value}`
        }

        if(`${key}` == 'pagination[perpage]')
        {
            perpage = `${value}`
        }
    });

    let start = 0;

    if(page > 1)
    {
        start = ((parseInt(page)-1)*parseInt(perpage));
    }
        
    let sLimit = ' LIMIT ' +start+ ', ' +perpage;
    let sOrder = ' ORDER BY mt_date DESC, mt_time DESC';
    let sql = 'SELECT * FROM ' + sTable + ' ' + sOrder + sLimit;

    db.query(sql, function(err, result){

        let sql1 = 'SELECT * FROM ' + sTable
        db.query(sql1, function(err1, result1){

            let total = 0;
            totalPages = parseFloat(result1.length)/parseFloat(perpage);
            if(totalPages > 0)
            {
                total = parseInt(totalPages) + 1;
            }
            var mdata = {
                meta : {
                    page    : page,
                    pages   : total,
                    perpage : perpage,
                    total   : result1.length,
                    sort    : '',
                    field   : ''
                },
                data : result
            }
            res.write(JSON.stringify(mdata));
            res.end();

        });
 
    });
}

meeting_ctrl.add = function(req, res)
{
    const sql = "SELECT * FROM `zc_meeting` WHERE `mt_mid` = ? limit 1";

    db.query({ sql, values: [req.body.meetingId] }, function (se, search) {

        if(empty(search)) {
            var sql = "INSERT INTO zc_meeting SET ?";
            const meetingData = {
                mt_name        : req.body.meetingName, 
                mt_mid         : req.body.meetingId,
                mt_date        : req.body.meetingDate,
                mt_time        : req.body.meetingTime,
                mt_duration    : req.body.meetingDuration,
                mt_participant : req.body.meetingParticipant ,
                mt_password    : md5(req.body.meetingPassword)
            };
            
            db.query(sql, meetingData, function(err, result){
                var message = {
                    response : true,
                    message  : 'Successfully added meeting'
                }
                res.write(JSON.stringify(message));
                res.end();
            }).on('error', function(err) {
                var message = {
                    response : false,
                    message  : 'Something went wrong!'
                }
                res.write(JSON.stringify(message));
                res.end();
            });
        }
        else {
            var message = {
                response : false,
                message  : 'This MeetingId allready added. Please add new meetingId.'
            }
            res.write(JSON.stringify(message));
            res.end();
        }

    });
}

meeting_ctrl.changeStatus = function(req, res)
{
    const sql = "SELECT * FROM `zc_meeting` WHERE `mt_id` = ? limit 1";

    db.query({ sql, values: [req.body.id] }, function (error, result) {

        var status = 'Active';
        var timer = 'On';
        if(result[0].mt_status == 'Active')
        {
            status = 'Deactive';
            timer = 'Close';
        }

        var currentDate = moment().tz("asia/kolkata").format('YYYY-MM-DD');
        if(result[0].mt_date == currentDate)
        {
            var myTime = result[0].mt_date + ' ' + result[0].mt_time;
            var time = moment().tz("asia/kolkata").format('YYYY-MM-DD h:mm:ss a');

            if(time > myTime)
            {
                var expireDuration = moment.utc(moment(time,"YYYY-MM-DD h:mm:ss a").diff(moment(result[0].mt_date + ' ' + result[0].mt_time,"YYYY-MM-DD h:mm:ss a"))).format("HH:mm:ss");
                var ed = expireDuration.split(':');
                var expireSeconds  = (+ed[0]) * 60 * 60 + (+ed[1]) * 60 + (+ed[2]);

                var hms = result[0].mt_duration;
                var a = hms.split(':');
                var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 

                if(expireSeconds <= seconds)
                {
                    var sqlUpdate = "UPDATE zc_meeting set mt_status =?  WHERE mt_id = ?";
        
                    db.query(sqlUpdate, [status, req.body.id], function(err, result) {
                        if(result.affectedRows)
                        {
                            var message = {
                                response  : true,
                                message   : 'Successfully '+timer+' timer',
                                action    : status,
                                amessage  : 'Sorry, Your meeting has been suspended by Host.',
                                meetingId : req.body.id
                            }
                            res.write(JSON.stringify(message));
                            res.end();
                        }
                        else
                        {
                            var message = {
                                response : false,
                                message  : 'Something went wrong!'
                            }
                            res.write(JSON.stringify(message));
                            res.end();
                        }
                    });
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
                var sqlUpdate = "UPDATE zc_meeting set mt_status =?  WHERE mt_id = ?";
        
                db.query(sqlUpdate, [status, req.body.id], function(err, result) {
                    if(result.affectedRows)
                    {
                        var message = {
                            response  : true,
                            message   : 'Successfully '+timer+' timer',
                            action    : status,
                            amessage  : 'Sorry, Your meeting has been suspended by Host.',
                            meetingId : req.body.id
                        }
                        res.write(JSON.stringify(message));
                        res.end();
                    }
                    else
                    {
                        var message = {
                            response : false,
                            message  : 'Something went wrong!'
                        }
                        res.write(JSON.stringify(message));
                        res.end();
                    }
                });
            }
        }
        else
        {
            var sqlUpdate = "UPDATE zc_meeting set mt_status =?  WHERE mt_id = ?";
        
            db.query(sqlUpdate, [status, req.body.id], function(err, result) {
                if(result.affectedRows)
                {
                    var message = {
                        response  : true,
                        message   : 'Successfully '+timer+' timer',
                        action    : status,
                        amessage  : 'Sorry, Your meeting has been suspended by Host.',
                        meetingId : req.body.id
                    }
                    res.write(JSON.stringify(message));
                    res.end();
                }
                else
                {
                    var message = {
                        response : false,
                        message  : 'Something went wrong!'
                    }
                    res.write(JSON.stringify(message));
                    res.end();
                }
            });
        } 
        
    });
}

meeting_ctrl.details = function(req, res)
{
    const sql = "SELECT * FROM `zc_meeting` WHERE `mt_id` = ? limit 1";

    db.query({ sql, values: [req.body.id] }, function (error, result) {
        if(empty(result)) {
            var message = {
                response : false,
                message  : 'Something went wrong!'
            }
            res.write(JSON.stringify(message));
            res.end();
        }
        else
        {
            var currentDate = moment().tz("asia/kolkata").format('YYYY-MM-DD');
            if(result[0].mt_date == currentDate)
            {
                var myTime = result[0].mt_date + ' ' + result[0].mt_time;
                var time = moment().tz("asia/kolkata").format('YYYY-MM-DD h:mm:ss a');

                if(time > myTime)
                {
                    var message = {
                        response : false,
                        message  : 'Meeting is over now.'
                    }
                    res.write(JSON.stringify(message));
                    res.end();
                }
                else
                {
                    var message = {
                        response : true,
                        message  : 'Success',
                        data     : result[0]
                    }
                    res.write(JSON.stringify(message));
                    res.end();  
                }
            }
            else
            {
                var message = {
                    response : true,
                    message  : 'Success',
                    data     : result[0]
                }
                res.write(JSON.stringify(message));
                res.end(); 
            } 
        }
    });
}

meeting_ctrl.update = function(req, res)
{
    var sqlUpdate = "UPDATE zc_meeting set mt_name = ?, mt_date = ?, mt_time = ?, mt_duration = ?, mt_participant = ?  WHERE mt_id = ?"; 
    db.query(sqlUpdate, [req.body.editMeetingName, req.body.editMeetingDate, req.body.editMeetingTime, req.body.editMeetingDuration, req.body.editMeetingParticipant, req.body.editMeetingUpdateId], function(err, result) {
        if(result.affectedRows)
        {
            var message = {
                response : true,
                message  : 'Successfully updated meeting'
            }
            res.write(JSON.stringify(message));
            res.end();
        }
        else
        {
            var message = {
                response : false,
                message  : 'Something went wrong!'
            }
            res.write(JSON.stringify(message));
            res.end();
        }
    });
}

meeting_ctrl.monitor = function(req, res)
{
    const sql = "SELECT * FROM `zc_meeting` WHERE `mt_id` = ? limit 1";
    db.query({ sql, values: [req.body.id] }, function (error, result) {
        if(empty(result)) {
            var message = {
                response : false,
                message  : 'Invalid meetingId'
            }
            res.write(JSON.stringify(message));
            res.end();
        }
        else
        {
            if(result[0].mt_status == 'Active'){
                if(result[0].mt_cstatus == 'Suspend')
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
                    var currentDate = moment().tz("asia/kolkata").format('YYYY-MM-DD');
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
                            var time = moment().tz("asia/kolkata").format('YYYY-MM-DD h:mm:ss a');

                            if(time > myTime)
                            {
                                const sql = "SELECT * FROM `zc_timing` WHERE `mt_id` = ? ORDER BY tm_id DESC limit 1";
                                db.query({ sql, values: [req.body.id] }, function (error1, result1) {
                                    if(empty(result1))
                                    {
                                        var expireDuration = moment.utc(moment(time,"YYYY-MM-DD h:mm:ss a").diff(moment(result[0].mt_date + ' ' + result[0].mt_time,"YYYY-MM-DD h:mm:ss a"))).format("HH:mm:ss");
                                        var ed = expireDuration.split(':');
                                        var expireSeconds  = (+ed[0]) * 60 * 60 + (+ed[1]) * 60 + (+ed[2]);

                                        var hms = result[0].mt_duration;
                                        var a = hms.split(':');
                                        var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 

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
                                                mseconds   : seconds - expireSeconds,
                                                afterstart : ( 0 ),
                                                action     : 'start'
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
                                                var expireDuration = moment.utc(moment(time,"YYYY-MM-DD h:mm:ss a").diff(moment(result[0].mt_date + ' ' + result1[0].tm_time,"YYYY-MM-DD h:mm:ss a"))).format("HH:mm:ss");
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
                                                        afterstart : ( 0 ),
                                                        action     : 'start'
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
                                                var expireDuration = moment.utc(moment(time,"YYYY-MM-DD h:mm:ss a").diff(moment(result[0].mt_date + ' ' + result[0].mt_time,"YYYY-MM-DD h:mm:ss a"))).format("HH:mm:ss");
                                                var ed = expireDuration.split(':');
                                                var expireSeconds  = (+ed[0]) * 60 * 60 + (+ed[1]) * 60 + (+ed[2]);

                                                var hms = result[0].mt_duration;
                                                var a = hms.split(':');
                                                var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 

                                                if(expireSeconds <= seconds)
                                                {
                                                    var message = {
                                                        response   : true,
                                                        instant    : false,
                                                        message    : 'Sorry, This meeting has been paused.',
                                                        data       : result[0],
                                                        mseconds   : result1[0].tm_remaining_sec,
                                                        afterstart : ( 0 ),
                                                        action     : 'pause'
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
                                        }
                                        
                                    }
                                });
                            }
                            else
                            {
                                var startSeconds = moment.utc(moment(myTime,"YYYY-MM-DD h:mm:ss a").diff(moment(time,"YYYY-MM-DD h:mm:ss a"))).format("HH:mm:ss");
                                var es = startSeconds.split(':');
                                var afterSecondsTimer  = (+es[0]) * 60 * 60 + (+es[1]) * 60 + (+es[2]);
                                var ast = (afterSecondsTimer/60) | 0;
                                if(ast <= 5)
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
                                        afterstart : ( afterSecondsTimer * 1000),
                                        action     : 'start'
                                    }
                                    res.write(JSON.stringify(message));
                                    res.end(); 
                                }
                                else
                                {
                                    var time = moment().tz("asia/kolkata").format('YYYY-MM-DD, h:mm:ss a');
                                    var message = {
                                        response : false,
                                        message  : 'Please wait, your meeting is ' + result[0].mt_time + ' ahead.'
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


meeting_ctrl.changeCstatus = function(req, res)
{
    const sql = "SELECT * FROM `zc_meeting` WHERE `mt_id` = ? limit 1";
    db.query({ sql, values: [req.body.id] }, function (error, result) {
        if(empty(result)) {
            var message = {
                response : false,
                message  : 'Invalid meetingId'
            }
            res.write(JSON.stringify(message));
            res.end();
        }
        else
        {
            var upStatus = false;
            if(req.body.status == 'Suspend')
            {
                upStatus = true;
            }

            if(req.body.status == 'On')
            {
                if(req.body.status == result[0].mt_cstatus)
                {
                    upStatus = false;
                }
                else
                {
                    upStatus = true;
                }
            }

            if(req.body.status == 'Pause')
            {
                if(req.body.status == result[0].mt_cstatus)
                {
                    upStatus = false;
                }
                else
                {
                    upStatus = true;
                }
            }

            if(upStatus)
            {
                var mtd = result[0].mt_duration;
                var mtdt = mtd.split(':');
                var tseconds = (+mtdt[0]) * 60 * 60 + (+mtdt[1]) * 60 + (+mtdt[2]); 

                var mtr = req.body.time;
                var mtrt = mtr.split(':');
                var rseconds = (+mtrt[0]) * 60 * 60 + (+mtrt[1]) * 60 + (+mtrt[2]);

                var eplasedTime = tseconds - rseconds;

                var sqlUpdate = "UPDATE zc_meeting set mt_cstatus = ? WHERE mt_id = ?"; 
                db.query(sqlUpdate, [req.body.status, req.body.id], function(err, result) {
                    if(result.affectedRows)
                    {
                        var insertSQL = "INSERT INTO zc_timing SET ?";
                        const timingData = {
                            mt_id            : req.body.id, 
                            tm_time          : moment().tz("asia/kolkata").format('h:mm:ss a'),
                            tm_status        : req.body.status,
                            tm_remaining     : req.body.time,
                            tm_eplased_sec   : eplasedTime,
                            tm_remaining_sec : rseconds
                        };
                        
                        db.query(insertSQL, timingData, function(err, result){
                            var message = {
                                response  : true,
                                message   : 'Successfully '+ req.body.status +' Meeting',
                                action    : req.body.status,
                                meetingId : req.body.id,
                                amessage  : 'Sorry, Your meeting has been suspended by Host.'
                            }
                            res.write(JSON.stringify(message));
                            res.end();
                        }).on('error', function(err) {
                            var message = {
                                response : false,
                                message  : 'Something went wrong!'
                            }
                            res.write(JSON.stringify(message));
                            res.end();
                        });
                    }
                    else
                    {
                        var message = {
                            response : false,
                            message  : 'Something went wrong!'
                        }
                        res.write(JSON.stringify(message));
                        res.end();
                    }
                });
            }
            else
            {
                var message = {
                    response : false,
                    message  : 'Action not allowed!'
                }
                res.write(JSON.stringify(message));
                res.end();
            }

        }
    });
    
}

module.exports = meeting_ctrl;