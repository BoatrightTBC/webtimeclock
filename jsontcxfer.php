<?php
require_once("include_connect.php");
require_once("JSON.php");

$db_server = 'localhost';
$db_user = 'john';
$db_pass = 'john';
$db_database = 'tbctimeclock';

	$lcJSON = $_POST['JSON'];
	$lcJSON = stripslashes($lcJSON);
	$json = new Services_JSON();
	$value = $json->decode($lcJSON);

	//print ("Got it:".$value->rec1->empcount);

	$jsonuser = $value->jsonuser;
	$jsonpass = $value->jsonpass;

	$ini_array = parse_ini_file ("webpass.txt");
	if ($ini_array['jsonuserid'] != $jsonuser or $ini_array['jsonpasswd'] != $jsonpass) {
		$mess = "Login Failed. \n\nJSONUser sent: *".$jsonuser."*, JSON User On Site: ".$ini_array['jsonuserid']." \nJSONPass sent: *".$jsonpass."*, JSON Pass On Site: ".$ini_array['jsonpasswd']."\n\n ";
		print $mess;
		print '\nHere is what was in _POST';
		print_r($_POST['JSON']);
		return;
	}

$records = $value->records;

//update clients and jobs for each uid in clients and jobs tables. 
if (sizeof($records) > 0 ) {
	global $db_server, $db_user, $db_pass, $db_database, $STRINGS, $LANG;
	$mysqli = new mysqli($db_server, $db_user, $db_pass, $db_database);
	if (mysqli_connect_errno()) {
		printf("ERROR LJK41: Connect failed: %s\n", mysqli_connect_error());
		exit();
	}
	
	$lnSource = 0;
	
	$selectcs = "SELECT cardsource FROM magic ";
	
	if($result = $mysqli->query($selectcs)) {
		while($row = $result->fetch_assoc()) {
			$lnSource=$row['cardsource'];
			break;
		}
		$result->free();
	} else {
		print  "ERROR: L118 " . $mysqli->error . "\n\nQuery: \n\n" . $selectcs;
		return;
	}
	
	foreach($records as $record){	// Main Loop
		$lcLine = '';
		
//PTEMPL and PTCARDS, Delete and then Insert
		if (sizeof($record->emps) > 0) {
 			$lcQuery = "DELETE FROM ptempl";
 			
 			if (!$mysqli->query($lcQuery)) {
 				print "ERROR: L55 " . $mysqli->error;
 				return;
 			}
			
			$lcQuery = "DELETE FROM ptcards WHERE ismgr = 0";
			
			if (!$mysqli->query($lcQuery)) {
				print "ERROR: L55 " . $mysqli->error;
				return;
			}
			
			foreach($record->emps as $emp){
				$lcLine .= "('".mysqli_real_escape_string($db, $emp->prempl)."','".addslashes(mysqli_real_escape_string($db, $emp->prfirst))."','".addslashes(mysqli_real_escape_string($db, $emp->prlast))."','".mysqli_real_escape_string($db, $emp->supeid)."', '".mysqli_real_escape_string($db, $emp->text3)."'),\n";	
				switch ($lnSource) {
					case 1:
					$lcLineCard .= "('".mysqli_real_escape_string($db, $emp->prempl)."','".mysqli_real_escape_string($db, $emp->prempl)."','".addslashes(mysqli_real_escape_string($db, $emp->prfirst))."','".addslashes(mysqli_real_escape_string($db, $emp->prlast))."',0, '".mysqli_real_escape_string($db, $emp->text3)."',now()),\n";	
					break;
					
					case 2:
					$lcLineCard .= "('".mysqli_real_escape_string($db, $emp->text3)."','".mysqli_real_escape_string($db, $emp->prempl)."','".addslashes(mysqli_real_escape_string($db, $emp->prfirst))."','".addslashes(mysqli_real_escape_string($db, $emp->prlast))."',0, '".mysqli_real_escape_string($db, $emp->text3)."',now()),\n";	
					break;
					
					case 3:
					$lcLineCard .= "('','".mysqli_real_escape_string($db, $emp->prempl)."','".mysqli_real_escape_string($db, $emp->prempl)."','".addslashes(mysqli_real_escape_string($db, $emp->prfirst))."','".addslashes(mysqli_real_escape_string($db, $emp->prlast))."',0, '".mysqli_real_escape_string($emp->text3)."',now()),\n";	
					break;					
				}
			}
			if (strlen($lcLine) > 0) {
				$lcInsert = "INSERT INTO ptcards (cardno, prempl, prfirst, prlast, ismgr, text3, adddate) VALUES ";
				$lcLineCard = rtrim($lcLineCard);
				$lcLineCard = rtrim($lcLineCard, ',').";";
				
 				if (!$mysqli->query($lcInsert . $lcLineCard)) {
 					print "ERROR: L66 " .  $mysqli->error;
 					return;
 				}
			}
			
			if (strlen($lcLineCard) > 0) {
				$lcInsert = "INSERT INTO ptempl (prempl, prfirst, prlast, supeid, text3) VALUES ";
				$lcLine = rtrim($lcLine);
				$lcLine = rtrim($lcLine, ',').";";
				
 				if (!$mysqli->query($lcInsert . $lcLine)) {
 					print "ERROR: L66 " .  $mysqli->error;
 					return;
 				}
			}
		}

// PTCUST, PTCONT, PTTASK - Delete and then Insert				
		$lcLineTask = '';
		$lcLineCont = '';
		$lcLineCust = '';
		if (sizeof($record->jobs) > 0) {
			$lcQuery = "DELETE FROM pttask";
			if (!$mysqli->query($lcQuery)) {
				print "ERROR: L75 " .  $mysqli->error;
				return;
			}

			$lcQuery = "DELETE FROM ptcont";
			if (!$mysqli->query($lcQuery)) {
				print "ERROR: L75 " .  $mysqli->error;
				return;
			}

			$lcQuery = "DELETE FROM ptcust";
			if (!$mysqli->query($lcQuery)) {
				print "ERROR: L75 " .  $mysqli->error;
				return;
			}
			
			$lnCntr = 0;
			foreach($record->jobs as $job){
				$trans = array("'" => "", '"' => "");		
				$tDesc = strtr($job->task_desc, $trans);
				$taskcode = $job->taskcode;
				$contcode = substr($taskcode, 0, 6);
				$custcode = substr($taskcode, 0, 3);

				$lcLineTask .= "('".$job->jobcode."','".$job->pay_meth."','".$job->taskcode."','".addslashes($tDesc)."'),\n";		
				$lcLineCont .= "('".$contcode."','".addslashes($job->cntrct_nam)."'),\n";
				$lcLineCust .= "('".$custcode."','".$custcode."','".addslashes($job->co_name)."'),\n";		
			}
// PTTASK HERE			
			if (strlen($lcLineTask) > 0) {
				$lcInsert3 = "INSERT INTO pttask (Jobcode, Pay_meth, Taskcode, Task_desc ) VALUES ";
				$lcLine3 .= rtrim($lcLineTask);
				$lcLine3 .= rtrim($lcLine3, ',').";";
				if (!$mysqli->query($lcInsert3 . $lcLine3)) {
					print "ERROR: PTTASK " .  $mysqli->error;
					return;
				}
				$lcRemoveDupes = "DELETE FROM pttask WHERE id NOT IN (SELECT * FROM (SELECT MIN(id) FROM pttask n GROUP BY taskcode) x)";
				if (!$mysqli->query($lcRemoveDupes)) {	// Just to be safe
					print "ERROR: PTCONT DUPES " .  $mysqli->error;
					return;
				}
			}
			
// PTCONT HERE			
			if (strlen($lcLineCont) > 0) {
				$lcInsert4 = "INSERT INTO ptcont (contcode, cntrct_nam) VALUES ";
				$lcLine4 .= rtrim($lcLineCont);
				$lcLine4 .= rtrim($lcLine4, ',').";";

				if (!$mysqli->query($lcInsert4 . $lcLine4)) {
					print "ERROR: PTCONT " .  $mysqli->error;
					return;
				}
				
				$lcRemoveDupes = "DELETE FROM ptcont WHERE id NOT IN (SELECT * FROM (SELECT MIN(id) FROM ptcont n GROUP BY contcode) x)";
				if (!$mysqli->query($lcRemoveDupes)) {
					print "ERROR: PTCONT DUPES " .  $mysqli->error;
					return;
				}
			}
// PTCUST HERE			
			if (strlen($lcLineCust) > 0) {
				$lcInsert5 = "INSERT INTO ptcust (custno, cust_no, co_name) VALUES ";
				$lcLine5 .= rtrim($lcLineCust);
				$lcLine5 .= rtrim($lcLine5, ',').";";
				if (!$mysqli->query($lcInsert5 . $lcLine5)) {
					print "ERROR: PTCUST " .  $mysqli->error;
					return;
				}
				$lcRemoveDupes = "DELETE FROM ptcust WHERE id NOT IN (SELECT * FROM (SELECT MIN(id) FROM ptcust n GROUP BY cust_no) x)";
				if (!$mysqli->query($lcRemoveDupes)) {
					print "ERROR: PTCONT DUPES " .  $mysqli->error;
					return;
				}
			}
		}
	}
	$mysqli->close();
} else {
	print "ERROR: Upload of emps and jobs failed. Unable to parse the upload.";
	return;
}

