<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $magic = $_POST["magic"];
    $select = "SELECT password FROM magic WHERE password = '".$magic."' ";
    $resultID = mysqli_query($db,$select);
    if(mysqli_num_rows($resultID) == 0 ) {	
      echo("Bad Password!");
    } else {
      echo("Good Password!");
    }
    return;
?>    
