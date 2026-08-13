const User = require("../models/User");
const generateToken = require("../utils/generateToken");

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

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Passowrd are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser };
