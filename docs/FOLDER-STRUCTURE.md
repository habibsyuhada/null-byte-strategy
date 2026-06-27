# FOLDER-STRUCTURE.md

## Overview

Dokumen ini mendefinisikan struktur folder yang direkomendasikan untuk project game investigasi graph/network yang dikembangkan sebagai **mobile-first production game** dengan **React + TypeScript + Capacitor** di client dan **NestJS + TypeScript** di backend.

Tujuan struktur ini adalah:

- menjaga pemisahan domain yang jelas
- memudahkan scaling tim dan codebase
- memisahkan gameplay core dari UI dan platform layer
- memudahkan testing, validation, liveops, telemetry, dan operations
- membuat shared contracts tetap terkontrol
- mendukung perjalanan dari fase awal sampai full production

Struktur yang direkomendasikan adalah **monorepo berbasis pnpm workspace**. Ini memungkinkan client, backend, tooling, dan shared packages berkembang bersama tanpa membuat dependency antar domain menjadi liar.

---

## Repository Strategy

### Recommended model

Gunakan **monorepo** dengan pembagian besar berikut:

- `apps/` untuk runnable applications
- `packages/` untuk shared libraries yang memang pantas dibagi
- `services/` opsional jika backend dipisah menjadi beberapa runtime/service deployable
- `tooling/` untuk script, validator, generators, build helpers
- `docs/` untuk dokumentasi produk, teknis, operasi, dan content
- `infra/` untuk infrastructure-as-code dan environment config templates

### Why monorepo

Monorepo cocok untuk project ini karena:

- schemas dan contracts perlu dibagi secara terkontrol
- client, backend, dan tooling akan berevolusi bersama
- validator content kemungkinan dipakai oleh lebih dari satu domain
- CI/CD dapat dibuat konsisten
- refactor lintas domain lebih mudah diaudit

---

## Recommended Top-Level Structure

```text
repo/
├── apps/
│   ├── mobile/
│   ├── admin/
│   └── ops-dashboard/
├── services/
│   ├── api/
│   ├── telemetry-ingest/
│   └── workers/
├── packages/
│   ├── domain-core/
│   ├── content-schemas/
│   ├── shared-types/
│   ├── api-contracts/
│   ├── telemetry-contracts/
│   ├── replay-core/
│   ├── validation-core/
│   ├── ui-tokens/
│   └── utils/
├── tooling/
│   ├── scripts/
│   ├── generators/
│   ├── content-validator-cli/
│   └── dev-tools/
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── backend/
│   ├── gameplay/
│   ├── liveops/
│   ├── security/
│   ├── qa/
│   └── runbooks/
├── infra/
│   ├── terraform/
│   ├── env/
│   ├── k8s/
│   └── scripts/
├── .github/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── turbo.json
└── README.md
```

Catatan: `turbo.json` hanya contoh jika repo memilih Turborepo. Jika tidak dipakai, file ini tidak wajib.

---

## Top-Level Directory Responsibilities

### `apps/`

Berisi aplikasi yang memiliki entrypoint UI langsung atau aplikasi internal berbasis frontend.

Contoh:

- `mobile/` untuk game client utama berbasis React + Capacitor
- `admin/` untuk internal admin panel atau support tool ringan
- `ops-dashboard/` untuk observability/product ops internal bila dibutuhkan

### `services/`

Berisi aplikasi backend yang dijalankan sebagai service terpisah.

Contoh:

- `api/` untuk NestJS main backend
- `telemetry-ingest/` jika ingestion event dipisah
- `workers/` untuk queue consumers dan background jobs

Jika pada fase awal backend masih modular monolith tunggal, maka `services/api/` bisa menjadi service utama dan folder service lain belum perlu dibuat.

### `packages/`

Berisi library shared yang independen dari aplikasi tertentu dan bisa dikonsumsi lintas app/service.

### `tooling/`

Berisi alat bantu development, CLI validator, script sinkronisasi content, code generators, dan utilitas engineering internal.

### `docs/`

Berisi seluruh dokumentasi terstruktur, termasuk dokumen yang sudah dibuat seperti `AGENTS.md`, `ARCHITECTURE.md`, dan `TECH-STACK.md` bila ingin dipindahkan atau direferensikan.

### `infra/`

Berisi Terraform, template environment, deployment helpers, dan konfigurasi infrastruktur lain.

---

## Apps Structure

## `apps/mobile/`

