<?php
#Purpose: This is where we put the link to the database.  
#         It should be 'included' from every page.
#         Note: It will be modified for each release of ConReg

#link to database
#----------------

//Check for Logged in and Connect To Database (if needed)
$return = false;
if ($onetime == "yes") {	//This call is coming from sysdata -- the initial call
	if(!isset($_COOKIE['authID'])) {
      $return = true;
    } else {
      if ($_COOKIE['authID'] == '') {
	    $return = true;
      }
    }
    
    if ($return == true) {
	    return;
    }

	$lcServer1 = $_SERVER['SERVER_NAME'];
	if ($lcServer1 == "localhost") {
		$dbname1="vocshop_authportal";
		$username1='vocshop_test';
		$password1='swordfish';
		$hostname1='localhost';
	}
	
	$db1=mysqli_connect($hostname1,$username1,$password1,$dbname1);
	// Check connection
	if (mysqli_connect_errno())
	  {
	  echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}
    $cookievalue = $_COOKIE['authID'];
	
	$select = "SELECT uid FROM sessions WHERE hash = '".$cookievalue."' AND expiredate > '".date("Y-m-d H:i:s")."'";
	$resultID = mysqli_query($db1,$select);
	
	if ($resultID) {
		if(mysqli_num_rows($resultID) <= 0) {	
		    return false;
		}	
    } else {
      return false;
    }

    //Set our own cookie, no need to keep checking authorization    
    setcookie('loggedin',"yes",time() + (86400 * 7)); // One day
} else { // Not first time
    //Check our own cookie, no need to keep checking authorization
	if(!isset($_COOKIE['loggedin'])) {
      $return = true;
    } else {
      if ($_COOKIE['loggedin'] != 'yes') {
	    $return = true;
      }
    }
    if ($return == true) {
	    return;
    }    
}
 
if (!$db) {	//Only do this is not already connected
	$lcServer = $_SERVER['SERVER_NAME'];
	if ($lcServer == "localhost") {
		$dbname1="vocshop_tbctimeclock";
		$username1='vocshop_test';
		$password1='swordfish';
		$hostname1='localhost';
	}
	
	$db=mysqli_connect($hostname,$username,$password,$dbname);
	// Check connection
	if (mysqli_connect_errno())
	  {
	  echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}
	
	$select = "SELECT token FROM magic ";
	$resultID = mysqli_query($db,$select);
	
	if(mysqli_num_rows($resultID) > 0) {	
	    // Get Token
	  while ($row = mysqli_fetch_assoc($resultID)) {
		    $token = $row['token'];
	    }
	}
}
?>