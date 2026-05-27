import React, { useState, useEffect } from 'react';
import {
    Package,
    Search,
    Plus,
    AlertTriangle,
    TrendingUp,
    History,
    MoreVertical,
    MinusCircle,
    PlusCircle,
    X,
    Loader2,
    DollarSign,
    Box,
    Edit2,
    Trash2,
    CheckCircle2,
    Settings
} from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';

const Stock = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const settingsContext = useSettings();
    const formatCurrency = settingsContext?.formatCurrency;
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [allCategories, setAllCategories] = useState([]);
    const [categorySubmitting, setCategorySubmitting] = useState(false);
    const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '', color: '#3b82f6' });
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteModalConfig, setDeleteModalConfig] = useState({ isOpen: false, categoryId: null });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;

    const [formData, setFormData] = useState({
        name: '',
        category: 'Electronics',
        sku: '',
        quantity: 0,
        unit_price: 0,
        description: ''
    });

    useEffect(() => {
        fetchInventory(currentPage);
        fetchCategories();
    }, [currentPage]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/stock-categories');
            if (res.data.categories) {
                setAllCategories(res.data.categories);
                setCategories(res.data.categories.map(c => c.name));
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const handleOpenCategoryModal = () => {
        setEditingCategory(null);
        setCategoryFormData({ name: '', description: '', color: '#3b82f6' });
        setIsCategoryModalOpen(true);
    };

    const handleEditCategory = (cat) => {
        setEditingCategory(cat);
        setCategoryFormData({
            name: cat.name,
            description: cat.description || '',
            color: cat.color || '#3b82f6'
        });
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        setCategorySubmitting(true);
        try {
            if (editingCategory) {
                await api.put(`/stock-categories/${editingCategory.id}`, categoryFormData);
                showToast(t('stock.category_modal.edit_category_success'), 'success');
            } else {
                await api.post('/stock-categories', categoryFormData);
                showToast(t('stock.category_modal.add_category_success'), 'success');
            }
            setEditingCategory(null);
            setCategoryFormData({ name: '', description: '', color: '#3b82f6' });
            fetchCategories();
        } catch (err) {
            showToast(t('common.error') || 'Failed to save category', 'error');
        } finally {
            setCategorySubmitting(false);
        }
    };

    const handleDeleteCategory = (id) => {
        setDeleteModalConfig({ isOpen: true, categoryId: id });
    };

    const confirmDeleteCategory = async () => {
        const id = deleteModalConfig.categoryId;
        setSubmitting(true);
        try {
            await api.delete(`/stock-categories/${id}`);
            showToast(t('stock.category_modal.deleted_success') || 'Category deleted successfully!', 'success');
            setDeleteModalConfig({ isOpen: false, categoryId: null });
            fetchCategories();
        } catch (err) {
            showToast(err.response?.data?.message || t('stock.category_modal.delete_category_error'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const fetchInventory = async (page = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/stock?page=${page}&limit=${limit}`);
            setInventory(res.data.inventory || []);
            setTotalRecords(res.data.total || 0);
        } catch (err) {
            showToast(t('stock.loading_error') || 'Failed to fetch inventory', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setSelectedItem(item);
            setFormData({
                name: item.name,
                category: item.category,
                sku: item.sku,
                quantity: item.quantity,
                unit_price: item.unit_price,
                description: item.description || ''
            });
        } else {
            setSelectedItem(null);
            setFormData({
                name: '',
                category: categories[0] || '',
                sku: `SKU-${Date.now().toString().slice(-6)}`,
                quantity: 0,
                unit_price: 0,
                description: ''
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
            if (selectedItem) {
                await api.put(`/stock/${selectedItem.id}`, formData);
                showToast(t('stock.update_success') || 'Item updated successfully!', 'success');
            } else {
                await api.post('/stock', formData);
                showToast(t('stock.add_success') || 'Item added to inventory!', 'success');
            }
            setIsModalOpen(false);
            fetchInventory();
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || t('common.error'));
            showToast(t('stock.save_error') || 'Failed to save item', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickAdjustment = async (item, adjustment) => {
        const newLevel = item.quantity + adjustment;
        if (newLevel < 0) return;

        try {
            await api.put(`/stock/${item.id}`, {
                ...item,
                quantity: newLevel
            });
            fetchInventory();
        } catch (err) {
            showToast(t('stock.adjust_error') || 'Failed to adjust stock', 'error');
        }
    };

    const handleDeleteClick = (item) => {
        setSelectedItem(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/stock/${selectedItem.id}`);
            showToast(t('stock.delete_success') || 'Item removed from inventory', 'success');
            setIsDeleteModalOpen(false);
            fetchInventory();
        } catch (err) {
            showToast(t('stock.delete_error') || 'Failed to delete item', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalValue = inventory.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const lowStockCount = inventory.filter(item => item.quantity <= 5).length;
    const totalItems = inventory.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('stock.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('stock.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleOpenCategoryModal}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <Settings size={20} />
                        {t('stock.categories_btn')}
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        {t('stock.add_item')}
                    </button>
                </div>
            </div>

            {/* Stock Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card group hover:border-primary-500 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                            <Box size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('stock.total_units')}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalItems.toLocaleString()}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 flex justify-between">
                        <span>{t('stock.across_categories', { count: new Set(inventory.map(i => i.category)).size })}</span>
                    </p>
                </div>
                <div className="card group hover:border-red-500 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl group-hover:scale-110 transition-transform">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('stock.low_stock_alerts')}</p>
                            <h3 className="text-2xl font-bold text-red-600 dark:text-red-500">{lowStockCount} {t('stock.items')}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-red-500 mt-4 font-bold flex items-center gap-1">
                        {t('stock.requires_restock')}
                    </p>
                </div>
                <div className="card group hover:border-green-500 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('stock.inventory_value')}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency ? formatCurrency(totalValue) : `$${totalValue.toLocaleString()}`}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-green-600 mt-4 font-bold flex justify-between">
                        <span>{t('stock.asset_valuation')}</span>
                        <span>↑ 12%</span>
                    </p>
                </div>
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('stock.search_placeholder')}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">
                                <th className="px-6 py-4">{t('stock.table.item_details')}</th>
                                <th className="px-6 py-4">{t('stock.table.category')}</th>
                                <th className="px-6 py-4">{t('stock.table.quantity')}</th>
                                <th className="px-6 py-4">{t('stock.table.unit_price')}</th>
                                <th className="px-6 py-4">{t('stock.table.total_value')}</th>
                                <th className="px-6 py-4 text-center">{t('stock.table.status')}</th>
                                <th className="px-6 py-4 text-right">{t('stock.table.actions') || t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 size={32} className="animate-spin text-primary-500" />
                                            <span>{t('stock.loading')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                        {t('stock.no_items')}
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{item.name}</p>
                                                    <p className="text-xs font-mono text-slate-400 mt-1">{item.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-600 dark:text-slate-400">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-lg font-bold ${item.quantity <= 5 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                                    {item.quantity}
                                                </span>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleQuickAdjustment(item, -1)}
                                                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <MinusCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleQuickAdjustment(item, 1)}
                                                        className="p-1 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                    >
                                                        <PlusCircle size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                                            {formatCurrency ? formatCurrency(item.unit_price) : `$${parseFloat(item.unit_price).toFixed(2)}`}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {formatCurrency ? formatCurrency(item.quantity * item.unit_price) : `$${(item.quantity * item.unit_price).toLocaleString()}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${item.quantity === 0 ? 'bg-red-100 text-red-700 border-red-200' :
                                                    item.quantity <= 5 ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                        'bg-green-100 text-green-700 border-green-200'
                                                    }`}>
                                                    {item.quantity === 0 ? t('stock.status.out_of_stock') : item.quantity <= 5 ? t('stock.status.low_stock') : t('stock.status.in_stock')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-900 dark:text-white">
                                            <div className="flex justify-end gap-2 text-slate-900 dark:text-white">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 transition-all rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="p-2 transition-all rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 size={18} />
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

            {/* Modal for Add/Edit Item */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {selectedItem ? t('stock.modal.edit_title') : t('stock.modal.add_title')}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh]">
                            <div className="p-6 space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                            <Package size={16} className="text-primary-500" />
                                            {t('stock.modal.product_name')}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. MacBook Pro M3"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                            <Box size={16} className="text-primary-500" />
                                            {t('stock.modal.category')}
                                        </label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('stock.modal.sku_code')}</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="SKU-XXXXXX"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={formData.sku}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('stock.table.quantity')}</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="0"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('stock.modal.unit_price')}</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            placeholder="0.00"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={formData.unit_price}
                                            onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('stock.modal.description')}</label>
                                        <textarea
                                            rows="3"
                                            placeholder={t('stock.modal.description_placeholder')}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 resize-none"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 sticky bottom-0">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn btn-secondary"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (selectedItem ? <CheckCircle2 size={18} /> : <Plus size={18} />)}
                                    {selectedItem ? t('stock.modal.update_btn') : t('stock.modal.create_btn')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsDeleteModalOpen(false)}
                    ></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center text-slate-900 dark:text-white">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t('stock.delete.title')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-semibold">
                                <Trans i18nKey="stock.delete.confirm_text" values={{ name: selectedItem?.name }}>
                                    Are you sure you want to remove <span className="text-slate-900 dark:text-white font-bold">{{ name: selectedItem?.name }}</span> from inventory? This action cannot be undone.
                                </Trans>
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={submitting}
                                    className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 font-bold"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    {t('stock.delete.delete_btn')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Category Management Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('stock.category_modal.title')}</h3>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleCategorySubmit} className="mb-8 space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                                    {editingCategory ? t('stock.category_modal.edit_category') : t('stock.category_modal.add_new_category')}
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <input
                                        type="text"
                                        required
                                        placeholder={t('stock.category_modal.category_name')}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                                        value={categoryFormData.name}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    />
                                    <textarea
                                        placeholder={t('stock.category_modal.description')}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                        rows="2"
                                        value={categoryFormData.description}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                    ></textarea>
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm font-medium text-slate-500">{t('stock.category_modal.color_tag')}</label>
                                        <input
                                            type="color"
                                            className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                                            value={categoryFormData.color}
                                            onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                                        />
                                        <button
                                            type="submit"
                                            disabled={categorySubmitting}
                                            className="btn btn-primary flex-1 py-2 flex items-center justify-center gap-2"
                                        >
                                            {categorySubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingCategory ? <CheckCircle2 size={18} /> : <Plus size={18} />)}
                                            {editingCategory ? t('stock.category_modal.update_btn') : t('stock.category_modal.add_btn')}
                                        </button>
                                        {editingCategory && (
                                            <button type="button" onClick={() => { setEditingCategory(null); setCategoryFormData({ name: '', description: '', color: '#3b82f6' }) }} className="btn btn-secondary py-2">{t('common.cancel')}</button>
                                        )}
                                    </div>
                                </div>
                            </form>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{t('stock.category_modal.existing_categories')}</h4>
                                {allCategories.length === 0 ? (
                                    <p className="text-center text-slate-400 py-4">{t('stock.category_modal.no_categories')}</p>
                                ) : (
                                    allCategories.map((cat) => (
                                        <div key={cat.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-primary-200 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{cat.name}</p>
                                                    {cat.description && <p className="text-xs text-slate-500 line-clamp-1">{cat.description}</p>}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditCategory(cat)} className="p-2 text-slate-400 hover:text-primary-600 rounded-lg">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Category Delete Modal */}
            <ConfirmationModal
                isOpen={deleteModalConfig.isOpen}
                onConfirm={confirmDeleteCategory}
                onCancel={() => setDeleteModalConfig({ isOpen: false, categoryId: null })}
                title={t('stock.delete_category.title') || t('stock.delete.title')}
                message={t('stock.delete_category.confirm_text') || "Are you sure? This won't delete items, but they will lose their category association."}
                confirmText={t('stock.delete_category.delete_btn') || "Delete Category"}
                loading={submitting}
            />
        </div>
    );
};

export default Stock;
