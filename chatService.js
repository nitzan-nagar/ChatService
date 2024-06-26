import express from "express";
import cors from "cors";
import http from "http";
import { Server as socketIO } from "socket.io";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new socketIO(server, {
    cors: {
        origin: [
            "http://localhost:5173",
        ],
        methods: ["GET", "POST"]
    }
});

const userSocketMap = {};
io.on("connection", (socket) => {
    console.log(`${socket.id} is connected !`);

    socket.on('join', (room, username) => {
      userSocketMap[username] = socket.id;
      socket.join(room);
      console.log(`${socket.id} joined ${room}`)
      io.to(room).emit('userJoined',username)
    });

    socket.on('disconnect', (room) => {
      io.to(room).emit('userLeft', socket.id)
    })

    socket.on('chatMessage', ({room, sender, receiver, message}) => {
      console.log("Received Message:", { room, sender, message });
      io.to(room).emit('message', sender, message);
      io.to(userSocketMap[receiver]).emit('pendingMessage', sender);

    });

})

server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});