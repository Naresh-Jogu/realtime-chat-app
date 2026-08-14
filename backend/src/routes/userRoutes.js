const express = require("express");

const { getCurrentUser, getUsers } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.get("/", protect, getUsers);

module.exports = router;
