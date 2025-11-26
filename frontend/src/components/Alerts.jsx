import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Filter, Bell, CreditCard, Building } from 'lucide-react';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchAlerts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/alerts');
            const data = await response.json();

            if (data.success) {
                setAlerts(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch alerts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();

        // Auto-refresh every 5 seconds if enabled
        let interval;
        if (autoRefresh) {
            interval = setInterval(fetchAlerts, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    const updateAlertStatus = async (alertId, status) => {
        try {
            await fetch(`http://localhost:5000/api/alerts/${alertId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });
            fetchAlerts(); // Refresh alerts
        } catch (err) {
            console.error('Failed to update alert status');
            alert('Failed to update alert status. Please try again.');
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' ||
            (priorityFilter === 'high' && alert.riskScore >= 80) ||
            (priorityFilter === 'medium' && alert.riskScore >= 60 && alert.riskScore < 80);
        return matchesStatus && matchesPriority;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-red-500 text-white';
            case 'investigating': return 'bg-orange-500 text-white';
            case 'resolved': return 'bg-green-500 text-white';
            case 'false_positive': return 'bg-blue-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getPriorityColor = (riskScore) => {
        if (riskScore >= 80) return 'text-red-600 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
        if (riskScore >= 60) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
    };

    const getPriorityIcon = (riskScore) => {
        if (riskScore >= 80) return '🔴';
        if (riskScore >= 60) return '🟡';
        return '🟢';
    };

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

    const AlertCard = ({ alert, index }) => (
        <div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex items-start justify-between">
                {/* Left Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {alert.riskScore >= 80 ? '🚨 CRITICAL FRAUD ALERT' : '⚠️ Suspicious Activity Detected'}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                                    {alert.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <div className="flex items-center space-x-2">
                                    <CreditCard className="h-4 w-4" />
                                    <span>ID: {alert.transactionId}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Building className="h-4 w-4" />
                                    <span>{alert.merchant}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg">{getPriorityIcon(alert.riskScore)}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(alert.riskScore)}`}>
                                        {alert.riskScore >= 80 ? 'CRITICAL' : alert.riskScore >= 60 ? 'HIGH' : 'MEDIUM'} PRIORITY
                                    </span>
                                </div>
                            </div>

                            {/* Alert Reasons */}
                            {alert.reasons && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                    <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Risk Factors:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {alert.reasons.map((reason, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-xs font-medium"
                                            >
                                                {reason}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Alert Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{alert.riskScore}%</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Risk Score</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{alert.amount}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Amount</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatTime(alert.timestamp)}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Time</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(alert.timestamp)}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Date</p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col space-y-3 ml-6">
                    {alert.status === 'new' && (
                        <>
                            <button
                                onClick={() => updateAlertStatus(alert.id, 'investigating')}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200 text-sm font-medium"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Investigate</span>
                            </button>
                            <button
                                onClick={() => updateAlertStatus(alert.id, 'false_positive')}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors duration-200 text-sm font-medium"
                            >
                                <XCircle className="h-4 w-4" />
                                <span>False Positive</span>
                            </button>
                        </>
                    )}

                    {alert.status === 'investigating' && (
                        <button
                            onClick={() => updateAlertStatus(alert.id, 'resolved')}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-200 text-sm font-medium"
                        >
                            <CheckCircle className="h-4 w-4" />
                            <span>Mark Resolved</span>
                        </button>
                    )}

                    {(alert.status === 'resolved' || alert.status === 'false_positive') && (
                        <button
                            onClick={() => updateAlertStatus(alert.id, 'new')}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors duration-200 text-sm font-medium"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Reopen</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Risk Progress Bar */}
            <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Risk Level</span>
                    <span>{alert.riskScore}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-1000 ${alert.riskScore >= 80 ? 'bg-red-500' :
                                alert.riskScore >= 60 ? 'bg-orange-500' : 'bg-yellow-500'
                            }`}
                        style={{ width: `${Math.min(alert.riskScore, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading alerts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fraud Alerts</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Monitor and manage high-risk transaction alerts in real-time
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                    {/* Auto-refresh Toggle */}
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-colors duration-200 ${autoRefresh
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                        <span>Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</span>
                    </button>

                    <button
                        onClick={fetchAlerts}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>Refresh Now</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">New Alerts</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {alerts.filter(a => a.status === 'new').length}
                    </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Investigating</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {alerts.filter(a => a.status === 'investigating').length}
                    </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">Resolved</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {alerts.filter(a => a.status === 'resolved').length}
                    </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{alerts.length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Filter className="h-4 w-4" />
                            <span>Status</span>
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="new">New</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                            <option value="false_positive">False Positive</option>
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Bell className="h-4 w-4" />
                            <span>Priority</span>
                        </label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                        >
                            <option value="all">All Priority</option>
                            <option value="high">High (80%+)</option>
                            <option value="medium">Medium (60-79%)</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setStatusFilter('all');
                                setPriorityFilter('all');
                            }}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-gray-700 dark:text-gray-300"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Clear Filters</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No alerts found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {alerts.length === 0
                                ? "Great! No fraud alerts detected in the system."
                                : "Try adjusting your filters to see more results."
                            }
                        </p>
                        {alerts.length === 0 && (
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                    💡 <strong>Tip:</strong> Create a high-risk transaction (₹8000+ in Electronics/Gambling from foreign countries) to test alerts
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <p className="text-gray-600 dark:text-gray-400">
                                Showing {filteredAlerts.length} of {alerts.length} alerts
                                {autoRefresh && ' • Auto-refresh enabled'}
                            </p>
                            {filteredAlerts.some(alert => alert.status === 'new') && (
                                <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                                    <Bell className="h-4 w-4" />
                                    <span className="text-sm font-medium">New alerts need attention!</span>
                                </div>
                            )}
                        </div>
                        {filteredAlerts.map((alert, index) => (
                            <AlertCard key={alert.id} alert={alert} index={index} />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default Alerts;