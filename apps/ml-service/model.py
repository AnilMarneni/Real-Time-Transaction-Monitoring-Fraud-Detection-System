import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

MODEL_PATH = "model.joblib"


# -------------------------------
# Train Model (only if needed)
# -------------------------------
def train_model():
    # Normal transactions
    normal = np.random.normal(loc=[500, 2], scale=[200, 1], size=(1000, 2))

    # Anomalies
    anomalies = np.array([
        [20000, 10],
        [15000, 8],
        [50, 20],
        [30000, 15]
    ])

    X = np.vstack([normal, anomalies])

    model = IsolationForest(contamination=0.05)
    model.fit(X)

    joblib.dump(model, MODEL_PATH)
    print("✅ Model trained and saved")


# -------------------------------
# Load Model
# -------------------------------
def load_model():
    if not os.path.exists(MODEL_PATH):
        train_model()
    return joblib.load(MODEL_PATH)


# -------------------------------
# Predict
# -------------------------------
def predict(model, features):
    score = model.decision_function([features])[0]
    return float(score)