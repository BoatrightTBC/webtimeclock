<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $select = $_POST["select"];
    $emplno = $_POST["emplno"];
    
/////////////////////////////////////////// DID YOU CHANGE THE INTERVAL BACK TO 96 HOURS?????    

	switch ($select) {
	    case "Clocked In":
			$lcExe = "SELECT c.prlast, c.prfirst, c.prempl, ".
			    "T.timein , T.TIMEOUT , T.adddate, T.jobcode, a.task_desc ".
				"FROM ptcards c JOIN pttime T ON c.prempl = T.prempl ".
				"JOIN pttask a ON T.jobcode = a.jobcode  ".
				"WHERE T.TIMEOUT = ' '  ".
				"AND T.adddate > DATE_SUB(NOW(), INTERVAL 960 HOUR) ".
				"ORDER BY c.prlast, c.prfirst ";
								
	        break;
	        
	    case "All Records":
			$lcExe = "SELECT c.prlast, c.prfirst, c.prempl, ".
				"T.timein , T.TIMEOUT , T.adddate, T.jobcode, a.task_desc  ".
				"FROM ptcards c JOIN pttime T ON c.prempl = T.prempl  ".
				"JOIN pttask a ON T.jobcode = a.jobcode  ".
				"WHERE T.adddate > DATE_SUB(NOW(), INTERVAL 960 HOUR) ".
				"ORDER BY c.prlast, c.prfirst  ";
				
	        break;
	        
	    case "One Person":
			$lcExe = "SELECT c.prlast, c.prfirst, c.prempl, ".
				"T.timein , T.TIMEOUT , T.adddate, t.outtime, T.jobcode, a.task_desc  ".
				"FROM ptcards c JOIN pttime T ON c.prempl = T.prempl  ".
				"JOIN pttask a ON T.jobcode = a.jobcode  ".
				"WHERE T.adddate > DATE_SUB(NOW(), INTERVAL 960 HOUR) ".
				"AND c.prempl = '".$emplno."' ".
				"ORDER BY t.adddate ";
	    
	        break;
	        
	    default:
	        echo "There was a problem!";
	        return;
	}    
    
    $resultID = mysqli_query($db, $lcExe);
    $returnnum = mysqli_num_rows($resultID);
    if($returnnum == 0 ) {	
      echo("No Records!|");
      return;
    }
    
    $rows = array();
    $rows[0] = $select."|".$returnnum."|";
    while($r = mysqli_fetch_assoc($resultID)) {			    
	  $rows[] = $r;
    }	    
	print json_encode($rows);	    
	
    return;
?>    
