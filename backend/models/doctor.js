const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  speciality: { type: String, required: true },
  degree: { type: String },
  experience: { type: String },
  fees: { type: Number },
  address: {
    line1: { type: String },
    line2: { type: String },
  },
});

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
