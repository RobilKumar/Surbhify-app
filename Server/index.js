const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv"); // Import dotenv
const userRoute = require("./Routes/userRoute");
const chatRoute = require("./Routes/chatRoute");
const messageRoute = require("./Routes/messageRoute");
const bcrypt = require('bcryptjs');


const { Server } = require("socket.io");

dotenv.config(); // Load .env file

const app = express();

app.use(express.json());


// Allow specific origin
const corsOptions = {
  origin: 'https://client-psi-murex.vercel.app', // Add your front-end URL here
  credentials: true
};
app.use(cors(corsOptions));

app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

const port = process.env.PORT;
const uri = process.env.ATLAS_URI;

// here it is express server

const expressServer = app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connection established"))
  .catch((error) => console.log("MongoDB connection failed:", error.message));

app.get("/", (req, res) => {
  //  res.json("hello this is json")
  res.send("hii i am working chat appp");
});



//  Here it is Socket server
const io = new Server(expressServer, { cors:{ 
   origin:" https://client-psi-murex.vercel.app/",
    }});



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


