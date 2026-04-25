// server.js
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoute");
const appointmentRoutes = require("./routes/appointmentRoute");
const doctorRoutes = require("./routes/doctorRoute");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();

// Initialize the app
const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// API routes
app.use("/api/user", userRoutes); // Use user routes
app.use("/api/appointments", appointmentRoutes);
app.use("/api", doctorRoutes);

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
