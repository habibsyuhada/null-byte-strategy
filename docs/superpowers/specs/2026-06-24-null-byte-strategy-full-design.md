# Null Byte Strategy — Full Phased Implementation Design

## Overview

Spec ini mendefinisikan full implementation plan untuk **Null Byte Strategy**, sebuah mobile-first production game berbasis investigasi graph/network. Game ini dibangun dengan **TypeScript end-to-end**, di-deploy ke **Android dan iOS melalui Capacitor**, dengan backend **NestJS + PostgreSQL + Redis**.

Semua sistem inti yang didokumentasikan di AGENTS.md, ARCHITECTURE.md, TECH-STACK.md, dan FOLDER-STRUCTURE.md dicakup dalam 20 phase yang bisa di-eksekusi secara berurutan. Setiap phase menghasilkan deliverable yang fungsional dan bisa di-test.

---

## Architecture Summary

- **Monorepo** — pnpm workspace dengan apps/ dan packages/
- **Client** — React 18 + TypeScript + Vite + Capacitor + Tailwind CSS + Zustand + TanStack Query
- **Game Core** — Pure TypeScript, zero external deps, deterministic simulation
- **Backend** — NestJS + TypeScript + PostgreSQL + Redis + BullMQ
- **Shared** — Zod schemas (content, DTOs, telemetry)
- **Testing** — Vitest + Testing Library + Playwright
- **Observability** — Sentry + PostHog + structured logging
- **CI/CD** — GitHub Actions + Docker + Fastlane + Terraform

### Dependency Direction

```
apps/mobile  →  packages/game-core  →  packages/schemas
             →  packages/schemas
             →  packages/utils

apps/api     →  packages/schemas
             →  packages/utils
```

`game-core` tidak bergantung ke DOM, React, plugin native, atau network calls.

---

## Phase 1 — Foundation & Monorepo Setup

**Tujuan:** Monorepo structure, build tooling, shared configs yang jadi fondasi semua phase berikutnya.

### Directory Structure

```
null-byte-strategy/
├── apps/
│   ├── mobile/                # React + Vite + Capacitor client
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── capacitor.config.ts
│   └── api/                   # NestJS backend
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       └── Dockerfile
├── packages/
│   ├── game-core/             # Pure TS simulation engine
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── schemas/               # Zod schemas
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── utils/                 # Shared utilities
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── package.json               # Root with shared devDeps
└── docs/                      # (exists)
```

### Deliverables

- pnpm workspace config (`pnpm-workspace.yaml`)
- TypeScript project references (`tsconfig.base.json` + per-package tsconfig)
- ESLint + Prettier shared config
- Root `package.json` with shared devDeps (typescript, vitest, eslint, prettier)
- Vitest setup per package with basic passing test
- GitHub Actions CI stub (lint → typecheck → test)
- Each package with `package.json`, `tsconfig.json`, `src/index.ts`, basic test file
- `.gitignore` covering node_modules, dist, .turbo, coverage, .env, IDE files

### Tech Details

- `tsconfig.base.json`: strict mode, ESNext target, moduleResolution bundler
- Per-package tsconfig extends base, adds project references
- Vitest: `vitest.config.ts` per package, `*.test.ts` co-located with source
- ESLint: @typescript-eslint, import ordering, no-unused-vars
- Prettier: singleQuote, trailingComma, printWidth 100

---

## Phase 2 — Game Core: Simulation Engine

**Tujuan:** Deterministic gameplay simulation layer yang bisa jalan tanpa UI, tanpa DOM, tanpa framework.

### Directory Structure

```
packages/game-core/src/
├── entities/
│   ├── node.ts
│   ├── link.ts
│   ├── evidence.ts
│   ├── trap.ts
│   ├── objective.ts
│   ├── operator.ts
│   ├── modifier.ts
│   └── reward.ts
├── state/
│   ├── run-state.ts
│   ├── trace-state.ts
│   ├── session-flags.ts
│   └── score-breakdown.ts
├── rules/
│   ├── access-evaluator.ts
│   ├── trigger-resolver.ts
│   ├── reward-calculator.ts
│   └── fail-condition-checker.ts
├── systems/
│   ├── traversal-system.ts
│   ├── evidence-system.ts
│   ├── trap-system.ts
│   ├── trace-system.ts
│   ├── objective-system.ts
│   └── scoring-system.ts
├── orchestrators/
│   ├── action-executor.ts
│   └── run-initializer.ts
├── utils/
│   ├── seeded-rng.ts
│   ├── deep-clone.ts
│   └── event-emitter.ts
├── serializers/
│   ├── run-state-serializer.ts
│   └── replay-delta-serializer.ts
└── index.ts
```

### Entity Types

#### Node
```typescript
interface Node {
  id: string;
  type: 'normal' | 'evidence' | 'trap' | 'gate' | 'objective' | 'entry' | 'exit';
  label: string;
  position: { x: number; y: number };
  accessRules: AccessRule[];
  evidenceSlots: EvidenceSlot[];
  trapConfig: TrapConfig | null;
  discovered: boolean;
}
```

#### Link
```typescript
interface Link {
  id: string;
  from: string; // node id
  to: string;   // node id
  traversalRules: TraversalRule[];
  cost: number;
  hidden: boolean;
  bidirectional: boolean;
}
```

#### AccessRule
```typescript
interface AccessRule {
  type: 'evidence_required' | 'trace_threshold' | 'item_required' | 'always' | 'never';
  value: string | number;
  negated: boolean;
}
```

#### Evidence
```typescript
interface Evidence {
  id: string;
  type: 'document' | 'keycard' | 'password' | 'device' | 'testimony';
  locationNodeId: string;
  discoveryConditions: DiscoveryCondition[];
  value: number;
  description: string;
  collected: boolean;
}
```

#### Trap
```typescript
interface Trap {
  id: string;
  nodeId: string;
  triggerCondition: TriggerCondition;
  effect: TrapEffect;
  counterplay: CounterplayOption | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggered: boolean;
  disarmed: boolean;
}
```

#### TrapEffect
```typescript
interface TrapEffect {
  type: 'trace_increase' | 'damage' | 'teleport' | 'lock_node' | 'alert' | 'evidence_destroy';
  amount: number;
  targetRef: string | null;
}
```

#### Objective
```typescript
interface Objective {
  id: string;
  type: 'reach_node' | 'collect_evidence' | 'survive_time' | 'avoid_detection' | 'disarm_trap';
  targetRef: string;
  completionCondition: CompletionCondition;
  optional: boolean;
  completed: boolean;
}
```

### State Model

#### RunState
```typescript
interface RunState {
  runId: string;
  stageId: string;
  contentVersion: string;
  engineVersion: string;
  seed: number;
  currentNodeId: string;
  discoveredNodes: Set<string>;
  traversedLinks: Set<string>;
  collectedEvidence: Map<string, Evidence>;
  triggeredTraps: Map<string, Trap>;
  objectives: Map<string, Objective>;
  traceState: TraceState;
  sessionFlags: SessionFlags;
  scoreBreakdown: ScoreBreakdown;
  history: ActionRecord[];
  turnCount: number;
  startTime: number;
  status: 'active' | 'completed' | 'failed' | 'abandoned';
}
```

#### TraceState
```typescript
interface TraceState {
  level: number;        // 0-100
  tier: 'undetected' | 'suspicious' | 'alert' | 'compromised' | 'critical';
  decayRate: number;
  thresholds: { suspicious: number; alert: number; compromised: number; critical: number };
}
```

#### SessionFlags
```typescript
interface SessionFlags {
  stealthMode: boolean;
  detected: boolean;
  compromised: boolean;
  exitReached: boolean;
  allObjectivesComplete: boolean;
}
```

#### ScoreBreakdown
```typescript
interface ScoreBreakdown {
  base: number;
  objectives: number;
  evidence: number;
  trace: number;      // penalty for high trace
  time: number;       // bonus for speed
  traps: number;      // penalty for triggered traps
  bonus: number;      // stealth bonus, perfect run bonus
  total: number;
}
```

