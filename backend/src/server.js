require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const socketAuth = require("./sockets/socketAuth");

const app = require("./app");
const connectDB = require("./config/db");
const registerSocketHandlers = require("./sockets/socketHandlers");
const {
  addConnection,
  removeConnection,
} = require("./services/presenceService");
const {
  markUserOnline,
  markUserOffline,
} = require("./services/userPresenceService");

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

    // Join a private room for this user
    await socket.join(`user:${socket.userId}`);

    const connectionCount = addConnection(socket.userId, socket.id);

    // First active connection → user becomes online
    if (connectionCount === 1) {
      await markUserOnline(socket.userId);
      socket.broadcast.emit("user:online", { userId: socket.userId });
    }

    registerSocketHandlers(io, socket);

    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${socket.id}`);

      const remainingConnections = removeConnection(socket.userId, socket.id);

      if (remainingConnections === 0) {
        const lastSeen = await markUserOffline(socket.userId);

        socket.broadcast.emit("user:offline", {
          userId: socket.userId,
          lastSeen,
        });
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
};

startServer();