Ini adalah aplikasi utama game client untuk Android dan iOS melalui Capacitor.

### Recommended structure

```text
apps/mobile/
├── android/
├── ios/
├── public/
├── src/
│   ├── app/
│   ├── screens/
│   ├── features/
│   ├── game/
│   ├── meta/
│   ├── content/
│   ├── platform/
│   ├── network/
│   ├── liveops/
│   ├── telemetry/
│   ├── social/
│   ├── replay/
│   ├── store/
│   ├── assets/
│   ├── styles/
│   ├── hooks/
│   ├── providers/
│   ├── utils/
│   ├── config/
│   └── tests/
├── capacitor.config.ts
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Directory purpose

#### `android/` dan `ios/`

Folder native hasil integrasi Capacitor. Jangan jadikan folder ini tempat business logic. Perubahan di sini harus dibatasi pada kebutuhan native platform, signing, permissions, plugin wiring, dan build configuration.

#### `public/`

Asset statis yang memang layak dibawa sebagai public build resource. Jangan isi dengan asset game besar tanpa strategi packaging yang jelas.

#### `src/app/`

Bootstrap aplikasi, root composition, routing shell, app providers, startup orchestrator, auth gate, dan lifecycle coordinator.

#### `src/screens/`

Screen-level UI seperti home, mission select, run HUD shell, inventory, operator detail, replay viewer shell, settings, store, social, event hub, clan, codex.

#### `src/features/`

Feature-centric modules untuk alur UI tertentu yang menggabungkan komponen, hooks, screen logic, dan use-case ringan.

Contoh:

- `mission-select/`
- `post-run-report/`
- `loadout-builder/`
- `ranked-challenge/`
- `event-hub/`

#### `src/game/`

Boundary untuk gameplay runtime yang dipakai client. Jika gameplay core juga tersedia sebagai shared package, folder ini dapat menjadi integration layer ke package tersebut.

#### `src/meta/`

Profile summary, progression UI integration, inventory read models, reward presentation, mission unlock view models.

#### `src/content/`

Client-side content loading, manifest cache, content selectors, localization resources binding, content version awareness.

#### `src/platform/`

Semua adapter Capacitor/native lives here. Contoh:

- lifecycle adapter
- network adapter
- haptics adapter
- push adapter
- secure storage adapter
- deep link adapter

#### `src/network/`

API clients, auth refresh, query setup, mutation wrappers, retry policy, request interceptors, error mapping.

#### `src/liveops/`

Remote config consumer, feature flags reader, event state resolver, experiment bucket reader.

#### `src/telemetry/`

Event emitters, buffering, privacy filter, dispatch queue, debug telemetry tools.

#### `src/social/`

Friends, clan, leaderboard read models, challenge metadata integration.

#### `src/replay/`

Replay viewer integration, manifest loading, playback coordinators, ghost comparison UI helpers.

#### `src/store/`

UI/app state stores seperti Zustand stores. Jangan jadikan folder ini tempat domain game truth untuk simulation core.

#### `src/assets/`

Icon, sound refs, sprite refs, illustration refs, placeholder assets. Asset besar sebaiknya punya pipeline sendiri.

#### `src/styles/`

Global styles, theme tokens binding, typography definitions, animation tokens.

#### `src/hooks/`

Reusable React hooks yang tidak terlalu domain-heavy. Jangan taruh business logic besar di sini.

#### `src/providers/`

React providers seperti query provider, theme provider, error boundary wrappers, telemetry provider, platform bootstrap provider.

#### `src/utils/`

Helpers generik non-domain. Gunakan hemat. Jika utility mulai bersifat domain-specific, pindahkan ke domain terkait.

#### `src/config/`

Build-time config readers, environment guards, feature defaults, endpoint mapping.

#### `src/tests/`

Test harness client-level, mocks, setup files, screen test utilities.

---

## `apps/admin/`

Opsional, tetapi sangat berguna untuk production.

Aplikasi ini bisa dipakai untuk:

- content publication review
- liveops config authoring
- moderation queue review
- support tooling ringan
- feature flag inspection

Jika admin panel belum dibutuhkan di awal, folder ini bisa ditunda.

---

## `apps/ops-dashboard/`

Opsional untuk fase lebih matang. Bisa digunakan untuk dashboard operasi internal seperti:

- anomaly watchlist
- event health
- ranked integrity monitoring
- content validation trends
- replay processing failures

Jika dashboard dibangun dari BI tool eksternal, folder ini tidak wajib.

---

## Services Structure

## `services/api/`

Ini adalah backend utama, idealnya berbasis NestJS modular.

### Recommended structure

```text
services/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   ├── config/
│   ├── modules/
│   │   ├── auth/
│   │   ├── identity/
│   │   ├── profile/
│   │   ├── progression/
│   │   ├── inventory/
│   │   ├── economy/
│   │   ├── content/
│   │   ├── runs/
│   │   ├── replay/
│   │   ├── leaderboard/
│   │   ├── social/
│   │   ├── liveops/
│   │   ├── commerce/
│   │   ├── moderation/
│   │   ├── support/
│   │   └── telemetry-proxy/
│   ├── database/
│   ├── jobs/
│   ├── events/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   ├── filters/
│   └── tests/
├── prisma/
├── test/
├── tsconfig.json
└── package.json
```

### Backend internal boundaries

#### `src/common/`

Shared server helpers seperti base DTO, shared exceptions, logging helpers, response mappers, constants server-wide. Jangan biarkan ini menjadi “tempat semua hal”.

#### `src/config/`

Config loading, env validation, feature switches server-side, secrets access abstraction.

#### `src/modules/`

Setiap domain bisnis utama berada di modul terpisah.

#### `src/database/`

Database providers, repositories, transaction helpers, migration helpers, persistence adapters.

#### `src/jobs/`

Queue processors, scheduled tasks, async orchestration.

#### `src/events/`

Internal domain events atau integration events.

#### `src/guards/`, `interceptors/`, `pipes/`, `filters/`

Boundary framework-level untuk auth, rate limiting, validation, serialization, error handling.

#### `src/tests/`

Test utilities backend internal.

#### `prisma/`

Jika memilih Prisma sebagai ORM/data access tooling. Bila memakai approach lain, sesuaikan.

---

## `services/telemetry-ingest/`

Opsional jika telemetry dipisah dari API utama.

Gunakan saat:

- volume event tinggi
- ingin memisahkan ingestion scaling dari API utama
- ingin event validation dan fan-out berjalan independen

### Suggested structure

```text
services/telemetry-ingest/
├── src/
│   ├── ingest/
│   ├── validation/
│   ├── routing/
│   ├── privacy/
│   ├── sinks/
│   └── tests/
└── package.json
```

---

## `services/workers/`

Untuk background processing.

Contoh jobs:

- replay verification
- content validation
- leaderboard recomputation
- season settlement
- moderation scanning
- export jobs
- notification fan-out

### Suggested structure

```text
services/workers/
├── src/
│   ├── queues/
│   ├── processors/
│   ├── schedulers/
│   ├── handlers/
│   └── tests/
└── package.json
```

---

## Packages Structure

Gunakan shared packages secara disiplin. Jangan share semua hal hanya demi DRY.

## `packages/domain-core/`

Paket paling penting untuk gameplay core yang deterministic.

### Responsibilities

- run state types inti
- graph traversal rules
- access rule evaluators
- evidence logic
- trap logic
- trace logic
- objective logic
- scoring logic
- deterministic utilities
- replay-friendly transition contracts

### Suggested structure

```text
packages/domain-core/
├── src/
│   ├── entities/
│   ├── state/
│   ├── actions/
│   ├── systems/
│   ├── rules/
│   ├── scoring/
│   ├── replay/
│   ├── serialization/
│   ├── validation/
│   ├── constants/
│   └── tests/
└── package.json
```

### Important rule

Paket ini **tidak boleh** bergantung pada React, Capacitor, browser APIs, atau backend framework.

---

## `packages/content-schemas/`

Berisi schema dan parser/validator untuk content definitions.

### Responsibilities

- stage schema
- node schema
- link schema
- evidence schema
- trap schema
- mini-game schema
- objective schema
- rewards/balance schema
- liveops content schema tertentu
- version migration helpers jika ada

### Suggested structure

```text
packages/content-schemas/
├── src/
│   ├── schemas/
│   ├── parsers/
│   ├── migrations/
│   ├── fixtures/
│   └── tests/
└── package.json
```

---

## `packages/shared-types/`

Untuk type stabil yang layak dipakai lintas domain.

Contoh:

- identifiers
- enums stabil
- manifest summaries
- generic pagination types
- common result wrappers

Jangan menjadikan paket ini tempat semua interface. Jika type terlalu domain-specific, letakkan di paket domainnya.

---

## `packages/api-contracts/`

Berisi kontrak DTO/request-response yang dibagi antara backend dan client bila memang dibutuhkan.

### Good contents

- auth DTO ringan
- profile summary responses
- leaderboard entry types
- replay manifest types
- liveops config contract summaries

### Avoid

Jangan menyimpan persistence entities atau internal ORM types di sini.

---

## `packages/telemetry-contracts/`

Berisi definisi event telemetry dan validator payload.

### Suggested structure

```text
packages/telemetry-contracts/
├── src/
│   ├── events/
│   ├── schemas/
│   ├── versions/
│   └── tests/
└── package.json
```

---

## `packages/replay-core/`

Jika replay logic cukup besar, pisahkan dari domain-core.

### Responsibilities

- replay manifest types
- action timeline contracts
- serialization helpers
- compatibility checks
- replay verification primitives

Jika replay masih sederhana, sebagian bisa tetap di `domain-core/`.

---

## `packages/validation-core/`

Untuk rule validation yang dipakai tooling, backend, atau CI.

### Responsibilities

- structural validation
- solvability checks
- fairness checks
- difficulty scoring helpers
- ranked eligibility checks
- report formatting

Ini berguna agar validator tidak tertanam hanya di satu app.

---

## `packages/ui-tokens/`

Opsional tapi sangat direkomendasikan.

### Responsibilities

- design tokens
- semantic color definitions
- spacing scale
- typography scale
- motion tokens
- icon sizing
- theme roles untuk gameplay states

Ini membantu menjaga konsistensi UI lintas mobile app, admin tools, dan dokumentasi desain internal.

---

## `packages/utils/`

Hanya untuk utility yang benar-benar generik dan stabil, misalnya:

- date formatting helper umum
- object utilities
- invariant/assert helpers
- low-level collection helpers

Jika helper menjadi domain-specific, jangan simpan di sini.

---

## Tooling Structure

## `tooling/scripts/`

Berisi script development dan automation sederhana.

Contoh:

- clean caches
- sync content manifests
- generate env templates
- release metadata helpers
- changelog utilities

## `tooling/generators/`

Berisi code generators/scaffolders.

Contoh:

- generate new backend module
- generate content schema fixture
- generate telemetry event template
- generate stage template package

## `tooling/content-validator-cli/`

CLI internal untuk validasi content pack.

### Responsibilities

- validate local content folder
- output validation report
- check schema version compatibility
- run solvability/fairness checks
- export machine-readable CI artifacts

## `tooling/dev-tools/`

Utility lain untuk internal engineering, misalnya:

- seed dummy data
- replay inspector local
- telemetry payload preview tool
- ranked simulation harness

---

## Docs Structure

Direkomendasikan agar dokumentasi dipecah berdasarkan domain.

```text
docs/
├── product/
├── architecture/
├── gameplay/
├── content/
├── backend/
├── api/
├── telemetry/
├── liveops/
├── security/
├── qa/
├── analytics/
├── support/
└── runbooks/
```

### Suggested mapping

- `docs/product/` untuk scope, feature overview, release plans
- `docs/architecture/` untuk ARCHITECTURE.md dan keputusan arsitektur
- `docs/gameplay/` untuk systems design detail
- `docs/content/` untuk authoring guide dan schema usage
- `docs/backend/` untuk service-level design
- `docs/api/` untuk public/internal contracts
- `docs/telemetry/` untuk event taxonomy
- `docs/liveops/` untuk config and event operations
- `docs/security/` untuk trust model, anti-cheat, moderation
- `docs/qa/` untuk validation packs dan test strategy
- `docs/runbooks/` untuk incident, rollback, season launch, takedown operations

---

## Infra Structure

### Suggested structure

```text
infra/
├── terraform/
│   ├── modules/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── shared/
├── env/
│   ├── templates/
│   └── examples/
├── k8s/
│   ├── base/
│   └── overlays/
└── scripts/
```

### Notes

- jika tidak memakai Kubernetes, folder `k8s/` bisa dihilangkan
- environment templates harus aman dan tidak mengandung secret nyata
- rahasia selalu disimpan di managed secret store, bukan di repo

---

## Testing Structure

Testing harus tersebar dekat domainnya untuk unit/integration kecil, ditambah beberapa root-level test area untuk suites yang lebih besar.

### Co-located tests

Direkomendasikan untuk:

- domain-core tests
- schema tests
- React component tests
- backend module tests

### Root-level or dedicated test folders

Gunakan untuk:

- cross-package integration tests
- replay compatibility suites
- content golden packs
- e2e or smoke test harnesses

### Suggested additional top-level test structure

```text
repo/
├── tests/
│   ├── e2e/
│   ├── integration/
│   ├── content-golden/
│   ├── replay-golden/
│   ├── fixtures/
│   └── performance/
```

### Important test domains

- deterministic simulation
- access rule correctness
- trap resolution
- trace escalation
- save/restore integrity
- idempotent reward flows
- replay compatibility
- content validation outputs
- liveops config parsing
- mobile lifecycle-sensitive logic

---

## Naming Convention Guidance

### General rules

- gunakan nama folder **kebab-case** untuk package/app names
- gunakan nama file **kebab-case** atau sesuai konvensi framework yang konsisten
- gunakan nama domain yang eksplisit, bukan folder “misc”, “common2”, “helpers-final”
- hindari folder “shared” yang terlalu luas kecuali benar-benar jelas isinya

### Good examples

- `ranked-challenge/`
- `liveops-config/`
- `trace-system/`
- `content-validator-cli/`

### Bad examples

- `stuff/`
- `misc/`
- `shared2/`
- `temp-final/`

---

## Dependency Boundary Rules

Ini bagian paling penting dari struktur folder.

### Client-side rules

- `screens/` boleh bergantung pada `features/`, `providers/`, `hooks/`, dan domain integration layers
- `features/` boleh bergantung pada domain use cases, bukan langsung ke plugin native tanpa adapter
- `platform/` menjadi satu-satunya pintu utama ke Capacitor/native
- `game/` tidak boleh bergantung pada React components
- `store/` tidak boleh menjadi tempat domain core logic yang seharusnya berada di `packages/domain-core/` atau `src/game/`

### Shared package rules

- `domain-core/` tidak bergantung pada UI, browser, atau backend framework
- `content-schemas/` tidak bergantung pada app-specific implementation detail
- `api-contracts/` hanya menyimpan contracts, bukan service logic
- `telemetry-contracts/` hanya menyimpan event definitions dan validators, bukan analytics business logic

### Backend rules

- modul backend tidak boleh mengimpor client UI packages
- DTO publik dipetakan dari domain/backend model, bukan langsung expose entity persistence mentah
- queue processors tidak boleh menyimpan logic liar yang mem-bypass domain services resmi

---

## Example Mobile App Source Structure in More Detail

```text
apps/mobile/src/
├── app/
│   ├── bootstrap/
│   ├── router/
│   ├── startup/
│   └── session/
├── screens/
│   ├── home/
│   ├── mission-select/
│   ├── run/
│   ├── inventory/
│   ├── operators/
│   ├── replay/
│   ├── social/
│   ├── store/
│   ├── events/
│   └── settings/
├── features/
│   ├── loadout-builder/
│   ├── post-run-report/
│   ├── ranked-challenge/
│   ├── event-briefing/
│   └── reward-claim/
├── game/
│   ├── runtime/
│   ├── adapters/
│   ├── checkpoints/
│   ├── selectors/
│   └── presenters/
├── platform/
│   ├── lifecycle/
│   ├── storage/
│   ├── notifications/
│   ├── haptics/
│   ├── deep-links/
│   └── device/
├── network/
│   ├── api-client/
│   ├── auth/
│   ├── queries/
│   ├── mutations/
│   └── sync/
├── telemetry/
│   ├── emitters/
│   ├── queue/
│   ├── mappers/
│   └── privacy/
└── tests/
```

---

## Example Backend Module Structure in More Detail

```text
services/api/src/modules/profile/
├── application/
├── domain/
├── infrastructure/
├── presentation/
└── tests/
```

### Layer meaning

- `application/` untuk use cases dan orchestration
- `domain/` untuk entities, policies, invariants, domain services
- `infrastructure/` untuk repositories, DB adapters, integrations
- `presentation/` untuk controllers, DTO mappers, transport-specific concerns
- `tests/` untuk module-level tests

Pendekatan ini bisa diulang pada modul lain bila tim ingin boundaries yang lebih bersih di dalam NestJS module.

---

## Content Repository Strategy

Jika content authoring tumbuh besar, ada dua opsi:

### Option A: Content berada di repo yang sama

Cocok untuk tim kecil sampai menengah. Validator, schema, dan content definitions hidup berdampingan.

### Option B: Content dipisah repo sendiri

Cocok jika:

- tim content sangat besar
- publishing cadence tinggi
- approval workflow terpisah ketat
- ingin release cadence content berbeda dari codebase

### Recommendation for now

Mulai dengan content di repo yang sama, misalnya:

```text
repo/
├── content/
│   ├── stages/
│   ├── templates/
│   ├── modifiers/
│   ├── liveops/
│   ├── localization/
│   └── validation-reports/
```

Jika memakai struktur ini, pastikan content tetap tervalidasi melalui tooling dan CI.

---

## Suggested Additional Root Directories

Tergantung kebutuhan, repo juga bisa memiliki:

```text
repo/
├── content/
├── tests/
├── release/
└── artifacts/
```

### `content/`

Sumber content authoring mentah atau semi-mentah.

### `release/`

Template release notes, version manifests, submission checklists.

### `artifacts/`

Biasanya jangan commit artifact build, tetapi folder ini bisa dipakai lokal/CI output jika diperlukan dan biasanya masuk `.gitignore`.

---

## Example Full Monorepo Layout

```text
repo/
├── apps/
│   ├── mobile/
│   ├── admin/
│   └── ops-dashboard/
├── services/
│   ├── api/
│   ├── telemetry-ingest/
│   └── workers/
├── packages/
│   ├── domain-core/
│   ├── content-schemas/
│   ├── validation-core/
│   ├── replay-core/
│   ├── api-contracts/
│   ├── telemetry-contracts/
│   ├── shared-types/
│   ├── ui-tokens/
│   └── utils/
├── content/
│   ├── stages/
│   ├── templates/
│   ├── modifiers/
│   ├── localization/
│   └── validation-reports/
├── tooling/
│   ├── scripts/
│   ├── generators/
│   ├── content-validator-cli/
│   └── dev-tools/
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── gameplay/
│   ├── backend/
│   ├── telemetry/
│   ├── liveops/
│   ├── security/
│   ├── qa/
│   └── runbooks/
├── infra/
│   ├── terraform/
│   ├── env/
│   └── scripts/
├── tests/
│   ├── e2e/
│   ├── integration/
│   ├── content-golden/
│   ├── replay-golden/
│   └── performance/
├── .github/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

