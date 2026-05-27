import React, { useState } from 'react';
import {
    MessageSquare,
    Search,
    Send,
    Phone,
    Video,
    MoreVertical,
    Paperclip,
    Smile,
    User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';


const Support = () => {
    const { t } = useTranslation();
    const [message, setMessage] = useState('');


    const contacts = [
        { id: 1, name: 'Malika Karmen', lastMsg: 'I need help with the invoice...', time: '12:45 PM', unread: 2, status: 'online' },
        { id: 2, name: 'Akram Dmh', lastMsg: 'Thanks for the quick response!', time: '11:20 AM', unread: 0, status: 'offline' },
        { id: 3, name: 'Pankaj Shergill', lastMsg: 'The project deadline is tight.', time: t('support.yesterday'), unread: 0, status: 'online' },
        { id: 4, name: 'Sarah Jenkins', lastMsg: 'Can you check the stock levels?', time: t('support.yesterday'), unread: 5, status: 'busy' },
    ];


    const chatMessages = [
        { id: 1, text: 'Hello! I have a question about my last order #INV-1024.', time: '12:40 PM', sender: 'client' },
        { id: 2, text: 'Hi Malika! Sure, let me check that for you right away.', time: '12:42 PM', sender: 'admin' },
        { id: 3, text: 'I noticed some discrepancies in the tax calculation.', time: '12:43 PM', sender: 'client' },
        { id: 4, text: 'You are right. It seems like the 10% tax was applied incorrectly to the subtotal. I am fixing it now.', time: '12:45 PM', sender: 'admin' },
    ];

    return (
        <div className="h-[calc(100vh-12rem)] flex overflow-hidden card !p-0">
            {/* Contact List */}
            <div className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col hidden lg:flex">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('support.title')}</h2>
                    <div className="relative">

                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={t('support.search_chats')}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-slate-100 transition-all"
                        />

                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {contacts.map((contact) => (
                        <div key={contact.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex gap-3 relative group border-l-4 border-transparent hover:border-primary-500">
                            <div className="relative">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-primary-600 dark:text-primary-400">
                                    {contact.name.charAt(0)}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-slate-900 rounded-full ${contact.status === 'online' ? 'bg-green-500' :
                                    contact.status === 'busy' ? 'bg-red-500' :
                                        'bg-slate-300 dark:bg-slate-600'
                                    }`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{contact.name}</p>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{contact.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{contact.lastMsg}</p>
                            </div>
                            {contact.unread > 0 && (
                                <div className="absolute top-1/2 -translate-y-1/2 right-4 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {contact.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Windows */}
            <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950/20">
                {/* Chat Header */}
                <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center font-bold">M</div>
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white">Malika Karmen</p>
                            <p className="text-xs text-green-500 dark:text-green-400 font-bold uppercase tracking-wider">{t('support.active_now')}</p>
                        </div>

                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
                            <Phone size={20} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
                            <Video size={20} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="text-center">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">{t('support.today')}</span>
                    </div>

                    {chatMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${msg.sender === 'admin' ? 'order-2' : ''}`}>
                                <div className={`p-4 rounded-3xl text-sm font-medium shadow-sm ${msg.sender === 'admin'
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-100 dark:border-slate-800'
                                    }`}>
                                    {msg.text}
                                </div>
                                <p className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 ${msg.sender === 'admin' ? 'text-right' : ''}`}>
                                    {msg.time} {msg.sender === 'admin' && `• ${t('support.read')}`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-2 flex items-center gap-2 border border-slate-100 dark:border-slate-700 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 dark:focus-within:ring-primary-900/10 transition-all">
                        <button className="p-2 text-slate-400 hover:text-primary-600">
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="text"
                            placeholder={t('support.type_message')}
                            className="flex-1 bg-transparent border-none py-2 text-sm focus:ring-0 outline-none text-slate-900 dark:text-slate-100"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />

                        <button className="p-2 text-slate-400 hover:text-primary-600">
                            <Smile size={20} />
                        </button>
                        <button className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-700 shadow-md shadow-primary-200 transition-all active:scale-95">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
