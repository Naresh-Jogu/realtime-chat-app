const User = require("../models/User");

const markUserOnline = async (userId) => {
  await User.findByIdAndUpdate(userId, { isOnline: true });
};

const markUserOffline = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    isOnline: false,
    lastSeen: new Date(),
  });
};

module.exports = { markUserOnline, markUserOffline };
