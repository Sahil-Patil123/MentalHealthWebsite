# Mind Mender: Mental Health Platform

Mind Mender is an intelligent, accessible, and user-friendly web platform designed to provide mental health support, self-assessment tools, and AI-driven insights into emotional wellbeing. 

## Features
- **AI Symptom Checker & Diary (Core Feature)**: Multilingual sentiment analysis on user diary entries.
- **MindBot AI**: A compassionate, specialized Google Gemini-powered chatbot for mental health inquiries.
- **PHQ-9 Assessment**: A clinical-standard depression screening questionnaire.
- **Doctor Appointments**: Book and manage sessions with mental health professionals.

---

## The AI Diary: How It Works

The core feature of Mind Mender is the **AI-powered Diary**. It allows users to write about their daily thoughts, feelings, and experiences. Instead of relying purely on a multiple-choice quiz, the system analyzes the *context* and *emotion* behind the user's words over time.

### What the User Has to Do:
1. Navigate to the **"Diary"** or **"Symptom Checker"** section.
2. Write short entries describing their day, how they felt, or any struggles they are facing.
3. The user can write freely in **English, Hindi, Marathi, or any of the 100 supported languages**.
4. Once sufficient entries are logged (or after a specific period), the user clicks "Check Symptoms".
5. The system processes the text and provides a mental health assessment.

### The Algorithm: XLM-RoBERTa
The diary analysis is powered by a state-of-the-art machine learning model called **XLM-RoBERTa** (Cross-lingual Language Model - RoBERTa). 

- **Why XLM-RoBERTa?** Traditional models only work well in English. Mental health is deeply personal, and people express emotions best in their native language. XLM-RoBERTa understands context across **100 different languages** without requiring real-time translation APIs.
- **Classification Approach:** The model was fine-tuned as a Sequence Classifier. It takes the user's raw text, converts it into mathematical embeddings (tokens), and processes it through transformer layers to understand the emotional context.
- **5-Class Output:** The algorithm classifies the user's emotional state into one of five clinical categories based on the PHQ-9 severity scale:
  1. Minimal Depression (0-4)
  2. Mild Depression (5-9)
  3. Moderate Depression (10-14)
  4. Moderately Severe Depression (15-19)
  5. Severe Depression (20-27)
- **Sliding Window Technique:** Because transformer models have a token limit (usually 512 tokens), our implementation uses a "sliding window" approach. Long diary entries are broken into overlapping chunks, analyzed individually, and their predictions are mathematically averaged for a final, highly accurate score.

---

## How to Run the Project Locally

The platform consists of three separate components that need to run simultaneously: the React Frontend, the Node.js Express Backend, and the Python ML Flask Server.

### Prerequisites
- Node.js (v16+)
- Python (v3.10+)
- Google Gemini API Key

### 1. Start the Machine Learning Backend (Flask)
This server hosts the XLM-RoBERTa inference engine and the MindBot Gemini AI.
```bash
cd backend/ml

# Install required Python packages
pip install flask flask-cors transformers torch numpy google-genai

# Add your Gemini API Key
# Open `app_xlm_roberta.py` and replace the placeholder GEMINI_API_KEY with your actual key.

# Run the Flask API (runs on port 5001)
python app_xlm_roberta.py
```

### 2. Start the Main Backend (Node.js/Express)
This server handles doctor appointments, user authentication, and profile data.
```bash
# Open a new terminal window
cd backend

# Install dependencies
npm install

# Start the Node server (runs on port 4000)
npm start
```

### 3. Start the Frontend (React/Vite)
This is the user interface of the platform.
```bash
# Open a third terminal window
cd frontend

# Install dependencies
npm install

# Start the Vite development server (usually runs on port 5173)
npm run dev
```

Once all three servers are running, open your browser and navigate to `http://localhost:5173` to start using Mind Mender!

---
*Disclaimer: Mind Mender is designed to assist and provide guidance, but it is not a replacement for professional clinical diagnosis. Always consult a certified healthcare professional.*
