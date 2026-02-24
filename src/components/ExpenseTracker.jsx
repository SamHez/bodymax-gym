import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Card } from './Card';
import { ShoppingCart, Plus, Calendar, Trash2, Activity, Tag, DollarSign, ChevronRight, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from '../lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

export function ExpenseTracker({ branchId = null, user, onSync }) {
    const [expenses, setExpenses] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Supplies',
        branch_id: branchId || user?.branch_id || ''
    });

    const categories = ['Supplies', 'Equipment', 'Maintenance', 'Utilities', 'Rent', 'Marketing', 'Other'];

    const dropdownRef = React.useRef(null);

    useEffect(() => {
        if (branchId) {
            setFormData(prev => ({ ...prev, branch_id: branchId }));
        }
    }, [branchId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchExpenses = async () => {
        try {
            const data = await apiFetch(`/expenses${branchId ? `?branch_id=${branchId}` : ''}`);
            setExpenses(data);
        } catch (err) {
            console.error('Fetch expenses error:', err);
            toast.error("Failed to load expenditure records");
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        if (user?.role !== 'Receptionist') {
            try {
                const data = await apiFetch('/branches');
                setBranches(data);
            } catch (err) {
                console.error('Fetch branches error:', err);
            }
        }
    };

    useEffect(() => {
        fetchExpenses();
        fetchBranches();
    }, [branchId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.description || !formData.branch_id) {
            toast.error("All fields including Branch are required");
            return;
        }

        try {
            await apiFetch('/expenses', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            toast.success("Expense recorded successfully");
            setFormData({ 
                ...formData, 
                description: '', 
                amount: '', 
                category: 'Supplies',
                branch_id: branchId || user?.branch_id || ''
            });
            setIsAdding(false);
            fetchExpenses();
            if (onSync) onSync();
        } catch (err) {
            toast.error(err.message || "Failed to record expense");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this record permanently?")) return;
        try {
            await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
            setExpenses(expenses.filter(e => e.id !== id));
            toast.success("Expense deleted");
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Control */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-error/10 text-error rounded-3xl shadow-sm">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <h3 className="text-text font-bold text-xl uppercase tracking-tight">Expenditure Ledger</h3>
                        <p className="text-text/20 text-[10px] font-black uppercase tracking-[0.3em]">Operational Outflow Matrix</p>
                    </div>
                </div>
                {!isAdding && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsAdding(true)}
                        className="bg-primary text-white p-4 rounded-2xl flex items-center gap-3 shadow-premium font-black text-[10px] uppercase tracking-widest"
                    >
                        <Plus size={18} strokeWidth={3} /> Record Outflow
                    </motion.button>
                )}
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="p-8 border-2 border-error/20 bg-error/[0.02]">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-text/30 uppercase tracking-widest ml-2">Expense Description</label>
                                    <div className="relative group">
                                        <Tag size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-error transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="e.g., 20L Drinking Water Bottles"
                                            className="glass-input w-full py-5 pl-14 pr-4 rounded-2xl font-bold"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text/30 uppercase tracking-widest ml-2">Amount (RWF)</label>
                                    <div className="relative group">
                                        <DollarSign size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-error transition-colors" />
                                        <input
                                            type="number"
                                            placeholder="15000"
                                            className="glass-input w-full py-5 pl-14 pr-4 rounded-2xl font-black text-lg tabular-nums"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 relative" ref={dropdownRef}>
                                    <label className="text-[10px] font-black text-text/30 uppercase tracking-widest ml-2">Classification</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className={cn(
                                            "glass-input w-full py-5 px-6 rounded-2xl font-bold flex items-center justify-between text-left transition-all",
                                            isDropdownOpen ? "border-error/40 ring-4 ring-error/5" : "hover:border-text/20"
                                        )}
                                    >
                                        <span className={cn("text-sm", formData.category ? "text-text" : "text-text/30")}>
                                            {formData.category}
                                        </span>
                                        <ChevronDown size={18} className={cn("transition-transform duration-300", isDropdownOpen && "rotate-180 text-error")} />
                                    </button>

                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-24 left-0 w-full bg-card border border-text/10 rounded-2xl shadow-mega z-50 overflow-hidden p-2"
                                            >
                                                {categories.map(c => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, category: c });
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all",
                                                            formData.category === c ? "bg-error/10 text-error" : "text-text/40 hover:bg-surface hover:text-text"
                                                        )}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Branch Selector for Managers in Global View */}
                                {!branchId && user?.role !== 'Receptionist' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text/30 uppercase tracking-widest ml-2">Target Branch</label>
                                        <select
                                            className="glass-input w-full py-5 px-6 rounded-2xl font-bold appearance-none text-text/60"
                                            value={formData.branch_id}
                                            onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled>Select Branch</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="md:col-span-4 flex justify-end gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-text/30 hover:text-text"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-10 py-5 bg-error text-white rounded-2xl shadow-premium font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3"
                                    >
                                        Authorize Outflow <ChevronRight size={18} />
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-20">
                        <Activity className="animate-spin text-accent" size={40} />
                        <p className="font-black text-[10px] uppercase tracking-[0.5em]">Synchronizing Ledger...</p>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="text-center py-20 bg-surface rounded-[3rem] border-2 border-dashed border-text/5">
                        <p className="text-text/20 font-black text-[11px] uppercase tracking-[0.5em]">No fiscal leaks detected</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {expenses.map((expense) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={expense.id}
                                className="group bg-card border border-text/5 p-6 rounded-[2.5rem] flex items-center justify-between hover:border-error/20 transition-all shadow-sm hover:shadow-premium"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-surface rounded-[1.5rem] flex flex-col items-center justify-center border border-text/5 group-hover:bg-error/5 group-hover:border-error/20 transition-all">
                                        <span className="text-[10px] font-black text-text/20">{expense.date ? new Date(expense.date).getDate() : ''}</span>
                                        <span className="text-[8px] font-black uppercase text-error tracking-tighter">{expense.date ? new Date(expense.date).toLocaleDateString('en-US', { month: 'short' }) : ''}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-text font-bold tracking-tight">{expense.description}</p>
                                            <span className="px-3 py-1 bg-surface text-text/30 text-[8px] font-bold uppercase tracking-widest rounded-full border border-text/5">{expense.category}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-text/20 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <Calendar size={10} /> {expense.date}
                                            </p>
                                            <div className="w-1 h-1 bg-text/5 rounded-full" />
                                            <p className="text-text/20 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <AlertCircle size={10} /> ID: {expense.recorded_by?.email?.split('@')[0] || 'System'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-xl font-bold tracking-tighter text-error">-{parseFloat(expense.amount).toLocaleString()}</p>
                                        <p className="text-text/10 text-[8px] font-black uppercase tracking-widest">RWF Outflow</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(expense.id)}
                                        className="p-4 rounded-2xl bg-error/5 text-error opacity-0 group-hover:opacity-100 transition-all hover:bg-error hover:text-white"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
