hasQuestion = false;

window.onload = function() {
  /**
   * Add the name from the cookie
   */
  $('#name').html(Cookies.get('name'));

  /**
   * Handle the button click
   */
  $('.controller-button').on('click tap', function(e) {
    e.preventDefault();

    // enable vibration support
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

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

  $('.switch').click(function() {
    if ($('.rules').is(':visible')) {
      $('.rules').hide();
      $('.content-buttons').show();
      $(this).removeClass('fa-close').addClass('fa-question-circle');
    } else {
      $('.content-buttons').hide();
      $('.rules').show();
      $(this).removeClass('fa-question-circle').addClass('fa-close');
    }
  })

  $.ajax({
    'url': '/game',
    'method': 'GET',
    'success': function(game) {
      var rulesEl = $('.rules ul');
      for (var i in game.rules) {
        var rule = $('<li></li>').appendTo(rulesEl);
        rule.text(game.rules[i]); // Use text() to prevent rendering of HTML
      }
    }
  });

  /**
   * Add the websocket connection
   */
  var connection = io('192.168.0.116');

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
