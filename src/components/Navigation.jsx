import React from 'react';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    CreditCard,
    Activity,
    User,
    ChevronRight,
    Sun,
    Moon,
    Receipt,
    LogOut
} from 'lucide-react';
import { useTheme } from '../lib/useTheme';
import logo from '../assets/logo.png';
import { cn } from '../lib/utils';

import { NavLink } from 'react-router-dom';

export function Sidebar({ activeTab, user, onLogout, isCollapsed, onToggleCollapse }) {
    const { theme, toggleTheme } = useTheme();

    const allTabs = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', role: 'both' },
        { id: 'members', icon: Users, label: 'Members', path: '/members', role: 'both' },
        { id: 'attendance', icon: UserCheck, label: 'Attendance', path: '/attendance', role: 'both' },
        { id: 'expenses', icon: Receipt, label: 'Expenses', path: '/expenses', role: 'both' },
        { id: 'finance', icon: CreditCard, label: 'Finance', path: '/finance', role: 'both' },
    ];

    const filteredTabs = allTabs.filter(tab =>
        tab.role === 'both' || tab.role === user?.role
    );

    return (
        <aside className={cn(
            "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-card border-r border-text/5 z-50 transition-all duration-500 overflow-visible liquid-glass",
            isCollapsed ? "w-20" : "w-72"
        )}>
            {/* Collapse Toggle */}
            <button
                onClick={onToggleCollapse}
                className="absolute -right-4 top-10 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-premium hover:scale-110 active:scale-95 transition-all z-10"
            >
                {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} className="rotate-180" />}
            </button>

            {/* Brand Header */}
            <div className={cn("p-10 transition-all", isCollapsed ? "px-5" : "pb-12")}>
                <div className="flex items-center gap-4 mb-2 overflow-hidden whitespace-nowrap">
                    <img src={logo} alt="BodyMax Gym" className="h-10 w-auto flex-shrink-0 drop-shadow-2xl" />
                    {!isCollapsed && <h2 className="text-text font-black text-xl tracking-[0.2em] uppercase">BODY<span className="text-primary italic">MAX</span></h2>}
                </div>
            </div>

            {/* Navigation Links */}
            <nav className={cn("flex-1 space-y-1 px-6", isCollapsed && "px-4")}>
                {filteredTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <NavLink
                            key={tab.id}
                            to={tab.path}
                            className={({ isActive }) => cn(
                                "w-full flex items-center rounded-2xl transition-all duration-500 group relative overflow-hidden",
                                isCollapsed ? "justify-center p-5" : "gap-6 px-8 py-5",
                                isActive
                                    ? "bg-primary text-white shadow-[0_20px_40px_rgba(30,136,229,0.3)] scale-[0.9]"
                                    : "text-text/30 hover:text-primary hover:bg-primary/5"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Sidebar Hover Tooltip for Collapsed View */}
                                    {isCollapsed && (
                                        <div className="absolute left-[calc(100%+1rem)] bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 translate-x-[-10px] pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all z-[100] shadow-premium whitespace-nowrap">
                                            {tab.label}
                                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-primary rotate-45" />
                                        </div>
                                    )}

                                    <Icon
                                        size={22}
                                        strokeWidth={isActive ? 3 : 2}
                                        className={cn("transition-all duration-500 flex-shrink-0", isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" : "group-hover:scale-110 group-hover:text-primary")}
                                    />
                                    {!isCollapsed && <span className="font-black text-xs uppercase tracking-[0.15em] whitespace-nowrap">{tab.label}</span>}
                                    {!isCollapsed && isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
}

export function TopNav({ user, onLogout }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-text/5 px-6 py-4 flex items-center justify-end gap-6 transition-all">
            <button
                onClick={toggleTheme}
                className="p-3 bg-card border border-text/5 rounded-2xl shadow-premium text-text/40 hover:text-primary transition-all"
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

export function MobileHeader({ user, onLogout }) {
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
                <button
                    onClick={toggleTheme}
                    className="p-3 bg-card border border-text/5 rounded-2xl shadow-premium text-text/40"
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={cn(
                            "relative p-3 bg-card border border-text/5 rounded-2xl shadow-premium transition-all",
                            isMenuOpen ? "text-primary border-primary/20" : "text-text/40"
                        )}
                    >
                        <User size={18} />
                    </button>

                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute top-16 right-0 w-64 bg-card border border-text/5 rounded-[2rem] shadow-premium p-6 animate-in fade-in zoom-in-95 duration-200">
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
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
