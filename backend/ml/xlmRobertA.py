"""
xlmRobertA.py
=============
XLM-RoBERTa fine-tuned on 15-day diary data for depression-level classification.

5 Classes (PHQ-9 based)
-----------------------
  0 → MINIMAL DEPRESSION          (PHQ-9 score 0–4)
  1 → MILD DEPRESSION             (PHQ-9 score 5–9)
  2 → MODERATE DEPRESSION         (PHQ-9 score 10–14)
  3 → MODERATELY SEVERE DEPRESSION(PHQ-9 score 15–19)
  4 → SEVERE DEPRESSION           (PHQ-9 score 20–27)

Flow
----
  Train : reads train_dataset.csv / test_dataset.csv
          → concatenates all 15 diary entries per person
          → fine-tunes xlm-roberta-base (5-class)
          → saves best model (HuggingFace format) to xlm_roberta_phq9_model/

  Infer : DepressionPredictor.load() → predict(diary_entries) → label + confidence
"""

import os
import random
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup,
)
from sklearn.metrics import accuracy_score, f1_score, classification_report

# ─────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────
MODEL_NAME   = "xlm-roberta-base"
MAX_LEN      = 512
BATCH_SIZE   = 4
EPOCHS       = 5
LR           = 2e-5
WARMUP_RATIO = 0.1
WEIGHT_DECAY = 0.01
NUM_DAYS     = 15
RANDOM_SEED  = 42
DEVICE       = torch.device("cuda" if torch.cuda.is_available() else "cpu")

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
TRAIN_CSV = os.path.join(BASE_DIR, "train_dataset.csv")
TEST_CSV  = os.path.join(BASE_DIR, "test_dataset.csv")
SAVE_DIR  = os.path.join(BASE_DIR, "xlm_roberta_phq9_model")

# ── Label mapping ──────────────────────────────────────────
LABEL_TO_INT = {
    "MINIMAL DEPRESSION":            0,
    "MILD DEPRESSION":               1,
    "MODERATE DEPRESSION":           2,
    "MODERATELY SEVERE DEPRESSION":  3,
    "SEVERE DEPRESSION":             4,
}
INT_TO_LABEL = {v: k for k, v in LABEL_TO_INT.items()}
NUM_CLASSES  = len(LABEL_TO_INT)


# ─────────────────────────────────────────────────────────
# SEED
# ─────────────────────────────────────────────────────────
def set_seed(seed: int = RANDOM_SEED):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


# ─────────────────────────────────────────────────────────
# DATA LOADING
# ─────────────────────────────────────────────────────────
def load_csv(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, encoding="utf-8", low_memory=False)
    df.columns = df.columns.str.strip()
    print(f"[DATA] Loaded {len(df):,} rows  ←  {os.path.basename(path)}")
    return df


def build_texts_and_labels(df: pd.DataFrame):
    """
    Concatenates all 15 diary day entries into one text per person.
    Maps FINAL ANSWER → integer label (0–4).
    Skips rows with unknown labels.
    """
    texts, labels = [], []
    skipped = 0

    for _, row in df.iterrows():
        # Build combined diary text
        parts = []
        for i in range(1, NUM_DAYS + 1):
            val = str(row.get(f"Day {i}", "")).strip()
            if val.lower() not in ("", "nan"):
                parts.append(f"Day {i}: {val}")

        combined = " | ".join(parts)

        # Map label
        raw = str(row.get("FINAL ANSWER", "")).strip().upper()
        label_int = LABEL_TO_INT.get(raw, -1)
        if label_int == -1:
            skipped += 1
            continue

        texts.append(combined)
        labels.append(label_int)

    if skipped:
        print(f"  [WARN] Skipped {skipped} rows with unknown labels")
    return texts, labels


# ─────────────────────────────────────────────────────────
# DATASET
# ─────────────────────────────────────────────────────────
class DiaryDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len: int = MAX_LEN):
        self.texts     = texts
        self.labels    = labels
        self.tokenizer = tokenizer
        self.max_len   = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        enc = self.tokenizer(
            self.texts[idx],
            max_length=self.max_len,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )
        return {
            "input_ids":      enc["input_ids"].squeeze(0),
            "attention_mask": enc["attention_mask"].squeeze(0),
            "labels":         torch.tensor(self.labels[idx], dtype=torch.long),
        }


