<?php

require_once($_SERVER['DOCUMENT_ROOT'] . '/conf.ini.php');

$connection = mysqli_connect($servername, $username, $password, $dbname);

if ($connection === false) {
  die("Connect Failed: " . mysqli_connect_error());
}

$query_string = "TRUNCATE applications";
if (mysqli_query($connection, $query_string)) {
  echo "success";
} else {
  echo "failure";
}

mysqli_close($connection);

 ?>
