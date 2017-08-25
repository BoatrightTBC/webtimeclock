<?php
	global $file, $db, $token;
	include("include_connect.php");
		
    $formdata = $_POST["form"];
    $count    = $_POST["count"];
    
    if ($formdata == "" || $count == "" || $count == "0") {
	    echo "No data sent!";
	    return;
    }
    
//     file_put_contents ("test.txt","");
    
	$content = unserializeForm($formdata);
	$content = str_replace("+", " ", $content);
	
    $lnCount = intval($count);
    
    $lnInsert = 0;
    $lnUpdate = 0;
    $lnBadInsert = 0;
    $lnBadUpdate = 0;
    
    for ($x = 1; $x <= $lnCount; $x++) {
      $update = "UPDATE ptcards SET ";
      $insert = "INSERT INTO ptcards (prempl, cardno, prfirst, prlast, ismgr) VALUES ('','";
	  $lcCount = strval($x);
	  $varName = "cardno-".$lcCount;
      if (array_key_exists($varName, $content)) {
	      $update .= "cardno = '".mysqli_real_escape_string($db, $content[$varName])."', ";
	      $insert .= mysqli_real_escape_string($db, $content[$varName])."', '";
      }

	  $varName = "prfirst-".$lcCount;
      if (array_key_exists($varName, $content)) {
	      $update .= "prfirst = '".mysqli_real_escape_string($db, $content[$varName])."', ";
	      $insert .= mysqli_real_escape_string($db, $content[$varName])."', '";
      } else {
	      $insert .= "', '";
      }
      
	  $varName = "prlast-".$lcCount;
	  
      if (array_key_exists($varName, $content)) {
	      $update .= "prlast = '".mysqli_real_escape_string($db, $content[$varName])."', ";
	      $insert .= mysqli_real_escape_string($db, $content[$varName])."', '";
      } else {
	      $insert .= "', '";
      }
      
	  $varName = "ismgr-".$lcCount;
      if (array_key_exists($varName, $content)) {
	     $update .= "ismgr = 1 ";
      } else {
	     $update .= "ismgr = 0 ";
      }
      
      $insert = rtrim($insert,"'");
	  $insert .= "1) ";
      
	  $varName = "id-".$lcCount;
	  $update .= "WHERE id = '".mysqli_real_escape_string($db, $content[$varName])."' ";
	  $IDNo = mysqli_real_escape_string($db, $content[$varName]);
	  
	  if ($IDNo == "0") { // Insert
        $resultID = mysqli_query($db, $insert);
        $lnInsert++;
	    if (!$resultID) {
		  $lnBadInsert++;
	    }
	  } else { // Update
        $resultID = mysqli_query($db, $update);
        $lnUpdate++;
	    if (!$resultID) {
		  $lnBadUpdate++;
	    }
	  }	  
    }
    
    $Msg = "There were ".strval($lnUpdate)." card record(s) updated.";
    if ($lnInsert > 0) {
      $Msg .= "\nThere were ".strval($lnInsert)." card record(s) added.";
    }
    
    if ($lnBadInsert > 0) {
      $Msg .= "\nThere were ".strval($lnBadInsert)." card record(s) that could NOT be added.";
    }
    
    if ($lnBadUpdate > 0) {
      $Msg .= "\nThere were ".strval($lnBadUpdate)." card record(s) that could NOT be updated.";
    }
    
    echo $Msg;
    return;
    
function unserializeForm($str) {
    $returndata = array();
    $strArray = explode("&", $str);
    $i = 0;
    foreach ($strArray as $item) {
        $array = explode("=", $item);
        $returndata[$array[0]] = $array[1];
    }

    return $returndata;
} 
?>    
