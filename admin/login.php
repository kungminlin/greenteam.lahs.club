<?php

session_start();

$response->error = "";

require_once($_SERVER['DOCUMENT_ROOT'] . '/conf.ini.php');

$link = mysqli_connect($servername, $username, $password, $database);

if ($link === false) {
  $response->error = "Connect Failed: " . mysqli_connect_error();
  die("Connect Failed: " . mysqli_connect_error());
}

$username = mysqli_real_escape_string($link, $_POST['username']);

$sql = "SELECT * FROM admins WHERE username = '$username'";
$result = mysqli_query($link, $sql);

if (mysqli_num_rows($result) > 0) {
  $user = mysqli_fetch_assoc($result);
  if (md5($_POST['password']) == $user['password']) {
    $_SESSION['logged_in'] = array(
      'username' => $user['username'],
      'first_name' => $user['first_name'],
      'last_name' => $user['last_name']
    );
    $response->error = "";
  } else {
    $response->error = "Incorrect username or password.";
  }
} else {
  $response->error = "Incorrect username or password.";
}

echo $response->error;

mysqli_close($link);
?>
