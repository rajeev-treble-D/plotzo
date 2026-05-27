import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    ShoppingBag,
    Receipt,
    Target,
    Package,
    Briefcase,
    CheckSquare,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

import { useSettings } from '../../context/SettingsContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

const StatCard = ({ title, value, subValue, icon: Icon, trend, color, loading, link }) => {
    const navigate = useNavigate();
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        green: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        red: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
        brown: "bg-stone-50 text-stone-600 dark:bg-stone-900/30 dark:text-stone-400",
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    };

    return (
        <div
            className={`card group cursor-pointer hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg active:scale-[0.98] ${loading ? 'pointer-events-none' : ''}`}
            onClick={() => link && !loading && navigate(link)}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={colorClasses[color] + " p-3 rounded-2xl"}>
                    <Icon size={24} />
                </div>
                <button className="text-slate-400 hover:text-slate-600" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical size={20} />
                </button>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                {loading ? (
                    <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg"></div>
                ) : (
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 flex items-center gap-1 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    {subValue}
                </p>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const { formatCurrency } = useSettings();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({});
    const [charts, setCharts] = useState({ incomeExpense: [], projectStatus: [], taskWorkload: [] });
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, chartRes, activityRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/charts'),
                    api.get('/dashboard/activity')
                ]);
                setStats(statsRes.data);
                setCharts(chartRes.data);
                setActivities(activityRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const chartData = {
        labels: charts.incomeExpense.map(c => c.label),
        datasets: [
            {
                label: t('sidebar.sales'),
                data: charts.incomeExpense.map(c => c.sales),

                borderColor: '#3b82f6',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
            },
            {
                label: t('sidebar.expenses'),
                data: charts.incomeExpense.map(c => c.expenses),

                borderColor: '#f43f5e',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.4,
            }
        ],
    };

    const projectStatusData = {
        labels: charts.projectStatus.map(p => p.status),
        datasets: [
            {
                data: charts.projectStatus.map(p => p.count),
                backgroundColor: [
                    '#3b82f6', // In Progress
                    '#22c55e', // Completed
                    '#f59e0b', // Pending
                    '#ef4444', // Delayed/Canceled
                    '#64748b', // On Hold
                ],
                borderWidth: 0,
            }
        ]
    };

    const taskWorkloadData = {
        labels: [...new Set(charts.taskWorkload.map(t => t.user_name))],
        datasets: [
            {
                label: t('dashboard.pending_tasks'),
                data: [...new Set(charts.taskWorkload.map(t => t.user_name))].map(user => {

                    const task = charts.taskWorkload.find(t => t.user_name === user && t.status === 'To Do');
                    return task ? task.count : 0;
                }),
                backgroundColor: '#64748b',
            },
            {
                label: t('common.in_progress', 'In Progress'),
                data: [...new Set(charts.taskWorkload.map(t => t.user_name))].map(user => {

                    const task = charts.taskWorkload.find(t => t.user_name === user && t.status === 'In Progress');
                    return task ? task.count : 0;
                }),
                backgroundColor: '#3b82f6',
            },
            {
                label: t('common.completed', 'Completed'),
                data: [...new Set(charts.taskWorkload.map(t => t.user_name))].map(user => {

                    const task = charts.taskWorkload.find(t => t.user_name === user && t.status === 'Completed');
                    return task ? task.count : 0;
                }),
                backgroundColor: '#22c55e',
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    boxWidth: 6,
                    boxHeight: 6,
                    font: { family: 'Inter', size: 12, weight: '500' },
                    color: isDark ? '#94a3b8' : '#64748b'
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#0f172a' : '#1e293b',
                padding: 12,
                titleFont: { family: 'Inter', size: 14, weight: '600' },
                bodyFont: { family: 'Inter', size: 13 },
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    autoSkip: true,
                    maxTicksLimit: 15,
                    font: { family: 'Inter', size: 10 },
                    color: isDark ? '#64748b' : '#94a3b8'
                }
            },
            y: {
                grid: {
                    borderDash: [5, 5],
                    color: isDark ? '#1e293b' : '#e2e8f0'
                },
                ticks: {
                    font: { family: 'Inter' },
                    color: isDark ? '#64748b' : '#94a3b8'
                }
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('dashboard.overview')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.welcome')}</p>
            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={t('dashboard.total_customers')}
                    value={stats.customers || 0}
                    subValue={t('dashboard.all_time_customers')}
                    icon={Users}
                    color="blue"
                    loading={loading}
                    link="/customers"
                />

                <StatCard
                    title={t('dashboard.total_sales')}
                    value={formatCurrency(stats.totalSales || 0)}
                    subValue={t('dashboard.sales_today', { amount: formatCurrency(stats.salesToday || 0) })}
                    icon={ShoppingBag}
                    color="green"
                    loading={loading}
                    link="/sales"
                />

                <StatCard
                    title={t('dashboard.total_expenses')}
                    value={formatCurrency(stats.totalExpenses || 0)}
                    subValue={t('dashboard.expenses_today', { amount: formatCurrency(stats.expensesToday || 0) })}
                    icon={Receipt}
                    color="red"
                    loading={loading}
                    link="/expenses"
                />

                <StatCard
                    title={t('dashboard.active_leads')}
                    value={stats.activeLeads || 0}
                    subValue={t('dashboard.excluding_won_lost')}
                    icon={Target}
                    color="purple"
                    loading={loading}
                    link="/leads"
                />

                <StatCard
                    title={t('dashboard.stock_inventory')}
                    value={stats.stockQuantity || 0}
                    subValue={t('dashboard.stock_value', { amount: formatCurrency(stats.stockValue || 0) })}
                    icon={Package}
                    color="orange"
                    loading={loading}
                    link="/stock"
                />

                <StatCard
                    title={t('dashboard.active_projects')}
                    value={stats.activeProjects || 0}
                    subValue={t('dashboard.in_progress')}
                    icon={Briefcase}
                    color="brown"
                    loading={loading}
                    link="/projects"
                />

                <StatCard
                    title={t('dashboard.pending_tasks')}
                    value={stats.pendingTasks || 0}
                    subValue={t('dashboard.tasks_to_complete')}
                    icon={CheckSquare}
                    color="indigo"
                    loading={loading}
                    link="/tasks"
                />

                <StatCard
                    title={t('dashboard.net_earnings')}
                    value={formatCurrency(stats.netEarnings || 0)}
                    subValue={t('dashboard.sales_minus_expenses')}
                    icon={TrendingUp}
                    color="blue"
                    loading={loading}
                />

            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('dashboard.income_vs_expense')}</h2>
                        <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-medium px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100">
                            <option>{t('dashboard.last_30_days')}</option>
                        </select>
                    </div>

                    <div className="h-[400px]">
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary-500" size={48} />
                            </div>
                        ) : (
                            <Line data={chartData} options={chartOptions} />
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('dashboard.recent_activity')}</h2>
                    <div className="space-y-6">

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-2.5 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-1"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                                            <div className="h-3 bg-slate-50 dark:bg-slate-900 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : activities.length > 0 ? (
                            activities.map((activity, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="relative mt-1">
                                        <div className="w-2.5 h-2.5 bg-primary-500 rounded-full z-10 relative"></div>
                                        {i !== activities.length - 1 && (
                                            <div className="absolute top-2.5 left-1 w-0.5 h-12 bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-100 transition-colors"></div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {activity.action} {activity.entity_type} {activity.entity_id ? `#${activity.entity_id}` : ''}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                            {new Date(activity.created_at).toLocaleString()} • by {activity.user_name || t('common.system') || 'System'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">{t('dashboard.no_activity')}</p>
                        )}

                    </div>
                    <button
                        className="w-full mt-8 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors cursor-pointer"
                        onClick={() => navigate('/activity')}
                    >
                        {t('dashboard.view_all_activity')}
                    </button>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Status Chart */}
                <div className="card">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('dashboard.project_status_overview')}</h2>
                    <div className="h-[300px] flex justify-center">

                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary-500" size={32} />
                            </div>
                        ) : (
                            <Doughnut
                                data={projectStatusData}
                                options={{
                                    ...chartOptions,
                                    cutout: '70%',
                                    plugins: {
                                        ...chartOptions.plugins,
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                padding: 20,
                                                usePointStyle: true,
                                                font: { family: 'Inter', size: 12 },
                                                color: isDark ? '#94a3b8' : '#64748b'
                                            }
                                        }
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Task Workload Chart */}
                <div className="card">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('dashboard.task_workload_user')}</h2>
                    <div className="h-[300px]">

                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary-500" size={32} />
                            </div>
                        ) : (
                            <Bar
                                data={taskWorkloadData}
                                options={{
                                    ...chartOptions,
                                    scales: {
                                        x: { ...chartOptions.scales.x, stacked: true },
                                        y: { ...chartOptions.scales.y, stacked: true }
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
