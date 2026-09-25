# Tarih Çapalı Yuvarlanan Takvim ve Özelleştirilebilir Şablon Uygulama Planı (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** YKS 2027 Koçu takvimini gerçek takvim tarihleriyle (örneğin *25 Eylül 2026, Cuma*) başlatan, bağımsız branş bazlı FIFO kuyruğuyla hiçbir önkoşul videoyu atlamayan ve `/admin` panelinde haftalık blok sayısının ve derslerinin tamamen özelleştirilebildiği dinamik şablon mimarisini hayata geçirmek.

**Architecture:** 
- **Katman 1 (Şablon):** `default_blueprint.json` ve `localStorage['yks_weekly_blueprint']` üzerinden her günün blok sayısı ve ders yuvalarını yöneten yapılandırılabilir şablon.
- **Katman 2 (Ders Besleyici):** 9 ders için izlenmemiş videoları tutan ve kaçırılan videoları (#1 Coğrafya) sırası geldiğinde ilk sırada veren FIFO kuyruk motoru.
- **Katman 3 (Tarih Çapalı Takvim):** Gerçek takvim tarihleri üzerinden ilerleyen, Pazar günlerine kesin dinlenme uygulayan ve 19 Haziran 2027 bitiş tarihini anlık projeksiyonla hesaplayan takvim sericisi.

**Tech Stack:** Node.js (ES Modules), TypeScript, Vanilla HTML5/CSS3 (Impeccable Design, 0 emoji, Tabular Nums), Node.js Test Runner (`node:test`).

**Spec:** `docs/superpowers/specs/2026-09-25-date-anchored-rolling-calendar-and-custom-blueprint-design.md`

## Global Constraints

- Sıfır emoji kuralı: UI'da, kodda veya veride hiçbir emoji bulunamaz.
- Sıfır video kaybı ve sıfır mükerrer: 766 videonun tamamı takvimde yer almalıdır.
- Pazar kuralı: Gerçek takvim Pazar günleri daima `isRestDay: true` dinlenme günüdür, ders konamaz.
- Önkoşul kuralı: Bir dersten daha önce izlenmemiş video varken sonraki numaralı video takvime yerleştirilemez.
- Minimum/maksimum blok sınırları: Her gün için minimum 2 blok, maksimum 6 blok.
- Tam test kapsamı: Tüm değişiklikler `node:test` ile doğrulanmalı, 98+ test başarıyla geçmelidir.

---

### Task 1: Varsayılan Haftalık Şablon Modülü ve Tip Tanımları

**Files:**
- Create: `src/default_blueprint.json`
- Modify: `src/web/types.ts`
- Test: `tests/date_anchored_calendar_and_blueprint.test.js`

**Interfaces:**
- Consumes: `playlists_data_tr.json` ders isimleri
- Produces: `DEFAULT_WEEKLY_BLUEPRINT`, `WeeklyBlueprint` arayüzü

- [ ] **Step 1: Write failing test for default blueprint and type contracts**

```javascript
// tests/date_anchored_calendar_and_blueprint.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('src/default_blueprint.json exists and defines 6 study days with valid subjects', () => {
  const raw = fs.readFileSync('src/default_blueprint.json', 'utf8');
  const bp = JSON.parse(raw);
  assert.ok(bp.pazartesi && bp.pazartesi.length === 4);
  assert.ok(bp.sali && bp.sali.length === 4);
  assert.ok(bp.carsamba && bp.carsamba.length === 4);
  assert.ok(bp.persembe && bp.persembe.length === 4);
  assert.ok(bp.cuma && bp.cuma.length === 4);
  assert.ok(bp.cumartesi && bp.cumartesi.length === 4);
  assert.ok(!bp.pazar || bp.pazar.length === 0, 'Pazar must not contain study blocks');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/date_anchored_calendar_and_blueprint.test.js`
Expected: FAIL (no such file `src/default_blueprint.json`)

- [ ] **Step 3: Create `src/default_blueprint.json` and update `src/web/types.ts`**

```json
{
  "pazartesi": ["TYT Türkçe", "TYT Türkçe", "TYT Coğrafya", "TYT Coğrafya"],
  "sali": ["TYT Matematik", "TYT Matematik", "TYT-AYT Tarih", "TYT-AYT Tarih"],
  "carsamba": ["TYT Biyoloji", "TYT Biyoloji", "AYT Edebiyat", "AYT Edebiyat"],
  "persembe": ["TYT Matematik", "TYT Matematik", "TYT Kimya", "TYT Kimya"],
  "cuma": ["TYT Fizik", "TYT Fizik", "AYT Edebiyat", "AYT Edebiyat"],
  "cumartesi": ["TYT-AYT Tarih", "TYT-AYT Tarih", "TYT Biyoloji", "Tekrar & Soru Çözümü"],
  "pazar": []
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/date_anchored_calendar_and_blueprint.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/default_blueprint.json src/web/types.ts tests/date_anchored_calendar_and_blueprint.test.js
git commit -m "feat(blueprint): define default weekly schedule blueprint and contracts"
```

---

### Task 2: Takvim Motorunun Tarih Çapalı ve Şablon Destekli Olarak Güncellenmesi

**Files:**
- Modify: `src/calendar_engine.js`
- Test: `tests/date_anchored_calendar_and_blueprint.test.js`

**Interfaces:**
- Consumes: `generateCalendarDays(playlistData, options)`
- Options: `{ startDate: '2026-09-25', blueprint: WeeklyBlueprint, completedVideos: Record<string, boolean> }`
- Produces: `DaySchedule` with `dateIso`, `dateFormatted`, `studyDayNumber`, `isRestDay`, `blocks`.

- [ ] **Step 1: Write test for date-anchored rolling schedule and custom blueprint**

```javascript
test('calendar_engine generates date-anchored schedule with real dates and strict Sunday rest', () => {
  const { generateCalendarDays } = await import('../src/calendar_engine.js');
  const playlists = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const schedule = generateCalendarDays(playlists, {
    startDate: '2026-09-25' // Cuma
  });

  const day1 = schedule[0].days[0];
  assert.equal(day1.dateIso, '2026-09-25');
  assert.equal(day1.dayName, 'Cuma');
  assert.equal(day1.studyDayNumber, 1);
  assert.equal(day1.isRestDay, false);

  // Sunday check: 27 Eylül 2026 must be Pazar and isRestDay = true
  const sunday = schedule[0].days[2];
  assert.equal(sunday.dateIso, '2026-09-27');
  assert.equal(sunday.dayName, 'Pazar');
  assert.equal(sunday.isRestDay, true);
  assert.equal(sunday.blocks.length, 0);
});

test('calendar_engine preserves uncompleted subject queue (missed Coğrafya #1 is served on next Coğrafya slot)', () => {
  const { shiftScheduleWithBlueprint } = await import('../src/calendar_engine.js');
  const playlists = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));

  // Mark only Türkçe as completed on Friday; leave Coğrafya #1 and #2 uncompleted
  const completed = {
    [playlists['TYT Türkçe'].videos[0].id]: true,
    [playlists['TYT Türkçe'].videos[1].id]: true
  };

  const result = shiftScheduleWithBlueprint(playlists, completed, { startDate: '2026-09-25' });
  
  // Find next Coğrafya block in the schedule
  let firstScheduledCografya = null;
  for (const week of result.schedule) {
    for (const day of week.days) {
      for (const block of day.blocks) {
        if (block.subject === 'TYT Coğrafya' && !completed[block.video.id]) {
          firstScheduledCografya = block.video;
          break;
        }
      }
      if (firstScheduledCografya) break;
    }
    if (firstScheduledCografya) break;
  }

  assert.ok(firstScheduledCografya);
  assert.equal(firstScheduledCografya.id, playlists['TYT Coğrafya'].videos[0].id, 'Must serve Coğrafya #1, not #3');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/date_anchored_calendar_and_blueprint.test.js`
Expected: FAIL (options not supported yet)

- [ ] **Step 3: Implement date-anchored rolling schedule and blueprint in `src/calendar_engine.js`**

Implement `generateCalendarDays(playlistData, options)` and `shiftScheduleWithBlueprint(playlistData, compMap, options)` with real dates, ISO formatting, Turkish date strings, and dynamic blueprint support.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/date_anchored_calendar_and_blueprint.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/calendar_engine.js tests/date_anchored_calendar_and_blueprint.test.js
git commit -m "feat(calendar): implement date-anchored rolling calendar and FIFO subject progression"
```

---

### Task 3: Yönetim Panelinde (`/admin`) Görsel Şablon Düzenleyici

**Files:**
- Modify: `src/generate_admin_app.js`
- Test: `tests/admin_and_emoji_directive.test.js`

**Interfaces:**
- Produces: Visual blueprint editor card with 6 days, block rows, subject dropdowns, `[+ Blok Ekle]`, `[Bloğu Sil]`, "Şablonu Kaydet ve Takvime Uygula", "Varsayılana Sıfırla".

- [ ] **Step 1: Write test for admin blueprint editor**

```javascript
test('www/admin.html includes Weekly Blueprint Editor with slot customization controls', () => {
  const html = fs.readFileSync('www/admin.html', 'utf8');
  assert.ok(html.includes('Haftalık Ders ve Blok Şablonu'));
  assert.ok(html.includes('blueprint-day-column'));
  assert.ok(html.includes('addBlueprintBlock'));
  assert.ok(html.includes('removeBlueprintBlock'));
  assert.ok(html.includes('saveCustomBlueprint'));
  assert.ok(html.includes('resetDefaultBlueprint'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/admin_and_emoji_directive.test.js`
Expected: FAIL

- [ ] **Step 3: Implement Visual Blueprint Editor in `src/generate_admin_app.js`**

Add editor UI, CSS styles conforming to Impeccable directives (no cards within cards, clear contrast, tabular numbers), and client JavaScript to manipulate the blueprint in `localStorage` and trigger schedule rebuild.

- [ ] **Step 4: Regenerate `www/admin.html` and verify tests**

Run: `node src/generate_admin_app.js && node --test tests/admin_and_emoji_directive.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/generate_admin_app.js www/admin.html tests/admin_and_emoji_directive.test.js
git commit -m "feat(admin): add interactive weekly blueprint editor to admin console"
```

---

### Task 4: Öğrenci Arayüzünde Gerçek Tarih, Çalışma Günü Sayacı ve Dinamik Dengeleme Entegrasyonu

**Files:**
- Modify: `src/generate_saas_app.js`
- Test: `tests/saas_fixes_scale_timer_past.test.js`

**Interfaces:**
- Produces: Daily studio header showing `25 Eylül 2026, Cuma • 1. Çalışma Günü`, dynamic block rendering according to blueprint, and date-anchored "Programı Dengele" behavior.

- [ ] **Step 1: Write test for SaaS date-anchored display and dynamic block rendering**

```javascript
test('www/index.html displays real date, study day number, and reads dynamic blueprint', () => {
  const html = fs.readFileSync('www/index.html', 'utf8');
  assert.ok(html.includes('studio-date-title'));
  assert.ok(html.includes('studyDayNumber'));
  assert.ok(html.includes('yks_weekly_blueprint'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/saas_fixes_scale_timer_past.test.js`
Expected: FAIL

- [ ] **Step 3: Update `src/generate_saas_app.js` and client logic**

Embed the date-anchored rolling schedule engine, dynamic blueprint reader, and enhanced "Programı Dengele" confirmation and execution.

- [ ] **Step 4: Regenerate `www/index.html` and verify tests**

Run: `node src/generate_saas_app.js && node --test tests/saas_fixes_scale_timer_past.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/generate_saas_app.js www/index.html tests/saas_fixes_scale_timer_past.test.js
git commit -m "feat(saas): display real calendar dates, study day numbers, and dynamic blueprint slots"
```

---

### Task 5: Bütünleşik Sistem Doğrulaması, Tip Denetimi ve Android Senkronizasyonu

**Files:**
- Modify: `src/generate_mobile_app.js`, `src/web/app.ts`, `www/sw.js`
- Test: Tüm 23 test dosyası (`npm test`), `npm run typecheck`

- [ ] **Step 1: Sync mobile generator and TypeScript modules with blueprint and date-anchoring**
- [ ] **Step 2: Run `npm test` across all 98+ tests**
- [ ] **Step 3: Run `npm run typecheck`**
- [ ] **Step 4: Run `npx cap sync android`**
- [ ] **Step 5: Commit & update walkthrough**

```bash
git add src/generate_mobile_app.js src/web/app.ts www/mobile.html www/sw.js
git commit -m "chore(sync): synchronize mobile companion and service worker with date-anchored blueprint engine"
```
