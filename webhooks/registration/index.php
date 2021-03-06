<?php

require_once($_SERVER['DOCUMENT_ROOT'] . "/conf.ini.php");

header('Content-Type: application/json');
$req = file_get_contents('php://input');
$req_dump = print_r($req, true);

$data = json_decode($req_dump, true);
$response = $data['form_response']['answers'];

$first_name = $response[0]['text'];
$last_name = $response[1]['text'];
$class_name = $response[2]['choice']['label'];
$email = $response[3]['email'];

require __DIR__ . '/vendor/autoload.php';

$service = 'registration@sustained-flux-245421.iam.gserviceaccount.com';
$key_file = './key.json';

$client = new Google_Client();
$client->setAuthConfig('credentials.json');
$client->addScope(Google_Service_PeopleService::CONTACTS);
$client->setAccessType('offline');
$client->setPrompt('select_account consent');

$tokenPath = 'token.json';
if (file_exists($tokenPath)) {
  $accessToken = json_decode(file_get_contents($tokenPath), true);
  $client->setAccessToken($accessToken);
}

if ($client->isAccessTokenExpired()) {
  // Refresh the token if possible, else fetch a new one.
  if ($client->getRefreshToken()) {
      $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
  } else {
      // Request authorization from the user.
      $authUrl = $client->createAuthUrl();
      printf("Open the following link in your browser:\n%s\n", $authUrl);
      print 'Enter verification code: ';
      $authCode = trim(fgets(STDIN));

      // Exchange authorization code for an access token.
      $accessToken = $client->fetchAccessTokenWithAuthCode($authCode);
      $client->setAccessToken($accessToken);

      // Check to see if there was an error.
      if (array_key_exists('error', $accessToken)) {
          throw new Exception(join(', ', $accessToken));
      }
  }
  // Save the token to a file.
  if (!file_exists(dirname($tokenPath))) {
      mkdir(dirname($tokenPath), 0700, true);
  }
  file_put_contents($tokenPath, json_encode($client->getAccessToken()));
}

$service = new Google_Service_PeopleService($client);

$person = new Google_Service_PeopleService_Person();
$email_address = new Google_Service_PeopleService_EmailAddress();
$email_address->setValue($email);
$person->setEmailAddresses($email_address);
$name = new Google_Service_PeopleService_Name();
$name->setGivenName($first_name);
$name->setFamilyName($last_name);
$person->setNames($name);
$class = new Google_Service_PeopleService_UserDefined();
$class->setKey("Class");
$class->setValue($class_name);
$person->setUserDefined($class);

$person = $service->people->createContact($person, array());

$add_request = new Google_Service_PeopleService_ModifyContactGroupMembersRequest();
$add_request->setResourceNamesToAdd($person->getResourceName());
$service->contactGroups_members->modify("contactGroups/5511269a0db1a55f", $add_request);

$mail->setFrom('lahsgreenteam@gmail.com', 'LAHS Green Team');
$mail->addAddress($email, $first_name . " " . $last_name);

$subject = "Welcome, $first_name, to LAHS Green Team!";
$mail->isHTML(true);
$mail->Subject = $subject;
$mail_content = file_get_contents('../../templates/email/welcome.html');
$mail->Body = $mail_content;

if (!$mail->send()) {
  die('Mailer Error: '.$mail->ErrorInfo);
}

 ?>
