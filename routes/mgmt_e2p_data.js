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

    connection.query('SELECT distinct e.ID, Ext, Name, Scenario FROM `Exts` as e JOIN Ext2Phones as e2p ON e.ID = e2p.ID_Ext ORDER BY Ext', function(err, rows_exts, fields_exts) {
      if (!err){      
        connection.query('SELECT distinct p.ID, Description, Login, Prototype FROM `Phones` as p JOIN Ext2Phones as e2p ON p.ID = e2p.ID_Phone', function(err, rows_phones, fields_phones) {
          if (!err){      // as e2p JOIN Exts as e ON e.ID = e2p.ID_Ext JOIN Phones as p ON p.ID = e2p.ID_Phone
            connection.query('SELECT ID, ID_Ext, ID_Phone FROM `Ext2Phones`', function(err, rows_e2p, fields_e2p) {
              if (!err){  
                data = {  nodes:[],  links:[] };
                rows_exts.forEach(function(row){
                  node = {
                    "node": "ext_"+row.ID,
                    "name": row.Ext + " (" + row.Name +")"
                  }
                  data.nodes.push(node);
                });
                rows_phones.forEach(function(row){
                  node = {
                    "node": "phone_"+row.ID,
                    "name": row.Description + " (" + row.Login + ")"
                  }
                  data.nodes.push(node);
                });
                rows_e2p.forEach(function(row){
                  link = {
                    "source": "ext_"+row.ID_Ext,
                    "target": "phone_"+row.ID_Phone,
                    "value":1,
                    "id": row.ID
                  }
                  data.links.push(link);
                });
                res.send(JSON.stringify(data));
                //res.render('mgmt_e2p', { title: 'Managment - exts to phones', rows_phones: rows_phones, rows_exts: rows_exts, rows_e2p: rows_e2p, perm: perm, count: Math.max(rows_phones.length,rows_exts.length)});  
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
