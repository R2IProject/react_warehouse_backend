const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const Transaction = require("../models/transaction");
const { ObjectId } = require("mongodb");
const authMiddleware = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.get("/transaction", authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "approvedId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "inventories",
          localField: "inventoryId",
          foreignField: "_id",
          as: "inventory",
        },
      },
      {
        $addFields: {
          approval_name: { $first: "$user.username" },
          product_name: { $first: "$inventory.product_name" },
        },
      },
      {
        $project: {
          approval_name: 1,
          product_name: 1,
          type: 1,
          documentation: 1,
          description: 1,
          good_stock: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/transaction/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.aggregate([
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
        $lookup: {
          from: "users",
          localField: "approvedId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "inventories",
          localField: "inventoryId",
          foreignField: "_id",
          as: "inventory",
        },
      },
      {
        $addFields: {
          approval_name: { $first: "$user.username" },
          product_name: { $first: "$inventory.product_name" },
        },
      },
      {
        $project: {
          approval_name: 1,
          product_name: 1,
          type: 1,
          documentation: 1,
          description: 1,
          good_stock: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });
    res.json(transaction[0] || {});
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/transaction",
  authMiddleware,
  upload.single("documentation"),
  async (req, res) => {
    console.log("🚀 ~ req:", req.body);
    try {
      const fileUrl = req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : null;
      const newTransaction = new Transaction({
        ...req.body,
        documentation: fileUrl,
        createdAt: new Date(),
      });
      console.log("🚀 ~ newTransaction:", newTransaction);
      await newTransaction.save();
      res.status(201).json({ message: "Transaction created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.patch(
  "/transaction/:id",
  upload.single("documentation"),
  authMiddleware,
  async (req, res) => {
    const { id } = req.params;
    const updateFields = req.body;

    try {
      const transaction = await Transaction.findById({ _id: new ObjectId(id) });
      if (!transaction)
        return res.status(404).json({ message: "Transaction not found" });

      if (transaction.documentation && req.file) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          "uploads",
          transaction.documentation.replace(
            `${req.protocol}://${req.get("host")}/uploads/`,
            ""
          )
        );

        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error("Failed to delete old file:", err);
          } else {
            console.log("Old file deleted successfully");
          }
        });
      }

      const fileUrl = req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : transaction.documentation;

      Object.assign(transaction, updateFields, { documentation: fileUrl });
      transaction.updatedAt = new Date();
      await transaction.save();

      res.status(200).json({ message: "Transaction updated" });
    } catch (error) {
      console.log("🚀 ~ router.patch ~ error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete("/transaction/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.findByIdAndDelete({
      _id: new ObjectId(id),
    });
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.documentation) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        transaction.documentation.replace(
          `${req.protocol}://${req.get("host")}/uploads/`,
          ""
        )
      );

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Failed to delete file:", err);
        } else {
          console.log("File deleted successfully");
        }
      });
    }

    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
