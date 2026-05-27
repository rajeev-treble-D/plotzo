import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Database,
    UserPlus,
    CheckCircle2,
    Settings,
    ArrowRight,
    ShieldCheck,
    Terminal,
    Loader2,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';

const Installer = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const [dbData, setDbData] = useState({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'puku_crm'
    });

    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleDbChange = (e) => setDbData({ ...dbData, [e.target.name]: e.target.value });
    const handleAdminChange = (e) => setAdminData({ ...adminData, [e.target.name]: e.target.value });

    const testDbConnection = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/setup/check-db', dbData);
            if (res.data.success) {
                setSuccess('Database connected and configuration saved!');
                setTimeout(() => {
                    setStep(2);
                    setSuccess('');
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Database connection failed.');
        } finally {
            setLoading(false);
        }
    };

    const runInstallation = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/setup/install');
            if (res.data.success) {
                setSuccess('Database tables created successfully!');
                setTimeout(() => {
                    setStep(3);
                    setSuccess('');
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Installation failed.');
        } finally {
            setLoading(false);
        }
    };

    const createAdmin = async () => {
        if (adminData.password !== adminData.confirmPassword) {
            return setError('Passwords do not match.');
        }
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/setup/create-admin', adminData);
            if (res.data.success) {
                setStep(4);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Admin creation failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
            {/* Header */}
            <div className="mb-12 text-center">
                <div className="flex items-center justify-center mb-6">
                    <div className="p-4 bg-primary-500 rounded-2xl shadow-xl shadow-primary-500/20 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <Settings className="text-white w-10 h-10 animate-spin-slow" />
                    </div>
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    Puku <span className="text-primary-500">CRM</span> Setup
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome! Let's get your CRM ready for use.</p>
            </div>

            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                {/* Progress Bar */}
                <div className="flex h-1.5 w-full bg-slate-100 dark:bg-slate-800">
                    <div
                        className="bg-primary-500 transition-all duration-700 ease-out h-full"
                        style={{ width: `${(step / 4) * 100}%` }}
                    ></div>
                </div>

                <div className="p-10">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-4">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <p className="text-sm font-semibold">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl flex items-center gap-3 text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-top-4">
                            <CheckCircle2 size={20} className="flex-shrink-0" />
                            <p className="text-sm font-semibold">{success}</p>
                        </div>
                    )}

                    {/* Steps */}
                    <div className="min-h-[350px]">
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Database Setup</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Configure your MySQL connection details.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Host Name</label>
                                        <input
                                            type="text" name="host" value={dbData.host} onChange={handleDbChange}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                                            placeholder="e.g. localhost"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Username</label>
                                        <input
                                            type="text" name="user" value={dbData.user} onChange={handleDbChange}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                                            placeholder="e.g. root"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                                        <input
                                            type="password" name="password" value={dbData.password} onChange={handleDbChange}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Database Name</label>
                                        <input
                                            type="text" name="database" value={dbData.database} onChange={handleDbChange}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                                            placeholder="e.g. puku_crm"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={testDbConnection} disabled={loading}
                                    className="w-full mt-10 py-5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <><Terminal size={20} /> Test Connection & Save</>}
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500 text-center flex flex-col h-full items-center justify-center">
                                <div className="p-6 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-3xl mb-8">
                                    <Terminal size={48} className="animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Initialize System</h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 text-lg">
                                    We're ready to create the internal structure. This will build all required tables for customers, products, and reports.
                                </p>

                                <button
                                    onClick={runInstallation} disabled={loading}
                                    className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Run System Initialization'}
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-xl">
                                        <UserPlus size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Admin account</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Set up your main administrator profile.</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                                        <input
                                            type="text" name="name" value={adminData.name} onChange={handleAdminChange}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                                        <input
                                            type="email" name="email" value={adminData.email} onChange={handleAdminChange}
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                                            <input
                                                type="password" name="password" value={adminData.password} onChange={handleAdminChange}
                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm</label>
                                            <input
                                                type="password" name="confirmPassword" value={adminData.confirmPassword} onChange={handleAdminChange}
                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={createAdmin} disabled={loading}
                                    className="w-full mt-10 py-5 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Complete Setup'}
                                </button>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="animate-in zoom-in duration-500 text-center flex flex-col h-full items-center justify-center">
                                <div className="relative mb-10">
                                    <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                                    <div className="relative p-8 bg-green-500 text-white rounded-[2.5rem] shadow-2xl shadow-green-500/40">
                                        <ShieldCheck size={64} />
                                    </div>
                                </div>

                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Installation Successful!</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-sm mx-auto mb-10 leading-relaxed">
                                    Your system has been hardened and secured. You are now the master of your new CRM.
                                </p>

                                <button
                                    onClick={() => window.location.href = '/login'}
                                    className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                                >
                                    Go to Login <ArrowRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(s => (
                            <div
                                key={s}
                                className={`w-3 h-1.5 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            ></div>
                        ))}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Step {step} of 4</p>
                </div>
            </div>
        </div>
    );
};

export default Installer;
