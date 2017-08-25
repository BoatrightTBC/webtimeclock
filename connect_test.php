<?php
#Purpose: This is where we put the link to the database.  
#         It should be 'included' from every page.
#         Note: It will be modified for each release of ConReg

#link to database
#----------------

//Check for Logged in and Connect To Database (if needed)
$return = false;
$lcServer = $_SERVER['SERVER_NAME'];
	$dbname="vocshop_authportal";
	$username='vocshop_test';
	$password='Seren1ty!';
	$hostname=$lcServer;
	$hostname='localhost';
echo "DB Name is: ".$dbname."<br />";
echo "User Name is: ".$username."<br />";
echo "Password is: ".$password."<br />";
echo "Server Name is: ".$hostname;

$db=mysqli_connect($hostname,$username,$password,$dbname);
// Check connection
if (mysqli_connect_error())
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  return;
}
		
?>