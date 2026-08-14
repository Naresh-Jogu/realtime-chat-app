const User = require("../models/User");

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error.message);
    return res.json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user },
    }).select("name email avatar isOnline, lastSeen");

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getCurrentUser, getUsers };
