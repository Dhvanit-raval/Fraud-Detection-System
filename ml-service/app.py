from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import random
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def root():
    return jsonify({
        "message": "Fraud Detection ML API", 
        "status": "running",
        "framework": "Flask",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict fraud for a transaction"""
    try:
        transaction_data = request.get_json()
        
        # Extract data
        transaction_id = transaction_data.get('transaction_id', '')
        amount = transaction_data.get('amount', 0)
        category = transaction_data.get('category', '').lower()
        country = transaction_data.get('country', '')
        device = transaction_data.get('device', '')
        
        # Simple rule-based fraud detection
        risk_score = 0
        reasons = []
        
        # Rule-based risk factors
        if amount > 1000:
            risk_score += 0.3
            reasons.append("High transaction amount")
        
        if category in ['gambling', 'electronics']:
            risk_score += 0.2
            reasons.append("Risky merchant category")
        
        if country != 'US':
            risk_score += 0.2
            reasons.append("Foreign transaction")
        
        if device == 'mobile':
            risk_score += 0.1
            reasons.append("Mobile transaction")
        
        # Add some randomness for demo
        risk_score += random.uniform(0, 0.2)
        risk_score = min(risk_score, 0.95)  # Cap at 95%
        
        is_fraud = risk_score > 0.5
        
        response = {
            "transaction_id": transaction_id,
            "is_fraud": is_fraud,
            "fraud_probability": round(risk_score, 3),
            "risk_score": round(risk_score * 100, 1),
            "reasons": reasons if reasons else ["Low risk transaction"],
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "service": "ml-api"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)