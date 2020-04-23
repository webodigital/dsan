var db = require('../../config');
var md5 = require('md5');
var empty = require('is-empty');
var sess = require('express-session');
var admin_ctrl = {};

admin_ctrl.login = function(req,res){

    var sql = 'SELECT * FROM zc_admin WHERE ad_username = "' + req.body.zoom_admin_username+'" AND ad_password ="'+md5(req.body.zoom_admin_password)+'"';
    db.query(sql, function(err, result){
        if(empty(result)) {
            var message = {
                response: false,
                message: 'Invalid Username and Password',
            }
            res.write(JSON.stringify(message));
            res.end();
        }
        else{
            sess = req.session;
            sess.userId = result[0].ad_id ;
            sess.userName = result[0].ad_name;
            sess.userDisplayName = result[0].display_name;
            sess.is_auth = true;
            var message = {
                response: true,
                message: 'Successfully Login',
                data: result
            }
            res.write(JSON.stringify(message));
            res.end();
        }
    }).on('error', function(err) {
        var message = {
            response: false,
            message: 'Something went wrong!'
         }
         res.write(JSON.stringify(message));
         res.end();
    });
}

module.exports = admin_ctrl;