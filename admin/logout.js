$('#logout').click(function() { logout(); });

function logout() {
  $.ajax({
    url: 'logout.php',
    type: 'POST'
  });
}
