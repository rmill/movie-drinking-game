class Controller {

  constructor(options) {
    this.hasAnswer = false;
    this.hasQuesetion = false;
    this.vibrater = null;

    this.nameEl = options.nameEl;
    this.rulesViewEl = options.rulesViewEl;
    this.controllerViewEl = options.controllerViewEl;
    this.buttonsViewEl = options.buttonsViewEl;
    this.waitingViewEl = options.waitingViewEl;
    this.viewToggleEl = options.viewToggleEl;
    this.scoreCorretEl = options.scoreCorretEl;
    this.scoreWrongEl = options.scoreWrongEl;
    this.scoreMissedEl = options.scoreMissedEl;
    this.scoreDrinksEl = options.scoreDrinksEl;
    this.waitTimeEl = options.waitTimeEl;

    this.setName(options.name);
  }

  setName (name) {
    this.name = name;
    this.showName();

    // Fit the name into the screen width
    while ($('.content-name').innerWidth() > $('.content-buttons').innerWidth()) {
      const fontSize = parseFloat(this.nameEl.css('font-size'));
      this.nameEl.css('font-size', fontSize - 1);
    }
  }

  setVibrator (vibrator) {
    this.vibrator = vibrator;
  }

  showName () {
    this.nameEl.html(this.name);
  }

  showQuestion (question) {
    this.nameEl.html(question.text);
    this.buttonsViewEl.show();
    this.waitingViewEl.hide();


    $('[data-answer-id=0]').html(question.answers[0]);
    $('[data-answer-id=1]').html(question.answers[1]);
    $('[data-answer-id=2]').html(question.answers[2]);
    $('[data-answer-id=3]').html(question.answers[3]);
  }

  clearQuestion () {
    this.hasQuestion = false;
    this.hasAnswer = false;
    $('.pressed').removeClass('pressed');
    this.showName();
    this.waitingViewEl.show();
    this.buttonsViewEl.hide();
  }

  toggleView () {
    if (this.rulesViewEl.is(':visible')) {
      this.rulesViewEl.hide();
      this.controllerViewEl.show();
      this.viewToggleEl.removeClass('fa-close').addClass('fa-question-circle');
    } else {
      this.rulesViewEl.show();
      this.controllerViewEl.hide();
      this.viewToggleEl.removeClass('fa-question-circle').addClass('fa-close');
    }
  }

  submitAnswer (buttonEl) {
    this.vibrate(50);

    // Only allow one answer per question
    if (!this.hasQuestion || this.hasAnswer) {
      return;
    }

    this.hasAnswer = true;
    buttonEl.addClass('pressed');

    // Send the answer to the server
    $.ajax({
      url: '/answer',
      method: 'POST',
      data: { answer_id: buttonEl.data('answer-id') }
    });
  }

  vibrate (duration) {
    if (this.vibrater) {
      this.vibrater.vibrate(duration);
    }
  }

  unlockAnswers () {
    this.hasAnswer = false;
    this.hasQuestion = true;
  }

  refreshState () {
    var self = this;

    $.ajax({
        url: '/state',
        success: function (response) {
          const hasQuestionStates = ['show_answers', 'waiting_for_answers'];
          const showQuestionStates = ['show_question', 'waiting_for_question', 'show_answers', 'waiting_for_answers', 'show_correct_answer', 'waiting_for_correct_answer', 'show_drinks', 'waiting_for_drinks'];

          self.updateStats(response.stats);
          self.updateWaitTime(response.wait_time);

          if (showQuestionStates.indexOf(response.state) >= 0) {
            self.hasQuestion = hasQuestionStates.indexOf(response.state) >= 0;
            self.showQuestion(response.question);

            if (response.answer) {
              $(`.controller-button[data-answer-id=${ response.answer.answer }]`).addClass('pressed');
            } else {
              $('.pressed').removeClass('pressed');
            }
          } else {
            self.clearQuestion();
          }
        },
        error: function () {
          window.location.replace("http://www.drinkupcinema.com");
        }
    });
  }

  updateStats (stats) {
    if (!stats) {
      return;
    }

    this.scoreCorretEl.html(stats.correctAnswers);
    this.scoreWrongEl.html(stats.wrongAnswers);
    this.scoreMissedEl.html(stats.missedAnswers);
    this.scoreDrinksEl.html(stats.drinks);
  }

  updateWaitTime(waitTime) {
    const denomination = (waitTime <= 60) ? 'Minute' : 'Minutes';
    this.waitTimeEl.html(`${ Math.ceil(waitTime / 60) } ${ denomination }`);
  }
}
