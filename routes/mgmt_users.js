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

    connection.query('SELECT u.ID, INET_NTOA(Net_ID) as Net_ID, Net_mask, Net_ID_v6, Net_mask_v6, ID_Group, ID_Phone, p.Description as pDes, u.Description FROM `Users` as u LEFT JOIN Phones as p ON p.ID = u.ID_Phone', function(err, rows, fields) {
      if (!err){      
        rows.forEach(function(part, index, arr){
          if(part['Net_ID_v6'] != '')          
            arr[index]['Net_ID_v6'] = part['Net_ID_v6'].match(/.{1,4}/g).join(':');
        });
        connection.query('SELECT ID, Description FROM Phones ORDER BY Description', function(err, rows_phones, fields_phones) {
          if (!err){      
            res.render('mgmt_users', { title: 'Managment - users', rows: rows, query: req.query, fields: fields, phones: rows_phones, perm: perm});  
            connection.end();
          }else{
            console.log('Error while performing Query.');
            next(err, req, res);
            connection.end();
          }
        });      
      }else{
        console.log('Error while performing Query.');
        next(err, req, res);
        connection.end();
      }
    });
  });  
});

module.exports = router;
