import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const MOBILE_HTML_PATH = 'www/mobile.html';

test('www/mobile.html exists and is a valid standalone mobile web application', () => {
  assert.ok(fs.existsSync(MOBILE_HTML_PATH), `${MOBILE_HTML_PATH} does not exist`);
  const content = fs.readFileSync(MOBILE_HTML_PATH, 'utf8');

  assert.ok(content.length > 50000, `Mobile app bundle seems too small: ${content.length} bytes`);
  assert.ok(content.includes('<!DOCTYPE html>'), 'Missing doctype declaration');
  assert.ok(content.includes('<html lang="tr">'), 'Missing <html lang="tr"> tag');
  assert.ok(content.includes('</html>'), 'Missing </html> tag');
  assert.ok(content.includes('YKS 2027 Koçu'), 'Missing title "YKS 2027 Koçu"');
  assert.ok(content.includes('viewport-fit=cover'), 'Missing viewport-fit=cover for Android edge-to-edge support');
});

test('www/index.html embeds all 766 curriculum videos with YouTube intent links and fallbacks', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const content = fs.readFileSync(MOBILE_HTML_PATH, 'utf8');

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
  assert.equal(missingVideoIds.length, 0, `Missing ${missingVideoIds.length} video IDs in mobile app: ${JSON.stringify(missingVideoIds.slice(0, 5))}`);

  // Intent links: vnd.youtube:ID and web fallback https://www.youtube.com/watch?v=
  assert.ok(content.includes('vnd.youtube:'), 'Missing vnd.youtube: native intent protocol');
  assert.ok(content.includes('https://www.youtube.com/watch?v='), 'Missing https://www.youtube.com/watch?v= fallback URL');
});

test('www/index.html adheres to Material Design 3 and Android guidelines', () => {
  const content = fs.readFileSync(MOBILE_HTML_PATH, 'utf8');

  // Top App Bar
  assert.ok(content.includes('top-app-bar') || content.includes('top-bar'), 'Missing Top App Bar element');
  assert.ok(content.includes('Hafta') || content.includes('active-week'), 'Missing active week indicator in top bar');
  assert.ok(content.includes('progress-pill') || content.includes('top-bar-pill') || content.includes('top-bar-pct'), 'Missing progress pill in top bar');

  // Material 3 Bottom Navigation Bar with 3 destinations: Bugün, Radar, Müfredat
  assert.ok(content.includes('bottom-nav') || content.includes('m3-bottom-nav'), 'Missing Bottom Navigation Bar');
  assert.ok(content.includes('Bugün'), 'Missing "Bugün" destination in navigation');
  assert.ok(content.includes('Radar') || content.includes('Gelecek & Geçmiş'), 'Missing "Radar" destination in navigation');
  assert.ok(content.includes('Müfredat'), 'Missing "Müfredat" destination in navigation');

  // >= 48x48 dp touch target rule for Android accessibility
  assert.ok(
    content.includes('min-height: 48px') || content.includes('min-height:48px') || content.includes('height: 48px') || content.includes('height: 56px') || content.includes('height: 64px') || content.includes('height: 72px'),
    'Bottom nav items must have at least 48px touch height'
  );
  assert.ok(
    content.includes('min-width: 48px') || content.includes('min-width:48px') || content.includes('flex: 1'),
    'Bottom nav items must have at least 48px touch width or full flexible distribution'
  );

  // Edge-to-edge window safe-area insets
  assert.ok(content.includes('env(safe-area-inset-top)'), 'Missing safe-area-inset-top for edge-to-edge display');
  assert.ok(content.includes('env(safe-area-inset-bottom)'), 'Missing safe-area-inset-bottom for edge-to-edge display');

  // Tabular numbers for scanability and timers
  assert.ok(content.includes('tabular-nums'), 'Missing font-variant-numeric: tabular-nums for numbers and timers');
});

