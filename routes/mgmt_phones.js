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

    connection.query('SELECT phones.*, COALESCE(spec.c, "0") as Specials FROM (SELECT ID, Login, Password, Description, INET_NTOA(IP) as IP, Prototype, Softphone from Phones) as phones LEFT JOIN (SELECT ID_Phone, Count(*) as c FROM `Specials` GROUP BY ID_Phone) as spec ON spec.ID_Phone = phones.ID ORDER BY phones.IP', function(err, rows, fields) {
      if (!err){      
        res.render('mgmt_phones', { title: 'Managment - phones', rows: rows, query: req.query, fields: fields, perm: perm});  
      }else{
        console.log('Error while performing Query.');
        next(err, req, res);
      }
      connection.end();
    });
  });  
});

module.exports = router;
