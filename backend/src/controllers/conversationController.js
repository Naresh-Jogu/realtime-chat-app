const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message")

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
        conversation: existingConversation,
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

const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user,
    })
      .populate("participants", "name email avatar isOnline lastSeen")
      .populate("lastMessage", "senderId content messageType status createdAt")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error.message);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = { createConversation, getMyConversations };
