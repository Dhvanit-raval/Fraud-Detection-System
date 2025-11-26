import React from 'react';
import { Clock, MapPin, CreditCard, User, AlertTriangle, CheckCircle } from 'lucide-react';

const TransactionCard = ({ transaction, delay = 0 }) => {
    const getRiskColor = (riskScore) => {
        if (riskScore >= 80) return 'risk-high';
        if (riskScore >= 60) return 'risk-medium';
        return 'risk-low';
    };

    const getRiskText = (riskScore) => {
        if (riskScore >= 80) return 'High Risk';
        if (riskScore >= 60) return 'Medium Risk';
        return 'Low Risk';
    };

    const getRiskIcon = (riskScore) => {
        if (riskScore >= 80) return '🔴';
        if (riskScore >= 60) return '🟡';
        return '🟢';
    };

    const prediction = transaction.prediction;

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div
            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 animate-slide-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between">
                {/* Left Section - Transaction Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                    {transaction.merchant}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${prediction?.is_fraud
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                    }`}>
                                    {prediction?.is_fraud ? 'FRAUD' : 'LEGIT'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span>ID: {transaction.transaction_id}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{transaction.city}, {transaction.country}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatTime(transaction.transaction_time)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Risk Factors */}
                    {prediction?.reasons && prediction.reasons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {prediction.reasons.map((reason, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center space-x-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-xs font-medium"
                                >
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>{reason}</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Section - Risk Assessment */}
                <div className="flex flex-col items-end space-y-3 ml-4">
                    {/* Amount */}
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₹{transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {formatDate(transaction.transaction_time)}
                        </p>
                    </div>

                    {/* Risk Score */}
                    <div className="flex items-center space-x-2">
                        <span className="text-xl">{getRiskIcon(prediction?.risk_score)}</span>
                        <div className="text-right">
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(prediction?.risk_score)}`}>
                                {getRiskText(prediction?.risk_score)}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Score: {prediction?.risk_score?.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Device & Category */}
                    <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                            {transaction.device}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                            {transaction.category}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Risk Level</span>
                    <span>{prediction?.risk_score?.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-1000 ${prediction?.risk_score >= 80 ? 'bg-red-500' :
                                prediction?.risk_score >= 60 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${Math.min(prediction?.risk_score || 0, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default TransactionCard;