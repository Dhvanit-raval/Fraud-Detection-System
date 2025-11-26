import React from 'react';

const Header = ({ darkMode, setDarkMode }) => {
    return (
        <header className="glass-effect border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-40">
            <div className="flex items-center justify-between">
                {/* Search Bar */}
                <div className="flex items-center space-x-4 flex-1 max-w-lg">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">🔍</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search transactions, users, merchants..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-3">
                    {/* Notifications */}
                    <button className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 group">
                        <span className="text-xl">🔔</span>
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
                        <div className="absolute -bottom-12 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                3 new alerts
                            </p>
                        </div>
                    </button>

                    {/* Settings */}
                    <button className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200">
                        <span className="text-xl">⚙️</span>
                    </button>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 text-xl"
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center space-x-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-600">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                Admin User
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Fraud Analyst
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;