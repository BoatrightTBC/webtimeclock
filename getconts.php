<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $custcode = $_POST["custcode"];
    if ($custcode == '') {
      $select = "SELECT contcode,cntrct_nam FROM ptcont ";
    } else {
      $select = "SELECT contcode,cntrct_nam FROM ptcont WHERE substring(contcode,1,3) = '".$custcode. "' ";
    }
    $resultID = mysqli_query($db,$select);
    if(mysqli_num_rows($resultID) == 0 ) {	
      echo("No customers with Contracts defined as Time Clock Contracts.  Procedure cancelled.");
    } else {
      if(mysqli_num_rows($resultID) > 25) {	
        echo("You have more than 25 contracts assigned to timeclock for this customer. I can't display them all. Please fix this.");
      } else {
	    $rows = array();
	    while($r = mysqli_fetch_assoc($resultID)) {
    	  $rows[] = $r;
	    }	    
	    print json_encode($rows);	    
      }
    }
    return;
?>    
