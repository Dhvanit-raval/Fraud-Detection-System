import React, { useState } from 'react';
import { X, CreditCard, Building, Globe, Smartphone } from 'lucide-react';

const TransactionForm = (props) => {
    const { visible, onCancel, onSuccess } = props;
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        merchant: '',
        amount: '',
        category: 'electronics',
        city: 'Ahmedabad',
        country: 'IN',
        device: 'desktop'
    });

    if (!visible) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate amount
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Please enter a valid amount greater than 0');
            return;
        }

        setLoading(true);

        try {
            const transactionData = {
                transaction_id: `TXN${Date.now()}`,
                user_id: `USER${Math.floor(Math.random() * 1000)}`,
                amount: parseFloat(formData.amount),
                currency: 'INR',
                merchant: formData.merchant,
                category: formData.category,
                city: formData.city,
                country: formData.country,
                transaction_time: new Date().toISOString(),
                device: formData.device
            };

            console.log('Sending transaction:', transactionData);

            // Send transaction to backend
            const response = await fetch('http://localhost:5000/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const result = await response.json();

            console.log('Transaction processed successfully:', result);

            // Show success message
            alert(`✅ Transaction processed successfully!\n\nMerchant: ${formData.merchant}\nAmount: ₹${formData.amount}\nRisk Score: ${result.data.risk_score.toFixed(1)}%\nStatus: ${result.data.is_fraud ? 'FRAUD' : 'SAFE'}`);

            // Reset form
            setFormData({
                merchant: '',
                amount: '',
                category: 'electronics',
                city: 'Ahmedabad',
                country: 'IN',
                device: 'desktop'
            });

            // Close modal
            onCancel();

            // Call success callback if provided
            if (onSuccess) {
                onSuccess();
            } else {
                // Refresh the page after a short delay to show new transaction
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }

        } catch (error) {
            console.error('Failed to create transaction:', error);
            alert(`❌ Error: ${error.message}\n\nPlease make sure:\n• Backend server is running on port 5000\n• ML service is running on port 8000\n• All services are properly started`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const categories = [
        { value: 'electronics', label: 'Electronics', risk: 'High' },
        { value: 'grocery', label: 'Grocery', risk: 'Low' },
        { value: 'clothing', label: 'Clothing', risk: 'Medium' },
        { value: 'gambling', label: 'Gambling', risk: 'Very High' },
        { value: 'restaurant', label: 'Restaurant', risk: 'Low' },
        { value: 'travel', label: 'Travel', risk: 'Medium' },
        { value: 'entertainment', label: 'Entertainment', risk: 'Medium' },
    ];

    const countries = [
        { value: 'IN', label: 'India', risk: 'Low' },
        { value: 'US', label: 'United States', risk: 'Low' },
        { value: 'GB', label: 'United Kingdom', risk: 'Low' },
        { value: 'CA', label: 'Canada', risk: 'Low' },
        { value: 'CN', label: 'China', risk: 'High' },
        { value: 'NG', label: 'Nigeria', risk: 'Very High' },
        { value: 'RU', label: 'Russia', risk: 'High' },
    ];

    const indianCities = [
        'Ahmedabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata',
        'Hyderabad', 'Pune', 'Surat', 'Jaipur', 'Lucknow', 'Bhopal'
    ];

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'Very High': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
            case 'High': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
            case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
            default: return 'text-green-600 bg-green-100 dark:bg-green-900/30';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                New Transaction
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Process a new transaction for fraud analysis
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
                    >
                        <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Merchant & Amount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Building className="h-4 w-4" />
                                <span>Merchant Name *</span>
                            </label>
                            <input
                                type="text"
                                value={formData.merchant}
                                onChange={(e) => handleChange('merchant', e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                                placeholder="Enter merchant name"
                            />
                        </div>

                        <div>
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <span>Amount (₹) *</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={formData.amount}
                                onChange={(e) => handleChange('amount', e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <span>Category *</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category.value}
                                    type="button"
                                    onClick={() => handleChange('category', category.value)}
                                    className={`p-3 border-2 rounded-xl text-left transition-all duration-200 ${formData.category === category.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {category.label}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRiskColor(category.risk)}`}>
                                            {category.risk}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <span>City *</span>
                            </label>
                            <select
                                value={formData.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200"
                            >
                                {indianCities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Globe className="h-4 w-4" />
                                <span>Country *</span>
                            </label>
                            <select
                                value={formData.country}
                                onChange={(e) => handleChange('country', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-200"
                            >
                                {countries.map((country) => (
                                    <option key={country.value} value={country.value}>
                                        {country.label} ({country.risk} Risk)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Device */}
                    <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Smartphone className="h-4 w-4" />
                            <span>Device *</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['desktop', 'mobile', 'tablet'].map((device) => (
                                <button
                                    key={device}
                                    type="button"
                                    onClick={() => handleChange('device', device)}
                                    className={`p-3 border-2 rounded-xl text-center transition-all duration-200 ${formData.device === device
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                        }`}
                                >
                                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                        {device}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Demo Tips */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Demo Tips:</h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                            <li>• <strong>Safe:</strong> Grocery, ₹500, India, Desktop</li>
                            <li>• <strong>Risky:</strong> Electronics, ₹8000, India, Mobile</li>
                            <li>• <strong>Fraud:</strong> Gambling, ₹15000, Nigeria, Mobile</li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4" />
                                    <span>Process Transaction</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionForm;