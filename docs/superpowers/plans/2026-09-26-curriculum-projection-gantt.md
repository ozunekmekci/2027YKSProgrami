# Çok Şeritli İnteraktif Gantt Matrisi & Müfredat Projeksiyon Motoru Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 766 videoluk YKS 2027 müfredatını pedagojik ünitelere bölerek her bir dersin ve ünitenin kesin başlangıç-bitiş takvim tarihlerini hesaplayan dinamik bir projeksiyon motoru ve SaaS stüdyosuna entegre çok şeritli editoryal bir Gantt matrisi kazandırmak.

**Architecture:** Müfredat ünite sözlüğü (`src/data/curriculum_units.json`) 9 dersin video sınırlarını tanımlar; TypeScript projeksiyon motoru (`src/web/projection_engine.ts`) takvim motoru çıktılarını ve tamamlanma durumlarını harmanlayarak her ünite ve ders için hafta ve tarih aralıklarını hesaplar; `src/generate_saas_app.js` bu veriyi üst KPI paneli, 42 haftalık SVG zaman cetveli, editoryal renk şeritleri ve ünite detay çekmecesine sahip interaktif bir arayüz olarak `www/index.html` içerisine derler.

**Tech Stack:** TypeScript 5, Node.js Test Runner (`node:test`, `node:assert/strict`), SVG, CSS Grid/Flexbox, Impeccable CSS, LocalStorage, PWA.

**Spec:** `docs/superpowers/specs/2026-09-26-curriculum-projection-gantt-design.md`

## Global Constraints

- Sıfır emoji kuralı: Kod, yorum, arayüz metinleri, CSS ve commit mesajlarında kesinlikle emoji bulunamaz.
- Harici grafik kütüphanesi yasağı: Chart.js, D3, Recharts vb. kullanılmaz; tüm çizelge saf SVG ve hafif CSS ile sıfır bağımlılıkla inşa edilir.
- Tip güvenliği: Strict TypeScript (`tsc --noEmit`) 0 hata ile geçmelidir.
- Rakam hizalaması: Tüm tarihler, haftalar, süreler ve yüzdeler `tabular-nums` CSS kuralına sahip olmalıdır.
- Kalite çıtası: Mevcut 107 testin tamamı korunmalı ve yeni testlerle birlikte tüm test paketi yeşil olmalıdır.

---

### Task 1: Müfredat Ünite Sözlüğü ve Veri Bütünlüğü Testleri

**Files:**
- Create: `src/data/curriculum_units.json`
- Test: `tests/curriculum_units_data.test.js`

**Interfaces:**
- Produces: `src/data/curriculum_units.json` format:
  ```json
  {
    "[subjectName]": [
      {
        "id": "string",
        "title": "string",
        "startVideo": "number",
        "endVideo": "number"
      }
    ]
  }
  ```

- [ ] **Step 1: Write the failing unit dictionary integrity test**

```javascript
// tests/curriculum_units_data.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('curriculum_units.json exists and strictly covers all 766 videos without gaps or overlaps', () => {
  const unitsPath = path.resolve(process.cwd(), 'src/data/curriculum_units.json');
  assert.ok(fs.existsSync(unitsPath), 'src/data/curriculum_units.json must exist');

  const playlistsPath = path.resolve(process.cwd(), 'playlists_data_tr.json');
  const playlists = JSON.parse(fs.readFileSync(playlistsPath, 'utf8'));
  const unitsData = JSON.parse(fs.readFileSync(unitsPath, 'utf8'));

  const subjectNames = Object.keys(playlists);
  assert.equal(Object.keys(unitsData).length, subjectNames.length, 'Must define units for all 9 subjects');

  let totalUnitVideos = 0;
  for (const subj of subjectNames) {
    const units = unitsData[subj];
    assert.ok(Array.isArray(units) && units.length > 0, `Units for ${subj} must be a non-empty array`);

    const playlistVideos = playlists[subj].videos || [];
    let expectedNextStart = 1;

    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      assert.ok(u.id, `Unit ${i} in ${subj} must have an id`);
      assert.ok(u.title, `Unit ${i} in ${subj} must have a title`);
      assert.equal(u.startVideo, expectedNextStart, `Unit ${u.title} startVideo must be ${expectedNextStart}`);
      assert.ok(u.endVideo >= u.startVideo, `Unit ${u.title} endVideo must be >= startVideo`);

      const videoSpan = (u.endVideo - u.startVideo + 1);
      totalUnitVideos += videoSpan;
      expectedNextStart = u.endVideo + 1;
    }

    assert.equal(expectedNextStart - 1, playlistVideos.length, `${subj} last unit must end at ${playlistVideos.length}`);
  }

  assert.equal(totalUnitVideos, 766, 'All units combined must account for exactly 766 videos');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/curriculum_units_data.test.js`
