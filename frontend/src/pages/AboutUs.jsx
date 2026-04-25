import React from "react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-6">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            About Mind Mender
          </h2>
          <p className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto">
            Your companion on the journey to mental wellness
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Our Mission</h3>
              <p className="text-gray-600">
                At Mind Mender, our mission is to provide a supportive and accessible platform for individuals struggling with depression or mental health concerns. We understand that depression can affect anyone, and seeking help can often feel overwhelming. Our goal is to offer a safe space where people can find useful resources, self-screen for early signs of depression, and easily access mental health professionals, all from the comfort of their home.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">What We Offer</h3>
              <p className="text-gray-600 mb-4">
                Mind Mender is designed to help users better understand their mental well-being and seek assistance when needed.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Self-Screening Tools with AI-powered analysis</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Easy appointment booking with mental health professionals</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Personal diary to track your thoughts and feelings</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Educational resources and wellness tips</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confidential and secure platform</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Why It Matters</h3>
              <p className="text-gray-600">
                Depression is one of the most common mental health conditions, affecting millions of people worldwide. Unfortunately, stigma, lack of access, and insufficient information often prevent individuals from seeking help early. We believe that mental health care should be as accessible and simple as possible. Mind Mender was built with compassion and the understanding that small steps toward mental wellness can have a huge impact.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">How We Help</h3>
              <p className="text-gray-600">
                Whether you're seeking to understand more about depression, looking for self-care strategies, or ready to connect with a professional, Mind Mender is here to assist you every step of the way. We believe that mental health is just as important as physical health, and taking the first step towards wellness is an act of courage. We're here to support you in that journey.
              </p>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Get Started Today</h3>
              <p className="text-white/80 mb-4">
                Take the first step towards better mental health. Our platform is here to support you.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/quiz"
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Take Assessment
                </Link>
                <Link
                  to="/sessions"
                  className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
                >
                  Find a Doctor
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800">Key Features</h3>
            <p className="text-gray-600 mt-2">Everything you need for your mental wellness journey</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">AI Assessment</h4>
              <p className="text-gray-500 text-sm">Smart analysis using advanced ML models</p>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Easy Booking</h4>
              <p className="text-gray-500 text-sm">Schedule appointments with professionals</p>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Personal Diary</h4>
              <p className="text-gray-500 text-sm">Track your thoughts and mood daily</p>
            </div>

            <div className="text-center p-4">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Resources</h4>
              <p className="text-gray-500 text-sm">Educational content and wellness tips</p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Need Immediate Support?</h3>
          <p className="text-white/80 max-w-2xl mx-auto mb-6">
            If you're experiencing a mental health crisis, please reach out to emergency services or call our helpline.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:988" className="px-6 py-3 bg-white text-green-600 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Call Helpline: 988
            </a>
            <Link to="/sessions" className="px-6 py-3 bg-white/20 text-white rounded-full font-semibold hover:bg-white/30 transition-colors">
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
