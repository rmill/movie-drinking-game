const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const randomstring = require('randomstring');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');

const appDir = path.dirname(require.main.filename);

/**
 * The server used to discover local games
 */
function DiscoveryServer (port) {
  var app = express();
  var port = port || 6768;
  var games = {};

  app.use(bodyParser.urlencoded({extended: true}));
  app.use('/lib', express.static(path.join(appDir, '../node_modules')));
  app.use('/css', express.static(path.join(appDir, 'css')));
  app.use('/img', express.static(path.join(appDir, 'img')));
  // app.listen(port);

  var server = http.createServer(app);

  // Setup websockets
  var io = socketio(server);
  io.on('connection', (socket) => {
    console.log('Client connected');
    console.log(socket.handshake);
    socket.on('disconnect', () => console.log('Client disconnected'));
    socket.on('register', (data) => console.log(data));
  });

  console.log(`running on port ${port}`);

  // Redirect to a local game
  app.get('/', function (req, res) {
    const requestingIp = req.get('x-forwarded-for');

    if (!games[requestingIp]) {
      res.sendFile(path.join(appDir, 'view/notfound.html'));
      console.log(`${ requestingIp }: No game found.`);
      return;
    }

    const redirect = `http://${ games[requestingIp] }`;

    console.log(`${ requestingIp }: Redirecting to ${ redirect }`)

    res.redirect(redirect);
  });

  // Regiester a game's private IP
  // app.post('/register', function (req, res) {
  //   const requestingIp = req.get('x-forwarded-for');
  //
  //   console.log(`New Game: ${ requestingIp } -> ${ req.body['private_ip'] }`);
  //
  //   games[requestingIp] = req.body['private_ip'];
  //   res.end();
  // });

  server.listen(port);
}

function GameServer (game) {
  const socket = require('socket.io-client')('http://192.168.0.116:6768');
  socket.emit('register', {'test': 'testerssss'});

  var NAME_MAX_LENGTH = 16;

  var app = express();
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use('/css', express.static(path.join(appDir, 'css')));
  app.use('/img', express.static(path.join(appDir, 'img')));
  app.use('/js', express.static(path.join(appDir, 'js')));
  app.use('/lib', express.static(path.join(appDir, '../node_modules')));

  app.engine('html', mustacheExpress());
  app.set('view engine', 'mustache');
  app.set('views', path.join(appDir, 'view'));

  let self = this;
  this.game = game;

  app.get('/', function (req, res) {
    res.set('Access-Control-Allow-Origin', '*');

    // If a player has already registered, redirect to controller
    if (req.cookies.token &&
        req.cookies.name &&
        req.cookies.game_id == self.game.id)
    {
      res.redirect('/controller');
      return;
    }

    res.render('signin.html');
  });

  app.post('/', function (req, res) {
    var token = randomstring.generate();
    var name = req.body['user_name'].trim();

    if (!name) {
      res.redirect('/');
      return;
    }

    if (name.length > NAME_MAX_LENGTH) {
      res.render('signin.html', { error: `Name must be ${ NAME_MAX_LENGTH } characters or less` });
      return;
    }

    if (self.game.isNameTaken(name)) {
      res.render('signin.html', { error: `The name '${ name }' already taken` });
      return;
    }

    res.cookie('name', name);
    res.cookie('token', token);
    res.cookie('game_id', self.game.id);

    self.game.player(token, name);

    res.redirect('/controller');
  });

  app.get('/controller', function(req, res) {
    if (!req.cookies.token ||
        req.cookies.game_id != self.game.id)
    {
      res.redirect('/');
      return;
    }

    res.sendFile(path.join(appDir, 'view/controller.html'));
  });

  app.get('/game', function(req, res) {
    var json = {
      rules: self.game.rules,
      name: self.game.name
    };

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(json));
  });

  app.get('/state', function(req, res) {
    if (!req.cookies.token ||
        req.cookies.game_id != self.game.id)
    {
      res.status(401).send('Unauthorized');
      return;
    }

    var json = {
      state: self.game.getCurrentState(req.cookies) || null,
      answer: self.game.getCurrentAnswer(req.cookies.token) || null,
      question: self.game.getCurrentQuestion() || null,
      stats: self.game.getCurrentStats(req.cookies.token) || null
    };

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(json));
  });

  app.post('/answer', function(req, res) {
    if (!req.cookies.token ||
        req.cookies.game_id != self.game.id)
    {
      res.status(401).send('Unauthorized');
      return;
    }

    self.game.answer(req.cookies.token, req.body['answer_id']);

    res.end();
  });

  app.listen(3001);
}

module.exports = {DiscoveryServer, GameServer};
