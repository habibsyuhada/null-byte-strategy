# Full Production Documentation — Graph Investigation Game

Status: Draft v1.0  
Target: Production-ready full feature release  
Language: Indonesian with technical terms in English  
Audience: Product, Game Design, Engineering, Backend, Data, QA, LiveOps, DevOps, Security, Publishing

---

## 1. Executive Summary

Dokumen ini mendefinisikan versi **full production** dari game investigasi berbasis graph yang sebelumnya hanya dibatasi pada MVP. Fokus dokumen ini bukan validasi MVP lagi, tetapi **paket implementasi penuh** yang siap dipakai sebagai fondasi production build, content pipeline, backend services, live operations, social systems, telemetry, commerce, dan long-term scalability.

Game inti tetap mempertahankan pilar utama: pemain menavigasi stage berbasis node-link graph, mengumpulkan evidence, membuka access rule, mengelola trace, menghindari trap, dan menyelesaikan objective melalui investigasi sistematis. Perluasan menuju full production menambahkan fitur seperti account platform, cloud save, social features, full replay, content publishing workflow, seasonal operations, economy, progression, asynchronous competition, ranked challenge, moderation, anti-cheat, dan observability.

Dokumen ini sengaja ditulis dengan tingkat detail yang cukup untuk dipakai sebagai dasar technical specification, backlog decomposition, service contract, data schema, dan QA acceptance baseline.

---

## 2. Product Vision

### 2.1 Vision Statement

Membangun game investigasi strategis berbasis jaringan yang menawarkan kombinasi antara puzzle deduction, route planning, resource pressure, dan discovery loop, dengan sistem yang cukup dalam untuk mendukung single-player curated campaign, user-generated content, live seasonal events, dan competitive challenge ecosystem.

### 2.2 Product Pillars

1. **Readable Depth** — sistem terlihat sederhana di permukaan tetapi memiliki kombinasi keputusan yang dalam.
2. **Deterministic Fairness** — hasil run harus dapat dijelaskan oleh rule system, bukan noise acak yang tidak terbaca.
3. **Authoring at Scale** — stage dan content dapat dibuat, divalidasi, diuji, dan dipublikasikan oleh tim internal maupun creator terpercaya.
4. **Retention Through Mastery** — pemain kembali karena ingin mengoptimalkan route, menyempurnakan build, dan menaklukkan challenge baru.
5. **Production Operability** — seluruh sistem dapat dimonitor, di-balance, di-live-tune, dan di-moderasi.

### 2.3 Release Intent

Versi production penuh harus siap untuk:

- PC launch
- mobile adaptation pathway
- live operations minimal 12 bulan
- cross-account persistence
- event cadence mingguan/bulanan
- creator pipeline bertahap
- expandable content architecture

---

## 3. Scope Definition — Full Feature Release

### 3.1 Included Scope

#### Core Gameplay

- Curated campaign multi-chapter
- Standalone contract missions
- challenge stages
- graph-based infiltration/investigation loop
- node roles lengkap: entry, relay, proxy, server, vault, decoy, monitor, archive, control, event, exit, boss
- link roles lengkap: normal, encrypted, timed, monitored, unstable, one-way, hidden, conditional
- access rules multi-condition
- evidence system lengkap termasuk false evidence, chained evidence, decaying evidence, protected evidence
- trap system bertingkat dengan trigger rule, severity, counters, lingering effects
- trace system lengkap dengan local trace, global trace, escalation state, cooldown, lockdown
- mini-games multi-type dengan difficulty scaling
- operator/tool/loadout system
- passive and active abilities
- full scoring, mastery, and post-run grading

#### Meta Progression

- player account profile
- persistent progression tree
- unlockable operators
- tool crafting and upgrading
- cosmetics
- collection log / codex
- account level, faction reputation, mastery tracks
- daily/weekly goals
- seasonal progression pass

#### Content Systems

- internal content editor data contracts
- stage templating
- reusable graph modules
- validation pipeline
- difficulty scoring and calibration
- localization-ready text resources
- content versioning and rollback
- creator submission workflow
- moderation and review queue for published stages

#### Online / Social / Competitive

- authentication
- cloud save
- leaderboard
- asynchronous ghost/replay challenge
- ranked weekly contracts
- friend system
- team/clan system
- shareable builds and loadouts
- spectatable replay package
- event-based community goals

