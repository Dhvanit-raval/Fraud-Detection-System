import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Alerts from './components/Alerts';
import Analytics from './components/Analytics';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { TransactionProvider } from './context/TransactionContext';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <TransactionProvider>
      <div className="min-h-screen gradient-bg transition-colors duration-300">
        <Router>
          <div className="flex">
            <Sidebar />
            <div className="flex-1 flex flex-col lg:ml-64">
              <Header darkMode={darkMode} setDarkMode={setDarkMode} />
              <main className="flex-1 p-6 lg:p-8">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/analytics" element={<Analytics />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </div>
    </TransactionProvider>
  );
}

export default App;