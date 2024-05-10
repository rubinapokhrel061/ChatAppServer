import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const port = 4000 || process.env.PORT;
const app = express();
const server = createServer(app);
const users = [{}];
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use(cors());

app.get("/", (req, res) => {
  res.send("hello world");
});

io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("Joined", ({ user }) => {
    users[socket.id] = user;
    socket.broadcast.emit("userJoined", {
      user: "Admin",
      message: `${users[socket.id]} has joined`,
    });

    socket.emit("welcome", {
      user: "Admin",
      message: `Welcome to the Chat ,${users[socket.id]}`,
    });
  });
  socket.on("message", ({ message, id }) => {
    io.emit("sendMessage", { user: users[id], message, id });
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("leave", {
      user: "Admin",
      message: `${users[socket.id]} user has left`,
    });
    console.log("user left");
  });
});

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});