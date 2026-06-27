import { describe, it, expect } from 'vitest';
import { deepClone } from './deep-clone';

describe('deepClone', () => {
  it('should clone a plain object', () => {
    const original = { a: 1, b: { c: 2 } };
    const cloned = deepClone(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.b).not.toBe(original.b);
  });

  it('should clone arrays', () => {
    const original = [1, [2, 3], { a: 4 }];
    const cloned = deepClone(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });

  it('should handle primitives', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(null)).toBe(null);
  });

  it('should clone Set and Map', () => {
    const originalSet = new Set([1, 2, 3]);
    const clonedSet = deepClone(originalSet);
    expect(clonedSet).toEqual(originalSet);
    expect(clonedSet).not.toBe(originalSet);

    const originalMap = new Map([['a', 1], ['b', 2]]);
    const clonedMap = deepClone(originalMap);
    expect(clonedMap).toEqual(originalMap);
    expect(clonedMap).not.toBe(originalMap);
  });
});
