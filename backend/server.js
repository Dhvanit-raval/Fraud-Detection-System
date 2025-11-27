import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// FIXED CORS Configuration
app.use(cors({
    origin: [
        'https://fraud-detection-frontend.onrender.com',
        'https://fraud-detection-system-2.onrender.com', // Your actual frontend URL
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

// The rest of your existing code remains the same...
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

// Add the missing /api/stats endpoint
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

// Add the missing /api/alerts endpoint
app.get('/api/alerts', (req, res) => {
    console.log('📊 Sending alerts data. Total alerts:', alerts.length);
    res.json({
        success: true,
        data: alerts,
        count: alerts.length
    });
});

// Your existing /api/predict route remains the same...
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
        console.log('🔗 ML Service URL:', ML_SERVICE_URL);

        let prediction;

        try {
            // Try to call ML service
            const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, transaction, {
                timeout: 10000
            });

            console.log('✅ ML service response:', mlResponse.data);
            prediction = mlResponse.data;

        } catch (mlError) {
            console.log('⚠️ ML service unavailable, using fallback');
            console.log('ML Error details:', mlError.message);

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

        // Create alert if high risk or fraud
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
                prediction: prediction
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

// Your existing generateFallbackPrediction function and other routes...

// Keep the rest of your existing code...