### Rules Engine

#### AccessEvaluator
- `evaluateAccess(node, runState): AccessResult`
- Checks all access rules against current state
- Returns: `{ allowed: boolean; reason: string; missingRequirements: string[] }`

#### TriggerResolver
- `evaluateTriggers(node, runState): TrapTriggerResult`
- Checks trap trigger conditions
- Returns: `{ triggered: boolean; trap: Trap; autoDisarmed: boolean }`

#### RewardCalculator
- `calculateRewards(runState, stageDefinition): Reward[]`
- Computes rewards based on objectives completed, evidence collected, score

#### FailConditionChecker
- `checkFailConditions(runState, stageDefinition): FailResult`
- Checks: all objectives failed, trace critical too long, no valid moves remaining

### Systems

Each system is a pure function: `(runState, context) → { newState, events[] }`

- **TraversalSystem** — evaluate and execute node/link movement
- **EvidenceSystem** — discover, collect, use evidence
- **TrapSystem** — trigger, resolve, counter traps
- **TraceSystem** — accumulate, decay, escalate trace; alert tier transitions
- **ObjectiveSystem** — track and complete objectives
- **ScoringSystem** — compute score from all sources

### Orchestrators

#### ActionExecutor
```typescript
type ActionType = 'move' | 'collect_evidence' | 'use_item' | 'scan' | 'disarm_trap' | 'wait';

interface ActionIntent {
  type: ActionType;
  targetRef: string | null;
  payload: Record<string, unknown> | null;
}

function executeAction(runState: RunState, action: ActionIntent): {
  newState: RunState;
  events: GameplayEvent[];
  feedback: UIFeedbackHint[];
}
```

#### RunInitializer
```typescript
function createRunState(stageContent: StageDefinition, seed: number): RunState
```

### Utilities

#### SeededRNG
```typescript
class SeededRNG {
  constructor(seed: number);
  next(): number;           // 0-1 float
  nextInt(min: number, max: number): number;
  nextFloat(min: number, max: number): number;
  shuffle<T>(array: T[]): T[];
}
```

#### DeepClone
- Structured clone wrapper for RunState snapshots

#### EventEmitter
- Typed event emitter for gameplay events (node_traversed, evidence_collected, trap_triggered, trace_changed, objective_completed, run_ended)

### Serializers

#### RunStateSerializer
- `serialize(state): string` — checkpoint save
- `deserialize(data): RunState` — checkpoint restore
- Version-aware: rejects incompatible versions

#### ReplayDeltaSerializer
- `captureDelta(prevState, newState, action): ReplayDelta`
- `serializeDeltas(deltas[]): ReplayPayload`

### Tests

- Unit tests for every rule evaluator, every system
- Determinism tests: same input + seed → same output (run 100 times)
- Integration tests: full run simulation from start to completion
- Edge case tests: dead-end nodes, all traps triggered, zero evidence available
- Serialization round-trip tests

---

## Phase 3 — Shared Schemas & Content Contracts

**Tujuan:** Schema-driven content system yang bisa divalidasi dan dipakai lintas client/backend/tooling.

### Directory Structure

```
packages/schemas/src/
├── content/
│   ├── stage-definition.ts
│   ├── node-definition.ts
│   ├── link-definition.ts
│   ├── access-rule.ts
│   ├── evidence-definition.ts
│   ├── trap-definition.ts
│   ├── objective-definition.ts
│   ├── mini-game-config.ts
│   ├── reward-table.ts
│   ├── modifier-definition.ts
│   └── seasonal-config.ts
├── api/
│   ├── auth.ts
│   ├── profile.ts
│   ├── inventory.ts
│   ├── content.ts
│   ├── run.ts
│   ├── leaderboard.ts
│   ├── replay.ts
│   ├── social.ts
│   └── liveops.ts
├── telemetry/
│   ├── session-events.ts
│   ├── gameplay-events.ts
│   ├── economy-events.ts
│   ├── social-events.ts
│   └── error-events.ts
├── validation/
│   ├── stage-validator.ts
│   ├── solvability-checker.ts
│   ├── fairness-checker.ts
│   └── difficulty-scorer.ts
└── index.ts
```

### Content Schemas (Zod)

All schemas carry `schemaVersion: z.number()` field.

#### StageDefinition
```typescript
const StageDefinitionSchema = z.object({
  schemaVersion: z.number(),
  id: z.string(),
  name: z.string(),
  description: z.string(),
  difficulty: z.enum(['tutorial', 'easy', 'medium', 'hard', 'expert']),
  contentVersion: z.string(),
  graph: z.object({
    nodes: z.array(NodeDefinitionSchema),
    links: z.array(LinkDefinitionSchema),
    entryNodeId: z.string(),
    exitNodeId: z.string(),
  }),
  objectives: z.array(ObjectiveDefinitionSchema),
  rewards: RewardTableSchema,
  modifiers: z.array(ModifierDefinitionSchema),
  metadata: z.object({
    author: z.string(),
    created_at: z.string(),
    tags: z.array(z.string()),
    estimatedDuration: z.number(),
    rankedEligible: z.boolean(),
  }),
});
```

#### NodeDefinition
```typescript
const NodeDefinitionSchema = z.object({
  id: z.string(),
  type: z.enum(['normal', 'evidence', 'trap', 'gate', 'objective', 'entry', 'exit']),
  label: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  accessRules: z.array(AccessRuleSchema),
  evidenceSlots: z.array(EvidenceSlotSchema),
  trapConfig: TrapConfigSchema.nullable(),
  visualHints: z.object({
    icon: z.string().optional(),
    color: z.string().optional(),
    hidden: z.boolean().optional(),
  }).optional(),
});
```

#### AccessRule
```typescript
const AccessRuleSchema = z.object({
  type: z.enum(['evidence_required', 'trace_threshold', 'item_required', 'always', 'never']),
  value: z.union([z.string(), z.number()]),
  negated: z.boolean().default(false),
});
```

#### EvidenceDefinition
```typescript
const EvidenceDefinitionSchema = z.object({
  id: z.string(),
  type: z.enum(['document', 'keycard', 'password', 'device', 'testimony']),
  locationNodeId: z.string(),
  discoveryConditions: z.array(DiscoveryConditionSchema),
  value: z.number(),
  description: z.string(),
});
```

#### TrapDefinition
```typescript
const TrapDefinitionSchema = z.object({
  id: z.string(),
  nodeId: z.string(),
  triggerCondition: TriggerConditionSchema,
  effect: TrapEffectSchema,
  counterplay: CounterplaySchema.nullable(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  hint: z.string().optional(),
});
```

#### ObjectiveDefinition
```typescript
const ObjectiveDefinitionSchema = z.object({
  id: z.string(),
  type: z.enum(['reach_node', 'collect_evidence', 'survive_time', 'avoid_detection', 'disarm_trap']),
  targetRef: z.string(),
  completionCondition: CompletionConditionSchema,
  optional: z.boolean().default(false),
});
```

#### RewardTable
```typescript
const RewardTableSchema = z.object({
  baseRewards: z.array(RewardEntrySchema),
  bonusRewards: z.array(BonusRewardEntrySchema),
});

const RewardEntrySchema = z.object({
  type: z.enum(['xp', 'currency_soft', 'currency_hard', 'item', 'badge']),
  amount: z.number(),
  conditions: z.array(z.string()).optional(),
});

const BonusRewardEntrySchema = z.object({
  ...RewardEntrySchema.shape,
  condition: z.string(),
  bonusMultiplier: z.number(),
});
```

### API/DTO Schemas (Zod)

#### Auth
```typescript
const LoginRequestSchema = z.object({
  deviceId: z.string(),
  platform: z.enum(['android', 'ios', 'web']),
  appVersion: z.string(),
});

const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  accountId: z.string(),
  isNewAccount: z.boolean(),
});
```

