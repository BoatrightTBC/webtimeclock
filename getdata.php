<?
require_once("settings.php");
require_once("utils.php");
require_once("JSON.php");



if(isset($_REQUEST['get'])) {
	if(!checkLogin())
		showLogin();
	if(isset($_GET['sidx']))
		$sidx = $_GET['sidx']; // get index row - i.e. user click to sort
	else
		$sidx = 1;
	if(isset($_GET['sord']))
		$sord = $_GET['sord']; // get the direction if(!$sidx)
	else
		$sord = 'asc';

	if($_REQUEST['get']=='users')
		print wrapRows(getUsers($sidx, $sord));
	if($_REQUEST['get']=='trans')
		print wrapRows(getTransactions($_REQUEST['user'], $sidx, $sord));
	if($_REQUEST['get']=='jobs') {
		if(isset($_REQUEST['user']))
			print wrapRows(getJobs($_REQUEST['user'], $sidx, $sord));
		else
			print wrapRows(getJobs(null, $sidx, $sord));
	}
	if($_REQUEST['get']=='employees') {
		if(isset($_REQUEST['user']))
			print wrapRows(getEmployees($_REQUEST['user'], $sidx, $sord));
		else
			print wrapRows(getEmployees(null, $sidx, $sord));
	}
	if($_REQUEST['get']=='templates') {
//jk		
//print wrapRows(getTemplates($_REQUEST['user'], $sidx, $sord));
		print wrapRows(getTemplates($_REQUEST['user'], $sidx, $sord, $_REQUEST['date']));
	}
	if($_REQUEST['get']=='single')
		print getSingle($_REQUEST['user']);
	if($_REQUEST['get']=='notimes')
		print getNoTimeCard($_REQUEST['user']);
}

function wrapRows($rows)
{
	$data = array();
	$data['page']=1;
	$data['total']=1;
	$data['records']=count($rows);
	$data['rows']=$rows;
	$json = new Services_JSON();
	return $json->encode($data);
}

function getUsers($sidx, $sord)
{
	global $db_server, $db_user, $db_pass, $db_database, $STRINGS, $LANG;
	if(!$_SESSION['admin']) 
		die($STRINGS[$LANG]['admin_error']);
	$mysqli = new mysqli($db_server, $db_user, $db_pass, $db_database);
	if (mysqli_connect_errno()) {
    	printf("Connect failed: %s\n", mysqli_connect_error());
	    exit();
	}
	if($result = $mysqli->query("SELECT uid, password, trainer, default_time_in as time_in, default_time_out as time_out, administrative as admin FROM users ORDER BY $sidx $sord")) {
		$rows = array();
		while($row = $result->fetch_assoc()) {
			$row['act']="<button onclick='window.location.href=\"edit_employees.php?user={$row['uid']}\"'>{$STRINGS[$LANG]['employees']}</button> <button onclick='window.location.href=\"edit_jobs.php?user={$row['uid']}\"'>{$STRINGS[$LANG]['jobs']}</button>";
			$rows[]=$row;
		}
		$result->free();
	} else
		print $mysqli->error;
	$mysqli->close();
	return $rows;
}

function getSingle($uid)
{
	global $db_server, $db_user, $db_pass, $db_database, $STRINGS, $LANG;
	if(!checkPermissions($uid)) {
		print $STRINGS[$LANG]['no_auth'];
		return;
	}
	$mysqli = new mysqli($db_server, $db_user, $db_pass, $db_database);
	if (mysqli_connect_errno()) {
    	printf("Connect failed: %s\n", mysqli_connect_error());
	    exit();
	}
	//get defaults
	$data = array();
	$query = "SELECT trainer, default_time_in as time_in, default_time_out as time_out FROM users WHERE uid='$uid'";
	if(!($result = $mysqli->query($query)))
		die($mysqli->error);
	$data['defaults'] = $result->fetch_assoc();
	$result->free();
	$mysqli->close();
	$data['jobs'] = getJobs($uid, 'jobcode', 'asc');
	$sidx = 'empname';
	$data['employees'] = getEmployees($uid, 'emplno', 'asc');
	$json = new Services_JSON();
	return $json->encode($data);
}

function getNoTimeCard($uid)
{
	global $db_server, $db_user, $db_pass, $db_database, $STRINGS, $LANG;
	$mysqli = new mysqli($db_server, $db_user, $db_pass, $db_database);
	if (mysqli_connect_errno()) {
    	printf("Connect failed: %s\n", mysqli_connect_error());
	    exit();
	}
	$query = "
		SELECT emplno, empname
		FROM clients JOIN users ON (clients.uid=users.uid)
		WHERE clients.uid='$uid' AND emplno NOT IN
			(SELECT emplno 
			FROM transactions
			WHERE uid='$uid' AND sent=false)
	";
	if($result = $mysqli->query($query)) {
		$rows = array();
		while($row = $result->fetch_assoc()) {
			$rows[]=$row;
		}
		$result->free();
	} else
		print $mysqli->error;
	$mysqli->close();
	$json = new Services_JSON();
	return $json->encode($rows);
}

