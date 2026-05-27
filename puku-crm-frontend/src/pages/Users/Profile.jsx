import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, CheckCircle2, Loader2, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';


const Profile = () => {
    const { user, setUser } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            showToast(t('profile.passwords_mismatch'), 'error');
            return;
        }


        setLoading(true);
        try {
            await api.put('/auth/profile', {
                name: formData.name,
                email: formData.email,
                password: formData.password || undefined
            });

            // Update local user state
            setUser({ ...user, name: formData.name, email: formData.email });
            showToast(t('profile.update_success'), 'success');
            setFormData({ ...formData, password: '', confirmPassword: '' });
        } catch (err) {
            showToast(err.response?.data?.message || t('profile.update_error'), 'error');
        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('profile.title')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('profile.subtitle')}</p>
            </div>


            <div className="grid grid-cols-1 gap-6">
                {/* Profile Card */}
                <div className="card overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-400 -m-6 mb-6 flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-3xl font-bold border border-white/30">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-white">
                            <h2 className="text-xl font-bold">{user?.name}</h2>
                            <p className="text-white/80 text-sm flex items-center gap-1.5 mt-1 capitalize">
                                <Shield size={14} />
                                {user?.role_name || user?.role}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <User size={16} className="text-primary-500" />
                                    {t('profile.full_name')}
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Mail size={16} className="text-primary-500" />
                                    {t('profile.email_address')}
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all outline-none"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <KeyRound size={16} />
                                {t('profile.change_password')}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Lock size={16} className="text-primary-500" />
                                        {t('profile.new_password')}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder={t('profile.password_placeholder')}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all outline-none"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Lock size={16} className="text-primary-500" />
                                        {t('profile.confirm_password')}
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder={t('profile.confirm_placeholder')}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all outline-none"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>

                            </div>
                            {formData.password && (
                                <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 flex gap-3 text-blue-600 dark:text-blue-400 animate-in slide-in-from-top-2">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <p className="text-xs font-medium">{t('profile.security_tip')}</p>
                                </div>

                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary px-8 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                {t('profile.save_btn')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
