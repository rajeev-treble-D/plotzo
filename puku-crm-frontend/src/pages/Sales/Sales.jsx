import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Search,
    Download,
    Plus,
    ArrowUpRight,
    Filter,
    CreditCard,
    Banknote,
    MoreHorizontal,
    X,
    Loader2,
    Calendar,
    DollarSign,
    Trash2,
    Edit2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';

import { useSettings } from '../../context/SettingsContext';
import api from '../../services/api';
import Pagination from '../../components/Pagination';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Sales = () => {
    const { showToast } = useToast();
    const { formatCurrency, settings: globalSettings } = useSettings();
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [sales, setSales] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [settings, setSettings] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;

    const [formData, setFormData] = useState({
        customer_id: '',
        amount: 0,
        status: 'Pending',
        payment_method: 'Bank Transfer',
        description: ''
    });

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            const [salesRes, customersRes, settingsRes] = await Promise.all([
                api.get(`/sales?page=${page}&limit=${limit}`),
                api.get('/customers'),
                api.get('/settings')
            ]);
            setSales(salesRes.data.sales || []);
            setTotalRecords(salesRes.data.total || 0);
            setCustomers(customersRes.data.customers || []);
            setSettings(settingsRes.data);
        } catch (err) {
            showToast(t('sales.loading_error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleOpenModal = (sale = null) => {
        if (sale) {
            setSelectedSale(sale);
            setFormData({
                customer_id: sale.customer_id,
                amount: sale.amount,
                status: sale.status,
                payment_method: sale.payment_method,
                description: sale.description || ''
            });
        } else {
            setSelectedSale(null);
            setFormData({
                customer_id: '',
                amount: 0,
                status: 'Pending',
                payment_method: 'Bank Transfer',
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
            if (selectedSale) {
                await api.put(`/sales/${selectedSale.id}`, formData);
                showToast(t('sales.update_success'), 'success');
            } else {
                await api.post('/sales', formData);
                showToast(t('sales.add_success'), 'success');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || t('common.error') || 'Something went wrong');
            showToast(t('sales.save_error'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (sale) => {
        setSelectedSale(sale);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/sales/${selectedSale.id}`);
            showToast(t('sales.delete_success'), 'success');
            setIsDeleteModalOpen(false);
            fetchData();
        } catch (err) {
            showToast(t('sales.delete_error'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadInvoice = (sale) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text(settings?.company_name || 'PUKU CRM', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Support: ${settings?.support_email || 'support@puku.com'}`, 14, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);

        // Horizontal Line
        doc.setLineWidth(0.5);
        doc.line(14, 40, 196, 40);

        // Invoice Details
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.text(t('sales.invoice.title'), 14, 50);

        doc.setFontSize(10);
        doc.text(`${t('sales.invoice.id')}: INV-${sale.id}`, 14, 58);
        doc.text(`${t('sales.invoice.date')}: ${new Date(sale.transaction_date).toLocaleDateString()}`, 14, 63);

        // Customer Info
        doc.setFontSize(12);
        doc.text(t('sales.invoice.bill_to'), 14, 75);
        doc.setFontSize(10);
        doc.text(`${t('sales.invoice.cust_name')}: ${sale.customer_name}`, 14, 82);
        doc.text(`${t('sales.invoice.company')}: ${sale.company || 'N/A'}`, 14, 87);

        // Table
        autoTable(doc, {
            startY: 95,
            head: [[t('sales.modal.description'), t('sales.modal.payment_method'), t('common.status'), t('sales.table.amount')]],
            body: [
                [
                    sale.description || t('sales.table.no_description'),
                    sale.payment_method,
                    sale.status,
                    formatCurrency(sale.amount)
                ]
            ],
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] } // primary-600
        });

        // Footer
        const finalY = (doc).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text(`${t('sales.invoice.total')}: ${formatCurrency(sale.amount)}`, 14, finalY);

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(t('sales.invoice.footer'), 105, 285, { align: 'center' });

        doc.save(`invoice_${sale.id}.pdf`);
    };

    const filteredSales = sales.filter(sale =>
        sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = sales
        .filter(s => s.status === 'Completed')
        .reduce((acc, s) => acc + parseFloat(s.amount), 0);

    const pendingAmount = sales
        .filter(s => s.status === 'Pending')
        .reduce((acc, s) => acc + parseFloat(s.amount), 0);

    const avgDealSize = sales.length > 0 ? totalRevenue / sales.length : 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('sales.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('sales.subtitle')}</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn btn-primary flex-1 sm:flex-none flex items-center gap-2"
                    >
                        <Plus size={20} />
                        {t('sales.record_new')}
                    </button>

                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card group hover:border-blue-500 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                            <Banknote size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('sales.total_revenue')}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalRevenue)}</h3>
                        </div>

                    </div>
                </div>
                <div className="card group hover:border-orange-500 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl group-hover:scale-110 transition-transform">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('sales.pending_payments')}</p>
                            <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-500">{formatCurrency(pendingAmount)}</h3>
                        </div>

                    </div>
                </div>
                <div className="card group hover:border-green-500 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl group-hover:scale-110 transition-transform">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('sales.avg_sale_size')}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(avgDealSize)}</h3>
                        </div>

                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="card !p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('sales.search_placeholder')}
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
                                <th className="px-6 py-4">{t('sales.table.transaction_details')}</th>
                                <th className="px-6 py-4">{t('sales.table.customer')}</th>
                                <th className="px-6 py-4">{t('sales.table.date')}</th>
                                <th className="px-6 py-4">{t('sales.table.amount')}</th>
                                <th className="px-6 py-4">{t('sales.table.method')}</th>
                                <th className="px-6 py-4 text-center">{t('sales.table.status')}</th>
                                <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 size={32} className="animate-spin text-primary-500" />
                                            <span>{t('common.loading')}</span>
                                        </div>

                                    </td>
                                </tr>
                            ) : filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                        {t('common.no_results')}
                                    </td>

                                </tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded">
                                                ID-{sale.id}
                                            </span>
                                            <p className="text-xs text-slate-400 mt-1 truncate max-w-[150px]">{sale.description || t('sales.table.no_description')}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{sale.customer_name}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">{t('sales.table.agent', { name: sale.agent_name || 'System' })}</p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                                <Calendar size={14} />
                                                {new Date(sale.transaction_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(sale.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                {sale.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight border ${sale.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    sale.status === 'Pending' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                        'bg-red-100 text-red-700 border-red-200'
                                                    }`}>
                                                    {sale.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 text-primary-500">
                                                <button
                                                    onClick={() => handleDownloadInvoice(sale)}
                                                    title="Download Invoice"
                                                    className="p-2 transition-all rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                >
                                                    <Download size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(sale)}
                                                    className="p-2 transition-all rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(sale)}
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

            {/* Modal for Record Sale */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {selectedSale ? t('sales.modal.edit_title') : t('sales.modal.add_title')}
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
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                            {t('sales.table.customer')}
                                        </label>
                                        <select
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                                            value={formData.customer_id}
                                            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                        >
                                            <option value="">{t('sales.modal.customer_select')}</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                                        </select>
                                    </div>


                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                                <DollarSign size={16} className="text-primary-500" />
                                                {t('sales.modal.amount_label')}
                                            </label>

                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                placeholder="0.00"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('sales.modal.payment_method')}</label>

                                            <select
                                                required
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                                                value={formData.payment_method}
                                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                            >
                                                <option value="Bank Transfer">{t('sales.methods.bank_transfer') || 'Bank Transfer'}</option>
                                                <option value="Credit Card">{t('sales.methods.credit_card') || 'Credit Card'}</option>
                                                <option value="PayPal">{t('sales.methods.paypal') || 'PayPal'}</option>
                                                <option value="Cash">{t('sales.methods.cash') || 'Cash'}</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('common.status')}</label>

                                        <select
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="Pending">{t('common.status_options.pending') || 'Pending'}</option>
                                            <option value="Completed">{t('common.status_options.completed') || 'Completed'}</option>
                                            <option value="Cancelled">{t('common.status_options.cancelled') || 'Cancelled'}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('sales.modal.description')}</label>
                                        <textarea
                                            rows="3"
                                            placeholder={t('sales.modal.description_placeholder')}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 resize-none"

                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transitions-colors"
                                >
                                    {t('common.cancel')}
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn btn-primary px-8 flex items-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (selectedSale ? <CheckCircle2 size={18} /> : <Plus size={18} />)}
                                    {selectedSale ? t('sales.modal.update_btn') : t('sales.modal.save_btn')}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsDeleteModalOpen(false)}
                    ></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center text-slate-900 dark:text-white">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{t('sales.delete.title')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-semibold">
                                {t('sales.delete.confirm_text')}
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    {t('common.cancel')}
                                </button>

                                <button
                                    onClick={confirmDelete}
                                    disabled={submitting}
                                    className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    {t('sales.delete.delete_btn')}
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;
