<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $select = $_POST["select"];
    
    if (strpos($select, "CURDATE") > -1) {
      $lcSelect = str_replace(" AND (timein = '' OR timeout = '')", " ", $select);  //Change SELECT to DELETE
      $lcSelect = str_replace("SELECT id FROM pttime ", "UPDATE pttime SET sent = 1 ", $lcSelect);  //Change SELECT to DELETE
    } else {
	  $lcSelect = "UPDATE pttime SET sent = 1 WHERE sent = 0 ";
    }
    
//Final step, mark the records from pttime        
// REMOVE COMMENTING BELOW WHEN DONE TESTING
    $resultID = mysqli_query($db,$lcSelect); // Mark records
    if ($resultID) {
      $lnUpdate = mysqli_affected_rows($db);
    } else {
	  $lnUpdate = 0;
    }

    $message = strval($lnUpdate)." Records Exported to GAT.";
    echo ($message);
    return;

?>    
