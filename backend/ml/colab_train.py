# ============================================================
# CELL 1 — Install dependencies
# ============================================================
# Run this cell first

# !pip install -q transformers scikit-learn gdown


# ============================================================
# CELL 2 — Download CSVs from Google Drive shareable links
# ============================================================
# HOW TO GET YOUR LINK:
#   1. Upload your CSV to Google Drive
#   2. Right-click the file → Share → "Anyone with the link"
#   3. Copy the link. It looks like:
#      https://drive.google.com/file/d/FILE_ID_HERE/view?usp=sharing
#   4. Paste only the FILE_ID below

import gdown

# ── Paste your file IDs here ──────────────────────────────
TRAIN_FILE_ID = "PASTE_TRAIN_CSV_FILE_ID_HERE"
TEST_FILE_ID  = "PASTE_TEST_CSV_FILE_ID_HERE"
# ─────────────────────────────────────────────────────────

gdown.download(f"https://drive.google.com/uc?id={TRAIN_FILE_ID}", "/content/train_dataset.csv", quiet=False)
gdown.download(f"https://drive.google.com/uc?id={TEST_FILE_ID}",  "/content/test_dataset.csv",  quiet=False)

print("\n✅ Files downloaded:")
import os
print(f"  train_dataset.csv → {os.path.getsize('/content/train_dataset.csv') / 1e6:.1f} MB")
print(f"  test_dataset.csv  → {os.path.getsize('/content/test_dataset.csv')  / 1e6:.1f} MB")


# ============================================================
# CELL 3 — CONFIG & IMPORTS
# ============================================================

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
from torch.cuda.amp import GradScaler, autocast          # Mixed precision
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup,
)
from sklearn.metrics import accuracy_score, f1_score, classification_report

# ── Paths (downloaded to /content/) ───────────────────────
TRAIN_CSV = "/content/train_dataset.csv"
TEST_CSV  = "/content/test_dataset.csv"
SAVE_DIR  = "/content/xlm_roberta_phq9_model"

# ── GPU Check ──────────────────────────────────────────────
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
if DEVICE.type == "cuda":
    print(f"✅ GPU: {torch.cuda.get_device_name(0)}")
    print(f"   VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
else:
    print("⚠️  No GPU found — using CPU (will be slow)")

# ── Hyperparams (T4 GPU optimized) ─────────────────────────
MODEL_NAME              = "xlm-roberta-base"
MAX_LEN                 = 512
BATCH_SIZE              = 16      # T4 can handle 16 with fp16
GRADIENT_ACCUM_STEPS    = 2       # Effective batch = 16 × 2 = 32
EPOCHS                  = 5
LR                      = 2e-5
WARMUP_RATIO            = 0.1
WEIGHT_DECAY            = 0.01
NUM_DAYS                = 15
RANDOM_SEED             = 42
USE_AMP                 = (DEVICE.type == "cuda")   # Mixed precision only on GPU

# ── Labels ─────────────────────────────────────────────────
LABEL_TO_INT = {
    "MINIMAL DEPRESSION":            0,
    "MILD DEPRESSION":               1,
    "MODERATE DEPRESSION":           2,
    "MODERATELY SEVERE DEPRESSION":  3,
    "SEVERE DEPRESSION":             4,
}
INT_TO_LABEL = {v: k for k, v in LABEL_TO_INT.items()}
NUM_CLASSES  = len(LABEL_TO_INT)

print(f"\nConfig ready | Device: {DEVICE} | AMP: {USE_AMP}")
print(f"Classes: {list(LABEL_TO_INT.keys())}")


# ============================================================
# CELL 4 — DATA LOADING
# ============================================================

def set_seed(seed=RANDOM_SEED):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

set_seed()


def load_csv(path):
    df = pd.read_csv(path, encoding="utf-8", low_memory=False)
    df.columns = df.columns.str.strip()
    print(f"[DATA] Loaded {len(df):,} rows  ←  {os.path.basename(path)}")
    return df


def build_texts_and_labels(df):
    texts, labels = [], []
    skipped = 0

    for _, row in df.iterrows():
        parts = []
        for i in range(1, NUM_DAYS + 1):
            val = str(row.get(f"Day {i}", "")).strip()
            if val.lower() not in ("", "nan"):
                parts.append(f"Day {i}: {val}")

        combined  = " | ".join(parts)
        raw_label = str(row.get("FINAL ANSWER", "")).strip().upper()
        label_int = LABEL_TO_INT.get(raw_label, -1)

        if label_int == -1:
            skipped += 1
            continue

        texts.append(combined)
        labels.append(label_int)

    if skipped:
        print(f"  [WARN] Skipped {skipped} rows with unknown labels")
    return texts, labels


# Load & filter
train_df = load_csv(TRAIN_CSV)
test_df  = load_csv(TEST_CSV)

valid = set(LABEL_TO_INT.keys())
train_df = train_df[train_df["FINAL ANSWER"].str.strip().str.upper().isin(valid)].reset_index(drop=True)
test_df  = test_df[test_df["FINAL ANSWER"].str.strip().str.upper().isin(valid)].reset_index(drop=True)

tr_texts, tr_labels = build_texts_and_labels(train_df)
te_texts, te_labels = build_texts_and_labels(test_df)

print(f"\nTrain: {len(tr_texts):,} samples | Test: {len(te_texts):,} samples")
print("\nLabel distribution (train):")
print(train_df["FINAL ANSWER"].value_counts().to_string())


# ============================================================
# CELL 5 — DATASET & TOKENIZER
# ============================================================

class DiaryDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=MAX_LEN):
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


