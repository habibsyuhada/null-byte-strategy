# Phase 1: Foundation & Monorepo Setup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the pnpm monorepo with TypeScript project references, ESLint, Prettier, Vitest, and CI — producing a buildable, testable foundation for all subsequent phases.

**Architecture:** pnpm workspace monorepo with `apps/` (mobile, api) and `packages/` (game-core, schemas, utils). TypeScript strict mode throughout. Each package compiles independently via project references. Shared tooling config at root.

**Tech Stack:** pnpm, TypeScript 5.x, Vitest, ESLint, Prettier, GitHub Actions

## Global Constraints

- TypeScript strict mode, ESNext target, moduleResolution bundler
- All packages use ESM (`"type": "module"`)
- All schemas carry `schemaVersion` field
- Mobile-first: all decisions must work on mobile
- Deterministic core: game-core has zero external dependencies
- Every package has at least one passing test

---

## Task 1: Root Configuration

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `tsconfig.base.json`
- Create: `.prettierrc`

**Interfaces:**
- Produces: Root `package.json` with shared devDeps, workspace config, `.gitignore` with standard patterns, base TypeScript config, Prettier config

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "null-byte-strategy",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\"",
    "typecheck": "tsc -b tsconfig.base.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "build": "pnpm -r run build",
    "clean": "pnpm -r run clean"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.4.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Create `.gitignore`**

```gitignore
# Dependencies
node_modules/

# Build output
dist/
*.tsbuildinfo

# Coverage
coverage/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Turbo
.turbo/

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Capacitor
android/app/build/
ios/App/Pods/
```

- [ ] **Step 4: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false
  },
  "exclude": ["node_modules", "dist", "coverage"]
}
```

- [ ] **Step 5: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

- [ ] **Step 6: Install dependencies**

Run: `pnpm install`
Expected: Lockfile created, all devDependencies installed

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-workspace.yaml .gitignore tsconfig.base.json .prettierrc pnpm-lock.yaml
git commit -m "chore: root monorepo configuration (pnpm, TypeScript, Prettier)"
```

---

## Task 2: ESLint Configuration

**Files:**
- Create: `.eslintrc.cjs`

**Interfaces:**
- Produces: Shared ESLint config for all TypeScript packages

