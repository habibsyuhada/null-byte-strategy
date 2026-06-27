# ARCHITECTURE.md

## Overview

Dokumen ini mendefinisikan arsitektur target untuk game investigasi graph/network yang dikembangkan sebagai **mobile-first production game** dengan shell deployment **Capacitor** untuk Android dan iOS. Arsitektur ini dirancang agar gameplay core tetap deterministic, content pipeline scalable, backend authority jelas untuk domain sensitif, dan operasi live product tetap terjaga saat game berkembang ke full-feature release.

Arah utama arsitektur ini adalah memisahkan dengan tegas antara presentasi, simulasi gameplay, content definitions, platform integration, backend services, telemetry, trust systems, dan live operations. Dengan pendekatan ini, tim dapat mengembangkan fitur baru tanpa mencampur rule game dengan UI, tanpa mengorbankan kompatibilitas mobile, dan tanpa membuat domain sensitif bergantung pada state client yang tidak dapat dipercaya.

---

## Primary Architecture Goals

Arsitektur harus memenuhi sasaran berikut:

- mendukung **Android** dan **iOS** sebagai target utama melalui **Capacitor**
- mempertahankan **deterministic gameplay core** untuk replay, ranked validation, debugging, dan balancing
- memisahkan **game simulation** dari **UI rendering**
- membuat seluruh **content systems schema-driven**
- menempatkan **progression, inventory, economy, commerce, ranked integrity, dan moderation** di bawah server authority
- mendukung **offline tolerance** dan **intermittent connectivity** yang umum pada mobile
- memungkinkan **liveops**, **seasonal content**, **telemetry-driven tuning**, dan **safe rollback**
- mendukung **creator/content pipeline** bertahap tanpa mengorbankan keamanan dan kualitas stage

---

## System Context

Secara garis besar, sistem terdiri dari lima domain besar:

1. **Mobile Client App**
   Menjalankan UI, local presentation logic, input handling, asset loading, simulation execution, local checkpointing, telemetry buffering, dan integrasi native via Capacitor.

2. **Core Game Runtime**
   Menjalankan graph traversal, access rules, evidence resolution, trap triggers, trace escalation, objective state, scoring, dan replay-compatible state transitions.

3. **Backend Platform**
   Menyediakan auth, profile, progression, inventory, rewards, leaderboards, replay manifests, social graph, moderation, commerce, liveops config, dan content delivery control.

4. **Content and Operations Pipeline**
   Menyediakan authoring, schema validation, difficulty scoring, build packaging, rollout, rollback, creator moderation, dan event scheduling.

5. **Analytics, Trust, and Support**
   Menangani telemetry ingestion, data quality validation, dashboarding, anomaly detection, anti-fraud review, GM tooling, dan incident observability.

---

## Architecture Principles

### Mobile-first, not web-first

Walaupun app dapat menggunakan teknologi web, seluruh keputusan arsitektur harus diasumsikan berjalan pada environment mobile. Ini berarti setiap subsystem harus aman terhadap pause/resume, jaringan tidak stabil, keyboard/touch constraints, thermal pressure, dan memory limits perangkat mobile.

### Deterministic simulation

Simulation layer harus bisa menghasilkan outcome yang sama untuk input, state, content version, dan seed yang sama. Prinsip ini penting untuk replay, ranked integrity, auditing, dan automated balancing.

### Clear authority boundaries

Client boleh mengelola UX state dan cache, tetapi server harus menjadi authority untuk identity, progression, inventory, currency, entitlements, ranked acceptance, leaderboard state, dan moderation decisions.

### Data-driven content

Stage, nodes, links, rules, traps, evidence, objectives, mini-games, rewards, modifiers, dan seasonal rules harus berada di data contracts yang tervalidasi, bukan hardcoded per screen.

### Platform abstraction

Akses ke Capacitor dan native plugins tidak boleh tersebar ke seluruh UI. Semua interaksi platform harus dipusatkan ke layer adapter/service agar mudah diuji, diganti, dan diaudit.

### Operational resilience

Semua sistem penting harus dirancang dengan observability, rollback strategy, feature flags, dan degradable behavior saat jaringan atau service tidak sehat.

---

## High-Level Logical Layers

