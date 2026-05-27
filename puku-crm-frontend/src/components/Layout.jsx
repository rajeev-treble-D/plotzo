import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Receipt,
    Package,
    Briefcase,
    Building2,
    BarChart3,
    Target,
    CheckSquare,
    MessageSquare,
    Activity,
    Mail,
    Settings,
    Menu,
    X,
    Bell,
    Search,
    User,
    Power,
    Sun,
    Moon,
    ShieldCheck,
    ChevronDown,
    ChevronRight,
    Sparkles,
    Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Clock } from 'lucide-react';
import api from '../services/api';
import CustomerDetailsModal from './CustomerDetailsModal';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.png'


const LiveClock = ({ timezone }) => {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    let formattedTime = '';
    try {
        formattedTime = time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: timezone || 'UTC'
        });
    } catch {
        // Fallback to UTC if timezone is invalid
        formattedTime = time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'UTC'
        });
    }

    return (
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
            <Clock size={16} className="text-primary-500 animate-pulse" />
            <span className="font-bold tracking-tight">{formattedTime}</span>
        </div>
    );
};

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { id: 'customers', icon: Users, label: 'Customers', path: '/customers' },
    { id: 'sales', icon: ShoppingBag, label: 'Sales', path: '/sales' },
    { id: 'expenses', icon: Receipt, label: 'Expenses', path: '/expenses' },
    { id: 'stock', icon: Package, label: 'Stock', path: '/stock' },
    { id: 'projects', icon: Briefcase, label: 'Projects', path: '/projects' },
    { id: 'properties', icon: Building2, label: 'Properties', path: '/properties' },
    { id: 'reports', icon: Sparkles, label: 'Smart Report', path: '/report' },
    { id: 'leads', icon: Target, label: 'Leads', path: '/leads' },
    { id: 'tasks', icon: CheckSquare, label: 'To Do', path: '/tasks' },
    { id: 'emails', icon: Mail, label: 'Email', path: '/emails' },
    {
        id: 'users',
        icon: ShieldCheck,
        label: 'Users',
        path: '/users',
        children: [
            { id: 'user_list', label: 'User List', path: '/users' },
            { id: 'manage_roles', label: 'Manage Roles', path: '/users/roles' },
            { id: 'role_assignment', label: 'Role Assignment', path: '/users/assign' },
        ]
    },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
    { id: 'activity', icon: Activity, label: 'Activity Logs', path: '/activity' },
    { id: 'profile', icon: User, label: 'My Profile', path: '/profile' },
];


