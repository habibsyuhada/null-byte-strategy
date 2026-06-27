/**
 * Deep clone a value using structuredClone.
 * Supports objects, arrays, Set, Map, Date, RegExp, ArrayBuffer, and primitives.
 */
export function deepClone<T>(value: T): T {
  return structuredClone(value);
}
