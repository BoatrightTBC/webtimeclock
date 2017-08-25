<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $timeslice    = $_POST["timeslice"];
    $breakpoint   = $_POST["breakpoint"];
    
// Otherwise Clock In
    $select = "UPDATE sysdata SET timeslice = ".mysqli_real_escape_string($db, $timeslice).", breakpoint = ".mysqli_real_escape_string($db, $breakpoint);
		       		       
    $resultID = mysqli_query($db, $select);
    
    if ($resultID) {
	  echo("Settings saved.");
    } else {
      echo("Settings save failed.");
    }
    
    return;
?>    
