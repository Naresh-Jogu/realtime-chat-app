const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const protect = require("./middleware/authMiddleware");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/api/auth/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    userId: req.user,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/conversations", messageRoutes);

module.exports = app;
