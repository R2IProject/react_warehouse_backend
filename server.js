// server.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const express = require("express");
const path = require('path');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const locationsRoutes = require("./routes/locations");
const inventoryRoutes = require("./routes/inventory");
const transactionsRoutes = require("./routes/transactions");

dotenv.config();

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONT_APP_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api-warehouse", authRoutes);
app.use("/api-warehouse", usersRoutes);
app.use("/api-warehouse", locationsRoutes);
app.use("/api-warehouse", inventoryRoutes);
app.use("/api-warehouse", transactionsRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
