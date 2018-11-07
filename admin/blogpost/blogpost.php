<?php

session_start();

$response->error = "";

require_once($_SERVER['DOCUMENT_ROOT'] . '/conf.ini.php');

$link = mysqli_connect($servername, $username, $password, $database);

if ($link === false) {
  $response->error = "Connect Failed: " . mysqli_connect_error();
  die("Connect Failed: " . mysqli_connect_error());
}

$subject = mysqli_real_escape_string($link, $_POST['title']);
$author = mysqli_real_escape_string($link, $_SESSION['logged_in']['first_name'] . ' ' . $_SESSION['logged_in']['last_name']);
$desc = mysqli_real_escape_string($link, $_POST['description']);
$content = mysqli_real_escape_string($link, $_POST['paragraph']);
$image = $_FILES['image']['name'];

$sql = "INSERT INTO blog_posts (subject, author, `desc`, content, image) VALUES (
  '$subject', '$author', '$desc', '$content', '$image'
)";

if (mysqli_query($link, $sql)) {
  $response->error = "";
} else $response->error = "Query Error.";

mysqli_close($link);

$target_dir = $_SERVER['DOCUMENT_ROOT'] . "/posts/images/";
$target_file = $target_dir . basename($_FILES['image']['name']);
$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

$check = getimagesize($_FILES['image']['tmp_name']);
if ($check !== false) {
  $response->comment = "File is an image - " . $check['mime'] . ".";
  $uploadOk = 1;
} else {
  $response->error = "Uploaded file is not an image.";
  $uploadOk = 0;
}

if (file_exists($target_file)) {
  $response->error = "Uploaded file already exists.";
  $uploadOk = 0;
}

if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif") {
  $response->error = "FileType Error: Only JPG, JPEG, PNG, and GIF files are supported.";
  $uploadOk = 0;
}

if ($uploadOk != 0) {
  if (!move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
    echo json_encode($response);
  }
}
 ?>
