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
const chatRooms = ['Lobby'];
// let curRoom = 'Lobby';
const usersInRoom = {};

io.on('connection', socket => {
  let user = `Guest${id++}`;
  let userObj = {user, room: 'Lobby'};
  users.push(userObj);
  console.log(`user ${user} connected`);
  io.emit('get username', { username: user, server: true });
  //io.emit('receive chat message', {message: `You are known as ${user}.`, server: true});
  // let userStr = '';
  // for (let i = 0; i < users.length; i++) {
  //   userStr += users[i].user;
  //   if (i < users.length - 1) {
  //     userStr += ', ';
  //   }
  // }
  socket.join('Lobby');
  if ('Lobby' in usersInRoom) {
    if (!usersInRoom.Lobby.includes(user)) {
      usersInRoom.Lobby.push(user);
    }
  } else {
    usersInRoom.Lobby = [user];
  }
  // io.emit('receive chat message', {message: `You are currently in `})
  io.emit('receive chat message', { message: `Users currently in ${userObj.room}: ${toUserString(usersInRoom.Lobby)}.`, server: true });
  io.emit('get chat rooms', { curRoom: userObj.room, chatrooms: chatRooms, server: true });
  // send message
  socket.on('chat message', (message) => {
    
    console.log('users in room: ', usersInRoom);
    handleMessage(io, socket, message, userObj);
  });

  // disconnect
  socket.on('disconnect', data => {
    const index = getIndex(users, 'user', userObj);
    users.splice(index, 1);
    const usersInCurRoom = usersInRoom[userObj.room];
    if (usersInCurRoom) {
      usersInCurRoom.splice(usersInCurRoom.indexOf(userObj.user), 1);
    }
    console.log(`${user} is disconneted.`);
  });
});

function handleMessage(io, socket, message, userObj) {
  console.log('message: ', message);
  console.log('userObj: ', userObj);
  const curMsg = message.message;
  if (curMsg.startsWith('/')) {
    const spaceIndex = curMsg.indexOf(' ');
    const firstWord = curMsg.substring(0, spaceIndex);
    if (firstWord === '/nick') {
      const prevName = message.username;
      const index = getIndex(users, 'user', prevName);
      const newName = curMsg.substring(spaceIndex + 1);
      userObj.user = newName;
      users[index] = {user: newName, room: userObj.room};
      io.emit('get username', { username: newName, prevName, server: true });
    } else if (firstWord === '/join') {
      const chatRoom = curMsg.substring(spaceIndex + 1);
      let curUsers = usersInRoom[userObj.room];
      socket.leave(userObj.room);
      curUsers.splice(curUsers.indexOf(userObj.user), 1);
      usersInRoom[userObj.room] = curUsers;
      socket.join(chatRoom);
      userObj.room = chatRoom;
      if (!chatRooms.includes(chatRoom)) {
        chatRooms.push(chatRoom);
      }
      if (chatRoom in usersInRoom) {
        if (usersInRoom[chatRoom].includes(userObj.user)) {
          usersInRoom[chatRoom].push(userObj.user);
        }
      } else {
        usersInRoom[chatRoom] = [userObj.user];
      }
      if (curUsers.length === 0) {
        chatRooms.splice(chatRooms.indexOf(userObj.room), 1);
      }
      io.emit('clear chat messages', {user: userObj.user});
      io.emit('receive chat message', { message: `Users currently in ${userObj.room}: ${toUserString(usersInRoom[userObj.room])}.`, server: true });
      io.emit('get chat rooms', { curRoom: userObj.room, chatrooms: chatRooms, user: userObj.user, server: true });
    } else {
      io.to(userObj.room).emit('receive chat message', { message: 'The command is not supported.', server: true });
    }
  } else {
    //message.username = user;
    io.to(userObj.room).emit('receive chat message', message);
  }
}

function getIndex(arr, key, value) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[key] === value) {
      return i;
    }
  }
  return -1;
}

function toUserString(users) {
  if (!users) {
    return;
  }
  let str = '';
  for (let i = 0; i < users.length; i++) {
    str += users[i];
    if (i < users.length - 1) {
      str += ', ';
    }
  }
  return str;
}

// routes

// app.use(function(req, res, next) {
//     res.status(404).send('404 Not Found.');
// });

module.exports = http;