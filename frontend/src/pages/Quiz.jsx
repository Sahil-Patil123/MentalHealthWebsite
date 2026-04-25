import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    question: "Over the past 2 weeks, how often have you been bothered by little interest or pleasure in doing things?",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ],
    ans: 1,
    category: "Depression"
  },
  {
    question: "Over the past 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ],
    ans: 1,
    category: "Depression"
  },
  {
    question: "Over the past 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ],
    ans: 1,
    category: "Sleep"
  },
  {
    question: "Over the past 2 weeks, how often have you been bothered by feeling tired or having little energy?",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ],
    ans: 1,
    category: "Energy"
  },
  {
    question: "Over the past 2 weeks, how often have you been bothered by poor appetite or overeating?",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ],
    ans: 1,
    category: "Appetite"
  },
  {
    question: "Over the past 2 weeks, how often have you been bothered by feeling bad about yourself — or that you are a failure?",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ],
    ans: 1,
    category: "Self-esteem"
  },
  {
    question: "Over the past 2 weeks, how often have you been bothered by trouble concentrating on things?",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ],
    ans: 1,
    category: "Concentration"
  },
  {
    question: "Over the past 2 weeks, how often have you been bothered by moving or speaking so slowly that others noticed?",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ],
    ans: 1,
    category: "Movement"
  },
  {
    question: "Over the past 2 weeks, how often have you been bothered by thoughts that you would be better off dead?",
    options: [
      "Not at all",
      "Several days",
      "More than half the days",
      "Nearly every day"
    ],
    ans: 1,
    category: "Suicidal Thoughts"
  },
  {
    question: "How often do you feel anxious or worried about everyday situations?",
    options: [
      "Rarely or never",
      "Sometimes",
      "Often",
      "All the time"
    ],
    ans: 1,
    category: "Anxiety"
  }
];

const Modal = ({ show, depressionLevel, score, onClose, onRetake }) => {
  if (!show) return null;

  let suggestionMessage = "";
  let suggestionColor = "";
  
  if (score >= 0 && score <= 4) {
    suggestionMessage = "Your results suggest minimal depression symptoms. Continue maintaining healthy habits!";
    suggestionColor = "text-green-600";
  } else if (score >= 5 && score <= 9) {
    suggestionMessage = "Your results suggest mild depression. Consider speaking with a counselor or trying self-help strategies.";
    suggestionColor = "text-yellow-600";
  } else if (score >= 10 && score <= 14) {
    suggestionMessage = "Your results suggest moderate depression. We recommend speaking with a mental health professional.";
    suggestionColor = "text-orange-600";
  } else if (score >= 15 && score <= 19) {
    suggestionMessage = "Your results suggest moderately severe depression. Please consider seeking professional help soon.";
    suggestionColor = "text-orange-700";
  } else if (score >= 20) {
    suggestionMessage = "Your results suggest severe depression. We strongly recommend reaching out to a mental health professional immediately.";
    suggestionColor = "text-red-600";
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 text-center">
        <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
          score <= 4 ? "bg-green-100" : score <= 9 ? "bg-yellow-100" : "bg-red-100"
        }`}>
          {score <= 4 ? (
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : score <= 9 ? (
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Assessment Complete</h2>
        
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 mb-4">
          <p className="text-gray-600 mb-1">Your PHQ-9 Score</p>
          <p className="text-4xl font-bold text-indigo-600">{score} / {questions.length * 3}</p>
          <p className="text-xs text-gray-400 mt-1">0–4: Minimal · 5–9: Mild · 10–14: Moderate · 15–19: Mod. Severe · 20+: Severe</p>
        </div>

        <p className={`text-lg font-medium mb-2 ${suggestionColor}`}>
          {depressionLevel}
        </p>
        <p className="text-gray-600 mb-6">{suggestionMessage}</p>

        <div className="flex gap-3">
          <button
            onClick={onRetake}
            className="flex-1 px-6 py-3 border border-indigo-300 text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors"
          >
            Retake Test
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

const Quiz = () => {
  const [index, setIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [depressionLevel, setDepressionLevel] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [timerActive, setTimerActive] = useState(true);

  const question = questions[index];
  const progress = ((index + 1) / questions.length) * 100;

  useEffect(() => {
    if (timerActive && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleSubmit();
    }
  }, [timeLeft, timerActive, showResult]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSelectAnswer = (optionIndex) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIndex);
    setAnswers([...answers, optionIndex]);
  };

  const nextQuestion = () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setSelectedAnswer(null);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const finalAnswers = selectedAnswer !== null ? [...answers, selectedAnswer] : answers;
    const finalScore = finalAnswers.reduce((acc, ans) => acc + ans, 0);

    setScore(finalScore);
    setShowResult(true);
    setTimerActive(false);

    if (finalScore >= 20) {
      setDepressionLevel("Severe Depression");
    } else if (finalScore >= 15) {
      setDepressionLevel("Moderately Severe Depression");
    } else if (finalScore >= 10) {
      setDepressionLevel("Moderate Depression");
    } else if (finalScore >= 5) {
      setDepressionLevel("Mild Depression");
    } else {
      setDepressionLevel("Minimal Symptoms");
    }

    localStorage.setItem(
      "quizResult",
      JSON.stringify({
        depressionLevel: finalScore >= 20 ? "Severe" : finalScore >= 15 ? "Moderately Severe" : finalScore >= 10 ? "Needs Attention" : finalScore >= 5 ? "Mild" : "Healthy",
        score: finalScore,
        date: new Date().toISOString(),
      })
    );

    setShowModal(true);
  };

  const retakeQuiz = () => {
    setIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setShowModal(false);
    setTimeLeft(600);
    setTimerActive(true);
    setDepressionLevel("");
    setScore(0);
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Mental Health Assessment</h1>
              <div className={`px-4 py-2 rounded-full text-white font-medium ${
                timeLeft > 300 ? "bg-white/20" : timeLeft > 120 ? "bg-yellow-500/50" : "bg-red-500/50"
              }`}>
                <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(timeLeft)}
              </div>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-white/80 mt-2 text-sm">Question {index + 1} of {questions.length}</p>
          </div>

          <div className="p-8">
            <div className="mb-2">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                {question.category}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedAnswer === optionIndex;

                return (
                  <button
                    key={optionIndex}
                    onClick={() => handleSelectAnswer(optionIndex)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                      selectedAnswer === null
                        ? "bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300"
                        : isSelected
                        ? "bg-indigo-100 border-2 border-indigo-500"
                        : "bg-gray-50 border border-gray-200 opacity-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      {isSelected ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{String.fromCharCode(65 + optionIndex)}</span>
                      )}
                    </div>
                    <span className="text-gray-700">{option}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={nextQuestion}
              disabled={selectedAnswer === null}
              className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {index < questions.length - 1 ? "Next Question" : "Submit Assessment"}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          This is a screening tool and not a diagnosis. Please consult a mental health professional for proper evaluation.
        </p>
      </div>

      <Modal
        show={showModal}
        depressionLevel={depressionLevel}
        score={score}
        onClose={() => {
          setShowModal(false);
          navigate("/my-profile");
        }}
        onRetake={retakeQuiz}
      />
    </div>
  );
};

export default Quiz;
