import toast from 'react-hot-toast';

/**
 * Promise-based confirm toast — replaces window.confirm()
 * Returns a promise that resolves to true/false.
 */
export function confirmToast(message) {
    return new Promise((resolve) => {
        toast(
            (t) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '280px' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', lineHeight: 1.5 }}>{message}</p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => { toast.dismiss(t.id); resolve(false); }}
                            style={{
                                padding: '6px 16px', borderRadius: '8px',
                                fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                background: 'transparent', border: '1px solid rgba(0,0,0,0.1)',
                                cursor: 'pointer', color: 'inherit',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { toast.dismiss(t.id); resolve(true); }}
                            style={{
                                padding: '6px 16px', borderRadius: '8px',
                                fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                background: '#E74C3C', border: 'none',
                                cursor: 'pointer', color: '#fff',
                            }}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            ),
            { duration: Infinity, position: 'top-center' }
        );
    });
}

export { toast };
