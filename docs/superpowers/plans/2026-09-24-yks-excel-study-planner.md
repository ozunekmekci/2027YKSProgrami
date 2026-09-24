# YKS Excel Study Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a multi-sheet, interactive Excel study planner (`YKS_2027_Calisma_Programi.xlsx`) and offline HTML companion dashboard featuring 746 verified YKS YouTube playlist videos with dependent dropdowns, automated durations, 20-minute break rhythms, and strict Sunday off enforcement before 19 June 2027.

**Architecture:** A Node.js build engine using `exceljs` reads cached metadata (`playlists_data_tr.json`), constructs 3 styled worksheets (`Hazır YKS Kamp Takvimi`, `Dinamik Haftalık Planlayıcı`, `Veri Bankası`) with exact Excel formulas and conditional formatting, and generates an accompanying interactive single-file web dashboard.

**Tech Stack:** Node.js (v26+), `exceljs`, `playlists_data_tr.json`, Vanilla JS / CSS for companion dashboard.

**Spec:** [docs/superpowers/specs/2026-09-24-yks-excel-study-planner-design.md](file:///home/znekm/Masaüstü/hermes/docs/superpowers/specs/2026-09-24-yks-excel-study-planner-design.md)

## Global Constraints

- 4 blocks per study day; 1 block = 1 video.
- 20 minutes fixed break between every block.
- Sunday strictly "ÇALIŞMAK KESİNLİKLE YASAK".
- Strict chronological video sequence (#1, #2, #3...).
- Target finish before 19 June 2027.
- Color palette conforming to Impeccable guidelines (Dark Slate `#1E293B`, Amber `#FEF3C7` / `#92400E`, Coral `#FEE2E2` / `#991B1B`, Mint `#DCFCE7` / `#166534`).

---

### Task 1: Project Setup and Data Pipeline Validation

**Files:**
- Create: `package.json`
- Create: `tests/test_data_integrity.js`
- Input: `playlists_data_tr.json`

**Interfaces:**
- Produces: `package.json` with `exceljs` installed; passing integrity test confirming 746 videos and 9 subjects with correct instructors.

- [ ] **Step 1: Create package.json and install exceljs**

```json
{
  "name": "yks-excel-study-planner",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.js",
    "build": "node src/build_excel.js"
  },
  "dependencies": {
    "exceljs": "^4.4.0"
  }
}
```

Command: `npm install`

- [ ] **Step 2: Write data integrity test**

```javascript
// tests/test_data_integrity.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('playlists_data_tr.json contains all 9 verified subjects and 746 total videos', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const subjects = Object.keys(data);
  assert.equal(subjects.length, 9);
  
  const expectedInstructors = {
    "TYT Türkçe": "Aker Kartal",
    "TYT-AYT Tarih": "Mehmet Celal Özyıldız",
    "TYT Coğrafya": "Yunus Hoca (Coğrafyanın Kodları)",
    "AYT Coğrafya": "Yunus Hoca (Coğrafyanın Kodları)",
    "TYT Matematik": "Selim Yüksel (Bıyıklı Matematik)",
    "TYT Biyoloji": "Semih Hoca (Biosem)",
    "TYT Fizik": "Altuğ Güneş (Fizikfinito)",
    "TYT Kimya": "Mesut Hoca (Meschemy Kimya)",
    "AYT Edebiyat": "Deniz Hoca"
  };

  let totalVideos = 0;
  for (const [subj, info] of Object.entries(data)) {
    assert.equal(info.metadata.instructor, expectedInstructors[subj]);
    totalVideos += info.videos.length;
    for (const v of info.videos) {
      assert.ok(v.title, `Video missing title in ${subj}`);
      assert.ok(v.duration_min >= 0, `Video missing duration in ${subj}`);
      assert.ok(v.url.startsWith('https://www.youtube.com/watch?v='), `Invalid URL in ${subj}`);
    }
  }
  assert.equal(totalVideos, 746);
});
```

- [ ] **Step 3: Run test to verify passes**

Run: `node --test tests/test_data_integrity.test.js`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json tests/test_data_integrity.test.js
git commit -m "chore: setup package.json and verify playlist dataset integrity"
```

---

### Task 2: Build Calendar Engine (Sheet 1: `Hazır YKS Kamp Takvimi`)

**Files:**
- Create: `src/calendar_engine.js`
- Create: `tests/calendar_engine.test.js`

**Interfaces:**
- Produces: `generateCalendarDays()` returning chronological daily schedules (Monday to Sunday) mapping 4 video blocks + 3 break intervals per day, with Pazar as a rest day.

- [ ] **Step 1: Write unit test for calendar schedule generation**

```javascript
// tests/calendar_engine.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateCalendarDays } from '../src/calendar_engine.js';

test('calendar generator maps 746 videos across ~42 weeks with 4 blocks/day and Sunday off', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const weeks = generateCalendarDays(data);
  
  assert.ok(weeks.length >= 38 && weeks.length <= 42, `Week count should be around 38-42, got ${weeks.length}`);
  
  // Verify Week 1 Monday
  const week1 = weeks[0];
  const monday = week1.days.find(d => d.dayName === 'Pazartesi');
  assert.equal(monday.blocks.length, 4);
  assert.equal(monday.blocks[0].subject, 'TYT Türkçe');
  assert.equal(monday.blocks[0].video.index, 1);
  assert.equal(monday.blocks[1].subject, 'TYT Türkçe');
  assert.equal(monday.blocks[1].video.index, 2);
  assert.equal(monday.blocks[2].subject, 'TYT Coğrafya');
  assert.equal(monday.blocks[2].video.index, 1);
  assert.equal(monday.blocks[3].subject, 'TYT Coğrafya');
  assert.equal(monday.blocks[3].video.index, 2);

  // Verify Sunday
  const sunday = week1.days.find(d => d.dayName === 'Pazar');
  assert.equal(sunday.isRestDay, true);
});
```

- [ ] **Step 2: Implement calendar_engine.js**

```javascript
// src/calendar_engine.js
export function generateCalendarDays(playlistData) {
  // Weekly structure:
  // Pzt: TYT Türkçe (2), TYT Coğrafya (2)
  // Sal: TYT Matematik (2), TYT-AYT Tarih (2)
  // Çar: TYT Biyoloji (2), AYT Edebiyat (2)
  // Per: TYT Matematik (2), TYT Kimya (2)
  // Cum: TYT Fizik (2), AYT Edebiyat (2 -> then AYT Coğrafya when finished)
  // Cmt: TYT-AYT Tarih (2), TYT Biyoloji (2 -> then Soru/Tekrar when finished)
  // Paz: Rest day

  const queues = {};
  for (const [subj, info] of Object.entries(playlistData)) {
    queues[subj] = [...info.videos];
  }

  const weeks = [];
  let weekNum = 1;
  const maxWeeks = 45;

  while (weekNum <= maxWeeks) {
    const days = [];
    const dayConfigs = [
      { name: 'Pazartesi', s1: 'TYT Türkçe', c1: 2, s2: 'TYT Coğrafya', c2: 2 },
      { name: 'Salı', s1: 'TYT Matematik', c1: 2, s2: 'TYT-AYT Tarih', c2: 2 },
      { name: 'Çarşamba', s1: 'TYT Biyoloji', c1: 2, s2: 'AYT Edebiyat', c2: 2 },
      { name: 'Perşembe', s1: 'TYT Matematik', c1: 2, s2: 'TYT Kimya', c2: 2 },
      { 
        name: 'Cuma', 
        s1: 'TYT Fizik', c1: 2, 
        s2: queues['AYT Edebiyat']?.length > 0 ? 'AYT Edebiyat' : 'AYT Coğrafya', c2: 2 
      },
      { 
        name: 'Cumartesi', 
        s1: 'TYT-AYT Tarih', c1: 2, 
        s2: queues['TYT Biyoloji']?.length > 0 ? 'TYT Biyoloji' : 'Tekrar & Soru Çözümü', c2: 2 
      },
      { name: 'Pazar', isRestDay: true }
    ];

    let hasAnyVideo = false;

    for (const cfg of dayConfigs) {
      if (cfg.isRestDay) {
        days.push({ dayName: cfg.name, isRestDay: true });
        continue;
      }

      const blocks = [];
      // Subject 1
      for (let i = 0; i < cfg.c1; i++) {
        const v = queues[cfg.s1]?.shift();
        if (v) {
          hasAnyVideo = true;
          blocks.push({ blockNum: blocks.length + 1, subject: cfg.s1, video: v, instructor: playlistData[cfg.s1].metadata.instructor });
        } else {
          blocks.push({ blockNum: blocks.length + 1, subject: cfg.s1, video: { title: 'Konu Tekrarı & Soru Çözümü', duration_min: 40, url: '' }, instructor: '' });
        }
      }
      // Subject 2
      for (let i = 0; i < cfg.c2; i++) {
        const v = queues[cfg.s2]?.shift();
        if (v) {
          hasAnyVideo = true;
          blocks.push({ blockNum: blocks.length + 1, subject: cfg.s2, video: v, instructor: playlistData[cfg.s2]?.metadata?.instructor || '' });
        } else {
          blocks.push({ blockNum: blocks.length + 1, subject: cfg.s2, video: { title: 'Konu Tekrarı & Soru Çözümü', duration_min: 40, url: '' }, instructor: '' });
        }
      }

      days.push({ dayName: cfg.name, isRestDay: false, blocks });
    }

    weeks.push({ weekNum, days });
    if (!hasAnyVideo && weekNum > 40) break;
    weekNum++;
  }

  return weeks;
}
```

- [ ] **Step 3: Run test to verify passes**

Run: `node --test tests/calendar_engine.test.js`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/calendar_engine.js tests/calendar_engine.test.js
git commit -m "feat: implement chronological YKS calendar distribution engine"
```

---

### Task 3: Build Complete Excel Generator (`build_excel.js`)

**Files:**
- Create: `src/build_excel.js`
- Create: `tests/excel_generation.test.js`
- Produces: `YKS_2027_Calisma_Programi.xlsx`

**Interfaces:**
- Produces: Formatted 3-sheet XLSX workbook with:
  1. `Hazır YKS Kamp Takvimi`
  2. `Dinamik Haftalık Planlayıcı` (with Course Data Validation & Duration formulas)
  3. `Veri Bankası` (All 746 videos with Named Ranges).

- [ ] **Step 1: Write test for Excel generation**

```javascript
// tests/excel_generation.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ExcelJS from 'exceljs';

test('build_excel produces valid XLSX file with all 3 worksheets', async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('YKS_2027_Calisma_Programi.xlsx');
  
  assert.equal(workbook.worksheets.length, 3);
  const sheetNames = workbook.worksheets.map(s => s.name);
  assert.ok(sheetNames.includes('Hazır YKS Kamp Takvimi'));
  assert.ok(sheetNames.includes('Dinamik Haftalık Planlayıcı'));
  assert.ok(sheetNames.includes('Veri Bankası'));

  // Test Veri Bankası video count
  const dbSheet = workbook.getWorksheet('Veri Bankası');
  assert.equal(dbSheet.rowCount >= 747, true); // Header + 746 rows
});
```

- [ ] **Step 2: Implement build_excel.js**
Build full generator applying Impeccable styling, font families, exact headers, formulas, links, and conditional formats.

- [ ] **Step 3: Run build and verify test passes**

Run: `node src/build_excel.js && node --test tests/excel_generation.test.js`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/build_excel.js tests/excel_generation.test.js YKS_2027_Calisma_Programi.xlsx
git commit -m "feat: assemble production-grade multi-sheet YKS Excel workbook"
```

---

### Task 4: Build Interactive HTML Companion Dashboard

**Files:**
- Create: `src/generate_dashboard.js`
- Produces: `yks_dashboard.html`

**Interfaces:**
- Produces: Responsive, standalone HTML dashboard with:
  - Week-by-week calendar view matching the Excel.
  - Interactive checkboxes with LocalStorage persistence.
  - Live progress counters (total minutes watched, % complete).
  - Built-in 20-minute break timer with audio/visual notification.
  - One-click YouTube video links.

- [ ] **Step 1: Implement generate_dashboard.js**
- [ ] **Step 2: Run script to generate yks_dashboard.html**
- [ ] **Step 3: Verify HTML structure and integrity**
- [ ] **Step 4: Commit**

```bash
git add src/generate_dashboard.js yks_dashboard.html
git commit -m "feat: build companion HTML dashboard with 20-min break timer and video tracking"
```

---

### Task 5: Final Review and Handoff

**Files:**
- Create: `README.md`
- Verify all artifacts

- [ ] **Step 1: Write user guide in README.md**
- [ ] **Step 2: Run all test suites**
- [ ] **Step 3: Final git commit**
