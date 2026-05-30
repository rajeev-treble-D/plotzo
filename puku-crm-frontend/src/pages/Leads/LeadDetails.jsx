import React, { useCallback, useEffect, useState } from 'react';
import {
    Building2,
    Phone,
    Mail,
    Calendar,
    MapPin,
    UserRound,
    Banknote,
    Layers,
    MessageSquare,
    Clock,
    ArrowRight,
    Tag,
    Send,
    Star,
    Handshake,
    X,
    CheckCircle2,
    XCircle,
    Loader2,
} from 'lucide-react';
import api from '../../services/api'
import { useToast } from '../../context/ToastContext';

const tempratureOptions = ['Cold', 'Warm', 'Hot', 'Very Hot', 'Mature'];
const nextFollowUpOptions = ['Call', 'Site Visit', 'Meeting', 'Whatsapp', 'Email'];
const intrestOptions = ['Very Intrested', 'Intrested', 'Neutral', 'Not Intrested'];
const nextActionOptions = ['Follow Up Calls', 'Send Quotation', 'Schedule Meeting', 'Move to Negotiation', 'Booking', 'Close'];
const paymentPlanOptions = ['Full Payment', 'Construction Linked', 'EMI - 12 Months', 'EMI - 24 Months', 'EMI - 36 Months'];
const lossReasonOptions = ['Budget Issue', 'Location Not Preferred', 'Chose Competitor', 'Not Interested Anymore', 'Could Not Reach', 'Other'];

// Status badge styling generator
const getStatusStyles = (status) => {
    switch (status) {
        case 'New':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-100';
        case 'Follow-up':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-100';
        case 'Site Visit':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-100';
        case 'Negotiation':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-100';
        case 'Booking':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100';
        case 'Documentation':
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-100';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
};

// Temperature badge styling generator
const getTempratureStyle = (temprature) => {
    switch (temprature) {
        case 'Cold':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-100';
        case 'Warm':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-100';
        case 'Hot':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-100';
        case 'Very Hot':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100';
        case 'Mature':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400';
    }
};

// Enquiry type badge styling generator
const getLeadTypeStyle = (leadType) => {
    switch (leadType) {
        case 'Tele':
            return 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300';
        case 'Sales':
            return 'bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300';
        default:
            return 'bg-gray-100 text-slate-700 dark:bg-gray-800/30 dark:text-slate-400';
    }
};

// Format ISO date string into readable text (e.g. 30 May 2026)
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return dateStr;
    }
};

// Format time string (e.g., 17:14:00 to 05:14 pm)
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'pm' : 'am';
        const displayH = h % 12 || 12;
        return `${displayH}:${minutes} ${ampm}`;
    } catch {
        return timeStr;
    }
};
const dispositionOptions = [
    'Called & Talked',
    'No Answer',
    'Busy',
    'Switched Off',
    'Site Visit Done',
    'Mature',
    'Negotiation',
    'Closed Won',
    'Closed Lost',
];

