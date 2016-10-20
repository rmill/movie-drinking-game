const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const randomstring = require("randomstring");
const path = require("path");

var app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/lib', express.static(path.join(__dirname, '../node_modules')));

function Server (game) {
  let self = this;
  this.game = game;

  app.get('/', function (req, res) {
    // If a player has already registered, redirect to controller
    if (req.cookies.token &&
        req.cookies.name &&
        req.cookies.game_id == self.game.id)
    {
      res.redirect('/controller');
    }

    res.sendFile(__dirname + '/view/signin.html');
  });

  app.post('/', function (req, res) {
    var token = randomstring.generate();
    var name = req.body['user_name'];

    if (!name) {
      res.redirect('/');
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
    }

    res.sendFile(__dirname + '/view/controller.html');
  });

  app.get('/game', function(req, res) {
    var json = {
      rules: self.game.rules,
      name: self.game.name
    };

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(json));
  });

  app.post('/answer', function(req, res) {
    if (!req.cookies.token ||
        req.cookies.game_id != self.game.id)
    {
      res.returnStatus(401);
    }

    self.game.answer(req.cookies.token, req.body['answer_id']);

    res.end();
  });

  app.listen(3001);
}

module.exports = Server;
