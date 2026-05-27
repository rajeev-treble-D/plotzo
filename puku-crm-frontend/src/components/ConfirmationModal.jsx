import React from 'react';
import { AlertTriangle, Loader2, X, Trash2, AlertCircle } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onConfirm,
    onCancel,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    type = 'danger', // 'danger' | 'warning' | 'info'
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loading = false
}) => {
    if (!isOpen) return null;

    const styles = {
        danger: {
            icon: Trash2,
            iconBg: 'bg-red-50 dark:bg-red-900/20',
            iconColor: 'text-red-600',
            buttonBg: 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-amber-50 dark:bg-amber-900/20',
            iconColor: 'text-amber-600',
            buttonBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:shadow-none'
        },
        info: {
            icon: AlertCircle,
            iconBg: 'bg-blue-50 dark:bg-blue-900/20',
            iconColor: 'text-blue-600',
            buttonBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none'
        }
    };

    const currentStyle = styles[type] || styles.danger;
    const Icon = currentStyle.icon;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onCancel}
            ></div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                <div className="p-8 text-center text-slate-900 dark:text-white">
                    <div className={`w-16 h-16 ${currentStyle.iconBg} ${currentStyle.iconColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <Icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <div className="text-slate-500 dark:text-slate-400 mb-6 font-semibold whitespace-pre-line text-sm leading-relaxed">
                        {message}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-4 py-2.5 rounded-xl ${currentStyle.buttonBg} text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50`}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