Expected: FAIL (file does not exist).

- [ ] **Step 3: Create `src/data/curriculum_units.json`**

Tüm 9 ders için (Tarih 9 ünite, Türkçe 9 ünite, Matematik 10 ünite, TYT Coğrafya 5 ünite, AYT Coğrafya 5 ünite, TYT Fizik 6 ünite, TYT Kimya 7 ünite, TYT Biyoloji 6 ünite, AYT Edebiyat 6 ünite) 766 videoyu eksiksiz kapsayan JSON dosyasını oluştur.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/curriculum_units_data.test.js`
Expected: PASS (all 766 videos accounted for).

- [ ] **Step 5: Commit**

```bash
git add src/data/curriculum_units.json tests/curriculum_units_data.test.js
git commit -m "feat(curriculum): add authoritative curriculum units dictionary covering all 766 videos"
```

---

### Task 2: Dinamik Projeksiyon Motoru Modülü (`src/web/projection_engine.ts`)

**Files:**
- Modify: `src/web/types.ts`
- Create: `src/web/projection_engine.ts`
- Test: `tests/projection_engine.test.js`

**Interfaces:**
- Types in `src/web/types.ts`:
  ```typescript
  export interface CurriculumUnitDef {
    id: string;
    title: string;
    startVideo: number;
    endVideo: number;
  }

  export interface UnitProjection {
    id: string;
    title: string;
    subject: string;
    startVideo: number;
    endVideo: number;
    totalVideos: number;
    startWeek: number;
    endWeek: number;
    startDate: string;
    endDate: string;
    startDateIso: string;
    endDateIso: string;
    completedVideos: number;
    progressPercent: number;
    status: 'completed' | 'in_progress' | 'upcoming';
  }

  export interface SubjectProjection {
    subject: string;
    startWeek: number;
    endWeek: number;
    startDate: string;
    endDate: string;
    totalVideos: number;
    completedVideos: number;
    progressPercent: number;
    units: UnitProjection[];
  }

  export interface CurriculumProjectionReport {
    subjects: SubjectProjection[];
    totalUnits: number;
    completedUnits: number;
    activeUnits: UnitProjection[];
    projectedCompletionDate: string;
    completesBeforeYks: boolean;
    weeksBeforeYks: number;
  }
  ```
- Function in `src/web/projection_engine.ts`:
  `export function calculateCurriculumProjection(calendarWeeks: any[], unitsData: Record<string, CurriculumUnitDef[]>, completedVideos?: Record<string, boolean>): CurriculumProjectionReport`

- [ ] **Step 1: Write failing projection engine tests**

```javascript
// tests/projection_engine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateCalendarDays } from '../src/calendar_engine.js';
import { calculateCurriculumProjection } from '../src/web/projection_engine.ts';

