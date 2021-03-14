module.exports = function (ip, callback){

  var connection = require('./mysql_connection')();
  var ipCheck = require('ip');

  if ( ! ipCheck.isV4Format(ip) ){
    var ipAddressV6 = require('ip-address').Address6;
    var ipV6 = new ipAddressV6(ip);

    var query = connection.query(query = "SELECT ID_Group FROM `Users` WHERE substr(`Net_ID_v6`,1,`Net_Mask_v6`/4) = substr( ? , 1, `Net_Mask_v6`/4) ORDER BY Net_mask_v6 DESC LIMIT 1",[ipV6.canonicalForm().replace(/:/gi,'')], function(err, result) {
      if (!err){ 
        if(result.length == 0)
          callback(0);
        else
          callback(result[0].ID_Group);
      }else{
        console.log('Error while performing Query.',err);
        callback(0);
      }
    });
  }
  else
    var query = connection.query(query = "SELECT ID_Group FROM `Users` WHERE inet_aton( ? ) BETWEEN inet_net(Net_ID,Net_Mask) AND inet_bc(Net_ID,Net_Mask) ORDER BY Net_mask DESC LIMIT 1",[ip], function(err, result) {
      if (!err){ 
        if(result.length == 0)
          callback(0);
        else
          callback(result[0].ID_Group);
      }else{
        console.log('Error while performing Query.',err);
        callback(0);
      }
    });
  connection.end();
}
