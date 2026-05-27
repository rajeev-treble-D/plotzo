import React, { useState, useEffect } from 'react';
import {
    X,
    ShoppingBag,
    Briefcase,
    Loader2,
    Mail,
    Phone,
    Globe,
    Calendar,
    ChevronRight,
    Search
} from 'lucide-react';
import api from '../services/api';

const CustomerDetailsModal = ({ isOpen, onClose, customerId }) => {
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState(null);
    const [activeTab, setActiveTab] = useState('sales');

    useEffect(() => {
        if (isOpen && customerId) {
            fetchDetails();
        }
    }, [isOpen, customerId]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/customers/${customerId}/details`);
            setDetails(res.data);
        } catch (err) {
            console.error('Failed to fetch details:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">

                {/* Header */}
                <div className="relative p-8 pb-32 bg-gradient-to-br from-primary-600 to-primary-800">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"
                    >
                        <X size={24} />
                    </button>

                    {loading ? (
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl animate-pulse"></div>
                            <div className="space-y-3">
                                <div className="w-48 h-8 bg-white/20 rounded-xl animate-pulse"></div>
                                <div className="w-32 h-4 bg-white/20 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-primary-600 text-4xl font-black shadow-2xl shadow-primary-950/20">
                                {details?.name?.charAt(0)}
                            </div>
                            <div className="text-white">
                                <h2 className="text-3xl font-black tracking-tight">{details?.name}</h2>
                                <div className="flex flex-wrap items-center gap-4 mt-2 opacity-90 font-medium">
                                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                                        <Globe size={14} />
                                        {details?.company || 'Personal'}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                                        <Calendar size={14} />
                                        Joined {new Date(details?.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Container */}
                <div className="relative -mt-24 px-8 pb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Sidebar: Details */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-slate-700/50">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Contact Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 transition-colors group hover:border-primary-200 dark:hover:border-primary-900/50">
                                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                                            <Mail size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Email</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{details?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 transition-colors group hover:border-primary-200 dark:hover:border-primary-900/50">
                                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                                            <Phone size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">Phone</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{details?.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-slate-700/50">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:ring-2 hover:ring-primary-500/10 cursor-default border border-slate-100 dark:border-slate-700/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Sales</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{details?.sales?.length || 0}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:ring-2 hover:ring-primary-500/10 cursor-default border border-slate-100 dark:border-slate-700/50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Projects</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{details?.projects?.length || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Body: Tabs Content */}
                        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700/50 min-h-[400px]">

                            {/* Tabs Switcher */}
                            <div className="flex p-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
                                <button
                                    onClick={() => setActiveTab('sales')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sales'
                                            ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm border border-slate-100 dark:border-slate-700 ring-4 ring-primary-500/5'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <ShoppingBag size={14} />
                                    Sales List
                                </button>
                                <button
                                    onClick={() => setActiveTab('projects')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'projects'
                                            ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm border border-slate-100 dark:border-slate-700 ring-4 ring-primary-500/5'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <Briefcase size={14} />
                                    Projects
                                </button>
                            </div>

                            {/* Tab Body */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {loading ? (
                                    <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
                                        <Loader2 size={40} className="animate-spin text-primary-500 mb-4" />
                                        <p className="font-bold text-sm uppercase tracking-widest">Loading Records...</p>
                                    </div>
                                ) : (
                                    activeTab === 'sales' ? (
                                        <div className="space-y-3">
                                            {details?.sales?.length === 0 ? (
                                                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                    <ShoppingBag size={32} className="mx-auto text-slate-300 mb-3" />
                                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Sales Found</p>
                                                </div>
                                            ) : (
                                                details?.sales?.map(sale => (
                                                    <div key={sale.id} className="group p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center font-black">
                                                                $
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">Sale #{sale.id}</p>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(sale.transaction_date).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-slate-900 dark:text-white">${parseFloat(sale.amount).toLocaleString()}</p>
                                                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full">{sale.status}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {details?.projects?.length === 0 ? (
                                                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                    <Briefcase size={32} className="mx-auto text-slate-300 mb-3" />
                                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Projects Created</p>
                                                </div>
                                            ) : (
                                                details?.projects?.map(project => (
                                                    <div key={project.id} className="group p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl flex items-center justify-center">
                                                                <Briefcase size={20} />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">{project.name}</p>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget: ${parseFloat(project.budget || 0).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${project.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                                                                }`}>{project.status}</span>
                                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsModal;
