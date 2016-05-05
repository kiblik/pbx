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
        connection.query('SELECT ID, Description, Login, Prototype FROM `Phones`', function(err, rows_phones, fields_phones) {
          if (!err){      
            connection.query('SELECT ID, ID_Ext, ID_Phone FROM `Ext2Phones`', function(err, rows_e2p, fields_e2p) {
              if (!err){      
                res.render('mgmt_e2p', { title: 'Managment - exts to phones', rows_phones: rows_phones, rows_exts: rows_exts, rows_e2p: rows_e2p, perm: perm, count: Math.max(rows_phones.length,rows_exts.length)});  
                connection.end(); 
              }else{
                console.log('Error while performing Query 3');
                next(err, req, res);
                connection.end();
              }
            });
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
