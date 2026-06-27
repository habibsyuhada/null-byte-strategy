# AGENTS.md

## Project Identity

Project ini adalah **production-ready full-feature mobile-first game** berbasis investigasi graph/network. Fondasi desain gameplay mencakup navigasi node-link graph, evidence collection, access rules, trace pressure, traps, mini-games, progression, replay, social systems, live operations, dan seasonal content.

Repository ini harus diperlakukan sebagai **mobile game project lebih dulu**, bukan sekadar web app yang nanti dibungkus ke mobile. Walaupun runtime utama menggunakan teknologi web, target platform utamanya adalah **Android dan iOS melalui Capacitor**.

Semua agent, contributor, dan automation yang bekerja di repo ini harus menganggap keputusan teknis, UX, performa, input, storage, networking, observability, dan release pipeline sebagai **mobile-first + production-first**.

---

## Primary Platform Direction

### Mandatory platform assumptions

- Target utama: **Android** dan **iOS**.
- Shell deployment: **Capacitor**.
- Web/PWA hanya bersifat secondary convenience target, bukan baseline arsitektur.
- Semua fitur inti harus tetap masuk akal pada layar sentuh, lifecycle mobile, intermittent network, thermal constraints, dan memory constraints perangkat mobile.
- Jangan membuat fitur yang bergantung pada kemampuan browser desktop-only sebagai asumsi default.

### What “Capacitor-first” means in practice

- Gunakan **Capacitor** untuk packaging, native bridge, platform builds, dan plugin access.
- Gunakan API native atau plugin Capacitor bila kebutuhan platform memang native-centric, misalnya app lifecycle, device info, haptics, keyboard, status bar, deep links, splash, filesystem, push notifications, dan secure/native preferences bila diperlukan.
- Hindari dependensi arsitektur yang hanya ideal untuk browser tab panjang tanpa interupsi. Mobile lifecycle harus dianggap normal: pause, resume, background, memory reclaim, cold launch, app restore.
- Semua flows harus aman terhadap app interruption di tengah run, connectivity drop, dan orientation/device state changes bila orientation support diaktifkan.

---

## Product and Architecture Intent

### Product intent

Game ini harus berkembang menjadi product yang mendukung:

- curated campaign
- contracts/challenge modes
- ranked asynchronous competitive layer
- replay/ghost systems
- progression and economy
- liveops and seasonal content
- creator pipeline bertahap
- moderation, telemetry, anti-cheat, observability

### Architecture intent

Arsitektur harus dipisah jelas antara:

- **presentation/UI layer**
- **core gameplay simulation layer**
- **content/data definition layer**
- **meta progression and economy layer**
- **network/backend integration layer**
- **platform integration layer**
- **analytics/liveops/trust layer**

Core gameplay logic harus **deterministic** sejauh mungkin dan tidak tertanam langsung ke UI. UI adalah consumer dari state, bukan sumber kebenaran game rule.

---

## Non-Negotiable Engineering Principles

### 1. Mobile-first

Semua keputusan harus lolos pertanyaan: _apakah ini tetap nyaman, stabil, dan efisien di mobile?_

### 2. Deterministic gameplay core

Rule evaluation, trace progression, trap effect resolution, evidence state, objective state, dan score computation harus reproducible dari state + input yang sama.

### 3. Server-authoritative untuk domain sensitif

Progression, inventory, currency, entitlement, ranked result, leaderboard, moderation state, liveops config, dan reward claim tidak boleh ditentukan client sebagai source of truth final.

### 4. Content-driven systems

Stage, node, link, access rule, evidence, trap, mini-game config, objective, modifier, reward table, event rule, dan balance tuning harus berbasis data/schema, bukan hardcoded per stage di UI logic.

### 5. Observability by design

Semua subsystem penting harus dirancang agar observable: logs, metrics, telemetry events, error states, anomaly hooks.

### 6. Graceful degradation

Game harus menangani offline, slow network, stale config, partial sync, replay fetch failure, dan feature flags yang belum aktif tanpa menyebabkan app unusable.

### 7. Safe iteration

Perubahan schema, balance, dan content harus versioned dan mendukung migration atau compatibility strategy.

---

## Recommended Technical Direction

Dokumen ini tidak memaksa satu stack frontend mutlak, tetapi agent sebaiknya memprioritaskan pendekatan berikut kecuali ada keputusan resmi lain di repo:

- **TypeScript** untuk seluruh application/game code
- Frontend runtime yang kompatibel baik dengan Capacitor
- Modular architecture dengan domain separation yang kuat
- Shared schema validation untuk content dan payload penting
- Testable core simulation tanpa ketergantungan DOM/UI

