const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user;

    // Validate message content

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // Find conversation

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Verify authenticated user is part of the conversation

    const isParticipant = conversation.participants.some(
      (participantId) => participantId.toString() === userId.toString(),
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    // Create message

    const message = await Message.create({
      conversationId,
      senderId: userId,
      content: content.trim(),
    });

    // Update conversation's latest message

    conversation.lastMessage = message._id;
    await conversation.save();

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

module.exports = { sendMessage };
