"""
app_xlm_roberta.py
==================
Flask inference API for the 5-class XLM-RoBERTa depression level model.

Endpoints
---------
  POST /predict  { "symptoms": ["day1 text", "day2 text", ...] }
  POST /debug    { "text": "any single text" }
  GET  /health
"""

import os
import numpy as np
import torch
from flask import Flask, jsonify, request
from flask_cors import CORS
from transformers import AutoModelForSequenceClassification, AutoTokenizer

print("Starting PHQ-9 XLM-RoBERTa (5-class) API...")

# ─────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "xlm_roberta_phq9_model")
MAX_LENGTH = 512
DEVICE     = torch.device("cuda" if torch.cuda.is_available() else "cpu")
NUM_DAYS   = 15

# ── Label definitions ──────────────────────────────────────
LABEL_TO_INT = {
    "MINIMAL DEPRESSION":            0,
    "MILD DEPRESSION":               1,
    "MODERATE DEPRESSION":           2,
    "MODERATELY SEVERE DEPRESSION":  3,
    "SEVERE DEPRESSION":             4,
}
INT_TO_LABEL = {v: k for k, v in LABEL_TO_INT.items()}

# PHQ-9 score range per class
PHQ9_RANGE = {
    "MINIMAL DEPRESSION":            {"min": 0,  "max": 4,  "label": "0–4"},
    "MILD DEPRESSION":               {"min": 5,  "max": 9,  "label": "5–9"},
    "MODERATE DEPRESSION":           {"min": 10, "max": 14, "label": "10–14"},
    "MODERATELY SEVERE DEPRESSION":  {"min": 15, "max": 19, "label": "15–19"},
    "SEVERE DEPRESSION":             {"min": 20, "max": 27, "label": "20–27"},
}

# Clinical recommendations per level
RECOMMENDATIONS = {
    "MINIMAL DEPRESSION":           "No significant depression detected. Continue healthy habits.",
    "MILD DEPRESSION":              "Mild symptoms present. Self-care and monitoring recommended.",
    "MODERATE DEPRESSION":          "Moderate depression. Consider speaking with a counselor.",
    "MODERATELY SEVERE DEPRESSION": "Moderately severe depression. Professional help is recommended.",
    "SEVERE DEPRESSION":            "Severe depression detected. Please seek immediate professional support.",
}

tokenizer = None
model     = None


# ─────────────────────────────────────────────────────────
# LOAD MODEL
# ─────────────────────────────────────────────────────────
def load_model():
    global tokenizer, model
    if model is None:
        if not os.path.isdir(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at: {MODEL_PATH}\n"
                f"Train first: python xlmRobertA.py"
            )
        print(f"Loading XLM-RoBERTa 5-class model from {MODEL_PATH} ...")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        model     = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
        model.to(DEVICE)
        model.eval()
        print(f"✓ Model loaded | labels: {model.config.num_labels} | device: {DEVICE}")
    return tokenizer, model


# ─────────────────────────────────────────────────────────
# INFERENCE
# Uses sliding window for texts longer than 512 tokens
# ─────────────────────────────────────────────────────────
def infer_probabilities(text: str) -> list:
    """Returns list of 5 probabilities (one per depression class)."""
    tok, mdl = load_model()

    full_ids = tok.encode(text, add_special_tokens=False)
    window   = MAX_LENGTH - 2
    stride   = window // 2

    if len(full_ids) <= window:
        inputs = tok(
            text,
            truncation=True,
            padding="max_length",
            max_length=MAX_LENGTH,
            return_tensors="pt",
        )
        inputs = {k: v.to(DEVICE) for k, v in inputs.items()}
        with torch.no_grad():
            logits = mdl(**inputs).logits.squeeze(0)
    else:
        # Sliding window — average logits across chunks
        all_logits = []
        for start in range(0, len(full_ids), stride):
            chunk     = full_ids[start: start + window]
            input_ids = [tok.cls_token_id] + chunk + [tok.sep_token_id]
            pad_len   = MAX_LENGTH - len(input_ids)
            attn_mask = [1] * len(input_ids) + [0] * pad_len
            input_ids = input_ids + [tok.pad_token_id] * pad_len
            inp = {
                "input_ids":      torch.tensor([input_ids], device=DEVICE),
                "attention_mask": torch.tensor([attn_mask], device=DEVICE),
            }
            with torch.no_grad():
                all_logits.append(mdl(**inp).logits.squeeze(0))
            if start + window >= len(full_ids):
                break
        logits = torch.stack(all_logits).mean(dim=0)

    probs = torch.softmax(logits, dim=0).cpu().tolist()
    return probs


# ─────────────────────────────────────────────────────────
# FLASK APP
# ─────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)
print("Server ready")


# ─────────────────────────────────────────────────────────
# PREDICT ENDPOINT
# POST { "symptoms": ["day1 text", "day2 text", ...] }
# ─────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    raw = request.get_json(force=True)
    print("\n=== NEW REQUEST ===")

    # Accept multiple key names from frontend
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
    cleaned = [str(e).strip() for e in diary_entries if str(e).strip()]
    cleaned = cleaned[:NUM_DAYS]
    total_days = len(cleaned)
    print(f"Entries received: {total_days}")

    # Build combined text (same format as training)
    parts    = [f"Day {i+1}: {entry}" for i, entry in enumerate(cleaned)]
    combined = " | ".join(parts)

    # Run inference
    probs    = infer_probabilities(combined)
    pred_idx = int(np.argmax(probs))
    label    = INT_TO_LABEL[pred_idx]
    confidence = probs[pred_idx]

    # Print to terminal
    print(f"\nPrediction: {label}  (confidence: {confidence:.1%})")
    print("All probabilities:")
    for i, p in enumerate(probs):
        flag = " ← PREDICTED" if i == pred_idx else ""
        print(f"  {INT_TO_LABEL[i]:<40} {p:.4f}{flag}")

    response = {
        "depression_level":  label,
        "confidence":        round(confidence, 4),
        "phq9_score_range":  PHQ9_RANGE[label]["label"],
        "days_analyzed":     total_days,
        "recommendation":    RECOMMENDATIONS[label],
        "model":             "XLM-RoBERTa (5-class, fine-tuned)",
        "all_probabilities": {
            INT_TO_LABEL[i]: round(probs[i], 4)
            for i in range(len(probs))
        },
    }

    print(f"=== RESULT: {label} | PHQ-9 range: {PHQ9_RANGE[label]['label']} ===\n")
    return jsonify(response)


