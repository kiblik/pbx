var query = " \
SELECT CiscoKey, Value  \
FROM ( \
  SELECT CiscoKey, Value \
  FROM ( \
    SELECT CiscoKey, Value, 0 as Source \
    FROM Defaults \
 \
    UNION \
       \
    SELECT CiscoKey, Value, 1 as Source \
    FROM Specials \
    WHERE ID_Phone = ( \
      SELECT ID \
      FROM Phones \
      WHERE IP = INET_ATON(?) \
    ) \
  ) as T \
  ORDER BY Source DESC \
) as T \
GROUP BY CiscoKey \
ORDER BY CiscoKey";  


var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  //TODO Doriesit opravnenia len na telefony 
  var connection = require('./../utils/mysql_connection')();

  connection.query("SELECT 1 FROM Phones WHERE IP = INET_ATON(?)", req.headers['x-forwarded-for'], function(err, rows, fields) {
    if (!err){ 
      if(rows.length > 0){
        connection.query(query, req.headers['x-forwarded-for'], function(err, rows, fields) {
          if (!err){ 
            var builder = require('xmlbuilder');
            var xml = builder.create('flat-profile')
              .att({ 'xmlns': 'http://www.sipura.net/xsd/SPA50x-30x-SIP', 'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance' });       
            rows.forEach(function(item){
              var item = xml.ele(item.CiscoKey, item.Value);
            });
            res.send(xml.end({ /*  pretty: true,*/ allowEmpty: true}));
          }else{
            console.log('Error while performing Query.');
            next(err, req, res);
          }
        });
      }
      else
        res.send('');
    }else{
      console.log('Error while performing Query.');
      next(err, req, res);
    }
    connection.end();    
  });


});

module.exports = router;
