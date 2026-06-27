export function getApiName(): string {
  return 'Null Byte Strategy API';
}

export interface HealthStatus {
  status: 'ok' | 'error';
  version: string;
  timestamp: string;
}

export function getHealthStatus(): HealthStatus {
  return {
    status: 'ok',
    version: '0.0.1',
    timestamp: new Date().toISOString(),
  };
}