test('projection_engine calculates accurate start and end weeks and dates for all units', () => {
  const playlists = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'playlists_data_tr.json'), 'utf8'));
  const unitsData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'src/data/curriculum_units.json'), 'utf8'));
  const calendarWeeks = generateCalendarDays(playlists, { startDate: '2026-09-26' });

  const report = calculateCurriculumProjection(calendarWeeks, unitsData, {});

  assert.ok(report.subjects.length > 0, 'Must produce projections for subjects');
  assert.ok(report.totalUnits > 0, 'Must calculate total units');
  assert.equal(report.completedUnits, 0, 'Completed units must be 0 initially');

  const tarih = report.subjects.find(s => s.subject === 'TYT-AYT Tarih');
  assert.ok(tarih, 'TYT-AYT Tarih projection must exist');
  assert.ok(tarih.units.length >= 9, 'Tarih must have at least 9 units');

  for (const u of tarih.units) {
    assert.ok(u.startWeek <= u.endWeek, `Unit ${u.title} startWeek (${u.startWeek}) must be <= endWeek (${u.endWeek})`);
    assert.ok(u.startDateIso <= u.endDateIso, `Unit ${u.title} startDateIso must be <= endDateIso`);
    assert.equal(u.status, 'upcoming' || 'in_progress');
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/projection_engine.test.js`
Expected: FAIL (types or module missing).

- [ ] **Step 3: Update `src/web/types.ts` and implement `src/web/projection_engine.ts`**

TypeScript modüllerini katı kurallarla (`strict: true`) yaz. Takvimdeki günleri ve blokları gezip her videonun indeksine göre ünitelerin `startWeek`, `endWeek`, `startDate`, `endDate`, `completedCount` ve `status` değerlerini hesaplayan temiz fonksiyonu oluştur.

- [ ] **Step 4: Run tests and typecheck**

Run: `node --test tests/projection_engine.test.js && npm run typecheck`
Expected: PASS (0 errors).

- [ ] **Step 5: Commit**

```bash
git add src/web/types.ts src/web/projection_engine.ts tests/projection_engine.test.js
git commit -m "feat(projection): implement strict TypeScript curriculum milestone projection engine"
```

---

### Task 3: Gantt Matrisi Görünümü ve İnteraktif Arayüz Bileşeni (`src/generate_saas_app.js`)

**Files:**
- Modify: `src/generate_saas_app.js`
- Output: `www/index.html`
- Test: `tests/saas_projection_view.test.js`

**Interfaces:**
- HTML View: `<section id="view-projection" class="view-panel hidden">`
- Topbar & Sidebar nav button: `data-tab="projection"` with label "Yol Haritası"
- Gantt Component: `#curriculum-gantt-matrix` with `.gantt-timeline-header`, `.gantt-row`, `.unit-segment`, `.gantt-tooltip`, `#projection-drilldown`

- [ ] **Step 1: Write failing UI structure tests**

```javascript
// tests/saas_projection_view.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('www/index.html includes projection tab, interactive Gantt matrix, and drilldown panel', () => {
  const html = fs.readFileSync(path.resolve(process.cwd(), 'www/index.html'), 'utf8');

  assert.ok(html.includes('data-tab="projection"'), 'Must have projection tab button');
  assert.ok(html.includes('id="view-projection"'), 'Must have projection view container');
  assert.ok(html.includes('id="curriculum-gantt-matrix"'), 'Must have Gantt matrix element');
  assert.ok(html.includes('id="projection-drilldown"'), 'Must have drilldown panel');
  assert.ok(html.includes('tabular-nums'), 'Must use tabular-nums for numeric alignment');

  // Verify zero emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.ok(!emojiRegex.test(html), 'www/index.html must not contain emojis');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/saas_projection_view.test.js`
Expected: FAIL (projection view missing in generated HTML).

- [ ] **Step 3: Update `src/generate_saas_app.js` with Gantt matrix rendering and interactions**

1. Sol kenar çubuğuna ve üst navigasyona "Yol Haritası" sekmesini (`data-tab="projection"`) ekle.
2. `renderProjectionView` fonksiyonunu tanımla:
   - Üst KPI kartları: Hedef YKS projeksiyonu rozeti, Odaktaki Ünite kartı, Tamamlanan Üniteler sayacı (`tabular-nums`).
   - Zaman cetveli: Hafta 1 - 42, ay işaretçileri, Bugün ve 19 Haziran 2027 kılavuz çizgileri.
   - 9 ders satırı ve her satırda ünitelerin renkli segmentleri (Tarih için kehribar, Türkçe için zümrüt, Matematik için safir mavisi vb.).
   - Hover için zengin bilgi kartı (`.gantt-tooltip`).
   - Bloğa tıklandığında alt tarafta o ünitenin videolarını açan interaktif çekmece (`#projection-drilldown`).
3. İstemci tarafı script'ine `switchTab('projection')`, `updateProjectionView()`, ve `selectUnitForDrilldown(unitId)` mantığını ekle.
4. `node src/generate_saas_app.js` komutunu çalıştırarak `www/index.html` dosyasını derle.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/saas_projection_view.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/generate_saas_app.js www/index.html tests/saas_projection_view.test.js
git commit -m "feat(ui): add multi-track interactive curriculum Gantt matrix and drilldown view"
```

---

### Task 4: Tam Bütünleştirme, Kılavuz Güncellemesi ve Doğrulama

**Files:**
- Modify: `README.md`
- Run: Full test suite (`npm test`) and typecheck (`npm run typecheck`)

- [ ] **Step 1: Run full test suite and verify 100% pass**

Run: `npm test && npm run typecheck`
Expected: All tests pass cleanly (110+ passing tests, 0 failures, 0 TypeScript errors).

- [ ] **Step 2: Update `README.md`**

`README.md` dosyasına yeni "Çok Şeritli Müfredat Yol Haritası ve Gelecek Projeksiyonu (Gantt Matrisi)" bölümünü ve güncel dosya yapısını ekle (sıfır emoji kuralını koruyarak).

- [ ] **Step 3: Final Commit on branch `v2`**

```bash
git add README.md
git commit -m "docs(readme): document curriculum Gantt projection matrix and update test suite count"
```