| Layer                   | Responsibility                                                               |
| ----------------------- | ---------------------------------------------------------------------------- |
| Presentation Layer      | Screens, HUD, flows, animations, accessibility, touch interactions           |
| Application Layer       | Use cases, screen orchestration, session coordination, sync decisions        |
| Core Simulation Layer   | Rules engine, graph traversal, trace, traps, evidence, objectives, scoring   |
| Content Layer           | Schemas, definitions, content loading, version management, validation inputs |
| Meta Systems Layer      | Profile, progression, inventory, loadout, rewards, economy                   |
| Platform Layer          | Capacitor integrations, native adapters, lifecycle, push, deep links         |
| Network Layer           | Auth, API clients, retry logic, sync, offline reconciliation                 |
| LiveOps Layer           | Remote config, event schedules, feature flags, experiments                   |
| Analytics & Trust Layer | Telemetry dispatch, privacy policy, anti-tamper hooks, anomaly reporting     |

Arsitektur implementasi harus menjaga agar dependency mengalir dari atas ke bawah. Presentation boleh bergantung ke application/use-case layer, tetapi simulation core tidak boleh bergantung ke UI, plugin native, atau network calls langsung.

---

## High-Level Runtime Flow

### App startup flow

1. App shell dibuka melalui Capacitor container.
2. Platform layer memuat device context, app version, lifecycle hooks, safe area, dan network state.
3. Application bootstrap memuat local config defaults dan cache penting.
4. Auth/session manager memeriksa existing session atau anonymous state yang diizinkan.
5. LiveOps config diambil dari backend bila jaringan tersedia.
6. Content catalog dan profile summary disinkronkan sesuai freshness policy.
7. UI masuk ke home shell, lalu pemain dapat mengakses campaign, contracts, event, inventory, store, social, dan settings.

### Mission start flow

1. Player memilih stage/mode.
2. Client memuat content definition yang dipin ke `contentVersion` tertentu.
3. Loadout diverifikasi secara lokal untuk UX dan secara server bila mode sensitif.
4. Run session dibuat dengan metadata: stage version, player snapshot, mode rules, seed policy, ranked flags.
5. Core simulation membuat `RunState` awal.
6. Presentation layer melakukan render awal HUD, node graph, objective panel, trace state, dan available actions.

### During run

- UI mengirim intent action ke application layer.
- Application layer memanggil simulation core.
- Simulation mengevaluasi legality, effect resolution, trace changes, objective updates, traps, score deltas.
- Hasilnya dikembalikan sebagai state transition/result object.
- UI merender state baru dan feedback.
- Telemetry layer merekam event penting.
- Checkpoint lokal disimpan pada titik aman tertentu.

### Run completion flow

1. Simulation menghasilkan final outcome dan score breakdown.
2. Application layer mengemas run summary, anti-tamper metadata, dan replay payload bila mode mendukung.
3. Backend menerima submission untuk reward, ranked verification, replay manifest, dan progression updates.
4. Client menampilkan post-run report.
5. Meta systems melakukan sinkronisasi reward dan progression summary.

---

## Client Architecture

## Client responsibilities

Client harus bertanggung jawab atas:

- rendering UI dan game board
- input touch dan gesture handling
- local responsiveness
- menjalankan simulation core
- local checkpoint/resume state untuk session yang aman
- cache content read-only
- buffering telemetry dan retry ringan
- replay playback viewer
- integrasi native mobile via Capacitor

Client **tidak** menjadi authority final untuk currency, entitlements, ranked acceptance, leaderboard result final, dan reward settlement sensitif.

### Client modules

#### App Shell

Menangani bootstrap, navigation shell, auth state gate, session recovery, dan top-level dependency wiring.

#### UI / Presentation

Berisi screens, HUD, overlay, modal, settings, accessibility controls, animation rules, dan input affordances.

#### Application / Use Cases

Mengorkestrasi flow seperti start mission, resume run, claim reward, watch replay, open event, submit score, dan retry sync.

#### Game Core Runtime

Berisi seluruh rule system dan state transition logic yang deterministic.

#### Local Persistence

Menyimpan cache, player preferences, content manifests, safe local checkpoints, telemetry queue, dan diagnostic flags.

#### Platform Services

Membungkus akses ke lifecycle app, network status, haptics, push notifications, deep links, safe area, filesystem, secure/native preferences.

#### Network Clients

Menjalankan API requests, auth refresh, retry policy, idempotency keys, stale cache logic, dan sync orchestration.

#### Telemetry Dispatcher

Menerapkan event schema, batching, privacy filtering, queueing, dan dispatch policy.

---

## Core Simulation Architecture

Core simulation adalah jantung game. Ia harus dibuat independen dari DOM, framework UI, dan plugin native.

### Core responsibilities

- representasi `RunState`
- graph traversal legality
- access rule evaluation
- evidence discovery and collection
- trap trigger and resolution
- trace progression and escalation
- objective state transitions
- mutator/modifier application
- score computation
- success/fail termination logic
- replay-compatible state transitions

### Core design style

