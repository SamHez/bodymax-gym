import React from 'react';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    CreditCard,
    Activity,
    LogOut,
    User,
    ChevronRight,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '../lib/useTheme';
import logo from '../assets/logo.png';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe } from 'lucide-react';

import { NavLink } from 'react-router-dom';

export function Sidebar({ activeTab, user, onLogout }) {
    const { theme, toggleTheme } = useTheme();

    // Role-based tabs
    const allTabs = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', role: 'both' },
        { id: 'members', icon: Users, label: 'Members', path: '/members', role: 'both' },
        { id: 'attendance', icon: UserCheck, label: 'Attendance', path: '/attendance', role: 'both' },
        { id: 'finance', icon: CreditCard, label: 'Finance', path: '/finance', role: 'both' },
        // { id: 'trainers', icon: Activity, label: 'Trainers', path: '/trainers', role: 'manager' },
        // { id: 'expiry', icon: Bell, label: 'Expiry', path: '/expiry', role: 'manager' },
    ];

    const filteredTabs = allTabs.filter(tab =>
        tab.role === 'both' || tab.role === user?.role
    );

    return (
        <aside className="hidden lg:flex flex-col w-80 fixed left-0 top-0 bottom-0 bg-card border-r border-text/5 z-50 transition-all duration-300">
            {/* Brand Header */}
            <div className="p-10 pb-12">
                <div className="flex items-center gap-4 mb-2">
                    <img src={logo} alt="BodyMax Gym" className="h-10 w-auto" />
                    <h2 className="text-text font-bold text-1xl tracking-tighter">BODYMAX GYM</h2>
                </div>
                <p className="hidden text-accent text-[10px] font-bold uppercase tracking-[0.4em] ml-1">Gym Suite</p>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-6 space-y-2">
                {filteredTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <NavLink
                            key={tab.id}
                            to={tab.path}
                            className={({ isActive }) => cn(
                                "w-full flex items-center gap-5 px-6 py-4 rounded-3xl transition-all duration-300 group relative",
                                isActive
                                    ? "bg-primary text-white shadow-premium"
                                    : "text-text/40 hover:text-text hover:bg-surface"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={20} className={cn("transition-transform group-hover:scale-110", isActive && "text-accent")} />
                                    <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                                    {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Tools & Persistence - MOVED TO TOPNAV */}
        </aside>
    );
}

export function TopNav({ user, onLogout, branches, selectedBranchId, onBranchChange }) {
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);

    const activeBranch = branches.find(b => b.id === selectedBranchId);

    return (
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-text/5 px-6 py-4 flex items-center justify-end gap-6 transition-all">
            {/* Custom Branch Selector for Managers */}
            {user?.role === 'manager' && (
                <div className="relative mr-auto">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-4 bg-card px-6 py-3 rounded-2xl border border-text/10 shadow-premium hover:border-accent/30 transition-all group"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-[8px] font-black uppercase text-text/30 tracking-[0.3em] leading-none mb-1">Active Region</span>
                            <div className="flex items-center gap-2">
                                <Globe size={12} className="text-accent" />
                                <span className="text-xs font-bold text-text truncate max-w-[150px]">
                                    {activeBranch ? activeBranch.name : 'Global Network'}
                                </span>
                            </div>
                        </div>
                        <ChevronDown size={14} className={cn("text-text/20 transition-transform duration-300", isOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <>
                                <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-16 left-0 w-64 bg-card border border-text/10 rounded-[2rem] shadow-mega z-50 overflow-hidden p-2"
                                >
                                    <button
                                        onClick={() => { onBranchChange(''); setIsOpen(false); }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                            !selectedBranchId ? "bg-accent/10 text-accent" : "text-text/40 hover:bg-surface hover:text-text"
                                        )}
                                    >
                                        Global Network
                                        {!selectedBranchId && <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-gold" />}
                                    </button>
                                    <div className="h-[1px] bg-text/5 my-1 mx-4" />
                                    {branches.map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => { onBranchChange(b.id); setIsOpen(false); }}
                                            className={cn(
                                                "w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                                selectedBranchId === b.id ? "bg-accent/10 text-accent" : "text-text/40 hover:bg-surface hover:text-text"
                                            )}
                                        >
                                            {b.name}
                                            {selectedBranchId === b.id && <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-gold" />}
                                        </button>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <button
                onClick={toggleTheme}
                className="p-3 bg-card border border-text/5 rounded-2xl shadow-premium text-text/40 hover:text-accent transition-all"
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <div className="flex items-center gap-4 bg-card pl-4 pr-2 py-2 rounded-full border border-text/5 shadow-premium">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-text font-bold text-xs tracking-tight">{user?.role === 'manager' ? 'Admin Manager' : 'Front Desk'}</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="p-2 bg-error/5 text-error hover:bg-error hover:text-white rounded-full transition-all"
                    title="Sign Out"
                >
                    <LogOut size={16} />
                </button>
            </div>
        </header>
    );
}

export function MobileHeader({ user, onLogout, branches, selectedBranchId, onBranchChange }) {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <header className="fixed lg:hidden top-0 left-0 right-0 h-24 bg-surface/80 backdrop-blur-2xl border-b border-text/5 z-[60] px-6 flex justify-between items-center transition-all">
            <div className="flex items-center gap-3">
                <img src={logo} alt="BodyMax Gym" className="h-8 w-auto" />
                <div className="h-5 w-[2px] bg-text/5" />
                <h1 className="text-text font-bold text-lg tracking-tighter uppercase ">BodyMax</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Mobile Custom Branch Filter for Managers */}
                {user?.role === 'manager' && (
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(isMenuOpen === 'branch' ? false : 'branch')}
                            className={cn(
                                "flex items-center gap-2 bg-card border border-text/5 rounded-2xl px-4 py-3 shadow-premium transition-all",
                                isMenuOpen === 'branch' ? "border-accent/30 text-accent" : "text-text/40"
                            )}
                        >
                            <Globe size={14} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">
                                {branches.find(b => b.id === selectedBranchId)?.branch_code || 'ALL'}
                            </span>
                            <ChevronDown size={12} className={cn("transition-transform", isMenuOpen === 'branch' && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {isMenuOpen === 'branch' && (
                                <>
                                    <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-16 right-0 w-48 bg-card border border-text/10 rounded-[2rem] shadow-mega z-50 p-2"
                                    >
                                        <button
                                            onClick={() => { onBranchChange(''); setIsMenuOpen(false); }}
                                            className={cn(
                                                "w-full text-left px-5 py-4 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all",
                                                !selectedBranchId ? "bg-accent/10 text-accent" : "text-text/40 hover:bg-surface"
                                            )}
                                        >
                                            GLOBAL
                                        </button>
                                        {branches.map(b => (
                                            <button
                                                key={b.id}
                                                onClick={() => { onBranchChange(b.id); setIsMenuOpen(false); }}
                                                className={cn(
                                                    "w-full text-left px-5 py-4 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all",
                                                    selectedBranchId === b.id ? "bg-accent/10 text-accent" : "text-text/40 hover:bg-surface"
                                                )}
                                            >
                                                {b.name.split(' ').pop()}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <button
                    onClick={toggleTheme}
                    className="p-3 bg-card border border-text/5 rounded-2xl shadow-premium text-text/40"
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(isMenuOpen === 'user' ? false : 'user')}
                        className={cn(
                            "relative p-3 bg-card border border-text/5 rounded-2xl shadow-premium transition-all",
                            isMenuOpen === 'user' ? "text-accent border-accent/20" : "text-text/40"
                        )}
                    >
                        <User size={18} />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen === 'user' && (
                            <>
                                <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-16 right-0 w-64 bg-card border border-text/10 rounded-[2rem] shadow-mega z-50 p-6"
                                >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
                                        {user?.email?.[0].toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-text font-bold text-xs tracking-tight truncate uppercase">{user?.role === 'manager' ? 'Admin Manager' : 'Front Desk'}</p>
                                        <p className="text-text/30 text-[9px] font-bold uppercase tracking-tighter truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-error/5 text-error border border-error/10 hover:bg-error hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                                >
                                    <LogOut size={14} /> Sign Out
                                </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
