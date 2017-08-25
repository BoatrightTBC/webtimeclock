<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $prempl = "";
    $clockno = $_POST["clockno"];
    $timein = $_POST["timein"];
    $timein1 = substr($timein, 0, 2).substr($timein, 3, 2);

    $select = "SELECT ptcards.cardno, ptcards.prempl, ptcards.prlast, ptcards.prfirst, ptempl.supeid, ptcards.ismgr FROM ptcards LEFT JOIN ptempl ON ptcards.prempl = ptempl.prempl WHERE UPPER(ptcards.cardno) = '".strtoupper($clockno)."' ";
    
    $resultID = mysqli_query($db,$select);
    if(mysqli_num_rows($resultID) == 0 ) {	
      $lcMsg = "Bad Clock Number!";
  	  print json_encode($lcMsg);
      return;
    } else {
	  $rows = array();
	  while($r = mysqli_fetch_assoc($resultID)) {
    	$rows[] = $r;
    	$prempl = $r["prempl"];
	  }	    
    }
    
    $lnInOrOut = "yes";
    
    $select = "SELECT pttime.* FROM pttime WHERE pttime.prempl = '".$prempl."' AND timeout = '' AND adddate > DATE_SUB(NOW(),INTERVAL 20 HOUR)";
    $resultID2 = mysqli_query($db,$select);

    if(mysqli_num_rows($resultID2) > 0) {	      
      // If TimeIn record exists, Clock Out
      while ($row = mysqli_fetch_assoc($resultID2)) {
  	    $key = (string)$row['ID'];
        $select = "UPDATE pttime SET timeout = '".$timein1."', outtime = now() WHERE pttime.id = ".$key." ";
        $resultID1 = mysqli_query($db,$select);
        if (!$resultID1) {
	      $lnInOrOut = "Time Out Insert failed";
        }
      }      
    } else {
      $lnInOrOut = "no";
    }
	print $lnInOrOut."|".json_encode($rows);	        
?>    