### Suggested high-level app structure

- `src/app/` untuk bootstrap aplikasi, routing shell, dependency composition
- `src/game/` untuk runtime simulation, state machine, rule evaluation, graph traversal
- `src/content/` untuk schema, content definitions, loaders, validators
- `src/meta/` untuk profile, progression, inventory, economy, rewards
- `src/network/` untuk API clients, auth, retry, sync, cache policies
- `src/platform/` untuk abstraction atas Capacitor/native integrations
- `src/telemetry/` untuk event contracts, dispatchers, buffering, privacy rules
- `src/liveops/` untuk feature flags, remote config, events, experiments
- `src/social/` untuk friends, clans, leaderboard, replay metadata
- `src/ui/` untuk screens, components, HUD, accessibility adaptations
- `src/utils/` untuk helpers murni dan utilities non-domain

Jika repo memilih naming berbeda, pertahankan prinsip pemisahan domain yang sama.

---

## Capacitor-Specific Guidance

### Platform abstraction rule

Jangan menyebar pemanggilan plugin native langsung ke seluruh UI. Semua akses Capacitor harus melalui abstraction layer yang konsisten, misalnya service atau adapter di `platform/`.

Contoh domain platform yang layak diabstraksikan:

- app lifecycle
- device info
- network status
- haptics
- keyboard behavior
- safe area handling
- push notifications
- deep links
- local notifications
- filesystem/cache
- secure/native preferences
- share intent
- app review prompt

### Lifecycle handling

Agent harus selalu mempertimbangkan state berikut:

- cold start
- foreground active
- backgrounded
- resumed after interruption
- restored after OS reclaim
- network regained after offline

Ketika app masuk background di tengah run, minimal harus ada strategi untuk:

- menyimpan checkpoint state lokal yang aman
- menghentikan timer non-authoritative bila perlu
- menandai session interruption
- memulihkan state tanpa korupsi data saat resume

### Native plugin discipline

- Gunakan plugin resmi atau plugin yang benar-benar dibutuhkan.
- Jangan menambah plugin native tanpa alasan produk/teknis yang jelas.
- Setiap plugin baru harus dievaluasi dari sisi maintenance, iOS/Android parity, privacy impact, dan fallback behavior.
- Bila fitur bisa dicapai dengan web API yang stabil **dan** tidak merusak mobile experience, pilih pendekatan yang lebih sederhana.

---

## UX Rules for Mobile Game Delivery

### Touch-first design

- Semua input utama harus nyaman disentuh, bukan hover-dependent.
- Jangan mengandalkan right-click, hover tooltip eksklusif, keyboard shortcut-only, atau precision cursor sebagai syarat bermain.
- Hit targets harus cukup besar dan aman untuk berbagai ukuran layar.
- Informasi penting jangan hanya tersedia saat hover.

### Session design

Mobile play sessions bisa pendek dan terputus. Karena itu:

- Progress harus aman terhadap interruption.
- Mission yang panjang perlu checkpoint atau recovery strategy yang jelas.
- UI harus cepat kembali ke state terakhir yang relevan.
- Resume flow tidak boleh membingungkan.

### Readability

- Kontras tinggi dan informasi hierarki jelas.
- Trace, alert, objective, evidence, trap, reward, dan state changes harus terbaca di layar kecil.
- Jangan memadatkan terlalu banyak node/state info dalam satu layar tanpa progressive disclosure.

### Accessibility baseline

- colorblind-safe signaling
- dynamic text scaling jika framework memungkinkan
- icon redundancy untuk state warna
- reduced motion mode
- haptic optional, bukan mandatory
- subtitle/text clarity
- remappable or configurable control behaviors jika kontrol kompleks berkembang

---

## Gameplay Core Rules

### Core simulation boundaries

Core simulation harus mencakup dan mengisolasi logika berikut:

- node traversal legality
- link traversal legality
- access rule evaluation
- evidence discovery/collection
- trap trigger and resolution
- trace accumulation/reduction
- objective progression
- score breakdown computation
- mutator and modifier application
- run success/fail state transitions

### UI boundary rule

UI tidak boleh memutuskan apakah action valid. UI hanya:

- meminta action
- menampilkan preview kemungkinan bila perlu
- menerima hasil evaluasi dari simulation layer
- merender feedback

### Determinism expectations

Untuk mode ranked, replay, ghost, dan debugging, agent harus menghindari sumber nondeterminism yang tidak diaudit, termasuk:

- penggunaan waktu sistem langsung dalam core rule
- random tanpa seed/contract
- side effect async di dalam rule evaluation
- dependence pada urutan render UI

---

## Content and Schema Rules

### Content-first authoring

Semua content utama harus didefinisikan dalam bentuk schema-driven data, termasuk:

- stage definitions
- graph structures
- node definitions
- link definitions
- objectives
- access rules
- evidence definitions
- trap definitions
- mini-game configs
- reward tables
- modifiers
- seasonal configs
- liveops configs yang relevan

### Schema discipline

- Setiap schema penting harus memiliki `schemaVersion`.
- Setiap content pack harus memiliki `contentVersion`.
- Breaking change harus jelas: migrasi, transform, atau namespace baru.
- Jangan mengubah makna field lama secara diam-diam.

### Validation discipline

Semua content harus bisa divalidasi untuk minimal aspek berikut:

- structural integrity
- solvability
- fairness
- difficulty band
- unsupported reference detection
- ranked-eligibility constraints
- performance budget fit

---

## Networking and Sync Rules

### Authoritative boundaries

Client boleh menyimpan cache dan local session state, tetapi server harus menjadi authority untuk:

- account identity
- profile progression
- inventory
- currency
- season entitlements
- commerce receipts
- ranked result acceptance
- leaderboard placement
- moderation actions
- published creator content state

### Mobile network realities

Agent harus menganggap kondisi berikut sebagai normal, bukan edge case:

- high latency
- intermittent connectivity
- offline transition saat screen aktif
- request timeout
- duplicate submission risk setelah retry
- app background tepat saat request berlangsung

### Required networking behaviors

- request retry policy yang selektif, bukan buta
- idempotency untuk mutation sensitif
- cached read fallback bila aman
- explicit loading, stale, and error states
- sync reconciliation strategy untuk pending local actions yang diizinkan

---

## Storage Rules

### Local storage policy

Local storage hanya untuk data yang memang aman dan berguna di device, seperti:

- non-sensitive cached content
- display preferences
- local diagnostics flags
- resumable session checkpoint yang tidak membuka exploit sensitif
- replay cache read-only yang aman

### Sensitive data policy

Jangan simpan secrets, currency authority, entitlement authority, atau trust decisions sebagai plain local state yang dianggap valid tanpa server verification.

### Save integrity

Jika ada local session restore:

- state harus versioned
- restore harus tervalidasi
- corrupted restore harus bisa dibuang tanpa membuat app crash loop

---

## Telemetry Rules

### Why telemetry is mandatory

Project ini mengandalkan balancing, fairness validation, retention analysis, exploit detection, dan liveops tuning. Karena itu telemetry bukan opsional.

### Telemetry requirements

- event contracts versioned
- payload discipline
- no accidental PII sprawl
- queue/buffer untuk kondisi offline bila relevan
- flush policy yang ramah baterai dan bandwidth
- debug/instrumentation hooks untuk internal builds

### Minimum event domains

- session lifecycle
- navigation flow
- run start/complete/fail
- node traversal
- rule fail reason
- evidence collect
- trap trigger
- trace tier change
- mini-game start/end
- reward claims
- commerce flow
- replay watch/use
- social interaction
- error and crash context

---

## LiveOps Rules

### Remote control capability

Agent harus mengasumsikan product akan membutuhkan remote control untuk:

- feature flags
- balance tuning
- event schedules
- reward tables
- offer rotations
- ranked challenge config
- seasonal state

### Safety rules

- remote config harus tervalidasi
- config publish harus bisa di-rollback
- fallback defaults harus ada
- invalid config tidak boleh membuat app tidak bisa dibuka

### Time-based content discipline

Jangan menanam hardcoded event dates ke UI logic. Semua harus data-driven dan server/liveops controlled sejauh mungkin.

---

## Social, Replay, and Competitive Rules

### Replay rules

Replay system harus diperlakukan sebagai fitur inti production, bukan debugging-only. Agent harus menjaga compatibility, determinism, dan storage efficiency.

### Competitive integrity

Untuk ranked/challenge:

- seed harus authoritative
- restrictions harus authoritative
- hasil harus dapat diverifikasi
- impossible metrics harus dapat dideteksi
- correction/rollback leaderboard harus dimungkinkan

### Social safety

Untuk fitur sosial, selalu sediakan ruang untuk:

- report flow
- block/mute flow
- moderation metadata
- abuse-resilient naming/content rules

---

## Security and Trust Rules

### Never trust the client for high-value state

Jangan pernah membangun asumsi bahwa client dapat dipercaya untuk:

- grant rewards final
- settle ranked score final
- validate purchases final
- own moderation status final
- define entitlements final