# ─────────────────────────────────────────────────────────
# TRAINING LOOP
# ─────────────────────────────────────────────────────────
def run_epoch(model, loader, optimizer=None, scheduler=None):
    training = optimizer is not None
    model.train() if training else model.eval()

    total_loss = 0.0
    all_preds, all_labels = [], []

    ctx = torch.enable_grad() if training else torch.no_grad()
    with ctx:
        for batch in loader:
            input_ids  = batch["input_ids"].to(DEVICE)
            attn_mask  = batch["attention_mask"].to(DEVICE)
            lbls       = batch["labels"].to(DEVICE)

            outputs = model(
                input_ids=input_ids,
                attention_mask=attn_mask,
                labels=lbls,
            )
            loss   = outputs.loss
            logits = outputs.logits

            if training:
                optimizer.zero_grad()
                loss.backward()
                nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()
                scheduler.step()

            total_loss += loss.item()
            preds = torch.argmax(logits, dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_labels.extend(lbls.cpu().numpy())

    avg_loss = total_loss / len(loader)
    acc = accuracy_score(all_labels, all_preds)
    f1  = f1_score(all_labels, all_preds, average="weighted", zero_division=0)
    return avg_loss, acc, f1, all_preds, all_labels


# ─────────────────────────────────────────────────────────
# TRAIN
# ─────────────────────────────────────────────────────────
def train():
    set_seed()
    print(f"\n{'='*60}")
    print("  XLM-RoBERTa — 5-Class Depression Level Training")
    print(f"  Device : {DEVICE}  |  Model : {MODEL_NAME}")
    print(f"  Epochs : {EPOCHS}  |  Batch : {BATCH_SIZE}  |  LR : {LR}")
    print(f"{'='*60}\n")

    # ── Load data ──────────────────────────────────────────
    train_df = load_csv(TRAIN_CSV)
    test_df  = load_csv(TEST_CSV)

    valid_labels = set(LABEL_TO_INT.keys())
    train_df = train_df[train_df["FINAL ANSWER"].str.strip().str.upper().isin(valid_labels)].reset_index(drop=True)
    test_df  = test_df[test_df["FINAL ANSWER"].str.strip().str.upper().isin(valid_labels)].reset_index(drop=True)

    print(f"\n[LABEL DISTRIBUTION — TRAIN]")
    print(train_df["FINAL ANSWER"].value_counts().to_string())
    print(f"\n[LABEL DISTRIBUTION — TEST]")
    print(test_df["FINAL ANSWER"].value_counts().to_string())
    print()

    tr_texts, tr_labels = build_texts_and_labels(train_df)
    te_texts, te_labels = build_texts_and_labels(test_df)
    print(f"\n[DATA] Train samples: {len(tr_texts):,}  |  Test samples: {len(te_texts):,}\n")

    # ── Tokenizer ──────────────────────────────────────────
    print("[INFO] Loading tokenizer ...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    tr_ds = DiaryDataset(tr_texts, tr_labels, tokenizer)
    te_ds = DiaryDataset(te_texts, te_labels, tokenizer)
    tr_dl = DataLoader(tr_ds, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0, pin_memory=False)
    te_dl = DataLoader(te_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=False)

    # ── Model ──────────────────────────────────────────────
    print("[INFO] Loading XLM-RoBERTa model ...")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=NUM_CLASSES,
        id2label=INT_TO_LABEL,
        label2id=LABEL_TO_INT,
        problem_type="single_label_classification",
        ignore_mismatched_sizes=True,
    )
    model.to(DEVICE)

    # ── Optimizer & Scheduler ──────────────────────────────
    optimizer   = AdamW(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)
    total_steps = len(tr_dl) * EPOCHS
    scheduler   = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=int(WARMUP_RATIO * total_steps),
        num_training_steps=total_steps,
    )

    # ── Training loop ──────────────────────────────────────
    os.makedirs(SAVE_DIR, exist_ok=True)
    best_f1 = 0.0

    print(f"\n[TRAINING STARTED] {EPOCHS} epochs ...\n")
    for epoch in range(1, EPOCHS + 1):
        tr_loss, tr_acc, tr_f1, _, _ = run_epoch(model, tr_dl, optimizer, scheduler)
        te_loss, te_acc, te_f1, preds, golds = run_epoch(model, te_dl)

        print(
            f"  Epoch [{epoch}/{EPOCHS}]  "
            f"Train → Loss: {tr_loss:.4f}  Acc: {tr_acc:.3f}  F1: {tr_f1:.3f}  |  "
            f"Test  → Loss: {te_loss:.4f}  Acc: {te_acc:.3f}  F1: {te_f1:.3f}"
        )

        if te_f1 > best_f1:
            best_f1 = te_f1
            model.save_pretrained(SAVE_DIR)
            tokenizer.save_pretrained(SAVE_DIR)
            print(f"    ✓ Best model saved  (F1 = {best_f1:.4f})\n")

    # ── Final classification report ────────────────────────
    print("\n[INFO] Loading best model for final evaluation ...")
    best_model = AutoModelForSequenceClassification.from_pretrained(SAVE_DIR)
    best_model.to(DEVICE)

    _, fin_acc, fin_f1, fin_preds, fin_golds = run_epoch(best_model, te_dl)

    label_names = [INT_TO_LABEL[i] for i in range(NUM_CLASSES)]
    print("\n" + "="*60)
    print("  FINAL CLASSIFICATION REPORT")
    print("="*60)
    print(classification_report(fin_golds, fin_preds, target_names=label_names, zero_division=0))
    print(f"  Accuracy : {fin_acc:.4f}  |  F1 (weighted) : {fin_f1:.4f}")
    print("="*60)
    print(f"\n✅ Model saved to: {SAVE_DIR}\n")

    return best_model, tokenizer


