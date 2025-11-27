import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, DollarSign, FileText, Users, Shield, CreditCard } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchStats();
        fetchTransactions();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/stats`);
            const data = await response.json();
            setStats(data.data);
        } catch (err) {
            console.error('Failed to fetch stats');
            // Set default stats if API fails
            setStats({
                totalTransactions: 0,
                fraudTransactions: 0,
                highRiskTransactions: 0,
                totalAmount: 0,
                fraudRate: 0
            });
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`${API_URL}/api/transactions`);
            const data = await response.json();
            setTransactions(data.data || []);
        } catch (err) {
            console.error('Failed to fetch transactions');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, title, value, change, color, delay }) => (
        <div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 card-hover animate-fade-in"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                    {change && (
                        <p className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
                            {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last week
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    );

    const QuickAction = ({ icon, title, description, onClick, color }) => (
        <button
            onClick={onClick}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 text-left group"
        >
            <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <span className="text-2xl">{icon}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Real-time fraud detection and transaction monitoring
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                        Live Monitoring
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={FileText}
                    title="Total Transactions"
                    value={stats?.totalTransactions || 0}
                    change={12}
                    color="bg-blue-500"
                    delay={0}
                />
                <StatCard
                    icon={AlertTriangle}
                    title="Fraud Detected"
                    value={stats?.fraudTransactions || 0}
                    change={-5}
                    color="bg-red-500"
                    delay={100}
                />
                <StatCard
                    icon={Shield}
                    title="High Risk"
                    value={stats?.highRiskTransactions || 0}
                    change={8}
                    color="bg-orange-500"
                    delay={200}
                />
                <StatCard
                    icon={TrendingUp}
                    title="Fraud Rate"
                    value={`${stats?.fraudRate || 0}%`}
                    change={-2}
                    color="bg-purple-500"
                    delay={300}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickAction
                    icon="🔍"
                    title="Scan Transactions"
                    description="Run fraud detection on recent transactions"
                    onClick={() => window.location.href = '/transactions'}
                    color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                />
                <QuickAction
                    icon="📊"
                    title="Generate Report"
                    description="Create detailed fraud analysis report"
                    onClick={() => window.location.href = '/analytics'}
                    color="bg-green-500/10 text-green-600 dark:text-green-400"
                />
                <QuickAction
                    icon="🚨"
                    title="View Alerts"
                    description="Check high-priority fraud alerts"
                    onClick={() => window.location.href = '/alerts'}
                    color="bg-red-500/10 text-red-600 dark:text-red-400"
                />
                <QuickAction
                    icon="⚙️"
                    title="Settings"
                    description="Configure detection parameters"
                    onClick={() => alert('Settings would open here')}
                    color="bg-gray-500/10 text-gray-600 dark:text-gray-400"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                            Live
                        </span>
                    </div>
                    <div className="space-y-4">
                        {transactions.slice(0, 5).map((transaction, index) => (
                            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">T</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Transaction #{1000 + index}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">2 mins ago</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.prediction?.is_fraud ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                    }`}>
                                    {transaction.prediction?.is_fraud ? 'FRAUD' : 'SAFE'}
                                </span>
                            </div>
                        ))}

                        {transactions.length === 0 && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
                                <button
                                    onClick={() => window.location.href = '/transactions'}
                                    className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Create your first transaction
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">System Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium text-green-800 dark:text-green-300">ML Model</span>
                            </div>
                            <span className="text-green-700 dark:text-green-400 font-medium">Operational</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium text-green-800 dark:text-green-300">API Services</span>
                            </div>
                            <span className="text-green-700 dark:text-green-400 font-medium">Operational</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="font-medium text-blue-800 dark:text-blue-300">Database</span>
                            </div>
                            <span className="text-blue-700 dark:text-blue-400 font-medium">Stable</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium text-green-800 dark:text-green-300">Frontend</span>
                            </div>
                            <span className="text-green-700 dark:text-green-400 font-medium">Running</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;