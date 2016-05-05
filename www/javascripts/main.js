var socket = io.connect('https://pbx.gjh.sk');

socket.on('update element', function (data) {
  console.log(data);
  $('#'+data.element).html(data.new_content);  
});

socket.on('reload page', function(){
  console.log('reload page');
  location.reload();
});

socket.on('new error', function(data){
  console.log('error :',data.err);
  $('body').append(data.errbanner);
});

socket.on('new message', function(data){
  console.log('message :',data.msg);
  $('body').append(data.msgbanner);
});

function changeToEditable(category,field,id){
  console.log({ category: category, field: field, id: id });
  socket.emit('get editor', { category: category, field: field, id: id });
}

function updateField(category,field,id,element){
  console.log(element);
  socket.emit('update field', { category: category, field: field, id: id, value: $('#'+element).val() })
}

function getDefault(category,field,id){
  console.log(category,field,id);
  socket.emit('get default', { category: category, field: field, id: id });
}

function add(category){
  console.log('add:', category);
  switch(category){
    case 'Phones':
      Login = $('#new_Login').val();
      Password = $('#new_Password').val();
      Description = $('#new_Description').val();
      IP = $('#new_IP').val();
      Prototype = $('#new_Prototype').val();
      Softphone = $('#new_Softphone').val();
      values = {Login: Login, Password: Password, Description: Description, IP: IP, Prototype: Prototype, Softphone: Softphone};
      break;
    case 'Defaults':
      CiscoKey = $('#new_CiscoKey').val();
      Value = $('#new_value').val();  
      values = {CiscoKey: CiscoKey, Value: Value};
      break;
    case 'Exts':
      Ext = $('#new_Ext').val();
      Name = $('#new_Name').val();
      Scenario = $('#new_Scenario').val() || null; // ak nevyplni scenar, nech sa to posiela ako null
      values = {Ext: Ext, Name: Name, Scenario: Scenario};  
      break;
    case 'Users':
      Net_ID = $('#new_Net_ID').val();
      Net_mask = $('#new_Net_mask').val();
      ID_Group = $('#new_ID_Group').val();
      ID_Phone = $('#new_ID_Phone').val();
      Description = $('#new_Description').val();
      values = {Net_ID: Net_ID, Net_mask: Net_mask, ID_Phone: ID_Phone, ID_Group: ID_Group, Description: Description};  
      break;

  }    
  socket.emit('add row', { category: category, values: values});
}

function del(category,id){
  console.log('del',category,id);
  socket.emit('del', { category: category, id: id });
}

function update(module) {
  console.log('update',module);
  socket.emit('update', { module: module });
}

function call(number) {
  console.log('call',number);
  socket.emit('call', { number: number });
}

function search() {
  var str = $('#dir_search').val()
  console.log('search',str);
  socket.emit('search', { str: str });
}
