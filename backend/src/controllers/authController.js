const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // validate the required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be atlest 6 characters",
      });
    }

    // Check whether email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .json({ success: true, message: "Email already registred" });
    }

    // Create User

    const user = await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "User registred successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res
      .status(500)
      .json({ sucess: false, message: "Internal server error" });
  }
};

module.exports = { registerUser };