#### LiveOps / Monetization / Commerce

- remote config
- A/B experimentation hooks
- event scheduler
- featured content rotation
- cosmetic store
- premium season pass
- soft currency, hard currency, event currency
- entitlement validation
- offer targeting

#### Platform and Reliability

- telemetry pipeline
- moderation tools
- anti-cheat baseline
- crash reporting
- feature flags
- observability dashboards
- customer support tooling hooks
- GDPR/PDPA-style data export and deletion workflow

### 3.2 Explicit Non-Goals for v1 Production

- real-time synchronous esports gameplay sebagai core launch dependency
- fully open public scripting/modding runtime di client
- blockchain/NFT features
- unrestricted player-hosted servers
- generative content publishing tanpa moderation gate

---

## 4. Player Experience Model

### 4.1 Primary Loop

1. Pilih mission, stage, contract, atau event.
2. Susun operator, tool, dan modifiers.
3. Masuk ke stage graph.
4. Eksplor node, baca state, buka jalur, kumpulkan evidence.
5. Kelola trace dan trap pressure.
6. Selesaikan objective utama dan objective sekunder.
7. Exit atau extract.
8. Dapatkan reward, replay, analytics feedback, dan progression gains.

### 4.2 Secondary Loop

- build experimentation
- score chasing
- stage mastery
- leaderboard climbing
- operator progression
- collection completion
- event participation
- social comparison dan replay sharing

### 4.3 Long-Term Loop

- seasonal resets pada ladder tertentu
- content rotation
- new stage packs
- creator ecosystem expansion
- meta build evolution melalui balance patches

---

## 5. Game Modes

### 5.1 Curated Campaign

Campaign berisi chapter linear dan semi-linear dengan progression gate, tutorialization bertahap, boss mechanics, dan narrative unlock. Campaign menjadi onboarding utama untuk seluruh sistem kompleks.

### 5.2 Contracts Mode

Mission pendek hingga menengah dengan objective jelas, difficulty tier, mutator opsional, leaderboard, dan rating.

### 5.3 Endless Network Mode

Stage procedural-hybrid dengan modul graph tervalidasi. Pemain bertahan sejauh mungkin sambil trace pressure meningkat. Mode ini berfungsi sebagai retention dan analytics sandbox.

### 5.4 Ranked Challenge Mode

Setiap minggu sistem menerbitkan challenge seed yang sama untuk semua pemain. Semua parameter run diseragamkan. Hasil diukur via score, completion time, stealth quality, dan optional risk bonus.

### 5.5 Replay Duel / Ghost Mode

Pemain dapat menantang replay orang lain secara asynchronous. Sistem memutar action package atau state snapshots sebagai ghost benchmark.

### 5.6 User-Created Stage Browser

Tahap penuh production memperbolehkan creator terkurasi membuat dan mempublikasikan stage melalui pipeline review, validator, dan moderation gate.

---

## 6. High-Level Architecture

## 6.1 Architecture Principles

- deterministic core simulation
- content-driven logic
- server-authoritative untuk progression, economy, ranked result, dan entitlements
- client-predictive untuk UX non-sensitive
- schema-versioned data contracts
- observability-first development

### 6.2 Logical Layers

| Layer              | Responsibility                                                 |
| ------------------ | -------------------------------------------------------------- |
| Presentation       | UI, FX, accessibility, device input, replay viewer             |
| Runtime Simulation | run state, node traversal, trace, traps, evidence, scoring     |
| Content Layer      | stage definition, templates, localization, balance tables      |
| Validation Layer   | structural, solvability, fairness, exploit, performance checks |
| Meta Layer         | progression, inventory, rewards, profile, economy              |
| Network Layer      | auth, save sync, leaderboard, matchmaking, content fetch       |
| LiveOps Layer      | remote config, experiments, event scheduling, offers           |
| Analytics Layer    | telemetry ingestion, dashboards, anomaly detection             |
| Moderation & Trust | reports, creator review, anti-cheat, sanctions                 |

### 6.3 Service Topology

| Service                 | Responsibility                                           |
| ----------------------- | -------------------------------------------------------- |
| API Gateway             | auth gateway, routing, throttling, device/session policy |
| Identity Service        | account, session, link platform IDs                      |
| Profile Service         | player profile, settings, progression summary            |
| Inventory Service       | operators, tools, cosmetics, currencies                  |
| Progression Service     | XP, mastery, unlock tree, mission completion             |
| Stage Content Service   | stage catalog, content delivery, version pinning         |
| Validation Service      | offline/online validator execution, creator pre-check    |
| Replay Service          | replay storage, retrieval, ghost packaging               |
| Leaderboard Service     | ranked results, anti-fraud checks, season snapshots      |
| Social Service          | friends, clan, invites, shared builds                    |
| Match/Challenge Service | ranked challenge seeds, event challenge configs          |
| LiveOps Service         | remote config, event windows, featured rotations         |
| Commerce Service        | offers, receipts, entitlements, currency grants          |
| Moderation Service      | reports, creator content review, abuse actions           |
| Telemetry Ingest        | event intake, schema validation, stream routing          |
| Support/Admin Service   | GM tools, restore flows, manual grants, audits           |

### 6.4 Client Composition

- game shell
- account shell
- content cache
- runtime engine
- replay viewer
- storefront shell
- social shell
- diagnostics panel for internal builds

---

## 7. Full Feature Domain Model

### 7.1 Core Content Objects

#### StageDefinition

```json
{
  "stageId": "stg_enterprise_001",
  "version": 12,
  "contentVersion": "1.12.0",
  "modeTags": ["campaign", "rankedEligible"],
  "graph": {},
  "objectives": [],
  "difficulty": {},
  "rewards": {},
  "authoring": {},
  "publication": {}
}
```

#### NodeDefinition

```json
{
  "nodeId": "n_archive_03",
  "role": "archive",
  "securityTier": 3,
  "visibility": "discovered",
  "accessRules": ["rule_keycard_or_bypass"],
  "evidenceSlots": ["ev_casefile_a"],
  "trapRefs": ["trap_trace_spike_a"],
  "modifiers": ["archive_bonus_intel"],
  "ui": {
    "labelKey": "node.archive.03",
    "icon": "archive"
  }
}
```

#### LinkDefinition

```json
{
  "linkId": "l_proxy_to_vault",
  "fromNodeId": "n_proxy_02",
  "toNodeId": "n_vault_01",
  "type": "encrypted",
  "direction": "bidirectional",
  "cost": 2,
  "visibility": "hiddenUntilScanned",
  "accessRules": ["rule_decrypt_and_clear_monitor"]
}
```

#### AccessRuleDefinition

```json
{
  "ruleId": "rule_decrypt_and_clear_monitor",
  "logic": "allOf",
  "conditions": [
    { "type": "toolEquipped", "toolId": "decryptor_mk2" },
    { "type": "nodeState", "nodeId": "n_monitor_01", "expected": "disabled" }
  ],
  "failureFeedbackKey": "rule.decrypt.monitor_required"
}
```

#### EvidenceDefinition

```json
{
  "evidenceId": "ev_casefile_a",
  "type": "primary",
  "truthState": "true",
  "collectionMethod": "scan",
  "value": 4,
  "tags": ["finance", "targetA"],
  "decayTurns": 0,
  "reveals": ["rule_target_identity"],
  "conflictsWith": ["ev_false_casefile_a"]
}
```

#### TrapDefinition

```json
{
  "trapId": "trap_trace_spike_a",
  "trigger": "onCollectEvidence",
  "severity": 2,
  "effects": [
    { "type": "traceDelta", "value": 18 },
    { "type": "status", "statusId": "scanner_noise", "duration": 2 }
  ],
  "counterplay": ["jammer_basic", "trapSense_passive"]
}
```

#### MiniGameConfig

```json
{
  "miniGameId": "mg_cipher_grid",
  "category": "decode",
  "difficultyTier": 3,
  "timeLimitSec": 35,
  "attemptPolicy": "limited",
  "successEffects": [{ "type": "unlockRule", "ruleId": "rule_vault_open" }],
  "failureEffects": [{ "type": "traceDelta", "value": 10 }]
}
```

### 7.2 Runtime Objects

#### RunState

Menyimpan state live selama satu run, termasuk:

- runId
- player snapshot
- selected loadout
- stage version pin
- visited nodes
- active statuses
- trace values
- discovered evidence
- objective progress
- score breakdown
- RNG seed bila mode mengizinkan randomness terkontrol
- anti-tamper hash checkpoints

#### NodeRuntimeState

- current visibility
- current control state
- temporary modifiers
- pending trap status
- evidence collected flags
- override access state

#### GlobalRunState

- current phase
- lockdown tier
- alert escalation
- extraction availability
- timer state
- mutators
- mission-wide modifiers

### 7.3 Meta Objects

- PlayerProfile
- AccountSettings
- InventoryItem
- OperatorDefinition
- OperatorProgression
- ToolDefinition
- CosmeticItem
- CurrencyWallet
- QuestDefinition
- SeasonDefinition
- ClanDefinition
- FriendRelation
- ReplayManifest
- PublishedStageListing
- ModerationCase

---

## 8. Data Persistence Design

### 8.1 Storage Strategy

| Data Type              | Store                                       |
| ---------------------- | ------------------------------------------- |
| Player profile         | relational DB                               |
| inventory and currency | relational DB with strong consistency       |
| stage definitions      | document store + CDN cache                  |
| telemetry raw events   | stream + data lake                          |
| leaderboards           | fast key-value / ranked store               |
| replay packages        | object storage                              |
| social graph           | graph-friendly or relational with indexing  |
| moderation assets      | object storage + case DB                    |
| live config            | remote config service with signed snapshots |

### 8.2 Versioning Rules

- semua schema memiliki `schemaVersion`
- semua content memiliki `contentVersion`
- semua replays memiliki `engineCompatVersion`
- server harus mendukung backward compatibility minimal 2 minor versions untuk content fetch dan replay metadata
- breaking change memerlukan migrator atau new namespace

### 8.3 Save Model

- server-authoritative profile
- partial local cache untuk UX offline read-only
- transactional reward claim
- conflict resolution berbasis server timestamp dan logical version
- hard ban pada client-side currency authority

---

## 9. Gameplay Systems Specification

## 9.1 Graph Navigation

Traversal terjadi antar node melalui link yang valid. Validasi link memeriksa direction, access rule, temporary blocker, trace-induced lockdown, dan modifier lain. Hidden link hanya muncul bila discovery rule terpenuhi.

### 9.2 Access Rule Evaluation

Rule engine harus mendukung:

- `allOf`
- `anyOf`
- `not`
- count threshold
- possession checks
- status checks
- node state checks
- evidence checks
- operator trait checks
- event flag checks
- timer window checks

Evaluasi rule harus deterministic dan side-effect free. Rule yang gagal harus menghasilkan failure reason yang dapat diterjemahkan ke UI.

### 9.3 Evidence System

Evidence memiliki kategori berikut:

- primary
- secondary
- false
- corroborating
- decoy
- hidden chain evidence
- consumable evidence
- time-sensitive evidence

Evidence dapat:

- membuka objective baru
- mengubah truth confidence
- menurunkan atau menaikkan score
- membuka hidden node/link
- men-trigger trap
- mempengaruhi branching narrative

### 9.4 Trap System

Trap dibagi menjadi:

- trace spike
- route seal
- evidence corruption
- fog of war reset
- forced mini-game
- timed alert
- decoy injection
- tool disable
- operator debuff

Setiap trap wajib mendefinisikan:

- trigger timing
- severity
- detection chance
- telegraph rules
- counterplay rules
- stacking policy
- cleanse policy

### 9.5 Trace and Alert System

Trace adalah pressure resource utama.

Komponen trace:

- local trace: pressure pada area atau subnet tertentu
- global trace: pressure seluruh stage
- escalation tier: state diskrit yang memicu rule global
- lockdown threshold: ambang yang menutup akses tertentu
- recovery interval: kesempatan menurunkan trace

Contoh escalation tier:

- Tier 0: normal
- Tier 1: suspicious
- Tier 2: active monitoring
- Tier 3: lockdown prep
- Tier 4: hard lockdown
- Tier 5: mission collapse

### 9.6 Mini-Game Framework

Mini-game adalah plugin content-driven. Setiap mini-game harus punya:

- input contract
- timer policy
- retry policy
- success/fail effect contract
- accessibility alternative mode
- anti-exploit safeguards

### 9.7 Operator and Loadout System

Operator membawa:

- base stats
- trait tags
- passive abilities
- active ability charges
- synergy tags
- progression tracks
- cosmetic slots

Loadout terdiri dari:

- primary operator
- optional support operator
- tool slots
- consumable slots
- mission modifier slots

### 9.8 Scoring System

Score breakdown minimal meliputi:

