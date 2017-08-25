<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $select = $_POST["select"];
    $lcWhere= str_replace("SELECT id FROM pttime", "", $select);  //Change SELECT to DELETE
       
    $lcExe = "SELECT pttime.workdate, pttime.prempl, pttime.jobcode, pttime.timein, pttime.TIMEOUT, ".
             "ptcards.prfirst, ptcards.prlast FROM pttime JOIN ptcards ON pttime.prempl = ptcards.prempl ".
		     $lcWhere." AND ptcards.ismgr = '0' ".
		     " ORDER BY workdate, timein ";
      
    $resultID = mysqli_query($db, $lcExe);
    $returnnum = mysqli_num_rows($resultID);
    if($returnnum == 0 ) {	
      echo("No Records!|");
      return;
    }
    
    $rows = array();
    $rows[0] = $returnnum."|";
    while($r = mysqli_fetch_assoc($resultID)) {			    
	  $rows[] = $r;
    }	    
	print json_encode($rows);	    
	
/*
$current = file_get_contents('test.txt');
$current = $lcExe.$lcExe2;
file_put_contents('test.txt', $current);    
*/       
    
    return;
?>    
