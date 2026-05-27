import React, { useState, useEffect } from 'react';
import {
    Plus,
    Calendar,
    Search,
    User,
    Clock,
    CheckCircle2,
    Edit2,
    Trash2,
    X,
    Loader2,
    DollarSign,
    Briefcase,
    Filter,
    Check,
    AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';

const Projects = () => {
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [deleteModalConfig, setDeleteModalConfig] = useState({ isOpen: false, projectId: null });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'Planning',
        client_id: '',
        budget: '0.00',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
    });

    useEffect(() => {
        fetchProjects(currentPage);
        fetchCustomers();
    }, [currentPage]);

    const fetchProjects = async (page = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/projects?page=${page}&limit=${limit}`);
            setProjects(res.data.projects || []);
            setTotalRecords(res.data.total || 0);
        } catch (err) {
            showToast(t('projects.loading_error') || 'Failed to fetch projects', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customers');
            setCustomers(res.data.customers || []);
            if (res.data.customers && res.data.customers.length > 0 && !formData.client_id) {
                setFormData(prev => ({ ...prev, client_id: res.data.customers[0].id }));
            }
        } catch (err) {
            console.error('Failed to fetch customers', err);
        }
    };

    const handleOpenModal = (project = null) => {
        if (project) {
            setSelectedProject(project);
            setFormData({
                name: project.name,
                description: project.description || '',
                status: project.status,
                client_id: project.client_id || '',
                budget: project.budget,
                start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
                end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : ''
            });
        } else {
            setSelectedProject(null);
            setFormData({
                name: '',
                description: '',
                status: 'Planning',
                client_id: customers.length > 0 ? customers[0].id : '',
                budget: '0.00',
                start_date: new Date().toISOString().split('T')[0],
                end_date: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (selectedProject) {
                await api.put(`/projects/${selectedProject.id}`, formData);
                showToast(t('projects.update_success') || 'Project updated successfully!', 'success');
            } else {
                await api.post('/projects', formData);
                showToast(t('projects.add_success') || 'Project created successfully!', 'success');
            }
            setIsModalOpen(false);
            fetchProjects();
        } catch (err) {
            showToast(t('projects.save_error') || 'Failed to save project', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteProject = (id) => {
        setDeleteModalConfig({ isOpen: true, projectId: id });
    };

    const confirmDelete = async () => {
        const id = deleteModalConfig.projectId;
        setSubmitting(true);
        try {
            await api.delete(`/projects/${id}`);
            showToast(t('projects.delete_success') || 'Project deleted successfully!', 'success');
            setDeleteModalConfig({ isOpen: false, projectId: null });
            fetchProjects();
        } catch (err) {
            showToast(t('projects.delete_error') || 'Failed to delete project', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'On Hold': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'Planning': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesFilter = filterStatus === 'All' || project.status === filterStatus;
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.client_name && project.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const stats = [
        { label: t('projects.stats.in_progress'), count: projects.filter(p => p.status === 'In Progress').length, color: 'bg-blue-500' },
        { label: t('projects.stats.on_hold'), count: projects.filter(p => p.status === 'On Hold').length, color: 'bg-orange-500' },
        { label: t('projects.stats.completed'), count: projects.filter(p => p.status === 'Completed').length, color: 'bg-green-500' },
        { label: t('projects.stats.total'), count: projects.length, color: 'bg-primary-500' },
    ];


    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('projects.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('projects.subtitle')}</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    {t('projects.create_new')}
                </button>

            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="card !p-4 flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-all">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.count}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                        <div className={`w-12 h-1 ${stat.color} rounded-full mt-3 opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                    </div>
                ))}
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('projects.search_placeholder')}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all font-medium text-sm"

                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                        {['All', 'Planning', 'In Progress', 'On Hold', 'Completed'].map((status, index) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${filterStatus === status
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {t(`projects.filter.${status.toLowerCase().replace(' ', '_')}`)}
                            </button>
                        ))}
                    </div>

                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-primary-500" size={40} />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('common.loading')}</p>
                        </div>

                    ) : filteredProjects.length === 0 ? (
                        <div className="py-20 text-center">
                            <Briefcase size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('common.no_results')}</h3>
                            <p className="text-slate-500 dark:text-slate-400">{t('projects.subtitle')}</p>
                        </div>

                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/10 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4">{t('projects.table.details')}</th>
                                    <th className="px-6 py-4">{t('projects.table.client')}</th>
                                    <th className="px-6 py-4">{t('projects.table.budget')}</th>
                                    <th className="px-6 py-4">{t('projects.table.status')}</th>
                                    <th className="px-6 py-4">{t('projects.table.timeline')}</th>
                                    <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                                </tr>

                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {filteredProjects.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">{p.name}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-widest font-bold">#PROJ-{1000 + p.id}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-sm">
                                                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                                    <User size={14} />
                                                </div>
                                                {p.client_name || 'Individual'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-slate-900 dark:text-white tracking-tight">${parseFloat(p.budget).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyles(p.status)}`}>
                                                {t(`projects.status.${p.status.toLowerCase().replace(' ', '_')}`) || p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1 text-[10px] font-black uppercase tracking-tighter">
                                                <div className="flex items-center gap-2 text-slate-400 transition-colors">
                                                    <Clock size={12} className="text-slate-300" /> {p.start_date ? new Date(p.start_date).toLocaleDateString() : 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2 text-red-500/80">
                                                    <Calendar size={12} /> {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'No Deadline'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => handleOpenModal(p)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteProject(p.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Pagination
                total={totalRecords}
                limit={limit}
                currentPage={currentPage}
                onPageChange={handlePageChange}
            />

            {/* Modal for Create/Edit Project */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                {selectedProject ? t('projects.modal.edit_title') : t('projects.modal.add_title')}
                            </h3>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">{t('projects.modal.name_label')}</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder={t('projects.modal.name_placeholder')}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"

                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">{t('projects.modal.client_label')}</label>
                                        <select
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100 font-bold transition-all"
                                            value={formData.client_id}
                                            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                        >
                                            <option value="">{t('projects.modal.client_select')}</option>

                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">{t('projects.modal.start_date')}</label>

                                            <input
                                                required
                                                type="date"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm text-slate-900 dark:text-slate-100 font-bold"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">{t('projects.modal.deadline')}</label>

                                            <input
                                                type="date"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm text-slate-900 dark:text-slate-100 font-bold"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">{t('projects.modal.budget_label')}</label>

                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-black"
                                                value={formData.budget}
                                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">{t('projects.modal.status_label')}</label>

                                            <select
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100 font-bold transition-all"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="Planning">{t('projects.status.planning') || 'Planning'}</option>
                                                <option value="In Progress">{t('projects.status.in_progress') || 'In Progress'}</option>
                                                <option value="On Hold">{t('projects.status.on_hold') || 'On Hold'}</option>
                                                <option value="Completed">{t('projects.status.completed') || 'Completed'}</option>
                                                <option value="Cancelled">{t('projects.status.cancelled') || 'Cancelled'}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5 ml-1">{t('projects.modal.scope_label')}</label>
                                        <textarea
                                            rows="3"
                                            placeholder={t('projects.modal.scope_placeholder')}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none text-slate-900 dark:text-slate-100 text-sm font-medium"

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
                                    className="px-6 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase text-[10px] tracking-widest"
                                >
                                    {t('common.cancel')}
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black transition-all flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : (selectedProject ? <CheckCircle2 size={16} /> : <Plus size={16} />)}
                                    {selectedProject ? t('projects.modal.save_changes') : t('projects.modal.create_btn')}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalConfig.isOpen}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModalConfig({ isOpen: false, projectId: null })}
                title={t('projects.delete.title')}
                message={t('projects.delete.confirm_text')}
                confirmText={t('projects.delete.delete_btn')}
                loading={submitting}
            />

        </div>
    );
};

export default Projects;
