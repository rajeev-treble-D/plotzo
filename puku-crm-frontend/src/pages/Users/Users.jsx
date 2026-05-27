import React, { useState } from 'react';
import {
    ShieldCheck,
    Search,
    Plus,
    MoreHorizontal,
    Mail,
    Calendar,
    UserCheck,
    UserMinus,
    Filter,
    X,
    User,
    Shield,
    Loader2,
    Edit2,
    Trash2,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation, Trans } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';


const Users = () => {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role_name === 'Admin';
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role_id: '',
        password: 'ChangeMe123!'
    });

    const [editUser, setEditUser] = useState({
        name: '',
        email: '',
        role_id: '',
        status: ''
    });

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.users);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data.roles);
            if (response.data.roles.length > 0) {
                setNewUser(prev => ({ ...prev, role_id: response.data.roles[0].id }));
            }
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        }
    };

    React.useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.post('/users', newUser);
            setIsModalOpen(false);
            setNewUser({ name: '', email: '', role_id: roles[0]?.id || '', password: 'ChangeMe123!' });
            fetchUsers();
            showToast('User created successfully!', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditUser({
            name: user.name,
            email: user.email,
            role_id: user.role_id,
            status: user.status
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.put(`/users/${selectedUser.id}`, editUser);
            setIsEditModalOpen(false);
            fetchUsers();
            showToast('User updated successfully!', 'success');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setSubmitting(true);
        try {
            await api.delete(`/users/${selectedUser.id}`);
            setIsDeleteModalOpen(false);
            fetchUsers();
            showToast('User deleted successfully!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete user', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const stats = [
        {
            label: t('users.stats.total'),
            value: users.length.toString(),
            icon: User, color: 'text-primary-600',
            bg: 'bg-primary-50 dark:bg-primary-900/20'
        },
        {
            label: t('users.stats.admins'),
            value: users.filter(u => u.role_name === 'Admin').length.toString(),
            icon: Shield,
            color: 'text-purple-600',
            bg: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
            label: t('users.stats.active'),
            value: users.filter(u => u.status === 'Active').length.toString(),
            icon: UserCheck,
            color: 'text-green-600',
            bg: 'bg-green-50 dark:bg-green-900/20'
        },
    ];


    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('users.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('users.subtitle')}</p>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        {t('users.add_new')}
                    </button>

                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="card flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="card !p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={t('users.search_placeholder')}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <Filter size={16} />
                        {t('users.filter.role_all')}
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        {t('users.filter.status_active')}
                    </button>
                </div>

            </div>

            {/* User Table */}
            <div className="card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('users.table.user')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('users.table.role')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('users.table.status')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('users.table.last_login')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <Loader2 className="mx-auto animate-spin text-primary-600 mb-2" size={32} />
                                        <p className="text-slate-500 font-medium">{t('common.loading')}</p>
                                    </td>

                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <p className="text-slate-500 font-medium">{t('common.no_results')}</p>
                                    </td>

                                </tr>
                            ) : (
                                users.filter(u =>
                                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    u.email.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.role_name === 'Admin'
                                                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                                                }`}>
                                                {user.role_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' :
                                                    user.status === 'Inactive' ? 'bg-red-500' : 'bg-yellow-500'
                                                    }`}></div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t(`users.status.${user.status}`)}</span>
                                            </div>

                                        </td>
                                        <td className="px-6 py-4">
                                            {user.last_login ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                        {new Date(user.last_login).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                                        {new Date(user.last_login).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
                                                    {t('users.table.never')}
                                                </span>
                                            )}

                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {isAdmin && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(user)}
                                                        className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(user)}
                                                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsModalOpen(false)}
                        ></div>
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('users.modal.add_title')}</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 group"
                                >
                                    <X size={20} className="group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateUser}>
                                <div className="p-6 space-y-4">
                                    {error && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                                            {error}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('users.modal.full_name')}</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder={t('users.modal.name_placeholder')}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('users.modal.email_label')}</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder={t('users.modal.email_placeholder')}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('users.modal.password_label')}</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder={t('users.modal.password_placeholder')}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('users.modal.role_label')}</label>
                                            <select
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100 transition-all"
                                                value={newUser.role_id}
                                                onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
                                            >
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
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
                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                        {t('users.modal.create_btn')}
                                    </button>

                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit User Modal */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsEditModalOpen(false)}
                        ></div>
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('users.modal.edit_title')}</h3>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateUser}>
                                <div className="p-6 space-y-4">
                                    {error && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                                            {error}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('users.modal.full_name')}</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={editUser.name}
                                            onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('users.modal.email_label')}</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900 dark:text-slate-100"
                                            value={editUser.email}
                                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('users.modal.role_label')}</label>
                                            <select
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100"
                                                value={editUser.role_id}
                                                onChange={(e) => setEditUser({ ...editUser, role_id: e.target.value })}
                                            >
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('users.modal.status_label')}</label>
                                            <select
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm text-slate-900 dark:text-slate-100"
                                                value={editUser.status}
                                                onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                                            >
                                                <option value="Active">{t('users.status.Active')}</option>
                                                <option value="Inactive">{t('users.status.Inactive')}</option>
                                                <option value="Pending">{t('users.status.Pending')}</option>
                                            </select>
                                        </div>

                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="btn btn-secondary"
                                    >
                                        {t('common.cancel')}
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn btn-primary flex items-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                        {t('users.modal.save_changes')}
                                    </button>

                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsDeleteModalOpen(false)}
                        ></div>
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('users.delete.title')}</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 font-semibold">
                                    <Trans i18nKey="users.delete.confirm_text" values={{ name: selectedUser?.name }}>
                                        Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-slate-100">{selectedUser?.name}</span>? This action cannot be undone.
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
                                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                        {t('users.delete.delete_btn')}
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Users;
