import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from xgboost import XGBClassifier
from sklearn.multioutput import ClassifierChain
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    accuracy_score
)
import joblib
import os
from sklearn.metrics import classification_report

# Standardized symptom labels (matched with app.py)
SYMPTOM_LABELS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed. Or the opposite: being so fidgety or restless that you have been moving around a lot more than usual",
    "Thoughts that you would be better off dead, or of hurting yourself"
]

def parse_raw_data(filepath):
    if not os.path.exists(filepath):
        print(f"Warning: File not found at {filepath}. Skipping.")
        return pd.DataFrame(columns=['Text'] + SYMPTOM_LABELS)
        
    print(f"Loading raw data from: {filepath}")
    df = pd.read_csv(filepath)
    parsed_rows = []
    
    for index, row in df.iterrows():
        for day in range(1, 16):
            day_col = f"Day {day}"
            sym_col = f"Symptoms.{day}" if day > 1 else "Symptoms.1"
            
            if day_col not in df.columns or sym_col not in df.columns:
                continue
                
            text = str(row[day_col]).strip()
            symptoms_str = str(row[sym_col]).strip()
            
            if pd.isna(row[day_col]) or not text or text.lower() == 'nan':
                 continue
                 
            labels = {label: 0 for label in SYMPTOM_LABELS}
            
            if not pd.isna(row[sym_col]) and symptoms_str and symptoms_str.lower() != 'nan':
                 # Extract numeric indices
                 indices = re.findall(r'\d+', symptoms_str)
                 for idx_str in indices:
                     idx = int(idx_str)
                     if 1 <= idx <= 9:
                         labels[SYMPTOM_LABELS[idx - 1]] = 1
                 
                 # Also check for direct matches or partial matches of label names (fallback)
                 if not indices:
                     for i, label in enumerate(SYMPTOM_LABELS):
                         if label.lower() in symptoms_str.lower():
                             labels[label] = 1
            
            new_row = {'Text': text}
            new_row.update(labels)
            parsed_rows.append(new_row)
            
    parsed_df = pd.DataFrame(parsed_rows)
    print(f"Successfully extracted {len(parsed_df)} daily entries.")
    return parsed_df

if __name__ == "__main__":
    # --------------------------
    # Data Loading and Preprocessing
    # --------------------------
    train_df = parse_raw_data(r"train_dataset.csv")
    test_df = parse_raw_data(r"test_dataset.csv")

    X_train_text = train_df['Text']
    y_train = train_df[SYMPTOM_LABELS]

    X_test_text = test_df['Text']
    y_test = test_df[SYMPTOM_LABELS]

    # --------------------------
    # Optimized TF-IDF Vectorization
    # --------------------------
    print("\nVectorizing text with optimized n-grams...")
    # Added ngram_range to capture phrases and min_df to remove ultra-rare noise words
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), min_df=3)
    X_train = vectorizer.fit_transform(X_train_text)
    X_test = vectorizer.transform(X_test_text)

    # --------------------------
    # Optimized XGBoost Classifier Chain Training
    # --------------------------
    print("\nTraining optimized XGBoost Classifier Chain...")
    print("This will heavily boost Subset Accuracy by linking symptom predictions together.")

    # Aggressive XGBoost hyperparameter tuning designed for complex NLP multi-label tasks
    base_xgb_model = XGBClassifier(
        eval_metric='logloss',
        n_estimators=300,        # More trees to learn deeper label dependencies
        max_depth=6,             # Deeper trees
        learning_rate=0.05,      # Slower more accurate convergence
        subsample=0.8,           # Prevent overfitting
        colsample_bytree=0.8,    # Prevent overfitting
        random_state=42,
        n_jobs=-1
    )

    # Switch from MultiOutputClassifier -> ClassifierChain
    # This allows it to learn that Symptom A often causes Symptom B
    chain_model = ClassifierChain(base_xgb_model, order='random', random_state=42)
    chain_model.fit(X_train, y_train)

    # --------------------------
    # Predictions & Strict Evaluation
    # --------------------------
    print("\nEvaluating new optimized model...")
    y_pred = chain_model.predict(X_test)

    subset_accuracy = np.mean(np.all(y_test.values == y_pred, axis=1))

    precision_macro = precision_score(y_test, y_pred, average='macro', zero_division=1)
    recall_macro = recall_score(y_test, y_pred, average='macro', zero_division=1)
    f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=1)

    print("\nXGBoost Model Evaluation Metrics:")
    print("----------------------------------------")
    print(f"Subset Accuracy (Exact Match Ratio): {subset_accuracy:.4f}")
    print(f"Precision (Macro): {precision_macro:.4f}")
    print(f"Recall (Macro):    {recall_macro:.4f}")
    print(f"F1-Score (Macro):  {f1_macro:.4f}")
    print("----------------------------------------")

    print("\nDetailed Per-Symptom Performance:")
    print(classification_report(y_test, y_pred, target_names=SYMPTOM_LABELS, zero_division=1))

    # --------------------------
    # Save the Model, Vectorizer, and Metadata
    # --------------------------
    print("\nSaving new chain models for app.py...")
    joblib.dump(chain_model, 'multi_label_xgb_model.pkl')
    joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')

    metadata = {
        'label_columns': SYMPTOM_LABELS,
        'severity_weights': {col: 1.0 for col in SYMPTOM_LABELS}
    }
    joblib.dump(metadata, 'model_metadata.pkl')

    print("Optimized model saved successfully!")