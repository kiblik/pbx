module.exports = function (category,values,callback){

  var connection = require('./mysql_connection')();
  var ip = require('ip');
  
  if( ['Phones','Exts','Defaults','Users','Specials','Ext2Phones','aScTea2Ext','aScCab2Ext'].indexOf(category) == -1 )
    return false;  

  for(var field in values){
    if(field == 'IP' || field == 'Net_ID')
      values[field] = ip.toLong(values[field]); // inde na toto pouzivam MySQL f-ciu, ale nemal by som ju tam teraz ako nacpat.
    else if (field == 'Net_ID_v6'){
      var ipAddressV6 = require('ip-address').Address6;
      var ipV6 = new ipAddressV6(values[field]);
      values[field] = ipV6.canonicalForm().replace(/:/gi,'');
    }
  }
  
  var query = 'INSERT INTO ?? SET ? ';
  var query = connection.query(query,[category, values], function(err, result) {
    if (!err){ 
      callback();
    }else{
      console.log('Error while performing Query.',err);
      callback('Error');
    }
    connection.end();
  });
}