function getJobs($uid, $sidx, $sord)
{
	global $db_server, $db_user, $db_pass, $db_database, $STRINGS, $LANG;
	if(!checkPermissions($uid)) {
		print $STRINGS[$LANG]['no_auth'];
		return;
	}
	$mysqli = new mysqli($db_server, $db_user, $db_pass, $db_database);
	if (mysqli_connect_errno()) {
    	printf("Connect failed: %s\n", mysqli_connect_error());
	    exit();
	}
	$where_clause = '';
	if($uid!==null)
		$where_clause = "WHERE jobs.uid='$uid'";
	$query = "
		SELECT uid, jobcode, pay_meth, task_descr
		FROM jobs 
		$where_clause
		ORDER BY $sidx $sord";
	if($result = $mysqli->query($query)) {
		$rows = array();
		while($row = $result->fetch_assoc()) {
			$rows[]=$row;
		}
		$result->free();
	} else
		print $mysqli->error;
	$mysqli->close();
	return $rows;
}

function getEmployees($uid, $sidx, $sord)
{
	global $db_server, $db_user, $db_pass, $db_database, $STRINGS, $LANG, $empl_order;
	if(!checkPermissions($uid)) {
		print $STRINGS[$LANG]['no_auth'];
		return;
	}
$mysqli = new mysqli($db_server, $db_user, $db_pass, $db_database);
	if (mysqli_connect_errno()) {
    	printf("Connect failed: %s\n", mysqli_connect_error());
	    exit();
	}
	$where_clause = '';
	if($uid!==null)
		$where_clause = "WHERE c.uid='$uid'";
        
	$query = "
		SELECT c.uid, c.emplno, c.empname, p.picture 
		FROM clients c left outer join clientpics p on c.EmplNo = p.EmplNo 
		$where_clause
		ORDER BY $empl_order";
	if($result = $mysqli->query($query)) {
		$rows = array();
		while($row = $result->fetch_assoc()) {
			$rows[]=$row;
		}
		$result->free();
	} else
		print $mysqli->error;
	$mysqli->close();
	return $rows;
}

function getTransactions($uid, $sidx, $sord)
{
	global $db_server, $db_user, $db_pass, $db_database, $STRINGS, $LANG;
	if(!checkPermissions($uid)) {
		print $STRINGS[$LANG]['no_auth'];
		return;
	}
	$mysqli = new mysqli($db_server, $db_user, $db_pass, $db_database);
	if (mysqli_connect_errno()) {
    	printf("Connect failed: %s\n", mysqli_connect_error());
	    exit();
	}
	$where_clause = '';
	if($uid!==null)
		$where_clause = "WHERE transactions.uid='$uid' AND sent=false";
	else
		$where_clause = "WHERE sent=false";
	$query = "
		SELECT tid, date, time_in, time_out, transactions.trainer, transactions.emplno, empname, jobcode, units, workorder, error, sent
		FROM transactions JOIN clients ON(transactions.uid=clients.uid AND transactions.emplno=clients.emplno)
		$where_clause
		ORDER BY $sidx $sord, emplno, date, time_in, time_out ";
	$rows = array();
	if($result = $mysqli->query($query)) {
		while($row = $result->fetch_assoc()) {
			$rows[]=$row;
		}
		$result->free();
	} else
		print $mysqli->error;
	$mysqli->close();
	return $rows;
}

function getTemplates($uid, $sidx, $sord, $date)
{
	global $db_server, $db_user, $db_pass, $db_database, $STRINGS, $LANG;
	if(!checkPermissions($uid)) {
		print $STRINGS[$LANG]['no_auth'];
		return;
	}
	$mysqli = new mysqli($db_server, $db_user, $db_pass, $db_database);
	if (mysqli_connect_errno()) {
    	printf("Connect failed: %s\n", mysqli_connect_error());
	    exit();
	}
	$where_clause = '';
	$query = "
		SELECT id, time_in, time_out, trainer, jobcode, units, workorder
		FROM templates
		WHERE uid='$uid'
		ORDER BY $sidx $sord";
	if($result = $mysqli->query($query)) {
		$rows = array();
		while($row = $result->fetch_assoc()) {
			$rows[]=$row;
		}
		$result->free();
	} else
		print $mysqli->error;
	$mysqli->close();
	return $rows;
}
