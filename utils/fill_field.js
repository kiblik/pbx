module.exports = function (category,field,id,callback){

  var connection = require('./mysql_connection')();
  
  if( ['Phones','Exts','Defaults','Users'].indexOf(category) == -1 )
    return false;    
  
  var values = [field, category, id];

  var query = 'SELECT ?? as field from ?? where id = ?';
  if(field == 'IP' || field == 'Net_ID')
    query = 'SELECT INET_NTOA(??) as field from ?? where id = ?';
  if(field == 'ID_Phone'){
    query = 'SELECT ID, Description, IF(ID=(SELECT ID_Phone FROM Users as U WHERE U.ID=?),True,False) as Selected FROM `Phones` as P ORDER BY Description';
    values = [id];
  }
  if(field == 'Specials'){
    query = 'SELECT ID, CiscoKey, Value FROM `Specials` WHERE ID_Phone = ?';
    values = [id];
  }
  var query = connection.query(query, values, function(err, rows, fields) {
    if (!err){ 
      switch(field){
        case 'ID_Phone':
        case 'Specials':
          callback(rows);
          break;
        default:
          callback(rows[0].field);       
      }    
    }else{
      console.log('Error while performing Query.',err);
    }
    connection.end();

  });
}
