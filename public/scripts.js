const username = prompt('What is your username?');

// Send username through handshake in the query object.
const socket = io('http://localhost:5500', {
  query: {
    username,
  },
});

// We made global variable so we can access everywhere.
let nsSocket;

// nsData is array of obj receive from server upon connected.
socket.on('nsList', (nsData) => {
  let namespacesDiv = document.querySelector('.namespaces');
  namespacesDiv.innerHTML = '';
  nsData.forEach((ns) => {
    namespacesDiv.innerHTML += `<div class="namespace" ns="${ns.endpoint}"><img src="${ns.img}"/></div>`;
  });
  Array.from(document.getElementsByClassName('namespace')).forEach((element) => {
    element.addEventListener('click', (event) => {
      const nsEndpoint = element.getAttribute('ns');
      // This is making user join selected room.
      joinNs(nsEndpoint);
    });
  });
  // This is making user join default room of wiki on first page load.
  joinNs('/wiki');
});
