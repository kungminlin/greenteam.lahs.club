$("#admin-login").click(function() { submitForm(); });
$("#password").keypress(function(e) { if (e.which == 13) submitForm(); });

function submitForm() {

  if ($("username").val() == "" || $("#password").val() == "") {
    $("p.error").html("Error: Please complete the following fields.");
    $("br.error").css("display", "none");
    $("p.error").css("display", "none");
    $("p.error").show();
  } else {
    $.ajax({
      url: 'login.php',
      data: {"username": $("#username").val(), "password": $("#password").val()},
      type: "POST",
      success: function(response) {
        if (response=="") window.location.replace("panel.php");
        else {
          $("p.error").html(response);
          $("br.error").css("display", "none");
          $("p.error").css("display", "none");
          $("p.error").show();
        }
      },
      error: function(response) {
        var error = jQuery.parseJSON(response.responseText);
        $("p.error").html(error.Message);
        $("br.error").css("display", "none");
        $("p.error").css("display", "none");
        $("p.error").show();
      }
    })
    // $.post("login.php", {"username": $("#username").val(), "password": $("#password").val()}, function(e) {
    //   if (e == "") {
    //     window.location.replace("panel.php");
    //   } else {
    //     $("p.error").html(e);
    //     $("br.error").css("display", "none");
    //     $("p.error").css("display", "none");
    //     $("p.error").show();
    //   }
    // })
  }
}
