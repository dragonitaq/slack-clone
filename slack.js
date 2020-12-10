const express = require('express');
// Invoking express() will create http server
const app = express();
const socketio = require('socket.io');

let namespaces = require('./data/namespaces');

app.use(express.static(`${__dirname}/public`));

// This is how we pass in express server for socketio to listen to.
const expressServer = app.listen(8000);
const io = socketio(expressServer);

// 'connection is socketio predefine keyword that we should follow. It means a connection is established.
io.on('connection', (socket) => {
  socket.emit('messageFromServer', { data: 'Hello from server side!' });
  socket.on('messageToServer', (dataFromClient) => {
    // console.log(dataFromClient);
  });
  socket.on('newMessageToServer', (msg) => {
    // console.log(msg);
    /* socket means one socket connection. io means all socket connections. Here we send back the msg to all connected sockets, which means all clients.
    When we do socket.ANYTHING, it's just for one socket. When we do io.ANYTHING, it's to all the sockets that are connected, rather than just that one.  */
    io.emit('messageToClients', { text: msg.text });
  });

  socket.join('level1');
  // socket.to('level1').emit('joined', `${socket.id} says: I have joined level 1 room!`);
  io.of('/').to('level1').emit('joined', `${socket.id} says: I have joined level 1 room!`);
});

io.of('/admin').on('connection', (socket) => {
  console.log('Someone connected to admin');
  io.of('/admin').emit('welcome', 'Welcome to the admin namespace!');
});

/* The server can still communicate across namespaces but on the client side, the socket needs to in that namespace in order to get the events. */
