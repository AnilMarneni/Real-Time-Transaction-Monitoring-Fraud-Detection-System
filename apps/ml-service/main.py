from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class TransactionInput(BaseModel):
    amount: float
    velocity: float


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/score")
def score_transaction(data: TransactionInput):
    # 🔥 simple mock ML logic
    score = 0.0

    if data.amount > 10000:
        score += 0.7
    if data.velocity > 2:
        score += 0.3

    return {
        "ml_score": score
    }