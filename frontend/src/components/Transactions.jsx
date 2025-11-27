import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, RefreshCw, Calendar, User, MapPin, Clock } from 'lucide-react';
import TransactionForm from './TransactionForm';
import TransactionCard from './TransactionCard';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Fetch transactions from backend
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/transactions`);
            const data = await response.json();

            if (data.success) {
                setTransactions(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleNewTransaction = () => {
        setShowForm(false);
        // Refresh transactions after a short delay to show the new one
        setTimeout(() => {
            fetchTransactions();
        }, 1000);
    };

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'fraud' && transaction.prediction?.is_fraud) ||
            (statusFilter === 'suspicious' && transaction.prediction?.risk_score > 70 && !transaction.prediction?.is_fraud) ||
            (statusFilter === 'safe' && !transaction.prediction?.is_fraud && transaction.prediction?.risk_score <= 70);

        // Date filtering
        const transactionDate = new Date(transaction.createdAt);
        const now = new Date();
        const matchesDate = dateFilter === 'all' ||
            (dateFilter === 'today' && transactionDate.toDateString() === now.toDateString()) ||
            (dateFilter === 'week' && (now - transactionDate) < 7 * 24 * 60 * 60 * 1000) ||
            (dateFilter === 'month' && transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear());

        return matchesSearch && matchesStatus && matchesDate;
    });

    const exportTransactions = () => {
        const csvContent = [
            ['Transaction ID', 'Merchant', 'Amount', 'Category', 'City', 'Country', 'Device', 'Risk Score', 'Status', 'Date'],
            ...filteredTransactions.map(t => [
                t.transaction_id,
                t.merchant,
                `₹${t.amount}`,
                t.category,
                t.city,
                t.country,
                t.device,
                `${t.prediction?.risk_score?.toFixed(1)}%`,
                t.prediction?.is_fraud ? 'FRAUD' : 'SAFE',
                new Date(t.createdAt).toLocaleString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fraud-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getStatusStats = () => {
        const total = transactions.length;
        const fraud = transactions.filter(t => t.prediction?.is_fraud).length;
        const suspicious = transactions.filter(t => t.prediction?.risk_score > 70 && !t.prediction?.is_fraud).length;
        const safe = transactions.filter(t => !t.prediction?.is_fraud && t.prediction?.risk_score <= 70).length;

        return { total, fraud, suspicious, safe };
    };

    const stats = getStatusStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction Monitoring</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Monitor and analyze transaction patterns for fraud detection
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                    <button
                        onClick={fetchTransactions}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={exportTransactions}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors duration-200"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Transaction</span>
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">Safe</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.safe}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Suspicious</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.suspicious}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">Fraud</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.fraud}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="safe">Safe Only</option>
                        <option value="suspicious">Suspicious Only</option>
                        <option value="fraud">Fraud Only</option>
                    </select>

                    {/* Date Filter */}
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>

                    {/* Clear Filters */}
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setDateFilter('all');
                        }}
                        className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-gray-700 dark:text-gray-300"
                    >
                        <Filter className="h-4 w-4" />
                        <span>Clear Filters</span>
                    </button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Transaction History
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {filteredTransactions.length} transactions found •
                                Last updated: {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Safe</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <span>Suspicious</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span>Fraud</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💳</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                {transactions.length === 0 ? "No transactions yet" : "No transactions found"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {transactions.length === 0
                                    ? "Get started by creating your first transaction"
                                    : "Try adjusting your search or filters"
                                }
                            </p>
                            {transactions.length === 0 && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                                >
                                    Create First Transaction
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredTransactions.map((transaction, index) => (
                            <TransactionCard
                                key={transaction.id}
                                transaction={transaction}
                                delay={index * 100}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Transaction Form Modal */}
            <TransactionForm
                visible={showForm}
                onCancel={() => setShowForm(false)}
                onSuccess={handleNewTransaction}
            />
        </div>
    );
};

export default Transactions;