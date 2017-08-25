<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $select = "SELECT cardno, prempl, prlast, prfirst, ismgr, id FROM ptcards ORDER BY 3, 4";
    
    $resultID = mysqli_query($db,$select);
    if(mysqli_num_rows($resultID) == 0) {	
      echo "Could not find any Cards";
      return;
    }
    $lnCount = mysqli_num_rows($resultID);
    
    $rows = array();
    $rows[0] = strval($lnCount)."|";
    while($r = mysqli_fetch_assoc($resultID)) {
	  $rows[] = $r;
    }
    
    print json_encode($rows);	    
    return;
?>    
