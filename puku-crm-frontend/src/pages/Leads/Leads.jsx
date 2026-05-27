import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    Building2,
    CheckCircle2,
    Edit2,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Plus,
    Search,
    Trash2,
    X
} from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const emptyForm = {
    name: '',
    phone: '',
    email: '',
    source: '',
    propertyType: '',
    specificProperty: '',
    budget: '',
    preferredState: '',
    preferredCity: '',
    assignedTo: '',
    enquiryType: 'Tele',
    note: ''
};

const sourceOptions = ['Website', 'Facebook', 'Instagram', 'Referral', 'Walk-in', 'Phone Call', 'Advertisement'];
const propertyTypeOptions = [
    { value: 'plot', label: 'Plot' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'joint_venture', label: 'Joint Venture' },
    { value: 'rental', label: 'Rental' }
];

const inputClass = 'w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100';
const selectClass = `${inputClass} appearance-none cursor-pointer`;

const Leads = () => {
    const { showToast } = useToast();
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [leads, setLeads] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [properties, setProperties] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState(emptyForm);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchLeads(currentPage);
    }, [currentPage]);

    useEffect(() => {
        fetchFormOptions();
    }, []);

    useEffect(() => {
        if (!formData.preferredState) {
            setCities([]);
            return;
        }
        fetchCities(formData.preferredState);
    }, [formData.preferredState]);

    useEffect(() => {
        if (!cities.length || !formData.preferredCity) return;
        const cityExists = cities.some(city => String(city.id) === String(formData.preferredCity));
        if (cityExists) return;

        const matchingCity = cities.find(city => city.city_name === formData.preferredCity);
        if (matchingCity) {
            setFormData(prev => ({ ...prev, preferredCity: matchingCity.id }));
        }
    }, [cities, formData.preferredCity]);

    // const selectedStateName = useMemo(() => {
    //     return states.find(state => String(state.id) === String(formData.preferredState))?.state_name || formData.preferredState;
    // }, [states, formData.preferredState]);

    // const selectedCityName = useMemo(() => {
    //     return cities.find(city => String(city.id) === String(formData.preferredCity))?.city_name || formData.preferredCity;
    // }, [cities, formData.preferredCity]);

    const filteredProperties = useMemo(() => {
        if (!formData.propertyType) return properties;
        return properties.filter(property => property.property_type === formData.propertyType);
    }, [properties, formData.propertyType]);

    const fetchLeads = async (page = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/leads?page=${page}&limit=${limit}`);
            setLeads(res.data.leads || []);
            setTotalRecords(res.data.total || 0);
        } catch {
            showToast(t('leads.loading_error') || 'Failed to fetch leads', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchFormOptions = async () => {
        const [statesRes, propertiesRes, usersRes] = await Promise.allSettled([
            api.get('/states'),
            api.get('/properties'),
            api.get('/users')
        ]);

        if (statesRes.status === 'fulfilled') setStates(statesRes.value.data.states || []);
        if (propertiesRes.status === 'fulfilled') setProperties(propertiesRes.value.data.properties || []);
        if (usersRes.status === 'fulfilled') {
            setUsers(usersRes.value.data.users || []);
        } else if (currentUser?.name) {
            setUsers([{ id: currentUser.id || currentUser.name, name: currentUser.name }]);
        }
    };

    const fetchCities = async (stateId) => {
        try {
            const res = await api.get(`/cities/state/${stateId}`);
            setCities(res.data.cities || []);
        } catch {
            setCities([]);
        }
    };

    const handleOpenModal = (lead = null) => {
        if (lead) {
            const matchingState = states.find(state => state.state_name === lead.preferredState);
            setSelectedLead(lead);
            setFormData({
                name: lead.name || '',
                phone: lead.phone || '',
                email: lead.email || '',
                source: lead.source || '',
                propertyType: lead.propertyType || '',
                specificProperty: lead.specificProperty || '',
                budget: lead.budget || '',
                preferredState: matchingState?.id || lead.preferredState || '',
                preferredCity: lead.preferredCity || '',
                assignedTo: lead.assignedTo || '',
                enquiryType: lead.enquiryType || 'Tele',
                note: lead.note || ''
            });
        } else {
            setSelectedLead(null);
            setFormData(emptyForm);
        }
        setError('');
        setIsModalOpen(true);
    };

    const handleChange = (field, value) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'propertyType') next.specificProperty = '';
            if (field === 'preferredState') next.preferredCity = '';
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        // const payload = {
        //     ...formData,
        //     preferredState: selectedStateName,
        //     preferredCity: selectedCityName
        // };

        try {
            if (selectedLead) {
                await api.put(`/leads/${selectedLead.id}`, formData);
                showToast(t('leads.update_success') || 'Lead updated successfully!', 'success');
            } else {
                await api.post('/leads', formData);
                showToast(t('leads.add_success') || 'Lead created successfully!', 'success');
            }
            setIsModalOpen(false);
            fetchLeads(currentPage);
        } catch (err) {
            setError(err.response?.data?.message || t('common.error'));
            showToast(t('leads.save_error') || 'Failed to save lead', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (lead) => {
        setSelectedLead(lead);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/leads/${selectedLead.id}`);
            showToast(t('leads.delete_success') || 'Lead deleted successfully', 'success');
            setIsDeleteModalOpen(false);
            fetchLeads(currentPage);
        } catch {
            showToast(t('leads.delete_error') || 'Failed to delete lead', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const haystack = [
            lead.name,
            lead.phone,
            lead.email,
            lead.source,
            lead.propertyType,
            lead.specificProperty,
            lead.preferredState,
            lead.preferredCity,
            lead.assignedTo,
            lead.enquiryType
        ].filter(Boolean).join(' ').toLowerCase();

        return haystack.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('leads.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('leads.subtitle')}</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    {t('leads.add_new')}
                </button>
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('leads.search_placeholder')}
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
                                <th className="px-6 py-4">{t('leads.table.client')}</th>
                                <th className="px-6 py-4">{t('leads.table.enquiry')}</th>
                                <th className="px-6 py-4">{t('leads.table.location')}</th>
                                <th className="px-6 py-4">{t('leads.table.assigned_to')}</th>
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
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">{t('common.no_results')}</td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center font-bold">
                                                    {lead.name?.charAt(0) || 'L'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{lead.name}</p>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                                                        {lead.phone && <span className="inline-flex items-center gap-1"><Phone size={12} />{lead.phone}</span>}
                                                        {lead.email && <span className="inline-flex items-center gap-1"><Mail size={12} />{lead.email}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">{lead.specificProperty || lead.propertyType || 'Property'}</p>
                                            <p className="text-xs text-slate-500 mt-1">{lead.source || 'Source'} • {lead.enquiryType || 'Tele'} • {lead.budget || 'Budget not set'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{[lead.city_name, lead.state_name].filter(Boolean).join(', ') || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">{lead.assigned_user_name || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenModal(lead)} className="p-2 transition-all rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteClick(lead)} className="p-2 transition-all rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
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

            <Pagination total={totalRecords} limit={limit} currentPage={currentPage} onPageChange={setCurrentPage} />

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {selectedLead ? t('leads.modal.edit_title') : t('leads.modal.add_title')}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh]">
                            <div className="p-6 space-y-7">
                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                                        {error}
                                    </div>
                                )}

                                <section className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Client Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {t('leads.modal.client_name_label')} <span className="text-red-500">*</span>
                                            <input required type="text" placeholder={t('leads.modal.client_name_placeholder')} className={`${inputClass} mt-1.5`} value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
                                        </label>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {t('leads.modal.phone_label')} <span className="text-red-500">*</span>
                                            <input required type="tel" placeholder={t('leads.modal.phone_Placeholder')} className={`${inputClass} mt-1.5`} value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                                        </label>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {t('leads.modal.email_label')}
                                            <input type="email" placeholder={t('leads.modal.email_placeholder')} className={`${inputClass} mt-1.5`} value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                                        </label>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Enquiry Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {t('leads.modal.source_label')} <span className="text-red-500">*</span>
                                            <select required className={`${selectClass} mt-1.5`} value={formData.source} onChange={(e) => handleChange('source', e.target.value)}>
                                                <option value="">{t('leads.modal.source_select')}</option>
                                                {sourceOptions.map(source => <option key={source} value={source.id}>{source}</option>)}
                                            </select>
                                        </label>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {t('leads.modal.property_type_label')} <span className="text-red-500">*</span>
                                            <select required className={`${selectClass} mt-1.5`} value={formData.propertyType} onChange={(e) => handleChange('propertyType', e.target.value)}>
                                                <option value="">{t('leads.modal.property_type_select')}</option>
                                                {propertyTypeOptions.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                                            </select>
                                        </label>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {t('leads.modal.specific_property_label')}
                                            <select className={`${selectClass} mt-1.5`} value={formData.specificProperty} onChange={(e) => handleChange('specificProperty', e.target.value)}>
                                                <option value="">{t('leads.modal.specific_property_select')}</option>
                                                {filteredProperties.map(property => <option key={property.id} value={property.property_name}>{property.property_name}</option>)}
                                            </select>
                                        </label>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {t('leads.modal.budget')}
                                            <input type="text" placeholder="e.g. 80L - 1 Cr" className={`${inputClass} mt-1.5`} value={formData.budget} onChange={(e) => handleChange('budget', e.target.value)} />
                                        </label>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {t('leads.modal.preferred_state_label')}
                                            <select className={`${selectClass} mt-1.5`} value={formData.preferredState} onChange={(e) => handleChange('preferredState', e.target.value)}>
                                                <option value="">{t('leads.modal.preferred_state_select')}</option>
                                                {states.map(state => <option key={state.id} value={state.id}>{state.state_name}</option>)}
                                            </select>
                                        </label>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {t('leads.modal.preferred_city_label')}
                                            <select className={`${selectClass} mt-1.5`} value={formData.preferredCity} disabled={!formData.preferredState} onChange={(e) => handleChange('preferredCity', e.target.value)}>
                                                <option value="">{formData.preferredState ? t('leads.modal.preferred_city_select') : t('leads.modal.preferred_state_first_select')}</option>
                                                {cities.map(city => <option key={city.id} value={city.id}>{city.city_name}</option>)}
                                            </select>
                                        </label>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                           {t('leads.modal.assign_to_label')} <span className="text-red-500">*</span>
                                            <select required className={`${selectClass} mt-1.5`} value={formData.assignedTo} onChange={(e) => handleChange('assignedTo', e.target.value)}>
                                                <option value="">{t('leads.modal.assign_to_select')}</option>
                                                {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                            </select>
                                        </label>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Enquiry Type</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                                        {[
                                            { value: 'Tele', title: 'Tele', subtitle: 'Telecalling enquiry', icon: Phone },
                                            { value: 'Sales', title: 'Sales', subtitle: 'Walk-in / Direct sales', icon: Building2 }
                                        ].map(option => {
                                            const Icon = option.icon;
                                            const active = formData.enquiryType === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => handleChange('enquiryType', option.value)}
                                                    className={`min-h-16 rounded-xl border p-4 text-left flex items-center gap-3 transition-all ${active ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-300'}`}
                                                >
                                                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${active ? 'border-primary-600' : 'border-slate-400'}`}>
                                                        {active && <span className="w-2 h-2 rounded-full bg-primary-600"></span>}
                                                    </span>
                                                    <Icon size={18} />
                                                    <span>
                                                        <span className="block text-sm font-bold">{option.title}</span>
                                                        <span className="block text-xs text-slate-500 dark:text-slate-400">{option.subtitle}</span>
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t('leads.modal.notes_label')}</h4>
                                    <textarea rows="4" placeholder={t('leads.modal.notes_placeholder')} className={`${inputClass} resize-none`} value={formData.note} onChange={(e) => handleChange('note', e.target.value)}></textarea>
                                </section>
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 sticky bottom-0">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">{t('common.cancel')}</button>
                                <button type="submit" disabled={submitting} className="btn btn-primary flex items-center gap-2">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (selectedLead ? <CheckCircle2 size={18} /> : <Plus size={18} />)}
                                    {selectedLead ? t('leads.modal.update_btn') : t('leads.modal.create_btn')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center text-slate-900 dark:text-white">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t('leads.delete.title')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 font-semibold">
                                <Trans i18nKey="leads.delete.confirm_text" values={{ opportunity: selectedLead?.name }}>
                                    Are you sure you want to delete <span className="text-slate-900 dark:text-white font-bold">{selectedLead?.name}</span>? This action cannot be undone.
                                </Trans>
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    {t('common.cancel')}
                                </button>
                                <button onClick={confirmDelete} disabled={submitting} className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;
