const socket = io('http://localhost:8000');
const socket2 = io('http://localhost:8000/admin');

// socket.on('connect', () => {
//   console.log(socket.id);
// });

// socket2.on('connect', () => {
//   console.log(socket2.id);
// });

socket.on('joined', (msg) => {
  console.log(msg);
}); 

socket2.on('welcome', (msg) => {
  console.log(msg);
});

// socket.on('ping', () => {
//   console.log('Ping was receive from server');
// });
// socket.on('pong', (latency) => {
//   console.log(latency);
//   console.log('Pong was sent to server.');
// });

socket.on('messageFromServer', (dataFromServer) => {
  // console.log(dataFromServer);
  socket.emit('messageToServer', { data: 'Hello from the client!' });
});

document.querySelector('#message-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const newMessage = document.querySelector('#user-message').value;
  socket.emit('newMessageToServer', { text: newMessage });
});

// socket.on('messageToClients', (msg) => {
//   document.querySelector('#messages').innerHTML += `<li>${msg.text}</li>`;
// });
