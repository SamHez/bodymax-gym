import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

const MEMBER_FIELDS = `
    id,
    member_code,
    branch_code,
    full_name,
    phone,
    email,
    category,
    duration,
    start_date,
    expiry_date,
    status,
    picture_url,
    created_at
`;

const DEFAULT_MEMBERS_CACHE_TTL = 60 * 1000;
const DEFAULT_COUNT_CACHE_TTL = 30 * 1000;

let membersListCache = null;
let membersListCacheAt = 0;
const memberCountCache = new Map();

function getCountCacheKey(status) {
    return status || '__all__';
}

function isFresh(timestamp, ttl) {
    return Date.now() - timestamp < ttl;
}

function updateMembersListCache(members) {
    membersListCache = members;
    membersListCacheAt = Date.now();
    memberCountCache.set(getCountCacheKey(), {
        value: members.length,
        at: Date.now(),
    });
}

function getCachedCount(status) {
    return memberCountCache.get(getCountCacheKey(status));
}

function updateMemberCountCache(count, status) {
    memberCountCache.set(getCountCacheKey(status), {
        value: count,
        at: Date.now(),
    });
}

function decrementMemberCaches(deletedId) {
    if (Array.isArray(membersListCache)) {
        const nextMembers = membersListCache.filter((member) => member.id !== deletedId);
        if (nextMembers.length !== membersListCache.length) {
            membersListCache = nextMembers;
            membersListCacheAt = Date.now();
            updateMemberCountCache(nextMembers.length);
        }
    } else {
        const totalCountCache = getCachedCount();
        if (totalCountCache) {
            updateMemberCountCache(Math.max(0, totalCountCache.value - 1));
        }
    }
}