Disarankan menggunakan pure functions dan immutable-friendly transition patterns untuk domain logic yang kritis. Bila ada kebutuhan performa sehingga state mutable dipakai di internal runtime, boundary API tetap harus eksplisit dan dapat diuji dengan hasil yang reproducible.

### Recommended simulation structure

- `entities`: node, link, evidence, trap, operator, objective, modifier
- `state`: run state, node runtime state, trace state, session flags, score breakdown
- `rules`: access evaluators, trigger resolvers, reward conditions, fail conditions
- `systems`: traversal system, evidence system, trap system, trace system, objective system, scoring system
- `orchestrators`: action executor, event resolver, turn/tick resolver bila ada time-based mechanics
- `serializers`: save/checkpoint, replay packaging, debug snapshots

### Simulation boundary contract

Simulation menerima:

- content definitions yang tervalidasi
- current run state
- player action intent
- deterministic config/seed
- active modifiers

Simulation mengembalikan:

- action result status
- new run state
- emitted gameplay events
- UI feedback hints
- telemetry hints
- replay delta data

---

## State Model

### State categories

#### Persistent account state

Disimpan server-side dan dipakai lintas session:

- profile
- progression
- inventory
- currencies
- operator progress
- season progress
- unlocked content
- social relations
- moderation state

#### Semi-persistent local state

Disimpan device-side secara aman untuk UX:

- cached manifests
- display preferences
- language selection
- accessibility preferences
- tutorial completion local flags bila aman
- replay cache

#### Run session state

Berlaku hanya untuk satu mission run:

- current node and discovered map state
- evidence state
  n- trap state
- trace and alert tiers
- objective progress
- temporary statuses
- available action history
- score breakdown in-progress
- replay deltas

#### Ephemeral UI state

Tidak dianggap game truth:

- selected tab
- modal open state
- hovered/selected node equivalent state
- camera position
- tutorial prompt visibility
- animation states

### State authority map

| State Domain                 | Authority                  |
| ---------------------------- | -------------------------- |
| Render/UI state              | Client                     |
| Current local run transition | Client simulation          |
| Ranked result acceptance     | Server                     |
| Currency and rewards         | Server                     |
| Inventory changes            | Server                     |
| Live event config            | Server                     |
| Content definitions          | Controlled content service |
| Replay validation status     | Server                     |

---

## Content Architecture

## Content object families

Content system harus mengelola object berikut:

- stage definitions
- graph templates and reusable modules
- node definitions
- link definitions
- objective definitions
- access rule definitions
- evidence definitions
- trap definitions
- mini-game configs
- balance tables
- reward tables
- modifier definitions
- seasonal event configs
- localization resources

### Content packaging

Setiap content package idealnya berisi:

- `contentVersion`
- schema version metadata
- definitions bundle
- string resources
- asset references
- validation report snapshot
- difficulty rating metadata
- release channel metadata

### Content loading strategy

- catalog dan metadata ringan dapat diambil saat startup atau home refresh
- stage package detail dapat di-prefetch saat mission dipilih
- package aktif harus dipin ke version tertentu untuk seluruh run
- cached content dapat dipakai untuk offline-compatible mode jika policy mengizinkan
- content invalid atau tidak kompatibel harus ditolak sebelum run dimulai

### Content validation pipeline

Sebelum content layak rilis, pipeline wajib memeriksa:

- schema validity
- structural integrity
- reference validity
- graph solvability
- fairness checks
- difficulty score band
- ranked eligibility rules
- unsupported asset or localization gaps

---

## Network and Backend Architecture

Backend dibangun sebagai sekumpulan service dengan authority yang jelas. Tidak semua harus microservice dari hari pertama, tetapi domain boundaries harus sudah dipisahkan sejak desain awal.

### Recommended service domains

#### Identity Service

Menangani login, session, account linking, token refresh, device/session governance.

#### Profile Service

Menyimpan player profile, settings summary, progression overview, unlocked features.

#### Inventory and Economy Service

Mengelola item, operator ownership, currencies, rewards, grants, sinks, receipts, and entitlement checks.

#### Content Service

Menyediakan catalog, manifests, stage packages, version pinning, featured content, creator publication states.

#### Progression Service

Menghitung XP, mastery, chapter clear, mission stars, season track, and reputation updates.

#### Replay Service

Menyimpan manifests, replay blobs, ghost packages, compatibility metadata.

#### Leaderboard / Competitive Service

Menangani boards, ranked seasons, challenge seeds, fraud review queues, and correction tools.

#### Social Service

Menangani friends, blocks, clans, shared builds, social metadata.

#### LiveOps Service

