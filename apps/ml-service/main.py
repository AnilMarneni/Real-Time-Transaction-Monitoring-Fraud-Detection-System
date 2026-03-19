from fastapi import FastAPI
from pydantic import BaseModel
from model import load_model, predict

app = FastAPI()

model = load_model()


class TransactionInput(BaseModel):
    amount: float
    velocity: float


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/score")
def score_transaction(data: TransactionInput):
    features = [data.amount, data.velocity]

    score = predict(model, features)

    return {
        "ml_score": score
    }