# ─────────────────────────────────────────────────────────
# INFERENCE — DepressionPredictor
# ─────────────────────────────────────────────────────────
class DepressionPredictor:
    """
    Load the trained 5-class model and predict depression level.

    Quick start
    -----------
    predictor = DepressionPredictor.load()
    result    = predictor.predict(["Day 1 diary...", "Day 2 diary...", ...])
    print(result["label"])       # "MODERATE DEPRESSION"
    print(result["confidence"])  # 0.87
    """

    def __init__(self, model, tokenizer):
        self.model     = model.eval().to(DEVICE)
        self.tokenizer = tokenizer

    @classmethod
    def load(cls, save_dir: str = SAVE_DIR):
        if not os.path.isdir(save_dir):
            raise FileNotFoundError(
                f"Model folder not found: {save_dir}\n"
                f"Run training first:  python xlmRobertA.py"
            )
        print(f"[INFO] Loading model from {save_dir} ...")
        tokenizer = AutoTokenizer.from_pretrained(save_dir)
        model     = AutoModelForSequenceClassification.from_pretrained(save_dir)
        print(f"  Labels : {model.config.id2label}")
        print(f"  Device : {DEVICE}")
        return cls(model, tokenizer)

    def predict(self, diary_entries, separator: str = " | ") -> dict:
        """
        Parameters
        ----------
        diary_entries : str or list[str]
            Full diary as one string, or list of up to 15 daily entries.

        Returns
        -------
        dict with keys:
            label        – predicted depression level string
            confidence   – probability of predicted class (0–1)
            probabilities– {label: prob} for all 5 classes
            phq9_range   – PHQ-9 score range for this level
        """
        PHQ9_RANGE = {
            "MINIMAL DEPRESSION":            "0–4",
            "MILD DEPRESSION":               "5–9",
            "MODERATE DEPRESSION":           "10–14",
            "MODERATELY SEVERE DEPRESSION":  "15–19",
            "SEVERE DEPRESSION":             "20–27",
        }

        if isinstance(diary_entries, list):
            parts = [
                f"Day {i+1}: {str(e).strip()}"
                for i, e in enumerate(diary_entries[:NUM_DAYS])
                if str(e).strip()
            ]
            text = separator.join(parts)
        else:
            text = str(diary_entries).strip()

        enc = self.tokenizer(
            text,
            max_length=MAX_LEN,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )

        input_ids  = enc["input_ids"].to(DEVICE)
        attn_mask  = enc["attention_mask"].to(DEVICE)

        with torch.no_grad():
            logits = self.model(input_ids=input_ids, attention_mask=attn_mask).logits
            probs  = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

        pred_idx   = int(np.argmax(probs))
        label      = INT_TO_LABEL[pred_idx]
        confidence = float(probs[pred_idx])

        return {
            "label":         label,
            "confidence":    round(confidence, 4),
            "phq9_range":    PHQ9_RANGE[label],
            "probabilities": {
                INT_TO_LABEL[i]: round(float(probs[i]), 4)
                for i in range(NUM_CLASSES)
            },
        }


# ─────────────────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    if "--predict" in sys.argv:
        # Usage: python xlmRobertA.py --predict "day1 text" "day2 text" ...
        idx     = sys.argv.index("--predict") + 1
        entries = sys.argv[idx:]
        if not entries:
            print("Usage: python xlmRobertA.py --predict \"Day 1 diary\" \"Day 2 diary\" ...")
            sys.exit(1)

        pred   = DepressionPredictor.load()
        result = pred.predict(entries)

        print(f"\n{'='*50}")
        print(f"  Predicted Level : {result['label']}")
        print(f"  PHQ-9 Range     : {result['phq9_range']}")
        print(f"  Confidence      : {result['confidence']:.1%}")
        print(f"{'='*50}")
        print("\n  Class Probabilities:")
        for lbl, p in result["probabilities"].items():
            bar = "█" * int(p * 30)
            print(f"  {lbl:<35} {p:5.1%}  {bar}")

    else:
        # Default: run training
        train()
