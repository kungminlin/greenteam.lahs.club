$('.icon.fa-close').click(function() {
  var id = $(this).parent().parent().attr('data-id');
  var container = $(this).parent().parent().parent();
  $.ajax({
    url: 'delete.php',
    method: 'post',
    data: {'id': id},
    success: function(response) {
      if (response == "success") {
        container.css({'background-color': 'rgba(255, 100, 100, 0.7)', 'color': 'white'}).slideUp(400, function() {
          $(this).remove();
          if ($('.content ul').children().length == 0) $('.content ul').html('<li><p>No posts to edit.</p></li>');

        });
        $('.notification').css('background-color', 'rgba(255, 100, 100, 0.7)').slideDown(400).delay(1000).slideUp(400);
      }
    }
  })
})
