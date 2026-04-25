const Appointment = require("../models/appointment");

exports.bookAppointment = async (req, res) => {
  try {
    const { name, email, message, date, doctorId } = req.body;

    const newAppointment = new Appointment({
      name,
      email,
      message,
      date,
      doctorId,
    });

    await newAppointment.save();
    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to book appointment", error: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("doctorId");
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch appointments", error: error.message });
  }
};
