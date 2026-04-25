import React, { useState } from "react";
import { Link } from "react-router-dom";

const resources = [
  {
    id: 1,
    title: "Understanding Anxiety",
    category: "Mental Health Basics",
    icon: "🧠",
    color: "from-blue-500 to-cyan-500",
    content: "Anxiety is your body's natural response to stress. It's a feeling of fear or apprehension about what's to come. While occasional anxiety is normal, persistent anxiety may require professional support.",
    tips: [
      "Practice deep breathing exercises",
      "Maintain regular exercise routine",
      "Limit caffeine and alcohol intake",
      "Get adequate sleep"
    ]
  },
  {
    id: 2,
    title: "Managing Depression",
    category: "Mental Health Basics",
    icon: "💜",
    color: "from-purple-500 to-pink-500",
    content: "Depression is more than just feeling sad. It's a mental health condition that affects how you feel, think, and handle daily activities. Understanding the signs is the first step toward getting help.",
    tips: [
      "Set small, achievable goals",
      "Stay connected with loved ones",
      "Engage in physical activity",
      "Consider journaling your thoughts"
    ]
  },
  {
    id: 3,
    title: "Building Resilience",
    category: "Self-Help",
    icon: "🌱",
    color: "from-green-500 to-emerald-500",
    content: "Resilience is the ability to adapt and bounce back from challenges. It's a skill that can be developed over time with practice and the right support system.",
    tips: [
      "Develop a strong support network",
      "Practice self-compassion",
      "Accept that change is part of life",
      "Focus on what you can control"
    ]
  },
  {
    id: 4,
    title: "Better Sleep Habits",
    category: "Wellness",
    icon: "😴",
    color: "from-indigo-500 to-purple-500",
    quality: "Sleep is essential for mental health. Poor sleep can worsen anxiety, depression, and stress. Developing good sleep hygiene can significantly improve your mental wellbeing.",
    tips: [
      "Maintain a consistent sleep schedule",
      "Create a relaxing bedtime routine",
      "Limit screen time before bed",
      "Keep your bedroom cool and dark"
    ]
  },
  {
    id: 5,
    title: "Stress Management",
    category: "Self-Help",
    icon: "🧘",
    color: "from-orange-500 to-amber-500",
    content: "Chronic stress can take a toll on both your mental and physical health. Learning to manage stress effectively is crucial for maintaining overall wellbeing.",
    tips: [
      "Try progressive muscle relaxation",
      "Practice mindfulness meditation",
      "Take regular breaks during work",
      "Learn to say no"
    ]
  },
  {
    id: 6,
    title: "Mindful Eating",
    category: "Wellness",
    icon: "🥗",
    color: "from-green-500 to-lime-500",
    content: "What you eat can affect your mood and mental health. A balanced diet rich in nutrients supports brain function and emotional regulation.",
    tips: [
      "Stay hydrated throughout the day",
      "Include omega-3 fatty acids in your diet",
      "Limit processed foods and sugars",
      "Don't skip meals"
    ]
  }
];

const quickTips = [
  { icon: "🚶", title: "Daily Exercise", desc: "30 mins of movement" },
  { icon: "💧", title: "Stay Hydrated", desc: "8 glasses of water" },
  { icon: "📱", title: "Digital Detox", desc: "Take breaks from screens" },
  { icon: "🤝", title: "Connect", desc: "Talk to someone" },
  { icon: "📝", title: "Journal", desc: "Write your thoughts" },
  { icon: "🌿", title: "Nature Time", desc: "Spend time outdoors" }
];

const ResourcesPage = () => {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Mental Health Basics", "Self-Help", "Wellness"];
  
  const filteredResources = selectedCategory === "All" 
    ? resources 
    : resources.filter(r => r.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Mental Health Resources
          </h2>
          <p className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto">
            Educational content and practical tips to support your mental wellness journey
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {quickTips.map((tip, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all text-center">
              <div className="text-3xl mb-2">{tip.icon}</div>
              <h4 className="font-semibold text-gray-800 text-sm">{tip.title}</h4>
              <p className="text-gray-500 text-xs">{tip.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${resource.color} p-6`}>
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{resource.icon}</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                    {resource.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-4">{resource.title}</h3>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">{resource.content}</p>

                {expandedId === resource.id ? (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">Helpful Tips:</h4>
                    <ul className="space-y-2">
                      {resource.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {tip}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setExpandedId(null)}
                      className="text-indigo-600 font-medium text-sm mt-2"
                    >
                      Show less
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpandedId(resource.id)}
                    className="text-indigo-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Learn more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Need Professional Help?</h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            If you're struggling with mental health issues, our professionals are here to support you. Book an appointment with one of our experienced therapists.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/sessions"
              className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Find a Therapist
            </Link>
            <Link
              to="/quiz"
              className="bg-white/20 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors"
            >
              Take Assessment
            </Link>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Emergency Help</h4>
            <p className="text-gray-600 text-sm">If you're in crisis, please contact emergency services or a crisis hotline immediately.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Self-Help Guides</h4>
            <p className="text-gray-600 text-sm">Access our library of self-help resources and workbooks.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Support Groups</h4>
            <p className="text-gray-600 text-sm">Connect with others who understand what you're going through.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