const NavItem = ({ item, isSidebarOpen, location }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const hasChildren = item.children && item.children.length > 0;


    // Check if current path matches parent or any child
    const isActive = location.pathname === item.path ||
        (hasChildren && item.children.some(child => location.pathname === child.path));

    const toggleSubmenu = (e) => {
        if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className="space-y-1">
            <Link
                to={item.path}
                onClick={hasChildren ? toggleSubmenu : undefined}
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    isActive
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-200 dark:shadow-none"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )}
            >
                <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                {isSidebarOpen && <span className="font-medium flex-1">{t(`sidebar.${item.id}`, { defaultValue: item.label })}</span>}
                {isSidebarOpen && hasChildren && (
                    <div className="ml-auto transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <ChevronDown size={16} />
                    </div>
                )}
            </Link>

            {hasChildren && isOpen && isSidebarOpen && (
                <div className="ml-9 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 pl-4 animate-in slide-in-from-top-1 duration-200">
                    {item.children.map((child) => (
                        <Link
                            key={child.path}
                            to={child.path}
                            className={cn(
                                "block py-2 text-sm font-medium transition-colors",
                                location.pathname === child.path
                                    ? "text-primary-600 dark:text-primary-400"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            {child.id ? t(`sidebar.${child.id}`, { defaultValue: child.label }) : child.label}
                        </Link>

                    ))}
                </div>
            )}
        </div>
    );
};

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const { settings } = useSettings();
    const { t } = useTranslation();
    const location = useLocation();


    // Global Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [drillDownCustomerId, setDrillDownCustomerId] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Handle Search Input
    React.useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                try {
                    setIsSearching(true);
                    const res = await api.get(`/customers/search?q=${searchQuery}`);
                    setSearchResults(res.data.customers || []);
                    setShowSearchResults(true);
                } catch (err) {
                    console.error('Search failed:', err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Close search results when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('#global-search-container')) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (id) => {
        setDrillDownCustomerId(id);
        setIsDetailsModalOpen(true);
        setShowSearchResults(false);
        setSearchQuery('');
    };

    // Close profile dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileOpen && !event.target.closest('#user-profile-dropdown')) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    return (
        <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    !isSidebarOpen && "-translate-x-full lg:w-20"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">
                                <img src={logo} alt="" />
                            </div>
                            {isSidebarOpen && <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Plotzo</span>}
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {menuItems.filter(item => {
                            // Dashboard is only for Admins
                            if (item.id === 'dashboard') return user?.role_name === 'Admin';

                            // Profile is for everyone except Admin in sidebar (already in topbar)
                            if (item.id === 'profile') return user?.role_name !== 'Admin';

                            if (user?.role_name === 'Admin') return true;
                            // Check permissions
                            return user?.permissions?.includes(item.id);
                        }).map((item) => (
                            <NavItem
                                key={item.id}
                                item={{ ...item, label: t(`sidebar.${item.id}`, { defaultValue: item.label }) }}
                                isSidebarOpen={isSidebarOpen}
                                location={location}
                            />
                        ))}
                    </nav>

                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-slate-100 hidden lg:flex"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="relative hidden md:flex items-center" id="global-search-container">
                            <Search className="absolute left-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder={t('topbar.search_placeholder')}
                                className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl w-64 lg:w-96 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                            />

                            {isSearching && (
                                <div className="absolute right-3">
                                    <Loader2 size={16} className="animate-spin text-primary-500" />
                                </div>
                            )}

                            {/* Search Results Dropdown */}
                            {showSearchResults && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-3 border-b border-slate-50 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('topbar.customer_results')}</p>
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto">
                                        {searchResults.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <p className="text-sm font-bold text-slate-400">{t('topbar.no_results')} "{searchQuery}"</p>
                                            </div>

                                        ) : (
                                            searchResults.map(customer => (
                                                <button
                                                    key={customer.id}
                                                    onClick={() => handleResultClick(customer.id)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                                                >
                                                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2">{customer.name}</p>
                                                        <p className="text-[10px] font-medium text-slate-400 truncate">{customer.company || 'Personal'} • {customer.email}</p>
                                                    </div>
                                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
                                                </button>
                                            )
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {(settings.show_clock !== 'false' && settings.show_clock !== false && settings.show_clock !== '0' && settings.show_clock !== 0) && (
                            <LiveClock timezone={settings.timezone} />
                        )}
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

                        <LanguageSwitcher />

                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            title={t('topbar.switch_theme', { theme: theme === 'dark' ? 'light' : 'dark' })}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>


                        {/* User Profile Dropdown */}
                        <div className="relative" id="user-profile-dropdown">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 active:scale-95 outline-none"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user?.name || 'User'}</p>
                                    <p className="text-[10px] uppercase tracking-widest font-black text-primary-500 mt-1.5">{user?.role_name || user?.role || 'Guest'}</p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200 dark:shadow-none font-bold text-lg ring-2 ring-white dark:ring-slate-900 transition-transform group-hover:scale-105">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                                </div>
                                <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-300", isProfileOpen && "rotate-180")} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 transition-all">
                                    <div className="px-4 py-3 border-b border-slate-100/50 dark:border-slate-800 mb-2">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('topbar.signed_in_as')}</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
                                    </div>


                                    <Link
                                        to="/profile"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:text-primary-600 transition-colors mx-2 rounded-xl"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <User size={18} />
                                        </div>
                                        {t('topbar.account_settings')}
                                    </Link>


                                    <div className="h-px bg-slate-100/50 dark:bg-slate-800 my-2 mx-4"></div>

                                    <button
                                        onClick={() => { setIsProfileOpen(false); logout(); }}
                                        className="flex items-center gap-3 w-[calc(100%-1rem)] mx-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                                            <Power size={18} />
                                        </div>
                                        {t('topbar.logout')}
                                    </button>

                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen">
                    {children}
                </main>
            </div>

            {/* Customer Details Drill-down Modal */}
            <CustomerDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                customerId={drillDownCustomerId}
            />
        </div>
    );
};

export default Layout;
