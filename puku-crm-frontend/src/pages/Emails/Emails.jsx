import React, { useState, useEffect } from 'react';
import {
    Mail,
    Send,
    User,
    Search,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';

const Emails = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();

    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);

    const [form, setForm] = useState({
        to: '',
        subject: '',
        message: '',
        customerId: null,
        customerName: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Search customers
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                try {
                    setLoadingCustomers(true);
                    const res = await api.get(`/customers/search?q=${searchQuery}`);
                    setCustomers(res.data.customers || []);
                    setShowResults(true);
                } catch (err) {
                    console.error('Search failed:', err);
                } finally {
                    setLoadingCustomers(false);
                }
            } else {
                setCustomers([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const selectCustomer = (customer) => {
        setForm({
            ...form,
            to: customer.email,
            customerId: customer.id,
            customerName: customer.name
        });
        setSearchQuery('');
        setShowResults(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.to || !form.subject || !form.message) {
            showToast(t('emails.form.fill_fields'), 'error');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/emails/send', {
                to: form.to,
                subject: form.subject,
                message: form.message,
                customerId: form.customerId
            });
            showToast(t('emails.form.send_success'), 'success');
            setForm({
                to: '',
                subject: '',
                message: '',
                customerId: null,
                customerName: ''
            });
        } catch (err) {
            showToast(err.response?.data?.message || t('emails.form.send_error'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-200 dark:shadow-none">
                    <Mail size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('emails.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{t('emails.subtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Instructions & Info */}
                <div className="space-y-6">
                    <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white border-none">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <CheckCircle2 size={20} />
                            {t('emails.tips.title')}
                        </h3>
                        <ul className="text-sm space-y-3 opacity-90">
                            <li className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0">1</span>
                                {t('emails.tips.tip1')}
                            </li>
                            <li className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0">2</span>
                                {t('emails.tips.tip2')}
                            </li>
                            <li className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] shrink-0">3</span>
                                {t('emails.tips.tip3')}
                            </li>
                        </ul>
                    </div>

                    <div className="card p-6 border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 text-amber-600 mb-2">
                            <AlertCircle size={20} />
                            <h4 className="font-bold">{t('emails.warning.title')}</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {t('emails.warning.text')}
                        </p>
                    </div>
                </div>

                {/* Right Side: Composition Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="card p-8 border-slate-100 dark:border-slate-800 space-y-6 shadow-xl shadow-slate-200/50 dark:shadow-none">

                        {/* Recipient Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {t('emails.form.to')}
                                </label>
                                {form.customerName && (
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, customerId: null, customerName: '', to: '' })}
                                        className="text-[10px] font-black uppercase text-red-500 hover:text-red-600 tracking-widest flex items-center gap-1"
                                    >
                                        <ArrowLeft size={12} /> {t('common.change')}
                                    </button>
                                )}
                            </div>

                            {!form.customerName ? (
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                                        placeholder={t('emails.form.search_placeholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                                    />
                                    {loadingCustomers && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 size={18} className="animate-spin text-primary-500" />
                                        </div>
                                    )}

                                    {/* Search Results */}
                                    {showResults && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-20">
                                            {customers.length === 0 ? (
                                                <div className="p-6 text-center text-slate-400 text-sm">
                                                    {t('common.no_results')}
                                                </div>
                                            ) : (
                                                <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                                                    {customers.map(c => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => selectCustomer(c)}
                                                            className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                                                        >
                                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl flex items-center justify-center font-bold">
                                                                {c.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</p>
                                                                <p className="text-xs text-slate-400">{c.email}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/20">
                                    <div className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                                        {form.customerName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-primary-900 dark:text-primary-100">{form.customerName}</p>
                                        <p className="text-sm text-primary-600">{form.to}</p>
                                    </div>
                                    <CheckCircle2 className="text-primary-600" size={24} />
                                </div>
                            )}

                            {/* Direct Email Input if no customer selected */}
                            {!form.customerId && !showResults && (
                                <div className="pt-2 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.or')}</span>
                                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                                    </div>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                        placeholder={t('emails.form.direct_placeholder')}
                                        value={form.to}
                                        onChange={(e) => setForm({ ...form, to: e.target.value, customerId: null, customerName: '' })}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                {t('emails.form.subject')}
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                                placeholder={t('emails.form.subject_placeholder')}
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                {t('emails.form.message')}
                            </label>
                            <textarea
                                rows="8"
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white resize-none"
                                placeholder={t('emails.form.message_placeholder')}
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold shadow-xl shadow-primary-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    {t('emails.form.sending')}
                                </>
                            ) : (
                                <>
                                    <Send size={24} />
                                    {t('emails.form.send')}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Emails;
