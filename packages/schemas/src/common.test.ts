import { describe, it, expect } from 'vitest';
import { SchemaVersioned } from './common';

describe('SchemaVersioned', () => {
  it('should accept valid schema version', () => {
    const result = SchemaVersioned.safeParse({ schemaVersion: 1 });
    expect(result.success).toBe(true);
  });

  it('should reject missing schemaVersion', () => {
    const result = SchemaVersioned.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject non-number schemaVersion', () => {
    const result = SchemaVersioned.safeParse({ schemaVersion: '1' });
    expect(result.success).toBe(false);
  });
});
