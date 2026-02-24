import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Card } from './Card';
import { UserPlus, ChevronRight, Check, Shield, Activity, Phone, User as UserIcon, AlertTriangle, Camera } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from '../lib/toast';
import { CameraCapture } from './CameraCapture';

export function MembershipRegistration({ onComplete, user }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        branchId: '',
        category: 'Normal Membership',
        duration: 'Monthly',
        paymentMethod: 'Cash',
        photo: null,
    });
    const [branches, setBranches] = useState([]);
    const [loadingBranches, setLoadingBranches] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        apiFetch('/branches')
            .then(data => {
                let availableBranches = data;
                if (user?.role === 'receptionist' && user?.branch_id) {
                    availableBranches = data.filter(b => b.id === user.branch_id);
                }
                setBranches(availableBranches);
                if (availableBranches.length > 0) {
                    setFormData(prev => ({ ...prev, branchId: availableBranches[0].id }));
                }
            })
            .catch(err => console.error('Fetch branches error:', err))
            .finally(() => setLoadingBranches(false));
    }, []);

    const validatePhone = (phone) => {
        if (!phone) return 'Phone number is required';
        const cleaned = phone.replace(/[\s\-]/g, '');
        if (!/^\+?250\d{9}$/.test(cleaned) && !/^0\d{9}$/.test(cleaned)) {
            return 'Enter a valid Rwandan number (e.g. +250781234567)';
        }
        return null;
    };

    const validateName = (name) => {
        if (!name || name.trim().length < 3) return 'Full name is required (min 3 characters)';
        if (name.trim().split(/\s+/).length < 2) return 'Enter first and last name';
        return null;
    };

    const formatPhone = (value) => {
        let cleaned = value.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('07') || cleaned.startsWith('078') || cleaned.startsWith('072') || cleaned.startsWith('073')) {
            cleaned = '+250' + cleaned.slice(1);
        }
        return cleaned;
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhone(e.target.value);
        setFormData({ ...formData, phone: formatted });
        if (errors.phone) {
            setErrors({ ...errors, phone: validatePhone(formatted) });
        }
    };

    const handleNameChange = (e) => {
        setFormData({ ...formData, fullName: e.target.value });
        if (errors.fullName) {
            setErrors({ ...errors, fullName: validateName(e.target.value) });
        }
    };

    const categories = [
        { name: 'Normal Membership', price: 30000, desc: 'Comprehensive Gym Access' },
        { name: 'Group Membership', price: 20000, desc: 'Corporate / Linked Tier' },
    ];

    const durations = [
        { name: 'Weekly', discount: 0 },
        { name: 'Monthly', discount: 0 },
        { name: '3 Months', discount: 10 },
        { name: 'Annual', discount: 20 },
    ];

    const calculatePrice = () => {
        const base = categories.find(c => c.name === formData.category)?.price || 0;
        const duration = durations.find(d => d.name === formData.duration);

        let price = base;
        if (formData.duration === 'Weekly') price = Math.round(base / 3);
        else if (formData.duration === '3 Months') price = (base * 3) * (1 - duration.discount / 100);
        else if (formData.duration === 'Annual') price = (base * 12) * (1 - duration.discount / 100);

        return price.toLocaleString();
    };

    const validateStep1 = () => {
        const nameErr = validateName(formData.fullName);
        const phoneErr = validatePhone(formData.phone);
        setErrors({ fullName: nameErr, phone: phoneErr });
        if (nameErr || phoneErr) {
            toast.error(nameErr || phoneErr);
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateStep1()) return;
        
        try {
            await onComplete?.(formData);
        } catch (error) {
            toast.error(error.message || "Failed to complete enrollment");
        }
    };

    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            {/* Milestone Header */}
            <div className="flex items-center gap-4 md:gap-8 mb-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] md:rounded-[2.5rem] bg-accent/10 text-accent flex items-center justify-center font-bold text-3xl md:text-4xl shadow-sm animate-float ">
                    <UserPlus size={32} />
                </div>
                <div>
                    <h2 className="text-text font-bold text-3xl md:text-5xl tracking-tighter leading-none uppercase ">ENROLLMENT</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="h-1 w-12 md:w-20 bg-accent rounded-full" />
                        <p className="text-text/30 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em]">Single Unified Phase</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Identity Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Visual Identity" subtitle="Member Portrait" className="p-8">
                        <CameraCapture 
                            onCapture={(image) => setFormData(prev => ({ ...prev, photo: image }))} 
                            initialImage={formData.photo}
                        />
                        <div className="mt-6 p-4 bg-surface rounded-2xl border border-text/5">
                            <p className="text-[10px] font-bold text-text/30 uppercase tracking-widest text-center leading-relaxed">
                                Ensure face is clearly visible<br/>for digital identification
                            </p>
                        </div>
                    </Card>
                    
                    <Card title="Branch Selection" subtitle="Home Gym" className="p-8">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                {branches.map(branch => (
                                    <button
                                        key={branch.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, branchId: branch.id })}
                                        className={cn(
                                            "p-4 rounded-xl border-2 font-bold text-[10px] uppercase tracking-widest transition-all text-center",
                                            formData.branchId === branch.id
                                                ? "border-accent bg-accent/5 text-accent shadow-premium"
                                                : "border-text/5 bg-surface text-text/20 hover:border-text/10"
                                        )}
                                    >
                                        {branch.name}
                                    </button>
                                ))}
                                {loadingBranches && <div className="p-5 text-center text-[10px] font-bold uppercase tracking-widest text-text/20 animate-pulse">Loading regions...</div>}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Legal & Tier Section */}
                <div className="lg:col-span-2 space-y-8">
                    <Card title="Personal Details" subtitle="Legal Information" className="p-8 md:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                    <UserIcon size={14} className="text-accent" /> Full Legal Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex. Emmanuel Murenzi"
                                    className={cn(
                                        "glass-input w-full py-5 px-6 rounded-2xl font-bold text-lg",
                                        errors.fullName && "border-error/50 ring-2 ring-error/20"
                                    )}
                                    value={formData.fullName}
                                    onChange={handleNameChange}
                                />
                                {errors.fullName && (
                                    <p className="flex items-center gap-1.5 text-error text-[10px] font-bold ml-2 mt-1">
                                        <AlertTriangle size={12} /> {errors.fullName}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                    <Phone size={14} className="text-accent" /> Identification Phone
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+250781234567"
                                    className={cn(
                                        "glass-input w-full py-5 px-6 rounded-2xl font-bold text-lg tabular-nums",
                                        errors.phone && "border-error/50 ring-2 ring-error/20"
                                    )}
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                />
                                {errors.phone && (
                                    <p className="flex items-center gap-1.5 text-error text-[10px] font-bold ml-2 mt-1">
                                        <AlertTriangle size={12} /> {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card title="Membership Plan" subtitle="Asset Tier & Duration" className="p-8 md:p-10 space-y-10">
                        <div className="space-y-6">
                            <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 ">Select Premium Asset Tier</label>
                            <div className="grid grid-cols-2 gap-4">
                                {categories.map(c => (
                                    <button
                                        key={c.name}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, category: c.name })}
                                        className={cn(
                                            "p-6 rounded-[2rem] text-center border-4 transition-all group flex flex-col justify-center gap-2",
                                            formData.category === c.name
                                                ? "border-accent bg-accent/5 shadow-premium"
                                                : "border-text/5 bg-surface hover:border-text/10"
                                        )}
                                    >
                                        <p className={cn("text-base font-bold leading-none mb-1 ", formData.category === c.name ? "text-accent" : "text-text")}>{c.name}</p>
                                        <p className="text-[9px] font-bold text-text/20 uppercase tracking-tighter leading-none">{c.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.4em] ml-2 block">Commitment Window</label>
                            <div className="flex flex-wrap gap-3">
                                {durations.map(d => (
                                    <button
                                        key={d.name}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, duration: d.name })}
                                        className={cn(
                                            "px-5 py-3 rounded-xl text-[9px] font-bold transition-all uppercase tracking-[0.2em]",
                                            formData.duration === d.name
                                                ? "bg-primary text-white shadow-premium"
                                                : "bg-surface border-2 border-text/5 text-text/30 hover:text-text/60"
                                        )}
                                    >
                                        {d.name} {d.discount > 0 && <span className="ml-2 text-accent">-{d.discount}%</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card title="Financial Context" subtitle="Settlement Method" className="p-8 md:p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-4">
                                {['Cash', 'Mobile Money'].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, paymentMethod: m })}
                                        className={cn(
                                            "w-full p-6 rounded-2xl flex items-center gap-4 border-2 transition-all group",
                                            formData.paymentMethod === m
                                                ? "border-accent bg-accent/5 shadow-premium"
                                                : "border-text/5 bg-surface"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                            formData.paymentMethod === m ? "border-accent" : "border-text/10"
                                        )}>
                                            {formData.paymentMethod === m && <div className="w-2.5 h-2.5 bg-accent rounded-full shadow-[0_0_10px_rgba(201,166,70,0.6)]" />}
                                        </div>
                                        <span className={cn("text-xs font-bold uppercase tracking-[0.2em] ", formData.paymentMethod === m ? "text-text" : "text-text/20")}>{m}</span>
                                    </button>
                                ))}
                            </div>
                            
                            <div className="p-8 bg-surface rounded-[2rem] border-2 border-accent/20 text-center space-y-2">
                                <p className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">Payable Amount</p>
                                <p className="text-4xl font-black text-text tracking-tighter tabular-nums">{calculatePrice()}</p>
                                <p className="text-[9px] font-bold text-text/20 uppercase tracking-[0.2em]">Rwandan Francs (RWF)</p>
                            </div>
                        </div>
                    </Card>

                    <button
                        onClick={handleSubmit}
                        disabled={!formData.fullName || !formData.phone}
                        className="w-full bg-primary text-white font-bold py-8 rounded-[2.5rem] shadow-premium flex items-center justify-center gap-5 active:scale-95 transition-all uppercase tracking-[0.25em] text-sm group disabled:opacity-20"
                    >
                        AUTHORIZE ENROLLMENT <Check size={32} strokeWidth={4} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
