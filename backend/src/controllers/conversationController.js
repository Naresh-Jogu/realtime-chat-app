const User = require("../models/User");
const Conversation = require("../models/Conversation");

const createConversation = async (req, res) => {
  try {
    const userId = req.user;
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: "Recipient ID is required",
      });
    }

    if (userId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a conversation with yourself",
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res
        .status(404)
        .json({ success: false, message: "Recipient user not found" });
    }

    const existingConversation = await Conversation.findOne({
      participants: {
        $all: [userId, recipientId],
        $size: 2,
      },
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        Conversation: existingConversation,
      });
    }

    const conversation = await Conversation.create({
      participants: [userId, recipientId],
    });

    return res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { createConversation };
