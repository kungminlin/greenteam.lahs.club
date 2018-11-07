$("#post-entry").click(function() { submitForm(); });

function submitForm() {
  $.ajax({
    url: 'blogpost.php',
    data: new FormData($('form')[0]),
    type: 'POST',
    contentType: false,
    processData: false,
    success: function() {
      $('.notification').slideDown(200).delay(800).slideUp(200, function() {
        location.reload();
      });
    },
    error: function (request, status, error) {
      $('.notification h3').text('Error');
      $('.notification p').text(error);
      $('.notification').slideDown(200).delay(800).slideUp(200);
    }
  });
}
