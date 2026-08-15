const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const createMessage = async ({ conversationId, senderId, content }) => {
  if (!content || !content.trim()) {
    const error = new Error("Message content is required");
    error.statusCode = 400;
    throw error;
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const isParticipant = conversation.participants.some(
    (participantId) => participantId.toString() === senderId.toString(),
  );

  if (!isParticipant) {
    const error = new Error("You are not a participant in this conversation");
    error.statusCode = 403;
    throw error;
  }

  const message = await Message.create({
    conversationId,
    senderId,
    content: content.trim(),
  });

  conversation.lastMessage = message._id;
  await conversation.save();
  return message;
};

module.exports = { createMessage };
