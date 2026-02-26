import React, { useState } from 'react';
import { Card, StatCard } from './Card';
import { Users, UserPlus, Calendar, Activity, CheckCircle2, TrendingUp, Search, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

import { useAttendance, useMembers, useFinance } from '../lib/data-hooks';
import { supabase } from '../lib/supabase';

export function FrontDeskDashboard({ onNavigate }) {
    const { todayCount, checkIn, removeCheckIn, checkedInIds, loading: attendanceLoading } = useAttendance();
    const { members, loading: membersLoading } = useMembers();
    const { stats: financeStats, loading: financeLoading } = useFinance();

    const isSyncing = attendanceLoading || membersLoading || financeLoading;
    const [search, setSearch] = useState('');

    const expiredCount = members.filter(m => m.status === 'Expired').length;
    const expiringSoonCount = members.filter(m => m.status === 'Expiring Soon').length;

    const filteredMembers = search.trim() === ''
        ? []
        : members.filter(m =>
            m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            m.phone?.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 5);

    const handleCheckIn = async (memberId) => {
        const success = await checkIn(memberId);
        if (success) {
            setSearch('');
        }
    };

    const handleRemove = async (memberId) => {
        const success = await removeCheckIn(memberId);
        if (success) {
            setSearch('');
        }
    };

    const generateDemoData = async () => {
        const confirm = window.confirm("Generate random payment data for the last 7 days?");
        if (!confirm) return;

        try {
            // Get a valid member ID
            const { data: member } = await supabase.from('members').select('id').limit(1).single();
            if (!member) {
                alert("No members found. Create a member first.");
                return;
            }


            // 1. Clear existing payments to prevent accumulation
            // Retrieve all IDs first to ensure robust deletion (sometimes bulk delete is restricted)
            const { data: existingData } = await supabase.from('payments').select('id');
            if (existingData && existingData.length > 0) {
                const ids = existingData.map(d => d.id);
                const { error: deleteError } = await supabase
                    .from('payments')
                    .delete()
                    .in('id', ids);

                if (deleteError) {
                    console.error("Error clearing payments:", deleteError);
                    alert("Warning: Could not clear previous data. Check console/permissions.");
                }
            }

            const payments = [];
            for (let i = 0; i < 7; i++) {
                // Generate 2-5 transactions per day to keep total realistic
                const transactionsCount = Math.floor(Math.random() * 4) + 2;

                for (let j = 0; j < transactionsCount; j++) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    // Randomize time within the day (8 AM to 8 PM)
                    date.setHours(Math.floor(Math.random() * 13) + 8);
                    date.setMinutes(Math.floor(Math.random() * 60));
                    date.setSeconds(0);

                    // Random amount between 2k and 12k (matches realistic gym fees/products)
                    const amount = Math.floor(Math.random() * (12000 - 2000 + 1)) + 2000;

                    payments.push({
                        member_id: member.id,
                        amount: amount,
                        payment_method: Math.random() > 0.4 ? 'Mobile Money' : 'Cash',
                        transaction_date: date.toISOString()
                    });
                }
            }

            const { error } = await supabase.from('payments').insert(payments);
            if (error) throw error;

            alert("Demo data generated! Reloading...");
            window.location.reload();
        } catch (error) {
            console.error("Demo Data Error:", error);
            alert("Failed to generate data.");
        }
    };

    const quickStats = [
        { label: "Today's Attendance", value: todayCount.toString(), icon: Users, trend: 0 },
        { label: "Total Members", value: members.length.toString(), icon: UserPlus, trend: 0 },
        { label: "Daily Revenue", value: `RWF ${financeStats.revenue.toLocaleString()}`, icon: Activity, trend: 0 },
    ];

    const recentActivity = members.slice(0, 4).map((m, i) => ({
        id: m.id,
        name: m.full_name,
        action: i % 2 === 0 ? "Check-in" : "Renewal",
        time: "Recently",
        type: i % 2 === 0 ? "attendance" : "payment"
    }));

    return (
        <div className="space-y-10">
            {/* Action Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-accent text-[10px] font-bold uppercase tracking-[0.4em] mb-1 leading-none">Front Desk Operations</h2>
                    <p className="text-text text-2xl md:text-3xl font-bold tracking-tighter leading-none uppercase">BODYMAX GYM</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={generateDemoData}
                        className="hidden flex items-center gap-2 bg-text/5 text-text px-4 py-4 rounded-3xl font-bold uppercase tracking-widest text-[10px] hover:bg-text/10 transition-all"
                        title="Populate Chart"
                    >
                        <Activity size={16} /> Demo Data
                    </button>
                    <button
                        onClick={() => onNavigate('attendance')}
                        className="flex items-center gap-3 bg-text/5 text-text px-6 py-4 rounded-3xl font-bold uppercase tracking-widest text-xs hover:bg-text/10 transition-all border border-text/5"
                    >
                        <Calendar size={18} strokeWidth={2.5} />
                        Quick Check-in
                    </button>
                    <button
                        onClick={() => onNavigate('members', 'register')}
                        className="flex items-center gap-3 bg-primary text-surface px-6 py-4 rounded-3xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                        <Plus size={18} strokeWidth={3} />
                        New Member
                    </button>
                </div>
            </div>

            {/* Real-time Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickStats.map((stat, i) => (
                    <StatCard key={i} {...stat} featured={true} />
                ))}
            </div>

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Daily Revenue Velocity Chart */}
                <Card subtitle="Revenue Velocity" title="Last 7 Days">
                    <div className="h-48 flex items-end justify-between gap-3 pt-8 px-4">
                        {(() => {
                            const data = financeStats.dailyData || new Array(7).fill({ day: '-', revenue: 0 });
                            const maxRev = Math.max(...data.map(d => d.revenue), 10); // Min 10k scale prevents flat bars
                            return data.map((item, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full justify-end">
                                    <div
                                        className={cn(
                                            "w-full rounded-2xl transition-all duration-[1500ms] relative group min-h-[4px]",
                                            i === data.length - 1 ? "bg-accent shadow-gold" : "bg-primary/30"
                                        )}
                                        style={{ height: `${(item.revenue / maxRev) * 100}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-text border border-text/10 text-[9px] font-bold px-2 py-1 rounded-lg shadow-sm whitespace-nowrap z-20">
                                            {Math.round(item.revenue)}k
                                        </div>
                                    </div>
                                    <span className={cn("text-[9px] font-bold uppercase", i === data.length - 1 ? "text-accent" : "text-text/30")}>
                                        {item.day}
                                    </span>
                                </div>
                            ));
                        })()}
                    </div>
                </Card>

                {/* Quick Search & Filter */}
                <Card subtitle="Member Registry" title="Quick Search">
                    <div className="mt-6 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="FIND BY NAME OR PHONE..."
                                className="w-full bg-text/[0.03] border border-text/5 rounded-[2rem] py-6 pl-16 pr-8 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-accent/30 focus:bg-white transition-all shadow-inner"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Search Results List */}
                        {search.trim() !== '' && (
                            <div className="bg-surface rounded-3xl border border-text/5 divide-y divide-text/5 overflow-hidden shadow-premium animate-in slide-in-from-top-4 duration-300">
                                {filteredMembers.length === 0 ? (
                                    <div className="p-6 text-center text-text/20 text-[10px] font-bold uppercase tracking-widest">
                                        No assets identified
                                    </div>
                                ) : (
                                    filteredMembers.map(member => (
                                        <div
                                            key={member.id}
                                            className="p-4 hover:bg-text/[0.02] group flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-surface border border-text/5 flex items-center justify-center text-text/20 group-hover:text-primary transition-colors">
                                                    <Users size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-text font-bold text-xs uppercase">{member.full_name}</p>
                                                    <p className="text-text/30 text-[9px] font-bold uppercase tracking-widest">{member.category}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-tighter",
                                                    member.status === 'Active' ? "bg-success/10 text-success border border-success/20" :
                                                        member.status === 'Expiring Soon' ? "bg-accent/10 text-accent border border-accent/20" :
                                                            "bg-error/10 text-error border border-error/20"
                                                )}>
                                                    {member.status}
                                                </div>
                                                {member.status !== 'Expired' && (
                                                    <button
                                                        onClick={() => checkedInIds.includes(member.id) ? handleRemove(member.id) : handleCheckIn(member.id)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors shadow-sm",
                                                            checkedInIds.includes(member.id)
                                                                ? "bg-success text-white hover:bg-error"
                                                                : "bg-primary text-white hover:bg-accent"
                                                        )}
                                                        title={checkedInIds.includes(member.id) ? "Undo Check-in" : "Quick Check-in"}
                                                    >
                                                        <CheckCircle2 size={12} strokeWidth={3} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-surface rounded-3xl border border-text/5 text-center group hover:border-accent/20 transition-all cursor-pointer">
                                <span className="block text-text/20 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Expired</span>
                                <span className="text-2xl font-bold ">{expiredCount}</span>
                            </div>
                            <div className="p-6 bg-surface rounded-3xl border border-text/5 text-center group hover:border-accent/20 transition-all cursor-pointer">
                                <span className="block text-text/20 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Expiring Soon</span>
                                <span className="text-2xl font-bold  text-accent">{expiringSoonCount}</span>
                            </div>
                        </div>

                        <div className="hidden bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 flex items-center justify-between">
                            <div>
                                <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">Gate System Status</p>
                                <p className="text-text font-bold text-lg  uppercase">Online & Operational</p>
                            </div>
                            <div className="w-14 h-14 rounded-2.5xl bg-primary text-surface flex items-center justify-center shadow-lg">
                                <CheckCircle2 size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Action Prompts */}
            <div className="bg-accent rounded-[3rem] p-12 text-surface overflow-hidden relative shadow-gold">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-black/5 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-4xl font-bold  tracking-tighter uppercase mb-2">Shift Performance</h3>
                        <p className="text-surface/70 font-bold uppercase tracking-widest text-[10px]">Your activity today has been exceptional. Keep the momentum!</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-6xl font-bold  tracking-tighter leading-none mb-2">98%</p>
                        <p className="text-surface/50 text-[9px] font-bold uppercase tracking-widest">Efficiency Rating</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
