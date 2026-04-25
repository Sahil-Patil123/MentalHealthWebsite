const express = require("express");
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");

// Get all doctors
router.get("/doctors", getDoctors);

// Get a single doctor by ID
router.get("/doctors/:id", getDoctorById);

// Create a new doctor
router.post("/doctors", createDoctor);

// Update a doctor
router.put("/doctors/:id", updateDoctor);

// Delete a doctor
router.delete("/doctors/:id", deleteDoctor);

module.exports = router;
