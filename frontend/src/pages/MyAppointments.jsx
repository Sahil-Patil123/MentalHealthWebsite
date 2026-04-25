import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const { bookedAppointments, cancelAppointment } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("bookedAppointments");
    if (stored) {
      try {
        setAppointments(JSON.parse(stored));
      } catch (e) {
        setAppointments([]);
      }
    }
  }, [bookedAppointments]);

  const handleCancel = (index) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      cancelAppointment(index);
      const updated = appointments.filter((_, i) => i !== index);
      localStorage.setItem("bookedAppointments", JSON.stringify(updated));
      setAppointments(updated);
    }
  };

  const allAppointments = appointments.length > 0 ? appointments : bookedAppointments;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">My Appointments</h2>
            <p className="text-gray-600 mt-1">Manage your scheduled appointments</p>
          </div>
          <Link
            to="/sessions"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            Book New
          </Link>
        </div>

        {allAppointments.length > 0 ? (
          <div className="space-y-4">
            {allAppointments.map((appointment, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 p-4 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-white shadow-inner">
                      <img
                        className="w-full h-full object-cover"
                        src={appointment.doctor?.image || "./images/avatar.png"}
                        alt={appointment.doctor?.name || "Doctor"}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150?text=Doctor";
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {appointment.doctor?.name || "Doctor"}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                            {appointment.doctor?.speciality || "General"}
                          </span>
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            {appointment.doctor?.experience || ""} Experience
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">₹{appointment.doctor?.fees || 0}</p>
                        <p className="text-gray-500 text-sm">Consultation Fee</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-gray-800">
                            {appointment.doctor?.address?.line1}, {appointment.doctor?.address?.line2}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date & Time</p>
                          <p className="font-medium text-gray-800">
                            {appointment.dateStr || new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </p>
                        </div>
                      </div>
                    </div>

                    {appointment.message && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Your Message:</span> {appointment.message}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleCancel(index)}
                        className="px-6 py-2 border border-red-200 text-red-600 rounded-full font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Appointment
                      </button>
                      <button
                        onClick={() => navigate(`/appointment/${appointment.doctorId}`, { state: { rescheduleIndex: index } })}
                        className="px-6 py-2 border border-indigo-200 text-indigo-600 rounded-full font-medium hover:bg-indigo-50 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl shadow-lg">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Appointments Yet</h3>
            <p className="text-gray-500 mb-6">Book an appointment with one of our mental health professionals</p>
            <Link
              to="/sessions"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              Find a Doctor
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