Menangani remote config, feature flags, event windows, store rotations, offers, experiment buckets.

#### Moderation / Trust Service

Menangani reports, publish review, sanctions, abuse review, creator actions.

#### Telemetry Ingestion Service

Menerima telemetry event, schema validation, routing to analytics storage.

### Communication style

- request/response untuk interactive user flows
- async queues/jobs untuk heavy validation, replay processing, moderation scans, seasonal aggregation, leaderboard recomputation
- signed payloads untuk sensitive submission flows

---

## Capacitor / Platform Integration Architecture

### Platform abstraction layer

Semua integrasi native harus ditempatkan di layer platform adapter. UI atau game core tidak boleh tahu detail plugin secara langsung.

Contoh adapter domains:

- `AppLifecycleAdapter`
- `NetworkStatusAdapter`
- `PushNotificationsAdapter`
- `HapticsAdapter`
- `DeepLinkAdapter`
- `FilesystemAdapter`
- `SecureStorageAdapter`
- `DeviceInfoAdapter`
- `ReviewPromptAdapter`
- `ShareAdapter`

### Lifecycle strategy

Mobile lifecycle dianggap normal. Karena itu arsitektur client harus mendukung:

- pause/resume hooks
- save checkpoint pada safe moment
- pending network flush handling
- session interruption markers
- content/cache revalidation on resume bila diperlukan
- timer reconciliation saat app kembali foreground

### Offline strategy

Tidak semua mode harus playable offline, tetapi arsitektur perlu mendukung:

- browse sebagian content cache
- membuka profile snapshot terbaru yang aman
- menampilkan offline UI states yang jelas
- menahan submission yang aman untuk retry nanti bila policy mengizinkan
- tidak membuat data sensitif bergantung pada client-only settlement

---

## LiveOps Architecture

LiveOps bukan lapisan tempelan. Ia harus menjadi domain formal.

### LiveOps responsibilities

- remote config fetch and cache
- feature flag gating
- event scheduling
- challenge seed publication
- store and offer rotation
- seasonal progression configuration
- balance overrides
- emergency disables

### LiveOps safety model

Setiap config harus:

- versioned
- schema-validated
- memiliki default fallback
- memiliki publish/rollback workflow
- mendukung partial rollout bila perlu

### Client interaction with liveops

Client membaca config yang sudah tervalidasi, bukan menafsirkan blob bebas. Application layer harus mampu menangani config stale, invalid, atau unavailable dengan fallback behavior yang aman.

---

## Replay Architecture

Replay adalah sistem inti untuk debugging, social comparison, ghost challenges, dan ranked audit.

### Replay modes

#### Action replay

Paling ideal jika simulation deterministic. Replay menyimpan seed, action timeline, dan initial state/package.

#### State snapshot replay

Fallback untuk versi tertentu atau mode yang tidak sepenuhnya deterministic. Lebih berat, tetapi meningkatkan compatibility dan recovery.

### Replay architecture requirements

- pin ke stage/content version
- include engine compatibility metadata
- hash or signature for trust-sensitive flows
- partial streaming support jika ukuran besar
- viewer terpisah dari live runtime session
- graceful failure bila replay incompatible

---

## Ranked / Competitive Architecture

Ranked mode memerlukan treatment berbeda dari casual mode.

### Ranked principles

- rule set authoritative
- stage/challenge seed authoritative
- loadout restrictions authoritative
- submission validation authoritative
- scoreboard correction possible
- suspicious outcomes observable

### Ranked flow

1. Client request challenge metadata.
2. Server memberi ranked config dan seed package.
3. Run dilakukan dengan deterministic constraints.
4. Result summary dan proof payload dikirim.
5. Server memverifikasi legality, consistency, and trust signals.
6. Jika valid, leaderboard diperbarui.
7. Jika tidak valid atau mencurigakan, run masuk review/anomaly pipeline.

---

## Telemetry and Analytics Architecture

Telemetry dibangun sebagai subsistem formal, bukan sekadar event logging acak.

### Client telemetry responsibilities

- emit gameplay events
- enforce event contracts
- buffer queue bila jaringan buruk
- batch and flush responsibly
- drop or redact unsafe payloads
- tag events dengan app version, content version, session/run metadata yang sesuai

### Backend telemetry responsibilities

- validate schemas
- reject malformed events
- route to analytics storage
- generate anomaly signals
- support dashboards and experiments

### Mandatory analytics domains

- onboarding funnels
- mission start/fail/complete
- difficulty pain points
- trap and trace pressure hotspots
- economy flow
- event participation
- replay and social engagement
- crash/error correlation

---

## Security and Trust Architecture

### Trust boundaries

