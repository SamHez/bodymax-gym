import React, { useState, useEffect } from 'react';
import { Mail, Lock, ChevronRight, Activity, Sun, Moon, Globe, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../lib/useTheme';
import logo from '../assets/logo.png';
import { apiFetch } from '../lib/api';
import { toast } from '../lib/toast';
import { cn } from '../lib/utils';

export function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [branchId, setBranchId] = useState('');
    const [branches, setBranches] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        apiFetch('/branches')
            .then(data => setBranches(data))
            .catch(err => console.error('Fetch branches error:', err));
    }, []);

    const selectedBranchName = branches.find(b => b.id === branchId)?.name || 'Select Branch Region';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!branchId) {
            setError("Please select a branch");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await apiFetch('/signup', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                    branch_id: branchId
                }),
            });
            toast.success("Account created! Please sign in.");
            navigate('/login');
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 relative overflow-hidden transition-colors duration-500 py-20">
            {/* Ambient Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/[0.05] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/[0.08] rounded-full blur-[120px] pointer-events-none" />

            {/* Back to Login */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate('/login')}
                className="absolute top-8 left-8 flex items-center gap-2 text-text/40 hover:text-accent transition-all text-[10px] font-black uppercase tracking-[0.2em] group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Entry
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={toggleTheme}
                className="absolute top-8 right-8 p-3 bg-card border border-text/5 rounded-2xl shadow-premium text-text/60 hover:text-accent hover:border-accent/20 transition-all"
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </motion.button>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10 space-y-8"
            >
                <div className="text-center">
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="inline-block p-5 bg-card rounded-[2.5rem] shadow-premium mb-8 border border-text/5 relative group"
                    >
                        <img src={logo} alt="BodyMax Gym" className="h-14 w-auto relative z-10" />
                        <div className="absolute inset-0 bg-accent/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </motion.div>
                    <h1 className="text-4xl font-black tracking-tighter text-text mb-2 uppercase">
                        STAFF <span className="text-accent underline decoration-accent/30 underline-offset-8">ENROLL</span>
                    </h1>
                    <p className="text-text/30 font-black uppercase tracking-[0.4em] text-[9px]">Administrative Credential Access</p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-error/10 border border-error/20 p-5 rounded-[1.5rem] text-error text-[10px] font-black uppercase tracking-widest text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Custom Branch Selector */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-text/30 uppercase tracking-[0.2em] ml-2">Assigned Field Unit</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={cn(
                                    "glass-input w-full py-5 px-6 rounded-2xl flex items-center justify-between group transition-all duration-300",
                                    isDropdownOpen ? "border-accent/40 bg-accent/5 ring-4 ring-accent/5" : "hover:border-text/20"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <Globe className={cn("transition-colors duration-300", branchId ? "text-accent" : "text-text/20")} size={20} />
                                    <span className={cn("font-black text-sm uppercase tracking-tight", branchId ? "text-text" : "text-text/30")}>
                                        {selectedBranchName}
                                    </span>
                                </div>
                                <ChevronRight className={cn("text-text/20 transition-transform duration-300", isDropdownOpen && "rotate-90 text-accent")} size={18} strokeWidth={3} />
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 right-0 mt-3 p-3 bg-card border border-text/5 rounded-[2rem] shadow-2xl z-50 backdrop-blur-xl overflow-hidden"
                                    >
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
                                            {branches.length === 0 && (
                                                <div className="p-8 text-center text-text/20 text-[10px] font-black uppercase tracking-widest">
                                                    Establishing Server Link...
                                                </div>
                                            )}
                                            {branches.map((branch) => (
                                                <button
                                                    key={branch.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setBranchId(branch.id);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full p-4 rounded-xl flex items-center justify-between transition-all group/item",
                                                        branchId === branch.id ? "bg-accent/10 text-accent" : "text-text/60 hover:bg-surface hover:text-text"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs",
                                                            branchId === branch.id ? "bg-accent text-white" : "bg-surface border border-text/5"
                                                        )}>
                                                            {branch.branch_code}
                                                        </div>
                                                        <span className="font-black text-xs uppercase tracking-tight">{branch.name}</span>
                                                    </div>
                                                    {branchId === branch.id && <Check size={16} strokeWidth={3} />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text/30 uppercase tracking-[0.2em] ml-2">Professional Access Core</label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
                            <input
                                type="email"
                                placeholder="name@bodymaxgym.rw"
                                className="glass-input w-full py-5 pl-14 pr-4 rounded-2xl font-black text-sm tracking-tight placeholder:text-text/10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text/30 uppercase tracking-[0.2em] ml-2">System Cipher</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="glass-input w-full py-5 pl-14 pr-4 rounded-2xl font-black text-sm tracking-widest placeholder:text-text/10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text/30 uppercase tracking-[0.2em] ml-2">Verify Sequence</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text/20 group-focus-within:text-accent transition-colors" size={20} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="glass-input w-full py-5 pl-14 pr-4 rounded-2xl font-black text-sm tracking-widest placeholder:text-text/10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-black py-5 rounded-[1.5rem] shadow-premium flex items-center justify-center gap-3 transition-all text-[11px] uppercase tracking-[0.3em] disabled:opacity-50 mt-10 hover:shadow-accent/20 active:shadow-inner"
                    >
                        {loading ? (
                            <Activity className="animate-spin" size={18} />
                        ) : (
                            <>
                                Initialize Profile <ChevronRight size={18} strokeWidth={3} />
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="pt-8 text-center">
                    <p className="text-text/10 text-[8px] font-black uppercase tracking-[0.5em] leading-relaxed">
                        Authorized Personnel Only<br />BodyMax Gym Proprietary Grid System
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
