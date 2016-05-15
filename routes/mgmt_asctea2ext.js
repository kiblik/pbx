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

    connection.query('SELECT ID, Ext, Name, Scenario FROM `Exts` ORDER BY Ext', function(err, rows_exts, fields_exts) {
      if (!err){      
        connection.query('SELECT ID, concat(firstname," ",lastname) as name FROM `identitySync`.`teachersX` ORDER BY lastname', function(err, rows_asctea, fields_asctea) {
          if (!err){      
            res.render('mgmt_asctea2ext', { title: 'Managment - exts to aScTea', rows_asctea: rows_asctea, rows_exts: rows_exts, perm: perm});  
            connection.end(); 
          }else{
            console.log('Error while performing Query 2');
            next(err, req, res);
            connection.end();
          }
        });
      }else{
        console.log('Error while performing Query 1');
        next(err, req, res);
        connection.end();
      }
    });
  });  
});

module.exports = router;
