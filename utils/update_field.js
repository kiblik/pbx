module.exports = function (category,field,id,value,callback){

  var connection = require('./mysql_connection')();
  
  if( ['Phones','Exts','Defaults','Users'].indexOf(category) == -1 )
    return false;  
  
  if( field == 'ID' )
    return false;  
  
  var query = 'UPDATE ?? SET ?? = ? where id = ?';
  if(field == 'IP' || field == 'Net_ID')
    query = 'UPDATE ?? SET ?? = INET_ATON(?) where id = ?';
  if((field == 'Scenario') && (value == ''))
    value = null;
  
  connection.query(query,[category, field, value, id], function(err, rows, fields) {
    if (!err){ 
      callback();       
    }else{
      console.log('Error while performing Query.',err);
    }
    connection.end();
  });
}
