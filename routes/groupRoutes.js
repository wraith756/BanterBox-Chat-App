const express = require("express");
const Group = require("../models/GroupModel");
const { log, group } = require("node:console");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const groupRouter = express.Router();
groupRouter.post("/", protect, isAdmin, async (req, res) => {
  console.log(req.user);

  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      admin: req.user.id,
      members: [req.user.id],
    });

    try {
      console.log(group);
    } catch (error) {
      console.log(error);
    }

    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "username email")
      .populate("members", "username email");
    res.status(201).json({ populatedGroup });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
groupRouter.get("/", protect, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("admin", "username email")
      .populate("members", "username email");
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  } // Send the populated data as a response
});
groupRouter.post("/:groupId/join", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (group.members.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "Already a member of this group" });
    }
    group.members.push(req.user._id);
    await group.save();
    res.status(200).json({ message: "Joined the group successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
groupRouter.post("/:groupId/leave", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (group.members.includes(req.user._id)) {
      group.members.pop(req.user._id);
      await group.save();
      return res.status(200).json({ message: "leave the group successfully" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = groupRouter;
