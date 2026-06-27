import { describe, it, expect } from 'vitest';
import { getAppName, getAppVersion } from './index';
describe('app', () => {
    it('should return app name', () => {
        expect(getAppName()).toBe('Null Byte Strategy');
    });
    it('should return app version', () => {
        expect(getAppVersion()).toBe('0.0.1');
    });
});
//# sourceMappingURL=index.test.js.map