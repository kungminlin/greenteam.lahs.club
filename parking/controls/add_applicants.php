<?php

require_once($_SERVER['DOCUMENT_ROOT'] . '/conf.ini.php');

$connection = mysqli_connect($servername, $username, $password, $dbname);

if ($connection === false) {
  die("Connect Failed: " . mysqli_connect_error());
}

$overlap = false;
$changed = true;
$check_string = "SELECT * FROM applications";
$query_result = mysqli_query($connection, $check_string);

if (mysqli_num_rows($query_result) > 0) {
  while ($applicant = mysqli_fetch_assoc($query_result)) {
    if ($user['student_id'] == $_POST['student_id']) {
      $overlap = true;
      if ($user['firstname'] == $_POST['firstname'] &&
          $user['lastname'] == $_POST['lastname'] &&
          $user['email'] == $_POST['email'] &&
          $user['school_email'] == $_POST['school_email'] &&
          $user['address'] == $_POST['address'] &&
          $user['class'] == $_POST['class'] &&
          $user['row_id'] == $_POST['row_id'])
          $changed = false;
    }
  }
}

$firstname = mysqli_real_escape_string($connection, $_POST['firstname']);
$lastname = mysqli_real_escape_string($connection, $_POST['lastname']);
$email = mysqli_real_escape_string($connection, $_POST['email']);
$school_email = mysqli_real_escape_string($connection, $_POST['school_email']);
$student_id = mysqli_real_escape_string($connection, $_POST['student_id']);
$address = mysqli_real_escape_string($connection, $_POST['address']);
$class = mysqli_real_escape_string($connection, $_POST['class']);
$row_id = mysqli_real_escape_string($connection, $_POST['row_id']);

$query_string = "";

if ($overlap && $changed) {
  $query_string = "UPDATE applications SET firstname=$firstname, lastname=$lastname, email=$email, school_email=$school_email, address=$address, class=$class, row_id=$row_id WHERE student_id=$student_id";
} else {
  $query_string = "INSERT INTO applications (firstname, lastname, email, school_email, address, class, row_id, student_id) VALUES ($firstname, $lastname, $email, $school_email, $address, $class, $row_id, $student_id)";
}

if (mysqli_query($connection, $query_string)) {
  echo "success";
} else {
  echo "failure";
}

mysqli_close($connection);

 ?>
