// AppointmentsList.js
import React, { useContext } from "react";
import { AppContext } from "../context/AppContext"; // Adjust the import if needed

const AppointmentsList = () => {
  const { bookedAppointments } = useContext(AppContext); // Get booked appointments from context

  return (
    <div>
      <h2>Your Appointments</h2>
      {bookedAppointments.length === 0 ? (
        <p>No appointments booked.</p>
      ) : (
        bookedAppointments.map((appointment, index) => (
          <div key={index} className="appointment-item">
            <h3>Appointment with {appointment.doctor.name}</h3>
            <p>Date: {appointment.date.toLocaleDateString()}</p>
            <p>Time: {appointment.time}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default AppointmentsList;
