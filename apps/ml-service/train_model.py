import pandas as pd
from sklearn.linear_model import LogisticRegression
import joblib

# 🔹 Fake dataset (for now)
data = {
    "amount": [100, 200, 5000, 12000, 15000, 300, 7000, 20000],
    "velocity": [1, 1, 2, 3, 4, 1, 2, 5],
    "is_fraud": [0, 0, 0, 1, 1, 0, 0, 1]
}

df = pd.DataFrame(data)

X = df[["amount", "velocity"]]
y = df["is_fraud"]

# 🔥 Train model
model = LogisticRegression()
model.fit(X, y)

# 💾 Save model
joblib.dump(model, "model.joblib")

print("✅ Model trained and saved")