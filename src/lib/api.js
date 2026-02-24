import { supabase } from './supabase';

// Set to true to test against local backend (python app.py)
const USE_LOCAL_BACKEND = false;

const BASE = USE_LOCAL_BACKEND
    ? 'http://localhost:5000/api'
    : 'https://bodymax-backend.onrender.com/api';

/**
 * Fetch wrapper that attaches the Supabase auth token.
 */
export async function apiFetch(endpoint, options = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
1
    const res = await fetch(`${BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `API ${res.status}`);
    }
    return res.json();
}

/**
 * Same as apiFetch but auto-generates an idempotency key.
 * Use for POST operations that must not duplicate (registration, daily pass).
 */
export function apiFetchIdempotent(endpoint, options = {}) {
    const key = crypto.randomUUID();
    return apiFetch(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            'X-Idempotency-Key': key,
        },
    });
}
