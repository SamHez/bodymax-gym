import React from 'react';
import { Card } from './Card';
import { TrendingUp, Wallet, Smartphone, Loader2, Receipt, CircleDollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { useFinance } from '../lib/data-hooks';

export function FinanceReports() {
    const { stats, loading } = useFinance();
    const ringSegments = stats.expenseBreakdown?.slice(0, 4) || [];
    const ringColors = ['#1E88E5', '#F4B740', '#2ECC71', '#EF4444'];
    const circumference = 2 * Math.PI * 54;
    let cumulativeOffset = 0;

    if (loading) {
        return (
            <div className="min-h-[420px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-text/40">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <p className="text-[11px] font-bold uppercase tracking-[0.4em]">Loading Finance Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Finance Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-primary text-[11px] font-bold uppercase tracking-[0.4em] mb-2 leading-none ">Cash Overview</h2>
                    <p className="text-text text-3xl md:text-4xl font-bold tracking-tighter leading-none uppercase">FINANCES</p>
                </div>
                <div className="hidden md:flex gap-4">
                    <div className="px-6 py-4 bg-card border border-text/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-text/40">
                        {stats.transactions} Payments Recorded
                    </div>
                </div>
            </div>

            {/* Top Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                <Card className="overflow-hidden relative group border border-text/5 shadow-premium">
                    <div className="absolute -right-4 -top-4 p-8 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                        <CircleDollarSign size={120} className="text-primary" />
                    </div>
                    <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Revenue Today</p>
                    <div className="flex items-end gap-3 relative z-10">
                        <h3 className="text-4xl font-bold tracking-tighter text-text">{stats.todayRevenue.toLocaleString()}</h3>
                        <span className="text-[10px] text-text/10">RWF</span>
                    </div>
                    <div className="mt-8 text-[10px] font-medium text-text/30 uppercase tracking-widest">
                        Cash and mobile money received today
                    </div>
                </Card>

                <Card className="border border-text/5 flex flex-col justify-between">
                    <div>
                        <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Total Revenue</p>
                        <h3 className="text-4xl font-bold tracking-tighter  text-text">{stats.revenue.toLocaleString()} <span className="text-[10px] not- text-text/10">RWF</span></h3>
                    </div>
                    <div className="pt-6 border-t border-text/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-text/30">Payments</span>
                        <span className="text-text">{stats.transactions} Records</span>
                    </div>
                </Card>

                <Card className="border border-text/5 flex flex-col justify-between">
                    <div>
                        <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Total Expenses</p>
                        <h3 className="text-4xl font-bold tracking-tighter text-error">{stats.expenses.toLocaleString()} <span className="text-[10px] not- text-text/10">RWF</span></h3>
                    </div>
                    <div className="pt-6 border-t border-text/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-text/30">Spent Today</span>
                        <span className="text-text">{stats.todayExpenses.toLocaleString()} RWF</span>
                    </div>
                </Card>

                <Card className="border border-text/5 flex flex-col justify-between">
                    <div>
                        <p className="text-text/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Net Income</p>
                        <h3 className={cn(
                            "text-4xl font-bold tracking-tighter",
                            stats.netProfit >= 0 ? "text-success" : "text-error"
                        )}>
                            {stats.netProfit.toLocaleString()} <span className="text-[10px] text-text/10">RWF</span>
                        </h3>
                    </div>
                    <div className="pt-6 border-t border-text/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-text/30">Margin</span>
                        <span className="text-text">{stats.revenue > 0 ? ((stats.netProfit / stats.revenue) * 100).toFixed(1) : 0}%</span>
                    </div>
                </Card>
            </div>

            {/* Charts and Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
                <Card title="Revenue Trend" subtitle="Last 10 Months">
                    <div className="h-72 flex items-end justify-between gap-3 pt-8 px-2">
                        {stats.monthlyData.map((item, index) => {
                            const maxRevenue = Math.max(...stats.monthlyData.map((entry) => entry.revenue), 10);
                            return (
                                <div key={item.month + index} className="flex-1 flex flex-col items-center gap-4 h-full justify-end">
                                    <div className="w-full h-full flex items-end">
                                        <div
                                            className={cn(
                                                "w-full rounded-2xl transition-all duration-[1200ms] min-h-[8px]",
                                                index === stats.monthlyData.length - 1 ? "bg-primary shadow-xl shadow-primary/20" : "bg-primary/25"
                                            )}
                                            style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold uppercase text-text/30">{item.month}</p>
                                        <p className="text-[9px] font-bold text-text">{Math.round(item.revenue)}k</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card title="Expenses Breakdown" subtitle="Allocation">
                    <div className="flex flex-col items-center justify-center gap-8 py-6">
                        <div className="relative w-44 h-44">
                            <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="54"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="14"
                                    className="text-text/5"
                                />
                                {ringSegments.map((segment, index) => {
                                    const segmentLength = circumference * (segment.percent / 100);
                                    const dashOffset = -cumulativeOffset;
                                    cumulativeOffset += segmentLength;

                                    return (
                                        <circle
                                            key={segment.category}
                                            cx="70"
                                            cy="70"
                                            r="54"
                                            fill="transparent"
                                            stroke={ringColors[index % ringColors.length]}
                                            strokeWidth="14"
                                            strokeLinecap="round"
                                            strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                                            strokeDashoffset={dashOffset}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <p className="text-3xl font-bold tracking-tighter text-text">{stats.expenses.toLocaleString()}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-text/30">Total Expenses</p>
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            {ringSegments.length === 0 ? (
                                <p className="text-center text-text/20 text-[10px] font-bold uppercase tracking-[0.3em]">
                                    No expense records yet
                                </p>
                            ) : ringSegments.map((segment, index) => (
                                <div key={segment.category} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: ringColors[index % ringColors.length] }}
                                        />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-text/50">{segment.category}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold tracking-tight text-text">{segment.amount.toLocaleString()} RWF</p>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-text/20">{segment.percent.toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
                <Card title="Recent Payments" subtitle="Latest Transactions">
                    <div className="space-y-6 pt-6">
                        {stats.recentTransactions.length === 0 ? (
                            <div className="py-16 text-center text-text/20 text-[10px] font-bold uppercase tracking-[0.4em]">
                                No payments recorded yet
                            </div>
                        ) : stats.recentTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-6 bg-surface rounded-[2rem] border border-text/[0.03] group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                                        transaction.paymentMethod === 'Mobile Money' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                                    )}>
                                        {transaction.paymentMethod === 'Mobile Money' ? <Smartphone size={18} /> : <Wallet size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-text font-bold tracking-tight">{transaction.memberName}</p>
                                        <p className="text-text/20 text-[9px] font-bold uppercase tracking-widest">
                                            {new Date(transaction.transactionDate).toLocaleDateString()} via {transaction.paymentMethod}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold tracking-tighter text-text">+{transaction.amount.toLocaleString()}</p>
                                    <p className="text-success text-[8px] font-bold uppercase tracking-widest">{transaction.memberCode}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Payment Methods" subtitle="Collected Revenue">
                    <div className="h-full flex flex-col justify-center gap-8 py-6">
                        <div className="rounded-[2rem] border border-text/5 bg-surface p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Smartphone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-text font-bold">Mobile Money</p>
                                        <p className="text-text/20 text-[9px] font-bold uppercase tracking-widest">Digital collections</p>
                                    </div>
                                </div>
                                <p className="text-xl font-bold tracking-tighter text-text">{stats.mobileRevenue.toLocaleString()} RWF</p>
                            </div>
                            <div className="h-2.5 w-full bg-text/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${stats.revenue > 0 ? (stats.mobileRevenue / stats.revenue) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-text/5 bg-surface p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                                        <Wallet size={18} />
                                    </div>
                                    <div>
                                        <p className="text-text font-bold">Cash</p>
                                        <p className="text-text/20 text-[9px] font-bold uppercase tracking-widest">Desk collections</p>
                                    </div>
                                </div>
                                <p className="text-xl font-bold tracking-tighter text-text">{stats.cashRevenue.toLocaleString()} RWF</p>
                            </div>
                            <div className="h-2.5 w-full bg-text/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent rounded-full"
                                    style={{ width: `${stats.revenue > 0 ? (stats.cashRevenue / stats.revenue) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-text/5 bg-primary/5 p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                                <Receipt size={20} />
                            </div>
                            <div>
                                <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Summary</p>
                                <p className="text-text font-bold text-lg">Revenue after expenses: {stats.netProfit.toLocaleString()} RWF</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
