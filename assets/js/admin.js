$('#admin-login').click(function() { submitForm(); });
$('#password').keypress(function(e) { if (e.which == 13) submitForm(); });

function submitForm() {
  if ($('#username').val() == "" || $('#password').val() == "") return;
  else {
    $.post("../php/login.php", { "username": $("#username").val(), "password": $("#password").val() }, function(e){

    })
  }
}
