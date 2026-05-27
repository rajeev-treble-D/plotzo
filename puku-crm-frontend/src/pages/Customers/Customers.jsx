import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Edit2,
    Trash2,
    Mail,
    Phone,
    Globe,
    User,
    Loader2,
    X,
    CheckCircle2,
    AlertTriangle,
    MapPin
} from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { useToast } from '../../context/ToastContext';

import api from '../../services/api';
import Pagination from '../../components/Pagination';
import CustomerDetailsModal from '../../components/CustomerDetailsModal';

const Customers = () => {
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;

    // Drill-down state
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [drillDownCustomerId, setDrillDownCustomerId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'Active',
        address: '',
        city: '',
        country: ''
    });

    useEffect(() => {
        fetchCustomers(currentPage);
    }, [currentPage]);

    const fetchCustomers = async (page = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/customers?page=${page}&limit=${limit}`);
            setCustomers(res.data.customers);
            setTotalRecords(res.data.total);
        } catch (err) {
            showToast(t('customers.loading_error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleOpenModal = (customer = null) => {
        if (customer) {
            setSelectedCustomer(customer);
            setFormData({
                name: customer.name,
                email: customer.email,
                phone: customer.phone || '',
                company: customer.company || '',
                status: customer.status,
                address: customer.address || '',
                city: customer.city || '',
                country: customer.country || ''
            });
        } else {
            setSelectedCustomer(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                status: 'Active',
                address: '',
                city: '',
                country: ''
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
            if (selectedCustomer) {
                await api.put(`/customers/${selectedCustomer.id}`, formData);
                showToast(t('customers.update_success'), 'success');
            } else {
                await api.post('/customers', formData);
                showToast(t('customers.add_success'), 'success');
            }
            setIsModalOpen(false);
            fetchCustomers();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (customer) => {
        setSelectedCustomer(customer);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/customers/${selectedCustomer.id}`);
            showToast(t('customers.delete_success'), 'success');
            setIsDeleteModalOpen(false);
            fetchCustomers();
        } catch (err) {
            showToast(t('customers.delete_error'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCustomerClick = (id) => {
        setDrillDownCustomerId(id);
        setIsDetailsModalOpen(true);
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('customers.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('customers.subtitle')}</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    {t('customers.add_new')}
                </button>

            </div>

            <div className="card !p-0 overflow-hidden">
                {/* Table Filters */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('customers.search_placeholder')}
                            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">
                                <th className="px-6 py-4">{t('customers.table.customer')}</th>
                                <th className="px-6 py-4">{t('customers.table.company')}</th>
                                <th className="px-6 py-4">{t('customers.table.contact')}</th>
                                <th className="px-6 py-4">{t('customers.table.status')}</th>
                                <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 size={32} className="animate-spin text-primary-500" />
                                            <span>{t('common.loading')}</span>
                                        </div>
                                    </td>

                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        {t('common.no_results')}
                                    </td>
                                </tr>

                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold cursor-pointer hover:scale-110 transition-transform"
                                                    onClick={() => handleCustomerClick(customer.id)}
                                                >
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p
                                                        className="font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:text-primary-600 transition-colors"
                                                        onClick={() => handleCustomerClick(customer.id)}
                                                    >
                                                        {customer.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {t('customers.table.added_on', { date: new Date(customer.created_at).toLocaleDateString() })}
                                                    </p>
                                                </div>

                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{customer.company || t('common.na') || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <Mail size={14} className="text-slate-400" />
                                                    {customer.email}
                                                </div>
                                                {customer.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                        <Phone size={14} className="text-slate-400" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                customer.status === 'Lead' ? 'bg-blue-100 text-blue-700' :
                                                    customer.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {t(`customers.status.${customer.status.toLowerCase()}`) || customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(customer)}
                                                    className="p-2 transition-all rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(customer)}
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

            {/* Add/Edit Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {selectedCustomer ? t('customers.modal.edit_title') : t('customers.modal.add_title')}
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

                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                            <User size={16} className="text-primary-500" />
                                            {t('customers.modal.full_name')}
                                        </label>

                                        <input
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                            <Mail size={16} className="text-primary-500" />
                                            {t('customers.modal.email')}
                                        </label>

                                        <input
                                            type="email"
                                            required
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                            <Phone size={16} className="text-primary-500" />
                                            {t('customers.modal.phone')}
                                        </label>

                                        <input
                                            type="tel"
                                            placeholder="+1 234 567 890"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                            <Globe size={16} className="text-primary-500" />
                                            {t('customers.modal.company')}
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="Acme Inc"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('customers.modal.status')}</label>

                                        <select
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-slate-900 dark:text-slate-100"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="Active">{t('customers.status.active') || 'Active'}</option>
                                            <option value="Pending">{t('customers.status.pending') || 'Pending'}</option>
                                            <option value="Inactive">{t('customers.status.inactive') || 'Inactive'}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Location Info */}
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('customers.modal.location_details')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                                <MapPin size={16} className="text-primary-500" />
                                                {t('customers.modal.address')}
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="123 Main St"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('customers.modal.city')}</label>

                                            <input
                                                type="text"
                                                placeholder="New York"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('customers.modal.country')}</label>

                                            <input
                                                type="text"
                                                placeholder="USA"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            />
                                        </div>
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
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (selectedCustomer ? <CheckCircle2 size={18} /> : <Plus size={18} />)}
                                    {selectedCustomer ? t('customers.modal.update_btn') : t('customers.modal.create_btn')}
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
                            <h3 className="text-xl font-bold mb-2">{t('customers.delete.title')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-semibold">
                                <Trans i18nKey="customers.delete.confirm_text" values={{ name: selectedCustomer?.name }}>
                                    Are you sure you want to delete <span className="text-slate-900 dark:text-white font-bold">{selectedCustomer?.name}</span>? This action will permanently remove all associated data.
                                </Trans>
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
                                    {t('customers.delete.delete_now')}
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Details Drill-down Modal */}
            <CustomerDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                customerId={drillDownCustomerId}
            />
        </div>
    );
};

export default Customers;
