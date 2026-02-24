import React, { useState } from 'react';
import { Card } from './Card';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Smartphone, Calendar, PieChart, Activity, ShoppingCart, DollarSign, Target, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { useFinance, useMembers } from '../lib/data-hooks';
import { ExpenseTracker } from './ExpenseTracker';

export function FinanceReports({ branchId = null, user }) {
    const { stats, loading, refresh } = useFinance(branchId);
    const [activeSection, setActiveSection] = useState('revenue'); // 'revenue' or 'expenses'

    const transactions = [];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Portfolio Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex items-center gap-6">
                    <div>
                        <h2 className="text-accent text-[11px] font-bold uppercase tracking-[0.4em] mb-2 leading-none ">Financial Intelligence</h2>
                        <p className="text-text text-3xl md:text-4xl font-bold tracking-tighter leading-none uppercase">FISCAL AUDIT</p>
                    </div>
                    <button 
                        onClick={() => refresh()}
                        className={cn(
                            "group p-4 bg-card border border-text/5 rounded-2xl hover:border-accent/30 transition-all",
                            loading && "opacity-50 pointer-events-none"
                        )}
                    >
                        <RefreshCw size={18} className={cn("text-accent/50 group-hover:text-accent transition-colors", loading && "animate-spin")} />
                    </button>
                </div>
                
                <div className="flex bg-card p-1.5 rounded-2xl border border-text/5 shadow-inner">
                    <button
                        onClick={() => setActiveSection('revenue')}
                        className={cn(
                            "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeSection === 'revenue' ? "bg-primary text-white shadow-premium" : "text-text/30 hover:text-text"
                        )}
                    >
                        Revenue Stats
                    </button>
                    <button
                        onClick={() => setActiveSection('expenses')}
                        className={cn(
                            "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeSection === 'expenses' ? "bg-error text-white shadow-premium" : "text-text/30 hover:text-text"
                        )}
                    >
                        Expenditure
                    </button>
                </div>
            </div>

            {/* Yield Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-primary text-white overflow-hidden relative group border-none shadow-premium py-10">
                    <div className="absolute -right-4 -top-4 p-8 opacity-20 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                        <TrendingUp size={120} className="text-accent" />
                    </div>
                    <p className="text-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-6 relative z-10">Total Gross Revenue</p>
                    <div className="flex items-end gap-3 relative z-10">
                        <h3 className="text-5xl font-bold tracking-tighter">{(stats.revenue / 1000).toFixed(1)}k</h3>
                        <span className="text-accent text-xs font-bold uppercase tracking-widest mb-1.5">RWF</span>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        <ArrowUpRight size={14} className="text-accent" /> Gross Yield Matrix
                    </div>
                </Card>

                <Card className="border-2 border-error/5 bg-error/[0.02] flex flex-col justify-between py-10">
                    <div className="absolute -right-4 -top-4 p-8 opacity-[0.03] rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                        <ShoppingCart size={120} className="text-error" />
                    </div>
                    <div>
                        <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Total Expenditures</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-5xl font-bold tracking-tighter text-error">{(stats.expenses / 1000).toFixed(1)}k</h3>
                            <span className="text-error/30 text-xs font-bold uppercase tracking-widest mb-1.5">RWF</span>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-text/20 uppercase tracking-widest">
                        <Activity size={14} className="text-error" /> Operational Leaks
                    </div>
                </Card>

                <Card className="border border-text/5 flex flex-col justify-between py-10 bg-surface/50">
                    <div className="absolute -right-4 -top-4 p-8 opacity-[0.03] rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                        <DollarSign size={120} className="text-accent" />
                    </div>
                    <div>
                        <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Net Liquid Profit</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-5xl font-bold tracking-tighter text-text">{(stats.netProfit / 1000).toFixed(1)}k</h3>
                            <span className="text-accent text-xs font-bold uppercase tracking-widest mb-1.5">RWF</span>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-text/40 uppercase tracking-widest">
                        <Target size={14} className="text-accent" /> Core Profit Margin
                    </div>
                </Card>
            </div>

            {/* Content Swapper */}
            <AnimatePresence mode="wait">
                {activeSection === 'revenue' ? (
                    <motion.div
                        key="revenue"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        <Card title="Revenue Stream" subtitle="Income Path">
                            <div className="h-full flex flex-col justify-center gap-8 py-10 px-4">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-text/40">
                                        <span>Mobile Money Settlements</span>
                                        <span className="text-accent">{((stats.mobileRevenue / stats.revenue) * 100 || 0).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-surface rounded-full overflow-hidden border border-text/5">
                                        <div className="h-full bg-primary rounded-full" style={{ width: `${(stats.mobileRevenue / stats.revenue) * 100 || 0}%` }} />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-text/40">
                                        <span>Physical Cash Revenue</span>
                                        <span className="text-text">{((stats.cashRevenue / stats.revenue) * 100 || 0).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-surface rounded-full overflow-hidden border border-text/5">
                                        <div className="h-full bg-accent rounded-full" style={{ width: `${(stats.cashRevenue / stats.revenue) * 100 || 0}%` }} />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Activity Audit" subtitle="Recent Ledger">
                            <div className="h-full flex items-center justify-center p-10">
                                <p className="text-text/10 text-[10px] font-bold uppercase tracking-[0.5em] text-center italic">Organizational ledger synchronization in progress...</p>
                            </div>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="expenses"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Expense Categories Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {(stats.expenseCategories || []).map(cat => (
                                <Card key={cat.name} className="p-6 border-l-4 border-error/40 flex flex-col justify-center gap-2">
                                    <p className="text-[9px] font-black uppercase text-text/20 tracking-widest">{cat.name}</p>
                                    <p className="text-xl font-bold tracking-tighter text-text">{(cat.value).toLocaleString()} <span className="text-[9px] text-text/10 font-bold ml-1">RWF</span></p>
                                    <div className="w-full h-1 bg-surface rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-error" style={{ width: `${(cat.value / stats.expenses) * 100}%` }} />
                                    </div>
                                </Card>
                            ))}
                            {(!stats.expenseCategories || stats.expenseCategories.length === 0) && (
                                <div className="lg:col-span-4 py-10 bg-surface rounded-[2rem] border-2 border-dashed border-text/5 text-center">
                                    <p className="text-text/10 text-[10px] font-black uppercase tracking-widest">No spending categories established</p>
                                </div>
                            )}
                        </div>

                        {/* Tracker Component */}
                        <ExpenseTracker branchId={branchId} user={user} onSync={refresh} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
