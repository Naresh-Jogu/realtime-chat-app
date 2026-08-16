require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const socketAuth = require("./sockets/socketAuth");

const app = require("./app");
const connectDB = require("./config/db");
const registerSocketHandlers = require("./sockets/socketHandlers");
const { addConnection, removeConnection } = require("./services/presenceService");
const { markUserOnline, markUserOffline } = require("./services/userPresenceService");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuth);

  io.on("connection", async (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    console.log(`Authenticated user: ${socket.userId}`);

    const connectionCount = addConnection(socket.userId, socket.id);

     // Only mark the user online on their first active connection
    if(connectionCount === 1){
      await markUserOnline(socket.userId)
    }

    registerSocketHandlers(io, socket);
    

    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${socket.id}`);

      const remaingConnections = removeConnection(socket.userId, socket.id)

      if(remaingConnections === 0){
        await markUserOffline(socket.userId)
      }


    });
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
};

startServer();
