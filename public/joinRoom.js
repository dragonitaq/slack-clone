const joinRoom = (roomName) => {
  // Send this roomName to the server
  nsSocket.emit('joinRoom', roomName, (newNumberOfMembers) => {
    // Update the room member total. Notice this method we use is from the cb send from the server which is a form of acknowledgement.
    document.querySelector('.curr-room-num-users').innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span>`;
  });
  nsSocket.on('historyCatchUp', (history) => {
    const messagesUl = document.querySelector('#messages');
    messagesUl.innerHTML = '';
    history.forEach((msg) => {
      const newMsg = buildMsgHTML(msg);
      messagesUl.innerHTML += newMsg;
    });
    // Scroll down to the most recent history message. But I think due to css style, my pc can't make it right.
    messagesUl.scrollTo(0, messagesUl.scrollHeight);
  });
  nsSocket.on('updateMemberCount', (memberCount) => {
    document.querySelector('.curr-room-num-users').innerHTML = `${memberCount} <span class="glyphicon glyphicon-user"></span>`;
    document.querySelector('.curr-room-text').innerText = `${roomName}`;
  });

  /* Implement search with immediate result. Not perfect but just a demo. It has nothing to do with socket.io. For better implementation, we should use React sort of front-end framework. */
  let searchBox = document.querySelector('#search-box');
  searchBox.addEventListener('input', (e) => {
    let messages = Array.from(document.getElementsByClassName('message-text'));
    messages.forEach((msg) => {
      if (msg.innerText.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1) {
        // the msg does not contain the user search term!
        msg.style.display = 'none';
      } else {
        msg.style.display = 'block';
      }
    });
  });
};
