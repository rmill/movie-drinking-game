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
      $('table').show();
      $(this).removeClass('fa-close').addClass('fa-question-circle-o');
    } else {
      $('table').hide();
      $('.rules').show();
      $(this).removeClass('fa-question-circle-o').addClass('fa-close');
    }
  })

  $.ajax({
    'url': '/game',
    'method': 'GET',
    'success': function(game) {
      console.log(game);
      $('.rules .movie-title').text(game.name);

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
