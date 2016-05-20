var dgram = require('dgram');
var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var randomstring = require("randomstring");

var app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static('public'));

var client = dgram.createSocket('udp4');

app.get('/', function (req, res) {
  res.sendFile('/var/www/movie-drinking-game/app/view/signin.html');
});

app.post('/', function (req, res) {
  var token = randomstring.generate();
  var request = {
    'token': token,
    'user_name': req.body['user_name'],
    'action': 'new_user'
  };

  var message = new Buffer(JSON.stringify(request));
  client.send(message, 0, message.length, 9876, '192.168.0.116');

  res.cookie('name', req.body['user_name'])
  res.cookie('token', token)

  res.redirect('/controller');
});

app.get('/controller', function(req, res) {
  if (!req.cookies.token) {
    res.redirect('/');
  }

  res.sendFile('/var/www/movie-drinking-game/app/view/controller.html');
});

app.post('/answer', function(req, res) {
  if (!req.cookies.token) {
    res.returnStatus(401);
  } 

console.log(req.body);

  var request = {
    'token': req.cookies.token,
    'answer_id': parseInt(req.body['answer_id']),
    'action': 'answer'
  };

  var message = new Buffer(JSON.stringify(request));
  client.send(message, 0, message.length, 9876, '192.168.0.116');

  res.end();
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.get('/game' , function(req, res) {
res.sendFile('/var/www/movie-drinking-game/app/view/game.html');
});
