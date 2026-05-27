import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSettings(res.data);
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings) => {
        try {
            await api.post('/settings', newSettings);
            setSettings(prev => ({ ...prev, ...newSettings }));
            return { success: true };
        } catch (err) {
            console.error('Error updating settings:', err);
            return { success: false, error: err.message };
        }
    };

    const formatCurrency = (amount) => {
        const currency = settings.default_currency || 'USD ($)';
        const symbol = currency.includes('(') ? currency.split('(')[1].replace(')', '') : '$';

        return `${symbol}${parseFloat(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, updateSettings, fetchSettings, formatCurrency }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