print("Loading tokenizer ...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

tr_ds = DiaryDataset(tr_texts, tr_labels, tokenizer)
te_ds = DiaryDataset(te_texts, te_labels, tokenizer)
tr_dl = DataLoader(tr_ds, batch_size=BATCH_SIZE, shuffle=True,  num_workers=2, pin_memory=True)
te_dl = DataLoader(te_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)

print(f"Train batches: {len(tr_dl)} | Test batches: {len(te_dl)}")


# ============================================================
# CELL 6 — MODEL SETUP
# ============================================================

print("\nLoading XLM-RoBERTa model ...")
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=NUM_CLASSES,
    id2label=INT_TO_LABEL,
    label2id=LABEL_TO_INT,
    problem_type="single_label_classification",
    ignore_mismatched_sizes=True,
)
model.to(DEVICE)

total_params = sum(p.numel() for p in model.parameters()) / 1e6
print(f"✅ Model ready | Parameters: {total_params:.1f}M")

# Optimizer + Scheduler
optimizer   = AdamW(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)
total_steps = (len(tr_dl) // GRADIENT_ACCUM_STEPS) * EPOCHS
scheduler   = get_linear_schedule_with_warmup(
    optimizer,
    num_warmup_steps=int(WARMUP_RATIO * total_steps),
    num_training_steps=total_steps,
)
scaler = GradScaler(enabled=USE_AMP)   # Mixed precision scaler

print(f"Total training steps: {total_steps}")
print(f"Warmup steps: {int(WARMUP_RATIO * total_steps)}")


# ============================================================
# CELL 7 — TRAINING
# ============================================================

def run_epoch(model, loader, optimizer=None, scheduler=None, scaler=None, accum_steps=1):
    training = optimizer is not None
    model.train() if training else model.eval()

    total_loss = 0.0
    all_preds, all_labels = [], []

    ctx = torch.enable_grad() if training else torch.no_grad()
    with ctx:
        for step, batch in enumerate(loader):
            input_ids  = batch["input_ids"].to(DEVICE)
            attn_mask  = batch["attention_mask"].to(DEVICE)
            lbls       = batch["labels"].to(DEVICE)

            with autocast(enabled=USE_AMP):
                outputs = model(input_ids=input_ids, attention_mask=attn_mask, labels=lbls)
                loss    = outputs.loss / accum_steps   # Scale for gradient accumulation

            if training:
                scaler.scale(loss).backward()

                # Update weights every `accum_steps` steps
                if (step + 1) % accum_steps == 0:
                    scaler.unscale_(optimizer)
                    nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                    scaler.step(optimizer)
                    scaler.update()
                    scheduler.step()
                    optimizer.zero_grad()

            total_loss += loss.item() * accum_steps
            preds = torch.argmax(outputs.logits, dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_labels.extend(lbls.cpu().numpy())

    avg_loss = total_loss / len(loader)
    acc = accuracy_score(all_labels, all_preds)
    f1  = f1_score(all_labels, all_preds, average="weighted", zero_division=0)
    return avg_loss, acc, f1, all_preds, all_labels


# ── MAIN TRAINING LOOP ─────────────────────────────────────
os.makedirs(SAVE_DIR, exist_ok=True)
best_f1 = 0.0
history = []

print(f"\n{'='*65}")
print(f"  Training for {EPOCHS} epochs | Effective batch = {BATCH_SIZE * GRADIENT_ACCUM_STEPS}")
print(f"  AMP (mixed precision) : {USE_AMP}")
print(f"  Save dir              : {SAVE_DIR}")
print(f"{'='*65}\n")

for epoch in range(1, EPOCHS + 1):
    tr_loss, tr_acc, tr_f1, _, _ = run_epoch(
        model, tr_dl, optimizer, scheduler, scaler, GRADIENT_ACCUM_STEPS
    )
    te_loss, te_acc, te_f1, preds, golds = run_epoch(model, te_dl)

    history.append({"epoch": epoch, "tr_loss": tr_loss, "te_loss": te_loss,
                    "tr_acc": tr_acc, "te_acc": te_acc, "te_f1": te_f1})

    print(
        f"Epoch [{epoch}/{EPOCHS}]  "
        f"Train → Loss: {tr_loss:.4f}  Acc: {tr_acc:.3f}  |  "
        f"Test  → Loss: {te_loss:.4f}  Acc: {te_acc:.3f}  F1: {te_f1:.3f}"
    )

    if te_f1 > best_f1:
        best_f1 = te_f1
        model.save_pretrained(SAVE_DIR)
        tokenizer.save_pretrained(SAVE_DIR)
        print(f"  ✅ Best model saved  (F1 = {best_f1:.4f})\n")

print(f"\nTraining complete! Best F1: {best_f1:.4f}")


# ============================================================
# CELL 8 — FINAL EVALUATION REPORT
# ============================================================

print("\nLoading best model for final evaluation ...")
best_model = AutoModelForSequenceClassification.from_pretrained(SAVE_DIR)
best_model.to(DEVICE)

_, fin_acc, fin_f1, fin_preds, fin_golds = run_epoch(best_model, te_dl)

label_names = [INT_TO_LABEL[i] for i in range(NUM_CLASSES)]
print("\n" + "="*65)
print("  FINAL CLASSIFICATION REPORT")
print("="*65)
print(classification_report(fin_golds, fin_preds, target_names=label_names, zero_division=0))
print(f"\n  Overall Accuracy : {fin_acc:.4f}")
print(f"  F1 (weighted)    : {fin_f1:.4f}")
print("="*65)
print(f"\n✅ Model saved to: {SAVE_DIR}")
print("   Download the folder 'xlm_roberta_phq9_model' to your PC")


# ============================================================
# CELL 9 — ZIP & DOWNLOAD MODEL TO YOUR PC
# ============================================================
# Run this after training to download the model folder

import shutil
from google.colab import files

print("Zipping model folder ...")
shutil.make_archive("/content/xlm_roberta_phq9_model", "zip", "/content/xlm_roberta_phq9_model")
size_mb = os.path.getsize("/content/xlm_roberta_phq9_model.zip") / 1e6
print(f"Zip size: {size_mb:.1f} MB")

print("Starting download ...")
files.download("/content/xlm_roberta_phq9_model.zip")
print("\n✅ Done! Extract the zip and place the folder at:")
print("   c:\\mental health web\\MentalHealthWebsite\\backend\\ml\\xlm_roberta_phq9_model\\")  
