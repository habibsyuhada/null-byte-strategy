import { describe, it, expect } from 'vitest';
import { SeededRNG } from './seeded-rng';
describe('SeededRNG', () => {
    it('should produce deterministic output for same seed', () => {
        const rng1 = new SeededRNG(42);
        const rng2 = new SeededRNG(42);
        for (let i = 0; i < 100; i++) {
            expect(rng1.next()).toBe(rng2.next());
        }
    });
    it('should produce different output for different seeds', () => {
        const rng1 = new SeededRNG(42);
        const rng2 = new SeededRNG(99);
        const results1 = Array.from({ length: 10 }, () => rng1.next());
        const results2 = Array.from({ length: 10 }, () => rng2.next());
        expect(results1).not.toEqual(results2);
    });
    it('nextInt should return integers in range', () => {
        const rng = new SeededRNG(42);
        for (let i = 0; i < 100; i++) {
            const val = rng.nextInt(1, 10);
            expect(val).toBeGreaterThanOrEqual(1);
            expect(val).toBeLessThanOrEqual(10);
            expect(Number.isInteger(val)).toBe(true);
        }
    });
    it('nextFloat should return floats in range', () => {
        const rng = new SeededRNG(42);
        for (let i = 0; i < 100; i++) {
            const val = rng.nextFloat(0, 1);
            expect(val).toBeGreaterThanOrEqual(0);
            expect(val).toBeLessThan(1);
        }
    });
    it('shuffle should return same order for same seed', () => {
        const rng1 = new SeededRNG(42);
        const rng2 = new SeededRNG(42);
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        expect(rng1.shuffle([...arr])).toEqual(rng2.shuffle([...arr]));
    });
    it('shuffle should produce different order for different seeds', () => {
        const rng1 = new SeededRNG(42);
        const rng2 = new SeededRNG(99);
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const shuffled1 = rng1.shuffle([...arr]);
        const shuffled2 = rng2.shuffle([...arr]);
        expect(shuffled1).not.toEqual(shuffled2);
    });
});
//# sourceMappingURL=seeded-rng.test.js.map