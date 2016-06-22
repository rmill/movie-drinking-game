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
      console.log('done waiting');
      this.currentQuestion = this.questions[time];
      this.currentState = this.SHOW_QUESTION;
    }
  };

  /**
   *  Show the question
   */
  Game.prototype.showQuestion = function(question) {
    console.log('show question');
    this.currentAnswers = {};
    this.win.webContents.send('show-question', question);
    this.currentState = this.SHOW_ANSWERS;
  };

  /**
   * Show the Answers
   */
  Game.prototype.showAnswers = function(time, question) {
    if (time >= question.movie_time + 5) {
      console.log('show answers');
      this.win.webContents.send('show-answers', question.answers, question.duration);
      this.currentState = this.WAITING_FOR_ANSWERS;
    }
  };

  /**
   * Waiting for the users to answer
   */
  Game.prototype.waitingForAnswers = function(time, question) {
    if (time >= question.movie_time + 5 + question.duration) {
      this.currentState = this.SHOW_CORRECT_ANSWER;
    }
  };

  /**
   * Show the answer
   */
  Game.prototype.showCorrectAnswer = function(question) {
    console.log('show correct answer');
    this.win.webContents.send('show-correct-answers', question.correct_answers);
    this.currentState = this.HIDE_QUESTION;
  };

  /**
   * Hide the question
   */
  Game.prototype.hideQuestion = function(time, question) {
    if (time > question.movie_time + question.duration + 5 + 5) {
      console.log('hide question');
      this.win.webContents.send('hide-question', question);
      this.currentQuestion = null;
      this.currentState = this.WAITING;
    }
  };

  /**
   * Set a player's answer
   */
  Game.prototype.answer = function(player, answer) {
    if (!this.currentQuestion ||
        this.currentAnswers[player])
    {
      return;
    }

    console.log('Answer: ' + player + ' ' + answer);
    this.currentAnswers[player] = answer;
  };

  module.exports = Game;
