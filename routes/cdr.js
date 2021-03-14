var express = require('express');
var router = express.Router();

var pc = require('./../utils/permitions_checker');

/* GET users listing. */
router.get('/', function(req, res, next) {
  ip = req.headers['x-forwarded-for'];
  pc(ip,function(perm){
    if(perm < 3 ){
      next("Sorry", req, res);
      return;
    }
    var connection = require('./../utils/mysql_connection')();

    connection.query('SELECT date_format(calldate,"%e.%c.%Y %T") as date, src, dst, disposition,billsec  FROM `cdr` ORDER BY  `calldate` DESC  LIMIT 20', function(err, rows, fields) {
      if (!err){      
        res.render('cdr', { title: 'CDR', rows: rows, fields: fields, perm: perm});  
      }else{
        console.log('Error while performing Query.');
        next(err, req, res);
      }
      connection.end();
    });
  });  
});

module.exports = router;
