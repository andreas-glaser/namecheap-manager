// path: src/utils/ttl.js
function parseTTL(val) {
    if (val === undefined || val === null) return 1800; // default 30 min
    const v = String(val).trim().toLowerCase();

    if (v === 'auto' || v === 'automatic') return 0;    // Namecheap “Automatic”

    const m = v.match(/^(\d+)m$/);                      // “5m”, “30m”, …
    if (m) return Number(m[1]) * 60;

    const n = Number(v);                                // raw seconds
    if (!Number.isNaN(n) && n > 0) return n;

    throw new Error(
        `Invalid TTL "${val}". Use: auto | 1m | 5m | 20m | 30m | 60m | <seconds>`
    );
}

module.exports = { parseTTL };