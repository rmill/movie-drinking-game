hasQuestion = false;

window.onload = function() {
  var isHorizontal = null;

  /**
   * Resize the buttons when the winsow changes
   */
  $(window).on('resize', function() {
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();

    if (windowHeight > windowWidth) {
      $('.controller-button').each(function() {
        var width = $(this).outerWidth();
        $(this).css({
          'height':width+'px',
          'width': '100%'
        });

        $(this).css({
          'height':width+'px',
          'width': '100%'
        });
      });
    } else {
      $('.controller-button').each(function() {
        var height = $(this).outerHeight();
        $(this).css({
          'width':height+'px',
          'height': '100%'
        });

        $(this).css({
          'width':height+'px',
          'height': '100%'
        });
      });
    }

    var newIsHorizontal = windowWidth > windowHeight;
    if (isHorizontal === null ||
        isHorizontal !== newIsHorizontal)
    {
      isHorizontal = newIsHorizontal;
      $(window).trigger('resize');
    }

    var height = $('.header').height();
    $('.header').css({
      'font-size': height / 2 + 'px'
    });
  });

  $(window).trigger('resize');

  /**
   * Add the name from the cookie
   */
  $('#name').html(Cookies.get('name'));

  /**
   * Handle the button click
   */
  $('.controller-button').click(function(e) {
    e.preventDefault();

    // Only allow one answer per question
    var hasAnswer = $('.pressed').length > 0;
    if (!hasQuestion ||
        hasAnswer)
    {
      return;
    }

    $(this).addClass('pressed');

    // Send the answer to the server
    $.ajax({
      'url': '/answer',
      'method': 'POST',
      'data': {'answer_id': $(this).data('answer-id')}
    });
  });

  /**
   * Add the websocket connection
   */
  var connection = io('127.0.0.1');

  connection.emit('subscribe', 'clear_question');
  connection.emit('subscribe', 'new_question');

  connection.on('clear_question', function () {
    hasQuestion = false;
    $('.pressed').removeClass('pressed');
  });

  connection.on('new_question', function () {
    hasQuestion = true;
  });
}
