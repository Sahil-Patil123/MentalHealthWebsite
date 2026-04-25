// controllers/userController.js
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register a new user
const signUp = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password,
    });

    // Save user to DB
    await user.save();

    // Generate token and send response
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error in signing up user" });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Generate token and send response
      const token = generateToken(user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error in logging in user" });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    const user = await User.findById(userId).select("name email"); // Only select name and email

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user); // Return user data
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signUp, login, getProfile };