---

## Growth Path Guidance

Struktur ini dirancang agar bisa tumbuh secara bertahap.

### Stage 1

- `apps/mobile`
- `services/api`
- `packages/domain-core`
- `packages/content-schemas`
- `packages/api-contracts`
- `tooling/content-validator-cli`
- `docs/`

### Stage 2

- `services/workers`
- `packages/telemetry-contracts`
- `packages/validation-core`
- `content/`
- `tests/` root suites

### Stage 3

- `apps/admin`
- `services/telemetry-ingest`
- `packages/replay-core`
- `apps/ops-dashboard`
- expanded infra and runbooks

Dengan pendekatan ini, repo tidak perlu overbuilt dari hari pertama, tetapi tetap punya arah yang benar.

---

## Anti-Patterns to Avoid

Hindari struktur berikut:

- semua logic client ditaruh di `src/components/`
- gameplay rules disimpan di hooks React
- plugin Capacitor dipanggil langsung dari banyak screen
- content schemas bercampur dengan UI presentational code
- shared package generik yang terlalu besar dan tidak punya batas domain
- backend modules mengakses DB tanpa batas service/domain yang jelas
- folder `common/` atau `shared/` menjadi tempat semua kode yang tidak jelas rumahnya

---

## Final Recommendation

Struktur repo yang paling direkomendasikan untuk project ini adalah **monorepo** dengan pemisahan jelas antara:

- **apps** untuk client dan tools UI
- **services** untuk runtime backend
- **packages** untuk shared domain libraries yang layak dipakai lintas batas
- **content** untuk authoring data
- **tooling** untuk validator dan automation
- **docs** untuk technical and operational documentation
- **infra** untuk deployment and platform setup

Inti dari seluruh struktur ini adalah menjaga agar:

- gameplay core tetap deterministic dan terisolasi
- mobile integration via Capacitor tetap terkendali
- backend authority tetap jelas
- content pipeline tetap tervalidasi
- observability, liveops, replay, ranked integrity, dan security punya ruang arsitektural yang benar sejak awal

Dokumen ini bisa dipakai langsung sebagai baseline untuk membuat repo baru, menyusun package workspace, dan menentukan boundary ownership antar tim.
