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
  console.log('a user connected');
  io.emit('get username', {username: user});
  // send message
  socket.on('chat message', message => {
    console.log('message: ', message);
    message.username = user;
    io.emit('chat message', message);
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