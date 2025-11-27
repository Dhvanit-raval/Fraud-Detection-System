from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

class FraudPrediction:
    def __init__(self, transaction_id, is_fraud, fraud_probability, risk_score, reasons, timestamp):
        self.transaction_id = transaction_id
        self.is_fraud = is_fraud
        self.fraud_probability = fraud_probability
        self.risk_score = risk_score
        self.reasons = reasons
        self.timestamp = timestamp

    def to_dict(self):
        return {
            "transaction_id": self.transaction_id,
            "is_fraud": self.is_fraud,
            "fraud_probability": self.fraud_probability,
            "risk_score": self.risk_score,
            "reasons": self.reasons,
            "timestamp": self.timestamp
        }

def predict_fraud(transaction_data):
    """Simple rule-based fraud detection"""
    risk_score = 0
    reasons = []
    
    # Rule-based risk factors
    if transaction_data['amount'] > 1000:
        risk_score += 0.3
        reasons.append("High transaction amount")
    
    if transaction_data['category'].lower() in ['gambling', 'electronics']:
        risk_score += 0.2
        reasons.append("Risky merchant category")
    
    if transaction_data['country'] != 'US':
        risk_score += 0.2
        reasons.append("Foreign transaction")
    
    # Check if unusual time (simplified)
    try:
        hour = int(transaction_data['transaction_time'][11:13])
        if hour < 6 or hour > 22:
            risk_score += 0.1
            reasons.append("Unusual transaction time")
    except:
        pass
    
    if transaction_data['device'] == 'mobile':
        risk_score += 0.1
        reasons.append("Mobile transaction")
    
    # Add some randomness for demo
    risk_score += random.uniform(0, 0.2)
    
    # Cap risk score
    risk_score = min(risk_score, 0.95)
    
    is_fraud = risk_score > 0.5
    
    return FraudPrediction(
        transaction_id=transaction_data['transaction_id'],
        is_fraud=is_fraud,
        fraud_probability=round(risk_score, 3),
        risk_score=round(risk_score * 100, 1),
        reasons=reasons if reasons else ["Low risk transaction"],
        timestamp=datetime.now().isoformat()
    )

@app.route('/')
def root():
    return jsonify({
        "message": "Fraud Detection ML API", 
        "status": "running",
        "framework": "Flask"
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict fraud for a transaction"""
    try:
        transaction_data = request.get_json()
        prediction = predict_fraud(transaction_data)
        return jsonify(prediction.to_dict())
    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)