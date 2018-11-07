<?php

require 'phpmailer/PHPMailerAutoload.php';

$mail = new PHPMailer();

$mail->isSMTP();
$mail->Host = "smtp.gmail.com";
$mail->SMTPSecure = "ssl";
$mail->Port = 465;
$mail->SMTPAuth = true;

$mail->IsHTML(true);

// Sender
$mail->Username = 'contact.generationOnLAHS@gmail.com';
$mail->Password = 'generationOnGO';

// Receiver
$mail->addAddress('lenkagamine122707@gmail.com');
$mail->Subject = 'SMTP email test';
$mail->Body = 'this is some body';

?>