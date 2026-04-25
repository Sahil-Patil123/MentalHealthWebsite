// routes/userRoutes.js
const express = require("express");
const { signUp, login, getProfile } = require("../controllers/userController");

const router = express.Router();

// Route for signup
router.post("/signup", signUp);

// Route for login
router.post("/login", login);

router.get("/profile", getProfile);

module.exports = router;
