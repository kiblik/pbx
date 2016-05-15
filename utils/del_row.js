module.exports = function (category,id,callback){

  var connection = require('./mysql_connection')();
  
  if( ['Phones','Exts','Defaults','Users','Specials','Ext2Phones','aScTea2Ext','aScCab2Ext'].indexOf(category) == -1 )
    return false;  
  
  var query = 'DELETE FROM ?? WHERE ID=? ';

  connection.query(query,[category, id], function(err, result) {
    if (!err){ 
      callback();
    }else{
      console.log('Error while performing Query.',err);
      callback('Error');
    }
    connection.end();
  });
}
