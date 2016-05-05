module.exports = function (callback){

  var connection = require('./mysql_connection')();
  var scp = require('scp');
  var ip = require('ip');
  var macParser = require('mac-address');
  var fs = require('fs');
  var exec = require('ssh-exec')

  var filename = '30_telefony_fromIdefixTEST.conf';
  
  var options = {
    file: filename,
    user: 'root',
    host: 'router.gjh.sk',
    port: '22',
    path: '/etc/dhcp/include',
    command: '/usr/local/bin/d-restart'
  };
  
  var query = 'SELECT Login, Description,  INET_NTOA( IP ) as IP FROM `Phones` WHERE Softphone = 0';

  var query = connection.query(query, function(err, result) {
    if (!err){ 
      var wstream = fs.createWriteStream(filename);
      result.forEach(function(row){
        var host = row.Description.replace(/[\s_]/, "-")+"-tel";
        var IP = row.IP;
        var mac = macParser.toString(new Buffer(row.Login.match(/.{1,2}/g)));

        wstream.write('\t host '+host+' { \n');
        wstream.write('\t\t hardware ethernet '+mac+';\n');
        wstream.write('\t\t fixed-address '+IP+';\n');
        wstream.write('\t } \n\n');

      });
      wstream.end();

      scp.send(options, function (err) {
        if (!err){
          fs.unlink(filename);
          exec(options.command, options, function (err, stdout, stderr) {
            if(!err)
              callback();
            else{
              callback('Error');
              console.log(err);
            }
          });
        }
        else{
          callback('Error');
          console.log(err);
          fs.unlink(filename);
        }
      });
    }else{
      console.log('Error while performing Query.',err);
      callback('Error');
    }
    connection.end();
  });
}