# ─────────────────────────────────────────────────────────
# DEBUG ENDPOINT
# POST { "text": "any text" } — returns raw probabilities
# ─────────────────────────────────────────────────────────
@app.route("/debug", methods=["POST"])
def debug():
    data = request.get_json(force=True)
    text = data.get("text", "").strip()
    if not text:
        return jsonify({"error": "Provide a 'text' field"}), 400

    probs    = infer_probabilities(text)
    pred_idx = int(np.argmax(probs))

    result = [
        {
            "label":       INT_TO_LABEL[i],
            "probability": round(probs[i], 4),
            "predicted":   i == pred_idx,
        }
        for i in range(len(probs))
    ]

    return jsonify({
        "input_text":       text[:200],
        "predicted_label":  INT_TO_LABEL[pred_idx],
        "confidence":       round(probs[pred_idx], 4),
        "all_classes":      result,
    })


# ─────────────────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────────────────
@app.route("/health")
def health():
    tok, mdl = load_model()
    return jsonify({
        "status":       "ok",
        "device":       str(DEVICE),
        "model_loaded": model is not None,
        "num_labels":   mdl.config.num_labels,
        "labels":       list(LABEL_TO_INT.keys()),
        "languages":    ["English", "Marathi", "Hindi", "+ 97 more"],
    })


# ─────────────────────────────────────────────────────────
# GEMINI CHATBOT ENDPOINT
# ─────────────────────────────────────────────────────────
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

SYSTEM_PROMPT = """You are MindBot, a compassionate and knowledgeable mental health assistant on the Mind Mender website.

Your ONLY purpose is to answer questions related to:
- Depression (symptoms, causes, types, treatment, recovery)
- Anxiety and stress
- Mental health conditions related to depression (bipolar disorder, dysthymia, PTSD, etc.)
- Coping strategies and self-help techniques
- Therapy and medication for depression
- Supporting someone with depression
- PHQ-9 assessment and what scores mean
- When to seek professional help
- Emotional wellbeing, sleep, and lifestyle related to mental health
- Suicidal thoughts and crisis support

Rules:
1. If the question is NOT related to mental health or depression, politely say: "I'm MindBot and I can only help with mental health and depression-related questions. Please ask me something related to mental health! 💙"
2. Always be empathetic, warm, and non-judgmental.
3. Never diagnose conditions — always recommend professional help for serious concerns.
4. Keep responses concise (3-5 sentences typically), clear, and supportive.
5. If someone mentions self-harm or suicidal thoughts, always provide crisis helpline numbers.
6. For crisis: iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345 | Emergency: 112
7. Respond in the same language the user writes in (English, Hindi, Marathi, etc.)
"""

try:
    client = genai.Client(api_key=GEMINI_API_KEY)
    chat_sessions = {}  # store per-user chat history
    GEMINI_AVAILABLE = True
    print("SUCCESS: Gemini chatbot loaded successfully (google-genai)")
except Exception as e:
    GEMINI_AVAILABLE = False
    print(f"ERROR: Gemini not available: {e}")


import time

@app.route("/chat", methods=["POST"])
def chat():
    if not GEMINI_AVAILABLE:
        return jsonify({"error": "Chatbot not configured. Please add your Gemini API key."}), 503

    data = request.get_json()
    user_message = data.get("message", "").strip()
    session_id   = data.get("session_id", "default")

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    try:
        # Get or create chat session for this user
        if session_id not in chat_sessions:
            chat_sessions[session_id] = client.chats.create(
                model="gemini-flash-latest",
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.7,
                )
            )

        chat_session = chat_sessions[session_id]
        
        # Retry logic for 503 High Demand errors
        max_retries = 3
        response = None
        last_error = None
        
        for attempt in range(max_retries):
            try:
                response = chat_session.send_message(user_message)
                break  # Success
            except Exception as e:
                last_error = e
                error_str = str(e)
                # If it's a 503 or 429, wait and retry
                if "503" in error_str or "429" in error_str or "UNAVAILABLE" in error_str:
                    print(f"Gemini API busy (attempt {attempt + 1}/{max_retries}). Retrying in 2 seconds...")
                    time.sleep(2)
                    continue
                else:
                    # For other errors (like history sync errors), clear session and fail immediately
                    print(f"Gemini critical error: {e}")
                    if session_id in chat_sessions:
                        del chat_sessions[session_id]
                    raise e
                    
        if not response:
            raise last_error
            
        reply = response.text
        return jsonify({"reply": reply, "session_id": session_id})

    except Exception as e:
        print(f"Gemini error response: {e}")
        return jsonify({"error": "MindBot is currently experiencing high traffic. Please try asking your question again in a moment." if "503" in str(e) else str(e)}), 500



# ─────────────────────────────────────────────────────────
# RUN
# ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Starting server at http://127.0.0.1:5001")
    app.run(host="127.0.0.1", port=5001, debug=False)