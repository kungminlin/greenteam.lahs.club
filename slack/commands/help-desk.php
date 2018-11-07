<?php

$command = $_POST['command'];
$text = $_POST['text'];
$token = $_POST['token'];
$channel_id = $_POST['channel_id'];
$user_name = $_POST['user_name'];
$user_id = $_POST['user_id'];

function slack($message, $sender, $channel) {
  $ch = curl_init("https://slack.com/api/chat.postMessage");
  $data = http_build_query([
    "token" => "xoxp-262043528996-263114341527-381926759251-4547e8997c04e9fa898a92bdf23698da",
    "channel" => $channel,
    "text" => "*<!channel>, " . "<@" . $sender . ">" . " needs some help: *\n>" . $message,
    "username" => "help-desk",
  ]);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
  curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  $result = curl_exec($ch);
  curl_close($ch);

  return $result;
}

slack($text, $user_id, '#help-desk');

?>
