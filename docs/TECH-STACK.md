# TECH-STACK.md

## Overview

Dokumen ini menetapkan rekomendasi **tech stack production** untuk game investigasi graph/network yang ditargetkan ke **Android** dan **iOS** melalui **Capacitor**. Tujuan dokumen ini bukan hanya memilih library, tetapi memilih kombinasi teknologi yang realistis untuk mobile game production yang membutuhkan deterministic gameplay core, backend authority untuk domain sensitif, liveops, replay, telemetry, ranked integrity, dan evolusi jangka panjang.

Arah umum stack yang direkomendasikan adalah:

- **TypeScript-first** untuk konsistensi end-to-end
- **Capacitor** sebagai mobile shell
- **web-tech UI** yang disiplin mobile-first
- **shared schema contracts** untuk content dan payload penting
- **backend modular** yang bisa dimulai sebagai modular monolith lalu dipisah bila skala menuntut
- **managed cloud infrastructure** sejauh mungkin untuk mempercepat delivery tanpa mengorbankan production readiness

---

## Decision Principles

Stack dipilih berdasarkan prinsip berikut:

- mobile-first compatibility
- production operability
- deterministic core feasibility
- developer velocity tanpa terlalu mengorbankan maintainability
- testability
- observability
- scalability bertahap
- kemampuan integrasi liveops, telemetry, commerce, dan moderation

Jika ada dua opsi yang sama-sama layak, pilih opsi yang lebih kuat untuk mobile production, lebih mudah diobservasi, dan lebih stabil untuk tim jangka panjang.

---

## Recommended High-Level Stack Summary

| Domain                        | Recommendation                                                           |
| ----------------------------- | ------------------------------------------------------------------------ |
| Language                      | TypeScript                                                               |
| Mobile Shell                  | Capacitor                                                                |
| Frontend UI                   | React + TypeScript                                                       |
| Build Tool                    | Vite                                                                     |
| Styling                       | Tailwind CSS + design tokens                                             |
| State Management              | Zustand untuk app/UI state, pure domain modules untuk simulation core    |
| Data Fetching                 | TanStack Query                                                           |
| Forms / Validation            | Zod + React Hook Form bila diperlukan untuk tooling/admin/internal flows |
| Core Game Logic               | Pure TypeScript domain modules                                           |
| Local Storage                 | Capacitor Preferences + IndexedDB/local DB abstraction bila perlu        |
| Secure Local Storage          | Native secure storage abstraction bila ada token sensitif                |
| Backend Runtime               | Node.js + TypeScript                                                     |
| Backend Framework             | NestJS                                                                   |
| API Style                     | REST-first, event-driven untuk async workflows                           |
| Primary Database              | PostgreSQL                                                               |
| Cache / Queue                 | Redis                                                                    |
| Object Storage                | S3-compatible storage                                                    |
| Search / Discovery            | PostgreSQL FTS dulu, OpenSearch/Elasticsearch bila skala menuntut        |
| Telemetry Ingestion           | Event pipeline via HTTP + queue                                          |
| Analytics Warehouse           | BigQuery atau ClickHouse                                                 |
| Auth                          | JWT/session tokens + refresh flow, plus platform account linking         |
| Push Notifications            | Firebase Cloud Messaging + APNs through provider layer                   |
| Crash / Error Monitoring      | Sentry                                                                   |
| Product Analytics             | PostHog atau Amplitude                                                   |
| Feature Flags / Remote Config | GrowthBook / Flagsmith / custom config service                           |
| CI/CD                         | GitHub Actions                                                           |
| Mobile Distribution           | Fastlane + store pipelines                                               |
| Infrastructure                | Docker + managed cloud services                                          |
| IaC                           | Terraform                                                                |

---

## Frontend / Client Stack

## Core recommendation

Gunakan **React + TypeScript + Vite + Capacitor** sebagai baseline client stack.

### Why React

React cocok untuk game jenis ini bila UI-heavy dan node graph interaction lebih dominan daripada 3D/action rendering. Kelebihannya:

- ekosistem matang
- cocok dengan Capacitor
- cepat untuk membangun screen-heavy product seperti inventory, progression, event hub, store, social, replay viewer, settings, dan content browser
- mudah dipisah antara presentation layer dan game simulation layer
- tim web/mobile hybrid biasanya lebih cepat delivery dengan React

