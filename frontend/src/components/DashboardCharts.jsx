import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const DashboardCharts = ({ stats }) => {
    const transactionData = [
        { name: 'Mon', transactions: 120, fraud: 4 },
        { name: 'Tue', transactions: 150, fraud: 6 },
        { name: 'Wed', transactions: 180, fraud: 8 },
        { name: 'Thu', transactions: 160, fraud: 5 },
        { name: 'Fri', transactions: 200, fraud: 12 },
        { name: 'Sat', transactions: 170, fraud: 7 },
        { name: 'Sun', transactions: 140, fraud: 3 }
    ];

    const riskDistribution = [
        { name: 'Low Risk', value: 75 },
        { name: 'Medium Risk', value: 15 },
        { name: 'High Risk', value: 10 }
    ];

    const COLORS = ['#52c41a', '#faad14', '#ff4d4f'];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="stats-card">
                <h3>Transactions & Fraud Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={transactionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="transactions" stroke="#1890ff" strokeWidth={2} />
                        <Line type="monotone" dataKey="fraud" stroke="#ff4d4f" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="stats-card">
                <h3>Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={riskDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {riskDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashboardCharts;