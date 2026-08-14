const express = require("express");
const { createConversation } = require("../controllers/conversationController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createConversation);

module.exports = router;
