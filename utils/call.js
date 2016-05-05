module.exports = function (userIP, number,callback){

  ami = require('./asterisk_connection')();

  var connection = require('./mysql_connection')();
  
  var query = 'SELECT p.Login FROM `Users` as u  JOIN Phones as p ON p.ID = u.ID_Phone WHERE inet_aton( ? )  BETWEEN inet_net(Net_ID,Net_Mask) AND inet_bc(Net_ID,Net_Mask) ORDER BY Net_mask DESC LIMIT 1';

  var query = connection.query(query,[userIP], function(err, result) {
    if (!err){
        data = { Channel: 'SIP/'+result[0].Login, Context: 'Local', Priority: 1, Async: 'false', Exten: number};
        console.log('Trying originate', data);
        ami.action( 'Originate', data, function(data){
          if(data.Response == 'Error'){
            callback('Error');
            console.log('Originate', data.Message);
          }
          else
             callback();
        });
    }
    else{
      console.log('Error while performing Query.',err);
      callback('Error');
    }
    connection.end();
  });
}

