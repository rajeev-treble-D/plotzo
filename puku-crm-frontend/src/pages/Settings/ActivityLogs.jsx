import React, { useState, useEffect } from 'react';
import {
    Activity,
    Search,
    Filter,
    Clock,
    User,
    ArrowRight,
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    Loader2,
    Calendar,
    Settings,
    Briefcase,
    Users,
    Zap,
    ShoppingBag,
    Receipt,
    Package
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import Pagination from '../../components/Pagination';


const ActivityLogs = () => {
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchLogs(currentPage);
    }, [currentPage]);

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/activity?page=${page}&limit=${limit}`);
            setLogs(res.data.logs || []);
            setTotalRecords(res.data.total || 0);
        } catch (err) {
            showToast(t('activity.fetch_error'), 'error');
        } finally {

            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'CREATED': return <Plus size={14} />;
            case 'UPDATED': return <Edit2 size={14} />;
            case 'DELETED': return <Trash2 size={14} />;
            case 'STATUS_TOGGLE': return <CheckCircle2 size={14} />;
            default: return <Activity size={14} />;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATED': return 'bg-green-500';
            case 'UPDATED': return 'bg-blue-500';
            case 'DELETED': return 'bg-red-500';
            case 'STATUS_TOGGLE': return 'bg-purple-500';
            default: return 'bg-slate-500';
        }
    };

    const getEntityIcon = (type) => {
        switch (type) {
            case 'Project': return <Briefcase size={12} />;
            case 'Task': return <Zap size={12} />;
            case 'Customer': return <Users size={12} />;
            case 'Lead': return <ArrowRight size={12} />;
            case 'Sale': return <ShoppingBag size={12} />;
            case 'Expense': return <Receipt size={12} />;
            case 'ExpenseCategory': return <Filter size={12} />;
            case 'StockItem': return <Package size={12} />;
            case 'User': return <User size={12} />;
            default: return <Settings size={12} />;
        }
    };

    const filteredLogs = logs.filter(log => {
        const userName = log.user_name || 'System';
        const action = log.action || '';
        const entityType = log.entity_type || '';

        const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entityType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || log.entity_type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors flex items-center gap-3">
                        <Activity className="text-primary-500" />
                        {t('activity.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('activity.subtitle')}</p>
                </div>

                <button
                    onClick={fetchLogs}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm text-slate-600 dark:text-slate-400"
                >
                    <Clock size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full md:w-auto overflow-x-auto">
                    {['All', 'Project', 'Task', 'Customer', 'Lead', 'Sale', 'Expense', 'StockItem', 'User'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${filterType === type
                                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {t(`activity.entities.${type}`)}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder={t('activity.search_placeholder')}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card !p-0 overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-primary-500" size={40} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('activity.fetching')}</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="py-20 text-center">
                        <Activity size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('activity.no_logs')}</h3>
                        <p className="text-slate-500 dark:text-slate-400">{t('activity.activity_appear')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {filteredLogs.map((log, index) => (
                            <div key={log.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group flex gap-4">
                                <div className="flex flex-col items-center relative">
                                    <div className={`w-10 h-10 rounded-2xl ${getActionColor(log.action)} flex items-center justify-center text-white shadow-lg shadow-current/20 z-10 shrink-0`}>
                                        {getActionIcon(log.action)}
                                    </div>
                                    {index !== filteredLogs.length - 1 && (
                                        <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 absolute top-10 flex-1"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                            <span className="text-primary-600 dark:text-primary-400">{log.user_name || 'System'}</span>
                                            {" "}
                                            <span className="text-slate-400 font-medium">{t('activity.performed_a')}</span>
                                            {" "}
                                            <span className="uppercase tracking-tight underline decoration-dotted decoration-slate-300 text-slate-700 dark:text-slate-200">
                                                {log.action ? (t(`activity.actions.${log.action}`) || log.action) : 'Action'}
                                            </span>
                                            {" "}
                                            <span className="text-slate-400 font-medium">{t('activity.on')}</span>
                                            {" "}
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                                                {getEntityIcon(log.entity_type)}
                                                {t(`activity.entities.${log.entity_type}`) || log.entity_type}
                                            </span>
                                        </p>

                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 italic flex flex-wrap gap-y-1">
                                            {(() => {
                                                if (!log.details) return t('activity.no_details');

                                                let detailsObj = log.details;
                                                if (typeof log.details === 'string' && log.details.startsWith('{')) {
                                                    try {
                                                        detailsObj = JSON.parse(log.details);
                                                    } catch (e) {
                                                        return log.details;
                                                    }
                                                }

                                                if (typeof detailsObj === 'object' && detailsObj !== null) {
                                                    return Object.entries(detailsObj).map(([key, value]) => (
                                                        <span key={key} className="mr-3">
                                                            <strong className="uppercase text-[10px] font-black opacity-50 block sm:inline">{key.replace('_', ' ')}:</strong>
                                                            {" "}{typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                        </span>
                                                    ));
                                                }

                                                return String(log.details);
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Pagination
                total={totalRecords}
                limit={limit}
                currentPage={currentPage}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default ActivityLogs;
