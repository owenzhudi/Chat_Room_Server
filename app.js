'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const env = require('./config/env');
// const routes = require('./routes');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


// middlewares
// app.use(bodyParser.json());
// app.use('/static', express.static(path.join(__dirname, 'public', 'static')));   // serve static files
// const header = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
//   'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE'
// };

// app.use((req, res, next) => {
//   res.set(header);
//   next();
// });
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/build/index.html'));
// });

const users = [];
let id = 1;

io.on('connection', socket => {
  let user = `Guest${id++}`;
  users.push(user);
  console.log(`user ${user} connected`);
  io.emit('get username', {username: user, server: true});
  //io.emit('receive chat message', {message: `You are known as ${user}.`, server: true});
  let userStr = '';
  for (let i = 0; i < users.length; i++) {
    userStr += users[i];
    if (i < users.length - 1) {
      userStr += ', ';
    }
  }
  io.emit('receive chat message', {message: `Users currently in lobby: ${userStr}.`, server: true});
  // send message
  socket.on('chat message', message => {
    console.log('message: ', message);
    const curMsg = message.message;
    if (curMsg.startsWith('/')) {
      const spaceIndex = curMsg.indexOf(' ');
      const firstWord = curMsg.substring(0, spaceIndex);
      if (firstWord === '/nick') {
        const prevName = message.username;
        const index = users.indexOf(prevName);
        const newName = curMsg.substring(spaceIndex + 1);
        users[index] = newName;
        io.emit('get username', {username: newName, prevName, server: true});
        // io.emit('receive chat message', {message: `You are known as ${newName}.`, server: true});
      } else {
        io.emit('receive chat message', {message: 'The command is not supported.', server: true});
      }
    } else {
      //message.username = user;
      io.emit('receive chat message', message);
    }
    
    //socket.broadcast.emit('chat message', message);
  });

  // disconnect
  socket.on('disconnect', data => {
    const index = users.indexOf(user);
    users.splice(index, 1);
    console.log(`${user} is disconneted.`);
  });
});

// routes

// app.use(function(req, res, next) {
//     res.status(404).send('404 Not Found.');
// });

module.exports = http;