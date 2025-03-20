const express = require("express");
const Message = require("../models/ChatModel");
const { protect } = require("../middleware/authMiddleware");
const { model } = require("mongoose");
const messageRouter = express.Router();
messageRouter.post("/", protect, async (req, res) => {
  try {
    const { content, groupId } = req.body;
    const message = await Message.create({
      sender: req.user._id,
      content,
      group: groupId,
    });
    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username email"
    );
    res.json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.Message });
  }
});
messageRouter.get("/:groupId", protect, async (req, res) => {
  try {
    const message = await Message.find({ group: req.params.groupId })
      .populate("sender", "username email")
      .sort({ createdAt: -1 });
    res.json(message);
    console.log(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = messageRouter;
