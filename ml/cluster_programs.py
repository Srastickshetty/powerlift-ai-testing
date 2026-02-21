import json
import numpy as np
from sklearn.cluster import KMeans

# -------- LOAD NORMALIZED DATA --------
with open("program_features_normalized.json", "r") as f:
    data = json.load(f)

# data = [{ program_id, features }, ...]

program_ids = [item["program_id"] for item in data]
X = np.array([item["features"] for item in data])

# -------- CLUSTER --------
k = min(3, len(X))  # safe for small datasets
kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
labels = kmeans.fit_predict(X)

# -------- BUILD CLUSTER MAP --------
clusters = {}

for program_id, label in zip(program_ids, labels):
    label = str(label)
    if label not in clusters:
        clusters[label] = []
    clusters[label].append(program_id)

# -------- SAVE OUTPUT --------
output = {
    "num_clusters": k,
    "clusters": clusters
}

with open("program_clusters.json", "w") as f:
    json.dump(output, f, indent=2)

print("✅ Program clustering complete")
print(json.dumps(output, indent=2))