const LeadDetails = ({ lead }) => {
    const [selectedDisposition, setSelectedDisposition] = useState('');
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const [followupHistory, setFollowupHistory] = useState([])

    const handleFieldChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleDispositionChange = (value) => {
        setSelectedDisposition(value);
        setFormData({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        const payload = {
            lead_id: lead.id,
            disposition: selectedDisposition,
            meta: formData,
            created_by: lead.assignedTo,
        };
        try {
            await api.post('/followups', payload);
            showToast('Follow-up updated', 'success');
        } catch {
            showToast('Failed to update follow-up', 'error');
        } finally {
            setLoading(false);
            setFormData({});
        }
    }

    useEffect(()=>{
        fetchFollowupHistory()
    },[])

    console.log(followupHistory)
    const fetchFollowupHistory = async() => {
        try {
            const res = await api.get(`followups/lead/${lead.id}`);
            setFollowupHistory(res.data.followUps)
        } catch (error) {
            console.log(error)
        }
    }

    if (!lead) return null;
    const location = [lead.city_name, lead.state_name].filter(Boolean).join(', ');

    return (
        <div className="max-h-[82vh] overflow-y-auto">
            {/* Dark Sleek Header Banner */}
            <div className="bg-slate-950 text-white p-6 sm:p-7 relative border-b border-slate-800">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                    <div className="flex gap-4 items-center">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 font-bold text-xl tracking-wider shadow-lg">
                            {lead.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'L'}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-400">
                                #LEAD-{1000 + Number(lead.id || 0)}
                            </p>
                            <h3 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
                                {lead.name}
                            </h3>
                            {/* Subtitle Contact Details */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-300">
                                {lead.phone && (
                                    <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                                        <Phone size={13} className="text-slate-400" />
                                        {lead.phone}
                                    </a>
                                )}
                                {lead.email && (
                                    <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                                        <Mail size={13} className="text-slate-400" />
                                        {lead.email}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Badges */}
                    <div className="flex flex-wrap gap-2 md:self-center">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getLeadTypeStyle(lead.enquiryType)}`}>
                            {lead.enquiryType || 'Tele'}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getTempratureStyle(lead.temprature)}`}>
                            {lead.temprature || 'Cold'}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyles(lead.status)}`}>
                            {lead.status || 'New'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Details Area */}
            <div className="p-6 sm:p-7 bg-white dark:bg-slate-900">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    {/* Left & Middle Column: Enquiry & History */}
                    <div className="lg:col-span-6 space-y-6">
                        {/* Enquiry Details Card */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-5">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-0.5">
                                Enquiry Details
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Property */}
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 flex items-center justify-center shrink-0">
                                        <Building2 size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                            Property
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                            {lead.specificProperty || lead.propertyType || '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Type */}
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                                        <Layers size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                            Type
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white mt-0.5 capitalize">
                                            {lead.propertyType || '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Source */}
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                                        <Tag size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                            Source
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                            {lead.source || '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Budget */}
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                                        <Banknote size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                            Budget
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                            {lead.budget || 'Budget not specified'}
                                        </p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                            Location Preference
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                            {location || 'No location set'}
                                        </p>
                                    </div>
                                </div>

                                {/* Assigned To */}
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0">
                                        <UserRound size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                            Assigned To
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                                            {lead.assigned_user_name || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider & Note */}
                            {lead.note && (
                                <>
                                    <div className="border-t border-slate-200 dark:border-slate-800 my-4"></div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                            Internal Notes
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {lead.note}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Follow-up History (Static for now) */}
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-5 ml-0.5">
                                Follow-up History ({followupHistory?.length})
                            </h4>

                            <div className="relative pl-10 border-l border-slate-200 dark:border-slate-800 ml-4 space-y-6">
                                {/* Timeline Dot & Circle */}
                                <div className="absolute -left-5 top-1.5 w-10 h-10 rounded-full bg-emerald-500 dark:bg-emerald-600 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shrink-0 shadow-md">
                                    <MessageSquare size={16} />
                                </div>

                                {/* Timeline Item Card */}
                                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                                    {/* Badges & Date */}
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex gap-2">
                                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                                                WhatsApp
                                            </span>
                                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                Called & Talked
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 inline-flex items-center gap-1">
                                            <Clock size={12} />
                                            26 May 2026, 10:30 am
                                        </div>
                                    </div>

                                    {/* Call Note Content */}
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                        Shared loan options
                                    </p>

                                    {/* Action Footnote Row */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400">
                                        <div className="inline-flex items-center gap-1 text-primary-500">
                                            <ArrowRight size={13} />
                                            Next: Follow up on loan pre-approval
                                        </div>
                                        <div className="inline-flex items-center gap-1">
                                            <UserRound size={12} />
                                            Liam Walker
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Update Follow-up */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="space-y-5">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                Update Follow-Up
                            </h4>

                            {/* Current Scheduled Info Box */}
                            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30 text-primary-950 dark:text-primary-200 text-sm font-semibold flex flex-col gap-1.5 shadow-sm">
                                <div className="inline-flex items-center gap-2">
                                    <Calendar size={16} className="text-primary-500 shrink-0" />
                                    <span>
                                        Scheduled: {formatDate(lead.followupDate)}, {formatTime(lead.followupTime)}
                                    </span>
                                </div>
                                <div className="text-xs font-bold text-slate-400 inline-flex items-center gap-2 pl-6">
                                    <Phone size={12} />
                                    Call with {lead.name}
                                </div>
                            </div>

                            {/* Disposition Select Input */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                                    Disposition
                                </label>
                                <select
                                    value={selectedDisposition}
                                    onChange={(e) => handleDispositionChange(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm"
                                >
                                    <option value="">Select disposition...</option>
                                    {dispositionOptions.map((disposition, index) => (
                                        <option key={index} value={disposition}>
                                            {disposition}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedDisposition &&
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedDisposition == "Called & Talked" &&
                                            <>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">What did you discuss?
                                                    <textarea
                                                        value={formData.discussion_notes || ''}
                                                        onChange={(e) => handleFieldChange('discussion_notes', e.target.value)}
                                                        className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm"
                                                    ></textarea>
                                                </label>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" >Update Temprature
                                                    <select value={formData.temperature_update || lead.temprature} onChange={(e) => handleFieldChange('temperature_update', e.target.value)} className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm">
                                                        <option value={lead.temprature}>keep Current ({lead.temprature})</option>
                                                        {tempratureOptions.map((temprature, index) => (
                                                            <option key={index} value={temprature}>
                                                                {temprature}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Next Follow-up Date
                                                    <input type="date" value={formData.next_follow_up_date || ''} onChange={(e) => handleFieldChange('next_follow_up_date', e.target.value)} className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm" />
                                                </label>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Next Follow-up Time
                                                    <input type="time" value={formData.next_follow_up_time || ''} onChange={(e) => handleFieldChange('next_follow_up_time', e.target.value)} className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm" />
                                                </label>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" >Next Follow Up Type
                                                    <select value={formData.next_follow_up_type || ''} onChange={(e) => handleFieldChange('next_follow_up_type', e.target.value)} className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm">
                                                        <option value="">Select Type</option>
                                                        {nextFollowUpOptions.map((followUp, index) => (
                                                            <option key={index} value={followUp}>
                                                                {followUp}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </>
                                        }
                                        {(selectedDisposition === 'No Answer' || selectedDisposition === 'Busy' || selectedDisposition === 'Switched Off') &&
                                            <>
                                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Clock size={16} className="text-amber-500" />
                                                        <span className="text-sm font-black text-amber-800 dark:text-amber-200">Auto-rescheduled</span>
                                                    </div>
                                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 pl-6">
                                                        Client did not answer. Follow-up rescheduled for tomorrow at the same time.
                                                    </p>
                                                </div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    Additional Notes (Optional)
                                                    <textarea
                                                        placeholder="Any additional notes..."
                                                        rows={3}
                                                        value={formData.additional_notes || ''}
                                                        onChange={(e) => handleFieldChange('additional_notes', e.target.value)}
                                                        className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm resize-none"
                                                    ></textarea>
                                                </label>
                                            </>
                                        }
                                        {
                                            selectedDisposition === 'Site Visit Done' &&
                                            <>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Visit FeedBack
                                                    <textarea
                                                        value={formData.visit_feedback || ''}
                                                        onChange={(e) => handleFieldChange('visit_feedback', e.target.value)}
                                                        className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm"
                                                    ></textarea>
                                                </label>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" >Intrest Level
                                                    <select value={formData.interest_level || ''} onChange={(e) => handleFieldChange('interest_level', e.target.value)} className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm">
                                                        <option value="">Select Interest Level</option>
                                                        {intrestOptions.map((temprature, index) => (
                                                            <option key={index} value={temprature}>
                                                                {temprature}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" >Intrest Level
                                                    <select value={formData.next_action || ''} onChange={(e) => handleFieldChange('next_action', e.target.value)} className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm">
                                                        <option value="">Next Action</option>
                                                        {nextActionOptions.map((temprature, index) => (
                                                            <option key={index} value={temprature}>
                                                                {temprature}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </>
                                        }
                                        {selectedDisposition === 'Mature' &&
                                            <>
                                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Star size={16} className="text-emerald-500" />
                                                        <span className="text-sm font-black text-emerald-800 dark:text-emerald-200">Lead is Mature!</span>
                                                    </div>
                                                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 pl-6">
                                                        Client is ready to proceed. Set the discussion price and move to negotiation.
                                                    </p>
                                                </div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Discussion Price
                                                    <div className="relative mt-2">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                        <input
                                                            type="number"
                                                            placeholder="Enter amount"
                                                            value={formData.discussion_price || ''}
                                                            onChange={(e) => handleFieldChange('discussion_price', e.target.value)}
                                                            className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm"
                                                        />
                                                    </div>
                                                </label>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Property
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={lead.specificProperty || lead.propertyType || ''}
                                                        className="w-full px-4 mt-2 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 shadow-sm cursor-default"
                                                    />
                                                </label>
                                            </>
                                        }
                                        {selectedDisposition === 'Negotiation' &&
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Offered Price
                                                        <div className="relative mt-2">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                            <input
                                                                type="number"
                                                                placeholder="Client offer"
                                                                value={formData.offered_price || ''}
                                                                onChange={(e) => handleFieldChange('offered_price', e.target.value)}
                                                                className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm"
                                                            />
                                                        </div>
                                                    </label>
                                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Asking Price
                                                        <div className="relative mt-2">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                            <input
                                                                type="number"
                                                                placeholder="Our price"
                                                                value={formData.asking_price || ''}
                                                                onChange={(e) => handleFieldChange('asking_price', e.target.value)}
                                                                className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm"
                                                            />
                                                        </div>
                                                    </label>
                                                </div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Counter Offer
                                                    <div className="relative mt-2">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                        <input
                                                            type="number"
                                                            placeholder="Counter offer amount"
                                                            value={formData.counter_offer || ''}
                                                            onChange={(e) => handleFieldChange('counter_offer', e.target.value)}
                                                            className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm"
                                                        />
                                                    </div>
                                                </label>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Next Meeting Date
                                                    <input
                                                        type="datetime-local"
                                                        value={formData.next_meeting || ''}
                                                        onChange={(e) => handleFieldChange('next_meeting', e.target.value)}
                                                        className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm"
                                                    />
                                                </label>
                                            </>
                                        }
                                        {selectedDisposition === 'Closed Won' &&
                                            <>
                                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                                        <span className="text-sm font-black text-emerald-800 dark:text-emerald-200">Deal Closed - Won!</span>
                                                    </div>
                                                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 pl-6">
                                                        Congratulations! Enter the final deal details below.
                                                    </p>
                                                </div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Final Price
                                                    <div className="relative mt-2">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                        <input
                                                            type="number"
                                                            placeholder="Final agreed price"
                                                            value={formData.final_price || ''}
                                                            onChange={(e) => handleFieldChange('final_price', e.target.value)}
                                                            className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm"
                                                        />
                                                    </div>
                                                </label>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Booking Amount
                                                    <div className="relative mt-2">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                                        <input
                                                            type="number"
                                                            placeholder="Token / booking amount"
                                                            value={formData.booking_amount || ''}
                                                            onChange={(e) => handleFieldChange('booking_amount', e.target.value)}
                                                            className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm"
                                                        />
                                                    </div>
                                                </label>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Payment Plan
                                                    <select value={formData.payment_plan || ''} onChange={(e) => handleFieldChange('payment_plan', e.target.value)} className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm">
                                                        <option value="">Select payment plan...</option>
                                                        {paymentPlanOptions.map((plan, index) => (
                                                            <option key={index} value={plan}>{plan}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </>
                                        }
                                        {selectedDisposition === 'Closed Lost' &&
                                            <>
                                                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <XCircle size={16} className="text-red-500" />
                                                        <span className="text-sm font-black text-red-800 dark:text-red-200">Deal Closed - Lost</span>
                                                    </div>
                                                    <p className="text-xs font-semibold text-red-700 dark:text-red-300 pl-6">
                                                        Please record the reason for losing this lead.
                                                    </p>
                                                </div>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Reason for Loss
                                                    <select value={formData.loss_reason || ''} onChange={(e) => handleFieldChange('loss_reason', e.target.value)} className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm">
                                                        <option value="">Select reason...</option>
                                                        {lossReasonOptions.map((reason, index) => (
                                                            <option key={index} value={reason}>{reason}</option>
                                                        ))}
                                                    </select>
                                                </label>
                                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Notes
                                                    <textarea
                                                        placeholder="Additional details about why the deal was lost..."
                                                        rows={3}
                                                        value={formData.loss_notes || ''}
                                                        onChange={(e) => handleFieldChange('loss_notes', e.target.value)}
                                                        className="w-full px-4 mt-2 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold text-slate-900 dark:text-slate-100 transition-all shadow-sm resize-none"
                                                    ></textarea>
                                                </label>
                                            </>
                                        }
                                    </div>
                                    <div className="py-4 flex justify-end gap-3">
                                        {selectedDisposition === 'Mature' ? (
                                            <button
                                                className="w-full btn bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-sm transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                                type="submit"
                                                disabled={loading}
                                                aria-busy={loading}
                                            >
                                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Handshake size={16} />}
                                                {loading ? 'Moving...' : 'Move to Negotiation'}
                                            </button>
                                        ) : (
                                            <button
                                                className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                                type="submit"
                                                disabled={loading}
                                                aria-busy={loading}
                                            >
                                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                {loading ? 'Updating...' : 'Update Follow Up'}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadDetails;
