module.exports = function (str,callback){

  var connection = require('./../utils/mysql_connection')();
  var query = connection.query('SELECT * FROM(SELECT c.name as Meno, ext as Klapka FROM aScCab2Ext as ac2e JOIN Exts as e ON e.ID = ac2e.ID_Ext JOIN identitySync.classrooms as c ON c.id = ac2e.ID_aScCab UNION ALL SELECT concat(firstname," ",lastname) as name,ext FROM aScTea2Ext as at2e JOIN Exts as e ON e.ID = at2e.ID_Ext JOIN identitySync.teachers as t ON t.id = at2e.ID_aScTea ) as un WHERE lower(Meno) like lower(?) collate utf8_general_ci OR lower(Klapka) like lower(?) collate utf8_general_ci', ["%"+str+"%","%"+str+"%"],function(err, rows, fields) {
    if (!err){      
      callback({fields: fields, rows: rows});
    }else{
      console.log('Error while performing Query.',err);
    }
    connection.end();
  });
}


