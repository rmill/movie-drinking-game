const randomstring = require("randomstring");

function Game(win, websockets, questions, endTime, rules, name) {
  this.NEW_GANE = 'new_game';
  this.WAITING = 'waiting';
  this.SHOW_QUESTION = 'show_question';
  this.SHOW_ANSWERS = 'show_answers';
  this.WAITING_FOR_ANSWERS = 'waiting_for_answers';
  this.SHOW_CORRECT_ANSWER = 'show_correct_answer';
  this.SHOW_DRINKS = 'show_drinks';
  this.HIDE_QUESTION = 'hide_question';
  this.END_GAME = 'end_game';

  this.id = randomstring.generate();
  this.win = win;
  this.name = name;
  this.rules = rules;
  this.websockets = websockets;
  this.questions = questions;
  this.players = {};
  this.currentQuestion = null;
  this.currentAnswers = {};
  this.endTime = endTime;
  this.currentState = this.NEW_GAME;
  this.statistics = new Statistics();
};

Game.prototype.processState = function(time) {
    var seconds = Math.floor(time);

    switch(this.currentState) {
      case this.NEW_GAME:
        break;
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
      case this.SHOW_DRINKS:
        this.showDrinks(seconds, this.currentQuestion, this.statistics.currentDrinks); break;
      case this.HIDE_QUESTION:
        this.hideQuestion(seconds, this.currentQuestion);break;
    }
};

/**
 * Start the game
 */
Game.prototype.start = function() {
  this.currentState = this.WAITING;
}

/**
 * The Game is currently waiting for a qestion
 */
Game.prototype.waiting = function(time) {
  if (this.questions[time]) {
    console.log('done waiting');
    this.currentQuestion = this.questions[time];
    this.currentState = this.SHOW_QUESTION;
  }

  if (time >= this.endTime) {
    console.log('ending game');
    this.currentState = this.END_GAME;
    this.endGame();
  }
};

/**
 *  Show the question
 */
Game.prototype.showQuestion = function(question) {
  console.log('show question');

  var slope = Math.pow(Math.random(), 2.2);
  var minMultiplyer = 1;
  var maxMultiplyer = 3;
  var multipler = (slope * (maxMultiplyer - minMultiplyer)) + minMultiplyer;
  var roundedMultipler = Math.round(multipler * 10) / 10;

  console.log('multiplyer: ' + roundedMultipler);

  question.drink_multiplyer = roundedMultipler
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
    question.start_time = new Date().getTime();
    this.win.webContents.send('show-answers', question.answers, question.duration);
    this.currentState = this.WAITING_FOR_ANSWERS;
    this.websockets.emit('new_question');
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
  this.websockets.emit('show_answers', question.correct_answers);
  this.statistics.process(this.currentQuestion, this.currentAnswers, this.players);
  this.currentState = this.SHOW_DRINKS;
};

/**
 * Show the drinks
 */
Game.prototype.showDrinks = function(time, question, drinks) {
  if (time > question.movie_time + question.duration + 5 + 5) {
    console.log('show drinks');
    this.win.webContents.send('show-drinks', drinks);
    this.websockets.emit('show_drinks', drinks);
    this.currentState = this.HIDE_QUESTION;
  }
};

/**
 * Hide the question
 */
Game.prototype.hideQuestion = function(time, question) {
  if (time > question.movie_time + question.duration + 5 + 5 + 5) {
    console.log('hide question');
    this.win.webContents.send('hide-question', question);
    this.currentQuestion = null;
    this.currentState = this.WAITING;
    this.websockets.emit('clear_question');
  }
};

/**
 * End the game
 */
Game.prototype.endGame = function() {
  this.statistics.compile(this.players);
  this.win.webContents.send('end-game', JSON.stringify(this.statistics));
};

/**
 * Set a player's answer
 */
Game.prototype.answer = function(playerToken, answer) {
  if (!this.currentState == this.WAITING_FOR_ANSWERS ||
      !this.players[playerToken] ||
      this.currentAnswers[playerToken])
  {
    return;
  }

  console.log('Answer: ' + this.players[playerToken] + ' ' + answer);

  this.currentAnswers[playerToken] = {
    'question': this.currentQuestion.id,
    'player': playerToken,
    'answer': parseInt(answer),
    'speed': new Date().getTime() - this.currentQuestion.start_time
  };
};

/**
 * Create or update a player
 */
Game.prototype.player = function(token, name) {
  if (this.currentState == this.NEW_GAME) {
    console.log('New Player: ' + name)
    this.win.webContents.send('new-player', name);
  }

  this.players[token] = name;
};

function Statistics () {
  this.players = {};
  this.mostCorrectAnswers = {};
  this.mostWrongAnswers = {};
  this.mostMissedAnswers = {};
  this.bestStreak = {};
  this.mostDrinks = {};
  this.bestAnswerSpeed = {};
  this.currentWrongPlayers = [];
  this.currentDrinks = [];
};