- [ ] **Step 1: Create `.eslintrc.cjs`**

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/', '*.js', '*.cjs'],
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
```

- [ ] **Step 2: Verify lint runs without errors**

Run: `pnpm lint`
Expected: No errors (some warnings are OK)

- [ ] **Step 3: Commit**

```bash
git add .eslintrc.cjs
git commit -m "chore: add ESLint configuration"
```

---

## Task 3: Shared Utils Package

**Files:**
- Create: `packages/utils/package.json`
- Create: `packages/utils/tsconfig.json`
- Create: `packages/utils/src/index.ts`
- Create: `packages/utils/src/deep-clone.ts`
- Create: `packages/utils/src/deep-clone.test.ts`
- Create: `packages/utils/vitest.config.ts`

**Interfaces:**
- Consumes: `tsconfig.base.json` (extends)
- Produces:
  - `deepClone<T>(value: T): T` — safe deep clone using structuredClone

- [ ] **Step 1: Create `packages/utils/package.json`**

```json
{
  "name": "@null-byte-strategy/utils",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -b",
    "clean": "rm -rf dist *.tsbuildinfo",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Create `packages/utils/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts", "dist"]
}
```

- [ ] **Step 3: Create `packages/utils/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    globals: true,
  },
});
```

- [ ] **Step 4: Create `packages/utils/src/deep-clone.test.ts`**

```typescript
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
```

- [ ] **Step 5: Create `packages/utils/src/deep-clone.ts`**

```typescript
/**
 * Deep clone a value using structuredClone.
 * Supports objects, arrays, Set, Map, Date, RegExp, ArrayBuffer, and primitives.
 */
export function deepClone<T>(value: T): T {
  return structuredClone(value);
}
```

- [ ] **Step 6: Create `packages/utils/src/index.ts`**

```typescript
export { deepClone } from './deep-clone';
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd packages/utils && pnpm test`
Expected: 1 test suite, 4 tests PASS

- [ ] **Step 8: Verify build compiles**

Run: `cd packages/utils && pnpm build`
Expected: `dist/` directory created with `index.js`, `index.d.ts`, `deep-clone.js`, `deep-clone.d.ts`

- [ ] **Step 9: Commit**

```bash
git add packages/utils/
git commit -m "feat(utils): add shared utils package with deepClone"
```

---

## Task 4: Shared Schemas Package

**Files:**
- Create: `packages/schemas/package.json`
- Create: `packages/schemas/tsconfig.json`
- Create: `packages/schemas/vitest.config.ts`
- Create: `packages/schemas/src/index.ts`
- Create: `packages/schemas/src/common.ts`
- Create: `packages/schemas/src/common.test.ts`

**Interfaces:**
- Consumes: `tsconfig.base.json` (extends)
- Produces:
  - `SchemaVersion` — `z.object({ schemaVersion: z.number() })`
  - All schemas carry `schemaVersion` field

- [ ] **Step 1: Create `packages/schemas/package.json`**

```json
{
  "name": "@null-byte-strategy/schemas",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -b",
    "clean": "rm -rf dist *.tsbuildinfo",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "zod": "^3.24.0"
  }
}
```

- [ ] **Step 2: Create `packages/schemas/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts", "dist"]
}
```

- [ ] **Step 3: Create `packages/schemas/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    globals: true,
  },
});
```

- [ ] **Step 4: Create `packages/schemas/src/common.ts`**

```typescript
import { z } from 'zod';

/**
 * Base schema that all content schemas must extend.
 * Ensures every content object carries a schemaVersion for migration support.
 */
export const SchemaVersioned = z.object({
  schemaVersion: z.number(),
});

export type SchemaVersioned = z.infer<typeof SchemaVersioned>;
```

- [ ] **Step 5: Create `packages/schemas/src/common.test.ts`**

```typescript
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
```

- [ ] **Step 6: Create `packages/schemas/src/index.ts`**

```typescript
export { SchemaVersioned } from './common';
export type { SchemaVersioned as SchemaVersionedType } from './common';
```

- [ ] **Step 7: Install dependencies**

Run: `pnpm install`
Expected: zod installed in schemas package

- [ ] **Step 8: Run tests**

Run: `cd packages/schemas && pnpm test`
Expected: 1 test suite, 3 tests PASS

- [ ] **Step 9: Verify build**

Run: `cd packages/schemas && pnpm build`
Expected: `dist/` directory created

- [ ] **Step 10: Commit**

```bash
git add packages/schemas/
git commit -m "feat(schemas): add shared schemas package with SchemaVersioned base"
```

---

## Task 5: Game Core Package

**Files:**
- Create: `packages/game-core/package.json`
- Create: `packages/game-core/tsconfig.json`
- Create: `packages/game-core/vitest.config.ts`
- Create: `packages/game-core/src/index.ts`
- Create: `packages/game-core/src/utils/seeded-rng.ts`
- Create: `packages/game-core/src/utils/seeded-rng.test.ts`

**Interfaces:**
- Consumes: `tsconfig.base.json` (extends)
- Produces:
  - `SeededRNG` class with `next()`, `nextInt(min, max)`, `nextFloat(min, max)`, `shuffle<T>(array)`
  - Deterministic: same seed → same sequence

- [ ] **Step 1: Create `packages/game-core/package.json`**

```json
{
  "name": "@null-byte-strategy/game-core",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -b",
    "clean": "rm -rf dist *.tsbuildinfo",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Create `packages/game-core/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts", "dist"]
}
```

- [ ] **Step 3: Create `packages/game-core/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    globals: true,
  },
});
```

- [ ] **Step 4: Create `packages/game-core/src/utils/seeded-rng.test.ts`**

```typescript
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
    // Extremely unlikely to be equal with 10! permutations
    expect(shuffled1).not.toEqual(shuffled2);
  });
});
```

- [ ] **Step 5: Create `packages/game-core/src/utils/seeded-rng.ts`**

```typescript
/**
 * Deterministic pseudo-random number generator using mulberry32.
 * Same seed always produces the same sequence — required for replay and ranked integrity.
 */
export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  /** Returns a float in [0, 1) */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer in [min, max] (inclusive) */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Returns a float in [min, max) */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** Returns a new array with elements shuffled deterministically */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
```

- [ ] **Step 6: Create `packages/game-core/src/index.ts`**

```typescript
export { SeededRNG } from './utils/seeded-rng';
```

- [ ] **Step 7: Run tests**

Run: `cd packages/game-core && pnpm test`
Expected: 1 test suite, 6 tests PASS

- [ ] **Step 8: Verify build**

Run: `cd packages/game-core && pnpm build`
Expected: `dist/` directory created

- [ ] **Step 9: Commit**

```bash
git add packages/game-core/
git commit -m "feat(game-core): add game core package with deterministic SeededRNG"
```

---

## Task 6: Mobile App Stub

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/vitest.config.ts`
- Create: `apps/mobile/src/index.ts`
- Create: `apps/mobile/src/index.test.ts`

**Interfaces:**
- Consumes: `tsconfig.base.json` (extends), `@null-byte-strategy/game-core`, `@null-byte-strategy/schemas`, `@null-byte-strategy/utils`
- Produces: App entry point stub

- [ ] **Step 1: Create `apps/mobile/package.json`**

```json
{
  "name": "@null-byte-strategy/mobile",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc -b",
    "clean": "rm -rf dist *.tsbuildinfo",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@null-byte-strategy/game-core": "workspace:*",
    "@null-byte-strategy/schemas": "workspace:*",
    "@null-byte-strategy/utils": "workspace:*"
  }
}
```

- [ ] **Step 2: Create `apps/mobile/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts", "dist"],
  "references": [
    { "path": "../../packages/game-core" },
    { "path": "../../packages/schemas" },
    { "path": "../../packages/utils" }
  ]
}
```

- [ ] **Step 3: Create `apps/mobile/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    globals: true,
  },
});
```

- [ ] **Step 4: Create `apps/mobile/src/index.test.ts`**

