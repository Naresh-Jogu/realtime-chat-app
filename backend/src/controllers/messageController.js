const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { createMessage } = require("../services/messageService");

const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    const message = await createMessage({
      conversationId,
      senderId: req.user,
      content: content.trim(),
    });

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Send message error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (participantId) => participantId.toString() === req.user.toString(),
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    const skip = (page - 1) * limit;

    const [messages, totalMessages] = await Promise.all([
      Message.find({ conversationId })
        .populate("senderId", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Message.countDocuments({ conversationId }),
    ]);

    return res.status(200).json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        hasNextPage: page * limit < totalMessages,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { sendMessage, getMessages };