#### Run Submission
```typescript
const RunSubmitRequestSchema = z.object({
  runId: z.string(),
  stageId: z.string(),
  contentVersion: z.string(),
  engineVersion: z.string(),
  score: z.number(),
  scoreBreakdown: ScoreBreakdownSchema,
  actions: z.array(ActionRecordSchema),
  proofMetadata: z.object({
    seed: z.number(),
    turnCount: z.number(),
    duration: z.number(),
    checksum: z.string(),
  }),
  idempotencyKey: z.string(),
});
```

### Telemetry Schemas (Zod)

All telemetry schemas carry `eventVersion: z.string()` field.

```typescript
const TelemetryEventBase = z.object({
  eventVersion: z.string(),
  timestamp: z.string().datetime(),
  sessionId: z.string(),
  accountId: z.string().optional(),
  appVersion: z.string(),
  platform: z.enum(['android', 'ios', 'web']),
});

const RunStartEventSchema = TelemetryEventBase.extend({
  eventType: z.literal('run_start'),
  stageId: z.string(),
  contentVersion: z.string(),
  mode: z.enum(['campaign', 'contract', 'ranked', 'custom']),
});

const NodeTraversalEventSchema = TelemetryEventBase.extend({
  eventType: z.literal('node_traverse'),
  runId: z.string(),
  fromNodeId: z.string(),
  toNodeId: z.string(),
  turnNumber: z.number(),
});
```

### Validation Pipeline

#### StageValidator
- Schema compliance (parse with Zod)
- Structural integrity: all node references in links exist, all evidence node refs exist, all trap node refs exist
- Entry/exit nodes exist
- No orphan nodes (unreachable from entry)

#### SolvabilityChecker
- BFS/DFS from entry to exit (ignoring access rules)
- BFS/DFS from entry to all objective target nodes
- All required evidence discoverable
- All required objectives achievable

#### FairnessChecker
- Stage winnable without premium items
- Every trap has counterplay or avoidance path
- Evidence discovery conditions satisfiable
- No unavoidable critical trace escalation

#### DifficultyScorer
- Graph complexity (nodes, links, branching factor)
- Trap count and severity
- Trace pressure (decay rate vs accumulation rate)
- Objective difficulty (number, conditions)
- Returns score 0-100

### Tests

- Schema parse success/fail tests for each schema
- Solvability checker: solvable stage → pass, unsolvable → fail with reason
- Fairness checker: fair stage → pass, unfair → fail with reason
- Difficulty scorer: tutorial < easy < medium < hard < expert
- Content package validation: valid pack → pass, invalid refs → fail

---

## Phase 4 — Client App Shell & Platform Layer

**Tujuan:** Mobile-first app shell dengan routing, platform abstraction, dan design system.

### Directory Structure

```
apps/mobile/src/
├── main.tsx
├── App.tsx
├── routes/
│   ├── index.tsx
│   └── route-definitions.ts
├── design/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   ├── elevation.ts
│   │   └── motion.ts
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Panel.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Tag.tsx
│   │   ├── StateIndicator.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── TraceBar.tsx
│   │   ├── AlertTierDisplay.tsx
│   │   ├── Typography.tsx
│   │   ├── Icon.tsx
│   │   └── TouchTarget.tsx
│   └── tailwind.config.ts
├── platform/
│   ├── types.ts
│   ├── AppLifecycleAdapter.ts
│   ├── NetworkStatusAdapter.ts
│   ├── HapticsAdapter.ts
│   ├── DeviceInfoAdapter.ts
│   ├── SecureStorageAdapter.ts
│   └── PreferencesAdapter.ts
├── layouts/
│   ├── AppShell.tsx
│   └── GameLayout.tsx
├── stores/
│   ├── useAppStore.ts
│   ├── useNavigationStore.ts
│   └── useSessionStore.ts
├── hooks/
│   ├── usePlatform.ts
│   └── useLifecycle.ts
├── screens/
│   ├── HomeScreen.tsx
│   └── PlaceholderScreen.tsx
└── assets/
    └── icons/
```

### Design Tokens

#### Colors (Tailwind)
```typescript
const colors = {
  // Gameplay states
  trace: {
    low: '#22c55e',      // green-500
    mid: '#eab308',      // yellow-500
    high: '#f97316',     // orange-500
    critical: '#ef4444', // red-500
  },
  alert: {
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
  },
  trap: {
    danger: '#dc2626',
    warning: '#f59e0b',
    safe: '#16a34a',
  },
  state: {
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#3b82f6',
    error: '#ef4444',
    locked: '#6b7280',
    hidden: '#374151',
    corrupted: '#7c3aed',
  },
  // UI roles
  ui: {
    background: '#0f172a',
    surface: '#1e293b',
    surfaceElevated: '#334155',
    border: '#475569',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
  },
};
```

#### Spacing Scale
4px base: 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px, 10=40px, 12=48px, 16=64px

#### Typography Scale
```typescript
const typography = {
  xs: { fontSize: '12px', lineHeight: '16px' },
  sm: { fontSize: '14px', lineHeight: '20px' },
  base: { fontSize: '16px', lineHeight: '24px' },
  lg: { fontSize: '18px', lineHeight: '28px' },
  xl: { fontSize: '20px', lineHeight: '28px' },
  '2xl': { fontSize: '24px', lineHeight: '32px' },
  '3xl': { fontSize: '30px', lineHeight: '36px' },
};
```

### Platform Adapters

Each adapter: interface + web fallback + Capacitor implementation stub.

```typescript
interface AppLifecycleAdapter {
  onPause(callback: () => void): void;
  onResume(callback: () => void): void;
  onMemoryWarning(callback: () => void): void;
}

interface NetworkStatusAdapter {
  isOnline(): boolean;
  onStatusChange(callback: (online: boolean) => void): void;
}

interface HapticsAdapter {
  light(): void;
  medium(): void;
  heavy(): void;
  success(): void;
  warning(): void;
  error(): void;
}

interface DeviceInfoAdapter {
  getPlatform(): 'android' | 'ios' | 'web';
  getScreenSize(): { width: number; height: number };
  getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number };
}

interface SecureStorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

interface PreferencesAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}
```

### Layout

#### AppShell
- Header bar (back button, title, action buttons)
- Content area (scrollable, safe-area aware)
- Bottom navigation bar (Home, Campaign, Inventory, Social, Settings)
- Keyboard avoidance

#### GameLayout
- HUD frame overlay (top: trace + alert; bottom: actions + objectives)
- Content area for graph view
- Modal overlay for mini-games, node details

### Zustand Stores

#### useAppStore
```typescript
interface AppState {
  theme: 'dark' | 'light';
  language: string;
  reducedMotion: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (lang: string) => void;
  setReducedMotion: (enabled: boolean) => void;
  setColorblindMode: (mode: string) => void;
}
```

### Route Definitions

```typescript
const routes = [
  { path: '/', element: <HomeScreen /> },
  { path: '/campaign', element: <PlaceholderScreen name="Campaign" /> },
  { path: '/contracts', element: <PlaceholderScreen name="Contracts" /> },
  { path: '/inventory', element: <PlaceholderScreen name="Inventory" /> },
  { path: '/profile', element: <PlaceholderScreen name="Profile" /> },
  { path: '/settings', element: <PlaceholderScreen name="Settings" /> },
  { path: '/mission/:id', element: <PlaceholderScreen name="Mission" /> },
  { path: '/replay/:id', element: <PlaceholderScreen name="Replay" /> },
  { path: '/social', element: <PlaceholderScreen name="Social" /> },
  { path: '/store', element: <PlaceholderScreen name="Store" /> },
];
```

### Tests

- Component render tests (Testing Library) for all base components
- Platform adapter mock tests (web fallback behavior)
- Layout snapshot tests
- Zustand store unit tests
- Route navigation tests

---

## Phase 5 — Content System & Stage Loading

**Tujuan:** Schema-driven content loading, caching, validation pipeline.

### Directory Structure

```
apps/mobile/src/content/
├── ContentCatalogService.ts
├── StagePackageLoader.ts
├── ContentCache.ts
├── ContentValidator.ts
└── ContentVersionPin.ts

packages/game-core/src/content/
├── samples/
│   ├── tutorial-stage.json
│   ├── easy-stage.json
│   └── medium-stage.json
└── index.ts
```

