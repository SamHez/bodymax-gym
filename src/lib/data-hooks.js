import { useState, useEffect } from 'react';
import { apiFetch } from './api';

export function useMembers(branchId = null) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const query = branchId ? `?branch_id=${branchId}` : '';
        apiFetch(`/members${query}`)
            .then(data => setMembers(data))
            .catch(err => console.error('Fetch members error:', err))
            .finally(() => setLoading(false));
    }, [branchId]);

    const deleteMember = async (id) => {
        try {
            await apiFetch(`/members/${id}`, { method: 'DELETE' });
            setMembers(prev => prev.filter(m => m.id !== id));
            return true;
        } catch (err) {
            console.error('Delete member error:', err);
            return false;
        }
    };

    return { members, loading, deleteMember };
}

export function useAttendance(branchId = null) {
    const [todayCount, setTodayCount] = useState(0);
    const [checkedInIds, setCheckedInIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const query = branchId ? `?branch_id=${branchId}` : '';
        apiFetch(`/attendance/today${query}`)
            .then(data => {
                setCheckedInIds(data.checkedInIds);
                setTodayCount(data.count);
            })
            .catch(err => console.error('Fetch attendance error:', err))
            .finally(() => setLoading(false));
    }, [branchId]);

    const checkIn = async (memberId) => {
        try {
            await apiFetch('/attendance/checkin', {
                method: 'POST',
                body: JSON.stringify({ memberId }),
            });
            setTodayCount(prev => prev + 1);
            setCheckedInIds(prev => [...prev, memberId]);
            return true;
        } catch {
            return false;
        }
    };

    const removeCheckIn = async (memberId) => {
        try {
            await apiFetch(`/attendance/checkin/${memberId}`, { method: 'DELETE' });
            setTodayCount(prev => Math.max(0, prev - 1));
            setCheckedInIds(prev => prev.filter(id => id !== memberId));
            return true;
        } catch {
            return false;
        }
    };

    return { todayCount, checkedInIds, checkIn, removeCheckIn, loading };
}

export function useFinance(branchId = null) {
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, netProfit: 0, transactions: 0, monthlyData: [], dailyData: [], expenseCategories: [] });
    const [loading, setLoading] = useState(true);

    const refresh = () => {
        const query = branchId ? `?branch_id=${branchId}` : '';
        apiFetch(`/finance/stats${query}`)
            .then(data => setStats(data))
            .catch(err => console.error('Fetch finance error:', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        refresh();

        // Auto-sync every 30 seconds for real-time intelligence
        const interval = setInterval(refresh, 30000);
        return () => clearInterval(interval);
    }, [branchId]);

    return { stats, loading, refresh };
}
