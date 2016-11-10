hasQuestion = false;

window.onload = function() {
  /**
   * Add the name from the cookie
   */
  $('#name').html(Cookies.get('name'));

  /**
   * Handle visibility change
   */
   // Set the name of the hidden property and the change event for visibility
  var hidden, visibilityChange;
  if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }

  function handleVisibilityChange() {
    if (!document[hidden]) {
      $.ajax({
          'url': '/state',
          'success': function (response) {
            if (['new_game', 'idle', 'show_question', 'waiting_for_question', 'hide_question', 'end_game'].indexOf(response.state) >= 0) {
              hasQuestion = false;
              $('.pressed').removeClass('pressed');
            }

            if (['show_answers', 'waiting_for_answers', 'show_correct_answer', 'waiting_for_correct_answer', 'show_drinks', 'waiting_for_drinks'].indexOf(response.state) >= 0) {
              hasQuestion = true;
              if (!response.answer) {
                $('.pressed').removeClass('pressed');
              }
            }
          }
      });
    }
  }

  // Warn if the browser doesn't support addEventListener or the Page Visibility API
  if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
    console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
  } else {
    // Handle page visibility change
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
  }

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

  function clearState() {
    hasQuestion = false;
    $('.pressed').removeClass('pressed');
  }

  /**
   * Add the websocket connection
   */
  var connection = io(window.location.hostname + ':3232');

  connection.emit('subscribe', 'clear_question');
  connection.emit('subscribe', 'new_question');

  connection.on('clear_question', clearState);
  connection.on('new_question', function () {
    hasQuestion = true;
  });
}