### Why Vite

Vite memberi developer experience yang cepat, konfigurasi ringan, dan cocok untuk aplikasi TypeScript modern yang nantinya dibungkus dengan Capacitor.

### Why not game engine first

Untuk game ini, kebutuhan utama tampaknya adalah:

- graph interaction
- HUD-heavy screens
- data-driven systems
- lots of menus and progression surfaces
- liveops/admin-like client complexity

Karena itu pendekatan web-tech + simulation core lebih efisien daripada memulai dengan game engine penuh, kecuali nanti scope visual berkembang jauh ke arah action-heavy real-time rendering.

---

## UI Framework and Styling

### Recommended

- **React**
- **Tailwind CSS**
- optional internal component library berbasis design tokens

### Why Tailwind

- cepat untuk iterasi mobile UI
- mudah menjaga konsistensi spacing, typography, state colors
- cocok untuk theme system dan responsive constraints
- lebih mudah dikontrol dibanding CSS bebas di project yang akan tumbuh besar

### Additional guidance

- bangun **design token layer** sejak awal untuk color roles, spacing scale, typography scale, elevation, border radius, motion timings, dan icon sizing
- gunakan token terpisah untuk gameplay states seperti trace, alert, trap danger, success, warning, info, locked, hidden, corrupted
- jangan membiarkan styling menyebar tanpa sistem naming dan token yang jelas

---

## Client State Strategy

Tidak semua state harus dikelola dengan satu tool. Pisahkan berdasarkan sifat state.

### Recommended split

#### 1. Core simulation state

Gunakan **pure TypeScript domain modules**, bukan state library generik sebagai pusat logic. State simulation harus dievaluasi oleh engine/domain layer, bukan dibentuk oleh UI store sebagai source of truth.

#### 2. App/UI state

Gunakan **Zustand** untuk state UI dan app shell yang ringan, misalnya:

- selected tabs
- open overlays
- navigation context
- filters/sorts
- transient screen-level state
- local settings that are not domain authority

### Why Zustand

- ringan
- sederhana
- cocok untuk app shell
- tidak memaksa pola terlalu berat
- lebih mudah dipisah dari domain core dibanding pendekatan yang terlalu global dan reducer-heavy untuk semua hal

#### 3. Server state

Gunakan **TanStack Query** untuk:

- profile fetch
- inventory fetch
- liveops config fetch
- leaderboard fetch
- replay manifest fetch
- mutation with retry/error policies

### Why TanStack Query

- sangat cocok untuk caching data server
- built-in stale/fresh policies
- bagus untuk mobile network realities
- mengurangi boilerplate sinkronisasi request state

---

## Domain Logic / Simulation Stack

### Recommendation

Gunakan **pure TypeScript modules** untuk seluruh gameplay core.

Ini harus mencakup:

- graph traversal logic
- access rule evaluation
- evidence system
- trap resolution
- trace escalation
- objective progression
- score computation
- replay packaging helpers
- deterministic seed utilities bila ada randomness terkontrol

### Supporting libraries

Gunakan dependency sesedikit mungkin di simulation core. Prioritaskan:

- utility kecil yang aman dan stabil bila benar-benar perlu
- tanpa ketergantungan DOM
- tanpa ketergantungan React
- tanpa plugin native

### Validation library

Gunakan **Zod** untuk:

- runtime validation terhadap payload penting
- schema validation untuk content authoring ingestion
- API response guards pada boundary kritis
- telemetry payload validation di internal tooling bila perlu

Kenapa Zod:

- TypeScript-friendly
- cocok untuk shared contracts
- cukup ergonomis untuk developer speed

---

## Capacitor Stack

### Core platform

Gunakan **Capacitor** sebagai satu-satunya mobile shell utama.

### Recommended Capacitor domains

- app lifecycle
- device info
- haptics
- keyboard
- status bar
- splash screen
- deep links/app links/universal links
- push notifications
- preferences/storage
- filesystem bila replay/cache membutuhkan
- network status

### Platform plugin guidance

Tambahkan plugin native hanya bila benar-benar diperlukan oleh product. Prioritaskan:

- plugin resmi atau widely maintained
- parity iOS/Android yang baik
- fallback behavior yang jelas
- abstraction internal agar mudah diganti

### Native wrappers

