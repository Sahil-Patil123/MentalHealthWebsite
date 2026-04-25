const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
    doctorId: {
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Doctor", // Assuming you have a Doctor model
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
