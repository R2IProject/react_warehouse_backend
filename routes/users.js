const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { ObjectId } = require("mongodb");
const authMiddleware = require("../middleware/auth");

router.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const users = await User.findById({ _id: new ObjectId(id) }).select(
      "-password"
    );
    if (!users) return res.status(404).json({ message: "User not found" });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/users/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    const userData = await User.findById({ _id: new ObjectId(id) });
    if (!userData) return res.status(404).json({ message: "User not found" });

    Object.assign(userData, updateFields);
    userData.updatedAt = new Date();
    await userData.save();

    res.status(200).json({ message: "User updated" });
  } catch (error) {
    console.log("🚀 ~ router.patch ~ error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/users/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const userData = await User.findByIdAndDelete({ _id: new ObjectId(id) });
    if (!userData) return res.status(404).json({ message: "User not found" });
    // await userData.remove();
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.log("🚀 ~ router.delete ~ error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
