import React, { useState } from 'react';
import {
    Shield,
    Plus,
    Users,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Loader2,
    Edit2,
    Trash2,
    X,
    AlertTriangle,
    Settings as SettingsIcon,
    LayoutDashboard,
    Target,
    BarChart3,
    Receipt,
    Briefcase,
    Package,
    CheckSquare,
    Headset,
    Sparkles,
    ShieldCheck,
    History,
    Mail
} from 'lucide-react';
import api from '../../services/api';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';


const AVAILABLE_MODULES = [
    { id: 'dashboard', key: 'dashboard', icon: LayoutDashboard },
    { id: 'customers', key: 'customers', icon: Users },
    { id: 'leads', key: 'leads', icon: Target },
    { id: 'sales', key: 'sales', icon: BarChart3 },
    { id: 'expenses', key: 'expenses', icon: Receipt },
    { id: 'projects', key: 'projects', icon: Briefcase },
    { id: 'stock', key: 'stock', icon: Package },
    { id: 'tasks', key: 'tasks', icon: CheckSquare },
    { id: 'support', key: 'support', icon: Headset },
    { id: 'users', key: 'users', icon: ShieldCheck },
    { id: 'reports', key: 'reports', icon: Sparkles },
    { id: 'emails', key: 'emails', icon: Mail },
    { id: 'activity', key: 'activity', icon: History },
    { id: 'settings', key: 'settings', icon: SettingsIcon }
];


const Roles = () => {
    const { user: currentUser } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const isAdmin = currentUser?.role_name === 'Admin';


    const [searchQuery, setSearchQuery] = useState('');
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedRole, setSelectedRole] = useState(null);
    const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: [] });

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data.roles);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchRoles();
    }, []);

    const handleCreateRole = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/roles', roleForm);
            setIsCreateModalOpen(false);
            setRoleForm({ name: '', description: '', permissions: [] });
            fetchRoles();
            showToast('Role created successfully!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create role', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (role) => {
        setSelectedRole(role);
        setRoleForm({
            name: role.name,
            description: role.description,
            permissions: role.permissions || []
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateRole = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/roles/${selectedRole.id}`, roleForm);
            setIsEditModalOpen(false);
            fetchRoles();
            showToast('Role updated successfully!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update role', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (role) => {
        if (role.name === 'Admin') {
            showToast('Cannot delete Admin role.', 'error');
            return;
        }
        if (role.member_count > 0) {
            showToast('Cannot delete role with active members.', 'error');
            return;
        }
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/roles/${selectedRole.id}`);
            setIsDeleteModalOpen(false);
            fetchRoles();
            showToast('Role deleted successfully!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete role', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const togglePermission = (moduleId) => {
        setRoleForm(prev => {
            const isPermitted = prev.permissions.includes(moduleId);
            return {
                ...prev,
                permissions: isPermitted
                    ? prev.permissions.filter(id => id !== moduleId)
                    : [...prev.permissions, moduleId]
            };
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('roles.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('roles.subtitle')}</p>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => {
                            setRoleForm({ name: '', description: '', permissions: [] });
                            setIsCreateModalOpen(true);
                        }}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        {t('roles.create_new')}
                    </button>

                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card !p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                        <Shield size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500">{t('roles.defined_roles')}</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{roles.length}</p>
                    </div>

                </div>
            </div>

            {/* Roles Table */}
            <div className="card !p-0 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('roles.search_placeholder')}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm text-slate-900 dark:text-slate-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('roles.table.role_name')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('roles.table.members')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('roles.table.assigned_modules')}</th>
                                {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">{t('common.actions')}</th>}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3} className="py-20 text-center">
                                        <Loader2 className="mx-auto animate-spin text-primary-600 mb-2" size={32} />
                                        <p className="text-slate-500 font-medium">{t('common.loading')}</p>
                                    </td>

                                </tr>
                            ) : roles.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 4 : 3} className="py-20 text-center">
                                        <p className="text-slate-500 font-medium">{t('common.no_results')}</p>
                                    </td>

                                </tr>
                            ) : (
                                roles.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map((role) => (
                                    <tr key={role.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-slate-100">{role.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{role.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('roles.table.users_count', { count: role.member_count || 0 })}</span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {role.name === 'Admin' ? (
                                                    <span className="px-2 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded text-[10px] font-bold uppercase">{t('roles.table.all_access')}</span>
                                                ) : (role.permissions || []).length > 0 ? (

                                                    role.permissions.map(p => (
                                                        <span key={p} className="px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded text-[10px] font-bold uppercase tracking-wider">
                                                            {t(`roles.modules.${p}`)}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">{t('roles.table.no_modules')}</span>
                                                )}

                                            </div>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(role)}
                                                        className="p-2 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all shadow-sm"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(role)}
                                                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {isCreateModalOpen ? t('roles.modal.create_title') : t('roles.modal.edit_title')}
                            </h3>

                            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={isCreateModalOpen ? handleCreateRole : handleUpdateRole}>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('roles.modal.role_name')}</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder={t('roles.modal.role_placeholder')}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={roleForm.name}
                                            onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('roles.modal.desc_label')}</label>
                                        <textarea
                                            required
                                            rows="3"
                                            placeholder={t('roles.modal.desc_placeholder')}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100 resize-none"
                                            value={roleForm.description}
                                            onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                        />
                                    </div>

                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t('roles.modal.module_access')}</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {roleForm.name === 'Admin' ? (
                                            <div className="p-8 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border-2 border-dashed border-primary-200 dark:border-primary-800 text-center">
                                                <Shield className="mx-auto text-primary-600 mb-2" size={32} />
                                                <p className="text-primary-800 dark:text-primary-300 font-bold">{t('roles.modal.full_admin')}</p>
                                                <p className="text-primary-600/70 dark:text-primary-400/70 text-xs mt-1">{t('roles.modal.admin_desc')}</p>
                                            </div>

                                        ) : (
                                            AVAILABLE_MODULES.map(module => (
                                                <button
                                                    key={module.id}
                                                    type="button"
                                                    onClick={() => togglePermission(module.id)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${roleForm.permissions.includes(module.id)
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 text-slate-600 dark:text-slate-400'
                                                        }`}
                                                >
                                                    <module.icon size={18} />
                                                    <span className="text-sm font-bold flex-1 text-left">{t(`roles.modules.${module.key}`)}</span>
                                                    {roleForm.permissions.includes(module.id) && <CheckCircle2 size={18} className="text-primary-600" />}
                                                </button>

                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }} className="btn btn-secondary">{t('common.cancel')}</button>
                                <button type="submit" disabled={submitting} className="btn btn-primary flex items-center gap-2">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : (isCreateModalOpen ? <Plus size={18} /> : <CheckCircle2 size={18} />)}
                                    {isCreateModalOpen ? t('roles.modal.create_btn') : t('roles.modal.save_changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-sm relative z-10 overflow-hidden text-center p-8 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('roles.delete.title')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 font-semibold">
                            <Trans i18nKey="roles.delete.confirm_text" values={{ name: selectedRole?.name }}>
                                Are you sure? This will permanently remove the <span className="text-slate-900 dark:text-slate-100 font-bold">{{ name }}</span> role.
                            </Trans>
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 transition-all">{t('common.cancel')}</button>
                            <button onClick={confirmDelete} disabled={submitting} className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 flex items-center justify-center gap-2">
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                {t('roles.delete.delete_btn')}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;
