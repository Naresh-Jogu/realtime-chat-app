const Conversation = require("../models/Conversation");
const { createMessage } = require("../services/messageService");

const registerSocketHandlers = (io, socket) => {
  // Join a conversation room
  socket.on("conversation:join", async ({ conversationId }, callback) => {
    try {
      if (!conversationId) {
        return callback({
          success: false,
          message: "Conversation ID is required",
        });
      }

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return callback({
          success: false,
          message: "Conversation not found",
        });
      }

      const isParticipant = conversation.participants.some(
        (participantId) =>
          participantId.toString() === socket.userId.toString(),
      );

      if (!isParticipant) {
        return callback({
          success: false,
          message: "You are not a participant in this conversation",
        });
      }

      await socket.join(conversationId);

      return callback({
        success: true,
        conversationId,
        message: "Joined conversation successfully",
      });
    } catch (error) {
      console.error("Join conversation error:", error.message);

      return callback({
        success: false,
        message: "Failed to join conversation",
      });
    }
  });

  // Send a message in a conversation
  socket.on("message:send", async ({ conversationId, content }, callback) => {
    try {
      if (!conversationId || !content) {
        return callback({
          success: false,
          message: "Conversation ID and message content are required",
        });
      }

      const message = await createMessage({
        conversationId,
        senderId: socket.userId,
        content,
      });

      // Send the persisted message to everyone
      // connected to this conversation room.
      io.to(conversationId).emit("message:new", message);

      return callback({
        success: true,
        message,
      });
    } catch (error) {
      console.error("Send message error:", error.message);

      return callback({
        success: false,
        message: error.message || "Failed to send message",
      });
    }
  });
};

module.exports = registerSocketHandlers;
