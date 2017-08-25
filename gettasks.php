<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $contcode = $_POST["contcode"];
    
    $select = "SELECT jobcode,task_desc FROM pttask WHERE substring(taskcode,1,6) = '".$contcode. "' ORDER BY taskcode ";
    $resultID = mysqli_query($db,$select);
    if(mysqli_num_rows($resultID) == 0 ) {	
      echo("No active tasks in the selected Contract.  Procedure cancelled.");
    } else {
	  $rows = array();
	  while($r = mysqli_fetch_assoc($resultID)) {
    	  $rows[] = $r;
	  }	    
	  print json_encode($rows);	    
    }
    return;
?>    
