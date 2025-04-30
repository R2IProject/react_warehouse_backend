const express = require("express");
const router = express.Router();
const Location = require("../models/location");
const { ObjectId } = require("mongodb");
const authMiddleware = require("../middleware/auth");

router.get("/locations", authMiddleware, async (req, res) => {
  try {
    const locations = await Location.find().select("-password");
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/locations/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const locations = await Location.findById({ _id: new ObjectId(id) }).select(
      "-password"
    );
    if (!locations)
      return res.status(404).json({ message: "Location not found" });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/locations", authMiddleware, async (req, res) => {
  const { name, description } = req.body;
  try {
    const existingLocation = await Location.findOne({ name });
    if (existingLocation) {
      return res.status(400).json({ message: "Location already exists" });
    }
    const newLocation = new Location({
      name,
      description,
      createdAt: new Date(),
    });
    await newLocation.save();
    res.status(201).json({ message: "Location created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/locations/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    const locations = await Location.findById({ _id: new ObjectId(id) });
    if (!locations)
      return res.status(404).json({ message: "Location not found" });

    Object.assign(locations, updateFields);
    locations.updatedAt = new Date();
    await locations.save();

    res.status(200).json({ message: "Location updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/locations/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const location = await Location.findByIdAndDelete({
      _id: new ObjectId(id),
    });
    if (!location) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Location deleted" });
  } catch (error) {
    console.log("🚀 ~ router.delete ~ error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
