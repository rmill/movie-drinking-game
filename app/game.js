function Game(win, questions) {
  this.WAITING = 'waiting';
  this.SHOW_QUESTION = 'show_question';
  this.SHOW_ANSWERS = 'show_answers';
  this.WAITING_FOR_ANSWERS = 'waiting_for_answers';
  this.SHOW_CORRECT_ANSWER = 'show_correct_answer';
  this.HIDE_QUESTION = 'hide_question';

  this.win = win;
  this.questions = questions;
  this.players = {};
  this.currentQuestion = null;
  this.currentAnswers = {};
  this.currentState = this.WAITING;
};

Game.prototype.processState = function(time) {
    var seconds = Math.floor(time);

    switch(this.currentState) {
      case this.WAITING:
        this.waiting(seconds); break;
      case this.SHOW_QUESTION:
        this.showQuestion(this.currentQuestion); break;
      case this.SHOW_ANSWERS:
        this.showAnswers(seconds, this.currentQuestion); break;
      case this.WAITING_FOR_ANSWERS:
        this.waitingForAnswers(seconds, this.currentQuestion); break;
      case this.SHOW_CORRECT_ANSWER:
        this.showCorrectAnswer(this.currentQuestion); break;
      case this.HIDE_QUESTION:
        this.hideQuestion(seconds, this.currentQuestion);
    }
};

  /**
   * The Game is currently waiting for a qestion
   */
  Game.prototype.waiting = function(time) {
    if (this.questions[time]) {
      this.currentQuestion = this.questions[time];
      this.currentState = Game.SHOW_QUESTION;
    }
  };

  /**
   *  Show the question
   */
  Game.prototype.startQuestion = function(question) {
    this.currentAnswers = {};
    this.win.webContents.send('show-question', question);
    this.currentState = this.SHOW_ANSWERS;
  };

  /**
   * Show the Answers
   */
  Game.prototype.showAnswers = function(time, question) {
    if (time >= question.movie_time + 3) {
      this.win.webContents.send('show-question', question.answers);
      this.currentState = this.WAITNG_FOR_ANSWERES;
    }
  };

  /**
   * Waiting for the users to answer
   */
  Game.prototype.waitingForAnswers = function(time, question) {
    if (time >= question.movie_time + question.duration) {
      this.currentState = this.SHOW_ANSWERS;
    }
  };

  /**
   * Show the answer
   */
  Game.prototype.showAnswer = function(question) {
    this.win.webContents.send('show-answer', question.correct_answers);
    this.currentSTate = this.HIDE_QUESTION;
  };

  /**
   * Hide the question
   */
  Game.prototype.hideQuestion = function(time, question) {
    if (time > question.movie_time + question.duration + 3) {
      this.win.webContents.send('hide-question', question);
      this.currentQuestion = null;
      this.currentState = this.WAITING;
    }
  };

  module.exports = Game;
