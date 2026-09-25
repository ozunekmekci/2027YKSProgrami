# YKS 2027 Koçu — Masaüstü SaaS Web Çalışma Alanı Uygulama Planı (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Yeniden tasarlanan masaüstü SaaS YKS 2027 Koçu web çalışma alanını (`www/index.html`) sıfırdan hayata geçirmek; mobil kısıtlamalardan arındırılmış, 2 sütunlu Çalışma Stüdyosu, 42 haftalık Master Takvim, 766 videoluk filtrelenebilir Müfredat Veri Tablosu, `Ctrl+K` Global Komut Paleti ve entegre Mola İstasyonu ile donatmak.

**Architecture:** Saf TypeScript denetleyicileri ve derleme motoru (`src/generate_saas_app.js`) kullanılarak sıfır dış UI kütüphanesi bağımlılığıyla ultra hızlı, hafif, modern SaaS arayüzü inşa edilir. Sol kenar çubuğu (Sidebar) + üst komut çubuğu (Command Bar) + ana çalışma alanı (Workspace Canvas) mimarisi kullanılır.

**Tech Stack:** TypeScript 5, Node.js, Web Audio API, LocalStorage, HTML5 & CSS3 (Grid/Flexbox/CSS Variables).

**Spec:** [`docs/superpowers/specs/2026-09-25-yks-saas-web-design.md`](file:///home/znekm/Masaüstü/hermes/docs/superpowers/specs/2026-09-25-yks-saas-web-design.md)

## Global Constraints

- 9 ders, 766 doğrulanmış video (`playlists_data_tr.json`).
- Günde kesin olarak 4 blok (1 blok = 1 video).
- Bloklar arası 20 dakika sabit mola, D5 (587.33 Hz) ve A5 (880.0 Hz) çift tonlu Web Audio zili.
- Pazar günü kesinlikle `⛔ PAZAR: ÇALIŞMAK KESİNLİKLE YASAK!`.
- Stress-Free Shift Engine izlenmemiş videoları sırayla bugünden ileriye kaydırır.
- Impeccable Tasarım Kuralı: Asla kart içinde kart yuvalama (cardocalypse) yok, dikey 4px sol şerit yok, gradyan metin yok, yapay 3D gölgeler yok. Slate & Mint renk paleti ve `tabular-nums` zaman sayaçları.

---

### Task 1: SaaS Layout Shell & Design System Stylesheet

**Files:**
- Create: `tests/saas_layout_and_design.test.js`
- Create: `src/generate_saas_app.js`
- Test: `tests/saas_layout_and_design.test.js`

**Interfaces:**
- Consumes: `playlists_data_tr.json`, `src/calendar_engine.js`
- Produces: `src/generate_saas_app.js` derleyicisi ve SaaS kabuk şablonu (Sidebar, Top Bar, Canvas, CSS değişkenleri).

- [ ] **Step 1: Write failing test for SaaS Layout Shell & Styles**
```javascript
// tests/saas_layout_and_design.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('src/generate_saas_app.js exists and generates SaaS layout with sidebar and topbar', async () => {
  assert.ok(fs.existsSync('src/generate_saas_app.js'), 'src/generate_saas_app.js must exist');
  const generator = await import('../src/generate_saas_app.js');
  assert.equal(typeof generator.generateSaaSApp, 'function');

  const html = generator.generateSaaSApp();
  assert.ok(html.includes('saas-layout-wrapper'), 'Must contain saas-layout-wrapper');
  assert.ok(html.includes('saas-sidebar'), 'Must contain saas-sidebar');
  assert.ok(html.includes('saas-topbar'), 'Must contain saas-topbar');
  assert.ok(html.includes('saas-content-canvas'), 'Must contain saas-content-canvas');
  assert.ok(html.includes('--slate-900'), 'Must define Slate design tokens');
  assert.ok(html.includes('--mint-500'), 'Must define Mint accent tokens');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/saas_layout_and_design.test.js`
Expected: FAIL with "Cannot find module '../src/generate_saas_app.js'"

- [ ] **Step 3: Implement `src/generate_saas_app.js` scaffolding**
Create `src/generate_saas_app.js` implementing `generateSaaSApp()` with complete SaaS desktop grid CSS, Sidebar, Top Command Bar, and Canvas.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/saas_layout_and_design.test.js`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/generate_saas_app.js tests/saas_layout_and_design.test.js
git commit -m "feat(saas): create SaaS layout shell, sidebar, and design system tokens"
```

---

### Task 2: Study Studio (Bugün) 2-Column SaaS Workspace View

**Files:**
- Modify: `src/generate_saas_app.js`
- Create: `tests/saas_today_studio.test.js`

**Interfaces:**
- Consumes: `playlists_data_tr.json`, `src/calendar_engine.js`
- Produces: 2 sütunlu Çalışma Stüdyosu HTML yapısı (Sol: 4 video kartı, Sağ: KPI & Mola Paneli) ve render fonksiyonları.

- [ ] **Step 1: Write failing test for Study Studio**
```javascript
// tests/saas_today_studio.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSaaSApp } from '../src/generate_saas_app.js';

test('Study Studio renders 2-column layout with 4 video cards and inline break timer', () => {
  const html = generateSaaSApp();
  assert.ok(html.includes('studio-grid-layout'), 'Must have 2-column studio-grid-layout');
  assert.ok(html.includes('studio-blocks-column'), 'Must have studio-blocks-column');
  assert.ok(html.includes('studio-aside-column'), 'Must have studio-aside-column');
  assert.ok(html.includes('saas-break-timer-card'), 'Must have inline saas-break-timer-card');
  assert.ok(html.includes('svg-timer-circle'), 'Must have circular SVG timer');
  assert.ok(html.includes('PAZAR: ÇALIŞMAK KESİNLİKLE YASAK'), 'Must contain Sunday rest banner');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/saas_today_studio.test.js`
Expected: FAIL

- [ ] **Step 3: Implement Study Studio markup & client-side rendering**
Enhance `src/generate_saas_app.js` with 2-column studio layout, rich video cards, inline circular SVG break timer, and Sunday calm screen.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/saas_today_studio.test.js`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/generate_saas_app.js tests/saas_today_studio.test.js
git commit -m "feat(saas): implement 2-column Study Studio view and inline circular break timer"
```

---

### Task 3: Master Calendar & Timeline (Radar & Shift Engine) SaaS View

**Files:**
- Modify: `src/generate_saas_app.js`
- Create: `tests/saas_calendar_view.test.js`

**Interfaces:**
- Consumes: 42 haftalık takvim verisi, `completedVideos` sözlüğü
- Produces: 42 haftalık master takvim matrisi, hafta seçici ve Stress-Free Shift Engine butonu.

- [ ] **Step 1: Write failing test for Calendar View**
```javascript
// tests/saas_calendar_view.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSaaSApp } from '../src/generate_saas_app.js';

test('Radar Calendar view renders 42-week selector and Shift Engine button', () => {
  const html = generateSaaSApp();
  assert.ok(html.includes('radar-week-selector'), 'Must have radar-week-selector');
  assert.ok(html.includes('radar-weekly-matrix'), 'Must have radar-weekly-matrix');
  assert.ok(html.includes('triggerShiftEngine'), 'Must bind triggerShiftEngine');
  assert.ok(html.includes('countdown-target-date'), 'Must contain countdown to 19 June 2027');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/saas_calendar_view.test.js`
Expected: FAIL

- [ ] **Step 3: Implement Calendar View & Shift Engine in `src/generate_saas_app.js`**
Add 42-week selector, week card grid, and one-click Shift Engine handler with instant feedback banner.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/saas_calendar_view.test.js`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/generate_saas_app.js tests/saas_calendar_view.test.js
git commit -m "feat(saas): add 42-week master calendar matrix and Stress-Free Shift Engine"
```

---

### Task 4: Curriculum Matrix (Müfredat Veri Bankası) SaaS Data Table View

**Files:**
- Modify: `src/generate_saas_app.js`
- Create: `tests/saas_curriculum_table.test.js`

**Interfaces:**
- Consumes: 766 video müfredat veritabanı
- Produces: 9 ders KPI kartları ve filtrelenebilir SaaS veri tablosu (`<table>` ile kolon sıralama ve arama).

- [ ] **Step 1: Write failing test for Curriculum Data Table**
```javascript
// tests/saas_curriculum_table.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSaaSApp } from '../src/generate_saas_app.js';

test('Curriculum view renders 9 course meters and full 766-video SaaS data table', () => {
  const html = generateSaaSApp();
  assert.ok(html.includes('curriculum-course-cards'), 'Must render course overview cards');
  assert.ok(html.includes('saas-data-table'), 'Must render saas-data-table');
  assert.ok(html.includes('subject-filter-select'), 'Must have subject filter dropdown');
  assert.ok(html.includes('status-filter-select'), 'Must have status filter dropdown');
  assert.ok(html.includes('table-search-input'), 'Must have table search input');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/saas_curriculum_table.test.js`
Expected: FAIL

- [ ] **Step 3: Implement Curriculum Data Table**
Add course progress cards and table with columns: `Ders`, `Video No`, `Başlık`, `Eğitmen`, `Süre`, `Durum`, `İzle`.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/saas_curriculum_table.test.js`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/generate_saas_app.js tests/saas_curriculum_table.test.js
git commit -m "feat(saas): build rich curriculum data table and course progress cards"
```

---

### Task 5: Global Command Palette (`Ctrl+K` / `⌘K`) & Search Modal

**Files:**
- Modify: `src/generate_saas_app.js`
- Create: `tests/saas_command_palette.test.js`

**Interfaces:**
- Consumes: Klavye olayları (`keydown` with `key === 'k' && (ctrlKey || metaKey)`), video veritabanı
- Produces: Komut paleti modalı (`#command-palette-modal`), anlık arama sonuçları ve hızlı eylemler.

- [ ] **Step 1: Write failing test for Command Palette**
```javascript
// tests/saas_command_palette.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSaaSApp } from '../src/generate_saas_app.js';

test('Command Palette modal exists with keyboard shortcut binding', () => {
  const html = generateSaaSApp();
  assert.ok(html.includes('id="command-palette-modal"'), 'Must have command-palette-modal');
  assert.ok(html.includes('id="command-palette-input"'), 'Must have command-palette-input');
  assert.ok(html.includes('openCommandPalette'), 'Must define openCommandPalette');
  assert.ok(html.includes('closeCommandPalette'), 'Must define closeCommandPalette');
  assert.ok(html.includes("e.key.toLowerCase() === 'k'"), 'Must bind Ctrl+K or Cmd+K');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/saas_command_palette.test.js`
Expected: FAIL

- [ ] **Step 3: Implement Command Palette markup & event listeners**
Add `#command-palette-modal` with auto-focusing search input, instant filtering, Escape to close, and keyboard shortcut handler.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/saas_command_palette.test.js`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/generate_saas_app.js tests/saas_command_palette.test.js
git commit -m "feat(saas): implement Ctrl+K / Cmd+K global command palette search"
```

---

### Task 6: Data & Preferences View, PWA / Android Bundle Sync, Full Verification

**Files:**
- Modify: `src/generate_saas_app.js`
- Modify: `package.json` (build:mobile / build:saas scripts)
- Create: `tests/saas_integration.test.js`

**Interfaces:**
- Consumes: LocalStorage, JSON import/export, PWA manifest/SW
- Produces: `www/index.html` SaaS üretim paketi, güncellenmiş testler, canlı HTTP sunucu testi.

- [ ] **Step 1: Write failing integration test**
```javascript
// tests/saas_integration.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('www/index.html is compiled as full SaaS workspace with 766 videos', () => {
  const html = fs.readFileSync('www/index.html', 'utf8');
  assert.ok(html.includes('saas-layout-wrapper'), 'www/index.html must be SaaS layout');
  assert.ok(html.includes('studio-grid-layout'), 'www/index.html must have Study Studio');
  assert.ok(html.includes('command-palette-modal'), 'www/index.html must have Command Palette');
  assert.ok(html.includes('saas-data-table'), 'www/index.html must have Curriculum Data Table');
  assert.ok(html.includes('exportBackup'), 'Must have backup export');
  assert.ok(html.includes('importBackup'), 'Must have backup import');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/saas_integration.test.js`
Expected: FAIL

- [ ] **Step 3: Compile `www/index.html` via `node src/generate_saas_app.js` and sync to Android**
Compile complete SaaS web application into `www/index.html`, sync to `android/`, update `package.json` scripts.

- [ ] **Step 4: Run all test suites and typecheck**
Run: `npm run typecheck && npm test`
Expected: All tests pass (100%).

- [ ] **Step 5: Commit and Verify on Live Server**
```bash
git add src/ www/ tests/ package.json android/
git commit -m "feat(saas): complete SaaS web workspace, sync assets, and verify on live server"
```
Run: `curl -s -I http://localhost:3000/` and verify HTTP 200 OK.
