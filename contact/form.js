$('#submit').click(function() { submitForm(); });

function submitForm() {
  var formdata = new FormData($('form')[0]);
  console.log("submitted");
  $.ajax({
    url: 'form.php',
    data: formdata,
    type: 'POST',
    contentType: false,
    processData: false,
    success: function(response) {
      console.log(response);
    }
  });
}
