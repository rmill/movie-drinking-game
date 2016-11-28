function init() {
  const controller = new Controller({
    name: Cookies.get('name'),
    nameEl: $('#name'),
    rulesViewEl: $('.rules'),
    buttonsViewEl: $('.content-buttons'),
    viewToggleEl: $('.switch'),
    scoreCorretEl: $('.score-correct span'),
    scoreWrongEl: $('.score-incorrect span'),
    scoreMissedEl: $('.score-missed span'),
    scoreDrinksEl: $('.score-drinks span')
  });

  initVibrator(controller);
  initLockScreen(controller);
  initClickEvents(controller);
  initWebsockets(controller);
}

function initVibrator(controller) {
  const vibrator = navigator.vibrate ||
                   navigator.webkitVibrate ||
                   navigator.mozVibrate ||
                   navigator.msVibrate;

  controller.setVibrator(vibrator);
}

function initLockScreen(controller) {
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

  if (typeof document.addEventListener !== "undefined" || typeof document[hidden] !== "undefined") {
    document.addEventListener(
      visibilityChange,
      function () {
        if (!document[hidden]) {
          controller.refreshState();
        }
      },
      false
    );
  }
}

function initClickEvents(controller) {
  // Handle the button click
  $('.controller-button').on('click tap', function(e) {
    e.preventDefault();
    $.proxy(controller.submitAnswer($(this)), controller);
  });

  // Handle the view toggle click
  $('.switch').click($.proxy(controller.toggleView, controller));
}

function initWebsockets(controller) {
  var connection = io(window.location.hostname + ':3232');

  connection.emit('subscribe', 'hide_question');
  connection.emit('subscribe', 'show_question');
  connection.emit('subscribe', 'show_answers');
  connection.emit('subscribe', 'show_correct_answers');

  connection.on('hide_question', $.proxy(controller.clearQuestion, controller));
  connection.on('show_question', $.proxy(controller.showQuestion, controller));
  connection.on('show_answers', $.proxy(controller.unlockAnswers, controller));
  connection.on('show_correct_answers', function(showCorrectAnswers) {
    controller.updateStats(showCorrectAnswers.stats[Cookies.get('token')]);
  });
}

window.onload = init;
