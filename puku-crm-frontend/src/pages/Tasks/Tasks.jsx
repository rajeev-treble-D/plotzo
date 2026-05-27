import React, { useState, useEffect } from 'react';
import {
    Plus,
    Calendar,
    Flag,
    User,
    MoreHorizontal,
    Circle,
    CheckCircle2,
    X,
    Loader2,
    Trash2,
    Edit2,
    AlertCircle,
    Search,
    Filter,
    Check,
    CheckSquare
} from 'lucide-react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';


const Tasks = () => {
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [agents, setAgents] = useState([]);
    const [deleteModalConfig, setDeleteModalConfig] = useState({ isOpen: false, taskId: null });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        due_date: new Date().toISOString().split('T')[0],
        user_id: ''
    });

    useEffect(() => {
        fetchTasks(currentPage);
        fetchAgents();
    }, [currentPage]);

    const fetchTasks = async (page = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/tasks?page=${page}&limit=${limit}`);
            setTasks(res.data.tasks || []);
            setTotalRecords(res.data.total || 0);
        } catch (err) {
            showToast(t('tasks.loading_error') || 'Failed to fetch tasks', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const fetchAgents = async () => {
        try {
            const res = await api.get('/users');
            setAgents(res.data.users || []);
            if (res.data.users && res.data.users.length > 0 && !formData.user_id) {
                setFormData(prev => ({ ...prev, user_id: res.data.users[0].id }));
            }
        } catch (err) {
            console.error('Failed to fetch agents', err);
        }
    };

    const handleOpenModal = (task = null) => {
        if (task) {
            setSelectedTask(task);
            setFormData({
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
                user_id: task.user_id || (agents.length > 0 ? agents[0].id : '')
            });
        } else {
            setSelectedTask(null);
            setFormData({
                title: '',
                description: '',
                priority: 'Medium',
                due_date: new Date().toISOString().split('T')[0],
                user_id: agents.length > 0 ? agents[0].id : ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (selectedTask) {
                await api.put(`/tasks/${selectedTask.id}`, formData);
                showToast(t('tasks.update_success') || 'Task updated successfully!', 'success');
            } else {
                await api.post('/tasks', formData);
                showToast(t('tasks.add_success') || 'Task created!', 'success');
            }
            setIsModalOpen(false);
            fetchTasks();
        } catch (err) {
            showToast(t('tasks.save_error') || 'Failed to save task', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleTask = async (task) => {
        const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
        try {
            await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
            setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
            showToast(t('tasks.status_update_success', { status: t(`tasks.filter.${newStatus.toLowerCase().replace(' ', '_')}`) }) || `Task marked as ${newStatus}`, 'success');
        } catch (err) {
            showToast(t('tasks.status_update_error') || 'Failed to update status', 'error');
        }
    };

    const deleteTask = (id) => {
        setDeleteModalConfig({ isOpen: true, taskId: id });
    };

    const confirmDelete = async () => {
        const id = deleteModalConfig.taskId;
        setSubmitting(true);
        try {
            await api.delete(`/tasks/${id}`);
            showToast(t('tasks.delete_success') || 'Task deleted successfully!', 'success');
            setDeleteModalConfig({ isOpen: false, taskId: null });
            fetchTasks();
        } catch (err) {
            showToast(t('tasks.delete_error') || 'Failed to delete task', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesFilter = filter === 'All' || task.status === filter;
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('tasks.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('tasks.subtitle')}</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    {t('tasks.new_task')}
                </button>

            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full md:w-auto">
                    {['All', 'Pending', 'In Progress', 'Completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === tab
                                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {t(`tasks.filter.${tab.toLowerCase().replace(' ', '_')}`)}
                        </button>

                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder={t('tasks.search_placeholder')}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all shadow-sm"

                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-primary-500" size={40} />
                        <p className="text-slate-400 font-medium tracking-tight">{t('common.loading')}</p>
                    </div>

                ) : filteredTasks.length === 0 ? (
                    <div className="py-20 text-center card border-dashed border-2 bg-transparent">
                        <CheckSquare size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('common.no_results')}</h3>
                        <p className="text-slate-500 dark:text-slate-400">{t('tasks.subtitle')}</p>
                    </div>

                ) : (
                    filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group card !p-4 flex items-center gap-4 transition-all border-l-4 ${task.status === 'Completed'
                                ? 'opacity-60 border-l-green-500 bg-slate-50/50 dark:bg-slate-800/30'
                                : task.priority === 'High' ? 'border-l-red-500' : task.priority === 'Medium' ? 'border-l-orange-500' : 'border-l-blue-500'
                                }`}
                        >
                            <button
                                onClick={() => toggleTask(task)}
                                className={`flex-shrink-0 transition-all transform active:scale-95 ${task.status === 'Completed'
                                    ? 'text-green-500 scale-110'
                                    : 'text-slate-300 dark:text-slate-600 hover:text-primary-500'
                                    }`}
                            >
                                {task.status === 'Completed' ? <CheckCircle2 size={26} fill="currentColor" stroke="white" /> : <Circle size={26} />}
                            </button>
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-slate-900 dark:text-slate-100 truncate ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                                    {task.title}
                                </h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                        <Calendar size={12} className="text-primary-500" />
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : t('tasks.no_date')}
                                    </div>

                                    <div className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'text-red-600' :
                                        task.priority === 'Medium' ? 'text-orange-600' :
                                            'text-blue-600'
                                        }`}>
                                        <Flag size={12} fill="currentColor" className="opacity-20" />
                                        {t(`tasks.priority.${task.priority}`)}
                                    </div>

                                    {task.assigned_name && (
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                                            <User size={12} className="text-slate-400" />
                                            {task.assigned_name}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleOpenModal(task)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Pagination
                total={totalRecords}
                limit={limit}
                currentPage={currentPage}
                onPageChange={handlePageChange}
            />

            {!loading && (
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 font-bold hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    {t('tasks.new_item')}
                </button>

            )}

            {/* Modal for Add/Edit Task */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    ></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {selectedTask ? t('tasks.modal.edit_title') : t('tasks.modal.add_title')}
                            </h3>

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('tasks.modal.title_label')}</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder={t('tasks.modal.title_placeholder')}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"

                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('tasks.modal.priority_label')}</label>

                                        <select
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100 font-bold transition-all"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="High">{t('tasks.priority.High')}</option>
                                            <option value="Medium">{t('tasks.priority.Medium')}</option>
                                            <option value="Low">{t('tasks.priority.Low')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('tasks.modal.due_date')}</label>

                                        <input
                                            required
                                            type="date"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm text-slate-900 dark:text-slate-100 font-bold"
                                            value={formData.due_date}
                                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('tasks.modal.assign_label')}</label>

                                        <select
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100 font-bold transition-all"
                                            value={formData.user_id}
                                            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                        >
                                            <option value="">{t('tasks.modal.assign_select')}</option>

                                            {agents.map(agent => (
                                                <option key={agent.id} value={agent.id}>{agent.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{t('tasks.modal.desc_label')}</label>

                                    <textarea
                                        rows="3"
                                        placeholder={t('tasks.modal.desc_placeholder')}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none text-slate-900 dark:text-slate-100 text-sm font-medium"

                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
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
                                    className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black transition-all flex items-center gap-2 uppercase text-[10px] tracking-widest"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : (selectedTask ? <Check size={16} /> : <Plus size={16} />)}
                                    {selectedTask ? t('tasks.modal.update_btn') : t('tasks.modal.create_btn')}
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
                onCancel={() => setDeleteModalConfig({ isOpen: false, taskId: null })}
                title={t('tasks.delete.title')}
                message={t('tasks.delete.confirm_text')}
                confirmText={t('tasks.delete.delete_btn')}
                loading={submitting}
            />

        </div>
    );
};

export default Tasks;
