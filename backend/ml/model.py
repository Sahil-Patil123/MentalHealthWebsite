import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
 
MODEL_PATH = "./xlm_roberta_phq9_model"
MAX_LENGTH = 128
 
SYMPTOM_LABELS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself or that you are a failure",
    "Trouble concentrating on things",
    "Moving or speaking slowly or being restless",
    "Thoughts that you would be better off dead or hurting yourself",
]
 
# -------------------------------------------------------
# TEST SENTENCES — clearly depressive diary entries
# -------------------------------------------------------
TEST_TEXTS = [
    "I feel completely hopeless and sad today. I could not get out of bed.",
    "I have no energy at all. I did not eat anything. I feel like a failure.",
    "Cannot sleep again. Tired all day. I feel worthless and empty inside.",
    "Everything feels pointless. I have no interest in anything I used to enjoy.",
    "I am exhausted. My mind is blank. I feel like I am better off not being here.",
]
 
print("=" * 60)
print("Loading model from:", MODEL_PATH)
print("=" * 60)
 
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()
 
print(f"Model loaded. Num labels: {model.config.num_labels}")
print(f"Problem type: {model.config.problem_type}")
print("=" * 60)
 
all_probs = []
 
for text in TEST_TEXTS:
    inputs = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=MAX_LENGTH,
        return_tensors="pt",
    )
 
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.sigmoid(logits).squeeze(0).tolist()
 
    all_probs.append(probs)
 
    print(f"\nText: \"{text[:60]}...\"")
    print(f"  Raw logits: {[round(l, 3) for l in logits.squeeze(0).tolist()]}")
    print(f"  Probabilities:")
    for label, prob in zip(SYMPTOM_LABELS, probs):
        bar = "#" * int(prob * 40)
        print(f"    {prob:.4f}  {bar}  {label[:45]}")
 
# -------------------------------------------------------
# SUMMARY
# -------------------------------------------------------
print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
 
import statistics
 
flat = [p for row in all_probs for p in row]
print(f"Min probability across all tests : {min(flat):.4f}")
print(f"Max probability across all tests : {max(flat):.4f}")
print(f"Mean probability                 : {statistics.mean(flat):.4f}")
 
print("\nThreshold analysis — how many symptoms detected per entry:")
for thresh in [0.05, 0.10, 0.15, 0.20, 0.25, 0.30]:
    counts = [sum(1 for p in row if p >= thresh) for row in all_probs]
    print(f"  Threshold {thresh:.2f} → detections per entry: {counts}  total: {sum(counts)}")
 
print("\n" + "=" * 60)
print("DIAGNOSIS")
print("=" * 60)
 
max_prob = max(flat)
if max_prob < 0.05:
    print("❌ PROBLEM: All probabilities are near 0.")
    print("   Cause:   Model was likely exported incorrectly or trained for too few")
    print("            epochs. The sigmoid output is stuck near 0 for all inputs.")
    print("   Fix:     Retrain the model (increase EPOCHS to 8-10, LR to 3e-5)")
    print("            OR check that you saved the correct checkpoint folder.")
elif max_prob < 0.15:
    print("⚠️  PROBLEM: Probabilities are very low (model is under-confident).")
    print("   Cause:   Class imbalance during training — most diary days had no")
    print("            symptoms, so the model learned to predict near-0 by default.")
    print("   Fix:     Lower THRESHOLD to 0.05 in app.py")
    print("            OR retrain with higher pos_weight values.")
elif max_prob < 0.25:
    print("⚠️  Probabilities are low but not zero.")
    print("   Fix:     Lower THRESHOLD to 0.10 in app.py")
else:
    print("✅ Model is producing reasonable probabilities.")
    print("   The issue is likely in how app.py receives the diary entries.")
    print("   Check the RAW REQUEST PAYLOAD printed in your Flask terminal.")