Semua plugin dipanggil lewat internal adapter/service. Jangan panggil plugin langsung dari screen/component kecuali pada level demo/prototype sangat awal.

---

## Local Persistence Stack

### Recommended approach

Gunakan kombinasi berikut berdasarkan jenis data:

- **Capacitor Preferences** untuk settings kecil dan flags ringan
- **IndexedDB** atau local database abstraction untuk cache content, replay cache, telemetry queue, dan data lokal yang lebih besar
- **secure native storage abstraction** untuk token atau kredensial sensitif bila memang perlu tersimpan di device

### Why not only Preferences

Preferences cocok untuk key-value kecil, tetapi tidak ideal untuk cache besar, replay metadata, queue event, atau content package yang lebih kompleks.

### Suggested usage map

| Data Type                              | Recommended Storage               |
| -------------------------------------- | --------------------------------- |
| theme / language / accessibility prefs | Capacitor Preferences             |
| auth refresh token                     | secure native storage abstraction |
| cached catalog and manifests           | IndexedDB/local DB abstraction    |
| telemetry queue                        | IndexedDB/local DB abstraction    |
| local resumable run checkpoint         | IndexedDB/local DB abstraction    |
| replay cache                           | IndexedDB/local DB abstraction    |

---

## Navigation Strategy

### Recommendation

Gunakan **React Router** atau solusi routing setara yang tetap ringan dan bisa dikendalikan dengan jelas dalam app shell.

Namun, untuk flow gameplay aktif, jangan terlalu bergantung pada routing URL-style sebagai pusat state run. Gunakan route untuk screen boundaries, lalu gunakan application/session coordinator untuk mission lifecycle.

### Rule of thumb

- route untuk screen/page shell
- internal session state machine untuk run lifecycle

---

## Backend Stack

## Core recommendation

Gunakan **Node.js + TypeScript + NestJS**.

### Why Node.js + TypeScript

- konsisten dengan client language
- memudahkan shared contracts dan DTO patterns
- kecepatan tim tinggi
- cukup kuat untuk service layer, content APIs, social APIs, liveops APIs, telemetry intake, dan moderation tooling

### Why NestJS

- struktur modular jelas
- cocok untuk tim menengah yang membutuhkan organisasi codebase jangka panjang
- built-in patterns untuk dependency injection, modules, guards, interceptors, validation, testing
- memudahkan migrasi dari modular monolith ke service split

### Alternative if team prefers lighter stack

Bila tim sangat kecil dan ingin lebih ringan, **Fastify + TypeScript** juga layak. Namun untuk repo production yang akan besar, NestJS lebih mudah dijaga konsistensinya.

---

## Backend Architecture Style

### Recommended starting point

Mulai dengan **modular monolith** yang memiliki domain boundaries tegas, lalu pecah menjadi service terpisah bila load, team size, atau operability menuntut.

### Why modular monolith first

- delivery lebih cepat
- operasional lebih sederhana
- mengurangi complexity awal
- lebih cocok untuk fase membangun sistem inti yang saling terkait rapat

### Modules to plan from day one

- auth/identity
- profile
- progression
- inventory/economy
- content
- leaderboard/ranked
- replay
- liveops
- social
- moderation
- telemetry intake
- admin/support

---

## API Style

### Recommendation

Gunakan **REST-first API** untuk mayoritas client flows.

REST cocok untuk:

- auth
- profile
- inventory
- content catalog
- liveops config
- progression summary
- rewards
- social actions
- replay manifests
- leaderboard reads

### Async/event-driven workflows

Gunakan queue/job processing untuk:

- heavy replay validation
- content validation pipeline
- moderation scanning
- leaderboard recomputation
- seasonal reward settlement
- anomaly detection
- telemetry aggregation

### Why not GraphQL first

GraphQL bisa berguna di beberapa product, tetapi untuk mobile production game dengan domain authority yang jelas, versioning ketat, dan banyak flow spesifik, REST lebih mudah di-cache, diobservasi, dan di-hardening pada tahap awal.

---

## Database Stack

## Primary database

Gunakan **PostgreSQL** sebagai primary transactional database.

### Why PostgreSQL

- kuat untuk transactional data
- fleksibel untuk relational domain kompleks
- indexing dan JSONB cukup baik
- matang untuk production
- cocok untuk profile, inventory, progression, social metadata, moderation cases, and content metadata

### Good fit domains

