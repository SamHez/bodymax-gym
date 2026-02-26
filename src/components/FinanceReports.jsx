import React from 'react';
import { Card } from './Card';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Smartphone, Calendar, PieChart } from 'lucide-react';
import { cn } from '../lib/utils';

import { useFinance, useMembers } from '../lib/data-hooks';

export function FinanceReports() {
    const { stats, loading } = useFinance();
    const { members } = useMembers();

    const transactions = []; // Placeholder for now or can be derived from stats

    return (
        <div className="space-y-10">
            {/* Portfolio Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-primary text-[11px] font-bold uppercase tracking-[0.4em] mb-2 leading-none ">Financial Intelligence</h2>
                    <p className="text-text text-3xl md:text-4xl font-bold tracking-tighter leading-none uppercase">FINANCES</p>
                </div>
                <div className="hidden md:flex gap-4">
                    <button className="px-6 py-4 bg-card border border-text/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-text/40 hover:text-primary transition-all">Export XLS</button>
                    <button className="px-6 py-4 bg-primary text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">Print Closure</button>
                </div>
            </div>

            {/* Yield Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-card dark:bg-primary text-text dark:text-white overflow-hidden relative group border border-text/5 dark:border-none shadow-premium">
                    <div className="absolute -right-4 -top-4 p-8 opacity-5 dark:opacity-20 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                        <TrendingUp size={120} className="text-primary" />
                    </div>
                    <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Total Net Profit</p>
                    <div className="flex items-end gap-3 relative z-10">
                        <h3 className="text-4xl font-bold tracking-tighter text-text">{(stats.netProfit / 1000).toFixed(1)}k</h3>
                        <span className="text-[10px] not- text-text/10">RWF</span>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-medium text-text/60 dark:text-white/40 uppercase tracking-widest">
                        <ArrowUpRight size={14} className="text-success" /> <span className="text-text/30 ">Margin: {stats.revenue > 0 ? ((stats.netProfit / stats.revenue) * 100).toFixed(1) : 0}%</span>
                    </div>
                </Card>

                <Card className="border border-text/5 flex flex-col justify-between">
                    <div>
                        <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Settlements Overview</p>
                        <h3 className="text-4xl font-bold tracking-tighter  text-text">{stats.revenue.toLocaleString()} <span className="text-[10px] not- text-text/10">RWF</span></h3>
                    </div>
                    <div className="pt-6 border-t border-text/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-text/30">Volume</span>
                        <span className="text-text">{stats.transactions} Transactions</span>
                    </div>
                </Card>

                <Card className="border border-text/5 flex flex-col justify-between">
                    <div>
                        <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Operational Burn</p>
                        <h3 className="text-4xl font-bold tracking-tighter text-error">{stats.expenses.toLocaleString()} <span className="text-[10px] not- text-text/10">RWF</span></h3>
                    </div>
                    <div className="pt-6 border-t border-text/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-text/30">Expense Ratio</span>
                        <span className="text-text">{stats.revenue > 0 ? ((stats.expenses / stats.revenue) * 100).toFixed(1) : 0}%</span>
                    </div>
                </Card>
            </div>

            {/* Audit Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Activity Stream" subtitle="Audit Path">
                    <div className="space-y-6 pt-6">
                        {transactions.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-6 bg-surface rounded-[2rem] border border-text/[0.03] group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm",
                                        t.method === 'MoMo' ? "bg-primary/20 text-primary" : "bg-primary"
                                    )}>
                                        {t.method === 'MoMo' ? <Smartphone size={18} /> : <Wallet size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-text font-bold tracking-tight">{t.type}</p>
                                        <p className="text-text/20 text-[9px] font-bold uppercase tracking-widest">{t.date} via {t.method}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold  tracking-tighter text-text">+{t.amount.toLocaleString()}</p>
                                    <p className="text-success text-[8px] font-bold uppercase tracking-widest">Confirmed</p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-5 text-[10px] font-bold uppercase tracking-[0.4em] text-text/10 hover:text-primary transition-all ">View full organizational ledger</button>
                    </div>
                </Card>

                <Card title="Allocation" subtitle="Expense Breakdown">
                    <div className="h-full flex flex-col justify-center gap-8 py-10 px-4">
                        {Object.entries(stats.expenseCategories || {}).map(([name, amount]) => {
                            const percent = stats.expenses > 0 ? (amount / stats.expenses) * 100 : 0;
                            return (
                                <div key={name} className="space-y-3">
                                    <div className="flex justify-between items-end px-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-text/40 ">{name}</span>
                                        <span className="text-xs font-bold text-text tracking-tighter">{percent.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-surface rounded-full overflow-hidden border border-text/5">
                                        <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}
