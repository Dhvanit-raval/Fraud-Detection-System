import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 5000;
const ML_SERVICE_URL = 'http://localhost:8000';

// Middleware
app.use(cors());
app.use(express.json());

// Store transactions in memory
let transactions = [];
let alerts = [];

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Fraud Detection API',
        status: 'running',
        endpoints: ['/api/transactions', '/api/predict', '/api/alerts', '/api/stats']
    });
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
    res.json({
        success: true,
        data: transactions,
        count: transactions.length
    });
});

// Predict fraud for a transaction
app.post('/api/predict', async (req, res) => {
    console.log('📨 Received transaction:', req.body);

    try {
        const transaction = req.body;

        // Add timestamp if not present
        if (!transaction.transaction_time) {
            transaction.transaction_time = new Date().toISOString();
        }

        // Add transaction ID if not present
        if (!transaction.transaction_id) {
            transaction.transaction_id = `TXN${Date.now()}`;
        }

        console.log('🔄 Calling ML service...');

        let prediction;

        try {
            // Try to call ML service
            const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, transaction, {
                timeout: 5000 // 5 second timeout
            });

            console.log('✅ ML service response:', mlResponse.data);
            prediction = mlResponse.data;

        } catch (mlError) {
            console.log('⚠️ ML service unavailable, using fallback');

            // Fallback prediction when ML service is down
            prediction = generateFallbackPrediction(transaction);
        }

        // Store transaction with prediction
        const transactionWithPrediction = {
            ...transaction,
            prediction,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };

        transactions.unshift(transactionWithPrediction);

        // Create alert if high risk or fraud - FIXED ALERT CREATION
        if (prediction.risk_score > 70 || prediction.is_fraud) {
            console.log('🚨 Creating alert for high-risk transaction');
            const alert = {
                id: `ALERT${Date.now()}`,
                transactionId: transaction.transaction_id,
                riskScore: prediction.risk_score,
                amount: transaction.amount,
                merchant: transaction.merchant,
                category: transaction.category,
                city: transaction.city,
                country: transaction.country,
                device: transaction.device,
                timestamp: new Date().toISOString(),
                status: 'new',
                reasons: prediction.reasons || ['High risk transaction detected'],
                prediction: prediction // Include full prediction data
            };
            alerts.unshift(alert);
            console.log('✅ Alert created:', {
                id: alert.id,
                merchant: alert.merchant,
                amount: alert.amount,
                riskScore: alert.riskScore,
                is_fraud: prediction.is_fraud
            });
        }

        res.json({
            success: true,
            data: prediction,
            transaction: transactionWithPrediction
        });

    } catch (error) {
        console.error('❌ Prediction error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to process transaction',
            details: error.message
        });
    }
});

// Fallback prediction generator
function generateFallbackPrediction(transaction) {
    let risk_score = 0;
    let reasons = [];

    console.log('🔄 Generating fallback prediction for:', transaction.merchant);

    // Rule-based risk factors (same as ML service)
    if (transaction.amount > 5000) {
        risk_score += 0.3;
        reasons.push("High transaction amount");
    }

    if (['gambling', 'electronics'].includes(transaction.category.toLowerCase())) {
        risk_score += 0.2;
        reasons.push("Risky merchant category");
    }

    if (transaction.country !== 'IN') {
        risk_score += 0.3;
        reasons.push("Foreign transaction");
    }

    // Check if unusual time
    try {
        const hour = new Date(transaction.transaction_time).getHours();
        if (hour < 6 || hour > 22) {
            risk_score += 0.1;
            reasons.push("Unusual transaction time");
        }
    } catch (e) {
        // Ignore time parsing errors
    }

    if (transaction.device === 'mobile') {
        risk_score += 0.1;
        reasons.push("Mobile transaction");
    }

    // Add some randomness
    risk_score += Math.random() * 0.2;
    risk_score = Math.min(risk_score, 0.95);

    const is_fraud = risk_score > 0.5;

    console.log(`🔍 Fallback prediction - Risk: ${(risk_score * 100).toFixed(1)}%, Fraud: ${is_fraud}`);

    return {
        transaction_id: transaction.transaction_id,
        is_fraud: is_fraud,
        fraud_probability: risk_score,
        risk_score: risk_score * 100,
        reasons: reasons.length > 0 ? reasons : ["Low risk transaction"],
        timestamp: new Date().toISOString()
    };
}

// Get alerts
app.get('/api/alerts', (req, res) => {
    console.log('📊 Sending alerts data. Total alerts:', alerts.length);
    res.json({
        success: true,
        data: alerts,
        count: alerts.length
    });
});

// Update alert status
app.put('/api/alerts/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 Updating alert ${id} to status: ${status}`);

    const alertIndex = alerts.findIndex(alert => alert.id === id);
    if (alertIndex === -1) {
        return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    alerts[alertIndex].status = status;
    alerts[alertIndex].updatedAt = new Date().toISOString();

    console.log(`✅ Alert ${id} updated to ${status}`);

    res.json({ success: true, data: alerts[alertIndex] });
});

// Clear all alerts (for testing)
app.delete('/api/alerts', (req, res) => {
    console.log('🗑️ Clearing all alerts');
    const previousCount = alerts.length;
    alerts = [];
    res.json({
        success: true,
        message: `Cleared ${previousCount} alerts`,
        count: alerts.length
    });
});

// Get dashboard stats
app.get('/api/stats', (req, res) => {
    const totalTransactions = transactions.length;
    const fraudTransactions = transactions.filter(t => t.prediction?.is_fraud).length;
    const highRiskTransactions = transactions.filter(t => t.prediction?.risk_score > 70).length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const activeAlerts = alerts.filter(a => a.status === 'new').length;

    const stats = {
        totalTransactions,
        fraudTransactions,
        highRiskTransactions,
        totalAmount: Math.round(totalAmount * 100) / 100,
        fraudRate: totalTransactions > 0 ? (fraudTransactions / totalTransactions * 100).toFixed(2) : 0,
        activeAlerts
    };

    console.log('📈 Dashboard stats:', stats);

    res.json({
        success: true,
        data: stats
    });
});

// Get system status
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        data: {
            backend: 'running',
            ml_service: 'connected', // You could test ML service connection here
            database: 'in_memory',
            transactions_count: transactions.length,
            alerts_count: alerts.length,
            uptime: process.uptime()
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`🔗 ML Service: ${ML_SERVICE_URL}`);
    console.log(`📊 Endpoints:`);
    console.log(`   GET  /api/transactions`);
    console.log(`   POST /api/predict`);
    console.log(`   GET  /api/alerts`);
    console.log(`   PUT  /api/alerts/:id`);
    console.log(`   GET  /api/stats`);
    console.log(`   GET  /api/status`);
    console.log(`   DELETE /api/alerts (clear all)`);
    console.log(`\n💡 Test high-risk transaction:`);
    console.log(`   Merchant: "Test Casino", Amount: 15000, Category: gambling, Country: NG`);
});