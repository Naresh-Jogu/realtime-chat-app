const Conversation = require("../models/Conversation");

const registerSocketHandlers = (io, socket) => {
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
        return callback({ success: false, message: "Conversation not found" });
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
};

module.exports = registerSocketHandlers;
