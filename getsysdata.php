<?php
	global $file, $db, $token, $onetime;
	$onetime = "yes";
	include("include_connect.php");
	unset($onetime);
	if ($db == NULL) {
	  header('HTTP/1.1 500 Internal Server Error');
      return;
	}
  
    $select = "SELECT sysdata.*, magic.*, magic.password AS SETUPNAME FROM sysdata JOIN magic ";
    $resultID = mysqli_query($db,$select);
    if ($resultID) {
	    if(mysqli_num_rows($resultID) == 0 ) {	
		   header('Content-type: application/json');
		    $response_array['status'] = 'error';  
		    echo json_encode($response_array);
	      return;
	    } else {
		  $rows = array();
		  while($r = mysqli_fetch_assoc($resultID)) {
	    	$rows[] = $r;
		  }	    
	    }
		  print json_encode($rows);	    
//      echo("Good Employee Number");
    }
?>    