- objective completion
- optional objective completion
- stealth quality
- trace efficiency
- evidence quality
- trap avoidance
- route efficiency
- time performance
- difficulty bonus
- mutator bonus
- penalty bucket

---

## 10. Progression, Economy, and Rewards

### 10.1 Currencies

- soft currency
- hard currency
- event currency
- crafting material
- operator XP
- mastery tokens

### 10.2 Reward Sources

- mission completion
- first clear
- mastery milestones
- daily and weekly quests
- season track
- event milestones
- creator revenue share pool bila program creator diaktifkan

### 10.3 Progression Tracks

- account level
- operator level
- operator mastery
- tool tech tree
- faction reputation
- season pass track
- ranked seasonal standing reward

### 10.4 Economy Safeguards

- all grants idempotent
- no client-trusted grant claims
- receipt verification mandatory
- anomaly detector untuk abnormal earning rate
- admin grants fully audited

---

## 11. Social, Replay, and Competitive Systems

### 11.1 Friends and Clan

- friend request, block, mute
- clan roles: owner, officer, member
- clan activity feed
- clan challenges
- clan milestone rewards

### 11.2 Replay System

Replay harus mendukung dua mode:

- **action replay** untuk mode deterministic
- **state snapshot replay** untuk compatibility fallback

Replay package minimal berisi:

- manifest
- engine version
- stage content version
- seed / deterministic params
- input/action timeline
- derived score summary
- fraud verification signature

### 11.3 Ranked Integrity

- ranked seed dibagikan server-side
- build restrictions didefinisikan server-side
- result submission ditandatangani session token
- suspicious runs masuk audit queue
- leaderboard correction support wajib tersedia

---

## 12. Content Authoring Pipeline

### 12.1 Authoring Stages

1. concept
2. whitebox graph
3. objective wiring
4. rule and evidence pass
5. trap pass
6. difficulty analysis
7. validator pass
8. QA playtest pass
9. localization pass
10. publication review
11. rollout

### 12.2 Content Packaging

Setiap paket content terdiri dari:

- definitions
- localized strings
- icon references
- audio cue references
- balance metadata
- validation report snapshot
- changelog metadata

### 12.3 Creator Program Workflow

- creator submits content draft
- automated validator checks structure, solvability, fairness, exploit patterns
- human moderation review
- limited beta exposure
- publish to browser
- post-publish telemetry monitoring
- takedown / rollback path

---

## 13. Validation Framework

### 13.1 Validation Categories

| Category       | Purpose                                                 |
| -------------- | ------------------------------------------------------- |
| Structural     | valid nodes, links, references, no orphan critical path |
| Solvability    | stage can be completed under valid conditions           |
| Fairness       | no unavoidable fail without telegraph or counterplay    |
| Balance        | difficulty and reward within target band                |
| Performance    | graph size, memory budget, traversal cost               |
| UX Readability | signal clarity, discoverability, feedback availability  |
| Security       | no malicious payload, no unsupported references         |

### 13.2 Required Validation Rules

- every critical objective has at least one solvable route
- no mandatory evidence locked behind impossible rule cycle
- trace escalation curve must remain within target bounds
- trap chain cannot create unavoidable fail state before minimum reaction window
- reward budget must match difficulty bracket
- hidden content cannot contain mandatory unknown prerequisite without discoverable clue
- ranked-eligible stages disallow non-deterministic uncontrolled randomness

### 13.3 Validation Output Contract

```json
{
  "stageId": "stg_enterprise_001",
  "contentVersion": "1.12.0",
  "status": "warning",
  "scores": {
    "difficulty": 74,
    "fairness": 81,
    "clarity": 68
  },
  "issues": [
    {
      "severity": "medium",
      "code": "FAIRNESS_REACTION_WINDOW_LOW",
      "message": "Trap chain around vault leaves less than recommended response window"
    }
  ]
}
```

---

## 14. Difficulty Model

### 14.1 Scoring Components

- path complexity
- rule dependency depth
- evidence ambiguity
- trap pressure
- trace pressure curve
- mini-game intensity
- cognitive branching load
- punishment severity
- recovery availability
- time pressure

### 14.2 Use Cases

Difficulty score dipakai untuk:

- authoring target band
- matchmaking/challenge bucket
- reward banding
- recommendation engine
- player skill progression mapping

### 14.3 Calibration Strategy

- internal benchmark set
- closed beta telemetry sample
- percentiles per skill cohort
- manual override with audit note

