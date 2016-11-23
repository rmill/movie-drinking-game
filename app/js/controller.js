hasQuestion = false;

window.onload = function() {
  /**
   * Add the name from the cookie
   */
  $('#name').html(Cookies.get('name'));

  // Fit the name into the screen width
  while ($('.content-name').innerWidth() > $('.content-buttons').innerWidth()) {
    var fontSize = parseFloat($('#name').css('font-size'));
    $('#name').css('font-size', fontSize - 1);
  }

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
            const hasQuestionStates = ['show_answers', 'waiting_for_answers'];
            const showQuestionStates = ['show_question', 'waiting_for_question', 'show_answers', 'waiting_for_answers', 'show_correct_answer', 'waiting_for_correct_answer', 'show_drinks', 'waiting_for_drinks'];

            hasQuestion = hasQuestionStates.indexOf(response.state) >= 0;

            if (showQuestionStates.indexOf(response.state) >= 0) {
              $('#name').html(response.question.text);
            } else {
              $('#name').html(Cookies.get('name'));
            }

            if (!response.answer) {
              $('.pressed').removeClass('pressed');
            }

            updateStats(response.stats);
          },
          'error': function () {
            window.location.replace("http://www.drinkupcinema.com");
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
    $('#name').html(Cookies.get('name'));
  }

  function updateStats(stats) {
    if (!stats) {
      return;
    }

    $('.score-correct span').html(stats.correctAnswers);
    $('.score-incorrect span').html(stats.wrongAnswers);
    $('.score-missed span').html(stats.missedAnswers);
    $('.score-drinks span').html(stats.drinks);
  }

  /**
   * Add the websocket connection
   */
  var connection = io(window.location.hostname + ':3232');

  connection.emit('subscribe', 'hide_question');
  connection.emit('subscribe', 'show_question');
  connection.emit('subscribe', 'show_answers');
  connection.emit('subscribe', 'show_correct_answers');

  connection.on('hide_question', clearState);
  connection.on('show_question', function (showQuestion) {
    $('#name').html(showQuestion.text);
  });
  connection.on('show_answers', function () {
    hasQuestion = true;
  });
  connection.on('show_correct_answers', function(showCorrectAnswers) {
    hasQuestion = false;
    updateStats(showCorrectAnswers.stats[Cookies.get('token')]);
  });
}
