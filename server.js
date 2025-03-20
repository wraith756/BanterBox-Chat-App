const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const userRouter = require("./routes/userRoutes");
const Socket = require("socket.io");
const socketIo = require("./socket");

const User = require("./models/UserModel");

const groupRouter = require("./routes/groupRoutes");
const messageRouter = require("./routes/messageRoutes");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Socket.Server(server, {
  // Correct way to initialize Socket.io
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true, // Use lowercase 'credentials'
  },
});

// const io = socketIo(server, {
//   cors: {
//     origin: ["http://localhost:5173"],
//     methods: ["GET", "POST"],
//     credentials: true, // Correct
//   },
// });
app.use(cors());
app.use(express.json());
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log("MongoDB connection Failed", err));
socketIo(io);
app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);
const PORT = process.env.PORT || 5000;
server.listen(PORT, console.log("Server is running on port :", PORT));