---

## 15. Backend API Surface

### 15.1 Public Client APIs

- `POST /auth/login`
- `POST /auth/refresh`
- `GET /profile`
- `GET /inventory`
- `GET /content/catalog`
- `GET /content/stages/{stageId}`
- `POST /run/start`
- `POST /run/complete`
- `POST /replay/upload`
- `GET /replay/{replayId}`
- `GET /leaderboard/{boardId}`
- `POST /social/friends/request`
- `POST /clan/create`
- `GET /liveops/config`
- `POST /commerce/receipt/verify`

### 15.2 Admin / Internal APIs

- content publication
- moderation decisions
- rollback deployment
- reward grants
- player audit lookup
- leaderboard correction
- feature flag override

### 15.3 Contract Rules

- all requests authenticated except public catalog teaser
- pagination cursor-based
- rate limiting by user and device
- idempotency keys for grant/reward mutation
- all error responses machine-readable

---

## 16. Telemetry and Analytics

### 16.1 Telemetry Principles

- event schema versioned
- low-cardinality discipline for dimensions
- privacy review before release
- deterministic session identifiers
- sensitive payload redaction

### 16.2 Core Events

- session_start
- session_end
- mission_select
- run_start
- node_enter
- rule_fail
- evidence_collect
- false_evidence_collect
- trap_trigger
- trace_tier_change
- objective_complete
- mini_game_start
- mini_game_end
- run_fail
- run_complete
- reward_claim
- replay_watch
- store_view
- purchase_complete
- social_invite_sent
- report_submitted

### 16.3 Example Event Contract

```json
{
  "eventName": "trap_trigger",
  "eventVersion": 1,
  "userId": "u_123",
  "sessionId": "sess_abc",
  "runId": "run_xyz",
  "stageId": "stg_enterprise_001",
  "trapId": "trap_trace_spike_a",
  "traceBefore": 42,
  "traceAfter": 60,
  "operatorId": "op_ghostfox",
  "timestamp": "2026-06-24T08:00:00Z"
}
```

### 16.4 Analytics Use Cases

- churn correlation
- difficulty pain point analysis
- exploit detection
- creator content quality ranking
- economy sink/source balancing
- event performance tracking

---

## 17. LiveOps and Seasonal Operations

### 17.1 LiveOps Capabilities

- feature flags
- remote balance tables
- event schedules
- reward overrides
- store rotation
- challenge seed publishing
- creator spotlight rotation

### 17.2 Seasonal Model

Setiap season memiliki:

- seasonal theme
- mission pack
- ranked ladder reset
- season pass track
- event currency
- limited cosmetics
- seasonal story beat

### 17.3 Operational Safeguards

- dry run environment untuk event config
- publish approval workflow
- instant rollback
- regional rollout support
- blackout window protection

---

## 18. Security, Trust, and Anti-Cheat

### 18.1 Threat Model

- tampered clients
- forged rewards
- replay fraud
- leaderboard manipulation
- automation/botting
- creator content abuse
- commerce receipt spoofing
- telemetry poisoning

### 18.2 Mandatory Controls

- signed session tokens
- server-side reward authority
- ranked result verification
- anti-tamper checkpoints in run package
- anomaly scoring on impossible metrics
- device reputation signals where legally permitted
- moderation audit log immutable storage

### 18.3 Replay Trust Model

Replay diterima hanya bila:

- content version valid
- engine version compatible
- signature valid
- score recomputation within tolerance
- no illegal action sequence

---

## 19. Moderation and Community Safety

### 19.1 Moderation Scope

- stage name/description moderation
- creator avatar/banner moderation
- chat or messaging moderation jika fitur chat diaktifkan
- abuse reports
- leaderboard name compliance

### 19.2 Enforcement Ladder

- warning
- content unlist
- temporary publish suspension
- ranked suspension
- account mute
- account ban

### 19.3 Creator Safety Policy

Creator content yang dipublish harus lulus:

- automated structural validation
- prohibited content scan
- manual review sample atau full review sesuai risk tier
- post-launch telemetry watchlist

---

## 20. Accessibility and UX Requirements

### 20.1 Accessibility Baseline

- colorblind-safe node states
- scalable text
- icon redundancy untuk color signal
- subtitle and screen text clarity
- reduced motion option
- mini-game accessibility alternatives
- input remapping
- hold/toggle options

