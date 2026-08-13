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

module.exports = { getCurrentUser };
