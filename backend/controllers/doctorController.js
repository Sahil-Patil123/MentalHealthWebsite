const Doctor = require("../models/doctor");

// Get all doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error });
  }
};

// Get a single doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor", error });
  }
};

// Create a new doctor
const createDoctor = async (req, res) => {
  const newDoctor = new Doctor(req.body);
  try {
    const doctor = await newDoctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ message: "Error creating doctor", error });
  }
};

// Update a doctor
const updateDoctor = async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedDoctor)
      return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(updatedDoctor);
  } catch (error) {
    res.status(400).json({ message: "Error updating doctor", error });
  }
};

// Delete a doctor
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doctor", error });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
