const electron = require('electron');
// Module to control application life.
const {app} = electron;
// Module to create native browser window.
const {BrowserWindow} = electron;
// Module to communicate with the window process
const {ipcMain} = require('electron');
// Create  constant for the app path
const APP_PATH = `file://${__dirname}/app`;
// Setup the server
const Server = require('./app/server');
// The websocket server
const io = require('socket.io')(80);
// The gane object
const Game = require('./app/game');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let game;
let server;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow();
  win.setFullScreen(true);
  // win.setMenu(null);

  // and load the index.html of the app.
  win.loadURL(`${APP_PATH}/view/index.html`);

  // Emitted when the window is closed.
  win.on('closed', () => {
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
  const fs = require("fs");
  var gameJson = fs.readFileSync(`./test.json`);
  var gameData = JSON.parse(gameJson.toString());
  var questions = {};
  var currentQuestion = null;

  for (var index in gameData.questions) {
    var question = gameData.questions[index];
    questions[question.movie_time] = question;
  }

  io.on('connection', function(socket){
    socket.on('subscribe', function(topic) {
      this.join(topic);
    });
  });

  game = new Game(win, io, questions, gameData.end_time);

  ipcMain.on('start-game', function(event) {
    game.start();
  });

  ipcMain.on('movie-time', function(event, time) {
    game.processState(time);
  });
}

function createServer() {
  server = new Server(game);
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});
