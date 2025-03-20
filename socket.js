const socketIo = (io) => {
  //store connected users with their room imformation using socket.id as they key
  const connectedUsers = new Map();
  io.on("connection", (socket) => {
    //get user from authantication
    const user = socket.handshake.auth.user;
    console.log("User connected", user?.username);
    //start:join the room
    socket.on("join room", (groupId) => {
      socket.join(groupId);
      connectedUsers.set(socket.id, { user, room: groupId });
      //GET LIST OF ALL USERS CURRENTLY IN ROOM
      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);
      //Emit update user list to all client in the room
      io.in(groupId).emit("users in room", usersInRoom);
      //Broadcast join notification
      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${user?.username} has joined`,
        user: user,
      });
      socket.on("leave room", (groupId) => {
        console.log(`${user?.username} leaving room`, groupId);
        socket.leave(groupId);
        if (connectedUsers.has(socket.id)) {
          connectedUsers.delete(socket.id);
          socket.to(groupId).emit("user left", user?.id);
        }
      });
      socket.on("new message", (message) => {
        socket.to(message.groupId).emit("message receved", message);
      });
      socket.on("disconnect", () => {
        console.log(`${user.username} disconneced`);
        if (connectedUsers.has(socket.id)) {
          const userData = connectedUsers.get(socket.id);
          socket.to(userData.room).emit("user left", user?.id);
          connectedUsers.delete(socket.id);
        }
      });
      socket.on("typing", ({ groupId, username }) => {
        socket.to(groupId).emit("user typing", { username });
      });
      socket.on("stop typing", ({ groupId, username }) => {
        socket
          .to(groupId)
          .emit("user stop typing", { username: user?.username });
      });
    });
  });
};
module.exports = socketIo;
