import { describe, it, expect } from 'vitest';
import { getApiName, getHealthStatus } from './index';

describe('api', () => {
  it('should return api name', () => {
    expect(getApiName()).toBe('Null Byte Strategy API');
  });

  it('should return health status', () => {
    const health = getHealthStatus();
    expect(health.status).toBe('ok');
    expect(health.version).toBe('0.0.1');
    expect(health.timestamp).toBeDefined();
  });
});
