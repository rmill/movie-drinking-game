var dgram = require('dgram');
var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var randomstring = require("randomstring");
var path = require("path");

var app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/lib', express.static(path.join(__dirname, '../node_modules')));

var expressWs = require('express-ws')(app);

function Server (game) {
  let self = this;
  this.game = game;

  app.ws('/echo', function(ws, req) {
    ws.on('message', function(msg) {
      ws.send(msg);
    });
  });

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/view/signin.html');
  });

  app.post('/', function (req, res) {
    var token = randomstring.generate();

    res.cookie('name', req.body['user_name'])
    res.cookie('token', token)

    res.redirect('/controller');
  });

  app.get('/controller', function(req, res) {
    if (!req.cookies.token) {
      res.redirect('/');
    }

    res.sendFile(__dirname + '/view/controller.html');
  });

  app.post('/answer', function(req, res) {
    if (!req.cookies.token) {
      res.returnStatus(401);
    }

    self.game.answer(req.cookies.token, req.body['answer_id']);

    res.end();
  });

  app.listen(3001);
}

module.exports = Server;
