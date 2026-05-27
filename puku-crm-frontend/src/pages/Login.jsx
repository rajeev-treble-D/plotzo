import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const Login = () => {
    const [view, setView] = useState('login'); // 'login' or 'forgot'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const api = useAuth().api; // Assuming api is available in AuthContext or use direct axios if not

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (view === 'login') {
                const user = await login(email, password);
                if (user?.role_name === 'Admin') {
                    navigate('/');
                } else {
                    navigate('/profile');
                }
            } else {
                await api.post('/auth/forgot-password', { email });
                setSuccessMsg(t('login.link_sent_success'));
            }
        } catch (err) {
            setError(err.response?.data?.message || (view === 'login' ? t('login.error_msg') : t('common.error_msg')));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl shadow-primary-200 dark:shadow-none mb-4">
                        P
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Puku CRM</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {view === 'login' ? t('login.welcome') : t('login.forgot_password_title')} {t('login.subtitle')}
                    </p>
                </div>


                <div className="card shadow-2xl p-8">
                    {(error || successMsg) && (
                        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in shake duration-300 ${error ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 text-green-600 dark:text-green-400'}`}>
                            {error ? <AlertCircle size={20} /> : <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>}
                            <p className="text-sm font-medium">{error || successMsg}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{t('login.email_label')}</label>
                            <div className="relative">

                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('login.email_placeholder')}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                />

                            </div>
                        </div>

                        {view === 'login' && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">{t('login.password_label')}</label>
                                <div className="relative">

                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between py-2">
                            {view === 'login' ? (
                                <>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{t('login.remember_me')}</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); }}
                                        className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                                    >
                                        {t('login.forgot_password')}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                                    className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
                                >
                                    ← {t('login.back_to_login')}
                                </button>
                            )}
                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    {view === 'login' ? t('login.signing_in') : t('common.loading')}
                                </>
                            ) : (
                                view === 'login' ? t('login.sign_in_btn') : t('login.send_link_btn')
                            )}
                        </button>

                    </form>
                </div>

                <p className="text-center mt-8 text-slate-500 dark:text-slate-400 text-sm">
                    {t('login.no_account')} <span className="text-primary-600 font-bold cursor-pointer hover:underline">{t('login.contact_admin')}</span>
                </p>

            </div>
        </div>
    );
};

export default Login;
