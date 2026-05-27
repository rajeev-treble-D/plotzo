import React, { useState } from 'react';
import {
    UserPlus,
    Search,
    Shield,
    CheckCircle2,
    Clock,
    ArrowRight,
    User,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';


const AssignRole = () => {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role_name === 'Admin';
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [history, setHistory] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.users);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data.roles.map(r => ({
                ...r,
                icon: Shield,
                color: r.name === 'Admin' ? 'text-purple-600' :
                    r.name === 'Manager' ? 'text-blue-600' :
                        r.name === 'Sales Agent' ? 'text-green-600' : 'text-orange-600',
                bg: r.name === 'Admin' ? 'bg-purple-50 dark:bg-purple-900/20' :
                    r.name === 'Manager' ? 'bg-blue-50 dark:bg-blue-900/20' :
                        r.name === 'Sales Agent' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
            })));
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await api.get('/activity?action=ROLE_ASSIGNED&limit=5');
            setHistory(response.data.logs);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        }
    };

    React.useEffect(() => {
        if (isAdmin) {
            fetchUsers();
            fetchRoles();
            fetchHistory();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    const handleUpdateRole = async () => {
        if (!selectedUser || !selectedRole) return;
        setUpdating(true);
        try {
            await api.post('/users/assign-role', {
                userId: selectedUser.id,
                roleId: selectedRole.id
            });
            setSelectedUser(null);
            setSelectedRole(null);
            fetchUsers();
            fetchHistory();
            showToast('Role updated successfully!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update role', 'error');
        } finally {
            setUpdating(false);
        }
    };



    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-3xl flex items-center justify-center mb-6">
                    <Shield size={40} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('assign_role.denied_title')}</h1>
                <p className="text-slate-500 max-w-sm">{t('assign_role.denied_msg')}</p>
            </div>

        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('assign_role.title')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('assign_role.subtitle')}</p>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: User Selection */}
                <div className="space-y-6">
                    <div className="card h-full">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <User size={20} className="text-primary-600" />
                            {t('assign_role.step1')}
                        </h2>


                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder={t('assign_role.search_user')}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all text-slate-900 dark:text-slate-100"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>


                        <div className="space-y-2">
                            {loading ? (
                                <div className="py-10 text-center">
                                    <Loader2 className="mx-auto animate-spin text-primary-600" size={24} />
                                </div>
                            ) : users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => setSelectedUser(u)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${selectedUser?.id === u.id
                                        ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10'
                                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</p>
                                        <p className="text-xs text-slate-500">{u.role_name}</p>
                                    </div>
                                    {selectedUser?.id === u.id && <Check className="ml-auto text-primary-600" size={18} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 2: Role Selection & Preview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-primary-600" />
                            {t('assign_role.step2')}
                        </h2>


                        {!selectedUser ? (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <AlertCircle className="mx-auto text-slate-400 mb-3" size={32} />
                                <p className="text-slate-500 font-medium">{t('assign_role.select_user_first')}</p>
                            </div>

                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRole(role)}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedRole?.id === role.id
                                            ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10'
                                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${role.bg} ${role.color}`}>
                                            <role.icon size={20} />
                                        </div>
                                        <p className="font-bold text-slate-900 dark:text-white">{role.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedUser && selectedRole && (
                            <div className="mt-8 p-6 bg-primary-600 rounded-2xl text-white shadow-xl shadow-primary-200 dark:shadow-none animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl text-white">
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium opacity-80">{t('assign_role.promoting', { name: selectedUser.name })}</p>
                                            <p className="text-xl font-bold">{selectedRole.name}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleUpdateRole}
                                        disabled={updating}
                                        className="bg-white text-primary-600 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                                    >
                                        {updating && <Loader2 className="animate-spin" size={18} />}
                                        {t('assign_role.update_btn')}
                                    </button>

                                </div>
                            </div>
                        )}
                    </div>

                    {/* Assignment History */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-primary-600" />
                            {t('assign_role.recent_changes')}
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                        <th className="text-left py-3 px-2">{t('assign_role.table.user')}</th>
                                        <th className="text-left py-3 px-2">{t('assign_role.table.change')}</th>
                                        <th className="text-left py-3 px-2">{t('assign_role.table.date')}</th>
                                        <th className="text-left py-3 px-2">{t('assign_role.table.assigned_by')}</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-slate-400 italic">{t('assign_role.table.no_changes')}</td>
                                        </tr>
                                    ) : (

                                        history.map((h) => (
                                            <tr key={h.id}>
                                                <td className="py-3 px-2 font-semibold text-slate-900 dark:text-white">
                                                    {h.details?.user_name || h.entity_name || t('assign_role.table.system_user')}
                                                </td>
                                                <td className="py-3 px-2">
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <span className="text-slate-400">{t('assign_role.table.previous')}</span>
                                                        <ArrowRight size={10} className="text-slate-300" />
                                                        <span className="text-primary-600 font-bold">{h.details?.role_name || t('assign_role.table.assigned')}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 text-slate-500">
                                                    {new Date(h.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-2">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                        {h.user_name || t('assign_role.table.admin')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignRole;
