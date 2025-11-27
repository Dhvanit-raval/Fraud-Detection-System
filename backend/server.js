import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
app.use(cors());
app.use(express.json());

// File storage setup
const dataFile = path.join(__dirname, 'data.json');

// Load data from file
function loadData() {
    try {
        if (fs.existsSync(dataFile)) {
            const data = fs.readFileSync(dataFile, 'utf8');
            console.log('📂 Loaded data from file');
            return JSON.parse(data);
        }
    } catch (error) {
        console.log('❌ Error loading data:', error.message);
    }
    console.log('📂 Created new data file');
    return { transactions: [], alerts: [] };
}

// Save data to file
function saveData() {
    try {
        fs.writeFileSync(dataFile, JSON.stringify({
            transactions: transactions,
            alerts: alerts
        }, null, 2));
        console.log('💾 Data saved to file');
    } catch (error) {
        console.log('❌ Error saving data:', error.message);
    }
}

// Initialize data
let { transactions, alerts } = loadData();

// Auto-save every 30 seconds
setInterval(saveData, 30000);

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Fraud Detection API - WITH PERSISTENT STORAGE',
        status: 'running',
        transactionsCount: transactions.length,
        alertsCount: alerts.length,
        timestamp: new Date().toISOString()
    });
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
    console.log('📊 Sending transactions:', transactions.length);
    res.json({
        success: true,
        data: transactions,
        count: transactions.length
    });
});

// Get alerts
app.get('/api/alerts', (req, res) => {
    console.log('🚨 Sending alerts:', alerts.length);
    res.json({
        success: true,
        data: alerts,
        count: alerts.length
    });
});

// Get stats
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
    res.json({ success: true, data: stats });
});

// Predict fraud
app.post('/api/predict', async (req, res) => {
    console.log('📨 Received transaction:', req.body);

    try {
        const transaction = {
            ...req.body,
            transaction_time: req.body.transaction_time || new Date().toISOString(),
            transaction_id: req.body.transaction_id || `TXN${Date.now()}`
        };

        let prediction;

        try {
            // Call ML service
            const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, transaction, {
                timeout: 10000
            });
            prediction = mlResponse.data;
            console.log('✅ ML service response:', prediction);
        } catch (mlError) {
            console.log('⚠️ ML service down, using fallback');
            prediction = generateFallbackPrediction(transaction);
        }

        // Store transaction
        const transactionWithPrediction = {
            ...transaction,
            prediction,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };

        transactions.unshift(transactionWithPrediction);
        console.log('💾 Transaction stored. Total:', transactions.length);

        // Create alert if high risk
        if (prediction.risk_score > 70 || prediction.is_fraud) {
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
                reasons: prediction.reasons || ['High risk transaction detected']
            };
            alerts.unshift(alert);
            console.log('🚨 Alert created:', alert.id);
        }

        // Save to file immediately
        saveData();

        res.json({
            success: true,
            data: prediction,
            transaction: transactionWithPrediction
        });

    } catch (error) {
        console.error('❌ Prediction error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process transaction'
        });
    }
});

// Update alert status
app.put('/api/alerts/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const alertIndex = alerts.findIndex(alert => alert.id === id);
    if (alertIndex === -1) {
        return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    alerts[alertIndex].status = status;
    alerts[alertIndex].updatedAt = new Date().toISOString();

    saveData(); // Save changes
    res.json({ success: true, data: alerts[alertIndex] });
});

// Clear all data (for testing)
app.delete('/api/clear', (req, res) => {
    transactions = [];
    alerts = [];
    saveData();
    res.json({ success: true, message: 'All data cleared' });
});

// Fallback prediction
function generateFallbackPrediction(transaction) {
    let risk_score = 0;
    let reasons = [];

    if (transaction.amount > 5000) {
        risk_score += 0.3;
        reasons.push("High transaction amount");
    }
    if (['gambling', 'electronics'].includes(transaction.category?.toLowerCase())) {
        risk_score += 0.2;
        reasons.push("Risky merchant category");
    }
    if (transaction.country !== 'IN') {
        risk_score += 0.3;
        reasons.push("Foreign transaction");
    }
    if (transaction.device === 'mobile') {
        risk_score += 0.1;
        reasons.push("Mobile transaction");
    }

    risk_score += Math.random() * 0.2;
    risk_score = Math.min(risk_score, 0.95);

    return {
        transaction_id: transaction.transaction_id,
        is_fraud: risk_score > 0.5,
        fraud_probability: risk_score,
        risk_score: risk_score * 100,
        reasons: reasons.length > 0 ? reasons : ["Low risk transaction"],
        timestamp: new Date().toISOString()
    };
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        data: {
            transactions: transactions.length,
            alerts: alerts.length,
            storage: 'file-based'
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`🔗 ML Service: ${ML_SERVICE_URL}`);
    console.log(`💾 Storage: File-based (data.json)`);
    console.log(`📊 Current data: ${transactions.length} transactions, ${alerts.length} alerts`);
});