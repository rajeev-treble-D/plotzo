import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import {
    Settings as SettingsIcon,
    Check,
    Building,
    Sparkles,
    Clock,
    Lock,
    AlertCircle,
    Shield,
    Trash2,
    Mail,
} from 'lucide-react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';


const currencies = [
    { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
    { code: 'ALL', symbol: 'L', name: 'Albanian Lek' },
    { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza' },
    { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
    { code: 'AMD', symbol: '֏', name: 'Armenian Dram' },
    { code: 'AWG', symbol: 'ƒ', name: 'Aruban Florin' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' },
    { code: 'BSD', symbol: '$', name: 'Bahamian Dollar' },
    { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' },
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
    { code: 'BBD', symbol: '$', name: 'Barbadian Dollar' },
    { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble' },
    { code: 'BZD', symbol: 'BZ$', name: 'Belize Dollar' },
    { code: 'BMD', symbol: '$', name: 'Bermudian Dollar' },
    { code: 'BTN', symbol: 'Nu.', name: 'Bhutanese Ngultrum' },
    { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano' },
    { code: 'BAM', symbol: 'KM', name: 'Bosnia-Herzegovina Convertible Mark' },
    { code: 'BWP', symbol: 'P', name: 'Botswanan Pula' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'GBP', symbol: '£', name: 'British Pound Sterling' },
    { code: 'BND', symbol: '$', name: 'Brunei Dollar' },
    { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
    { code: 'BIF', symbol: 'FBu', name: 'Burundian Franc' },
    { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CVE', symbol: '$', name: 'Cape Verdean Escudo' },
    { code: 'KYD', symbol: '$', name: 'Cayman Islands Dollar' },
    { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
    { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'COP', symbol: '$', name: 'Colombian Peso' },
    { code: 'KMF', symbol: 'CF', name: 'Comorian Franc' },
    { code: 'CDF', symbol: 'FC', name: 'Congolese Franc' },
    { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón' },
    { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
    { code: 'CUP', symbol: '₱', name: 'Cuban Peso' },
    { code: 'CZK', symbol: 'Kč', name: 'Czech Republic Koruna' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
    { code: 'DJF', symbol: 'Fdj', name: 'Djiboutian Franc' },
    { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso' },
    { code: 'XCD', symbol: '$', name: 'East Caribbean Dollar' },
    { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
    { code: 'ERN', symbol: 'Nfk', name: 'Eritrean Nakfa' },
    { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
    { code: 'FJD', symbol: '$', name: 'Fijian Dollar' },
    { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi' },
    { code: 'GEL', symbol: '₾', name: 'Georgian Lari' },
    { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
    { code: 'GIP', symbol: '£', name: 'Gibraltar Pound' },
    { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' },
    { code: 'GNF', symbol: 'FG', name: 'Guinean Franc' },
    { code: 'GYD', symbol: '$', name: 'Guyanaese Dollar' },
    { code: 'HTG', symbol: 'G', name: 'Haitian Gourde' },
    { code: 'HNL', symbol: 'L', name: 'Honduran Lempira' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
    { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
    { code: 'IRR', symbol: '﷼', name: 'Iranian Rial' },
    { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar' },
    { code: 'ILS', symbol: '₪', name: 'Israeli New Sheqel' },
    { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar' },
    { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar' },
    { code: 'KGS', symbol: 'лв', name: 'Kyrgystani Som' },
    { code: 'LAK', symbol: '₭', name: 'Laotian Kip' },
    { code: 'LBP', symbol: '£', name: 'Lebanese Pound' },
    { code: 'LSL', symbol: 'L', name: 'Lesotho Loti' },
    { code: 'LRD', symbol: '$', name: 'Liberian Dollar' },
    { code: 'LYD', symbol: 'LD', name: 'Libyan Dinar' },
    { code: 'MOP', symbol: 'MOP$', name: 'Macanese Pataca' },
    { code: 'MKD', symbol: 'ден', name: 'Macedonian Denar' },
    { code: 'MGA', symbol: 'Ar', name: 'Malagasy Ariary' },
    { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa' },
    { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee' },
    { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
    { code: 'MDL', symbol: 'L', name: 'Moldovan Leu' },
    { code: 'MNT', symbol: '₮', name: 'Mongolian Tugrik' },
    { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham' },
    { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical' },
    { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat' },
    { code: 'NAD', symbol: '$', name: 'Namibian Dollar' },
    { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee' },
    { code: 'ANG', symbol: 'ƒ', name: 'Netherlands Antillean Guilder' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
    { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'KPW', symbol: '₩', name: 'North Korean Won' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
    { code: 'OMR', symbol: '﷼', name: 'Omani Rial' },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
    { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa' },
    { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina' },
    { code: 'PYG', symbol: 'Gs', name: 'Paraguayan Guarani' },
    { code: 'PEN', symbol: 'S/.', name: 'Peruvian Nuevo Sol' },
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
    { code: 'QAR', symbol: '﷼', name: 'Qatari Rial' },
    { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
    { code: 'RWF', symbol: 'RF', name: 'Rwandan Franc' },
    { code: 'SHP', symbol: '£', name: 'Saint Helena Pound' },
    { code: 'WST', symbol: 'T', name: 'Samoan Tala' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
    { code: 'RSD', symbol: 'Дин.', name: 'Serbian Dinar' },
    { code: 'SCR', symbol: '₨', name: 'Seychellois Rupee' },
    { code: 'SLL', symbol: 'Le', name: 'Sierra Leonean Leone' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'SBD', symbol: '$', name: 'Solomon Islands Dollar' },
    { code: 'SOS', symbol: 'S', name: 'Somali Shilling' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'LKR', symbol: '₨', name: 'Sri Lankan Rupee' },
    { code: 'SDG', symbol: 'ج.س.', name: 'Sudanese Pound' },
    { code: 'SRD', symbol: '$', name: 'Surinamese Dollar' },
    { code: 'SZL', symbol: 'E', name: 'Swazi Lilangeni' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'SYP', symbol: '£', name: 'Syrian Pound' },
    { code: 'TWD', symbol: 'NT$', name: 'Taiwan New Dollar' },
    { code: 'TJS', symbol: 'SM', name: 'Tajikistani Somoni' },
    { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'TOP', symbol: 'T$', name: 'Tongan Paʻanga' },
    { code: 'TTD', symbol: 'TT$', name: 'Trinidad and Tobago Dollar' },
    { code: 'TND', symbol: 'DT', name: 'Tunisian Dinar' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
    { code: 'TMT', symbol: 'T', name: 'Turkmenistani Manat' },
    { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
    { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
    { code: 'AED', symbol: 'د.إ', name: 'United Arab Emirates Dirham' },
    { code: 'USD', symbol: '$', name: 'United States Dollar' },
    { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
    { code: 'UZS', symbol: 'лв', name: 'Uzbekistan Som' },
    { code: 'VUV', symbol: 'VT', name: 'Vanuatu Vatu' },
    { code: 'VEF', symbol: 'Bs', name: 'Venezuelan Bolívar' },
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
    { code: 'YER', symbol: '﷼', name: 'Yemeni Rial' },
    { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' },
].sort((a, b) => a.name.localeCompare(b.name));

const timezones = Intl.supportedValuesOf('timeZone').map(tz => ({
    value: tz,
    label: tz
}));

const Settings = () => {
    const [activeTab, setActiveTab] = useState('General');
    const { theme, setTheme } = useTheme();
    const { settings: globalSettings, updateSettings } = useSettings();
    const { t } = useTranslation();
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'success' });


    const tabs = [
        { id: 'General', icon: SettingsIcon },
        { id: 'Email', icon: Mail },
        { id: 'AI Settings', icon: Sparkles },
        { id: 'System', icon: Shield },
    ];

    const [settings, setSettings] = useState({
        gemini_api_key: '',
        ...globalSettings
    });
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        setSettings(prev => ({ ...prev, ...globalSettings }));
    }, [globalSettings]);

    const handleSave = async () => {
        setLoading(true);
        const result = await updateSettings(settings);
        if (result.success) {
            setModalConfig({
                isOpen: true,
                title: t('settings.modals.updated_title'),
                message: t('settings.modals.updated_msg'),
                type: 'success'
            });
        } else {
            setModalConfig({
                isOpen: true,
                title: t('settings.modals.failed_title'),
                message: `${t('settings.modals.failed_msg')}: ${result.error}`,
                type: 'error'
            });
        }

        setLoading(false);
    };

    const handleClearLogs = async () => {
        setModalConfig({
            isOpen: true,
            title: t('settings.modals.confirm_title'),
            message: t('settings.modals.confirm_msg'),
            type: 'confirm',

            onConfirm: async () => {
                setLoading(true);
                setModalConfig({ ...modalConfig, isOpen: false });
                try {
                    const res = await api.delete('/dashboard/activity/clear');
                    if (res.data.success) {
                        setModalConfig({
                            isOpen: true,
                            title: t('settings.modals.logs_cleared_title'),
                            message: t('settings.modals.logs_cleared_msg'),
                            type: 'success'
                        });
                    }

                } catch (err) {
                    setModalConfig({
                        isOpen: true,
                        title: t('common.error'),
                        message: err.response?.data?.message || t('settings.system.clear_error'),
                        type: 'error'
                    });
                } finally {

                    setLoading(false);
                }
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">{t('settings.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('settings.subtitle')}</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-primary disabled:opacity-50"
                >
                    {loading ? t('settings.saving') : t('settings.save_btn')}
                </button>

            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-600 dark:text-primary-400 border border-slate-100 dark:border-slate-700'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            <tab.icon size={20} />
                            {t(`settings.tabs.${tab.id}`)}
                        </button>

                    ))}
                </div>

                {/* Settings Form */}
                <div className="flex-1 space-y-6">
                    {activeTab === 'General' && (
                        <>
                            <div className="card">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('settings.general.title')}</h2>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('settings.general.company_name')}</label>
                                            <input

                                                type="text"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all"
                                                value={settings.company_name || ''}
                                                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                                placeholder="Puku CRM Solutions"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('settings.general.support_email')}</label>
                                            <input

                                                type="email"
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all"
                                                value={settings.support_email || ''}
                                                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                                                placeholder="support@puku.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('settings.general.default_currency')}</label>
                                            <select

                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all"
                                                value={settings.default_currency || 'USD ($)'}
                                                onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
                                            >
                                                {currencies.map(c => (
                                                    <option key={c.code} value={`${c.code} (${c.symbol})`}>
                                                        {c.code} ({c.symbol}) - {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                                <Clock size={16} /> {t('settings.general.timezone')}
                                            </label>

                                            <select
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all font-mono text-sm"
                                                value={settings.timezone || 'America/New_York'}
                                                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                            >
                                                {timezones.map(tz => (
                                                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-3 pt-2">
                                            <input
                                                type="checkbox"
                                                id="show_clock"
                                                className="w-5 h-5 rounded-lg border-slate-200 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                                checked={settings.show_clock !== 'false' && settings.show_clock !== false && settings.show_clock !== '0' && settings.show_clock !== 0}
                                                onChange={(e) => setSettings({ ...settings, show_clock: e.target.checked })}
                                            />
                                            <label htmlFor="show_clock" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                                                {t('settings.general.show_clock')}
                                            </label>
                                        </div>

                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('settings.general.appearance')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['light', 'dark'].map((t_mode) => (
                                            <div
                                                key={t_mode}
                                                onClick={() => setTheme(t_mode)}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${theme === t_mode
                                                    ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/20'
                                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">{t(`settings.general.${t_mode}_mode`)}</span>
                                                    {theme === t_mode && <div className="bg-primary-600 text-white p-1 rounded-full"><Check size={12} /></div>}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className={`h-2 w-full rounded-full ${t_mode === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                                                    <div className={`h-2 w-2/3 rounded-full ${t_mode === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Email' && (
                        <div className="card animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('settings.email.title')}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.email.subtitle')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('settings.email.host')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all font-mono text-sm"
                                            value={settings.smtp_host || ''}
                                            onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                                            placeholder={t('settings.email.placeholder_host')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('settings.email.port')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all font-mono text-sm"
                                            value={settings.smtp_port || ''}
                                            onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                                            placeholder="587"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('settings.email.user')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all font-mono text-sm"
                                            value={settings.smtp_user || ''}
                                            onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                                            placeholder={t('settings.email.placeholder_user')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('settings.email.pass')}</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all font-mono text-sm"
                                            value={settings.smtp_pass || ''}
                                            onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('settings.email.from_email')}</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all font-mono text-sm"
                                            value={settings.smtp_from_email || ''}
                                            onChange={(e) => setSettings({ ...settings, smtp_from_email: e.target.value })}
                                            placeholder={t('settings.email.placeholder_from')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('settings.email.from_name')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all font-mono text-sm"
                                            value={settings.smtp_from_name || ''}
                                            onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                                            placeholder={t('settings.email.placeholder_name')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'AI Settings' && (
                        <div className="card animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('settings.ai.title')}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.ai.subtitle')}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('settings.ai.api_key')}</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={settings.gemini_api_key || ''}
                                            onChange={(e) => setSettings({ ...settings, gemini_api_key: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all pr-12"
                                            placeholder={t('settings.ai.api_key_placeholder')}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Lock size={18} />
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                        {t('settings.ai.get_key')} <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Google AI Studio</a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'System' && (
                        <div className="card animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('settings.system.title')}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.system.subtitle')}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl border-2 border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                                <AlertCircle size={20} /> {t('settings.system.danger_zone')}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md">
                                                {t('settings.system.danger_desc')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-red-100 dark:border-red-900/30">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t('settings.system.clear_logs')}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {t('settings.system.clear_logs_desc')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleClearLogs}
                                                disabled={loading}
                                                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-100 dark:shadow-none active:scale-[0.98] disabled:opacity-50"
                                            >
                                                <Trash2 size={18} />
                                                {t('settings.system.clear_btn')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Success/Error Modal */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                        onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                    ></div>
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-slate-200 dark:border-slate-800">
                        <div className="p-8 text-center">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg ${modalConfig.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-green-100 dark:shadow-none'
                                : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-red-100 dark:shadow-none'
                                }`}>
                                {modalConfig.type === 'success' ? <Check size={40} /> : <AlertCircle size={40} />}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                                {modalConfig.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">
                                {modalConfig.message}
                            </p>
                            <button
                                onClick={() => {
                                    if (modalConfig.type === 'confirm') {
                                        modalConfig.onConfirm();
                                    } else {
                                        setModalConfig({ ...modalConfig, isOpen: false });
                                    }
                                }}
                                className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-xl active:scale-[0.98] ${modalConfig.type === 'success'
                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-200 dark:shadow-none'
                                    : modalConfig.type === 'confirm'
                                        ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'
                                        : 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'
                                    }`}
                            >
                                {modalConfig.type === 'confirm' ? t('settings.modals.confirm_btn') : t('settings.modals.continue')}
                            </button>
                            {modalConfig.type === 'confirm' && (
                                <button
                                    onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                                    className="w-full mt-4 py-3 rounded-2xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                                >
                                    {t('common.cancel')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
