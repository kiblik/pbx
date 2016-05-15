module.exports = function (perm, param, IP, callback){

  var dateFormat = require('dateformat');

  function localSearch(param, callback){
    par = [];
    val = [];
    for (var p in param) {
      switch (p) {
        case 'exts':
          par.push('(Exts in ?)');
          val.push(param.exts);
          break;
        case 'dateFrom':
          par.push('(date(calldate) >= date(?))');
          val.push(dateFormat(new Date(param.dateFrom),"yyyy-mm-dd"));
          break;
        case 'dateTo':
          par.push('(date(calldate) <= date(?))');
          val.push(dateFormat(new Date(param.dateTo),"yyyy-mm-dd"));
          break;
        case 'src':
          par.push('(src like ?)');
          val.push('%'+param.src+'%');
          break;
        case 'dst':
          par.push('(dst like ?)');
          val.push('%'+param.dst+'%');
          break;
        case 'disposition':
          par.push('(disposition like ?)');
          val.push(param.disposition);
          break;
        case 'billsecFrom':
          par.push('(billsec >= ?)');
          val.push(param.billsecFrom);
          break;
        case 'billsecTo':
          par.push('(billsec <= ?)');
          val.push(param.billsecTo);
          break;
      };
    };
    where = par.join(' AND ');
    if(where != '')
      where = 'WHERE '+where;
    if(param.page){
      page = '?,';
      val.push(param.page*20);
    }
    else 
      page = '';
      
    var query = connection.query('SELECT date_format(calldate,"%e.%c.%Y %T") as date, src, dst, disposition,billsec  FROM `cdr` '+where+' ORDER BY  `calldate` DESC  LIMIT '+page+'20', val,function(err, rows, fields) {
      console.log(query.sql);
      if (!err){      
        //console.log(rows);
        callback({fields: fields, rows: rows});
      }else{
        console.log('Error while performing Query.',err);
      }
      connection.end();
    });
  } 

  var connection = require('./../utils/mysql_connection')();
  if(perm < 2)
    var query = connection.query('SELECT Ext FROM Users as u JOIN Phones as p ON u.ID_Phone = p.ID JOIN Ext2Phones as e2p ON e2p.ID_Phone = p.ID JOIN Exts as e ON e.ID = e2p.ID_Ext WHERE inet_aton( ? ) BETWEEN inet_net(Net_ID,Net_Mask) AND inet_bc(Net_ID,Net_Mask)', IP, function(err, rows, fields) {
      if (!err || (rows.length == 0)){ 
        param.exts = [];
        rows.forEach(function(val){
          param.exts.push(val.Ext );
        });
        localSearch(param,callback);
      }else{
        console.log('Error while performing Query. Or empty result',err);
        connection.end();
      }
    });
  else  
    localSearch(param,callback);
}
