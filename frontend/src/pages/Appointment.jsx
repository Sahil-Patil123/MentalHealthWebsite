import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const Appointment = () => {
  const { doctors, addBookedAppointment, rescheduleAppointment } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const rescheduleIndex = location.state?.rescheduleIndex ?? null; // null = new booking

  const [docInfo, setDocInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    console.log("Doctor ID from URL:", id);
    console.log("Available doctors:", doctors);
    
    if (doctors && doctors.length > 0) {
      const doctor = doctors.find((doc) => doc._id === id);
      console.log("Found doctor:", doctor);
      
      if (doctor) {
        setDocInfo(doctor);
        setFormData(prev => ({
          ...prev,
          name: localStorage.getItem("userName") || "",
          email: localStorage.getItem("userEmail") || ""
        }));
      }
    }
    setLoading(false);
  }, [id, doctors]);

  useEffect(() => {
    if (docInfo) generateSlots();
  }, [docInfo]);

  const generateSlots = () => {
    const today = new Date();
    const slots = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const timeslots = [];

      let startHour = 10;
      if (i === 0) {
        const currentHour = date.getHours();
        startHour = currentHour < 10 ? 10 : currentHour + 1;
      }
      
      for (let hour = startHour; hour < 21; hour++) {
        for (let min of ["00", "30"]) {
          const time = new Date(date);
          time.setHours(hour, min, 0, 0);
          
          if (time > new Date()) {
            timeslots.push({
              datetime: time.toISOString(),
              time: time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              dateStr: time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
            });
          }
        }
      }
      slots.push(timeslots);
    }

    setDocSlots(slots);
  };

  const validateForm = () => {
    const userName = localStorage.getItem("userName") || formData.name;
    const userEmail = localStorage.getItem("userEmail") || formData.email;
    
    if (!userName?.trim()) return "Please enter your name";
    if (!userEmail?.trim()) return "Please enter your email";
    if (!selectedSlot) return "Please select a time slot";
    return null;
  };

  const handleBookAppointment = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setShowConfirmation(true);
  };

  const confirmBooking = async () => {
    setLoadingBooking(true);
    setError("");
    setSuccess("");

    const userName = localStorage.getItem("userName") || formData.name;
    const userEmail = localStorage.getItem("userEmail") || formData.email;

    const appointmentData = {
      name: userName,
      email: userEmail,
      phone: formData.phone || "",
      message: formData.message || "",
      date: selectedSlot.datetime,
      doctorId: id,
      time: selectedSlot.time,
      dateStr: selectedSlot.dateStr,
      doctor: {
        image: docInfo.image,
        name: docInfo.name,
        speciality: docInfo.speciality,
        degree: docInfo.degree,
        address: docInfo.address,
        fees: docInfo.fees,
      },
    };

    try {
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
        },
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      if (response.ok) {
        if (rescheduleIndex !== null) {
          // Rescheduling: replace the old appointment at same index
          rescheduleAppointment(rescheduleIndex, appointmentData);
        } else {
          // New booking: add to the list
          addBookedAppointment(appointmentData);
        }
        setSuccess(rescheduleIndex !== null ? "Appointment rescheduled successfully!" : "Appointment booked successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
        setSelectedSlot(null);
        setTimeout(() => {
          navigate("/my-appointments");
        }, 2000);
      } else {
        setError(data.message || "Failed to book appointment");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError("Unable to connect to server. Please make sure the backend is running.");
    } finally {
      setLoadingBooking(false);
      setShowConfirmation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!docInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Doctor Not Found</h2>
          <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/sessions")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition-colors"
          >
            Browse Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/sessions")}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Doctors
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-gray-100">
                <img
                  src={docInfo.image || "/images/avatar.png"}
                  alt={docInfo.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/400x300?text=Doctor";
                  }}
                />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {docInfo.name}
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {docInfo.speciality}
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {docInfo.experience} Experience
                </span>
              </div>

              <p className="text-gray-600 mb-2">{docInfo.degree}</p>
              
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{docInfo.address?.line1}, {docInfo.address?.line2}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="text-2xl font-bold text-indigo-600">₹{docInfo.fees}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Date & Time
              </h2>

              <div className="flex gap-3 overflow-x-auto pb-4 mb-4">
                {docSlots.map((slots, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSlotIndex(index);
                      setSelectedSlot(null);
                    }}
                    disabled={slots.length === 0}
                    className={`flex-shrink-0 p-4 rounded-xl transition-all ${
                      slotIndex === index
                        ? "bg-indigo-600 text-white shadow-lg"
                        : slots.length > 0
                        ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <p className="font-semibold">
                      {slots[0]?.dateStr?.split(" ")[0] || "N/A"}
                    </p>
                    <p className="text-2xl font-bold">
                      {slots[0]?.dateStr?.split(" ")[1]?.replace(",", "") || "N/A"}
                    </p>
                    <p className="text-sm">
                      {slots[0]?.dateStr?.split(" ")[2] || ""}
                    </p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {docSlots[slotIndex]?.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedSlot === slot
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-gray-50 text-gray-700 hover:bg-indigo-50 border border-gray-200"
                    }`}
                  >
                    <p className="font-semibold">{slot.time}</p>
                  </button>
                ))}
              </div>

              {docSlots[slotIndex]?.length === 0 && (
                <p className="text-center text-gray-500 py-4">No slots available for this date</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Information
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={localStorage.getItem("userName") || formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={localStorage.getItem("userEmail") || formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Your email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Your phone number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {success}
                </div>
              )}

              <button
                onClick={handleBookAppointment}
                disabled={!selectedSlot || loadingBooking}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {loadingBooking ? "Booking..." : "Book Appointment"}
              </button>
            </div>
          </div>
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Appointment</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor</span>
                  <span className="font-medium">{docInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{selectedSlot?.dateStr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">{selectedSlot?.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee</span>
                  <span className="font-medium text-indigo-600">₹{docInfo.fees}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={loadingBooking}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loadingBooking ? "Confirming..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;
