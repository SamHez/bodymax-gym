import React, { useState } from 'react';
import { Card } from './Card';
import { Search, Filter, MoreHorizontal, User, ShieldCheck, Plus, Trash2, Eye } from 'lucide-react';
import { cn } from '../lib/utils'; // Keep this import
import { MemberDetailsModal } from './MemberDetailsModal';

import { useMembers } from '../lib/data-hooks';

export function MemberList({ onAddMember }) {
    const [search, setSearch] = useState('');
    const { members, loading, deleteMember } = useMembers(); // Destructure deleteMember
    const [selectedMember, setSelectedMember] = useState(null);
    const [menuOpenId, setMenuOpenId] = useState(null);

    const filteredMembers = members.filter(m =>
        m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.phone?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to permanently delete this member?")) {
            await deleteMember(id); // Use the hook function
            setMenuOpenId(null);
        }
    };

    return (
        <div className="space-y-10" onClick={() => setMenuOpenId(null)}>
            {/* Directory Header */}
            <div className="flex justify-between items-center bg-card p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-text/5 shadow-premium relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />
                <div>
                    <h2 className="text-accent text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-1 leading-none ">Asset Database</h2>
                    <p className="text-text text-2xl md:text-4xl font-bold tracking-tighter leading-none uppercase">DIRECTORY</p>
                </div>

                <button
                    onClick={onAddMember}
                    className="flex items-center gap-0 md:gap-4 p-4 md:px-8 md:py-5 bg-primary text-white rounded-2xl md:rounded-3xl shadow-premium hover:scale-105 active:scale-95 transition-all font-bold text-xs uppercase tracking-widest z-10"
                >
                    <Plus size={20} strokeWidth={3} className="md:mr-0" />
                    <span className="hidden md:inline">New Enrollment</span>
                </button>
            </div>

            {/* Tactical Search Interface - Reduced Size */}
            <Card className="p-2 border border-text/5 shadow-premium group max-w-xl">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors w-4 h-4" strokeWidth={2.5} />
                    <input
                        type="text"
                        placeholder="SEARCH MEMBERS..."
                        className="w-full bg-surface/50 border-none rounded-[1.5rem] py-3 pl-14 pr-6 text-text font-bold text-sm focus:ring-4 focus:ring-accent/10 placeholder:text-text/10 transition-all font-sans uppercase tracking-widest"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </Card>

            {/* Grid-based Member Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-2 py-20 text-center text-text/10 font-bold uppercase tracking-[1em] animate-pulse">
                        Synchronizing Database...
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="col-span-2 py-20 text-center text-text/10 font-bold uppercase tracking-[0.5em]">
                        No Assets Identified in Registry
                    </div>
                ) : filteredMembers.map(member => (
                    <Card
                        key={member.id}
                        className="p-4 pr-4 flex items-center justify-between group hover:border-accent/30 transition-all relative overflow-visible cursor-pointer"
                        onClick={() => setSelectedMember(member)}
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[2rem] bg-surface flex items-center justify-center text-text/10 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-700">
                                <User size={24} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <p className="text-text font-bold text-lg tracking-tighter leading-none">{member.full_name}</p>
                                    {member.status === 'Active' && <ShieldCheck size={16} className="text-success" />}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-bold text-text/20 uppercase tracking-[0.15em]">{member.category}</span>
                                    <div className="w-1 h-1 bg-text/5 rounded-full" />
                                    <span className={cn(
                                        "text-[9px] font-bold tracking-tight px-2 py-0.5 rounded-lg shadow-sm",
                                        member.status === 'Active' ? "text-success bg-success/10 border border-success/20" :
                                            member.status === 'Expiring Soon' ? "text-accent bg-accent/10 border border-accent/20" : "text-error bg-error/10 border border-error/20"
                                    )}>
                                        {member.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenId(menuOpenId === member.id ? null : member.id);
                                }}
                                className="p-3 text-text/20 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {/* Context Menu */}
                            {menuOpenId === member.id && (
                                <div className="absolute top-12 right-0 w-48 bg-card border border-text/5 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedMember(member);
                                            setMenuOpenId(null);
                                        }}
                                        className="w-full text-left px-5 py-3 hover:bg-surface text-[10px] font-bold uppercase tracking-widest text-text/60 hover:text-text flex items-center gap-2"
                                    >
                                        <Eye size={14} /> View Details
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(member.id, e)}
                                        className="w-full text-left px-5 py-3 hover:bg-error/5 text-[10px] font-bold uppercase tracking-widest text-error/60 hover:text-error flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Delete Asset
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Status edge indicator */}
                        <div className={cn(
                            "absolute top-0 right-0 w-1 h-full opacity-0 group-hover:opacity-30 transition-opacity",
                            member.status === 'Active' ? "bg-success" :
                                member.status === 'Expiring Soon' ? "bg-accent" : "bg-error"
                        )} />
                    </Card>
                ))}
            </div>

            {/* Audit Summary Footer */}
            <div className="pt-10 flex flex-col items-center gap-4">
                <div className="h-[2px] w-32 bg-text/[0.03] rounded-full" />
                <p className="text-text/20 font-bold text-xs uppercase tracking-[0.5em] ">
                    Viewing {filteredMembers.length.toLocaleString()} Verified Personnel
                </p>
            </div>

            {/* Details Modal */}
            {selectedMember && (
                <MemberDetailsModal
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                    onDelete={deleteMember}
                />
            )}
        </div>
    );
}
