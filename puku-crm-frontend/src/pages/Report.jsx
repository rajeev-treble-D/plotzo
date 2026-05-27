import React, { useState, useRef, useEffect } from 'react';
import {
    Sparkles,
    Send,
    Bot,
    User,
    Loader2,
    Calendar,
    Download,
    TrendingUp,
    TrendingDown,
    PieChart as PieChartIcon,
    BarChart3,
    ArrowRight,
    RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';


const Report = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: t('report.welcome_msg') }
    ]);

    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleChat = async (e) => {
        e.preventDefault();
        if (!query.trim() || isProcessing) return;

        const userText = query;
        setQuery('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsProcessing(true);

        try {
            const res = await api.post('/report/chat', { prompt: userText });

            setMessages(prev => [...prev, {
                role: 'assistant',
                text: res.data.report,
                success: res.data.success
            }]);
        } catch (err) {
            console.error('AI Error:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: err.response?.data?.message || t('report.error_msg')
            }]);

        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Sparkles className="text-primary-600" size={32} />
                        {t('report.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 italic">{t('report.subtitle')}</p>
                </div>

                <div className="flex gap-2">
                    <button className="btn btn-secondary flex items-center gap-2" onClick={() => setMessages([{ role: 'assistant', text: t('report.history_cleared') }])}>
                        <RefreshCw size={18} />
                        {t('report.reset_btn')}
                    </button>
                </div>

            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                {/* Chat Interface */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-primary-600'
                                        }`}>
                                        {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                    </div>
                                    <div className={`p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-none'
                                        : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                        }`}>
                                        {msg.role === 'assistant' ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-100">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isProcessing && (
                            <div className="flex justify-start">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary-600 shadow-md">
                                        <Bot size={20} />
                                    </div>
                                    <div className="flex items-center gap-2 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-slate-500 italic text-sm">
                                        <Loader2 className="animate-spin" size={16} />
                                        {t('report.analyzing')}
                                    </div>

                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                        <form onSubmit={handleChat} className="relative flex items-center">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t('report.input_placeholder')}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-5 pr-14 focus:ring-4 focus:ring-primary-500/10 outline-none text-slate-900 dark:text-slate-100 transition-all shadow-sm"
                            />
                            <button
                                type="submit"
                                disabled={isProcessing || !query.trim()}
                                className="absolute right-2 p-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-md active:scale-95"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Suggestions & Quick Stats */}
                <div className="lg:w-80 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
                    <div className="card border-primary-100 dark:border-primary-900/30 bg-primary-50/10">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <ArrowRight size={16} className="text-primary-600" />
                            {t('report.suggested_queries')}
                        </h3>
                        <div className="space-y-2">
                            {[
                                t('report.suggestions.sales'),
                                t('report.suggestions.expenses'),
                                t('report.suggestions.customers'),
                                t('report.suggestions.leads'),
                                t('report.suggestions.performance'),
                                t('report.suggestions.stock'),
                                t('report.suggestions.projects'),
                                t('report.suggestions.tasks'),
                                t('report.suggestions.profit')
                            ].map((s, idx) => (

                                <button
                                    key={idx}
                                    onClick={() => setQuery(s)}
                                    className="w-full text-left p-3 text-xs bg-white dark:bg-slate-800 hover:border-primary-500 border border-slate-100 dark:border-slate-700 rounded-xl transition-all hover:shadow-md text-slate-600 dark:text-slate-400 font-medium"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Report;