test('www/index.html Tab 1 (Bugün): 4 blocks, mint checkboxes, 20-min break, haptics, and Sunday rest screen', () => {
  const content = fs.readFileSync(MOBILE_HTML_PATH, 'utf8');

  // 4 daily blocks structure
  assert.ok(content.includes('4 blok') || content.includes('Blok 1') || content.includes('block-num') || content.includes('c1: 2, s2:'), 'Missing 4 daily blocks structure');

  // Mint completion state
  assert.ok(
    content.includes('#10b981') || content.includes('#059669') || content.includes('#ecfdf5') || content.includes('mint'),
    'Missing mint green styling for completion state'
  );

  // 20-minute break timer (1200 seconds)
  assert.ok(content.includes('1200') || content.includes('20 * 60'), 'Missing 20-minute (1200s) break timer duration');
  assert.ok(content.includes('Mola') || content.includes('break'), 'Missing break timer references');

  // Web Audio chime (D5: 587.33 Hz, A5: 880 Hz)
  assert.ok(content.includes('587.33'), 'Missing D5 (587.33 Hz) chime tone');
  assert.ok(content.includes('880'), 'Missing A5 (880 Hz) chime tone');

  // Capacitor Haptics integration
  assert.ok(content.includes('Capacitor') && content.includes('Haptics'), 'Missing Capacitor Haptics plugin integration');

  // Exact Sunday rest screen requirement
  assert.ok(
    content.includes('⛔ PAZAR: ÇALIŞMAK KESİNLİKLE YASAK! (Beyin dinlenmeden öğrenme kalıcı olmaz)'),
    'Missing exact Sunday rest banner: ⛔ PAZAR: ÇALIŞMAK KESİNLİKLE YASAK! (Beyin dinlenmeden öğrenme kalıcı olmaz)'
  );
});

test('www/index.html Tab 2 (Radar): 42-week timeline, Stress-Free Shift Engine, and 19 June 2027 countdown', () => {
  const content = fs.readFileSync(MOBILE_HTML_PATH, 'utf8');

  // 42-week timeline
  for (let w = 1; w <= 42; w++) {
    assert.ok(content.includes(`Hafta ${w}`), `Missing timeline reference to Hafta ${w}`);
  }

  // 19 June 2027 countdown
  assert.ok(content.includes('19 Haziran 2027'), 'Missing 19 Haziran 2027 target date');
  assert.ok(content.includes('2027-06-19') || content.includes('June 19, 2027') || content.includes('Date(2027'), 'Missing Date calculation for 19 June 2027');

  // Stress-Free Shift Engine
  assert.ok(
    content.includes('Programı Bugüne Göre Güncelle (Shift)') || content.includes('Programı Bugüne Göre Güncelle'),
    'Missing Stress-Free Shift button text'
  );
  assert.ok(content.includes('shiftSchedule') || content.includes('applyShift') || content.includes('shiftForward') || content.includes('shiftEngine'), 'Missing shift engine execution function');
});

test('www/index.html Tab 3 (Müfredat): 9 subject progress bars, Turkish-aware search, and JSON backup/restore', () => {
  const content = fs.readFileSync(MOBILE_HTML_PATH, 'utf8');

  // 9 courses progress bars
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
    assert.ok(content.includes(s), `Missing course progress bar for ${s}`);
  }

  // Turkish-aware search & sorting
  assert.ok(content.includes("toLocaleLowerCase('tr-TR')"), 'Search must use Turkish locale-aware lowercase: toLocaleLowerCase(\'tr-TR\')');
  assert.ok(content.includes("localeCompare(") || content.includes("'tr-TR'"), 'Sorting should support Turkish collation');

  // JSON Backup & Restore
  assert.ok(content.includes('exportProgress') || content.includes('exportBackup') || content.includes('yedek_indir') || content.includes('Yedek İndir'), 'Missing progress export functionality');
  assert.ok(content.includes('importProgress') || content.includes('importBackup') || content.includes('yedek_yukle') || content.includes('Yedek Yükle'), 'Missing progress import functionality');
  assert.ok(content.includes('JSON.stringify') && content.includes('JSON.parse'), 'Missing JSON serialization/deserialization for backup');
});

test('www/index.html strictly complies with Impeccable UI craft directives', () => {
  const content = fs.readFileSync(MOBILE_HTML_PATH, 'utf8');

  // Strict bans: no AI slop
  assert.ok(!content.includes('-webkit-background-clip: text'), 'Banned: gradient text (-webkit-background-clip: text)');
  assert.ok(!content.includes('background-clip: text'), 'Banned: gradient text (background-clip: text)');
  assert.ok(!content.includes('4px 4px 0'), 'Banned: neobrutalist block shadows (4px 4px 0)');
  assert.ok(!content.includes('border-left: 4px solid'), 'Banned: side-tab accent stripes (border-left: 4px solid)');

  // Browser surface styling
  assert.ok(content.includes('::selection'), 'Missing custom ::selection styling');
  assert.ok(content.includes(':focus-visible'), 'Missing :focus-visible styling');
});