### Content Services

#### ContentCatalogService
- Fetch catalog from API (or cache)
- List available stages with metadata (name, difficulty, stars, locked status)
- TanStack Query integration: `useCatalog()`

#### StagePackageLoader
- Fetch full stage package by ID + version
- Validate against schema before returning
- TanStack Query integration: `useStagePackage(id)`

#### ContentCache (IndexedDB)
- Cache catalog and stage packages
- LRU eviction when storage full
- Version-aware: stale cache entries marked for refresh
- Offline browse support

#### ContentValidator (runtime)
- Validate stage package against Zod schemas before run starts
- Reject invalid content with clear error messages
- Check contentVersion compatibility with engine

#### ContentVersionPin
- Pin content to specific version for entire run duration
- Prevent mid-run content changes

### Sample Stages

#### Tutorial Stage
- Linear graph: Entry → A → B → C → Exit
- 1 evidence to collect (required)
- 0 traps
- Simple access rules (none/always)
- Objective: reach exit

#### Easy Stage
- Branching graph: Entry → {A, B} → {C, D} → Exit
- 2 evidence slots, 1 required for gate
- 1 trap (low severity, has counterplay)
- 2 objectives: collect evidence + reach exit

#### Medium Stage
- Looping graph: 8-10 nodes, multiple paths
- 3 evidence slots, 2 required
- 2 traps (medium severity)
- Gate node requiring evidence + trace threshold
- 3 objectives: collect evidence, disarm trap, reach exit

### Tests

- ContentCatalogService: fetch → cache → refresh cycle test
- StagePackageLoader: fetch → validate → return test
- ContentCache: set → get → evict → offline read test
- ContentValidator: valid stage → pass, invalid → reject with reasons
- Sample stages: all pass validation + solvability + fairness checks

---

## Phase 6 — Mission Flow (End-to-End Gameplay)

**Tujuan:** Satu mission yang bisa dimainkan dari awal sampai akhir.

### Directory Structure

```
apps/mobile/src/mission/
├── MissionController.ts
├── RunSessionManager.ts
├── ActionDispatcher.ts
└── useRunState.ts

apps/mobile/src/screens/mission/
├── MissionScreen.tsx
├── RunStartScreen.tsx
├── RunCompleteScreen.tsx
├── RunFailScreen.tsx
├── GraphView.tsx
├── NodeDetailPanel.tsx
├── ActionPanel.tsx
├── HUD.tsx
├── ObjectivePanel.tsx
├── EvidenceInventory.tsx
└── MiniGameOverlay.tsx
```

### Mission Orchestration

#### MissionController
- Coordinate run lifecycle: init → play → complete/fail → report
- Wire simulation core to UI via hooks
- Handle checkpoint on safe moments

#### RunSessionManager
- Create RunState from stage content + seed
- Checkpoint save (after each action resolution)
- Checkpoint restore (on app resume)
- Abandon run (with confirmation)

#### ActionDispatcher
- UI intent → ActionIntent → ActionExecutor → new state → UI update
- Queue actions if simulation busy
- Debounce rapid inputs

### Gameplay UI

#### GraphView
- SVG-based node-link graph rendering
- Nodes: circles with type-colored borders and icons
- Links: lines/arrows with traversal state styling
- Current node: pulsing highlight
- Discovered vs undiscovered: solid vs ghosted
- Fog of war: undiscovered nodes shown as dim outlines
- Touch node → select → show NodeDetailPanel
- Pan (drag) and zoom (pinch) gestures
- Auto-center on current node after move
- Animated transitions for node traversal

#### NodeDetailPanel
- Slide-up panel when node selected
- Shows: node name, type, access requirements, evidence available, trap warnings
- Action buttons: Move Here (if adjacent and legal), Scan, Use Item
- Locked node: show missing requirements

#### ActionPanel
- Bottom action bar with available actions
- Actions: Move, Collect Evidence, Disarm Trap, Scan, Wait
- Disabled state with reason tooltip for unavailable actions

#### HUD
- Top-left: Trace bar (fill + tier label)
- Top-right: Alert tier indicator (icon + color)
- Top-center: Turn counter
- Bottom-left: Collected evidence count
- Bottom-right: Score (running)
- Center-top: Active objective reminder

#### ObjectivePanel
- Collapsible side panel
- List of objectives with progress indicators
- Required vs optional distinction
- Completed objectives: checkmark + strikethrough

#### EvidenceInventory
- Quick-view bar of collected evidence icons
- Tap to expand detail

### Run Flow Screens

#### RunStartScreen
- Stage name and description
- Objectives preview
- Difficulty indicator
- Loadout placeholder (future)
- Start button → creates RunState → transitions to MissionScreen

#### RunCompleteScreen
- Score breakdown (base + objectives + evidence + trace + time + traps + bonus)
- Stars earned (1-3)
- Rewards earned
- XP gained
- Buttons: Next Stage, Retry, Back to Campaign

#### RunFailScreen
- Failure reason (detected, all objectives failed, etc.)
- Score (partial)
- Buttons: Retry, Back to Campaign

### Simulation ↔ UI Integration

#### useRunState hook
```typescript
function useRunState() {
  return {
    state: RunState;           // current state
    dispatch: (action: ActionIntent) => void;
    canDispatch: boolean;      // simulation ready
    lastEvents: GameplayEvent[];
    lastFeedback: UIFeedbackHint[];
  };
}
```

#### GameplayEvent → Visual Feedback Mapping
- `node_traversed` → animate link traversal, move current node indicator
- `evidence_collected` → evidence icon pop, add to inventory, haptic success
- `trap_triggered` → screen shake, danger flash, haptic error
- `trace_changed` → animate trace bar, color transition
- `alert_tier_changed` → alert indicator flash, screen tint, haptic warning
- `objective_completed` → checkmark animation, progress update
- `run_completed` → success fanfare, transition to RunCompleteScreen
- `run_failed` → failure animation, transition to RunFailScreen

### Checkpoint & Resume

- Auto-checkpoint after each action resolution (serialize RunState to IndexedDB)
- On app resume: check for checkpoint → prompt "Resume run?" → restore or discard
- On cold start: same check
- Checkpoint expires after 24 hours or on stage content version change

### Tests

- Full mission integration test: create run → traverse → collect evidence → trigger trap → complete objectives → score
- Checkpoint/restore cycle: play 5 turns → checkpoint → restore → verify identical state
- UI interaction tests: node selection → detail panel shown, action dispatch → state update
- GraphView render tests: nodes and links positioned correctly
- HUD state reflection tests

---

## Phase 7 — Backend: Auth, Profile & Content API

**Tujuan:** Server-side foundation untuk identity, profile, dan content delivery.

### Directory Structure

```
apps/api/src/
├── main.ts
├── app.module.ts
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── decorators/
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   └── guards/
│   ├── profile/
│   │   ├── profile.module.ts
│   │   ├── profile.controller.ts
│   │   └── profile.service.ts
│   ├── content/
│   │   ├── content.module.ts
│   │   ├── content.controller.ts
│   │   └── content.service.ts
│   └── health/
│       ├── health.module.ts
│       └── health.controller.ts
├── database/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── prisma.service.ts
└── config/
    └── configuration.ts
```

### Database Schema (Prisma)

