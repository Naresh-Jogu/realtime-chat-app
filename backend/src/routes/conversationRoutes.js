const express = require("express");
const {
  createConversation,
  getMyConversations,
} = require("../controllers/conversationController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createConversation);
router.get("/", protect, getMyConversations);

module.exports = router;
