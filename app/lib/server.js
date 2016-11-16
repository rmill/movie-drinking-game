const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const randomstring = require("randomstring");
const path = require("path");

const appDir = path.dirname(require.main.filename);

function DiscoveryServer (port) {
  var app = express();
  var port = port || 6768;
  var games = {};

  app.use(bodyParser.urlencoded({extended: true}));
  app.use('/lib', express.static(path.join(appDir, '../node_modules')));
  app.use('/css', express.static(path.join(appDir, 'css')));
  app.use('/img', express.static(path.join(appDir, 'img')));

  console.log(`running on port ${port}`);

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

  app.post('/register', function (req, res) {
    const requestingIp = req.get('x-forwarded-for');

    console.log(`New Game: ${ requestingIp } -> ${ req.body['private_ip'] }`);
    games[requestingIp] = req.body['private_ip'];
    res.end();
  });

  app.listen(port);
}

function GameServer (game) {
  var app = express();
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use('/css', express.static(path.join(appDir, 'css')));
  app.use('/img', express.static(path.join(appDir, 'img')));
  app.use('/js', express.static(path.join(appDir, 'js')));
  app.use('/lib', express.static(path.join(appDir, '../node_modules')));

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

    res.sendFile(path.join(appDir, 'view/signin.html'));
  });

  app.post('/', function (req, res) {
    var token = randomstring.generate();
    var name = req.body['user_name'];

    if (!name) {
      res.redirect('/');
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
