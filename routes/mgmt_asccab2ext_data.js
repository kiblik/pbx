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

    connection.query('SELECT distinct e.ID, Ext, Name, Scenario FROM `Exts` as e JOIN aScCab2Ext as a2e ON e.ID = a2e.ID_Ext ORDER BY Ext', function(err, rows_exts, fields_exts) {
      if (!err){      
        connection.query('SELECT distinct t.ID, name FROM `identitySync`.`classrooms` as t join pbx.aScCab2Ext as a2e on a2e.ID_aScCab=t.id ORDER BY name', function(err, rows_asccab, fields_asccab) {
          if (!err){      
            connection.query('SELECT ID, ID_Ext, ID_aScCab FROM aScCab2Ext', function(err, rows_a2e, fields_a2e) {
              if (!err){  
                data = {  nodes:[],  links:[] };
                rows_exts.forEach(function(row){
                  node = {
                    "node": "ext_"+row.ID,
                    "name": row.Ext + " (" + row.Name +")"
                  }
                  data.nodes.push(node);
                });
                rows_asccab.forEach(function(row){
                  node = {
                    "node": "asccab_"+row.ID,
                    "name": row.name
                  }
                  data.nodes.push(node);
                });
                rows_a2e.forEach(function(row){
                  link = {
                    "source": "ext_"+row.ID_Ext,
                    "target": "asccab_"+row.ID_aScCab,
                    "value":1,
                    "id": row.ID
                  }
                  data.links.push(link);
                });
                res.send(JSON.stringify(data));
                connection.end(); 
              }else{
                console.log('Error while performing Query 3:',err);
                next(err, req, res);
                connection.end();
              }
            });
          }else{
            console.log('Error while performing Query 2:',err);
            next(err, req, res);
            connection.end();
          }
        });
      }else{
        console.log('Error while performing Query 1:',err);
        next(err, req, res);
        connection.end();
      }
    });
  });  
});

module.exports = router;
