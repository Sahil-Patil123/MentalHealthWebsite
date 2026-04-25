import React, { useState } from "react";

const Diary = () => {
  const [entries, setEntries] = useState(Array(15).fill(""));
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [currentView, setCurrentView] = useState("write");

  const handleChange = (index, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = value;
    setEntries(updatedEntries);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    // FIX 1: Only send non-empty entries — empty strings confuse the model
    const filledEntries = entries.filter((entry) => entry.trim() !== "");

    if (filledEntries.length === 0) {
      setError("Please write at least one diary entry");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("http://127.0.0.1:5001/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // FIX 2: Send only filled entries, not all 15 (including blanks)
        body: JSON.stringify({ symptoms: filledEntries }),
      });

      if (!response.ok) {
        throw new Error("Failed to get prediction from server");
      }

      const data = await response.json();
      console.log("API Response:", data); // keep this for debugging

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        localStorage.setItem("diaryResult", JSON.stringify(data));
        setCurrentView("result"); // auto-switch to result view
      }
    } catch (err) {
      console.error("Error:", err);
      setError(
        "Unable to connect to the prediction server. Please make sure the ML server is running on port 5001."
      );
    }

    setIsProcessing(false);
  };

  const handleReset = () => {
    setEntries(Array(15).fill(""));
    setResult(null);
    setError("");
    setCurrentView("write");
  };

  // FIX 3: Match the exact strings returned by app.py
  // app.py returns: "Minimal depression", "Mild depression",
  //                 "Moderate depression", "Moderately severe depression", "Severe depression"
  const getLevelKey = (level) => {
    if (!level) return "minimal";
    const l = level.toLowerCase();
    if (l.includes("moderately severe")) return "moderately severe";
    if (l.includes("severe"))            return "severe";
    if (l.includes("moderate"))          return "moderate";
    if (l.includes("mild"))              return "mild";
    return "minimal";
  };

  const getDepressionColor = (level) => {
    const key = getLevelKey(level);
    const colors = {
      "minimal":           "text-green-600 bg-green-100",
      "mild":              "text-yellow-600 bg-yellow-100",
      "moderate":          "text-orange-600 bg-orange-100",
      "moderately severe": "text-red-500 bg-red-100",
      "severe":            "text-red-700 bg-red-200",
    };
    return colors[key] || "text-gray-600 bg-gray-100";
  };

  const getIconColor = (level) => {
    const key = getLevelKey(level);
    const colors = {
      "minimal":           "bg-green-100",
      "mild":              "bg-yellow-100",
      "moderate":          "bg-orange-100",
      "moderately severe": "bg-red-100",
      "severe":            "bg-red-200",
    };
    return colors[key] || "bg-gray-100";
  };

  const getLevelIcon = (level) => {
    const key = getLevelKey(level);
    if (key === "minimal") {
      return (
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (key === "mild") {
      return (
        <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (key === "moderate") {
      return (
        <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    // moderately severe or severe
    return (
      <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const daysWritten = entries.filter((e) => e.trim() !== "").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Depression Diary
          </h2>
          <p className="text-gray-600 mt-2">
            Write about your feelings for up to 15 days and get a PHQ-9 depression assessment
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setCurrentView("write")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              currentView === "write"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Write Entries ({daysWritten}/15)
          </button>
          <button
            onClick={() => setCurrentView("result")}
            disabled={!result}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              currentView === "result" && result
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 disabled:opacity-50"
            }`}
          >
            View Results
          </button>
        </div>

        {/* ── WRITE VIEW ── */}
        {currentView === "write" ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {entries.map((entry, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-5 ${
                    entry.trim() ? "ring-2 ring-indigo-200" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-indigo-600">Day {index + 1}</h3>
                    {entry.trim() && (
                      <span className="text-green-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <label className="block mb-2 text-sm text-gray-500">
                    How did you feel today?
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Write about your day and how you felt..."
                    value={entry}
                    onChange={(e) => handleChange(index, e.target.value)}
                    maxLength={2000}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">{entry.length}/2000</p>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="submit"
                disabled={isProcessing || daysWritten === 0}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-3 rounded-full font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing your entries...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Get Depression Level
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-8 py-3 border border-gray-200 text-gray-600 rounded-full font-medium hover:bg-gray-50 transition-colors"
              >
                Reset All
              </button>
            </div>

            <p className="text-center text-gray-500 text-sm mt-4">
              Write entries for as many days as possible. At least one entry is required.
            </p>
          </form>
        ) : (
          /* ── RESULT VIEW ── */
          <div className="max-w-3xl mx-auto">
            {result ? (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="text-center mb-8">

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${getIconColor(result.depression_level)}`}>
                    {getLevelIcon(result.depression_level)}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Assessment Complete</h3>

                  {/* Depression level badge */}
                  <div className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 mb-4">
                    <p className="text-gray-600 text-sm">Your Depression Level</p>
                    <p className={`text-3xl font-bold ${getDepressionColor(result.depression_level)}`}>
                      {result.depression_level}
                    </p>
                  </div>

                  {/* PHQ-9 score range + confidence */}
                  <div className="bg-indigo-50 rounded-xl p-4 mb-4">
                    <p className="text-gray-700">
                      <span className="font-semibold">PHQ-9 Score Range: </span>
                      {result.phq9_score_range} / 27
                    </p>
                    <p className="text-gray-700 mt-1">
                      <span className="font-semibold">Confidence: </span>
                      {result.confidence !== undefined ? `${(result.confidence * 100).toFixed(1)}%` : "N/A"}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Based on {result.days_analyzed} diary {result.days_analyzed === 1 ? "entry" : "entries"}
                    </p>
                  </div>

                  {/* Recommendation */}
                  {result.recommendation && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm mb-4">
                      💡 {result.recommendation}
                    </div>
                  )}

                  <p className="text-gray-500 text-sm">
                    This assessment uses AI to analyze your diary entries and detect potential symptoms of
                    depression. This is not a medical diagnosis — please consult a mental health
                    professional for proper evaluation.
                  </p>
                </div>

                {/* Probability breakdown for all 5 classes */}
                {result.all_probabilities && (
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-semibold text-gray-800 mb-4">Depression Level Probabilities</h4>
                    <div className="space-y-3">
                      {Object.entries(result.all_probabilities).map(([label, prob]) => {
                        const pct = (prob * 100).toFixed(1);
                        const isTop = label === result.depression_level;
                        return (
                          <div key={label} className={`p-3 rounded-lg ${isTop ? "bg-indigo-50 ring-2 ring-indigo-200" : "bg-gray-50"}`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-sm font-medium ${isTop ? "text-indigo-700" : "text-gray-600"}`}>
                                {isTop ? "▶ " : ""}{label}
                              </span>
                              <span className={`text-sm font-semibold ${isTop ? "text-indigo-700" : "text-gray-500"}`}>
                                {pct}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${isTop ? "bg-indigo-500" : "bg-gray-400"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PHQ-9 scale legend */}
                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">PHQ-9 Score Guide</p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    <span className="text-green-600 font-medium">0–4</span><span>Minimal depression</span>
                    <span className="text-yellow-600 font-medium">5–9</span><span>Mild depression</span>
                    <span className="text-orange-600 font-medium">10–14</span><span>Moderate depression</span>
                    <span className="text-red-500 font-medium">15–19</span><span>Moderately severe</span>
                    <span className="text-red-700 font-medium">20–27</span><span>Severe depression</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setCurrentView("write")}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Write More Entries
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                No results yet. Submit your diary entries first.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Diary;