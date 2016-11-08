'use strict';

var electron = require('electron');
// Module to control application life.
var app = electron.app;
// Module to create native browser window.

var BrowserWindow = electron.BrowserWindow;
// Module to communicate with the window process

var _require = require('electron'),
    ipcMain = _require.ipcMain;
// Create  constant for the app path


var APP_PATH = 'file://' + __dirname;
// Setup the server

var _require2 = require('./lib/server'),
    GameServer = _require2.GameServer;
// The websocket server


var io = require('socket.io')(3232);
// The gane object
var Game = require('./lib/game');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var win = void 0;
var game = void 0;
var server = void 0;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow();
  win.setFullScreen(true);
  // win.setMenu(null);

  // and load the index.html of the app.
  win.loadURL(APP_PATH + '/view/index.html');

  // Emitted when the window is closed.
  win.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  createGame();
  createServer();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

function createGame() {
  var fs = require("fs");
  var gameJson = fs.readFileSync('./app/test.json');
  var gameData = JSON.parse(gameJson.toString());
  var questions = {};
  var currentQuestion = null;

  for (var index in gameData.questions) {
    var question = gameData.questions[index];
    questions[question.movie_time] = question;
  }

  io.on('connection', function (socket) {
    socket.on('subscribe', function (topic) {
      this.join(topic);
    });
  });

  game = new Game(win, io, questions, gameData.end_time, gameData.rules, gameData.name);

  ipcMain.on('start-game', function (event) {
    game.start();
  });

  ipcMain.on('movie-time', function (event, time) {
    game.processState(time);
  });
}

function createServer() {
  server = new GameServer(game);
}

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});