```prisma
model Account {
  id            String    @id @default(uuid())
  deviceId      String    @unique
  linkedPlatform String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  profile       Profile?
  progression   Progression[]
}

model Session {
  id          String    @id @default(uuid())
  accountId   String
  account     Account   @relation(fields: [accountId], references: [id])
  tokenHash   String    @unique
  deviceInfo  Json
  expiresAt   DateTime
  revokedAt   DateTime?
  createdAt   DateTime  @default(now())
}

model Profile {
  id          String  @id @default(uuid())
  accountId   String  @unique
  account     Account @relation(fields: [accountId], references: [id])
  displayName String
  level       Int     @default(1)
  xp          Int     @default(0)
  settingsJson Json   @default("{}")
}

model Progression {
  id              String  @id @default(uuid())
  accountId       String
  account         Account @relation(fields: [accountId], references: [id])
  stageId         String
  stars           Int     @default(0)
  bestScore       Int     @default(0)
  completionCount Int     @default(0)
  @@unique([accountId, stageId])
}

model ContentManifest {
  id           String   @id @default(uuid())
  version      String   @unique
  contentHash  String
  publishedAt  DateTime @default(now())
  status       String   @default("active")
  payloadJson  Json
}
```

### Auth Flow

1. Client sends `deviceId` + `platform` → `POST /auth/login`
2. Server: find or create Account → generate JWT (15min) + refresh token (30 days) → store session → return tokens
3. Client stores refresh token in secure storage, access token in memory
4. On access token expiry: `POST /auth/refresh` with refresh token → rotate → new pair
5. On logout: `POST /auth/logout` → revoke session

### API Endpoints

#### Auth
- `POST /auth/login` — device login → JWT + refresh token
- `POST /auth/refresh` — refresh token → new JWT pair
- `POST /auth/logout` — revoke session

#### Profile
- `GET /profile` — current player profile
- `PATCH /profile` — update display name, settings

#### Progression
- `GET /progression` — player's stage progression list
- `GET /progression/:stageId` — specific stage progression

#### Content
- `GET /content/catalog` — available stages list with metadata
- `GET /content/stage/:id` — stage package by ID (latest or specified version)
- `GET /content/stage/:id/:version` — stage package by specific version

### Client Network Layer

```
apps/mobile/src/network/
├── ApiClient.ts
├── AuthService.ts
├── ProfileService.ts
├── ContentApiService.ts
└── hooks/
    ├── useAuth.ts
    ├── useProfile.ts
    ├── useCatalog.ts
    └── useStagePackage.ts
```

#### ApiClient
- Base HTTP client (fetch wrapper)
- Auth header injection (Bearer token)
- Token refresh interceptor (401 → refresh → retry)
- Request retry policy (3 attempts for 5xx, no retry for 4xx)
- Error normalization

#### TanStack Query Hooks
- `useAuth()` — login/logout state, mutation
- `useProfile()` — profile fetch with stale-while-revalidate
- `useCatalog()` — catalog fetch with cache
- `useStagePackage(id)` — stage detail fetch with version cache

### Tests

- Auth flow integration: login → access protected endpoint → refresh → revoke → access denied
- Profile CRUD: create → get → update → verify
- Content API: catalog → stage package → version pin
- API client: retry on 5xx, no retry on 4xx, token refresh on 401

---

## Phase 8 — Inventory, Economy & Progression

**Tujuan:** Player progression, inventory, currency, rewards — server-authoritative.

### Backend Modules

#### InventoryModule
- Grant items (server-authoritative, audited)
- Consume items (idempotent)
- Query inventory
- Item types: keycard, tool, consumable, cosmetic

#### ProgressionModule
- Calculate XP from run results
- Level up logic
- Stage stars update (1-3 stars based on score thresholds)
- Chapter completion tracking

#### EconomyModule
- Currency wallets: soft (earned) + hard (premium)
- Transaction ledger (every grant/consume logged)
- Balance queries
- No double-spend guarantee

#### RewardModule
- Reward table evaluation
- Claim settlement (idempotent, with receipt)
- Post-run reward grant

### Database Schema Additions

```prisma
model InventoryItem {
  id        String   @id @default(uuid())
  accountId String
  itemId    String
  quantity  Int
  source    String   // "mission_reward", "purchase", "admin_grant"
  grantedAt DateTime @default(now())
  @@unique([accountId, itemId])
}

model CurrencyWallet {
  id              String @id @default(uuid())
  accountId       String
  currencyType    String // "soft", "hard"
  balance         Int    @default(0)
  lastTransaction String?
  @@unique([accountId, currencyType])
}

model Transaction {
  id          String   @id @default(uuid())
  accountId   String
  type        String   // "grant", "consume", "purchase", "reward"
  amount      Int
  currency    String
  source      String
  referenceId String?
  createdAt   DateTime @default(now())
}

model RewardClaim {
  id        String   @id @default(uuid())
  accountId String
  rewardId  String
  claimedAt DateTime @default(now())
  receipt   String   @unique
  @@unique([accountId, rewardId])
}
```

### Post-Run Reward Flow

1. Client submits run result with idempotency key
2. Server: validate run → compute rewards → grant items + currency + XP → update progression → return summary
3. All grants are idempotent (same idempotency key → same result)
4. Transaction audit trail for every grant

### Client Integration

```
apps/mobile/src/services/
├── InventoryService.ts
├── EconomyService.ts
└── ProgressionService.ts

apps/mobile/src/screens/
├── InventoryScreen.tsx
└── ProfileScreen.tsx
```

#### InventoryScreen
- Item grid with icons, quantities, rarity indicators
- Item detail modal: name, description, quantity, use button
- Filter by type

#### ProfileScreen
- Player avatar placeholder, display name
- Level + XP progress bar
- Stats: total missions, total score, evidence collected, traps disarmed
- Badges/achievements placeholder

### Tests

- Inventory: grant → query → consume → verify quantity
- Currency: grant → balance check → spend → balance check → no double-spend
- Progression: complete mission → XP gain → level up → stars update
- Post-run flow: submit run → verify all rewards granted → verify idempotency

---

## Phase 9 — Replay System

**Tujuan:** Record, store, and playback mission runs.

### Replay Data Model

```typescript
interface ReplayManifest {
  runId: string;
  stageId: string;
  stageVersion: string;
  engineVersion: string;
  playerId: string;
  score: number;
  duration: number;
  actionsCount: number;
  createdAt: string;
  blobUrl: string;
  checksum: string;
}

interface ReplayAction {
  turnNumber: number;
  action: ActionIntent;
  result: {
    events: GameplayEvent[];
    stateSnapshot?: RunState; // periodic full snapshots
  };
}

interface ReplayPayload {
  manifest: Omit<ReplayManifest, 'blobUrl'>;
  actions: ReplayAction[];
  initialState: RunState;
}
```

### Backend

```
apps/api/src/modules/replay/
├── replay.module.ts
├── replay.controller.ts
├── replay.service.ts
└── replay-storage.adapter.ts
```

#### Endpoints
- `POST /replay/upload` — upload replay payload (signed)
- `GET /replay/:runId` — get replay manifest
- `GET /replay/:runId/blob` — get replay payload (signed URL)
- `GET /replay/latest` — get player's latest replays

#### Storage
- Manifests in PostgreSQL
- Replay blobs in S3-compatible storage
- Signed URLs for blob access

### Client

```
apps/mobile/src/replay/
├── ReplayRecorder.ts
├── ReplayUploader.ts
└── ReplayViewer.tsx

apps/mobile/src/screens/
└── ReplayViewerScreen.tsx
```

#### ReplayRecorder
- Hook into ActionExecutor
- Capture each action + result events
- Periodic full state snapshots (every 10 actions)
- On run complete: serialize → upload

#### ReplayViewer
- Load replay payload
- Step-by-step action replay
- Timeline scrubber (drag to any turn)
- Speed controls: 0.5x, 1x, 2x
- Auto-play / manual step
- State display at each step: graph state, HUD state, score

### Tests

- Record → serialize → deserialize → replay determinism test
- Replay viewer: step through all actions → verify final state matches
- Timeline scrubber: jump to turn N → verify state matches
- Incompatible replay: wrong engine version → graceful failure screen

---

## Phase 10 — Telemetry & Analytics

**Tujuan:** Event tracking, analytics pipeline, crash monitoring.

### Client Telemetry

```
apps/mobile/src/telemetry/
├── TelemetryService.ts
├── EventBuffer.ts
├── EventDispatcher.ts
├── PrivacyFilter.ts
└── EventSchemas.ts
```

