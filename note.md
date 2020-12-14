# Note

## Why multiple socket connections?

I still don't understand why there are multiple socket connections. Even if socket.io is attempting to reconnect shouldn't there be just one connection, the one that was disconnected on server restart?

Robert's answer:

With that said, just as you mentioned, there aren't "multiple connections," there is just 1 connection, but because we have a on.connect listener on the server, every time the server restarts, a new listener runs. That listener triggers the callback on the client (who doesn't know the server has restarted), so we have 5 'connects' on the same connection. The client keeps getting a new .emit from the server. Think about it like having 1 button in html that runs a setTimeout. Every time you click on that button, a new setTimeout gets added. It's the same code, but you keep running it. We fix it later, and it wouldn't be like that in production.

---

<!-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ -->

From what I observed, whenever user changes from namespace to namespace or from room to room, we need to explicitly connect/close them (if namespaces) or join/leave them (if rooms).

---

<!-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ -->

Whenever a user connected, that user is actually in its own private room (determined by user id). That is why if we log nsSocket.rooms, we will notice the first room is the private room with details of the namespace + #userId like this: `{ '/namespace#Cywyae7p_pMXLcXXAAAG': '/namespace#Cywyae7p_pMXLcXXAAAG' }`
