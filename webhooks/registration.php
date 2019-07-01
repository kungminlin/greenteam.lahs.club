<?php

function log($msg) {
  file_put_contents("./logs/" . strval(date("Y-m-d")) . "-LOG.txt", "[" . strval(date("h:i:s")) . "] " . $msg . "\n", FILE_APPEND);
}

if ($json = json_decode($_POST, true)) {
  log("Retrieved data from Typeform: Green Team Recruitment 2019-2020.");
  $data = $json;
} else {
  log("Failed to retrieve data from Typeform: Green Team Recruitment 2019-2020.");
  die("Failed to retrieve data.");
}

log($data["event_id"]);

 ?>
