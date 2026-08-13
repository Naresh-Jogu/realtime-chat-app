const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
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

module.exports = app;