- accounts
- profiles
- progression
- currencies and wallet records
- item ownership
- clan/friend relationships
- offer claims
- moderation actions
- content publication metadata

---

## Caching and Queueing

### Recommendation

Gunakan **Redis** untuk:

- short-lived cache
- rate limiting support
- idempotency key storage
- leaderboard helpers bila perlu
- async job queues
- session-adjacent ephemeral state yang aman

### Queue choice

Jika memakai ekosistem Node/NestJS, Redis-backed queue seperti BullMQ bisa menjadi pilihan pragmatis untuk awal.

Gunakan queue untuk:

- replay processing
- telemetry fan-out
- content validation jobs
- moderation pipelines
- notification fan-out
- reward settlement jobs yang tidak wajib synchronous

---

## Object Storage

### Recommendation

Gunakan **S3-compatible object storage** untuk:

- replay payloads
- exported reports
- moderation evidence attachments
- content bundles/artifacts bila diperlukan
- large JSON snapshots or archives

### Why

- murah dan scalable
- mudah diintegrasikan dengan CDN
- cocok untuk asset non-transactional

---

## Search and Discovery

### Recommendation path

Mulai dengan **PostgreSQL full-text search** untuk:

- stage listing search
- creator content browser sederhana
- codex/search ringan

Naik ke **OpenSearch/Elasticsearch** hanya jika:

- volume content sangat besar
- ranking/relevance kompleks dibutuhkan
- ada kebutuhan agregasi discovery lebih berat

Jangan over-engineer search terlalu awal.

---

## Authentication and Account Stack

### Recommendation

Gunakan auth service berbasis:

- access token + refresh token flow
- device/session tracking
- optional account linking ke platform login bila dibutuhkan product
- support anonymous bootstrap hanya jika desain product membutuhkannya dan migrasi ke bound account jelas

### Important requirements

- server-authoritative sessions
- token rotation policy
- revoke support
- suspicious session monitoring
- audit trail untuk critical account actions

### Mobile considerations

- resume flow harus mulus
- refresh token storage harus aman
- expired session tidak boleh merusak local state secara kacau

---

## Commerce and Entitlements

### Recommendation

Bangun layer commerce server-side yang memverifikasi:

- platform store receipts
- entitlements
- offer eligibility
- currency grants
- idempotent purchase settlement

### Why

Client tidak boleh menjadi authority final atas transaksi. Ini sangat penting untuk mobile game production.

### Notes

- desain abstraction untuk Google Play dan App Store
- semua grant harus diaudit
- refund/reversal path harus dipertimbangkan sejak awal

---

## Push Notifications Stack

### Recommendation

Gunakan provider model yang menjembatani:

- **Firebase Cloud Messaging** untuk Android
- **APNs** untuk iOS

Biasanya ini dibungkus oleh notification service backend agar campaign, transactional notifications, dan opt-in state bisa dikelola konsisten.

### Notification use cases

- seasonal event reminders
- async challenge notifications
- energy/ticket refill jika sistem produk memakainya
- social invites
- clan milestones
- store/event reminders

### Important rules

- opt-in/opt-out harus jelas
- notification fatigue harus dikontrol
- region/privacy compliance harus diperhatikan

---

## LiveOps / Feature Flags / Remote Config Stack

### Recommendation

Ada dua jalur yang sama-sama valid:

#### Option A: Managed platform

Gunakan **GrowthBook**, **Flagsmith**, atau platform sejenis untuk feature flags/experiments, lalu simpan game-specific config kompleks di backend sendiri.

#### Option B: Custom config service

Bangun service internal untuk:

- feature flags
- event schedules
- challenge configs
- reward/balance tables
- seasonal settings

### Practical recommendation

Untuk game ini, pendekatan hybrid paling realistis:

- feature flags/experiment bucketing via platform atau service sederhana
- config gameplay/liveops utama via **custom validated config service**

### Why custom for gameplay configs

Game content dan balance config biasanya membutuhkan schema validation, versioning, rollback, dan domain checks yang lebih spesifik daripada feature flag tools generik.

---

## Telemetry and Product Analytics Stack

## Event ingestion

Bangun jalur event internal via backend endpoint + queue.

### Analytics destinations

Rekomendasi pragmatis:

- **PostHog** atau **Amplitude** untuk product analytics/funnel analysis
- **BigQuery** atau **ClickHouse** untuk warehouse analytics yang lebih dalam

