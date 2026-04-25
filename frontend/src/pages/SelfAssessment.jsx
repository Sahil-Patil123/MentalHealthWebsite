import React, { useState } from "react";
import { Link } from "react-router-dom";

const symptomsData = [
  {
    id: 1,
    name: "Persistent Sadness",
    icon: "😢",
    description: "Feeling sad or empty most days for more than 2 weeks",
    possibleRelated: ["Depression", "Major Depressive Disorder"],
    severity: "medium",
    gradient: "linear-gradient(to right, #eab308, #f97316)"
  },
  {
    id: 2,
    name: "Excessive Worry",
    icon: "😰",
    description: "Finding it difficult to control worry or feeling anxious most days",
    possibleRelated: ["Generalized Anxiety Disorder", "Anxiety"],
    severity: "medium",
    gradient: "linear-gradient(to right, #3b82f6, #6366f1)"
  },
  {
    id: 3,
    name: "Sleep Changes",
    icon: "😴",
    description: "Significant changes in sleep patterns - too much or too little",
    possibleRelated: ["Depression", "Anxiety", "Bipolar Disorder"],
    severity: "low",
    gradient: "linear-gradient(to right, #a855f7, #ec4899)"
  },
  {
    id: 4,
    name: "Loss of Interest",
    icon: "😔",
    description: "Losing interest in activities you once enjoyed",
    possibleRelated: ["Depression", "Dysthymia"],
    severity: "medium",
    gradient: "linear-gradient(to right, #22c55e, #14b8a6)"
  },
  {
    id: 5,
    name: "Difficulty Concentrating",
    icon: "🧠",
    description: "Trouble focusing, making decisions, or remembering things",
    possibleRelated: ["Depression", "Anxiety", "ADHD"],
    severity: "low",
    gradient: "linear-gradient(to right, #06b6d4, #3b82f6)"
  },
  {
    id: 6,
    name: "Mood Swings",
    icon: "🎢",
    description: "Extreme mood changes from high to low in short periods",
    possibleRelated: ["Bipolar Disorder", "Borderline Personality Disorder"],
    severity: "high",
    gradient: "linear-gradient(to right, #ef4444, #ec4899)"
  },
  {
    id: 7,
    name: "Social Withdrawal",
    icon: "🚪",
    description: "Avoiding friends, family, and activities you used to enjoy",
    possibleRelated: ["Depression", "Social Anxiety", "Agoraphobia"],
    severity: "medium",
    gradient: "linear-gradient(to right, #6b7280, #475569)"
  },
  {
    id: 8,
    name: "Fatigue",
    icon: "🔋",
    description: "Feeling tired all the time, even after rest",
    possibleRelated: ["Depression", "Chronic Fatigue Syndrome", "Anxiety"],
    severity: "low",
    gradient: "linear-gradient(to right, #f59e0b, #eab308)"
  },
  {
    id: 9,
    name: "Panic Attacks",
    icon: "⚡",
    description: "Sudden episodes of intense fear with physical symptoms",
    possibleRelated: ["Panic Disorder", "Anxiety"],
    severity: "high",
    gradient: "linear-gradient(to right, #ef4444, #e11d48)"
  },
  {
    id: 10,
    name: "Intrusive Thoughts",
    icon: "💭",
    description: "Unwanted thoughts that are difficult to control",
    possibleRelated: ["OCD", "Anxiety", "PTSD"],
    severity: "medium",
    gradient: "linear-gradient(to right, #8b5cf6, #7c3aed)"
  },
  {
    id: 11,
    name: "Changes in Appetite",
    icon: "🍽️",
    description: "Significant weight changes due to appetite changes",
    possibleRelated: ["Depression", "Eating Disorders", "Anxiety"],
    severity: "low",
    gradient: "linear-gradient(to right, #10b981, #16a34a)"
  },
  {
    id: 12,
    name: "Hopelessness",
    icon: "🌑",
    description: "Feeling like things will never get better or there's no point trying",
    possibleRelated: ["Depression", "Suicidal Thoughts"],
    severity: "high",
    gradient: "linear-gradient(to right, #475569, #1f2937)"
  }
];