### 20.2 UX Readability Requirements

- setiap rule fail memberi alasan jelas
- setiap trap memiliki telegraph minimal sesuai severity
- trace progression selalu terlihat
- reward preview sebelum mission start
- post-run breakdown dapat dijelaskan

---

## 21. Localization and Content Internationalization

### 21.1 Localization Rules

- semua player-facing string via key
- no hardcoded text in stage definitions
- pluralization aware format
- fallback language mandatory
- culturally sensitive review for event content

### 21.2 Supported Content Classes

- UI strings
- narrative strings
- node labels
- trap descriptions
- system notifications
- store offers
- moderation notices

---

## 22. QA Strategy

### 22.1 Test Layers

- unit tests for rule evaluation
- simulation tests for run outcomes
- validator tests for content schemas
- contract tests for APIs
- replay determinism tests
- load tests for telemetry and leaderboard services
- soak tests for liveops config fetch
- end-to-end tests for purchase and reward grant

### 22.2 Mandatory QA Gates Before Release

- zero blocker in core progression
- zero economy exploit known open
- ranked integrity pass
- crash-free target achieved
- telemetry schema validation pass
- content validator pass for all launch stages

### 22.3 Golden Test Packs

Sediakan golden datasets untuk:

- simple stage
- multi-route stage
- heavy trap stage
- false evidence stage
- ranked deterministic stage
- creator content moderation edge case

---

## 23. Performance and Technical Budgets

### 23.1 Client Budgets

- mission load target < 5 sec on min spec target after cached content
- frame stability target per platform
- memory budget per stage category
- replay load target < 3 sec for standard package

### 23.2 Backend SLO Candidates

- auth p95 < 300 ms
- profile read p95 < 250 ms
- live config fetch p95 < 200 ms
- leaderboard read p95 < 250 ms
- reward grant success rate > 99.9%

### 23.3 Scalability Requirements

- season launch spike handling
- leaderboard fan-out read protection
- replay CDN distribution
- async processing for heavy moderation tasks

---

## 24. Deployment and Environment Strategy

### 24.1 Environments

- local dev
- integration
- QA/staging
- pre-production
- production

### 24.2 Release Strategy

- blue/green or canary for services kritikal
- version pinning for content and client compatibility
- staged rollout by region/platform
- rollback under 15 minutes for config-driven incidents

### 24.3 Observability Stack Requirements

- metrics
- logs
- traces
- alerting
- anomaly dashboards
- release health board

---

## 25. Recommended Delivery Order

### Phase A — Foundation

- runtime simulation core
- schema contracts
- validator v1
- content pipeline internal
- profile/inventory/progression services

### Phase B — Full Core Game

- campaign and contract modes
- operators, tools, replay, leaderboard
- telemetry and remote config
- store and entitlement framework

### Phase C — Production Online Layer

- social, clan, ranked, events
- moderation and creator workflow
- seasonal operations
- support tooling

### Phase D — Scale and Optimization

- creator browser
- advanced recommendations
- experimentation framework
- anti-cheat hardening

---

## 26. Definition of Done — Production Ready

Sebuah full production release dinyatakan siap bila memenuhi seluruh kriteria berikut:

- seluruh core modes launchable dan stable
- progression, economy, and commerce secure and audited
- content pipeline mendukung authoring, validation, publish, rollback
- telemetry dan dashboards usable oleh product dan ops
- ranked mode memiliki integrity safeguards
- moderation and support tooling aktif
- localization-ready content complete
- replay, leaderboard, and social systems functional
- operational runbook tersedia untuk incident, rollback, event launch, dan content takedown

---

## 27. Final Notes for Processing

Dokumen ini sengaja dibuat sebagai **master documentation**. Untuk eksekusi engineering, dokumen ini sebaiknya dipecah minimal menjadi paket berikut:

1. Product & Scope Document
2. Gameplay Systems Spec
3. Data Schema & Contracts
4. Backend Service Spec
5. Telemetry & Analytics Spec
6. LiveOps / Economy / Commerce Spec
7. Security / Moderation / Anti-Cheat Spec
8. QA / Validation / Release Readiness Spec

Jika diproses lebih lanjut, langkah berikut yang paling efisien adalah mengubah master doc ini menjadi kumpulan markdown per domain dan kemudian menurunkannya menjadi backlog epic, API contracts, database schema detail, dan implementation checklist.
