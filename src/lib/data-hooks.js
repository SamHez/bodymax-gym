import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function useMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMembers() {
            setLoading(true);
            const { data, error } = await supabase
                .from('members')
                .select('*');

            if (error) {
                console.error("Supabase Fetch Error (Members):", error);
            }
            if (data) {
                console.log("Supabase Fetch Success (Members):", data.length, "records");
                setMembers(data);
            }
            setLoading(false);
        }
        fetchMembers();
    }, []);

    const deleteMember = async (id) => {
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', id);

        if (!error) {
            setMembers(prev => prev.filter(m => m.id !== id));
            return true;
        }
        console.error("Error deleting member:", error);
        return false;
    };

    return { members, loading, deleteMember };
}

export function useAttendance() {
    const [todayCount, setTodayCount] = useState(0);
    const [checkedInIds, setCheckedInIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAttendance() {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('attendance')
                .select('member_id')
                .eq('attendance_date', today);

            if (data) {
                setCheckedInIds(data.map(a => a.member_id));
                setTodayCount(data.length);
            }
            setLoading(false);
        }
        fetchAttendance();
    }, []);

    const checkIn = async (memberId) => {
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase
            .from('attendance')
            .insert([{ member_id: memberId, attendance_date: today }]);

        if (!error) {
            setTodayCount(prev => prev + 1);
            setCheckedInIds(prev => [...prev, memberId]);
            return true;
        }
        return false;
    };

    const removeCheckIn = async (memberId) => {
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase
            .from('attendance')
            .delete()
            .eq('member_id', memberId)
            .eq('attendance_date', today);

        if (!error) {
            setTodayCount(prev => Math.max(0, prev - 1));
            setCheckedInIds(prev => prev.filter(id => id !== memberId));
            return true;
        }
        return false;
    };

    return { todayCount, checkedInIds, checkIn, removeCheckIn, loading };
}

export function useExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchExpenses = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('expense_date', { ascending: false });

        if (data) setExpenses(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const addExpense = async (expense) => {
        const { data: userData } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('expenses')
            .insert([{ ...expense, recorded_by: userData.user?.id }])
            .select();

        if (!error && data) {
            setExpenses(prev => [data[0], ...prev]);
            return true;
        }
        return false;
    };

    return { expenses, loading, addExpense, refresh: fetchExpenses };
}

export function useFinance() {
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, netProfit: 0, transactions: 0, breakdown: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFinance() {
            const { data: payData } = await supabase.from('payments').select('*');
            const { data: expData } = await supabase.from('expenses').select('*');

            if (payData && expData) {
                const totalRev = payData.reduce((sum, p) => sum + Number(p.amount), 0);
                const totalExp = expData.reduce((sum, e) => sum + Number(e.amount), 0);

                // Monthly stats
                const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
                const monthlyData = new Array(10).fill(0).map((_, i) => {
                    const date = new Date();
                    date.setDate(1);
                    date.setMonth(date.getMonth() - (9 - i));
                    const monthIndex = date.getMonth();
                    const year = date.getFullYear();

                    const monthRev = payData
                        .filter(p => p.transaction_date && new Date(p.transaction_date).getUTCMonth() === monthIndex && new Date(p.transaction_date).getUTCFullYear() === year)
                        .reduce((sum, p) => sum + Number(p.amount), 0);

                    const monthExp = expData
                        .filter(e => e.expense_date && new Date(e.expense_date).getUTCMonth() === monthIndex && new Date(e.expense_date).getUTCFullYear() === year)
                        .reduce((sum, e) => sum + Number(e.amount), 0);

                    return {
                        month: months[monthIndex],
                        revenue: monthRev / 1000,
                        expenses: monthExp / 1000,
                        profit: (monthRev - monthExp) / 1000
                    };
                });

                // Daily stats
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dailyData = new Array(7).fill(0).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    const dayIndex = date.getDay();
                    const dayDate = date.toISOString().split('T')[0];

                    const dayRev = payData
                        .filter(p => p.transaction_date?.startsWith(dayDate))
                        .reduce((sum, p) => sum + Number(p.amount), 0);

                    const dayExp = expData
                        .filter(e => e.expense_date?.startsWith(dayDate))
                        .reduce((sum, e) => sum + Number(e.amount), 0);

                    return {
                        day: days[dayIndex],
                        revenue: dayRev / 1000,
                        expenses: dayExp / 1000,
                        profit: (dayRev - dayExp) / 1000
                    };
                });

                setStats({
                    revenue: totalRev,
                    expenses: totalExp,
                    netProfit: totalRev - totalExp,
                    transactions: payData.length,
                    mobileRevenue: payData.filter(p => p.payment_method === 'Mobile Money').reduce((sum, p) => sum + Number(p.amount), 0),
                    cashRevenue: payData.filter(p => p.payment_method === 'Cash').reduce((sum, p) => sum + Number(p.amount), 0),
                    monthlyData,
                    dailyData,
                    expenseCategories: expData.reduce((acc, e) => {
                        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
                        return acc;
                    }, {})
                });
            }
            setLoading(false);
        }
        fetchFinance();
    }, []);

    return { stats, loading };
}
