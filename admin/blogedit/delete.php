<?php

require_once($_SERVER['DOCUMENT_ROOT'] . '/conf.ini.php');

$link = mysqli_connect($servername, $username, $password, $database);

if ($link === false) {
  echo 'error';
  die("Connect Failed: " . mysqli_connect_error());
}

$id = $_POST['id'];
$sql = "SELECT * FROM blog_posts WHERE id='$id'";
$img_dir = $_SERVER['DOCUMENT_ROOT'] . "/posts/images/";

if ($result = mysqli_query($link, $sql)) {
  $image = $img_dir . mysqli_fetch_assoc($result)['image'];
  $sql = "DELETE FROM blog_posts WHERE id='$id'";

  if (mysqli_query($link, $sql)) {
    unlink($image);
    echo "success";
  } else echo "failure";
} else echo "failure";

mysqli_close($link);

 ?>
