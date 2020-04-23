var mysql = require('mysql');

const hostname = '127.0.0.1';

var connection = mysql.createConnection({
  host     :  hostname,
  user     : 'root',
  password : 'bi$OFD2EKGtpiqnt1NHKQhKe57rXH#ri',
  database : 'dsan',
  timezone : 'asia/kolkata'
});

connection.connect(function (err) {
  if(err) console.log(err);
  console.log('mysql connection success');
});

module.exports = connection;