### Anti-cheat posture

Game ini tidak harus memakai anti-cheat invasif pada awal, tetapi arsitektur harus mendukung:

- tamper detection
- impossible action detection
- anomaly scoring
- audit trails
- replay verification
- leaderboard fraud review

### Secure-by-default development

- validasi semua input eksternal
- sanitize player-generated text/content
- batasi permukaan serangan plugin/native integrations
- audit all admin/manual grant actions

---

## Performance Rules for Mobile

### General performance expectations

Semua fitur harus dievaluasi terhadap:

- CPU cost
- memory pressure
- battery impact
- startup time
- runtime responsiveness
- low/mid-tier device viability

### Avoid by default

- re-render berlebihan pada HUD yang sangat aktif
- polling agresif tanpa alasan
- asset besar tanpa compression strategy
- state containers yang memicu update luas untuk perubahan kecil
- animasi berat pada layar penuh tanpa reduced-motion option

### Preferred behavior

- lazy loading untuk domain non-kritis
- memoization/selective updates seperlunya
- asset preloading yang terkontrol
- pause/slowdown behavior saat app background
- telemetry batching yang hemat resource

---

## Testing Expectations

### Required test posture

Agent tidak boleh hanya menulis fitur; agent harus memikirkan bagaimana fitur itu diuji.

### Minimum test layers

- unit tests untuk pure logic
- simulation tests untuk run outcomes
- schema validation tests
- integration tests untuk API contracts penting
- determinism tests untuk replay/ranked flow
- platform behavior tests untuk lifecycle-critical logic

### Test priorities

Prioritaskan test pada area berikut:

- rule evaluation
- trace transitions
- trap resolution
- reward grants
- sync/retry/idempotency
- save restore
- ranked result validation
- replay compatibility

---

## Code Change Policy for Agents

### When making changes

Setiap perubahan sebaiknya menjaga atau meningkatkan:

- separation of concerns
- determinism
- testability
- mobile suitability
- observability
- backward compatibility

### Agents should avoid

- mencampur UI dan game rules dalam satu komponen besar
- menambah shortcut yang membuat schema/content sulit divalidasi
- memakai browser-only assumption tanpa fallback mobile
- memperbanyak plugin native tanpa abstraction
- mengunci sistem penting ke platform tunggal tanpa alasan
- menambahkan hidden coupling antar domain yang sulit diuji

### Agents should prefer

- pure functions untuk evaluasi rules
- explicit types/interfaces
- narrow adapters untuk platform/native
- data-driven behaviors
- error states yang jelas
- incremental, testable changes

---

## Documentation Expectations

Jika agent menambah atau mengubah sistem penting, update dokumentasi yang relevan. Minimal dokumentasi harus mengikuti perubahan pada:

- domain model
- schema contracts
- API contracts
- config contracts
- telemetry events
- lifecycle/platform assumptions
- release or operational runbooks jika relevan

Jika ada keputusan baru yang mengubah arah platform, file ini harus ikut diperbarui.

---

## Decision Heuristics for Agents

Saat ragu, gunakan urutan prioritas ini:

1. pilih solusi yang **aman untuk mobile**
2. pilih solusi yang **menjaga deterministic core**
3. pilih solusi yang **mudah divalidasi dan diuji**
4. pilih solusi yang **mendukung server authority pada domain sensitif**
5. pilih solusi yang **mudah diobservasi dan dioperasikan**
6. pilih solusi yang **meminimalkan complexity tanpa mengorbankan future scale**

---

## Explicit Guidance for This Repository

Mulai dari sekarang, semua asumsi pengembangan untuk repo ini adalah:

- game diarahkan untuk **mobile release**
- shell deployment menggunakan **Capacitor**
- UI, navigation, session handling, storage, dan performance harus disesuaikan untuk mobile realities
- web build boleh ada, tetapi tidak boleh mendikte keputusan yang merusak kualitas mobile
- production readiness lebih penting daripada shortcut prototype

Jika muncul konflik antara solusi yang nyaman untuk browser desktop dan solusi yang lebih benar untuk mobile production, **pilih solusi yang benar untuk mobile production**, kecuali ada keputusan produk tertulis yang menyatakan sebaliknya.

---

## Short Operational Summary

Agent yang bekerja di project ini harus menganggap project sebagai **mobile-first, Capacitor-based, production game platform** dengan gameplay core yang deterministic, backend untuk authority domain sensitif, content pipeline yang tervalidasi, serta liveops/telemetry/security yang sejak awal diperlakukan sebagai bagian inti product.