export function useMembers(options = {}) {
    const {
        countOnly = false,
        search = '',
        status,
        limit,
        enabled = true,
    } = options;

    const normalizedSearch = search.trim();
    const isSearchQuery = normalizedSearch.length > 0;
    const canUseListCache = !countOnly && !isSearchQuery && enabled;
    const canUseCountCache = countOnly && !isSearchQuery && !status && enabled;
    const cachedCountEntry = canUseCountCache ? getCachedCount(status) : null;

    const [members, setMembers] = useState(() => (
        canUseListCache && isFresh(membersListCacheAt, DEFAULT_MEMBERS_CACHE_TTL)
            ? membersListCache
            : []
    ));
    const [count, setCount] = useState(() => (
        cachedCountEntry && isFresh(cachedCountEntry.at, DEFAULT_COUNT_CACHE_TTL)
            ? cachedCountEntry.value ?? 0
            : 0
    ));
    const [loading, setLoading] = useState(() => {
        if (!enabled) return false;
        if (canUseListCache && isFresh(membersListCacheAt, DEFAULT_MEMBERS_CACHE_TTL)) return false;
        if (cachedCountEntry && isFresh(cachedCountEntry.at, DEFAULT_COUNT_CACHE_TTL)) return false;
        return true;
    });

    const fetchMembers = useCallback(async ({ force = false } = {}) => {
        if (!enabled) {
            setLoading(false);
            if (!countOnly) setMembers([]);
            return countOnly ? 0 : [];
        }

        if (countOnly) {
            const nextCachedCountEntry = getCachedCount(status);
            if (!force && nextCachedCountEntry && isFresh(nextCachedCountEntry.at, DEFAULT_COUNT_CACHE_TTL)) {
                setCount(nextCachedCountEntry.value ?? 0);
                setLoading(false);
                return nextCachedCountEntry.value ?? 0;
            }

            setLoading(true);
            let countQuery = supabase
                .from('members')
                .select('id', { count: 'exact', head: true });

            if (status) {
                countQuery = countQuery.eq('status', status);
            }

            const { count: nextCount, error } = await countQuery;

            if (error) {
                console.error("Supabase Fetch Error (Members Count):", error);
                setLoading(false);
                return 0;
            }

            const resolvedCount = nextCount ?? 0;
            setCount(resolvedCount);
            if (!isSearchQuery) {
                updateMemberCountCache(resolvedCount, status);
            }
            setLoading(false);
            return resolvedCount;
        }

        if (!force && !isSearchQuery && isFresh(membersListCacheAt, DEFAULT_MEMBERS_CACHE_TTL)) {
            setMembers(membersListCache ?? []);
            setLoading(false);
            return membersListCache ?? [];
        }

        setLoading(true);
        let query = supabase
            .from('members')
            .select(MEMBER_FIELDS)
            .order('created_at', { ascending: false });

        if (isSearchQuery) {
            query = query.or(`full_name.ilike.%${normalizedSearch}%,phone.ilike.%${normalizedSearch}%`);
        }

        if (status) {
            query = query.eq('status', status);
        }

        if (typeof limit === 'number') {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Supabase Fetch Error (Members):", error);
            setLoading(false);
            return [];
        }

        if (data) {
            setMembers(data);
            if (!isSearchQuery) {
                updateMembersListCache(data);
            }
        }
        setLoading(false);
        return data ?? [];
    }, [countOnly, enabled, isSearchQuery, limit, normalizedSearch, status]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const deleteMember = async (id) => {
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', id);

        if (!error) {
            setMembers(prev => prev.filter(m => m.id !== id));
            decrementMemberCaches(id);
            return true;
        }
        console.error("Error deleting member:", error);
        return false;
    };

    return {
        members,
        count,
        loading,
        deleteMember,
        refresh: (force = true) => fetchMembers({ force }),
    };
}

// --- Attendance Cache ---
const ATTENDANCE_CACHE_TTL = 60 * 1000;
let attendanceCache = null;
let attendanceCacheAt = 0;

export function useAttendance() {
    const [todayCount, setTodayCount] = useState(() => attendanceCache?.todayCount ?? 0);
    const [checkedInIds, setCheckedInIds] = useState(() => attendanceCache?.checkedInIds ?? []);
    const [loading, setLoading] = useState(() => !attendanceCache || !isFresh(attendanceCacheAt, ATTENDANCE_CACHE_TTL));

    const fetchAttendance = useCallback(async ({ force = false } = {}) => {
        if (!force && attendanceCache && isFresh(attendanceCacheAt, ATTENDANCE_CACHE_TTL)) {
            setTodayCount(attendanceCache.todayCount);
            setCheckedInIds(attendanceCache.checkedInIds);
            setLoading(false);
            return;
        }
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('attendance')
            .select('member_id')
            .eq('attendance_date', today);

        if (data) {
            const ids = data.map(a => a.member_id);
            setCheckedInIds(ids);
            setTodayCount(data.length);
            attendanceCache = { todayCount: data.length, checkedInIds: ids };
            attendanceCacheAt = Date.now();
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const checkIn = async (memberId) => {
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase
            .from('attendance')
            .insert([{ member_id: memberId, attendance_date: today }]);

        if (!error) {
            setTodayCount(prev => prev + 1);
            setCheckedInIds(prev => {
                const next = [...prev, memberId];
                if (attendanceCache) attendanceCache = { todayCount: attendanceCache.todayCount + 1, checkedInIds: next };
                return next;
            });
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
            setCheckedInIds(prev => {
                const next = prev.filter(id => id !== memberId);
                if (attendanceCache) attendanceCache = { todayCount: Math.max(0, attendanceCache.todayCount - 1), checkedInIds: next };
                return next;
            });
            return true;
        }
        return false;
    };

    return { todayCount, checkedInIds, checkIn, removeCheckIn, loading, refresh: () => fetchAttendance({ force: true }) };
}

// --- Expenses Cache ---
const EXPENSES_CACHE_TTL = 120 * 1000;
let expensesCache = null;
let expensesCacheAt = 0;

export function useExpenses() {
    const [expenses, setExpenses] = useState(() => expensesCache ?? []);
    const [loading, setLoading] = useState(() => !expensesCache || !isFresh(expensesCacheAt, EXPENSES_CACHE_TTL));

    const fetchExpenses = useCallback(async ({ force = false } = {}) => {
        if (!force && expensesCache && isFresh(expensesCacheAt, EXPENSES_CACHE_TTL)) {
            setExpenses(expensesCache);
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('expense_date', { ascending: false });

        if (data) {
            setExpenses(data);
            expensesCache = data;
            expensesCacheAt = Date.now();
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const addExpense = async (expense) => {
        const { data: userData } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('expenses')
            .insert([{ ...expense, recorded_by: userData.user?.id }])
            .select();

        if (!error && data) {
            setExpenses(prev => {
                const next = [data[0], ...prev];
                expensesCache = next;
                expensesCacheAt = Date.now();
                return next;
            });
            return true;
        }
        return false;
    };

    return { expenses, loading, addExpense, refresh: () => fetchExpenses({ force: true }) };
}

// --- Finance Cache ---
const FINANCE_CACHE_TTL = 120 * 1000;
let financeCache = null;
let financeCacheAt = 0;

export function useFinance() {
    const [stats, setStats] = useState({
        revenue: 0,
        expenses: 0,
        netProfit: 0,
        transactions: 0,
        mobileRevenue: 0,
        cashRevenue: 0,
        todayRevenue: 0,
        todayExpenses: 0,
        monthlyData: [],
        dailyData: [],
        expenseCategories: {},
        expenseBreakdown: [],
        recentTransactions: [],
    });
    const [loading, setLoading] = useState(() => !financeCache || !isFresh(financeCacheAt, FINANCE_CACHE_TTL));

    const fetchFinance = useCallback(async ({ force = false } = {}) => {
        if (!force && financeCache && isFresh(financeCacheAt, FINANCE_CACHE_TTL)) {
            setStats(financeCache);
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data: payData } = await supabase
            .from('payments')
            .select(`
                id,
                amount,
                payment_method,
                transaction_date,
                members (
                    full_name,
                    member_code
                )
            `);
        const { data: expData } = await supabase.from('expenses').select('*');

        if (payData && expData) {
            const totalRev = payData.reduce((sum, p) => sum + Number(p.amount), 0);
            const totalExp = expData.reduce((sum, e) => sum + Number(e.amount), 0);

            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
            const monthlyData = new Array(10).fill(0).map((_, i) => {
                const date = new Date();
                date.setDate(1);
                date.setMonth(date.getMonth() - (9 - i));
                const monthIndex = date.getMonth();
                const year = date.getFullYear();

                const monthRev = payData
                    .filter(p => {
                        const d = new Date(p.transaction_date);
                        return d.getMonth() === monthIndex && d.getFullYear() === year;
                    })
                    .reduce((sum, p) => sum + Number(p.amount), 0);

                const monthExp = expData
                    .filter(e => {
                        const d = new Date(e.expense_date);
                        return d.getMonth() === monthIndex && d.getFullYear() === year;
                    })
                    .reduce((sum, e) => sum + Number(e.amount), 0);

                return {
                    month: months[monthIndex],
                    revenue: monthRev / 1000,
                    expenses: monthExp / 1000,
                    profit: (monthRev - monthExp) / 1000
                };
            });

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dailyData = new Array(7).fill(0).map((_, i) => {
                const date = new Date(now);
                date.setDate(date.getDate() - (6 - i));
                const dayIndex = date.getDay();
                const dayStr = date.toISOString().split('T')[0];

                const dayRev = payData
                    .filter(p => p.transaction_date && p.transaction_date.startsWith(dayStr))
                    .reduce((sum, p) => sum + Number(p.amount), 0);

                const dayExp = expData
                    .filter(e => e.expense_date && e.expense_date.startsWith(dayStr))
                    .reduce((sum, e) => sum + Number(e.amount), 0);

                return {
                    day: days[dayIndex],
                    revenue: dayRev / 1000,
                    expenses: dayExp / 1000,
                    profit: (dayRev - dayExp) / 1000
                };
            });

            const todayRevenue = payData
                .filter((payment) => payment.transaction_date?.startsWith(todayStr))
                .reduce((sum, payment) => sum + Number(payment.amount), 0);

            const todayExpenses = expData
                .filter((expense) => expense.expense_date?.startsWith(todayStr))
                .reduce((sum, expense) => sum + Number(expense.amount), 0);

            const expenseCategories = expData.reduce((acc, expense) => {
                acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
                return acc;
            }, {});

            const expenseBreakdown = Object.entries(expenseCategories)
                .map(([category, amount]) => ({
                    category,
                    amount,
                    percent: totalExp > 0 ? (amount / totalExp) * 100 : 0,
                }))
                .sort((a, b) => b.amount - a.amount);

            const recentTransactions = [...payData]
                .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
                .slice(0, 6)
                .map((payment) => ({
                    id: payment.id,
                    memberName: payment.members?.full_name || 'Walk-in Member',
                    memberCode: payment.members?.member_code || 'N/A',
                    amount: Number(payment.amount),
                    paymentMethod: payment.payment_method,
                    transactionDate: payment.transaction_date,
                }));

            const nextStats = {
                revenue: totalRev,
                expenses: totalExp,
                netProfit: totalRev - totalExp,
                transactions: payData.length,
                mobileRevenue: payData.filter(p => p.payment_method === 'Mobile Money').reduce((sum, p) => sum + Number(p.amount), 0),
                cashRevenue: payData.filter(p => p.payment_method === 'Cash').reduce((sum, p) => sum + Number(p.amount), 0),
                todayRevenue,
                todayExpenses,
                monthlyData,
                dailyData,
                expenseCategories,
                expenseBreakdown,
                recentTransactions,
            };
            setStats(nextStats);
            financeCache = nextStats;
            financeCacheAt = Date.now();
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchFinance();
    }, [fetchFinance]);

    return { stats, loading, refresh: () => fetchFinance({ force: true }) };
}
