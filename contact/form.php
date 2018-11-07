<?php

$name = $email = $subject = $msg = "";

$name = process_input($_POST["name"]);
$email = process_input($_POST["email"]);
$subject = process_input($_POST["subject"]);
$msg = process_input($_POST["message"]);

require_once('phpmailer/PHPMailerAutoload.php');

$mail = new PHPMailer();

$mail->IsSMTP();
$mail->Host = "smtp.gmail.com";
$mail->SMTPDebug = 2;
$mail->SMTPAuth = true;
$mail->SMTPSecure = "tls";
$mail->Port = 587;

$mail->Username = 'noreply.lahsgreenteam@gmail.com';
$mail->Password = 'begreennotmean';
$mail->Priority = 1;
$mail->CharSet = 'UTF-8';
$mail->Encoding = '8bit';

$mail->IsHTML(true);

$mail->setFrom($email, $name);
$mail->addAddress('mml0816@gmail.com');
$mail->Subject = $subject;
$mail->Body = "<head><link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'></head><body style='font-family: \"Roboto\", sans-serif;'><div style='width: 90%; height: 100%; padding: 5% 5%;'><div style='width: calc(100% - 20px); padding: 10px; background-color: #1565c0; color: white; text-align: center; font-size: 2em; margin: 0'>$subject</div><div style='background-color: #efefef; padding: 10px;'><p><b>Sender: </b>$email</p><p>$msg</p></div></div></body>";

$mail->Send();
$mail->SmtpClose();

if ($mail->IsError()) echo "ERROR<br /><br />";
else echo "OK<br /><br />";

function process_input($data) {
	$data = htmlspecialchars(stripslashes(trim($data)));
	return $data;
}

?>
