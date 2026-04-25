import os
import joblib
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

print("Starting PHQ-9 XGBoost API...")

# -----------------------------
# CONFIG
# -----------------------------
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "multi_label_xgb_model.pkl")
VECT_PATH  = os.path.join(BASE_DIR, "tfidf_vectorizer.pkl")
META_PATH  = os.path.join(BASE_DIR, "model_metadata.pkl")

# ClassifierChain gives hard 0/1 predictions — no threshold needed.
# But chain_model.predict_proba() gives probabilities if you want them later.

SYMPTOM_LABELS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed. Or the opposite: being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead, or of hurting yourself",
]

chain_model = None
vectorizer  = None


# -----------------------------
# LOAD MODEL
# -----------------------------
def load_model():
    global chain_model, vectorizer

    if chain_model is None:
        print("Loading XGBoost chain model...")
        chain_model = joblib.load(MODEL_PATH)
        vectorizer  = joblib.load(VECT_PATH)
        print("Model loaded successfully.")

    return chain_model, vectorizer


# -----------------------------
# FLASK
# -----------------------------
app = Flask(__name__)
CORS(app)
print("Server ready")


# -----------------------------
# INFERENCE
# Returns a binary list [0/1] for each of the 9 symptoms
# -----------------------------
def predict_symptoms(text):
    model, vect = load_model()
    X = vect.transform([text])                    # shape (1, vocab)
    pred = model.predict(X)                       # shape (1, 9)  — hard labels
    return pred[0].tolist()                       # list of 9 ints (0 or 1)


# -----------------------------
# PHQ-9 SCORING
#
# Diary window = 15 days
#
# days_detected = 0        → score 0  (Not at all)
# days_detected = 1  to 6  → score 1  (Several days)
# days_detected = 7  to 11 → score 2  (More than half the days)
# days_detected = 12 to 15 → score 3  (Nearly every day)
#
# Total PHQ-9 score → depression level:
#   0–4   Minimal depression
#   5–9   Mild depression
#   10–14 Moderate depression
#   15–19 Moderately severe depression
#   20–27 Severe depression
# -----------------------------
def get_symptom_score(days):
    if days == 0:
        return 0
    elif days <= 6:
        return 1
    elif days <= 11:
        return 2
    else:
        return 3


def calculate_phq9(symptom_days):
    scores = [get_symptom_score(d) for d in symptom_days]
    total  = sum(scores)

    if total <= 4:
        level = "Minimal depression"
    elif total <= 9:
        level = "Mild depression"
    elif total <= 14:
        level = "Moderate depression"
    elif total <= 19:
        level = "Moderately severe depression"
    else:
        level = "Severe depression"

    return total, level, scores


# -----------------------------
# PREDICTION ENDPOINT
# Expects: { "symptoms": ["day1 text", "day2 text", ...] }
# -----------------------------
@app.route("/predict", methods=["POST"])
def predict():

    raw = request.get_json(force=True)
    print("\n=== NEW REQUEST ===")
    print("Keys:", list(raw.keys()) if raw else "empty")

    # Accept multiple possible key names
    diary_entries = (
        raw.get("symptoms") or
        raw.get("entries")  or
        raw.get("diary")    or
        raw.get("texts")    or
        []
    )

    if not isinstance(diary_entries, list) or len(diary_entries) == 0:
        return jsonify({
            "error":           "No diary entries found.",
            "expected_format": '{"symptoms": ["day1 text", "day2 text", ...]}',
            "received_keys":   list(raw.keys()) if raw else [],
        }), 400

    # Clean and cap at 15 days
    cleaned_entries = [str(e).strip() for e in diary_entries if str(e).strip()]
    cleaned_entries = cleaned_entries[:15]
    total_days      = len(cleaned_entries)

    print(f"Diary entries received: {total_days}")

    # Count how many days each symptom was detected
    symptom_counts = [0] * len(SYMPTOM_LABELS)
    daily_results  = []

    for day_index, entry in enumerate(cleaned_entries, start=1):

        preds = predict_symptoms(entry)   # list of 9 ints: 0 or 1

        print(f"\n--- Day {day_index} ---")
        print(f"  Text : {entry[:70]}")
        print(f"  Preds: {preds}")
        detected_labels = [SYMPTOM_LABELS[i] for i, p in enumerate(preds) if p == 1]
        print(f"  Detected symptoms: {detected_labels if detected_labels else 'none'}")

        # Accumulate counts
        for i, pred in enumerate(preds):
            if pred == 1:
                symptom_counts[i] += 1

        # Build per-day detail
        detected = {}
        for label, pred in zip(SYMPTOM_LABELS, preds):
            detected[label] = {
                "detected": bool(pred)
            }

        daily_results.append({
            "day":               day_index,
            "text":              entry[:120],
            "detected_symptoms": detected,
        })

    # -----------------------------
    # CALCULATE PHQ-9
    # -----------------------------
    total_score, level, symptom_scores = calculate_phq9(symptom_counts)

    # Core symptom check (PHQ-9 clinical guideline)
    # Symptom index 0 = anhedonia, index 1 = depressed mood
    core_symptom_present = symptom_counts[0] > 0 or symptom_counts[1] > 0

    symptoms_detail = [
        {
            "symptom":      label,
            "days_detected": days,
            "phq9_score":   score,
        }
        for label, days, score in zip(SYMPTOM_LABELS, symptom_counts, symptom_scores)
    ]

    print(f"\n=== RESULT: PHQ-9={total_score} | Level={level} | Days={total_days} ===\n")

    response = {
        "phq9_total_score":     total_score,
        "depression_level":     level,
        "days_analyzed":        total_days,
        "core_symptom_present": core_symptom_present,
        "symptoms_detail":      symptoms_detail,
        "daily_predictions":    daily_results,
        "model":                "XGBoost-TF-IDF",
    }

    if not core_symptom_present and total_score > 4:
        response["clinical_note"] = (
            "Score is elevated but neither core symptom (anhedonia or depressed mood) "
            "was detected. Clinical review recommended."
        )

    return jsonify(response)


# -----------------------------
# DEBUG ENDPOINT
# POST { "text": "I feel sad and hopeless today" }
# Returns detected symptoms for a single sentence
# -----------------------------
@app.route("/debug", methods=["POST"])
def debug():
    data = request.get_json(force=True)
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "Provide a 'text' field"}), 400

    preds = predict_symptoms(text)

    result = []
    for label, pred in zip(SYMPTOM_LABELS, preds):
        result.append({
            "symptom":  label,
            "detected": bool(pred),
        })

    detected_count = sum(preds)
    print(f"DEBUG | text: {text[:60]} | detected: {detected_count}/9 symptoms")

    return jsonify({
        "input_text":      text,
        "detected_count":  detected_count,
        "symptoms":        result,
    })


# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.route("/health")
def health():
    return jsonify({
        "status":       "ok",
        "model_loaded": chain_model is not None,
        "model_type":   "XGBoost ClassifierChain + TF-IDF",
    })


# -----------------------------
# RUN SERVER
# -----------------------------
if __name__ == "__main__":
    print("Starting server at http://127.0.0.1:5001")
    app.run(host="127.0.0.1", port=5001, debug=False)