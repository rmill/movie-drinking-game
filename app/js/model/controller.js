class Controller {

  constructor(options) {
    this.hasAnswer = false;
    this.hasQuesetion = false;
    this.vibrater = null;

    this.nameEl = options.nameEl;
    this.rulesViewEl = options.rulesViewEl;
    this.buttonsViewEl = options.buttonsViewEl;
    this.viewToggleEl = options.viewToggleEl;
    this.scoreCorretEl = options.scoreCorretEl;
    this.scoreWrongEl = options.scoreWrongEl;
    this.scoreMissedEl = options.scoreMissedEl;
    this.scoreDrinksEl = options.scoreDrinksEl;

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
  }

  toggleView () {
    if (this.rulesViewEl.is(':visible')) {
      this.rulesViewEl.hide();
      this.buttonsViewEl.show();
      this.viewToggleEl.removeClass('fa-close').addClass('fa-question-circle');
    } else {
      this.rulesViewEl.show();
      this.buttonsViewEl.hide();
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

  clearQuestion () {
    this.hasQuestion = false;
    this.hasAnswer = false;
    $('.pressed').removeClass('pressed');
    this.showName();
  }

  refreshState () {
    var self = this;

    $.ajax({
        url: '/state',
        success: function (response) {
          const hasQuestionStates = ['show_answers', 'waiting_for_answers'];
          const showQuestionStates = ['show_question', 'waiting_for_question', 'show_answers', 'waiting_for_answers', 'show_correct_answer', 'waiting_for_correct_answer', 'show_drinks', 'waiting_for_drinks'];

          self.hasQuestion = hasQuestionStates.indexOf(response.state) >= 0;

          if (showQuestionStates.indexOf(response.state) >= 0) {
            self.nameEl.html(response.question.text);
          } else {
            self.nameEl.html(self.name);
          }

          if (!response.answer) {
            $('.pressed').removeClass('pressed');
          }

          self.updateStats(response.stats);
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
}
