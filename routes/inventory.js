const express = require("express");
const router = express.Router();
const Inventory = require("../models/inventory");
const Location = require("../models/location");
const { ObjectId } = require("mongodb");
const authMiddleware = require("../middleware/auth");

router.get("/inventory", authMiddleware, async (req, res) => {
  try {
    const inventory = await Inventory.aggregate([
      {
        $addFields: {
          locationObjId: { $toObjectId: "$locationId" },
        },
      },
      {
        $lookup: {
          from: "locations",
          localField: "locationObjId",
          foreignField: "_id",
          as: "location",
        },
      },
      {
        $addFields: {
          location_name: { $first: "$location.name" },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/inventory/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const inventory = await Inventory.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $addFields: {
          locationObjId: { $toObjectId: "$locationId" },
        },
      },
      {
        $lookup: {
          from: "locations",
          localField: "locationObjId",
          foreignField: "_id",
          as: "location",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    const locations = await Location.find();
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });
    if (!locations)
      return res.status(404).json({ message: "Location not found" });
    res.json({ inventory: inventory[0] || {}, locations });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/inventory", authMiddleware, async (req, res) => {
  const { product_name } = req.body;
  try {
    const existingInventory = await Inventory.findOne({ product_name });
    if (existingInventory) {
      return res.status(400).json({ message: "Inventory already exists" });
    }
    const newInventory = new Inventory({
      ...req.body,
      createdAt: new Date(),
    });
    await newInventory.save();
    res.status(201).json({ message: "Inventory created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/inventory/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    const inventory = await Inventory.findById({ _id: new ObjectId(id) });
    if (!inventory)
      return res.status(404).json({ message: "Inventory not found" });

    Object.assign(inventory, updateFields);
    inventory.updatedAt = new Date();
    await inventory.save();

    res.status(200).json({ message: "Inventory updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/inventory/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const inventory = await Inventory.findByIdAndDelete({
      _id: new ObjectId(id),
    });
    if (!inventory) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Inventory deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
