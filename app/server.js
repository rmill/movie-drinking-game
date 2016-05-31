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
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'img')));
app.use(express.static(path.join(__dirname, 'js')));

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

  res.end();
});

app.listen(3001);