```typescript
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
```

- [ ] **Step 5: Create `apps/mobile/src/index.ts`**

```typescript
export function getAppName(): string {
  return 'Null Byte Strategy';
}

export function getAppVersion(): string {
  return '0.0.1';
}
```

- [ ] **Step 6: Install dependencies**

Run: `pnpm install`
Expected: Workspace dependencies linked

- [ ] **Step 7: Run tests**

Run: `cd apps/mobile && pnpm test`
Expected: 1 test suite, 2 tests PASS

- [ ] **Step 8: Verify build**

Run: `cd apps/mobile && pnpm build`
Expected: `dist/` directory created

- [ ] **Step 9: Commit**

```bash
git add apps/mobile/
git commit -m "feat(mobile): add mobile app stub with workspace dependencies"
```

---

## Task 7: API Stub

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/src/index.ts`
- Create: `apps/api/src/index.test.ts`
- Create: `apps/api/Dockerfile`

**Interfaces:**
- Consumes: `tsconfig.base.json` (extends), `@null-byte-strategy/schemas`, `@null-byte-strategy/utils`
- Produces: API entry point stub, Dockerfile

- [ ] **Step 1: Create `apps/api/package.json`**

```json
{
  "name": "@null-byte-strategy/api",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc -b",
    "clean": "rm -rf dist *.tsbuildinfo",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@null-byte-strategy/schemas": "workspace:*",
    "@null-byte-strategy/utils": "workspace:*"
  }
}
```

- [ ] **Step 2: Create `apps/api/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts", "dist"],
  "references": [
    { "path": "../../packages/schemas" },
    { "path": "../../packages/utils" }
  ]
}
```

- [ ] **Step 3: Create `apps/api/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    globals: true,
  },
});
```

- [ ] **Step 4: Create `apps/api/src/index.test.ts`**

```typescript
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
```

- [ ] **Step 5: Create `apps/api/src/index.ts`**

```typescript
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
```

- [ ] **Step 6: Create `apps/api/Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/schemas/package.json packages/schemas/
COPY packages/utils/package.json packages/utils/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @null-byte-strategy/api build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/packages/schemas/dist ./packages/schemas/dist
COPY --from=builder /app/packages/utils/dist ./packages/utils/dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

- [ ] **Step 7: Run tests**

Run: `cd apps/api && pnpm test`
Expected: 1 test suite, 2 tests PASS

- [ ] **Step 8: Verify build**

Run: `cd apps/api && pnpm build`
Expected: `dist/` directory created

- [ ] **Step 9: Commit**

```bash
git add apps/api/
git commit -m "feat(api): add API stub with health endpoint and Dockerfile"
```

---

## Task 8: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: All packages' `test` and `build` scripts
- Produces: CI pipeline that runs on PR and push to main

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-typecheck-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format:check

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for lint, typecheck, test, build"
```

---

## Task 9: Root Integration Verification

**Files:**
- Modify: `tsconfig.base.json` (add references if missing)

**Interfaces:**
- Consumes: All packages' tsconfig.json files
- Produces: Working `pnpm typecheck` and `pnpm test` from root

- [ ] **Step 1: Update `tsconfig.base.json` with project references**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false
  },
  "references": [
    { "path": "packages/utils" },
    { "path": "packages/schemas" },
    { "path": "packages/game-core" },
    { "path": "apps/mobile" },
    { "path": "apps/api" }
  ],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

- [ ] **Step 2: Run full typecheck from root**

Run: `pnpm typecheck`
Expected: All packages compile without errors

- [ ] **Step 3: Run all tests from root**

Run: `pnpm test`
Expected: All test suites pass:
- `packages/utils` — 4 tests
- `packages/schemas` — 3 tests
- `packages/game-core` — 6 tests
- `apps/mobile` — 2 tests
- `apps/api` — 2 tests
- **Total: 17 tests PASS**

- [ ] **Step 4: Run lint from root**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 5: Run format check**

Run: `pnpm format:check`
Expected: All files formatted correctly

- [ ] **Step 6: Run full build from root**

Run: `pnpm build`
Expected: All packages build successfully, `dist/` directories created

- [ ] **Step 7: Commit**

```bash
git add tsconfig.base.json
git commit -m "chore: add project references for full monorepo typecheck"
```

---

## Verification Checklist

After completing all tasks, verify the entire monorepo works:

1. `pnpm install` — installs all dependencies
2. `pnpm lint` — no ESLint errors
3. `pnpm format:check` — all files formatted
4. `pnpm typecheck` — all TypeScript compiles
5. `pnpm test` — 17 tests pass across 5 packages
6. `pnpm build` — all packages produce `dist/` output
7. Git history has clean, logical commits

## Self-Review

1. **Spec coverage:** All Phase 1 deliverables covered — pnpm workspace ✅, TS project references ✅, ESLint ✅, Prettier ✅, Vitest ✅, CI ✅, .gitignore ✅
2. **Placeholder scan:** No TBD/TODO found. All code is complete.
3. **Type consistency:** `deepClone`, `SeededRNG`, `SchemaVersioned`, `getHealthStatus` — all names consistent across tasks.