const SelfAssessment = () => {
  const [checkedSymptoms, setCheckedSymptoms] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const toggleSymptom = (id) => {
    setCheckedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getResults = () => {
    const selectedSymptoms = symptomsData.filter(s => checkedSymptoms.includes(s.id));
    const highSeverity = selectedSymptoms.filter(s => s.severity === "high").length;
    const mediumSeverity = selectedSymptoms.filter(s => s.severity === "medium").length;
    
    let recommendation = "";
    let color = "";
    
    if (highSeverity > 0) {
      recommendation = "We recommend speaking with a mental health professional soon. Your symptoms may indicate a condition that requires attention.";
      color = "text-red-600";
    } else if (mediumSeverity > 0 || checkedSymptoms.length >= 4) {
      recommendation = "Consider reaching out to a counselor or therapist. You may benefit from professional support.";
      color = "text-yellow-600";
    } else if (checkedSymptoms.length > 0) {
      recommendation = "Your symptoms appear mild. Try self-help strategies and monitor how you feel.";
      color = "text-green-600";
    } else {
      recommendation = "You haven't selected any symptoms. This is just a preliminary check.";
      color = "text-gray-600";
    }

    return { selectedSymptoms, recommendation, color, highSeverity, mediumSeverity };
  };

  const results = showResults ? getResults() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Symptom Checker
          </h2>
          <p className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto">
            Check any symptoms you've been experiencing. This is not a diagnosis, but can help you understand what you might be going through.
          </p>
        </div>

        {!showResults ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {symptomsData.map((symptom) => (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`p-4 rounded-2xl text-left transition-all ${
                    checkedSymptoms.includes(symptom.id)
                      ? "text-white shadow-lg transform scale-[1.02]"
                      : "bg-white hover:shadow-lg border border-gray-200"
                  }`}
                  style={
                    checkedSymptoms.includes(symptom.id)
                      ? { background: symptom.gradient }
                      : {}
                  }
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{symptom.icon}</span>
                    <div>
                      <h4 className={`font-semibold ${checkedSymptoms.includes(symptom.id) ? "text-white" : "text-gray-800"}`}>
                        {symptom.name}
                      </h4>
                      <p className={`text-sm mt-1 ${checkedSymptoms.includes(symptom.id) ? "text-white/80" : "text-gray-500"}`}>
                        {symptom.description}
                      </p>
                    </div>
                  </div>
                  {checkedSymptoms.includes(symptom.id) && (
                    <div className="mt-3 flex items-center gap-1 text-white text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Selected
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowResults(true)}
                disabled={checkedSymptoms.length === 0}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-4 rounded-full font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                See Results ({checkedSymptoms.length} selected)
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Your Results</h3>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setCheckedSymptoms([]);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Start Over
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-red-600 text-sm font-medium mb-1">High Severity</p>
                  <p className="text-3xl font-bold text-red-600">{results.highSeverity}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <p className="text-yellow-600 text-sm font-medium mb-1">Medium Severity</p>
                  <p className="text-3xl font-bold text-yellow-600">{results.mediumSeverity}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-green-600 text-sm font-medium mb-1">Total Selected</p>
                  <p className="text-3xl font-bold text-green-600">{checkedSymptoms.length}</p>
                </div>
              </div>

              <div className={`p-6 rounded-2xl ${results.color.includes("red") ? "bg-red-50" : results.color.includes("yellow") ? "bg-yellow-50" : results.color.includes("green") ? "bg-green-50" : "bg-gray-50"}`}>
                <p className={`text-lg font-medium ${results.color}`}>{results.recommendation}</p>
              </div>

              {results.selectedSymptoms.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Conditions to learn about:</h4>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(results.selectedSymptoms.flatMap(s => s.possibleRelated))].map((condition, idx) => (
                      <span key={idx} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Link
                to="/quiz"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Take Assessment</h4>
                    <p className="text-white/80 text-sm">Complete our mental health questionnaire</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/sessions"
                className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Book Appointment</h4>
                    <p className="text-white/80 text-sm">Speak with a mental health professional</p>
                  </div>
                </div>
              </Link>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800">Important Disclaimer</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    This symptom checker is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfAssessment;
