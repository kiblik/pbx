var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', async function(req, res, next) {
  //TODO Doriesit opravnenia len na telefony 
  var connection = require('./../utils/mysql_connection')();

  function query(sql, values) { return new Promise((resolve, reject) => {
    connection.query(sql, values, (err, rows, fields) => {
      if(err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  })};

  // Overit, ci existuje telefon s adresou klienta z requestu
  var validation;
  try {
    validation = await query("SELECT 1 FROM Phones WHERE IP = INET_ATON(?)", req.headers['x-forwarded-for']);
  } catch (error) {
    console.log('Error while performing Query.');
    next(err, req, res);
    connection.end();
    return;
  }
  
  if(validation.length <= 0) {
    res.send('');
    return;
  }

  var params = new Map();
  var defaults = await query("SELECT * FROM Defaults");
  defaults.forEach((item) => params[item.CiscoKey] = item.Value);

  var phoneInfo = await query("SELECT * FROM Phones WHERE IP=INET_ATON(?)", req.headers['x-forwarded-for']);
  var id = phoneInfo[0].ID;

  var specials = await query("SELECT * FROM Specials WHERE ID_Phone=?", id);
  specials.forEach((item) => params[item.CiscoKey] = item.Value);
  params["HostName"] = phoneInfo[0].Login;
  params["Station_Name"] = params["Display_Name_1_"] = phoneInfo[0].Description;
  params["User_ID_1_"] = phoneInfo[0].Login;
  params["Password_1_"] = phoneInfo[0].Password;

  var extension = await query("SELECT Ext FROM Ext2Phones INNER JOIN Exts ON Ext2Phones.ID_Ext=Exts.ID WHERE ID_Phone=?", id);
  params["Extension_1_"] = params["Short_Name_1_"] = extension[0]['Ext'];

  var builder = require('xmlbuilder');
  var xml = builder.create('flat-profile')
    .att({ 'xmlns': 'http://www.sipura.net/xsd/SPA50x-30x-SIP', 'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance' });
  
  res.set('Content-Type', 'text/xml');
  for (var k in params) {
    xml.ele(k, params[k]);
  }
  res.send(xml.end({ /*  pretty: true,*/ allowEmpty: true}));

});

module.exports = router;