### Suggested choice

- **PostHog** bila tim ingin cepat, fleksibel, dan relatif developer-friendly
- **Amplitude** bila organisasi nanti sangat product analytics heavy dan siap biaya lebih besar
- **BigQuery** jika sudah nyaman dengan GCP/data ecosystem
- **ClickHouse** jika butuh analytics performa tinggi dan lebih self-managed/infra-aware

### Recommended combo

Kombinasi yang sangat masuk akal:

- **PostHog** untuk product analytics cepat
- **BigQuery** untuk warehouse dan deep analysis

---

## Crash Reporting and Error Monitoring

### Recommendation

Gunakan **Sentry** untuk:

- mobile/web client errors
- backend exceptions
- release tracking
- performance traces dasar
- source map support
- breadcrumb analysis

### Why Sentry

- matang
- lintas client/backend
- cocok untuk release health
- sangat berguna untuk game live product dengan banyak edge case mobile

---

## Logging, Metrics, and Tracing

### Recommendation

- structured logging di backend
- OpenTelemetry untuk tracing bila observability makin matang
- metrics ke Prometheus/Grafana stack atau managed observability provider

### Practical path

Tahap awal:

- structured JSON logs
- Sentry
- basic infra metrics

Tahap menengah:

- OpenTelemetry traces
- Grafana dashboards
- alerting untuk SLO penting

---

## CI/CD Stack

### Recommendation

Gunakan **GitHub Actions** sebagai baseline CI/CD.

### Why GitHub Actions

- cukup matang
- mudah diintegrasikan dengan repo
- cocok untuk lint, test, build, artifact generation, backend deploy trigger, dan mobile build workflows

### CI pipelines to prepare

- lint
- typecheck
- unit tests
- simulation tests
- schema validation tests
- frontend build
- backend build
- preview/release artifact creation
- content validation job

---

## Mobile Delivery Pipeline

### Recommendation

Gunakan **Fastlane** untuk membantu otomasi:

- signing
- beta distribution
- App Store / Play Store workflows
- metadata automation seperlunya

### Why

Mobile release process akan cepat kompleks. Fastlane membantu menjaga konsistensi pipeline rilis.

---

## Infrastructure Stack

### Recommendation

Gunakan **Docker** untuk packaging service dan **Terraform** untuk infrastructure as code.

### Cloud direction

Pilih managed services sejauh mungkin. Secara umum, baik AWS, GCP, maupun Azure bisa dipakai. Yang terpenting adalah konsistensi operasional dan kesiapan tim.

### Pragmatic recommendation

Untuk kombinasi yang umum dan aman:

- backend services dalam container
- managed PostgreSQL
- managed Redis
- S3-compatible object storage
- CDN untuk asset/replay distribution bila perlu
- managed secrets/config system

### Why managed-first

- tim bisa fokus ke game dan platform, bukan operasi infra terlalu dini
- reliability lebih baik pada tahap awal sampai menengah
- incident surface lebih kecil

---

## Infrastructure by Concern

| Concern             | Recommendation                |
| ------------------- | ----------------------------- |
| Compute             | container-based services      |
| DB                  | managed PostgreSQL            |
| Cache/Queue         | managed Redis                 |
| Blob/Object         | S3-compatible object storage  |
| CDN                 | managed CDN                   |
| Secrets             | managed secret store          |
| Analytics warehouse | BigQuery atau setara          |
| Logs/Monitoring     | Sentry + metrics/traces stack |

---

## Testing Stack

### Client and domain tests

Gunakan:

- **Vitest** untuk unit tests TypeScript yang cepat
- **Testing Library** untuk React UI behavior tests

### Backend tests

- **Vitest** atau **Jest** dapat dipakai konsisten, tetapi jika seluruh repo ingin lebih seragam dan ringan, Vitest bisa dipertimbangkan luas untuk TS projects modern
- contract/integration tests untuk API penting

### End-to-end tests

Untuk UI app flows dan beberapa smoke flows, gunakan:

- **Playwright** untuk web-shell testing dan sebagian flow logic

Untuk mobile-specific regression nanti, pertimbangkan lapisan tambahan jika benar-benar dibutuhkan. Jangan terlalu cepat menambah tool E2E mobile berat sebelum flow inti stabil.

