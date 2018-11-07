<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/conf.ini.php');

$link = mysqli_connect($servername, $username, $password, $database);

if ($link === false) {
  echo mysqli_connect_error();
  die("Connect Failed: " . mysqli_connect_error());
}

$id = $_POST['id'];
$subject = mysqli_real_escape_string($link, $_POST['title']);
$editor = $_SESSION['logged_in']['first_name'] . ' ' . $_SESSION['logged_in']['last_name'];
$desc = mysqli_real_escape_string($link, $_POST['description']);
$content = mysqli_real_escape_string($link, $_POST['paragraph']);
$image = "";

if ($_FILES['image']['name'] != "") {
  unlink($_SERVER['DOCUMENT_ROOT'] . '/posts/images/' . $_POST['original-img']);
  $image = $_FILES['image']['name'];
  uploadImg();
} else {
  $image = $_POST['original-img'];
}

$sql = "UPDATE blog_posts
  SET subject='$subject', editor='$editor', `desc`='$desc', content='$content', image='$image'
  WHERE id='$id'
";

if (mysqli_query($link, $sql)) {
  echo "success";
} else echo "failure";

mysqli_close($link);

function uploadImg() {
  $target_dir = $_SERVER['DOCUMENT_ROOT'] . "/posts/images/";
  $target_file = $target_dir . basename($_FILES['image']['name']);
  $uploadOk = 1;
  $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

  $check = getimagesize($_FILES['image']['tmp_name']);
  if ($check !== false) {
    //echo "File is an image - " . $check['mime'] . ".";
    $uploadOk = 1;
  } else {
    //echo "File is not an image";
    $uploadOk = 0;
  }

  if (file_exists($target_file)) {
    echo "Sorry, file already exists.";
    $uploadOk = 0;
  }

  if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif") {
    echo "Sorry, only JPG, JPEG, PNG, and GIF files are supported.";
    $uploadOk = 0;
  }

  if ($uploadOk == 0) {
    echo "There was an error when uploading your file.";
  } else {
    if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
      echo "success";
    } else {
      echo "failure";
    }
  }
}
 ?>
