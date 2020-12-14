const express = require('express');
// Invoking express() will create http server
const app = express();
const socketio = require('socket.io');

let namespaces = require('./data/namespaces');

app.use(express.static(`${__dirname}/public`));

// This is how we pass in express server for socketio to listen to.
const expressServer = app.listen(5500);
const io = socketio(expressServer);

// 'connection is socketio predefine keyword that we should follow. It means a connection is established.
io.on('connection', (socket) => {
  let nsData = namespaces.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint,
    };
  });
  socket.emit('nsList', nsData);
});

namespaces.forEach((namespace) => {
  // nsSocket represents that one particualt socket for that particular namespace.
  io.of(namespace.endpoint).on('connection', (nsSocket) => {
    /* Remember handshake only happens ONCE upon initial connection. But we can access it else where even in different namespace (either socket or nsSocket) */
    const username = nsSocket.handshake.query.username;
    console.log(`${nsSocket.id} has joined ${namespace.nsTitle}`);
    nsSocket.emit('nsRoomLoad', namespace.rooms);
    nsSocket.on('joinRoom', (roomToJoin, numberOfUsersCb) => {
      /* When user join a room, we need to make sure that user leave their previous room. We make sure the user only can join one room at a time, then we can get that room title from second element of the rooms array. Remember the first item always is the private room of the user. */
      const roomToLeave = Object.keys(nsSocket.rooms)[1];
      /* From what I can see, when user is currently in room Wiki and click room Wiki again in the UI, our current code will .leave room Wiki, then .join back room Wiki immediately. This will make the user be in any room at any given time. Thus, this shouldn't have the issue of nsRoom.addMessage(fullMsg); -- cannot addMessage to undefined. 
      The solution proposed by student solved the issue, but I don't understand why the issue happened in the first place. */
      if (roomToLeave && roomToLeave !== roomToJoin) {
        nsSocket.leave(roomToLeave);
        // Update users count in that room after user leave.
        updateUsersInRoom(namespace, roomToLeave);
      }
      nsSocket.join(roomToJoin);
      //Get the number of members in the current room.
      io.of(namespace.endpoint)
        .in(roomToJoin)
        .clients((error, clients) => {
          numberOfUsersCb(clients.length);
        });
      // Get that particular room from an array of existing rooms in that namespace object.
      const nsRoom = namespace.rooms.find((room) => room.roomTitle === roomToJoin);
      // Send back chat history.
      nsSocket.emit('historyCatchUp', nsRoom.history);
      // Update users count in that room after user join.
      updateUsersInRoom(namespace, roomToJoin);
    });
    nsSocket.on('newMessageToServer', (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username,
        avatar: 'https://via.placeholder.com/30',
      };
      // Because whenever user send new message to our server, that person can send from any room. In order to know that, we need to use nsSocket.rooms to give us info. We turn that object into array and grab the room title in it.
      const roomTitle = Object.keys(nsSocket.rooms)[1];
      // Because we default user to the first room when they first connected, then we send back the msg to every in wiki room.
      const nsRoom = namespace.rooms.find((room) => room.roomTitle === roomTitle);
      nsRoom.addMessage(fullMsg);
      io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg);
    });

    // This is student proposed solution to leave room & update user count after the user leave a namespace.
    nsSocket.on('disconnect', () => {
      namespace.rooms.forEach((room) => {
        nsSocket.leave(room.roomTitle);
        // Update users count in that room after upon user leave the namespace.
        updateUsersInRoom(namespace, room.roomTitle);
      });
    });
  });
});

const updateUsersInRoom = (namespace, roomToJoin) => {
  // Update member count in the particular room.
  io.of(namespace.endpoint)
    .in(roomToJoin)
    .clients((error, clients) => {
      io.of(namespace.endpoint).in(roomToJoin).emit('updateMemberCount', clients.length);
    });
};

/* The server can still communicate across namespaces but on the client side, the socket needs to in that namespace in order to get the events. */
