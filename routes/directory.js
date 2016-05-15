var express = require('express');
var router = express.Router();
var pc = require('./../utils/permitions_checker');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var connection = require('./../utils/mysql_connection')();
  ip = req.headers['x-forwarded-for'];
  pc(ip,function(perm){

    connection.query('SELECT * FROM(SELECT concat(t.firstname," ",t.lastname) as Meno, c.name as Kabinet, ext as Klapka FROM aScCab2Ext as ac2e JOIN Exts as e ON e.ID = ac2e.ID_Ext JOIN identitySync.classroomsX as c ON c.id = ac2e.ID_aScCab LEFT JOIN identitySync.teachersX AS t ON c.id = t.classroomid UNION ALL SELECT concat(firstname," ",lastname) as name, null, ext FROM aScTea2Ext as at2e JOIN Exts as e ON e.ID = at2e.ID_Ext JOIN identitySync.teachersX as t ON t.id = at2e.ID_aScTea) as UN ORDER BY Klapka', function(err, rows, fields) {
      if (!err){      
        res.render('directory', { title: 'Directory', rows: rows, fields: fields, perm: perm});  
      }else{
        console.log('Error while performing Query.');
        next(err, req, res);
      }
      connection.end();
    });
  });  
});

module.exports = router;

//SELECT c.name as Meno, ext as Klapka FROM aScCab2Ext as ac2e JOIN Exts as e ON e.ID = ac2e.ID_Ext JOIN identitySync.classroomsX as c ON c.id = ac2e.ID_aScCab UNION ALL SELECT concat(firstname," ",lastname) as name,ext FROM aScTea2Ext as at2e JOIN Exts as e ON e.ID = at2e.ID_Ext JOIN identitySync.teachersX as t ON t.id = at2e.ID_aScTea