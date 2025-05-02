const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  locationId: {
    type: String,
    required: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  quantity_good: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  expired_date: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
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

module.exports = mongoose.model("Inventory", inventorySchema);
