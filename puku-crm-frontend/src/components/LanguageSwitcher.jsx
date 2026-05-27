import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
];

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest('#language-switcher')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang.code);
        document.documentElement.dir = lang.dir;
        setIsOpen(false);
    };

    // Set initial direction
    useEffect(() => {
        document.documentElement.dir = currentLanguage.dir;
    }, []);

    return (
        <div className="relative" id="language-switcher">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors outline-none"
                title="Change language"
            >
                <Languages size={20} />
                <span className="hidden sm:inline text-sm font-medium">{currentLanguage.flag} {currentLanguage.name}</span>
                <ChevronDown size={14} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 transition-all">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang)}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 mx-0",
                                i18n.language === lang.code ? "text-primary-600 dark:text-primary-400" : "text-slate-600 dark:text-slate-400"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                            </span>
                            {i18n.language === lang.code && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
