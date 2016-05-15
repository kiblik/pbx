var pager = 0;

$( document ).ready(function() {
  $( "#dateFrom" ).datepicker();
  $( "#dateTo" ).datepicker();
});


function cdr_search(){
  var param = {};
  dateFrom = $('#dateFrom').val();
  if(dateFrom != '')
    param.dateFrom = dateFrom;
  dateTo = $('#dateTo').val();
  if(dateTo != '')
    param.dateTo = dateTo;
  src = $('#src').val();
  if(src != '')
    param.src = src;
  dst = $('#dst').val();
  if(dst != '')
    param.dst = dst;
  disposition = $('#disposition').val();
  if(disposition != '')
    param.disposition = disposition;
  billsecFrom = $('#billsecFrom').val();
  if(billsecFrom != '')
    param.billsecFrom = billsecFrom;
  billsecTo = $('#billsecTo').val();
  if(billsecTo != '')
    param.billsecTo = billsecTo;
  param.page = pager;
  console.log('cdr_search',param);
  socket.emit('cdr_search', param);
};
function updatePager(dir){
  pager += dir;
  cdr_search()
}
