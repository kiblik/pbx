module.exports = function (callback){

  var connection = require('./mysql_connection')();
  var ami = require('./asterisk_connection')();
  var scp = require('scp');
  var fs = require('fs-extra')


  var filename = 'extensions.conf';
  
  var options = {
    file: filename,
    user: 'root',
    host: 'idefix.gjh.sk',
    port: '22',
    path: '/etc/asterisk/extensions.conf'
  };
  try { 
    fs.copySync('headers/'+filename, filename);
    var query = "SELECT E.Ext as Ext, E.Name as Description, group_concat(concat('SIP/',P.Login) separator '&') as Dial, E.Scenario as Scenario FROM Exts as E RIGHT JOIN Ext2Phones as E2P ON E.ID=E2P.ID_Ext JOIN Phones as P ON E2P.ID_Phone=P.ID WHERE E.Scenario is NULL GROUP BY E.ID ORDER BY E.Ext";

    var query = connection.query(query, function(err, result) {
      if (!err){ 
        var wstream = fs.createWriteStream(filename,{'flags': 'a'});
        result.forEach(function(row){

          ext = row.Ext
          description = row.Description;
          dial = row.Dial;
          wstream.write('; '+description+' \n');
          wstream.write('exten => '+ext+',1,Dial('+dial+')\n');
          wstream.write('   same => n,Hangup()\n\n');

        });
        var query = "SELECT GROUP_CONCAT(concat('SIP/',Login) ORDER BY Login SEPARATOR '&') as gs FROM `Phones`;";
        var query = connection.query(query, function(err, result) {
          if (!err){ 
            wstream.write('; broadcast call\n');
            wstream.write('exten => 900,1,SIPAddHeader(Call-Info:\\;answer-after=0)\n');
            wstream.write('   same => n,Page('+result[0].gs+')\n');
            wstream.write('   same => n,Hangup()\n');
            wstream.end();
            scp.send(options, function (err) {
              if (!err){
                fs.unlink(filename);
                ami.action( 'reload', null, function(data){
                  if(data.Response == 'Error'){
                    callback('Error');
                    console.log('reload', data.Message);
                  }
                  else
                     callback();
                });
              }
              else{
                callback('Error');
                console.log(err);
              }
            });
          }else{
            console.log('Error while performing Query.',err);
            callback('Error');
          }
        });
      }else{
        console.log('Error while performing Query.',err);
        callback('Error');
      }
      connection.end();
    });
  } catch(err) {
    console.error(err)
  }
}
