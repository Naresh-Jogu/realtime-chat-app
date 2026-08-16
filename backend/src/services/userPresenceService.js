const User = require("../models/User");

const markUserOnline = async (userId) => {
  await User.findByIdAndUpdate(userId, { isOnline: true });
};

const markUserOffline = async (userId) => {
  const lastSeen = new Date();
  await User.findByIdAndUpdate(userId, {
    isOnline: false,
    lastSeen,
  });

  return lastSeen;
};

module.exports = { markUserOnline, markUserOffline };
