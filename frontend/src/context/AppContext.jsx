import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([
    {
      _id: "doc1",
      name: "Dr. Sarah Johnson",
      image: "./images/Doc1.jpg",
      speciality: "Psychiatrist",
      degree: "MBBS, MD Psychiatry",
      experience: "12 Years",
      fees: 1500,
      address: {
        line1: "Mind Care Clinic",
        line2: "Mumbai",
      },
    },
    {
      _id: "doc2",
      name: "Dr. Michael Chen",
      image: "./images/Doc2.jpg",
      speciality: "Psychologist",
      degree: "M.Sc. Clinical Psychology",
      experience: "8 Years",
      fees: 1200,
      address: {
        line1: "Wellness Center",
        line2: "Delhi",
      },
    },
    {
      _id: "doc3",
      name: "Dr. Priya Sharma",
      image: "./images/Doc3.jpg",
      speciality: "Counselor",
      degree: "MA Counseling Psychology",
      experience: "6 Years",
      fees: 800,
      address: {
        line1: "Healing Minds",
        line2: "Bangalore",
      },
    },
    {
      _id: "doc4",
      name: "Dr. James Wilson",
      image: "./images/Doc4.jpg",
      speciality: "Therapist",
      degree: "MFT, Certified Therapist",
      experience: "10 Years",
      fees: 1000,
      address: {
        line1: "Life Balance Center",
        line2: "Chennai",
      },
    },
    {
      _id: "doc5",
      name: "Dr. Anjali Patel",
      image: "./images/Doc5.jpg",
      speciality: "Psychiatrist",
      degree: "MBBS, DPM",
      experience: "15 Years",
      fees: 2000,
      address: {
        line1: "Mental Health Institute",
        line2: "Hyderabad",
      },
    },
    {
      _id: "doc6",
      name: "Dr. Robert Kim",
      image: "./images/Doc6.jpg",
      speciality: "Neurologist",
      degree: "MBBS, DM Neurology",
      experience: "18 Years",
      fees: 2500,
      address: {
        line1: "Brain & Spine Center",
        line2: "Kolkata",
      },
    },
  ]);

  const [bookedAppointments, setBookedAppointments] = useState(() => {
    const stored = localStorage.getItem("bookedAppointments");
    return stored ? JSON.parse(stored) : [];
  });

  const [currencysymbol] = useState("₹");

  const addBookedAppointment = (appointment) => {
    const updated = [...bookedAppointments, appointment];
    setBookedAppointments(updated);
    localStorage.setItem("bookedAppointments", JSON.stringify(updated));
  };

  const rescheduleAppointment = (index, appointment) => {
    const updated = [...bookedAppointments];
    updated[index] = appointment; // replace old appointment at same index
    setBookedAppointments(updated);
    localStorage.setItem("bookedAppointments", JSON.stringify(updated));
  };

  const cancelAppointment = (index) => {
    const updated = bookedAppointments.filter((_, i) => i !== index);
    setBookedAppointments(updated);
    localStorage.setItem("bookedAppointments", JSON.stringify(updated));
  };

  return (
    <AppContext.Provider
      value={{
        doctors,
        bookedAppointments,
        addBookedAppointment,
        rescheduleAppointment,
        cancelAppointment,
        currencysymbol,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
