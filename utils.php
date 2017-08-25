<?php
require_once("settings.php");
include("english.php");
/*
$mysqli = new mysqli($db_server, $db_user, $db_pass, $db_database);
if(mysqli_connect_errno()) {
		printf("Connect failed: %s\n", mysqli_connect_error());
		exit();
}
*/
//escape data if magic quotes is off
function addslashes_recursive($value) {
		if(is_array($value)) {
				foreach($value as $index=>$val) {
						$value[$index] = addslashes_recursive($val);
				}
				return $value;
		} else {
				return addslashes($value);
		}
}
function stripslashes_recursive($value) {
		if(is_array($value)) {
				foreach($value as $index=>$val) {
						$value[$index] = stripslashes_recursive($val);
				}
				return $value;
		} else {
				return stripslashes($value);
		}
}
//jqgrid likes to pass '&nbsp;' instead of empty value so this replaces that
function removeNbsp($value) {
		if(is_array($value)) {
				foreach($value as $index=>$val) {
						$value[$index] = removeNbsp($val);
				}
				return $value;
		} else {
				if($value === '&nbsp;') {
						return '';
				} else {
						return $value;
				}
		}
}
if(!get_magic_quotes_gpc()) {
		// Recursively apply addslashes() to all data
		$_GET     = addslashes_recursive($_GET);
		$_POST    = addslashes_recursive($_POST);
		$_COOKIE  = addslashes_recursive($_COOKIE);
		$_REQUEST = addslashes_recursive($_REQUEST);
}
function randomString($length) {
		$pattern = "1234567890abcdefghijklmnopqrstuvwxyz";
		for($i = 0;$i < $length;$i++) {
				if(isset($key)) {
						$key .= $pattern {
								rand(0, 35)
						};
				} else {
						$key = $pattern {
								rand(0, 35)
						};
				}
		}
		return $key;
}
function checkLogin() {
		global $db_server, $db_user, $db_pass, $db_database, $STRINGS, $LANG, $mysqli;
		if(!isset($_SESSION)) {
				session_cache_limiter('private');
				session_start();
		}
		/* check connection */
		if(mysqli_connect_errno()) {
				printf("Connect failed: %s\n", mysqli_connect_error());
				exit();
		}
		if(isset($_REQUEST['logout'])) {
				logout();
				return false;
		}
		$remember = FALSE;
		if(isset($_COOKIE['user_id'])) {
				$_SESSION['user_id'] = $_COOKIE['user_id'];
		}
		if(isset($_COOKIE['user_password'])) {
				$_SESSION['user_password'] = $_COOKIE['user_password'];
		}
		if(isset($_COOKIE['remember'])) {
				$remember = TRUE;
		}
		if(isset($_POST['user_id'])) {
				$_SESSION['user_id'] = trim($_POST['user_id']);
				$remember = FALSE;
		}
		if(isset($_POST['user_password'])) {
				$_SESSION['user_password'] = trim($_POST['user_password']);
				$remember = FALSE;
		}
		if(isset($_POST['remember'])) {
				$remember = TRUE;
		}
		if(!(isset($_SESSION['user_id'])) && isset($_POST['user_id'])) {
				print $STRINGS[$LANG]['error_login_session']."<br />";
				return false;
		}
		if(!(isset($_SESSION['user_id']) && isset($_SESSION['user_password']))) {
				return false;
		}
		if(checkPass($_SESSION['user_id'], $_SESSION['user_password'])) {
				if($remember) {
						//cookie expiration of 30 days
						setcookie("user_id", $_SESSION['user_id'], time() + 60 * 60 * 24 * 30);
						setcookie("user_password", $_SESSION['user_password'], time() + 60 * 60 * 24 * 30);
						setcookie("remember", $remember, time() + 60 * 60 * 24 * 30);
				}
				return true;
		}
		logout();
		print $STRINGS[$LANG]['error_login_password']."<br /";
		return false;
}
function checkPass($user, $pw) {
		global $mysqli;
		$result = $mysqli->query("SELECT password, administrative FROM users WHERE uid='$user'");
		if(!$result) {
				die($mysqli->error);
		}
		$row = $result->fetch_row();
		$result->free();
		if($row[0] === $pw) {
				$_SESSION['admin'] = $row[1];
				return true;
		} else {
				return false;
		}
}
function showLogin() {
		global $STRINGS, $LANG;
		include("login.tpl");
		exit();
}
function getURL() {
		if(isset($_REQUEST['logout'])) {
			//	return "checkblanks.php?dest=4data.php";
			logout();
			return "4data.php";
		}
		$self_url = sprintf('http%s://%s%s', (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == TRUE?'s':''), $_SERVER['HTTP_HOST'], $_SERVER['REQUEST_URI']);
		return $self_url;
}
function logout() {
		unset($_SESSION['user_name']);
		unset($_SESSION['user_password']);
		setcookie('user_id', '', time() - 60 * 60 * 24 * 30);
		setcookie('user_password', '', time() - 60 * 60 * 24 * 30);
		setcookie('remember', '', time() - 60 * 60 * 24 * 30);
}
function checkPermissions($uid) {
		return($_SESSION['admin'] || strcasecmp($_SESSION['user_id'], "$uid") == 0);
}
?>
