import json
import numpy as np
from sklearn.preprocessing import StandardScaler
from pathlib import Path

# ---- PATHS ----
BASE_DIR = Path(__file__).resolve().parent
INPUT_PATH = BASE_DIR.parent / "backend" / "ml_data" / "program_features.json"
OUTPUT_PATH = BASE_DIR / "program_features_normalized.json"

# ---- LOAD DATA ----
with open(INPUT_PATH, "r") as f:
    data = json.load(f)

program_ids = [item["program_id"] for item in data]
X = np.array([item["features"] for item in data])

# ---- NORMALIZE ----
scaler = StandardScaler()
X_norm = scaler.fit_transform(X)

# ---- REPACK WITH IDS ----
normalized = []
for pid, vec in zip(program_ids, X_norm):
    normalized.append({
        "program_id": pid,
        "features": vec.tolist()
    })

# ---- SAVE ----
with open(OUTPUT_PATH, "w") as f:
    json.dump(normalized, f, indent=2)

print("✅ Program features normalized (IDs preserved)")
print(f"Input:  {INPUT_PATH}")
print(f"Output: {OUTPUT_PATH}")
