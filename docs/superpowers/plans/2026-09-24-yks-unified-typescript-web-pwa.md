# YKS 2027 Koçu — Birleşik TypeScript Duyarlı Web & PWA Uygulaması Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the YKS 2027 study companion into a fully TypeScript-powered, responsive Web Application and Progressive Web App (PWA) that offers a distraction-free, widescreen-optimized desktop experience and mobile-ready PWA installability, powered by strict type-safe core modules.

**Architecture:** Strict TypeScript 5 modules (`types.ts`, `shift_engine.ts`, `timer.ts`, `storage.ts`, `app.ts`) compiled into lightweight web assets in `www/`. Fully responsive CSS with desktop widescreen layouts (`>= 1024px`), docked 20-min break widget, Service Worker (`sw.js`) for offline execution, and PWA manifest (`manifest.json`), maintaining 100% interoperability with the Capacitor Android project.

**Tech Stack:** TypeScript 5, Node.js, Web Audio API, PWA Service Worker & Manifest, CSS Grid & Flexbox, HTML5/ESM, Node test runner (`node --test`).

**Spec:** [docs/superpowers/specs/2026-09-24-yks-unified-pwa-web-app-design.md](file:///home/znekm/Masaüstü/hermes/docs/superpowers/specs/2026-09-24-yks-unified-pwa-web-app-design.md)

## Global Constraints

- Strict adherence to TypeScript strict mode (`"strict": true`, no implicit any, exact type definitions).
- UI follows Impeccable standards (/impeccable): Material 3, min 48px touch targets, tabular-nums, no gradient text, no block shadows, no side-tab accent stripes.
- Direct YouTube opening: New tab `target="_blank"` on desktop web; `vnd.youtube:` native intent fallback on mobile.
- 4 blocks per study day; 1 block = 1 video.
- 20 minutes fixed break with countdown timer and Web Audio chime (D5: 587.33Hz -> A5: 880Hz).
- Sunday strictly "ÇALIŞMAK KESİNLİKLE YASAK!" (rest day).
- Stress-Free Shift Engine: Missed days shift forward gracefully from today without guilt or broken chronology.
- Target deadline: 19 June 2027.
- Complete offline capability via PWA Service Worker (`sw.js`).

---

### Task 1: TypeScript Infrastructure & Data Contracts

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`
- Create: `src/web/types.ts`
- Create: `tests/ts_types_and_setup.test.js`

**Interfaces:**
- Produces: Strict TypeScript contracts (`Video`, `PlaylistInfo`, `PlaylistsData`, `StudyBlock`, `DaySchedule`, `WeekSchedule`, `BackupPayload`, `TimerState`).
- `npx tsc --noEmit` validates zero type errors.

- [ ] **Step 1: Install TypeScript devDependencies**
- [ ] **Step 2: Create tsconfig.json with strict compiler options**
- [ ] **Step 3: Define comprehensive domain types in src/web/types.ts**
- [ ] **Step 4: Write test verifying tsconfig and type compilation**
- [ ] **Step 5: Run npm test and verify pass**
- [ ] **Step 6: Commit**

---

### Task 2: Core TypeScript Engine Modules (Shift Engine, Timer, Storage)

**Files:**
- Create: `src/web/shift_engine.ts`
- Create: `src/web/timer.ts`
- Create: `src/web/storage.ts`
- Create: `tests/ts_core_modules.test.js`

**Interfaces:**
- `shiftSchedule(rawPlaylists: PlaylistsData, completedVideos: Record<string, boolean>): WeekSchedule[]`
- `createBreakTimer(durationSec: number, callbacks: TimerCallbacks): BreakTimer`
- `loadProgress(): StoredProgress`, `saveProgress(data: StoredProgress): void`, `validateBackup(json: unknown): BackupPayload`

- [ ] **Step 1: Implement src/web/shift_engine.ts with strict types**
- [ ] **Step 2: Implement src/web/timer.ts with Web Audio API chime**
- [ ] **Step 3: Implement src/web/storage.ts with type guards and validation**
- [ ] **Step 4: Write unit tests in tests/ts_core_modules.test.js**
- [ ] **Step 5: Run tests and typecheck to verify passes**
- [ ] **Step 6: Commit**

---

### Task 3: PWA Infrastructure & Offline Service Worker

**Files:**
- Create: `www/manifest.json`
- Create: `www/sw.js`
- Create: `www/icons/icon-192.svg` & `www/icons/icon-512.svg`
- Create: `tests/pwa_infrastructure.test.js`

**Interfaces:**
- W3C valid `manifest.json` for standalone PWA with icons, Turkish app title, and theme color `#0f172a`.
- Offline cache service worker `sw.js` with Cache-First strategy for application shell and data.

- [ ] **Step 1: Create www/manifest.json**
- [ ] **Step 2: Create www/sw.js with offline cache strategy**
- [ ] **Step 3: Generate clean SVG PWA icons in www/icons/**
- [ ] **Step 4: Write tests in tests/pwa_infrastructure.test.js**
- [ ] **Step 5: Run tests to verify passes**
- [ ] **Step 6: Commit**

---

### Task 4: Responsive Web Client & TypeScript Application (`src/web/app.ts`)

**Files:**
- Create: `src/web/app.ts`
- Modify: `src/generate_mobile_app.js` (unify as responsive web/mobile bundle generator)
- Modify: `www/index.html` (re-compiled with desktop responsive CSS, PWA tags, and TypeScript app)
- Create: `tests/web_responsive_app.test.js`

**Interfaces:**
- Responsive layout: Desktop (`>= 1024px`) 2-column cards, persistent top/side bar, desktop docked break timer widget, and direct new-tab YouTube opening (`_blank`).
- Mobile (`< 768px`) Material 3 bottom navigation and touch-friendly controls.
- PWA install prompt banner hook.

- [ ] **Step 1: Implement src/web/app.ts**
- [ ] **Step 2: Update generator with desktop responsive CSS and PWA links**
- [ ] **Step 3: Compile bundle to www/ and verify sync with Android assets**
- [ ] **Step 4: Write tests in tests/web_responsive_app.test.js**
- [ ] **Step 5: Run full test suite and verify pass**
- [ ] **Step 6: Commit**

---

### Task 5: Web Dev Server, Documentation & Code Review

**Files:**
- Create: `src/serve_web.js` (lightweight static HTTP server for local testing and PWA verification)
- Modify: `package.json` (`"serve"`, `"typecheck"`, `"build:web"`)
- Modify: `README.md` (Web & PWA usage section)

**Interfaces:**
- `npm run serve` starts local server on `http://localhost:3000`.
- `npm run typecheck` runs `tsc --noEmit`.
- Full code review across 5 dimensions (/code-review-and-quality).

- [ ] **Step 1: Create lightweight zero-dependency local web server src/serve_web.js**
- [ ] **Step 2: Add scripts to package.json**
- [ ] **Step 3: Update README.md with Web & PWA guide**
- [ ] **Step 4: Run full test suite across all tests**
- [ ] **Step 5: Final review and commit**
