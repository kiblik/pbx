var jade = require('jade');
var ff = require('./utils/fill_field');
var uf = require('./utils/update_field');
var ar = require('./utils/add_row');
var dr = require('./utils/del_row');
var call = require('./utils/call');
var search = require('./utils/dir_table');
var pc = require('./utils/permitions_checker');

module.exports = function(server){
  var io = require('socket.io')(server);

  io.on('connection', function (socket) {

    socket.on('get editor', function (data){
      console.log('get editor',data);
      IP = socket.handshake.headers['x-forwarded-for'];
      pc(IP,function(perm){
        if(perm < 3) return
        element = data.category+'_'+data.field+'_'+data.id;
        field = data.field;
        category = data.category;
        id = data.id;
        if(field=='Specials')
          element += '_Form'
        ff(category, field, id, function(value){
          console.log(value);
          new_content = jade.renderFile('views/editor.jade',{element: element, category: category, field: field, id: id, value: value});
          socket.emit('update element',{element: element, new_content: new_content});
        });      
      });
    });
    socket.on('update field',function (data){
      console.log('update field',data);
      IP = socket.handshake.headers['x-forwarded-for'];
      pc(IP,function(perm){
        if(perm < 3) return
        field = data.field;
        category = data.category;
        id = data.id;
        value = data.value;
        element = category+'_'+field+'_'+id;
        uf(category, field, id, value, function(){
          ff(category, field, id, function(value){
            new_content = jade.renderFile('views/default_field.jade',{element: element, category: category, field: { name: field}, row:{ ID: id}, value: value});
            socket.emit('update element',{element: element, new_content: new_content});
          });
        });  
      });
    });
    socket.on('get default',function (data){
      console.log('get default',data);
      IP = socket.handshake.headers['x-forwarded-for'];
      pc(IP,function(perm){
        if(perm < 3) return
        field = data.field;
        category = data.category;
        id = data.id;
        element = category+'_'+field+'_'+id;
        ff(category, field, id, function(value){
          new_content = jade.renderFile('views/default_field.jade',{element: element, category: category, field: { name: field}, row:{ ID: id}, value: value});
          socket.emit('update element',{element: element, new_content: new_content});
        });
      });  
    });
    socket.on('add row',function (data){
      console.log('add row',data);
      IP = socket.handshake.headers['x-forwarded-for'];
      pc(IP,function(perm){
        if(perm < 3) return
        category = data.category;
        values = data.values;
        ar(category, values, function(err){
            if(!err)
              socket.emit('reload page');
            else{
              errbanner = jade.renderFile('views/errbanner.jade',{errtext: err});
              console.log(errbanner);
              socket.emit('new error',{err: err, errbanner: errbanner});
            }
        });    
      });
    });
    socket.on('del',function (data){
      console.log('del',data);
      IP = socket.handshake.headers['x-forwarded-for'];
      pc(IP,function(perm){
        if(perm < 3) return
        category = data.category;
        id = data.id;
        dr(category, id, function(err){
            if(!err)
              socket.emit('reload page');
            else{
              errbanner = jade.renderFile('views/errbanner.jade',{errtext: err});
              socket.emit('new error',{err: err, errbanner: errbanner});
            }
        });
      });  
    });
    socket.on('update',function (data){
      console.log('update',data);
      IP = socket.handshake.headers['x-forwarded-for'];
      pc(IP,function(perm){
        if(perm < 3) return
        module = data.module;
        switch(module){
          case 'dhcp':
            require('./utils/update_dhcp')(function(err){
              if(!err){
                var msg = 'DHCP Updated';
                msgbanner = jade.renderFile('views/msgbanner.jade',{msgtext: msg});
                socket.emit('new message',{msg: msg, msgbanner: msgbanner});
              }
              else{
                var err = 'DHCP Error';
                errbanner = jade.renderFile('views/errbanner.jade',{errtext: err});
                socket.emit('new error',{err: err, errbanner: errbanner});
                console.log(err);
              }  
            });
            break;
          case 'exts':
            require('./utils/update_exts')(function(err){
              if(!err){
                var msg = 'Exts Updated';
                msgbanner = jade.renderFile('views/msgbanner.jade',{msgtext: msg});
                socket.emit('new message',{msg: msg, msgbanner: msgbanner});
              }
              else{
                var err = 'Exts Error';
                errbanner = jade.renderFile('views/errbanner.jade',{errtext: err});
                socket.emit('new error',{err: err, errbanner: errbanner});
                console.log(err);
              }  
            });
            break;
          default:
            var err = 'Error';
            errbanner = jade.renderFile('views/errbanner.jade',{errtext: err});
            socket.emit('new error',{err: err, errbanner: errbanner});
            console.log('UNKNOWN');
            break;
        }
      });  
    });
    socket.on('call',function(data){
      console.log('call',data);
      IP = socket.handshake.headers['x-forwarded-for'];
      pc(IP,function(perm){
        if(perm < 1) return
        if(call(IP, data.number,function(err){
          if(!err){
            var msg = 'Originate success';
            msgbanner = jade.renderFile('views/msgbanner.jade',{msgtext: msg});
            socket.emit('new message',{msg: msg, msgbanner: msgbanner});
          }
          else{
              var err = 'Error';
              errbanner = jade.renderFile('views/errbanner.jade',{errtext: err});
              socket.emit('new error',{err: err, errbanner: errbanner});
          };    
        }));
       });   
    });
    socket.on('search',function (data){
      console.log('search',data);
      str = data.str
      element = 'dir_table';
      search(str, function(value){
        new_content = jade.renderFile('views/dir_table.jade',{ fields: value.fields, rows: value.rows });
        socket.emit('update element',{element: element, new_content: new_content});
      });
    });
  });

  return io;
}