//NOW GET PTTIME
$getTran = "SELECT * FROM pttime WHERE sent = 1 ORDER BY workdate, prempl, timein";

$rows = "";
$mysqli = new mysqli($db_server, $db_user, $db_pass, $db_database);
if (mysqli_connect_errno()) {
	printf( "ERROR: L108 " . "Connect failed: %s\n", mysqli_connect_error());
	exit();
}
if($result = $mysqli->query($getTran)) {
	$rows = array();
	while($row = $result->fetch_assoc()) {
		$rows[]=$row;
	}
	$result->free();
} else {
	print  "ERROR: L118 " . $mysqli->error . "\n\nQuery: \n\n" . $getTran;
	return;
}

$lcJsonTrans = json_encode($rows);

$lcMoveToHist = "No";
//$lcMoveToHist = "Yes";

if ($lcMoveToHist == "Yes") {
	$lcQuery =  "INSERT INTO ";
	$lcQuery .= "`old_pttime` (`PREMPL`, `WORKDATE`, `SUPEID`, `JOBCODE`, `TIMEIN`, `TIMEOUT`, `WORK_ORDER`, `ADDDATE`, `OUTTIME`, `sent`) ";
	$lcQuery .= "(SELECT `PREMPL`, `WORKDATE`, `SUPEID`, `JOBCODE`, `TIMEIN`, `TIMEOUT`, `WORK_ORDER`, `ADDDATE`, `OUTTIME`, `sent` ";
	$lcQuery .= "FROM pttime WHERE sent = 1)";
	
	
	$lcQuery2 = "DELETE FROM pttime WHERE sent = 1";
	
	if (!$mysqli->query($lcQuery)) {
		print  "ERROR: L136 " . $mysqli->error . '\n\nQuery\n\n' . $lcQuery;
		return;
	}	

	if (!$mysqli->query($lcQuery2)) {
		print  "ERROR: L140 " . $mysqli->error;
		return;
	}	
}
$mysqli->close();

//   file_put_contents ("test.txt", $lcJsonTrans);
//   echo(var_dump ($records));
//    // return;	       

// everything worked, no errors, return the result of the transactions download 
print $lcJsonTrans;

?>
