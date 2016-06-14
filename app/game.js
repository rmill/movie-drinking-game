var Game = {

  players: {},
  currentQuestion: null,
  currentAnswers: {},

  startQuestion: function(question) {
    this.currentQuestion = question;
    this.currentAnswers = {};
  },

  finishQuestion: function() {
    this.currentQuestion = null;



    this.currentAnswers = null;
  },

  answer: function(user_token, answer_id) {
    // Only process answers if there is an active question
    if (this.currentQuestion === null) {
      return;
    }

    // Only let people answer once
    if (this.currentAnswers[user_token] !== undefined) {
      return;
    }

    this.currentAnswers[user_token] = answer_id;
  }
}
