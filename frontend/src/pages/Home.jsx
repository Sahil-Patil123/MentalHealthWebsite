import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const features = [
  {
    icon: "🧠",
    title: "Mental Health Assessment",
    description: "Take our scientifically designed quiz to understand your mental health better",
    link: "/quiz",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: "👨‍⚕️",
    title: "Find a Therapist",
    description: "Connect with licensed mental health professionals for personalized care",
    link: "/sessions",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: "📝",
    title: "Personal Diary",
    description: "Track your thoughts and feelings with our secure journaling feature",
    link: "/diary",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: "🔍",
    title: "Symptom Checker",
    description: "Learn more about your symptoms and what they might indicate",
    link: "/healthProblems",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: "📚",
    title: "Resources",
    description: "Access articles, tips, and educational content about mental wellness",
    link: "/blogs",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: "🎥",
    title: "Videos",
    description: "Watch helpful videos on meditation, mindfulness, and mental health",
    link: "/videos",
    color: "from-red-500 to-pink-500"
  }
];

const testimonials = [
  {
    name: "Sarah M.",
    text: "This platform helped me understand my anxiety better. The assessment was eye-opening!",
    rating: 5
  },
  {
    name: "John D.",
    text: "Found a great therapist through this site. The appointment booking was so easy.",
    rating: 5
  },
  {
    name: "Emily R.",
    text: "The daily diary feature has been incredible for tracking my mood patterns.",
    rating: 5
  }
];

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwtToken"));
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("jwtToken"));
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/quiz");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              Your Mental Wellness Journey Starts Here
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Welcome{isLoggedIn ? `, ${userName?.split(' ')[0]}` : ""}!
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Take control of your mental health with our comprehensive tools and professional support. 
              You're not alone on this journey.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {isLoggedIn ? "Take Assessment" : "Get Started Free"}
              </button>
              <Link
                to="/sessions"
                className="px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold text-lg border-2 border-indigo-100 hover:border-indigo-300 transition-all hover:shadow-lg"
              >
                Find a Doctor
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">How Can We Help You?</h2>
          <p className="text-gray-600 mt-2">Explore our range of mental health resources and services</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
              <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm">
                Learn more
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h2 className="text-3xl font-bold">What Our Users Say</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/90 mb-4">"{testimonial.text}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Need Immediate Support?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            If you're experiencing a mental health crisis or need immediate help, please reach out to emergency services or a crisis hotline.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:988"
              className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors"
            >
              Call Helpline: 022-24131212
            </a>
            <Link
              to="/sessions"
              className="px-6 py-3 bg-white text-green-600 border-2 border-green-200 rounded-full font-semibold hover:bg-green-50 transition-colors"
            >
              Book Emergency Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
