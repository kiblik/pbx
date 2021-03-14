module.exports = function (callback){

  var connection = require('./mysql_connection')();
  var ami = require('./asterisk_connection')();
  var scp = require('scp');
  var fs = require('fs-extra')


  var filename = 'sip.conf';
  
  var options = {
    file: filename,
    user: 'root',
    host: 'idefix.gjh.sk',
    port: '22',
    path: '/etc/asterisk/test'
  };
  
  fs.copySync('headers/'+filename, filename);

  var query = "select p.description, p.login, p.prototype as phone_prototype, p.password, grps.group_name, grps.group_ext, grps.pickup from Phones as p join Ext2Phones as e2p on p.id = e2p.id_phone join Exts as e on e.id = e2p.id_ext join (select e.id as id, group_concat(distinct concat('SIP/',p.Login) separator '&') as pickup, e.name as group_name, e.ext as group_ext from Exts as e join Ext2Phones as e2p on e.id = e2p.id_ext join Phones as p on p.id = e2p.id_phone group by e.id order by group_ext) as grps on grps.id = e.id group by p.description, p.login, p.prototype, p.password, grps.group_name, grps.group_ext, grps.pickup";

  var query = connection.query(query, function(err, result) {
    if (!err){ 
      var wstream = fs.createWriteStream(filename,{'flags': 'a'});
      result.forEach(function(row){
        description = row.description;
        login = row.login;
        phone_prototype = row.phone_prototype;
        password = row.password;
        group_name = row.group_name;
        group_ext = row.group_ext;
        pickup = row.pickup;
        wstream.write('; '+description+' \n');
        wstream.write('['+login+']('+phone_prototype+')\n');
        wstream.write('secret='+password+' \n');
        wstream.write('callerid="'+description+'" <'+group_ext+'> \n');
        wstream.write('setvar=PICKUP='+pickup+' \n');
        wstream.write('setvar=GROUPNUM='+group_ext+' \n');
        wstream.write('setvar=GROUPNAME='+group_name+' \n');
      });
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
