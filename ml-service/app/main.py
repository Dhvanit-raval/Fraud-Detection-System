from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import random

app = FastAPI(title="Fraud Detection ML API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Transaction data model
class Transaction(BaseModel):
    transaction_id: str
    user_id: str
    amount: float
    currency: str
    merchant: str
    category: str
    city: str
    country: str
    transaction_time: str
    device: str

class FraudPrediction(BaseModel):
    transaction_id: str
    is_fraud: bool
    fraud_probability: float
    risk_score: float
    reasons: list[str]
    timestamp: str

def predict_fraud(transaction: Transaction):
    """Simple rule-based fraud detection"""
    risk_score = 0
    reasons = []
    
    # Rule-based risk factors
    if transaction.amount > 1000:
        risk_score += 0.3
        reasons.append("High transaction amount")
    
    if transaction.category.lower() in ['gambling', 'electronics']:
        risk_score += 0.2
        reasons.append("Risky merchant category")
    
    if transaction.country != 'US':
        risk_score += 0.2
        reasons.append("Foreign transaction")
    
    # Check if unusual time (simplified)
    try:
        hour = int(transaction.transaction_time[11:13])  # Extract hour from ISO string
        if hour < 6 or hour > 22:
            risk_score += 0.1
            reasons.append("Unusual transaction time")
    except:
        pass
    
    if transaction.device == 'mobile':
        risk_score += 0.1
        reasons.append("Mobile transaction")
    
    # Add some randomness for demo
    risk_score += random.uniform(0, 0.2)
    
    # Cap risk score
    risk_score = min(risk_score, 0.95)
    
    is_fraud = risk_score > 0.5
    
    return FraudPrediction(
        transaction_id=transaction.transaction_id,
        is_fraud=is_fraud,
        fraud_probability=risk_score,
        risk_score=risk_score * 100,
        reasons=reasons if reasons else ["Low risk transaction"],
        timestamp=datetime.now().isoformat()
    )

@app.get("/")
async def root():
    return {"message": "Fraud Detection ML API", "status": "running"}

@app.post("/predict", response_model=FraudPrediction)
async def predict(transaction: Transaction):
    """Predict fraud for a transaction"""
    try:
        prediction = predict_fraud(transaction)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)