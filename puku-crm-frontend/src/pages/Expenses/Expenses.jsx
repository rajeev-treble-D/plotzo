import React, { useState, useEffect } from 'react';
import {
    Receipt,
    Search,
    Plus,
    PieChart,
    MoreVertical,
    X,
    Loader2,
    Calendar,
    DollarSign,
    Trash2,
    Edit2,
    CheckCircle2,
    AlertCircle,
    Settings,
    Tag,
    Palette
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Expenses = () => {
    const { theme } = useTheme();
    const { showToast } = useToast();
    const { formatCurrency } = useSettings();
    const { t } = useTranslation();
    const isDark = theme === 'dark';
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [monthlySummary, setMonthlySummary] = useState([]);
    const [deleteCatModal, setDeleteCatModal] = useState({ isOpen: false, categoryId: null });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;

    const [formData, setFormData] = useState({
        category_id: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        payment_method: 'Credit Card'
    });

    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        description: '',
        color: '#3b82f6'
    });

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            const [expensesRes, categoriesRes, summaryRes] = await Promise.all([
                api.get(`/expenses?page=${page}&limit=${limit}`),
                api.get('/expenses/categories/all'),
                api.get('/expenses/summary')
            ]);
            setExpenses(expensesRes.data.expenses || []);
            setTotalRecords(expensesRes.data.total || 0);
            setCategories(categoriesRes.data.categories || []);
            setMonthlySummary(summaryRes.data.summary || []);
        } catch (err) {
            showToast(t('expenses.loading_error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleOpenModal = (expense = null) => {
        if (expense) {
            setSelectedExpense(expense);
            setFormData({
                category_id: expense.category_id,
                amount: expense.amount,
                date: new Date(expense.date).toISOString().split('T')[0],
                description: expense.description || '',
                payment_method: expense.payment_method
            });
        } else {
            setSelectedExpense(null);
            setFormData({
                category_id: categories.length > 0 ? categories[0].id : '',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                description: '',
                payment_method: 'Credit Card'
            });
        }
        setError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            if (selectedExpense) {
                await api.put(`/expenses/${selectedExpense.id}`, formData);
                showToast(t('expenses.update_success'), 'success');
            } else {
                await api.post('/expenses', formData);
                showToast(t('expenses.add_success'), 'success');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || t('common.error') || 'Something went wrong');
            showToast(t('expenses.save_error'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/expenses/categories', categoryFormData);
            showToast(t('expenses.categories_modal.add_category_success'), 'success');
            setCategoryFormData({ name: '', description: '', color: '#3b82f6' });
            fetchData();
        } catch (err) {
            showToast(t('expenses.categories_modal.add_category_error'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = (id) => {
        setDeleteCatModal({ isOpen: true, categoryId: id });
    };

    const confirmDeleteCategory = async () => {
        const id = deleteCatModal.categoryId;
        setSubmitting(true);
        try {
            await api.delete(`/expenses/categories/${id}`);
            showToast(t('expenses.categories_modal.delete_category_success'), 'success');
            setDeleteCatModal({ isOpen: false, categoryId: null });
            fetchData();
        } catch (err) {
            showToast(t('expenses.categories_modal.delete_category_error'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (expense) => {
        setSelectedExpense(expense);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/expenses/${selectedExpense.id}`);
            showToast(t('expenses.delete_success'), 'success');
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (err) {
            showToast(t('expenses.delete_error'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredExpenses = expenses.filter(exp =>
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSpent = monthlySummary.reduce((acc, cat) => acc + parseFloat(cat.total), 0);

    const chartData = {
        labels: monthlySummary.map(c => c.name),
        datasets: [{
            data: monthlySummary.map(c => c.total || 0),
            backgroundColor: monthlySummary.map(c => c.color),
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const chartOptions = {
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? '#0f172a' : '#1e293b',
                titleFont: { family: 'Inter' },
                bodyFont: { family: 'Inter' }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('expenses.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('expenses.subtitle')}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <Settings size={20} />
                        {t('expenses.categories_btn')}
                    </button>

                    <button
                        onClick={() => handleOpenModal()}
                        className="btn btn-primary flex items-center gap-2 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 border-none"
                    >
                        <Plus size={20} />
                        {t('expenses.add_expense')}
                    </button>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expense Breakdown */}
                <div className="lg:col-span-1 card flex flex-col items-center h-fit">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white self-start mb-6 font-primary flex items-center gap-2">
                        <PieChart size={20} className="text-primary-500" />
                        {t('expenses.total_expense_month', { month: new Date().toLocaleString(t('i18n_lang', 'en-US'), { month: 'long' }) })}
                    </h2>

                    <div className="relative w-48 h-48 mb-6">
                        {monthlySummary.length > 0 ? (
                            <Doughnut data={chartData} options={chartOptions} />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-full">
                                <span className="text-xs text-slate-400">{t('expenses.no_data')}</span>
                            </div>
                        )}

                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{t('expenses.this_month')}</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(totalSpent)}</span>
                        </div>

                    </div>
                    <div className="w-full space-y-3">
                        {monthlySummary.map((c) => (
                            <div key={c.id} className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatCurrency(c.total)}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-1000"
                                        style={{
                                            backgroundColor: c.color,
                                            width: `${totalSpent > 0 ? (c.total / totalSpent) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card !p-0 overflow-hidden min-h-[500px]">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('expenses.recent_expenses')}</h2>
                            <div className="relative">

                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder={t('expenses.search_placeholder')}
                                    className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all w-48 sm:w-64"

                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        <th className="px-6 py-4">{t('expenses.table.details')}</th>
                                        <th className="px-6 py-4">{t('expenses.table.category')}</th>
                                        <th className="px-6 py-4">{t('expenses.table.date')}</th>
                                        <th className="px-6 py-4">{t('expenses.table.amount')}</th>
                                        <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="animate-spin text-primary-500" size={32} />
                                                    <span className="text-slate-400 font-medium">{t('common.loading')}</span>
                                                </div>

                                            </td>
                                        </tr>
                                    ) : filteredExpenses.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-medium">
                                                {t('common.no_results')}
                                            </td>
                                        </tr>

                                    ) : (
                                        filteredExpenses.map((exp) => (
                                            <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900 dark:text-slate-100">{exp.description || t('expenses.table.general_expense')}</p>
                                                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">ID: {exp.id} • {exp.payment_method}</p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className="text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
                                                        style={{ backgroundColor: exp.category_color }}
                                                    >
                                                        {exp.category_name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} />
                                                        {new Date(exp.date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-black text-red-600">-{formatCurrency(exp.amount)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            onClick={() => handleOpenModal(exp)}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(exp)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination
                        total={totalRecords}
                        limit={limit}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            {/* Modal for Categories Management */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                        onClick={() => setIsCategoryModalOpen(false)}
                    ></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('expenses.categories_modal.title')}</h3>
                                <p className="text-xs text-slate-500">{t('expenses.categories_modal.subtitle')}</p>
                            </div>

                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <form onSubmit={handleCategorySubmit} className="space-y-4">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest border-l-4 border-primary-500 pl-3">{t('expenses.categories_modal.add_category')}</h4>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('expenses.categories_modal.category_name')}</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder={t('expenses.categories_modal.category_placeholder')}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                                        value={categoryFormData.name}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('expenses.categories_modal.color_theme')}</label>

                                    <div className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                        {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'].map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setCategoryFormData({ ...categoryFormData, color })}
                                                className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 shadow-sm ${categoryFormData.color === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                        <input
                                            type="color"
                                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                                            value={categoryFormData.color}
                                            onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full btn btn-primary flex items-center justify-center gap-2 py-3"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    {t('expenses.categories_modal.create_btn')}
                                </button>

                            </form>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest border-l-4 border-slate-300 pl-3">{t('expenses.categories_modal.active_categories')}</h4>
                                <div className="space-y-2 h-[250px] overflow-y-auto pr-2 custom-scrollbar">

                                    {categories.map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-inner" style={{ backgroundColor: cat.color }}>
                                                    {cat.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-slate-100">{cat.name}</p>
                                                    <p className="text-[10px] text-slate-400">{t('expenses.categories_modal.created_on', { date: new Date(cat.created_at).toLocaleDateString() })}</p>
                                                </div>

                                            </div>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Add/Edit Expense */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {selectedExpense ? t('expenses.modal.edit_title') : t('expenses.modal.add_title')}
                            </h3>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-5">
                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('expenses.modal.description_label')}</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder={t('expenses.modal.description_placeholder')}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"

                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('expenses.modal.category_label')}</label>

                                            <select
                                                required
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-slate-900 dark:text-slate-100 font-medium transition-all"
                                                value={formData.category_id}
                                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            >
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1">
                                                <DollarSign size={10} /> {t('expenses.modal.amount_label')}
                                            </label>

                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-black"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('expenses.modal.date_label')}</label>

                                            <input
                                                required
                                                type="date"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-medium"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('expenses.modal.payment_method')}</label>

                                            <select
                                                required
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-slate-900 dark:text-slate-100 font-medium"
                                                value={formData.payment_method}
                                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                            >
                                                <option value="Credit Card">{t('expenses.methods.credit_card') || 'Credit Card'}</option>
                                                <option value="Bank Transfer">{t('expenses.methods.bank_transfer') || 'Bank Transfer'}</option>
                                                <option value="PayPal">{t('expenses.methods.paypal') || 'PayPal'}</option>
                                                <option value="Cash">{t('expenses.methods.cash') || 'Cash'}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn btn-primary px-8 flex items-center gap-2 bg-red-600 hover:bg-red-700 border-none"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (selectedExpense ? <CheckCircle2 size={18} /> : <Plus size={18} />)}
                                    {selectedExpense ? t('expenses.modal.update_btn') : t('expenses.modal.save_btn')}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Expense Confirmation */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                title={t('expenses.delete.title')}
                message={t('expenses.delete.confirm_text')}
                confirmText={t('expenses.delete.delete_btn')}
                loading={submitting}
            />

            {/* Delete Category Confirmation */}
            <ConfirmationModal
                isOpen={deleteCatModal.isOpen}
                onConfirm={confirmDeleteCategory}
                onCancel={() => setDeleteCatModal({ isOpen: false, categoryId: null })}
                title={t('expenses.delete_category.title')}
                message={t('expenses.delete_category.confirm_text')}
                confirmText={t('expenses.delete_category.delete_btn')}
                loading={submitting}
            />

        </div>
    );
};

export default Expenses;
