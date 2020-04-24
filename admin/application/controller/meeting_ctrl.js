var db = require('../../config');
var md5 = require('md5');
var empty = require('is-empty');
var meeting_ctrl = {};

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
    let sOrder = ' ORDER BY mt_date DESC';
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

        var sqlUpdate = "UPDATE zc_meeting set mt_status =?  WHERE mt_id = ?";
        
        db.query(sqlUpdate, [status, req.body.id], function(err, result) {
            if(result.affectedRows)
            {
                var message = {
                    response : true,
                    message  : 'Successfully '+timer+' timer'
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
            var message = {
                response : true,
                message  : 'Success',
                data     : result[0]
            }
            res.write(JSON.stringify(message));
            res.end();  
        }
    });
}

meeting_ctrl.update = function(req, res)
{
    console.log(req.body);
    var sqlUpdate = "UPDATE zc_meeting set mt_name = ?, mt_mid = ?, mt_date = ?, mt_time = ?, mt_duration = ?, mt_participant = ?  WHERE mt_id = ?";
        
    db.query(sqlUpdate, [req.body.editMeetingName, req.body.editMeetingId, req.body.editMeetingDate, req.body.editMeetingTime, req.body.editMeetingDuration, req.body.editMeetingParticipant, req.body.editMeetingUpdateId], function(err, result) {
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


module.exports = meeting_ctrl;