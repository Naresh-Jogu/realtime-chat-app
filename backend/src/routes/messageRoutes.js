const express = require("express");
const protect = require("../middleware/authMiddleware");
const { sendMessage } = require("../controllers/messageController");

const router = express.Router();

router.post("/:conversationId", protect, sendMessage);

module.exports = router;
