const { Server } = require("socket.io");

const io = new Server({ cors: "http://localhost:5173" });
let onlineUsers = [];

io.on("connection", (socket) => {
  // ...

  console.log("New Connection", socket.id);

  // listen to a connection
  socket.on("addNewUser", (userId) => {
    // some is the array method to filter
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });

    // to give online users to the client

    io.emit("getOnlineUsers", onlineUsers);
  });

  // add message  and message query have
  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find(
      (user) => user.userId === message.recipientId
    );
    if (user) {
      io.to(user.socketId).emit("getMessage", message);
      io.to(user.socketId).emit("getNotification", {
        senderId:message.senderId,
        isRead:false,
        date:new Date(),
      });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

    io.emit("getOnlineUsers", onlineUsers);
  });

  console.log("onlineUsers", onlineUsers);
});

io.listen(3000);
