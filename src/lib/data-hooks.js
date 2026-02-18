import { useState, useEffect } from 'react';
import { apiFetch } from './api';

export function useMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/members')
            .then(data => setMembers(data))
            .catch(err => console.error('Fetch members error:', err))
            .finally(() => setLoading(false));
    }, []);

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

export function useAttendance() {
    const [todayCount, setTodayCount] = useState(0);
    const [checkedInIds, setCheckedInIds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/attendance/today')
            .then(data => {
                setCheckedInIds(data.checkedInIds);
                setTodayCount(data.count);
            })
            .catch(err => console.error('Fetch attendance error:', err))
            .finally(() => setLoading(false));
    }, []);

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

export function useFinance() {
    const [stats, setStats] = useState({ revenue: 0, transactions: 0, breakdown: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/finance/stats')
            .then(data => setStats(data))
            .catch(err => console.error('Fetch finance error:', err))
            .finally(() => setLoading(false));
    }, []);

    return { stats, loading };
}
