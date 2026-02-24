import React from 'react';
import { StatCard, Card } from './Card';
import { Users, TrendingUp, UserPlus, RefreshCw, Smartphone, Wallet, Activity, Target, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/utils';

import { useAttendance, useMembers, useFinance } from '../lib/data-hooks';

export function DashboardSnapshot({ branchId = null }) {
    const { todayCount } = useAttendance(branchId);
    const { members } = useMembers(branchId);
    const { stats: financeStats } = useFinance(branchId);

    const stats = [
        { label: "Total Revenue", value: `RWF ${(financeStats.revenue / 1000).toFixed(1)}k`, trend: 0, icon: TrendingUp, colorClass: "text-accent" },
        { label: "Net Profit", value: `${(financeStats.netProfit / 1000).toFixed(1)}k`, trend: 0, icon: Target, colorClass: "text-success" },
        { label: "Total Expenses", value: `${(financeStats.expenses / 1000).toFixed(1)}k`, trend: 0, icon: ShoppingCart, colorClass: "text-error" },
        { label: "Active Today", value: todayCount.toString(), trend: 0, icon: Users },
    ];

    return (
        <div className="space-y-10">
            {/* Intelligence Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em] mb-1 leading-none">Financial Intelligence</h2>
                    <p className="text-text text-2xl md:text-3xl font-bold tracking-tighter leading-none uppercase">BodyMax Gym Manager</p>
                </div>
                <div className="flex items-center gap-4 bg-card px-6 py-4 rounded-3xl border border-text/5 shadow-premium">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse shadow-[0_0_15px_rgba(46,204,113,0.5)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text">Syncing Live</span>
                </div>
            </div>

            {/* Financial KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Primary Analytics - Revenue Trend */}
            <Card subtitle="Revenue Velocity" title="Last 10 Months History">
                <div className="h-64 flex items-end justify-between gap-3 pt-12 px-8">
                    {(() => {
                        const data = financeStats.monthlyData || new Array(10).fill({ month: '-', revenue: 0 });
                        const maxRev = Math.max(...data.map(d => d.revenue), 10);
                        return data.map((item, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-6 h-full justify-end group">
                                <div
                                    className={cn(
                                        "w-full rounded-2xl transition-all duration-[1500ms] relative min-h-[2px]",
                                        i === data.length - 1 ? "bg-accent shadow-gold scale-x-110" : "bg-text/10 dark:bg-white/10 group-hover:bg-primary/40"
                                    )}
                                    style={{ height: `${(item.revenue / maxRev) * 100}%` }}
                                >
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-text text-surface dark:bg-accent dark:text-surface text-[10px] font-black px-3 py-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-premium whitespace-nowrap z-20 pointer-events-none">
                                        {Math.round(item.revenue)}k RWF
                                    </div>
                                </div>
                                <span className={cn("text-[10px] font-black uppercase tracking-tighter transition-colors", i === data.length - 1 ? "text-accent" : "text-text/20")}>
                                    {item.month}
                                </span>
                            </div>
                        ));
                    })()}
                </div>
            </Card>

            {/* Operational & Liquidity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Stats (Operational moved to Secondary) */}
                <Card subtitle="Operations" title="Membership Traffic" className="flex flex-col justify-between p-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Users size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-text/40">Active Today</span>
                            </div>
                            <span className="text-2xl font-black">{todayCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                    <UserPlus size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-text/40">Total Members</span>
                            </div>
                            <span className="text-2xl font-black">{members.length}</span>
                        </div>
                    </div>
                    <div className="pt-8 mt-8 border-t border-text/5">
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-text/20">
                            <RefreshCw size={14} className="animate-spin-slow" />
                            Auto-refreshing Every 30s
                        </div>
                    </div>
                </Card>

                {/* Gate Status (Secondary Analytics) */}
                <Card subtitle="Access Control" title="Gate Status" className="flex flex-col justify-center items-center p-12 space-y-8">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-text/[0.03]" />
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="110" className="text-accent" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold tracking-tighter leading-none">75%</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-text/20 mt-1">Capacity</span>
                        </div>
                    </div>
                </Card>

                <Card subtitle="Liquidity" title="Payment Channels" className="p-8">
                    <div className="space-y-4 pt-4">
                        <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-accent">Mobile Money Share</span>
                            <span className="text-lg font-black">{Math.round((financeStats.mobileRevenue / financeStats.revenue) * 100 || 0)}%</span>
                        </div>
                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-primary">Cash Settlements</span>
                            <span className="text-lg font-black">{Math.round((financeStats.cashRevenue / financeStats.revenue) * 100 || 0)}%</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
