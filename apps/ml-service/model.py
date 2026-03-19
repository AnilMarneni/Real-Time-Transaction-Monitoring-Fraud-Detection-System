import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

# Train dummy model (for now)
def train_model():
    # Fake dataset (later we improve)
    X = np.array([
        [100, 1],
        [200, 1],
        [5000, 2],
        [15000, 3],
        [300, 1],
        [25000, 5]
    ])

    model = IsolationForest(contamination=0.2)
    model.fit(X)

    joblib.dump(model, "model.joblib")


def load_model():
    return joblib.load("model.joblib")


def predict(model, features):
    score = model.decision_function([features])[0]
    return float(score)