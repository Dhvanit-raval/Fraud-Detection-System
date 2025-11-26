import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { key: '/', label: 'Dashboard', icon: '📊', description: 'Overview & Analytics' },
        { key: '/transactions', label: 'Transactions', icon: '💳', description: 'Monitor Payments' },
        { key: '/alerts', label: 'Fraud Alerts', icon: '🚨', description: 'Risk Notifications' },
        { key: '/analytics', label: 'Analytics', icon: '📈', description: 'Detailed Reports' },
    ];

    return (
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700 shadow-xl transform transition-transform duration-300 ease-in-out">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">F</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            FraudShield
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">AI Detection</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => navigate(item.key)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${location.pathname === item.key
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-md'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                            }`}
                    >
                        <span className={`text-2xl transition-transform duration-200 ${location.pathname === item.key ? 'scale-110' : 'group-hover:scale-110'
                            }`}>
                            {item.icon}
                        </span>
                        <div className="flex-1 text-left">
                            <p className={`font-semibold text-sm ${location.pathname === item.key
                                    ? 'text-blue-700 dark:text-blue-300'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {item.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.description}
                            </p>
                        </div>
                        {location.pathname === item.key && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        System Status
                    </p>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            All Systems Operational
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;