#### TelemetryService
- Emit events with schema validation
- Auto-tag: app_version, content_version, platform, session_id, run_id
- Integration hooks: call after each gameplay action, screen view, error

#### EventBuffer (IndexedDB)
- Queue events when offline
- Flush when online returns
- Max queue size: 1000 events
- Oldest events dropped when full

#### EventDispatcher
- Batch events (50 per batch or 30 second interval)
- Send to backend telemetry endpoint
- Retry on failure (exponential backoff)
- Drop on persistent failure (log locally)

#### PrivacyFilter
- Strip PII from event payloads
- Account ID only if user consented
- No device identifiers in gameplay events

### Backend Telemetry

```
apps/api/src/modules/telemetry/
├── telemetry.module.ts
├── telemetry.controller.ts
├── telemetry.service.ts
└── telemetry-processor.ts
```

- HTTP endpoint for event ingestion
- Schema validation on ingest (reject malformed)
- Queue for async processing (BullMQ)
- Route to analytics storage

### Analytics Integration

#### PostHog (Client)
- SDK integration in mobile app
- Auto-capture: screen views, feature usage
- Custom events from telemetry service
- Funnel analysis: onboarding → first mission → retention

#### Sentry (Client + Backend)
- Client: crash reporting, error tracking, performance traces
- Backend: exception tracking, API performance
- Source maps for client builds
- Breadcrumb analysis

### Tests

- Event schema validation: valid event → pass, invalid → reject
- Buffer/flush: queue 100 events → flush → verify all sent
- Offline → online: queue while offline → reconnect → flush
- Privacy filter: event with PII → filter → verify clean

---

## Phase 11 — LiveOps, Feature Flags & Remote Config

**Tujuan:** Remote control for feature flags, balance tuning, event schedules.

### Backend

```
apps/api/src/modules/liveops/
├── liveops.module.ts
├── liveops.controller.ts
├── liveops.service.ts
├── feature-flag.service.ts
└── event-scheduler.service.ts
```

### Database Schema

```prisma
model LiveOpsConfig {
  id          String   @id @default(uuid())
  domain      String   // "balance", "rewards", "store", "events"
  version     Int
  payloadJson Json
  publishedAt DateTime @default(now())
  status      String   @default("active") // "active", "rollback", "archived"
  publishedBy String
  @@unique([domain, version])
}

model FeatureFlag {
  key              String   @id
  enabled          Boolean  @default(false)
  targetingRulesJson Json   @default("{}")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model EventSchedule {
  id         String   @id @default(uuid())
  eventType  String
  startAt    DateTime
  endAt      DateTime
  configJson Json
  status     String   @default("scheduled") // "scheduled", "active", "ended", "cancelled"
}
```

### Config Domains

- **Balance**: trap severity multipliers, trace decay rates, evidence discovery rates
- **Rewards**: stage reward tables, event rewards, daily login rewards
- **Store**: featured items, offers, bundle configs, prices
- **Events**: seasonal event configs, ranked season configs, challenge configs
- **Features**: enable/disable stages, game modes, UI features

### Client Integration

```
apps/mobile/src/liveops/
├── LiveOpsService.ts
├── FeatureFlagService.ts
└── RemoteConfigStore.ts (Zustand)
```

#### LiveOpsService
- Fetch config on startup
- Cache in IndexedDB
- Refresh on app foreground (if stale > 1 hour)
- Fallback chain: server → cache → hardcoded defaults

#### FeatureFlagService
- Check flag before rendering gated features
- Targeting rules: all users, percentage rollout, specific accounts

### Emergency Controls

- Emergency disable: feature flag `emergency_disable_<feature>`
- Force content update: flag `force_content_update`
- Maintenance mode: flag `maintenance_mode` → show maintenance screen

### Tests

- Config fetch → cache → fallback chain test
- Feature flag targeting evaluation test
- Config versioning: publish v1 → publish v2 → rollback to v1
- Emergency disable: enable flag → verify feature disabled

---

## Phase 12 — Ranked & Competitive

**Tujuan:** Ranked mode with server-authoritative scoring, leaderboards, anti-cheat.

### Backend

```
apps/api/src/modules/ranked/
├── ranked.module.ts
├── ranked.controller.ts
├── ranked.service.ts
├── leaderboard.service.ts
├── submission-validator.ts
└── anomaly-detector.ts
```

### Database Schema

```prisma
model RankedSeason {
  id        String   @id @default(uuid())
  name      String
  startAt   DateTime
  endAt     DateTime
  rulesJson Json
  status    String   @default("scheduled")
}

model LeaderboardEntry {
  id               String   @id @default(uuid())
  seasonId         String
  accountId        String
  score            Int
  rank             Int?
  submittedAt      DateTime @default(now())
  validationStatus String   @default("pending") // "pending", "valid", "flagged", "rejected"
  @@unique([seasonId, accountId])
}

model RankedSubmission {
  id           String   @id @default(uuid())
  accountId    String
  seasonId     String
  runDataJson  Json
  proofJson    Json
  status       String   @default("pending")
  reviewedAt   DateTime?
  createdAt    DateTime @default(now())
}

model AnomalyFlag {
  id             String   @id @default(uuid())
  submissionId   String
  flagType       String   // "impossible_score", "impossible_speed", "replay_mismatch"
  severity       String   // "low", "medium", "high"
  detailsJson    Json
  createdAt      DateTime @default(now())
}
```

### Ranked Flow

1. Client requests challenge → server returns seed + constraints + season config
2. Client plays with deterministic constraints
3. Client submits result + proof (action sequence + checksum)
4. Server validates:
   - Action sequence legality (replay simulation)
   - Score computation matches
   - No impossible metrics (speed, score rate)
   - Anomaly scoring
5. If valid → update leaderboard → return placement
6. If flagged → queue for review → return "under review" status

### Client

```
apps/mobile/src/screens/
├── RankedScreen.tsx
├── RankedChallengeScreen.tsx
└── LeaderboardScreen.tsx
```

