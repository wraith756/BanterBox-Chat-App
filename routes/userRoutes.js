const express = require("express");
const userRouter = express.Router();
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const { model } = require("mongoose");
const { isAdmin } = require("../middleware/authMiddleware");
//Register Route
userRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const user = await User.create({ username, email, password });
    if (user) {
      res
        .status(201)
        .json({ _id: user._id, username: user.username, email: user.email });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//login
userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      // const admin = (user.isAdmin = true);

      res.json({
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ message: "Invaild email or Password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
//generating token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: "30d" });
};
module.exports = userRouter;
