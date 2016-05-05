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

    connection.query('SELECT ID, Ext, Name, Scenario FROM Exts ORDER BY Ext', function(err, rows, fields) {
      if (!err){      
        res.render('mgmt_ext', { title: 'Managment - ext', rows: rows, query: req.query, fields: fields, perm: perm});  
      }else{
        console.log('Error while performing Query.');
        next(err, req, res);
      }
      connection.end();    
    });
  });  
});

module.exports = router;