Client dianggap berpotensi dimodifikasi. Maka boundary berikut harus jelas:

- client boleh mengusulkan result, bukan memutuskan final settlement
- commerce receipt harus diverifikasi server-side
- moderation state tidak boleh source-of-truth di client
- ranked placement hanya berubah setelah server accept
- creator publication state ditentukan moderation/publishing service

### Core protection strategies

- signed auth/session tokens
- idempotency keys pada mutation sensitif
- submission proof metadata
- anomaly scoring untuk impossible rates or actions
- replay verification hooks
- auditable admin actions
- sanitized user-generated text/content

---

## Persistence Architecture

### Local persistence

Gunakan local persistence untuk:

- cached content manifests
- local settings/preferences
- safe resumable run checkpoints
- telemetry queue
- replay cache non-sensitive

Local persistence **tidak** boleh menjadi authority untuk reward settlement, currency truth, entitlements, atau ranked acceptance.

### Server persistence

Server-side persistence minimal memisahkan:

- profile store
- inventory/economy store
- progression store
- content store / manifests
- social graph store
- leaderboard store
- replay object storage
- moderation case store
- telemetry data lake/warehouse

---

## Deployment Architecture

### Environment model

Minimal sediakan environment:

- local development
- integration
- QA / staging
- pre-production
- production

### Release model

- mobile app releases via platform pipelines
- backend services via rolling/canary or blue-green sesuai criticality
- content releases via versioned publish flow
- liveops changes via config rollout with rollback

### Compatibility model

- client version compatibility matrix harus jelas
- content harus tahu minimum supported client/engine version
- replay viewer harus memeriksa compatibility sebelum playback

---

## Observability Architecture

### Observability pillars

- metrics
- logs
- traces
- crash reporting
- alerting
- release health dashboards

### Must-observe areas

- auth failure spikes
- mission start vs completion drop-offs
- reward grant failures
- liveops config fetch failures
- replay upload failures
- ranked submission anomalies
- moderation queue growth
- content validation rejection rates

---

## Recommended Architectural Boundaries by Directory

Struktur ini bukan final repo tree, tetapi boundary domain yang direkomendasikan:

- `app/` untuk bootstrap dan composition
- `ui/` untuk presentation
- `game/` untuk simulation core
- `content/` untuk schemas and loaders
- `meta/` untuk progression/inventory/economy
- `network/` untuk API and sync
- `platform/` untuk Capacitor/native adapters
- `liveops/` untuk remote config and feature flags
- `telemetry/` untuk event contracts and dispatch
- `social/` untuk friends/clan/leaderboard metadata
- `replay/` untuk manifests, viewer, packaging logic
- `trust/` untuk anti-tamper and integrity helpers
- `tests/` untuk unit/integration/simulation/platform tests

Dokumen struktur repo yang lebih detail sebaiknya ditulis terpisah di `FOLDER-STRUCTURE.md`.

---

## Design Constraints

Arsitektur ini harus menjaga constraint berikut:

- game harus tetap nyaman dan jelas di layar mobile
- simulation core tidak bergantung pada framework rendering
- plugin native tidak boleh bocor ke seluruh codebase
- content harus tervalidasi sebelum dianggap runnable
- ranked and economy domains harus terlindungi dari client trust berlebihan
- app harus robust terhadap pause/resume dan jaringan buruk
- telemetry dan liveops harus menjadi kemampuan bawaan, bukan tambahan belakangan

---

## Suggested Implementation Order

1. bangun core simulation dan schema contracts
2. bangun client app shell dan platform abstraction layer untuk Capacitor
3. bangun content loader, cache, dan validation hooks
4. bangun profile/inventory/progression API integration
5. bangun mission flow end-to-end
6. bangun telemetry, replay, dan ranked validation hooks
7. bangun liveops, events, store, dan seasonal control
8. bangun social, moderation, creator pipeline, dan advanced trust systems

---

## Final Architectural Decision Summary

Untuk project ini, keputusan arsitektur utama adalah sebagai berikut:

- produk diperlakukan sebagai **mobile-first game**
- deployment shell menggunakan **Capacitor**
- gameplay core harus **deterministic** dan **UI-agnostic**
- content harus **schema-driven** dan **validator-compatible**
- backend harus **authoritative** untuk domain sensitif
- liveops, telemetry, replay, ranked integrity, dan moderation adalah **bagian inti product**, bukan add-on
- seluruh integrasi native harus melalui **platform abstraction layer**

Dokumen ini menjadi baseline untuk keputusan teknis detail berikutnya di `TECH-STACK.md` dan baseline organisasi kode di `FOLDER-STRUCTURE.md`.
