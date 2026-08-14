const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.post("/:conversationId", protect, sendMessage);
router.get("/:conversationId/messages", protect, getMessages);

module.exports = router;
