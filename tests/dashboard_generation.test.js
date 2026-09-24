import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const DASHBOARD_PATH = 'yks_dashboard.html';

test('yks_dashboard.html exists and is a valid standalone HTML document', () => {
  assert.ok(fs.existsSync(DASHBOARD_PATH), `${DASHBOARD_PATH} does not exist`);
  const content = fs.readFileSync(DASHBOARD_PATH, 'utf8');
  assert.ok(content.length > 50000, `Dashboard file seems too small: ${content.length} bytes`);
  assert.ok(content.includes('<!DOCTYPE html>'), 'Missing doctype declaration');
  assert.ok(content.includes('<html'), 'Missing <html> tag');
  assert.ok(content.includes('</html>'), 'Missing </html> tag');
  assert.ok(content.includes('YKS 2027'), 'Missing title reference');
});

test('yks_dashboard.html contains all 766 curriculum videos and YouTube URLs', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const content = fs.readFileSync(DASHBOARD_PATH, 'utf8');

  let totalVideosCount = 0;
  const missingVideoIds = [];

  for (const [subject, info] of Object.entries(data)) {
    assert.ok(content.includes(subject), `Missing subject: ${subject}`);
    for (const v of info.videos) {
      totalVideosCount++;
      if (!content.includes(v.id)) {
        missingVideoIds.push({ id: v.id, title: v.title, subject });
      }
    }
  }

  assert.equal(totalVideosCount, 766, `Expected 766 curriculum videos in source data, found ${totalVideosCount}`);
  assert.equal(missingVideoIds.length, 0, `Missing ${missingVideoIds.length} video IDs in dashboard: ${JSON.stringify(missingVideoIds.slice(0, 5))}`);
  assert.ok(content.includes('https://www.youtube.com/watch?v='), 'Missing YouTube video links');
});

test('yks_dashboard.html contains 42 weeks structure and Sunday rest banner', () => {
  const content = fs.readFileSync(DASHBOARD_PATH, 'utf8');

  // Verify weeks 1 through 42
  for (let w = 1; w <= 42; w++) {
    assert.ok(content.includes(`Hafta ${w}`), `Missing reference to Hafta ${w}`);
  }

  // Verify Sunday rest banner exact requirement
  assert.ok(
    content.includes('PAZAR: ÇALIŞMAK KESİNLİKLE YASAK! (Beyin dinlenmeden öğrenme kalıcı olmaz)') ||
    content.includes('⛔ PAZAR: ÇALIŞMAK KESİNLİKLE YASAK! (Beyin dinlenmeden öğrenme kalıcı olmaz)'),
    'Missing exact Sunday rest day banner text'
  );

  // Verify rest day explanation
  assert.ok(
    content.includes('dinlenmeden') || content.includes('dinlenme') || content.includes('burnout'),
    'Missing rest day cognitive justification'
  );
});

test('yks_dashboard.html contains 20-minute break timer with countdown and audio chime', () => {
  const content = fs.readFileSync(DASHBOARD_PATH, 'utf8');

  // Break cards and trigger button
  assert.ok(content.includes('20 dk Mola') || content.includes('Mola (20 dk)'), 'Missing 20 min break reference');
  assert.ok(content.includes('Mola Başlat'), 'Missing break start button');

  // Timer logic (20 minutes = 1200 seconds)
  assert.ok(content.includes('1200') || content.includes('20 * 60'), 'Missing 1200s (20m) timer duration logic');
  assert.ok(content.includes('setInterval'), 'Missing countdown timer setInterval');
  assert.ok(content.includes('AudioContext') || content.includes('webkitAudioContext'), 'Missing Web Audio API chime implementation');
});

test('yks_dashboard.html contains localStorage persistence logic for watched videos', () => {
  const content = fs.readFileSync(DASHBOARD_PATH, 'utf8');

  assert.ok(content.includes('localStorage.getItem'), 'Missing localStorage.getItem for progress persistence');
  assert.ok(content.includes('localStorage.setItem'), 'Missing localStorage.setItem for progress persistence');
  assert.ok(content.includes('type="checkbox"'), 'Missing interactive checkbox elements');
});

test('yks_dashboard.html contains KPI counters and course progress bars', () => {
  const content = fs.readFileSync(DASHBOARD_PATH, 'utf8');

  // KPI elements
  assert.ok(content.includes('766'), 'Missing 766 total videos KPI');
  assert.ok(content.includes('İzlenen') || content.includes('Tamamlanan'), 'Missing watched videos counter');
  assert.ok(content.includes('Kalan'), 'Missing remaining videos counter');
  assert.ok(content.includes('Çalışma Süresi') || content.includes('Toplam Süre'), 'Missing study time counter');

  // 9 curriculum subjects progress
  const subjects = [
    'TYT Türkçe',
    'TYT-AYT Tarih',
    'TYT Coğrafya',
    'AYT Coğrafya',
    'TYT Matematik',
    'TYT Biyoloji',
    'TYT Fizik',
    'TYT Kimya',
    'AYT Edebiyat'
  ];

  for (const s of subjects) {
    assert.ok(content.includes(s), `Missing course progress for ${s}`);
  }
});

test('yks_dashboard.html contains search and topic filtering functionality', () => {
  const content = fs.readFileSync(DASHBOARD_PATH, 'utf8');

  assert.ok(content.includes('type="search"') || content.includes('id="search') || content.includes('filter'), 'Missing search input element');
  assert.ok(content.includes('toLowerCase'), 'Missing case-insensitive search logic');
});

test('yks_dashboard.html strictly complies with Impeccable UI craft directives', () => {
  const content = fs.readFileSync(DASHBOARD_PATH, 'utf8');

  // Enforce tabular-nums for scanability and counters
  assert.ok(content.includes('tabular-nums'), 'CSS must include tabular-nums for numeric figures');

  // Strictly bans AI slop
  assert.ok(!content.includes('-webkit-background-clip: text'), 'Gradient text is banned by Impeccable guidelines');
  assert.ok(!content.includes('background-clip: text'), 'Gradient text is banned by Impeccable guidelines');
  assert.ok(!content.includes('4px 4px 0'), 'Neobrutalist block shadows are banned by Impeccable guidelines');
  assert.ok(!content.includes('border-left: 4px solid'), 'Side-tab accent stripes on cards are banned by Impeccable guidelines');
});
