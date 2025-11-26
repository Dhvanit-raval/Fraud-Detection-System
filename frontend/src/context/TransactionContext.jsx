import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const TransactionContext = createContext();

const transactionReducer = (state, action) => {
    switch (action.type) {
        case 'SET_TRANSACTIONS':
            return { ...state, transactions: action.payload };
        case 'ADD_TRANSACTION':
            return { ...state, transactions: [action.payload, ...state.transactions] };
        case 'SET_ALERTS':
            return { ...state, alerts: action.payload };
        case 'UPDATE_ALERT':
            return {
                ...state,
                alerts: state.alerts.map(alert =>
                    alert.id === action.payload.id ? { ...alert, ...action.payload } : alert
                )
            };
        case 'SET_STATS':
            return { ...state, stats: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        default:
            return state;
    }
};

const initialState = {
    transactions: [],
    alerts: [],
    stats: null,
    loading: false,
};

export const TransactionProvider = ({ children }) => {
    const [state, dispatch] = useReducer(transactionReducer, initialState);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('/api/transactions');
            dispatch({ type: 'SET_TRANSACTIONS', payload: response.data.data || [] });
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    };

    const fetchAlerts = async () => {
        try {
            const response = await axios.get('/api/alerts');
            dispatch({ type: 'SET_ALERTS', payload: response.data.data || [] });
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/stats');
            dispatch({ type: 'SET_STATS', payload: response.data.data });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const addTransaction = async (transactionData) => {
        try {
            const response = await axios.post('/api/predict', transactionData);
            dispatch({ type: 'ADD_TRANSACTION', payload: response.data.transaction });
            return response.data;
        } catch (error) {
            console.error('Failed to add transaction:', error);
            throw error;
        }
    };

    const updateAlertStatus = async (alertId, status) => {
        try {
            await axios.put(`/api/alerts/${alertId}`, { status });
            dispatch({ type: 'UPDATE_ALERT', payload: { id: alertId, status } });
        } catch (error) {
            console.error('Failed to update alert:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchAlerts();
        fetchStats();
    }, []);

    return (
        <TransactionContext.Provider value={{
            ...state,
            fetchTransactions,
            fetchAlerts,
            fetchStats,
            addTransaction,
            updateAlertStatus,
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransaction = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransaction must be used within a TransactionProvider');
    }
    return context;
};