Statistics.prototype.process = function (question, answers, players) {
  this.currentWrongPlayers = [];
  this.currentDrinks = [];

  for (playerToken in players) {
    if (!this.players[playerToken]) {
      this.players[playerToken] = this.newPlayer(playerToken);
    }

    var player = this.players[playerToken];
    var answer = answers[playerToken];

    this.updateAnswerCount(question, answer, player);
    this.updateStreak(question, answer, player);
    this.updateAnswerSpeed(answer, player);
  }

  this.updateDrinks(question, players, this.currentWrongPlayers);
};

Statistics.prototype.updateAnswerCount = function (question, answer, player) {
  if (answer) {
    // Add the right and wrong answers
    if (question.correct_answers.indexOf(answer.answer) >= 0) {
      player.correctAnswers++;
    } else {
      player.wrongAnswers++;
      this.currentWrongPlayers.push(player);
    }
  } else {
    // Add the missed answers
    player.missedAnswers++;
    this.currentWrongPlayers.push(player);
  }
};

Statistics.prototype.updateStreak = function (question, answer, player) {
  if (answer &&
      question.correct_answers.indexOf(answer.answer) >= 0)
  {
    player.currentStreak++;

    if (player.currentStreak > player.bestStreak) {
      player.bestStreak = player.currentStreak;
    }
  } else {
    player.currentStreak = 0;
  }
};

Statistics.prototype.updateAnswerSpeed = function (answer, player) {
  var numQuestions = player.correctAnswers + player.wrongAnswers + player.missedAnswers
  var answerSpeed = (answer) ? answer.speed : 10;

  player.answerSpeed = player.answerSpeed + ((answerSpeed - player.answerSpeed) / numQuestions);
};

Statistics.prototype.updateDrinks = function (question, allPlayers, wrongPlayers) {
  var drinkingPlayers;
  var allPlayerIds = [];
  var wrongPlayerIds = [];
  var drinks;

  for(var playerToken in allPlayers) allPlayerIds.push(playerToken);
  for(var index in wrongPlayers) wrongPlayerIds.push(wrongPlayers[index].id);

  if (wrongPlayers.length == 0) {
    console.log('SOCIABLES!');
    return;
  }  else {
    drinkingPlayers = wrongPlayerIds;
    drinks = Math.ceil(allPlayerIds.length * question.drink_multiplyer / wrongPlayers.length);
  }

  for (index in drinkingPlayers) {
    var playerToken = drinkingPlayers[index];
    this.players[playerToken].drinks += drinks;
    this.currentDrinks.push({
      drinks: drinks,
      name: allPlayers[playerToken]
    });
  }
};

Statistics.prototype.compile = function (gamePlayers) {
  for (playerId in this.players) {
    var player = this.players[playerId];
    player.name = gamePlayers[playerId]

    switch (true) {
      case (player.correctAnswers === this.mostCorrectAnswers.correctAnswers):
        if (player.answerSpeed < this.mostCorrectAnswers.answerSpeed) {
          break;
        }
      case this.mostCorrectAnswers.correctAnswers === undefined:
      case (player.correctAnswers > this.mostCorrectAnswers.correctAnswers):
        this.mostCorrectAnswers = player;
    }

    switch (true) {
      case (player.wrongAnswers === this.mostWrongAnswers.wrongAnswers):
        if (player.answerSpeed > this.mostWrongAnswers.answerSpeed) {
          break;
        }
      case this.mostWrongAnswers.wrongAnswers === undefined:
      case (player.wrongAnswers > this.mostWrongAnswers.wrongAnswers):
        this.mostWrongAnswers = player;
    }

    switch (true) {
      case (player.missedAnswers === this.mostMissedAnswers.wrongAnswers):
        if (player.answerSpeed > this.mostMissedAnswers.answerSpeed) {
          break;
        }
      case this.mostMissedAnswers.wrongAnswers === undefined:
      case (player.missedAnswers > this.mostMissedAnswers.wrongAnswers):
        this.mostMissedAnswers = player;
    }

    switch (true) {
      case (player.bestStreak === this.bestStreak.bestStreak):
        if (player.answerSpeed > this.bestStreak.answerSpeed) {
          break;
        }
      case this.bestStreak.bestStreak === undefined:
      case (player.bestStreak > this.bestStreak.bestStreak):
        this.bestStreak = player;
    }

    switch (true) {
      case (player.answerSpeed > this.bestAnswerSpeed.answerSpeed):
      case (this.bestAnswerSpeed.answerSpeed === undefined):
        this.bestAnswerSpeed = player;
    }

    switch (true) {
      case (player.drinks === this.mostDrinks.drinks):
        if (player.answerSpeed > this.mostDrinks.answerSpeed) {
          break;
        }
      case this.mostDrinks.drinks === undefined:
      case (player.drinks > this.mostDrinks.drinks):
        this.mostDrinks = player;
    }
  }
};

Statistics.prototype.newPlayer = function (playerToken) {
  return {
    id: playerToken,
    correctAnswers: 0,
    wrongAnswers: 0,
    missedAnswers: 0,
    answerSpeed: 0.0,
    bestStreak: 0,
    currentStreak : 0,
    drinks: 0
  };
}

module.exports = Game;