### Critical test areas

- rule evaluation
- deterministic simulation
- save/restore checkpoints
- retry/idempotency flows
- reward settlement
- ranked verification
- replay compatibility
- content schema validation

---

## Recommended Monorepo Strategy

### Recommendation

Gunakan **pnpm workspace** untuk monorepo TypeScript.

### Why pnpm

- cepat
- efisien disk space
- cocok untuk multi-package repo
- bagus untuk shared packages seperti schemas, utils, telemetry contracts, and API client types

### Suggested package groups

- app/mobile client
- backend/api
- shared schemas/contracts
- content tooling/validator
- admin/internal tools jika nanti ada

---

## Shared Packages Strategy

Buat shared packages hanya untuk domain yang benar-benar butuh dibagi lintas client/backend/tooling.

### Good candidates

- content schemas
- DTO contracts tertentu
- telemetry event contracts
- enum/constant domain yang stabil
- replay manifest types
- validation utilities terbatas

### Avoid sharing blindly

Jangan membuat shared package untuk seluruh logic hanya demi DRY. Rule yang menyentuh authority berbeda harus tetap dipisah dengan hati-hati.

---

## Security Stack Recommendations

### Core tools and practices

- input validation via Zod/class-validator boundary sesuai layer
- JWT/session security best practices
- server-side receipt verification
- rate limiting
- audit logging
- secret management via managed store
- dependency scanning in CI
- SAST/secret scanning minimal di pipeline

### Nice additions later

- anomaly scoring pipeline
- replay verification workers
- admin approval workflows
- integrity dashboard for ranked/commerce anomalies

---

## Recommended Concrete Stack by Layer

### Mobile app

- React
- TypeScript
- Vite
- Capacitor
- Tailwind CSS
- Zustand
- TanStack Query
- Zod
- Testing Library
- Vitest
- Sentry

### Game core

- Pure TypeScript domain modules
- Zod untuk schema guards
- seeded RNG utility bila diperlukan
- replay serialization helpers internal

### Backend

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Redis
- BullMQ or equivalent queue
- S3-compatible storage
- Sentry
- OpenTelemetry secara bertahap

### Data and analytics

- product analytics: PostHog
- warehouse analytics: BigQuery
- dashboards: BI tool pilihan tim atau warehouse-native stack

### DevOps / platform

- GitHub Actions
- Docker
- Terraform
- Fastlane

---

## Technology Choices to Avoid Early

Untuk fase awal menuju production, sebaiknya hindari dulu:

- microservices penuh sejak hari pertama
- GraphQL sebagai default semua flow
- terlalu banyak state library sekaligus
- plugin native berlebihan tanpa abstraction
- search engine terpisah sebelum kebutuhan discovery jelas
- custom infra analytics berat sebelum ada event discipline yang baik
- game engine besar bila kebutuhan utama masih UI/data-heavy

---

## Recommended First Implementation Stack

Jika harus diputuskan hari ini, baseline paling kuat adalah:

- **Frontend**: React + TypeScript + Vite + Tailwind + Capacitor
- **Client state**: Zustand + TanStack Query
- **Validation**: Zod
- **Core gameplay**: pure TypeScript domain modules
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL
- **Cache/queue**: Redis
- **Storage**: S3-compatible object storage
- **Analytics**: PostHog + BigQuery
- **Crash monitoring**: Sentry
- **CI/CD**: GitHub Actions + Fastlane
- **Infra**: Docker + Terraform + managed cloud services

Ini adalah kombinasi yang cukup modern, mobile-friendly, production-oriented, dan realistis untuk tim yang ingin bergerak cepat tetapi tetap membangun fondasi yang benar.

---

## Final Recommendation Summary

Untuk project ini, stack yang paling direkomendasikan adalah **TypeScript end-to-end** dengan **React + Capacitor** di client, **NestJS + PostgreSQL + Redis** di backend, **Zod** untuk contract validation, **TanStack Query** untuk server state, **Zustand** untuk app/UI state, **Sentry** untuk monitoring, serta **PostHog + BigQuery** untuk analytics.

Kombinasi ini paling seimbang antara kecepatan eksekusi, kualitas arsitektur, kesiapan mobile production, dan kemampuan berkembang ke fitur-fitur berat seperti liveops, ranked integrity, replay, moderation, dan creator pipeline.
