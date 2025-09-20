const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  // Join a room
  socket.on("join-room", ({ roomId, userId }) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("signal", (data) => {
      socket.to(roomId).emit("signal", data);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(5000, () => console.log("Socket.IO server running on port 5000"));
