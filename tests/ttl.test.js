// path: tests/ttl.test.js
import { describe, it, expect } from 'vitest';
import { parseTTL } from '../src/utils/ttl.js';

describe('parseTTL helper', () => {
    it('recognises automatic', () => {
        expect(parseTTL('auto')).toBe(0);
        expect(parseTTL('automatic')).toBe(0);
    });

    it('converts minutes', () => {
        expect(parseTTL('1m')).toBe(60);
        expect(parseTTL('5m')).toBe(300);
        expect(parseTTL('30m')).toBe(1800);
    });

    it('handles explicit seconds', () => {
        expect(parseTTL(900)).toBe(900);
        expect(parseTTL('7200')).toBe(7200);
    });

    it('throws on bad input', () => {
        expect(() => parseTTL('bogus')).toThrow();
        expect(() => parseTTL('-50')).toThrow();
    });
});
