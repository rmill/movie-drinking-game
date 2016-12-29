class Controller {

  constructor(options) {
    this.hasAnswer = false;
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
  }

  setVibrator (vibrator) {
    this.vibrator = vibrator;
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
    this.hasAnswer = false;
    $('.pressed').removeClass('pressed');
    $('.disabled').removeClass('disabled');
    this.waitingViewEl.show();
    this.buttonsViewEl.hide();
    $('.content-buttons table').hide();
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
    if (this.hasAnswer) {
      return;
    }

    buttonEl.addClass('pressed');
    this.disableButtons();

    // Send the answer to the server
    $.ajax({
      url: '/answer',
      method: 'POST',
      data: { answer_id: buttonEl.data('answer-id') }
    });
  }

  disableButtons() {
    this.hasAnswer = true;
    $('.controller-button:not(.pressed)').addClass('disabled');
  }

  vibrate (duration) {
    if (this.vibrater) {
      this.vibrater.vibrate(duration);
    }
  }

  showAnswers (fadeIn=true) {
    if (fadeIn) {
      $('.content-buttons table').fadeIn();
    } else {
      $('.content-buttons table').show();
    }
    this.hasAnswer = false;
  }

  refreshState () {
    var self = this;

    $.ajax({
        url: '/state',
        success: function (response) {
          const showAnswersStates = ['show_answers', 'waiting_for_answers', 'show_correct_answer', 'waiting_for_correct_answer', 'show_drinks', 'waiting_for_drinks'];
          const disableAnswerStates = ['show_correct_answer', 'waiting_for_correct_answer', 'show_drinks', 'waiting_for_drinks'];
          const showQuestionStates = ['show_question', 'waiting_for_question', 'show_answers', 'waiting_for_answers', 'show_correct_answer', 'waiting_for_correct_answer', 'show_drinks', 'waiting_for_drinks'];

          self.updateStats(response.stats);
          self.updateWaitTime(response.wait_time);

          if (showAnswersStates.indexOf(response.state) >= 0) {
            self.showAnswers(false);
          }

          if (disableAnswerStates.indexOf(response.state) >= 0) {
            self.disableButtons();
          }

          if (showQuestionStates.indexOf(response.state) >= 0) {
            self.showQuestion(response.question);

            if (response.answer) {
              self.submitAnswer($(`.controller-button[data-answer-id=${ response.answer.answer }]`));
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