#### RankedScreen
- Current season info and timer
- Player's current rank and tier
- Leaderboard preview (top 10 + player's position)
- Start ranked challenge button

#### RankedChallengeScreen
- Same as mission flow but with ranked constraints
- Seed locked by server
- Timer displayed
- Submission automatic on completion

#### LeaderboardScreen
- Full leaderboard with pagination
- Filter: global, friends, clan
- Tier indicators (bronze, silver, gold, platinum, diamond)

### Tests

- Ranked submission → validation → placement test
- Anomaly detection: impossible score → flagged
- Leaderboard recomputation: submit 10 scores → verify ranking order
- Fraud review: flagged submission → review queue → reject/accept

---

## Phase 13 — Social Systems

**Tujuan:** Friends, clans, social interactions.

### Backend

```
apps/api/src/modules/social/
├── social.module.ts
├── social.controller.ts
├── friends.service.ts
├── clan.service.ts
└── moderation.service.ts
```

### Database Schema

```prisma
model Friendship {
  id          String   @id @default(uuid())
  requesterId String
  addresseeId String
  status      String   @default("pending") // "pending", "accepted", "rejected"
  createdAt   DateTime @default(now())
  @@unique([requesterId, addresseeId])
}

model Block {
  id        String   @id @default(uuid())
  blockerId String
  blockedId String
  createdAt DateTime @default(now())
  @@unique([blockerId, blockedId])
}

model Clan {
  id          String   @id @default(uuid())
  name        String   @unique
  tag         String   @unique
  description String?
  ownerId     String
  level       Int      @default(1)
  xp          Int      @default(0)
  createdAt   DateTime @default(now())
  members     ClanMember[]
}

model ClanMember {
  id        String   @id @default(uuid())
  clanId    String
  accountId String
  role      String   @default("member") // "owner", "officer", "member"
  joinedAt  DateTime @default(now())
  @@unique([clanId, accountId])
}

model Report {
  id         String   @id @default(uuid())
  reporterId String
  targetId   String
  type       String   // "player", "content", "clan"
  reason     String
  detailsJson Json?
  status     String   @default("open") // "open", "reviewing", "resolved", "dismissed"
  createdAt  DateTime @default(now())
  resolvedAt DateTime?
}
```

### Client

```
apps/mobile/src/screens/
├── FriendsScreen.tsx
├── ClanScreen.tsx
├── SocialProfileScreen.tsx
└── ReportModal.tsx
```

#### FriendsScreen
- Friend list with online status
- Pending requests (incoming + outgoing)
- Search players
- Add friend / accept / reject / remove

#### ClanScreen
- Clan info (name, tag, level, XP)
- Member list with roles
- Clan progression / milestones
- Invite / leave / manage (owner)

#### SocialProfileScreen
- Other player's profile (limited view)
- Stats summary
- Shared replays
- Add friend / block / report buttons

### Social Safety

- Report flow: select type → reason → details → submit
- Block: prevents friend requests, visibility, clan invites
- Moderation metadata on all social actions
- Profanity filter stub for display names and clan names

### Tests

- Friend request flow: send → accept → verify friends → remove
- Clan CRUD: create → invite → accept → verify member → leave
- Block: block player → verify no contact/visibility
- Report: submit → verify case created → resolve

---

## Phase 14 — Mini-Games

**Tujuan:** Mini-game system for evidence decryption, trap disarming, access gates.

### Framework

```
packages/game-core/src/minigames/
├── MiniGameRegistry.ts
├── MiniGameRunner.ts
├── types.ts
├── pattern-match.ts
├── lockpick.ts
└── cipher-decode.ts
```

### Mini-Game Types

#### Pattern Match (Evidence Decryption)
- Display sequence of symbols
- Player must repeat sequence in correct order
- Difficulty: sequence length + time limit
- Touch: tap symbols in order

#### Lockpick (Trap Disarming)
- Display lock with tumblers
- Player adjusts tumblers to correct position
- Feedback: tumbler color (close/far)
- Difficulty: number of tumblers + tolerance
- Touch: slide tumblers up/down

#### Cipher Decode (Access Gate)
- Display encoded message
- Player substitutes letters to decode
- Partial feedback: correctly decoded letters shown
- Difficulty: cipher complexity + time limit
- Touch: tap letter → select replacement

### Integration

- Triggered during mission based on game logic:
  - Evidence collect → Pattern Match
  - Trap disarm → Lockpick
  - Gate bypass → Cipher Decode
- Result fed back to simulation:
  - Success → effect applied (evidence collected, trap disarmed, gate opened)
  - Fail → consequence (trace increase, damage, alert)
- MiniGameConfig from content schema defines parameters

### UI

```
apps/mobile/src/screens/mission/
└── MiniGameOverlay.tsx
└── minigames/
    ├── PatternMatchGame.tsx
    ├── LockpickGame.tsx
    └── CipherDecodeGame.tsx
```

- Modal overlay during mini-game
- Timer display
- Progress indicator
- Success/fail animation + haptic feedback
- Cancel button (abandon mini-game → fail consequence)

### Tests

- Each mini-game: success path, fail path, timeout path
- MiniGameRunner: create → play → resolve → return result
- Integration: mini-game result → simulation state update correct

---

## Phase 15 — Creator Pipeline

**Tujuan:** Tools for creating and validating new stages/content.

### CLI Tools

```
packages/content-tools/
├── src/
│   ├── StageBuilder.ts
│   ├── StageValidator.cli.ts
│   ├── SolvabilityChecker.cli.ts
│   ├── DifficultyScorer.cli.ts
│   └── StageExporter.ts
├── bin/
│   └── content-tools.ts
├── package.json
└── tsconfig.json
```

### StageBuilder API
```typescript
const stage = new StageBuilder('my-stage', 'My Stage')
  .setDifficulty('medium')
  .addNode({ id: 'entry', type: 'entry', position: { x: 0, y: 0 } })
  .addNode({ id: 'room1', type: 'normal', position: { x: 200, y: 0 } })
  .addLink({ from: 'entry', to: 'room1' })
  .addEvidence({ id: 'ev1', type: 'document', locationNodeId: 'room1' })
  .addObjective({ id: 'obj1', type: 'collect_evidence', targetRef: 'ev1' })
  .build(); // returns StageDefinition
```

### CLI Commands
- `content-tools validate <file>` — validate stage JSON
- `content-tools solvability <file>` — check solvability
- `content-tools difficulty <file>` — score difficulty
- `content-tools export <file>` — export to content package

### Content Pipeline
1. Author (programmatic or future web editor)
2. Validate (schema + solvability + fairness)
3. Package (bundle with metadata)
4. Publish (upload to content service)

### Tests

- StageBuilder: build stage → validate → verify correct
- CLI commands: run against sample stages → verify output
- Export: build → export → import → verify round-trip

---

## Phase 16 — Commerce & Store

**Tujuan:** In-game store, offers, IAP stubs, server-verified transactions.

### Backend

```
apps/api/src/modules/commerce/
├── commerce.module.ts
├── commerce.controller.ts
├── store.service.ts
├── purchase-verification.service.ts
└── offer.service.ts
```

### Database Schema

```prisma
model StoreOffer {
  id           String   @id @default(uuid())
  type         String   // "item", "bundle", "currency", "cosmetic"
  itemIds      String[]
  priceCurrency String  // "soft", "hard"
  priceAmount  Int
  startAt      DateTime?
  endAt        DateTime?
  status       String   @default("active")
  metadataJson Json     @default("{}")
}

model PurchaseReceipt {
  id          String   @id @default(uuid())
  accountId   String
  platform    String   // "google_play", "app_store"
  receiptData Json
  verifiedAt  DateTime?
  status      String   @default("pending") // "pending", "verified", "rejected"
  createdAt   DateTime @default(now())
}

model PurchaseAuditLog {
  id          String   @id @default(uuid())
  accountId   String
  action      String   // "initiate", "verify", "grant", "refund"
  detailsJson Json
  createdAt   DateTime @default(now())
}
```

### Client

```
apps/mobile/src/screens/
├── StoreScreen.tsx
└── OfferDetailScreen.tsx

apps/mobile/src/services/
├── StoreService.ts
└── PurchaseService.ts
```

#### StoreScreen
- Featured items carousel
- Categories: items, bundles, currency, cosmetics
- Daily offers (time-limited)
- Currency balance display

#### PurchaseFlow
1. Select offer → detail screen
2. Tap buy → confirm dialog
3. IAP flow stub (Google Play Billing / StoreKit)
4. Send receipt to server → verify → grant
5. Success/failure feedback

### Tests

- Store offers CRUD test
- Purchase verification: valid receipt → verified → grant; tampered → rejected
- Idempotent purchase: double-submit → single grant
- Audit log: every purchase action logged

---

## Phase 17 — Push Notifications & Deep Links

**Tujuan:** Player engagement through notifications and deep linking.

### Backend

```
apps/api/src/modules/notification/
├── notification.module.ts
├── notification.controller.ts
├── notification.service.ts
└── push-provider.adapter.ts
```

### Client

```
apps/mobile/src/platform/
├── PushNotificationService.ts
└── DeepLinkService.ts
```

### Notification Types

| Type | Trigger | Content |
|------|---------|---------|
| Event reminder | LiveOps event starts | "Season 2 is live! New challenges await." |
| Friend request | Social action | "PlayerX wants to be your friend." |
| Clan invite | Social action | "You've been invited to join ClanY." |
| Ranked result | Ranked verification | "Your ranked run has been verified. Rank: #42." |
| Daily reward | Time-based | "Your daily reward is ready to claim!" |
| Custom | LiveOps config | Configurable per campaign |

### Deep Links

- `nullbytestage://mission/<stageId>` → open mission
- `nullbytestage://clan/<clanId>` → open clan
- `nullbytestage://replay/<runId>` → open replay
- `nullbytestage://store/<offerId>` → open store offer

### Tests

- Push registration: register → verify token stored
- Deep link routing: navigate to correct screen
- Notification opt-in/opt-out: toggle → verify behavior
- Notification payload: handle each type correctly

---

## Phase 18 — Advanced Trust & Moderation

**Tujuan:** Moderation tools, anti-tamper, anomaly detection, admin support.

### Backend

```
apps/api/src/modules/
├── moderation/
│   ├── moderation.module.ts
│   ├── moderation.controller.ts
│   ├── moderation.service.ts
│   └── case-manager.service.ts
├── trust/
│   ├── trust.module.ts
│   ├── trust.service.ts
│   └── anomaly-scorer.ts
└── admin/
    ├── admin.module.ts
    ├── admin.controller.ts
    └── admin.service.ts
```

### Database Schema

```prisma
model ModerationCase {
  id          String   @id @default(uuid())
  reporterId  String
  targetId    String
  type        String   // "player", "content", "clan"
  status      String   @default("open")
  detailsJson Json
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?
  resolvedBy  String?
}

model Sanction {
  id        String   @id @default(uuid())
  accountId String
  type      String   // "warn", "mute", "temp_ban", "permanent_ban"
  reason    String
  startAt   DateTime @default(now())
  endAt     DateTime?
  issuedBy  String
}

model AuditLog {
  id         String   @id @default(uuid())
  actorId    String
  action     String
  targetType String
  targetId   String
  detailsJson Json
  createdAt  DateTime @default(now())
}

model AnomalyScore {
  id          String   @id @default(uuid())
  accountId   String
  score       Float
  signalsJson Json
  computedAt  DateTime @default(now())
}
```

### Trust Signals

- Impossible score detection (score > max possible)
- Impossible action speed (actions per second > threshold)
- Currency accumulation anomaly (balance increase > max possible from gameplay)
- Replay verification failures (action sequence doesn't reproduce score)
- Multiple account detection hints (same device, similar behavior patterns)

### Admin Tools (basic web interface)

- Player lookup: profile, inventory, history, sanctions
- Case review: reports, anomalies, evidence
- Sanction management: warn, mute, ban, unban
- Manual grant audit trail
- Content moderation queue

### Tests

- Report → case creation → resolution flow test
- Anomaly scoring: normal player → low score; cheater → high score
- Sanction enforcement: banned player → API calls rejected
- Admin action audit: every admin action → audit log entry

---

## Phase 19 — CI/CD, Deployment & Observability

**Tujuan:** Production-ready deployment pipeline, monitoring, alerting.

### CI/CD Pipelines

```
.github/workflows/
├── pr.yml              # PR checks
├── main.yml            # Main branch deploy to staging
├── release.yml         # Tag → production deploy
└── mobile.yml          # Mobile build → store upload
```

#### PR Pipeline
1. Lint (ESLint)
2. Typecheck (tsc --noEmit)
3. Unit tests (Vitest)
4. Build (Vite for client, NestJS build for API)

#### Main Pipeline
1. All PR checks
2. Integration tests
3. Docker build + push
4. Deploy to staging

#### Release Pipeline
1. Tag release
2. All main checks
3. Docker build + push (production tag)
4. Deploy to production
5. Smoke tests

#### Mobile Pipeline
1. Build client
2. Fastlane: build → sign → upload to TestFlight/Play Console

### Docker

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Docker Compose (local dev)

```yaml
services:
  api:
    build: ./apps/api
    ports: ["3000:3000"]
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/nullbyte
      REDIS_URL: redis://redis:6379
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: nullbyte
  redis:
    image: redis:7
    ports: ["6379:6379"]
```

### Observability

- Structured JSON logging across all services
- Sentry: client + backend projects configured
- PostHog: client SDK configured
- Basic Grafana dashboard stubs:
  - API response times (p50, p95, p99)
  - Error rates (4xx, 5xx)
  - Active users (DAU, MAU)
  - Mission completion rates
  - LiveOps config fetch success rates

### Alerting

- Error rate > 5% for 5 minutes → alert
- API p95 latency > 2s for 5 minutes → alert
- Auth failure spike > 100/min → alert
- Database connection pool exhausted → alert
- Queue backlog > 1000 → alert

### Tests

- Docker build test (builds successfully)
- Health check endpoint tests
- CI pipeline dry-run verification

---

## Phase 20 — Polish, Accessibility & Performance

**Tujuan:** Mobile polish, accessibility compliance, performance optimization.

### Accessibility

- Colorblind-safe alternatives for all gameplay states (pattern/shape redundancy)
- Dynamic text scaling (respects system font size)
- Icon + color redundancy for state indicators
- Reduced motion mode (disable/minimize animations)
- Screen reader basics for key UI elements (node names, actions, alerts)
- Haptic feedback optional, never mandatory for gameplay

### Performance Optimization

- Lazy loading for non-critical screens/routes (code splitting)
- Memoization for expensive renders (GraphView, HUD components)
- Asset preloading: stage assets loaded before mission starts
- Telemetry batching: reduce network/battery impact
- Background timer management: pause all timers when app backgrounded
- Memory pressure handling: release content caches on low memory warning

### Mobile Polish

- Splash screen (Capacitor splash plugin)
- App icon (all sizes for Android + iOS)
- Safe area handling verified on notch/punch-hole devices
- Keyboard avoidance for text inputs
- Orientation lock (portrait primary, landscape optional for replay viewer)
- Status bar styling (light/dark based on theme)
- 60fps graph interaction (optimized rendering, requestAnimationFrame)

### Offline Resilience

- Clear offline state indicators (banner, icon)
- Graceful degradation per feature:
  - Campaign: playable with cached content
  - Ranked: disabled (requires server)
  - Social: disabled (requires server)
  - Store: disabled (requires server)
  - Profile: cached read-only
- Pending submissions: retry on reconnect with idempotency
- No data loss on network interruption

### Final Testing

- Device matrix:
  - Android: low-tier (2GB RAM), mid-tier (4GB), high-tier (8GB+)
  - iOS: iPhone SE, iPhone 15, iPhone 15 Pro Max
- Performance profiling:
  - Cold start time < 3 seconds
  - Frame rate: 60fps during graph interaction
  - Memory usage < 200MB during gameplay
  - Battery: < 5% per 30-minute session
- Accessibility audit: all states distinguishable without color
- Network testing: offline, slow 3G, intermittent connectivity

---

## Phase Summary

| Phase | Focus | Dependencies | Est. Effort |
|-------|-------|-------------|-------------|
| 1 | Monorepo & tooling foundation | — | Small |
| 2 | Game Core simulation engine | 1 | Large |
| 3 | Shared schemas & content contracts | 1 | Medium |
| 4 | Client app shell & platform layer | 1 | Medium |
| 5 | Content system & stage loading | 2, 3, 4 | Medium |
| 6 | Mission flow end-to-end | 2, 4, 5 | Large |
| 7 | Backend: auth, profile, content API | 1, 3 | Medium |
| 8 | Inventory, economy & progression | 6, 7 | Medium |
| 9 | Replay system | 6, 7 | Medium |
| 10 | Telemetry & analytics | 4, 7 | Medium |
| 11 | LiveOps, feature flags & remote config | 7 | Medium |
| 12 | Ranked & competitive | 6, 7, 8, 9 | Large |
| 13 | Social systems | 7, 8 | Medium |
| 14 | Mini-games | 2, 6 | Medium |
| 15 | Creator pipeline | 3, 5 | Medium |
| 16 | Commerce & store | 7, 8 | Medium |
| 17 | Push notifications & deep links | 4, 7 | Small |
| 18 | Advanced trust & moderation | 7, 9, 12 | Medium |
| 19 | CI/CD, deployment & observability | 7 | Medium |
| 20 | Polish, accessibility & performance | All | Large |

---

## Non-Goals for Initial Implementation

These are explicitly out of scope for the initial build but architected to support later:

- Full 3D rendering or game engine integration
- Real-time multiplayer
- Voice/text chat
- Full creator web editor (CLI tools only initially)
- Native iOS/Android code beyond Capacitor plugins
- Machine learning-based anti-cheat
- Full admin web panel (basic tools only)
