var db = require('../../config');
var md5 = require('md5');
var empty = require('is-empty');
var stopwatch_ctrl = {};
var moment = require('moment-timezone');

stopwatch_ctrl.list = function(req, res)
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
        
    let sWhere = ' WHERE mt_type = "Stopwatch" ';
    let sLimit = ' LIMIT ' +start+ ', ' +perpage;
    let sOrder = ' ORDER BY mt_id DESC, mt_time DESC';
    let sql = 'SELECT * FROM ' + sTable + ' ' + sWhere + ' ' + sOrder + sLimit;

    db.query(sql, function(err, result){

        let sql1 = 'SELECT * FROM ' + sTable + ' ' + sWhere
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

stopwatch_ctrl.add = function(req, res)
{
    const sql = "SELECT * FROM `zc_meeting` WHERE `mt_mid` = ? limit 1";

    db.query({ sql, values: [req.body.meetingId] }, function (se, search) {

        if(empty(search)) {
            
            var sql = "INSERT INTO zc_meeting SET ?";
            const meetingData = {
                mt_name        : req.body.meetingName, 
                mt_mid         : req.body.meetingId,
                mt_password    : md5(req.body.meetingPassword),
                mt_type        : 'Stopwatch'
            };
            
            db.query(sql, meetingData, function(err, result){
                var sql1 = "INSERT INTO zc_stopwatch SET ?";
                const stopwatchData = {
                    mt_id        : result.insertId
                };
                
                db.query(sql1, stopwatchData, function(err1, result1){
                    console.log(result);
                    var message = {
                        response : true,
                        message  : 'Successfully added stopwatch meeting'
                    }
                    res.write(JSON.stringify(message));
                    res.end();
                }).on('error', function(err1) {
                    var message = {
                        response : false,
                        message  : 'Something went wrong!'
                    }
                    res.write(JSON.stringify(message));
                    res.end();
                });

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

stopwatch_ctrl.monitor = function(req, res) {
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
            const sql = "SELECT * FROM `zc_stopwatch` WHERE `mt_id` = ? ORDER BY sw_id DESC limit 1";
            db.query({ sql, values: [result[0].mt_id] }, function (error1, result1) {
                if(empty(result1))
                {
                    var message = {
                        response : false,
                        message  : 'Something went wrong!'
                    }
                    res.write(JSON.stringify(message));
                    res.end();
                }
                else
                {
                    const sql = "SELECT * FROM `zc_stopwatch_timing` WHERE `sw_id` = ? ORDER BY tm_id DESC limit 1";
                    db.query({ sql, values: [result1[0].sw_id] }, function (error2, result2) {
                        if(empty(result2))
                        {
                            var message = {
                                response  : true,
                                message   : 'Success',
                                second    : 0,
                                action    : 'Pause',
                                meetingId : result[0].mt_id
                            }
                            res.write(JSON.stringify(message));
                            res.end();
                            
                            
                        }
                        else
                        {
                            if(result2[0].tm_status == 'Pause' || result2[0].tm_status == 'On')
                            {
                                if(result2[0].tm_status == 'Pause')
                                {
                                    var message = {
                                        response  : true,
                                        message   : 'Success',
                                        second    : result2[0].tm_remaining_sec,
                                        action    : 'Pause',
                                        meetingId : result[0].mt_id
                                    }
                                    res.write(JSON.stringify(message));
                                    res.end();
                                }
                                else
                                {
                                    var myTime = result2[0].tm_date + ' ' + result2[0].tm_time;
                                
                                    var time = moment().tz("America/New_York").format('YYYY-MM-DD hh:mm:ss A');
                                    var expireDuration = moment.utc(moment(time,"YYYY-MM-DD hh:mm:ss A").diff(moment(myTime,"YYYY-MM-DD hh:mm:ss A"))).format("HH:mm:ss");

                                    var ed = expireDuration.split(':');
                                    var expireSeconds  = (+ed[0]) * 60 * 60 + (+ed[1]) * 60 + (+ed[2]);
                                    var rmSeconds = result2[0].tm_remaining_sec; 

                                    var tSeconds = rmSeconds-expireSeconds;

                                    if(tSeconds > 0)
                                    {
                                        var message = {
                                            response  : true,
                                            message   : 'Success',
                                            second    : rmSeconds - expireSeconds,
                                            action    : 'On',
                                            meetingId : result[0].mt_id
                                        }
                                        res.write(JSON.stringify(message));
                                        res.end();
                                    }
                                    else
                                    {
                                        var message = {
                                            response : false,
                                            message  : 'Please click reuse button then click'
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
                                    message  : 'Please click reuse button then click'
                                }
                                res.write(JSON.stringify(message));
                                res.end();
                            }
                            
                        }
                    });
                }
            });
        }
    });
}

stopwatch_ctrl.updateMonitorTime = function(req, res) {
    const sql = "SELECT * FROM `zc_stopwatch` WHERE `mt_id` = ? ORDER BY sw_id DESC limit 1";
    db.query({ sql, values: [req.body.id] }, function (error, result) {
        if(empty(result))
        {
            var message = {
                response : false,
                message  : 'Something went wrong!'
            }
            res.write(JSON.stringify(message));
            res.end();
        }
        else
        {
            const sql = "SELECT * FROM `zc_stopwatch_timing` WHERE `sw_id` = ? ORDER BY tm_id DESC limit 1";
            db.query({ sql, values: [result[0].sw_id] }, function (error1, result1) {
                if(empty(result1))
                {
                    var message = {
                        response : false,
                        message  : 'Action not allowed!'
                    }
                    res.write(JSON.stringify(message));
                    res.end();
                }
                else
                {
                   if(result1[0].tm_status == 'Pause' || result1[0].tm_status == 'On')
                   {
                        if(result1[0].tm_status == 'Pause')
                        {
                            if(req.body.type == 'Plus')
                            {
                                var totalSec = parseInt(result1[0].tm_remaining_sec)+parseInt(req.body.seconds);
                                var controlSQL = "INSERT INTO zc_stopwatch_timing SET ?";
                                const controlData = {
                                    sw_id            : result[0].sw_id, 
                                    tm_date          : moment().tz("America/New_York").format('YYYY-MM-DD'),
                                    tm_time          : moment().tz("America/New_York").format('hh:mm:ss A'),
                                    tm_status        : 'Pause',
                                    tm_remaining     : req.body.time,
                                    tm_eplased_sec   : 0,
                                    tm_remaining_sec : totalSec
                                };
                                
                                db.query(controlSQL, controlData, function(err2, result2){
                                    var message = {
                                        response  : true,
                                        message   : 'Meeting time extended',
                                        second    : totalSec,
                                        type      : 'Pause',
                                        meetingId : result[0].mt_id
                                    }
                                    res.write(JSON.stringify(message));
                                    res.end();
                                }).on('error', function(error2) {
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
                                if(result1[0].tm_remaining_sec > req.body.seconds)
                                {
                                    var totalSec = parseInt(result1[0].tm_remaining_sec) - parseInt(req.body.seconds);
                                    var controlSQL = "INSERT INTO zc_stopwatch_timing SET ?";
                                    const controlData = {
                                        sw_id            : result[0].sw_id,
                                        tm_date          : moment().tz("America/New_York").format('YYYY-MM-DD'), 
                                        tm_time          : moment().tz("America/New_York").format('hh:mm:ss A'),
                                        tm_status        : 'Pause',
                                        tm_remaining     : req.body.time,
                                        tm_eplased_sec   : 0,
                                        tm_remaining_sec : totalSec
                                    };
                                    
                                    db.query(controlSQL, controlData, function(err2, result2){
                                        var message = {
                                            response  : true,
                                            message   : 'Meeting time reduce',
                                            second    : totalSec,
                                            type      : 'Pause',
                                            meetingId : result[0].mt_id
                                        }
                                        res.write(JSON.stringify(message));
                                        res.end();
                                    }).on('error', function(error2) {
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
                                    var controlSQL = "INSERT INTO zc_stopwatch_timing SET ?";
                                    const controlData = {
                                        sw_id            : result[0].sw_id, 
                                        tm_time          : moment().tz("America/New_York").format('hh:mm:ss A'),
                                        tm_status        : 'Suspend',
                                        tm_remaining     : req.body.time,
                                        tm_eplased_sec   : 0,
                                        tm_remaining_sec : 0
                                    };
                                    
                                    db.query(controlSQL, controlData, function(err2, result2){
                                        var message = {
                                            response  : false,
                                            message   : 'Meeting is end',
                                            second    : 0
                                        }
                                        res.write(JSON.stringify(message));
                                        res.end();
                                    }).on('error', function(error2) {
                                        var message = {
                                            response : false,
                                            message  : 'Something went wrong!'
                                        }
                                        res.write(JSON.stringify(message));
                                        res.end();
                                    });
                                }
                            }
                        }
                        else
                        {

                            if(req.body.type == 'Plus')
                            {
                                var myTime = result1[0].tm_date + ' ' + result1[0].tm_time;
                                
                                var time = moment().tz("America/New_York").format('YYYY-MM-DD hh:mm:ss A');
                                var expireDuration = moment.utc(moment(time,"YYYY-MM-DD hh:mm:ss A").diff(moment(myTime,"YYYY-MM-DD hh:mm:ss A"))).format("HH:mm:ss");

                                var ed = expireDuration.split(':');
                                var expireSeconds  = (+ed[0]) * 60 * 60 + (+ed[1]) * 60 + (+ed[2]);
                                var rmSeconds = result1[0].tm_remaining_sec; 

                                var tSeconds = rmSeconds-expireSeconds;

                                if(tSeconds > 0)
                                {
                                    var totalSec = parseInt(tSeconds)+parseInt(req.body.seconds);
                                    var controlSQL = "INSERT INTO zc_stopwatch_timing SET ?";
                                    const controlData = {
                                        sw_id            : result[0].sw_id,
                                        tm_date          : moment().tz("America/New_York").format('YYYY-MM-DD'),
                                        tm_time          : moment().tz("America/New_York").format('hh:mm:ss A'),
                                        tm_status        : 'On',
                                        tm_remaining     : req.body.time,
                                        tm_eplased_sec   : expireSeconds,
                                        tm_remaining_sec : totalSec
                                    };
                                    
                                    db.query(controlSQL, controlData, function(err2, result2){
                                        var message = {
                                            response  : true,
                                            message   : 'Meeting time reduce',
                                            second    : totalSec,
                                            type      : 'On',
                                            meetingId : result[0].mt_id
                                        }
                                        res.write(JSON.stringify(message));
                                        res.end();
                                    }).on('error', function(error2) {
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
                                        message  : 'Action not allowed!'
                                    }
                                    res.write(JSON.stringify(message));
                                    res.end(); 
                                }
                            }
                            else
                            {
                                var myTime = result1[0].tm_date + ' ' + result1[0].tm_time;
                                
                                var time = moment().tz("America/New_York").format('YYYY-MM-DD hh:mm:ss A');
                                var expireDuration = moment.utc(moment(time,"YYYY-MM-DD hh:mm:ss A").diff(moment(myTime,"YYYY-MM-DD hh:mm:ss A"))).format("HH:mm:ss");

                                var ed = expireDuration.split(':');
                                var expireSeconds  = (+ed[0]) * 60 * 60 + (+ed[1]) * 60 + (+ed[2]);
                                var rmSeconds = result1[0].tm_remaining_sec; 

                                var tSeconds = rmSeconds-expireSeconds;

                                if(tSeconds > 0)
                                {
                                    if(tSeconds > req.body.seconds)
                                    {
                                        var totalSec = parseInt(tSeconds)-parseInt(req.body.seconds);
                                        var controlSQL = "INSERT INTO zc_stopwatch_timing SET ?";
                                        const controlData = {
                                            sw_id            : result[0].sw_id,
                                            tm_date          : moment().tz("America/New_York").format('YYYY-MM-DD'),
                                            tm_time          : moment().tz("America/New_York").format('hh:mm:ss A'),
                                            tm_status        : 'On',
                                            tm_remaining     : req.body.time,
                                            tm_eplased_sec   : expireSeconds,
                                            tm_remaining_sec : totalSec
                                        };
                                        
                                        db.query(controlSQL, controlData, function(err2, result2){
                                            var message = {
                                                response  : true,
                                                message   : 'Meeting time reduce',
                                                second    : totalSec,
                                                type      : 'On',
                                                meetingId : result[0].mt_id
                                            }
                                            res.write(JSON.stringify(message));
                                            res.end();
                                        }).on('error', function(error2) {
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
                                        var controlSQL = "INSERT INTO zc_stopwatch_timing SET ?";
                                        const controlData = {
                                            sw_id            : result[0].sw_id,
                                            tm_date          : moment().tz("America/New_York").format('YYYY-MM-DD'),
                                            tm_time          : moment().tz("America/New_York").format('hh:mm:ss A'),
                                            tm_status        : 'Suspend',
                                            tm_remaining     : req.body.time,
                                            tm_eplased_sec   : expireSeconds,
                                            tm_remaining_sec : 0
                                        };
                                        
                                        db.query(controlSQL, controlData, function(err2, result2){
                                            var message = {
                                                response  : true,
                                                message   : 'Meeting end',
                                                second    : 0,
                                                type      : 'Suspend',
                                                meetingId : result[0].mt_id
                                            }
                                            res.write(JSON.stringify(message));
                                            res.end();
                                        }).on('error', function(error2) {
                                            var message = {
                                                response : false,
                                                message  : 'Something went wrong!'
                                            }
                                            res.write(JSON.stringify(message));
                                            res.end();
                                        });
                                    }
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
                        }
                   }
                   else
                   {
                        var message = {
                            response : false,
                            message  : 'Meeting is end'
                        }
                        res.write(JSON.stringify(message));
                        res.end();
                   }
                }
            });
        }
    });
}

stopwatch_ctrl.addMonitorTime = function(req, res) {

    const sql = "SELECT * FROM `zc_stopwatch` WHERE `mt_id` = ? ORDER BY sw_id DESC limit 1";
    db.query({ sql, values: [req.body.id] }, function (error, result) {
        if(empty(result))
        {
            var message = {
                response : false,
                message  : 'Something went wrong!'
            }
            res.write(JSON.stringify(message));
            res.end();
        }
        else
        {
            const sql = "SELECT * FROM `zc_stopwatch_timing` WHERE `sw_id` = ? ORDER BY tm_id DESC limit 1";
            db.query({ sql, values: [result[0].sw_id] }, function (error1, result1) {
                if(empty(result1))
                {
                    var controlSQL = "INSERT INTO zc_stopwatch_timing SET ?";
                    const controlData = {
                        sw_id            : result[0].sw_id,                         
                        tm_date          : moment().tz("America/New_York").format('YYYY-MM-DD'),
                        tm_time          : moment().tz("America/New_York").format('hh:mm:ss A'),
                        tm_status        : 'Pause',
                        tm_eplased_sec   : 0,
                        tm_remaining_sec : req.body.seconds,
                        tm_type          : 'New'
                    };
                    
                    db.query(controlSQL, controlData, function(err2, result2){
                        var message = {
                            response  : true,
                            message   : 'Meeting add time',
                            second    : req.body.seconds,
                            meetingId : result[0].mt_id
                        }
                        res.write(JSON.stringify(message));
                        res.end();
                    }).on('error', function(error2) {
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
                        message  : 'Action not allowed!'
                    }
                    res.write(JSON.stringify(message));
                    res.end();
                }
            })
        }
    })

}

stopwatch_ctrl.controlAction = function(req, res) {
    const sql = "SELECT * FROM `zc_stopwatch` WHERE `mt_id` = ? ORDER BY sw_id DESC limit 1";
    db.query({ sql, values: [req.body.id] }, function (error, result) {
        if(empty(result))
        {
            var message = {
                response : false,
                message  : 'Something went wrong!'
            }
            res.write(JSON.stringify(message));
            res.end();
        }
        else
        {
            const sql = "SELECT * FROM `zc_stopwatch_timing` WHERE `sw_id` = ? ORDER BY tm_id DESC limit 1";
            db.query({ sql, values: [result[0].sw_id] }, function (error1, result1) {
                if(empty(result1))
                {
                    var message = {
                        response : false,
                        message  : 'Action not allowed!'
                    }
                    res.write(JSON.stringify(message));
                    res.end();
                }
                else
                {
                    if(result1[0].tm_status != req.body.status)
                    {
                        if(req.body.status == 'Pause')
                        {
                            var myTime = result1[0].tm_date + ' ' + result1[0].tm_time;
                            console.log(myTime);
                            var time = moment().tz("America/New_York").format('YYYY-MM-DD hh:mm:ss A');
                            var expireDuration = moment.utc(moment(time,"YYYY-MM-DD hh:mm:ss A").diff(moment(myTime,"YYYY-MM-DD hh:mm:ss A"))).format("HH:mm:ss");

                            var ed = expireDuration.split(':');
                            var expireSeconds  = (+ed[0]) * 60 * 60 + (+ed[1]) * 60 + (+ed[2]);
                            var rmSeconds = result1[0].tm_remaining_sec; 

                            var tSeconds = rmSeconds-expireSeconds;  
                            
                            if(tSeconds > 0)
                            {
                                var controlSQL = "INSERT INTO zc_stopwatch_timing SET ?";
                                const controlData = {
                                    sw_id            : result[0].sw_id, 
                                    tm_date          : moment().tz("America/New_York").format('YYYY-MM-DD'),
                                    tm_time          : moment().tz("America/New_York").format('hh:mm:ss A'),
                                    tm_status        : 'Pause',
                                    tm_eplased_sec   : expireSeconds,
                                    tm_remaining_sec : rmSeconds - expireSeconds
                                };
                                
                                db.query(controlSQL, controlData, function(err2, result2){
                                    var message = {
                                        response  : true,
                                        message   : 'Meeting Pause',
                                        second    : rmSeconds - expireSeconds,
                                        action    : 'Pause',
                                        meetingId : result[0].mt_id
                                    }
                                    res.write(JSON.stringify(message));
                                    res.end();
                                }).on('error', function(error2) {
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
                                    message  : 'Action not allowed!'
                                }
                                res.write(JSON.stringify(message));
                                res.end();
                            }
                        }

                        if(req.body.status == 'On')
                        {                           
                            if(result1[0].tm_remaining_sec > 0)
                            {
                                var controlSQL = "INSERT INTO zc_stopwatch_timing SET ?";
                                const controlData = {
                                    sw_id            : result[0].sw_id, 
                                    tm_date          : moment().tz("America/New_York").format('YYYY-MM-DD'),
                                    tm_time          : moment().tz("America/New_York").format('hh:mm:ss A'),
                                    tm_status        : 'On',
                                    tm_eplased_sec   : 0,
                                    tm_remaining_sec : result1[0].tm_remaining_sec
                                };
                                
                                db.query(controlSQL, controlData, function(err2, result2){
                                    var message = {
                                        response  : true,
                                        message   : 'Meeting On',
                                        second    : result1[0].tm_remaining_sec,
                                        action    : 'On',
                                        meetingId : result[0].mt_id
                                    }
                                    res.write(JSON.stringify(message));
                                    res.end();
                                }).on('error', function(error2) {
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
                                    message  : 'Action not allowed!'
                                }
                                res.write(JSON.stringify(message));
                                res.end();
                            }
                        }
                        
                        if(req.body.status == 'Suspend')
                        {
                            var controlSQL = "INSERT INTO zc_stopwatch_timing SET ?";
                            const controlData = {
                                sw_id            : result[0].sw_id,
                                tm_date          : moment().tz("America/New_York").format('YYYY-MM-DD'),
                                tm_time          : moment().tz("America/New_York").format('hh:mm:ss A'),
                                tm_status        : 'Suspend',
                                tm_remaining     : 0,
                                tm_eplased_sec   : 0,
                                tm_remaining_sec : 0
                            };
                            
                            db.query(controlSQL, controlData, function(err2, result2){
                                var message = {
                                    response  : true,
                                    message   : 'Meeting end',
                                    second    : 0,
                                    type      : 'Suspend',
                                    action    : 'Suspend',
                                    meetingId : result[0].mt_id
                                }
                                res.write(JSON.stringify(message));
                                res.end();
                            }).on('error', function(error2) {
                                var message = {
                                    response : false,
                                    message  : 'Something went wrong!'
                                }
                                res.write(JSON.stringify(message));
                                res.end();
                            });
                        }
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
            })
        }
    })
}

stopwatch_ctrl.reUse = function(req, res){
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
            var sql1 = "INSERT INTO zc_stopwatch SET ?";
            const stopwatchData = {
                mt_id : result[0].mt_id
            };
            
            db.query(sql1, stopwatchData, function(err1, result1){
                console.log(result);
                var message = {
                    response : true,
                    message  : 'Successfully applied'
                }
                res.write(JSON.stringify(message));
                res.end();
            }).on('error', function(err1) {
                var message = {
                    response : false,
                    message  : 'Something went wrong!'
                }
                res.write(JSON.stringify(message));
                res.end();
            });
        }
    });
}

module.exports = stopwatch_ctrl;