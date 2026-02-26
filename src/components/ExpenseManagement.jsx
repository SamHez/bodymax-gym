import React, { useState } from 'react';
import { Card } from './Card';
import {
    Plus,
    Receipt,
    Wallet,
    Smartphone,
    ChevronRight,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useExpenses, useFinance } from '../lib/data-hooks';

export default function ExpenseManagement({ user }) {
    const isManager = user?.role === 'manager';
    const { expenses, addExpense, loading: expensesLoading } = useExpenses();
    const { stats, loading: financeLoading } = useFinance();

    const [showAddForm, setShowAddForm] = useState(false);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const [newExpense, setNewExpense] = useState({
        amount: '',
        category: 'Supplies',
        description: '',
        payment_method: 'Cash'
    });

    const categories = ['Rent', 'Utilities', 'Maintenance', 'Salaries', 'Supplies', 'Marketing', 'Other'];

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!newExpense.amount || !newExpense.category) return;

        const success = await addExpense({
            ...newExpense,
            amount: Number(newExpense.amount),
            expense_date: new Date().toISOString()
        });

        if (success) {
            setShowAddForm(false);
            setNewExpense({ amount: '', category: 'Supplies', description: '', payment_method: 'Cash' });
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const todayExpenses = expenses.filter(e => e.expense_date?.startsWith(today));
    const totalTodayExpenses = todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const filteredExpenses = expenses.filter(e => {
        const matchesSearch = e.description?.toLowerCase().includes(search.toLowerCase()) ||
            e.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-primary text-[11px] font-bold uppercase tracking-[0.4em] mb-2 leading-none">Operational Costs</h2>
                    <p className="text-text text-3xl md:text-4xl font-bold tracking-tighter leading-none uppercase">EXPENSES</p>
                </div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-3 bg-primary text-white px-8 py-5 rounded-[2.5rem] font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                    <Plus size={18} strokeWidth={3} />
                    Record Expense
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="liquid-glass border-none shadow-xl shadow-primary/10">
                    <p className="text-primary/60 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Daily Spend (Today)</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-bold tracking-tighter text-white">{totalTodayExpenses.toLocaleString()}</h3>
                        <span className="text-[10px] text-white/20 mb-1">RWF</span>
                    </div>
                </Card>

                <Card>
                    <p className="text-text/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Monthly Burn Rate</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-bold tracking-tighter text-text">{(stats.expenses / 1000).toFixed(1)}k</h3>
                        <span className="text-[10px] text-text/10 mb-1">RWF</span>
                    </div>
                </Card>

                <Card>
                    <p className="text-text/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Net Daily Flow</p>
                    <div className="flex items-end gap-2">
                        <h3 className={cn(
                            "text-4xl font-bold tracking-tighter",
                            (stats.dailyData?.[6]?.profit || 0) >= 0 ? "text-success" : "text-error"
                        )}>
                            {(stats.dailyData?.[6]?.profit || 0).toFixed(1)}k
                        </h3>
                        <span className="text-[10px] text-text/10 mb-1">RWF</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Expense Ledger */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Expense Ledger" subtitle="Operational Audit" className="relative overflow-visible">
                        {/* Manager Filters */}
                        {isManager && (
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-primary transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="SEARCH DESCRIPTION..."
                                        className="w-full bg-text/[0.03] border border-text/5 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/30 transition-all"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="bg-text/[0.03] border border-text/5 rounded-2xl px-6 py-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/30 transition-all text-text/60"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="All">ALL CATEGORIES</option>
                                    {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="space-y-4">
                            {(isManager ? filteredExpenses : todayExpenses).length === 0 ? (
                                <div className="py-20 text-center text-text/20 text-[10px] font-bold uppercase tracking-[0.5em]">
                                    No records identified
                                </div>
                            ) : (
                                (isManager ? filteredExpenses : todayExpenses).map((exp) => (
                                    <div key={exp.id} className="flex items-center justify-between p-6 bg-surface rounded-[2rem] border border-text/[0.03] group hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm",
                                                exp.payment_method === 'Mobile Money' ? "bg-primary/20 text-primary" : "bg-text/5 text-text"
                                            )}>
                                                {exp.payment_method === 'Mobile Money' ? <Smartphone size={18} /> : <Wallet size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-text font-bold tracking-tight">{exp.description || exp.category}</p>
                                                <p className="text-text/20 text-[9px] font-bold uppercase tracking-widest">
                                                    {new Date(exp.expense_date).toLocaleDateString()} • {exp.category}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold tracking-tighter text-error">-{Number(exp.amount).toLocaleString()}</p>
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-text/20">{exp.payment_method}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Categories & Summary Column */}
                <div className="space-y-8">
                    {isManager && (
                        <Card title="Allocation" subtitle="Category Flow">
                            <div className="space-y-6 pt-6">
                                {categories.map(cat => {
                                    const amount = stats.expenseCategories?.[cat] || 0;
                                    const percent = stats.expenses > 0 ? (amount / stats.expenses) * 100 : 0;
                                    return (
                                        <div key={cat} className="space-y-3">
                                            <div className="flex justify-between items-end px-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-text/40 ">{cat}</span>
                                                <span className="text-xs font-bold text-text tracking-tighter">{amount.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-text/5">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-1000 opacity-60"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}

                    <Card className="bg-primary/5 border border-primary/20 p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                                <Receipt size={24} />
                            </div>
                            <div>
                                <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] leading-none mb-1">Status</p>
                                <p className="text-text font-bold text-lg uppercase leading-none">Flow Optimized</p>
                            </div>
                        </div>
                        <p className="text-text/40 text-[10px] font-medium leading-relaxed">
                            {isManager
                                ? "Operational costs are within quarterly baseline projections. Profitability remains stable."
                                : "You are currently recording daily operations. Historical data is restricted to management access."}
                        </p>
                    </Card>
                </div>
            </div>

            {/* Add Expense Modal/Overlay */}
            {showAddForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-surface/80 backdrop-blur-xl" onClick={() => setShowAddForm(false)} />
                    <Card className="relative w-full max-w-xl p-10 space-y-10 shadow-3xl animate-in zoom-in-95 duration-200" title="RECORD TRANSACTION" subtitle="Expense Entry">
                        <form onSubmit={handleAddExpense} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2">Transaction Amount (RWF)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-text/[0.03] border border-text/5 rounded-3xl py-6 px-8 text-xl font-bold tracking-tighter focus:outline-none focus:border-primary/40 focus:bg-white transition-all shadow-inner"
                                    placeholder="Enter amount..."
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2">Category</label>
                                    <select
                                        className="w-full bg-text/[0.03] border border-text/5 rounded-2xl py-5 px-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/40 focus:bg-white transition-all"
                                        value={newExpense.category}
                                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2">Method</label>
                                    <select
                                        className="w-full bg-text/[0.03] border border-text/5 rounded-2xl py-5 px-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/40 focus:bg-white transition-all"
                                        value={newExpense.payment_method}
                                        onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value })}
                                    >
                                        <option value="Cash">CASH</option>
                                        <option value="Mobile Money">MOBILE MONEY</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text/30 uppercase tracking-[0.3em] ml-2">Description</label>
                                <textarea
                                    className="w-full bg-text/[0.03] border border-text/5 rounded-3xl py-6 px-8 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary/40 focus:bg-white transition-all h-32"
                                    placeholder="Brief details about this spend..."
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 py-6 bg-text/5 text-text rounded-3xl font-bold uppercase tracking-widest text-[10px] hover:bg-text/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-3 py-6 bg-primary text-white rounded-3xl font-bold uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                                >
                                    Confirm Audit Entry
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
