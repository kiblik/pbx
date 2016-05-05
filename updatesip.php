Staring updatesip
<pre>
<?php
//$db=mysql_connect('localhost','asterisk','sQSeLEDGYV7NHTSy');
mysql_select_db('asterisk');
$myfile = fopen("/etc/asterisk/sip.conf", "w") or die("Unable to open file!");
$header = file_get_contents ( "/etc/asterisk/sip_header.conf");
fwrite($myfile, $header);
$sql = "select * from `accounts`";
($result = mysql_query($sql)) || die(mysql_error());
while($row = mysql_fetch_array($result)){
	$sql = "select group_concat(distinct concat('SIP/', `name`) separator '&') as list
from `groups_members`
where `id` in
(select `id` 
from `groups_members`
where `name`='".$row['name']."')
";
	($result_pickup = mysql_query($sql)) || die(mysql_error());
	$row_pickup = mysql_fetch_array($result_pickup);
	if(@strlen($row_pickup['list'])==0)
		$pickup = "SIP/".$row['name'];
	else
		$pickup = $row_pickup['list'];
	$sql = "SELECT `groups_name`.`description`,`groups_name`.`extension` FROM `groups_name` JOIN `groups_members` ON `groups_name`.`id`=`groups_members`.`id` WHERE `name`='".$row['name']."'";
	($result_group = mysql_query($sql)) || die(mysql_error());
	$row_group = mysql_fetch_array($result_group);
	if(@strlen($row_group['extension'])==0) {
		$group_num = $row['extension'];
                $group_name = $row['description'];
	} else {
		$group_num = $row_group['extension'];
		$group_name = $row_group['description'];
	}
	$description = $row['description'];
	$ext = $row['extension'];
	$name = $row['name'];
	$prototyp = $row['prototyp'];
	$pass = $row['pass'];
	$txt = "
;$description
[$name]($prototyp)
secret=$pass
callerid=\"$description\" <$ext>
setvar=PICKUP=$pickup
setvar=GROUPNUM=$group_num
setvar=GROUPNAME=$group_name
";
	fwrite($myfile, $txt);
}

fclose($myfile);
//readfile("/etc/asterisk/sip.conf");
//mysql_close($db);

system('/usr/sbin/asterisk -rvvvvx "sip reload"')."\n";
?>
</pre>
Ending updatesip<br>
