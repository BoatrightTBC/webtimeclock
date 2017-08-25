<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $setupName  = $_POST["setupName"];
    $showcust   = $_POST["showcust"];
    $cardsource = $_POST["cardsource"];
    $cardtext3  = $_POST["cardtext3"];
    
    if ($setupName != "") {
      $select = "UPDATE magic SET PASSWORD = '".mysqli_real_escape_string($db, $setupName)."', cardsource = ".mysqli_real_escape_string($db, $cardsource).", SHOWCUST = ".mysqli_real_escape_string($db, $showcust);
    } else {
      $select = "UPDATE magic SET cardsource = ".mysqli_real_escape_string($db, $cardsource).", SHOWCUST = ".mysqli_real_escape_string($db, $showcust);   
    }

    $resultID = mysqli_query($db, $select);
    
    if ($resultID) {
	  echo("Options saved.");
    } else {
      echo("Options save failed.");
    }
    
    return;
?>    
