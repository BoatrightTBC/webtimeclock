<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $select = "SELECT custno, co_name FROM ptcust ";
    $resultID = mysqli_query($db,$select);
    if(mysqli_num_rows($resultID) == 0 ) {	
      echo("No customers with Contracts defined as Time Clock Contracts.  Procedure cancelled.");
    } else {
	  $rows = array();
	  while($r = mysqli_fetch_assoc($resultID)) {
    	$rows[] = $r;
	  }	    
	  print json_encode($rows);	    
    }
?>    
