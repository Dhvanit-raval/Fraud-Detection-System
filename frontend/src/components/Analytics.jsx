import React from 'react';
import { TrendingUp, Users, DollarSign, AlertTriangle, Download, Calendar } from 'lucide-react';

const Analytics = () => {
    // Mock data for charts and analytics
    const analyticsData = {
        fraudTrends: [
            { month: 'Jan', fraud: 12, total: 1200 },
            { month: 'Feb', fraud: 8, total: 1400 },
            { month: 'Mar', fraud: 15, total: 1600 },
            { month: 'Apr', fraud: 10, total: 1800 },
            { month: 'May', fraud: 18, total: 2000 },
            { month: 'Jun', fraud: 14, total: 2200 },
        ],
        riskDistribution: [
            { category: 'Low Risk', value: 65, color: '#10B981' },
            { category: 'Medium Risk', value: 20, color: '#F59E0B' },
            { category: 'High Risk', value: 15, color: '#EF4444' },
        ],
        topCategories: [
            { category: 'Electronics', fraudRate: 12.5, total: 450 },
            { category: 'Gambling', fraudRate: 8.2, total: 120 },
            { category: 'Travel', fraudRate: 6.8, total: 320 },
            { category: 'Grocery', fraudRate: 1.2, total: 890 },
            { category: 'Clothing', fraudRate: 3.4, total: 560 },
        ]
    };

    const MetricCard = ({ icon: Icon, title, value, change, color }) => (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                    {change && (
                        <p className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
                            {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    );

    const FraudTrendChart = () => (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fraud Trends</h3>
                    <p className="text-gray-600 dark:text-gray-400">Monthly fraud detection patterns</p>
                </div>
                <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                    <Calendar className="h-4 w-4" />
                    <span>Last 6 months</span>
                </button>
            </div>
            <div className="space-y-3">
                {analyticsData.fraudTrends.map((item, index) => (
                    <div key={item.month} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white w-12">{item.month}</span>
                        <div className="flex-1 mx-4">
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${(item.fraud / item.total) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                                    {((item.fraud / item.total) * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.fraud} fraud</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.total} total</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const RiskDistribution = () => (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Risk Distribution</h3>
            <div className="space-y-4">
                {analyticsData.riskDistribution.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{item.category}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{item.value}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const TopCategories = () => (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Categories</h3>
                    <p className="text-gray-600 dark:text-gray-400">Fraud rate by transaction category</p>
                </div>
            </div>
            <div className="space-y-4">
                {analyticsData.topCategories.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{item.category[0]}</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{item.category}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.total} transactions</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-lg font-bold ${item.fraudRate > 10 ? 'text-red-600' :
                                item.fraudRate > 5 ? 'text-orange-600' : 'text-green-600'
                                }`}>
                                {item.fraudRate}%
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Fraud rate</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Deep insights into fraud patterns and system performance
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                    <button className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                        <Calendar className="h-4 w-4" />
                        <span>Date Range</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200">
                        <Download className="h-4 w-4" />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    icon={TrendingUp}
                    title="Total Fraud Cases"
                    value="1,247"
                    change={12}
                    color="bg-red-500"
                />
                <MetricCard
                    icon={Users}
                    title="Affected Users"
                    value="892"
                    change={-5}
                    color="bg-orange-500"
                />
                <MetricCard
                    icon={DollarSign}
                    title="Amount at Risk"
                    value="$284K"
                    change={8}
                    color="bg-yellow-500"
                />
                <MetricCard
                    icon={AlertTriangle}
                    title="Prevention Rate"
                    value="94.2%"
                    change={2}
                    color="bg-green-500"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FraudTrendChart />
                <RiskDistribution />
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopCategories />

                {/* Performance Metrics */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">System Performance</h3>
                    <div className="space-y-4">
                        {[
                            { metric: 'Model Accuracy', value: 96.8, target: 95 },
                            { metric: 'False Positive Rate', value: 2.1, target: 3 },
                            { metric: 'Detection Speed', value: 98.5, target: 95 },
                            { metric: 'Uptime', value: 99.9, target: 99.5 },
                        ].map((item, index) => (
                            <div key={item.metric} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.metric}</span>
                                <div className="flex items-center space-x-3">
                                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-1000 ${item.value >= item.target ? 'bg-green-500' : 'bg-yellow-500'
                                                }`}
                                            style={{ width: `${(item.value / 100) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-sm font-medium ${item.value >= item.target ? 'text-green-600' : 'text-yellow-600'
                                        }`}>
                                        {item.value}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;