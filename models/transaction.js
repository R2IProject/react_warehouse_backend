const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionsSchema = new mongoose.Schema({
  approvedId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  inventoryId: {
    type: Schema.Types.ObjectId,
    ref: "Inventory",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  good_stock: {
    type: Number,
    required: true,
  },
  documentation: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("Transaction", transactionsSchema);
