const joinNs = (endpoint) => {
  // Because every time when we switch namespace, the previous nsSocket will still be active. So the event listener for our message input field (in the form element) will still attached. We need to close the nsSocket and remove our event listener.
  if (nsSocket) {
    nsSocket.close();
    document.querySelector('#user-input').removeEventListener('submit', formSubmission);
  }
  nsSocket = io(`http://localhost:5500${endpoint}`);
  nsSocket.on('nsRoomLoad', (nsRooms) => {
    let roomList = document.querySelector('.room-list');
    roomList.innerHTML = '';
    nsRooms.forEach((room) => {
      roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${room.privateRoom ? 'lock' : 'globe'}"></span>${room.roomTitle}</li>`;
    });

    // add click listener to each room
    let roomNodes = document.getElementsByClassName('room');
    Array.from(roomNodes).forEach((elem) => {
      elem.addEventListener('click', (e) => {
        joinRoom(e.target.innerText);
      });
    });

    // We get the first room on the list.
    const topRoomName = document.querySelector('.room').innerText;
    joinRoom(topRoomName);
  });

  let roomNodes = document.getElementsByClassName('room');
  Array.from(roomNodes).forEach((element) => {
    element.addEventListener('click', (event) => {});
  });

  nsSocket.on('messageToClients', (msg) => {
    const newMsg = buildMsgHTML(msg);
    document.querySelector('#messages').innerHTML += newMsg;
  });
  // Listen to form submit event for new text input.
  document.querySelector('.message-form').addEventListener('submit', formSubmission);
};

// This is to submit form element for new message input.
const formSubmission = (event) => {
  event.preventDefault();
  const newMessage = document.querySelector('#user-message').value;
  nsSocket.emit('newMessageToServer', { text: newMessage });
};

const buildMsgHTML = (msg) => {
  const convertedDate = new Date(msg.time).toLocaleString();
  const newHTML = `<li>
  <div class="user-image">
    <img src="${msg.avatar}" />
  </div>
  <div class="user-message">
    <div class="user-name-time">${msg.username}<span> ${convertedDate}</span></div>
    <div class="message-text">${msg.text}</div>
  </div>
  </li>`;

  return newHTML;
};
