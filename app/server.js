var dgram = require('dgram');
var express = require('express');
var bodyParser = require('body-parser')
var randomstring = require("randomstring");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 

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

  res.sendFile('/var/www/movie-drinking-game/app/view/game.html');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
