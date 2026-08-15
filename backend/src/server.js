require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const socketAuth = require("./sockets/socketAuth");

const app = require("./app");
const connectDB = require("./config/db");

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

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    console.log(`Authenticated user: ${socket.userId}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
};

startServer();
