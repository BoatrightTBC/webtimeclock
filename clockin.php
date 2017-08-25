<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $jobtask = $_POST["jobcode2"];    
    $jobtaskarray = explode("|", $jobtask);
    $jobcode = $jobtaskarray[0];
    $task_desc = $jobtaskarray[1];
    
    $prempl = $_POST["prempl"];
    $timein = $_POST["timein"];
    $supeid = $_POST["supeid"];  
    $timein1 = substr($timein, 0, 2).substr($timein, 3, 2);
    
    $select = "SELECT pttime.* FROM pttime WHERE pttime.prempl = '".mysqli_real_escape_string($db, $prempl)."' AND timeout = '' AND adddate > DATE_SUB(NOW(),INTERVAL 20 HOUR)";
    $resultID = mysqli_query($db,$select);

    if ($resultID) {
	    if(mysqli_num_rows($resultID) > 0) {	
	        // Clock Out
	      $lnMess = "";	    
	      while ($row = mysqli_fetch_assoc($resultID)) {
	  	    $key = (string)$row['ID'];
	        $select = "UPDATE pttime SET timeout = '".mysqli_real_escape_string($db, $timein1)."', outtime = now() WHERE pttime.id = ".$key." ";
	        $resultID1 = mysqli_query($db,$select);
	        if ($resultID1) {
		      $lcMess = "Clocked Out";
	        } else {
		      $lcMess = "Time Out Insert failed";
		      break;
	        }
	      }
	      echo($lcMess);
	      return;
	    }
    }
    
// Otherwise Clock In
    $select = "INSERT INTO pttime (prempl, workdate, supeid, jobcode, timein, timeout, work_order, adddate) ".
		      "VALUES ('".
		       mysqli_real_escape_string($db, $prempl)."',now(),'".mysqli_real_escape_string($db, $supeid)."','".mysqli_real_escape_string($db, $jobcode)."','".mysqli_real_escape_string($db, $timein1)."','','',now())";

		       		       
//     file_put_contents ("test.txt", $select);
//     echo($select);
//     return;	       

    
    $resultID = mysqli_query($db,$select);
    if ($resultID) {
	  echo($task_desc);
    } else {
      echo("Insert Failed.");
    }
    return;
?>    
