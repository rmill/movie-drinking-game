const {ipcRenderer} = require('electron');
const $ = require('jquery');
const os = require('os');
const networkInterfaces = os.networkInterfaces();

window.onload = function() {
  $.each(networkInterfaces, function(index, networkInterface) {
    $.each(networkInterface, function(index2, socket) {
      if (!socket.internal && socket.family === 'IPv4') {
        console.log('IP: ' + socket.address);
      }
    });
  });

  $('.start').click(function () {
    ipcRenderer.send('start-game');
    $('#intro').fadeOut();
    $('#movie').get(0).play();
  })

  var movie = document.querySelector('.movie');
  var timer = $('.timer-foreground');

  movie.addEventListener('timeupdate', function () {
    ipcRenderer.send('movie-time', movie.currentTime);
  })

  ipcRenderer.on('new-player', function(event, name, state) {
    var positions = [
      {top: 89, left: 200},
      {top: 800, left: 1500},
      {top: 610, left: 39},
      {top: 212, left: 1300},
      {top: 319, left: 299},
      {top: 500, left: 1450},
      {top: 900, left: 300},
      {top: 58, left: 1500},
      {top: 481, left: 110},
      {top: 621, left: 1400},
      {top: 700, left: 200},
      {top: 400, left: 1400},
      {top: 174, left: 114},
      {top: 900, left: 1600},
      {top: 800, left: 76}
    ];

    var el = $('#intro');
    var div = '<div class="player animated pulse infinite">' + name +'</div>';

    var numPlayers = $('.player').length;
    if (numPlayers >= positions.length) {
      var top = Math.random() * parseInt(el.css('height'), 10);
      var left = Math.random() * parseInt(el.css('width'), 10);
    } else {
      var top = positions[numPlayers].top
      var left = positions[numPlayers].left
    }

    var playerEl = $(div).appendTo(el).css({
      top: top + 'px',
      left: left + 'px'
    });
  });

  ipcRenderer.on('show-question', function(event, question) {
    $('.question-text').html(question.text);
    showQuestion();
  });

  ipcRenderer.on('show-answers', function(event, answers, duration) {
    $('#answer-0').html(answers[0]);
    $('#answer-1').html(answers[1]);
    $('#answer-2').html(answers[2]);
    $('#answer-3').html(answers[3]);
    $('table').css('visibility', 'visible');

    startTimer(duration);
  });

  ipcRenderer.on('show-correct-answers', function(event, answers) {
    for (var i=0; i<answers.length; i++) {
      stopTimer();
      $('#answer-' + answers[i]).closest('.answer').addClass('correct');
    }
  });

  ipcRenderer.on('show-drinks', function(event, drinks) {
    hideQuestion();

    var numDrinkers = drinks.length;

    if (numDrinkers == 0) {
      $('#sociables-overlay').show();
      return;
    }

    // Add the drinkers' names
    var drinkersElement = "";
    for (var i=0; i < drinks.length; i++) {
      var rowItem = i % 4;

      if (rowItem === 0) {
        drinkersElement += "<tr>";
      }

      drinkersElement += "<td>" + drinks[i].name + "</td>";

      if (rowItem === 3) {
        drinkersElement += "</tr>";
      }
    }

    var numDrinks = Math.min(drinks[0].drinks, 10);
    $('#drinks-overlay .badge').attr('src', '../img/drinks-' + numDrinks + '.png');
    $('#drinks-overlay table tbody').html(drinkersElement);
    $('#drinks-overlay').show();
  });

  ipcRenderer.on('hide-question', function(event) {
    $('#drinks-overlay').hide();
    $('#sociables-overlay').hide();
    $('#question-overlay table').css('visibility', 'hidden');
    $('.correct').removeClass('correct');
    $('#question-overlay .timer-foreground').width("100%");
  });

  ipcRenderer.on('end-game', function(event, ending) {
    var stats = JSON.parse(ending.stats);

    $('.credits .movie-title').html(ending.title);

    $('.movie').fadeOut(1000, function() {
      $('.most-correct').html(stats.mostCorrectAnswers.name);
      $('.most-wrong').html(stats.mostWrongAnswers.name);
      $('.most-missed').html(stats.mostMissedAnswers.name);
      $('.best-streak').html(stats.bestStreak.name);
      $('.most-drinks').html(stats.mostDrinks.name);
      $('.quickest-answers').html(stats.bestAnswerSpeed.name);

      $('.credits').addClass('animate');
    });
  });

  let interval;

  function startTimer(duration) {
    var startTime = movie.currentTime;

    interval = setInterval(function() {
      var currentTime = movie.currentTime;
      var timerWidth = 100.0 - (100.0 * ((currentTime - startTime) / duration));
      timer.css('width', timerWidth + '%');
    }, 50);
  }

  function stopTimer() {
    clearInterval(interval);
    timer.css('width', '0%');
  }

  function showQuestion() {
    $('#question-overlay').attr('class', 'overlay animated').addClass(getRandomShowClass()).show();
  }

  function hideQuestion() {
    $('#question-overlay').attr('class', 'overlay animated').addClass(getRandomHideClass());
  }

  function getRandomShowClass() {
    var renderFunctions = [
      'bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight', 'bounceInUp',
      'fadeIn', 'fadeInDown', 'fadeInDownBig', 'fadeInLeft', 'fadeInLeftBig', 'fadeInRight', 'fadeInRightBig', 'fadeInUp', 'fadeInUpBig',
      'flipInX', 'flipInY',
      'lightSpeedIn',
      'rotateIn', 'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRight',
      'rollIn',
      'zoomIn', 'zoomInDown', 'zoomInLeft', 'zoomInRight', 'zoomInUp',
      'slideInDown', 'slideInLeft', 'slideInRight', 'slideInUp'
    ];

    var index = Math.round(Math.random() * (renderFunctions.length - 1));

    return renderFunctions[index];
  }

  function getRandomHideClass() {
    var renderFunctions = [
      'bounceOut', 'bounceOutDown', 'bounceOutLeft', 'bounceOutRight', 'bounceOutUp',
      'fadeOut', 'fadeOutDown',  'fadeOutDownBig', 'fadeOutLeft',  'fadeOutLeftBig',  'fadeOutRight', 'fadeOutRightBig',  'fadeOutUp', 'fadeOutUpBig',
      'flipOutX', 'flipOutY',
      'lightSpeedOut',
      'rotateOut', 'rotateOutDownLeft', 'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight',
      'rollOut',
      'zoomOut', 'zoomOutDown', 'zoomOutLeft', 'zoomOutRight', 'zoomOutUp',
      'slideOutDown', 'slideOutLeft', 'slideOutRight', 'slideOutUp'
    ];

    var index = Math.round(Math.random() * (renderFunctions.length - 1));

    return renderFunctions[index];
  };
}
