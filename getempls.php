<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $letters = $_GET["letters"];
    if ($letters == 'yes') { // Just a list of letters
	    $resultID = mysqli_query($db,"SELECT substr(prlast, 1, 1) AS letter FROM `ptempl` GROUP BY 1 ORDER BY 1");
		    $rows = array();
		    while($r = mysqli_fetch_assoc($resultID)) {			    
	    	  $rows[] = $r['letter'];
		    }	    
		    print json_encode($rows);	    
	} else { // Empl List based on letter
	    $letter = $_POST["letter"];
	    $select = "SELECT ptempl.prempl, ptempl.prlast, ptempl.prfirst, ptempl.supeid, ptcards.cardno FROM `ptempl` JOIN ptcards ON ptempl.prempl = ptcards.prempl WHERE substr(ptempl.prlast, 1, 1) = '".$letter."' ORDER BY 2, 3";
	    $resultID = mysqli_query($db,$select);
        if(mysqli_num_rows($resultID) == 0) {	
          echo "Could not find Employees for ".$letter;
          return;
        }
	    $rows = array();
	    while($r = mysqli_fetch_assoc($resultID)) {
    	  $rows[] = $r;
	    }
	    print json_encode($rows);	    
	} // Letters or Empls?
    return;
?>    
