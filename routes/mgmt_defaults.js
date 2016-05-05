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

    connection.query('SELECT ID, CiscoKey, Value FROM Defaults ORDER BY CiscoKey', ['10.3.1.5'], function(err, rows, fields) {
      if (!err){      
        res.render('mgmt_defaults', { title: 'Managment - ext', rows: rows, query: req.query, fields: fields, perm: perm});  
      }else{
        console.log('Error while performing Query.');
        next(err, req, res);
      }
      connection.end();    
    });

  });
});

module.exports = router;
