<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $time = $_POST["time"];
    
    if ($time != '') {
	  $lcExe = "SELECT id FROM pttime WHERE (workdate < CURDATE() OR (workdate = CURDATE() AND timein < '".$time."')) AND sent = 0";
    } else {
	  $lcExe = "SELECT id FROM pttime WHERE sent = 0";
    }
    
//Uncomment to force a "No Records" message
//    $lcExe = $lcExe." AND false";

//Any records?        
    $resultID = mysqli_query($db,$lcExe);
    if(mysqli_num_rows($resultID) == 0 ) {	
      echo("No Records!|");
      return;
    }
    
    $lcExe2 = " AND (timein = '' OR timeout = '') ";

//Any bad records?    
    $resultID2 = mysqli_query($db,$lcExe.$lcExe2);
    if(mysqli_num_rows($resultID2) > 0 ) {	
      echo("Bad Records!|".$lcExe.$lcExe2);
      return;
    }   
    
/*
$current = file_get_contents('test.txt');
$current = $lcExe.$lcExe2;
file_put_contents('test.txt', $current);    
*/       
    $current = $lcExe.$lcExe2;
    echo " |".$current;
    
    return;
?>    
