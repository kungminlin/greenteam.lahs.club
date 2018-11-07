$('#post-entry').click(function() { submitForm(); });

function submitForm() {
  var formdata = new FormData($('form')[0]);
  formdata.append('id', $('form').attr('data-id'));
  formdata.append('original-img', $('form').attr('data-img'));
  $.ajax({
    url: 'processedit.php',
    data: formdata,
    type: 'POST',
    contentType: false,
    processData: false,
    success: function(response) {
      $('.notification').slideDown(200).delay(800).slideUp(200, function() {
        location.assign('.');
      });
    }
  });
}
