const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: 5000,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  },
);

// Optimized conversation message queries

messageSchema.index({
  conversationId: 1,
  createdAt: -1,
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
