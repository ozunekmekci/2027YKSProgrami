import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

// Ensure TypeScript is compiled
execSync('npx tsc', { encoding: 'utf8', stdio: 'pipe' });

const {
  AppController,
  app,
  switchTab,
  navigateDay,
  onDaySelectChange,
  jumpToWeek,
  toggleVideo,
  openYouTube,
  triggerShiftEngine,
  resetToOriginalSchedule,
  openTimerModal,
  closeTimerModal,
  toggleTimer,
  pauseTimer,
  resumeTimer,
  resetTimer,
  addTimerMinutes,
  registerServiceWorker,
  setupInstallPrompt,
  triggerInstallPrompt,
  exportProgress,
  importProgress,
  handleCurriculumSearch,
  clearCurriculumSearch
} = await import('../dist/web/app.js');

const { MemoryStorage } = await import('../dist/web/storage.js');

const INDEX_HTML_PATH = 'www/mobile.html';

// ---------------------------------------------------------------------------
// 1. TypeScript Strict Compilation & Source Structure
// ---------------------------------------------------------------------------
test('src/web/app.ts exists and compiles cleanly via npx tsc --noEmit', () => {
  assert.ok(fs.existsSync('src/web/app.ts'), 'src/web/app.ts must exist');

  let output = '';
  try {
    output = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
  } catch (err) {
    assert.fail(`tsc --noEmit failed: ${err.message}\nOutput: ${err.stdout || ''}\n${err.stderr || ''}`);
  }
  assert.equal(output.trim(), '', 'Strict TypeScript compilation must produce zero errors');
});

test('src/web/app.ts imports all required domain modules', () => {
  const code = fs.readFileSync('src/web/app.ts', 'utf8');

  assert.match(code, /from '\.\/types\.js'/, 'Must import from ./types.js');
  assert.match(code, /from '\.\/shift_engine\.js'/, 'Must import from ./shift_engine.js');
  assert.match(code, /from '\.\/timer\.js'/, 'Must import from ./timer.js');
  assert.match(code, /from '\.\/storage\.js'/, 'Must import from ./storage.js');
});

// ---------------------------------------------------------------------------
// 2. AppController State Management & Navigation
// ---------------------------------------------------------------------------
test('AppController initializes state with provided playlists and baseline schedule', () => {
  const storage = new MemoryStorage();
  const rawData = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const mockBaseline = [
    {
      weekNum: 1,
      days: [
        { dayName: 'Pazartesi', isRestDay: false, blocks: [] },
        { dayName: 'Salı', isRestDay: false, blocks: [] },
        { dayName: 'Çarşamba', isRestDay: false, blocks: [] },
        { dayName: 'Perşembe', isRestDay: false, blocks: [] },
        { dayName: 'Cuma', isRestDay: false, blocks: [] },
        { dayName: 'Cumartesi', isRestDay: false, blocks: [] },
        { dayName: 'Pazar', isRestDay: true }
      ]
    }
  ];

  const controller = new AppController(rawData, mockBaseline, storage);
  assert.equal(controller.activeWeekNum, 1);
  assert.equal(controller.activeDayIndex, 0);
  assert.equal(controller.activeTab, 'tab-today');
  assert.equal(Object.keys(controller.completedVideos).length, 0);
  assert.equal(controller.currentSchedule.length, 1);
});

test('AppController switchTab transitions active tab and ignores invalid tab IDs', () => {
  const controller = new AppController();
  assert.equal(controller.activeTab, 'tab-today');

  controller.switchTab('tab-radar');
  assert.equal(controller.activeTab, 'tab-radar');

  controller.switchTab('tab-curriculum');
  assert.equal(controller.activeTab, 'tab-curriculum');

  controller.switchTab('invalid-tab');
  assert.equal(controller.activeTab, 'tab-curriculum', 'Invalid tab ID should be ignored');
});

test('AppController navigateDay increments/decrements active day and advances weeks safely', () => {
  const storage = new MemoryStorage();
  const controller = new AppController({}, [], storage);

  assert.equal(controller.activeDayIndex, 0);
  assert.equal(controller.activeWeekNum, 1);

  // Advance day by 1 -> Salı (index 1)
  controller.navigateDay(1);
  assert.equal(controller.activeDayIndex, 1);
  assert.equal(controller.activeWeekNum, 1);
  assert.equal(storage.getItem('yks_active_day'), '1');

  // Jump to Pazar (index 6)
  controller.onDaySelectChange('1-6');
  assert.equal(controller.activeDayIndex, 6);
  assert.equal(controller.activeWeekNum, 1);

  // Advance day from Sunday -> Week 2, Monday (index 0)
  controller.navigateDay(1);
  assert.equal(controller.activeWeekNum, 2);
  assert.equal(controller.activeDayIndex, 0);
  assert.equal(storage.getItem('yks_active_week'), '2');

  // Decrement day from Monday -> Week 1, Sunday (index 6)
  controller.navigateDay(-1);
  assert.equal(controller.activeWeekNum, 1);
  assert.equal(controller.activeDayIndex, 6);
});

test('AppController toggleVideo persists watched state and removes unwatched', () => {
  const storage = new MemoryStorage();
  const controller = new AppController({}, [], storage);

  controller.toggleVideo('test-vid-1', true);
  assert.equal(controller.completedVideos['test-vid-1'], true);
  assert.ok(storage.getItem('yks_completed_videos')?.includes('test-vid-1'));

  controller.toggleVideo('test-vid-1', false);
  assert.equal(controller.completedVideos['test-vid-1'], undefined);
  assert.ok(!storage.getItem('yks_completed_videos')?.includes('test-vid-1'));
});

// ---------------------------------------------------------------------------
// 3. Direct YouTube Opening (Desktop _blank vs Android Intent)
// ---------------------------------------------------------------------------
test('AppController openYouTube handles web desktop via window.open with _blank, noopener, noreferrer', () => {
  let openedUrl = '';
  let openedTarget = '';
  let openedFeatures = '';
  let preventDefaultCalled = false;

  // Mock global window
  const originalWindow = globalThis.window;
  globalThis.window = {
    open: (url, target, features) => {
      openedUrl = url;
      openedTarget = target;
      openedFeatures = features;
      return null;
    }
  };

  try {
    const controller = new AppController();
    const mockEvent = {
      preventDefault: () => {
        preventDefaultCalled = true;
      }
    };

    controller.openYouTube('dQw4w9WgXcQ', mockEvent);

    assert.equal(preventDefaultCalled, true, 'openYouTube must call event.preventDefault()');
    assert.equal(openedUrl, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.equal(openedTarget, '_blank', 'Desktop opening must target _blank');
    assert.equal(openedFeatures, 'noopener,noreferrer', 'Must include noopener,noreferrer');
  } finally {
    globalThis.window = originalWindow;
  }
});

test('AppController openYouTube handles Android Capacitor native platform with vnd.youtube: intent', () => {
  let locationHref = '';
  let preventDefaultCalled = false;
  let blurListenerAdded = false;

  const originalWindow = globalThis.window;
  const originalSetTimeout = globalThis.setTimeout;
  let timerCb = null;

  globalThis.setTimeout = (fn) => {
    timerCb = fn;
    return 1;
  };

  globalThis.window = {
    location: {
      set href(val) {
        locationHref = val;
      }
    },
    addEventListener: (event) => {
      if (event === 'blur') blurListenerAdded = true;
    },
    removeEventListener: () => {},
    Capacitor: {
      isNativePlatform: () => true,
      getPlatform: () => 'android'
    }
  };

  try {
    const controller = new AppController();
    const mockEvent = {
      preventDefault: () => {
        preventDefaultCalled = true;
      }
    };

    controller.openYouTube('test-android-id', mockEvent);

    assert.equal(preventDefaultCalled, true);
    assert.equal(locationHref, 'vnd.youtube:test-android-id', 'Android Capacitor must trigger vnd.youtube: intent');
    assert.equal(blurListenerAdded, true, 'Must set up blur listener for fallback protection');
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.window = originalWindow;
  }
});

// ---------------------------------------------------------------------------
// 4. Stress-Free Shift Engine & Timer Integration
// ---------------------------------------------------------------------------
test('AppController triggerShiftEngine shifts uncompleted videos and resets active day', () => {
  const rawData = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const storage = new MemoryStorage();
  const controller = new AppController(rawData, [], storage);

  // Mark some videos completed
  const firstVideoId = rawData['TYT Türkçe'].videos[0].id;
  controller.toggleVideo(firstVideoId, true);

  // Jump to a later week
  controller.onDaySelectChange('5-3');
  assert.equal(controller.activeWeekNum, 5);

  const shifted = controller.triggerShiftEngine();
  assert.ok(shifted.length > 0, 'Shift engine must return schedule');
  assert.equal(controller.activeWeekNum, 1, 'Shift must reset to Week 1');
  assert.equal(controller.activeDayIndex, 0, 'Shift must reset to Monday (Day 0)');
  assert.equal(storage.getItem('yks_active_week'), '1');
  assert.equal(storage.getItem('yks_active_day'), '0');
  assert.ok(storage.getItem('yks_shifted_schedule'), 'Shifted schedule must be saved to storage');
});

test('AppController Break Timer methods initialize and transition states correctly', () => {
  const controller = new AppController();
  const timer = controller.initTimer(1200);

  const state1 = timer.getState();
  assert.equal(state1.duration, 1200);
  assert.equal(state1.remaining, 1200);
  assert.equal(state1.running, false);

  controller.openTimerModal(1200);
  const state2 = timer.getState();
  assert.equal(state2.running, true);

  controller.pauseTimer();
  assert.equal(timer.getState().running, false);

  controller.resumeTimer();
  assert.equal(timer.getState().running, true);

  controller.resetTimer();
  assert.equal(timer.getState().running, false);
  assert.equal(timer.getState().remaining, 1200);

  controller.addTimerMinutes(5);
  assert.equal(timer.getState().duration, 1500);
});

// ---------------------------------------------------------------------------
// 5. PWA Service Worker & Install Prompt Controller Hooks
// ---------------------------------------------------------------------------
test('AppController setupInstallPrompt & triggerInstallPrompt handle deferred prompt life-cycle', async () => {
  const controller = new AppController();

  let promptCalled = false;
  const mockPromptEvent = {
    platforms: ['web'],
    userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    prompt: async () => {
      promptCalled = true;
    }
  };

  // Initially deferredPrompt is null
  assert.equal(controller.deferredPrompt, null);
  const resultBefore = await controller.triggerInstallPrompt();
  assert.equal(resultBefore, false);

  // Simulate prompt captured
  controller.state.deferredPrompt = mockPromptEvent;
  assert.equal(controller.deferredPrompt, mockPromptEvent);

  const resultAfter = await controller.triggerInstallPrompt();
  assert.equal(promptCalled, true);
  assert.equal(resultAfter, true);
  assert.equal(controller.deferredPrompt, null, 'deferredPrompt must be cleared after prompt');
});

test('AppController backup and curriculum search methods operate cleanly', () => {
  const rawData = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const storage = new MemoryStorage();
  const controller = new AppController(rawData, [], storage);

  controller.toggleVideo('test-backup-vid', true);
  const backup = controller.exportProgress();
  assert.equal(backup.appName, 'YKS 2027 Koçu');
  assert.equal(backup.completedCount, 1);
  assert.equal(backup.completedVideos['test-backup-vid'], true);

  // Search with Turkish character handling
  const matches = controller.handleCurriculumSearch('türkçe');
  assert.ok(matches.length > 0, 'Turkish search must find matching videos');

  const matchesFonksiyon = controller.handleCurriculumSearch('fonksiyon');
  assert.ok(matchesFonksiyon.length > 0, 'Search for Fonksiyon must match videos');
});

// ---------------------------------------------------------------------------
// 6. Responsive Desktop & Mobile HTML Verification (www/index.html)
// ---------------------------------------------------------------------------
test('www/index.html contains PWA meta tags, manifest link, theme color, and service worker registration', () => {
  assert.ok(fs.existsSync(INDEX_HTML_PATH), 'www/index.html must exist');
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  // PWA Meta & Link Tags in <head>
  assert.match(html, /<link[^>]+rel=["']manifest["'][^>]+href=["']manifest\.json["']/, 'Must link manifest.json');
  assert.match(html, /<meta[^>]+name=["']theme-color["'][^>]+content=["']#0f172a["']/, 'Must declare theme-color #0f172a');
  assert.match(html, /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']icons\/icon-192\.svg["']/, 'Must link apple-touch-icon');

  // Service Worker registration script
  assert.match(html, /navigator\.serviceWorker\.register\(['"]\.\/sw\.js['"]\)/, 'Must register ./sw.js');
});

test('www/index.html contains responsive desktop CSS (@media (min-width: 1024px)) with widescreen layout', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  // Desktop media query
  assert.ok(html.includes('@media (min-width: 1024px)'), 'Must define @media (min-width: 1024px)');

  // Widescreen container 1300px
  assert.ok(html.includes('1300px'), 'Must define max-width: 1300px widescreen container');

  // Desktop horizontal navigation
  assert.ok(html.includes('desktop-nav-tabs'), 'Must contain desktop-nav-tabs container');
  assert.ok(html.includes('desktop-nav-btn'), 'Must contain desktop-nav-btn buttons');
  assert.match(html, /desktop-nav-btn[^>]*>[\s\S]*?Bugün/, 'Must include Bugün desktop tab');
  assert.match(html, /desktop-nav-btn[^>]*>[\s\S]*?Radar/, 'Must include Radar desktop tab');
  assert.match(html, /desktop-nav-btn[^>]*>[\s\S]*?Müfredat/, 'Must include Müfredat desktop tab');

  // Desktop Bugün 2-column grid
  assert.ok(html.includes('today-blocks-grid'), 'Must include today-blocks-grid');
  assert.ok(html.includes('grid-template-columns: repeat(2, 1fr)'), 'Must arrange blocks in 2-column grid on desktop');

  // Desktop Radar 42-week grid (2 or 3 columns)
  assert.ok(
    html.includes('grid-template-columns: repeat(3, 1fr)') || html.includes('grid-template-columns: repeat(2, 1fr)'),
    'Must arrange 42-week cards in 2 or 3 column grid on desktop'
  );

  // Desktop centered break timer modal
  assert.ok(html.includes('modalFadeIn') || html.includes('justify-content: center'), 'Timer sheet must center on desktop');
});

test('www/index.html contains mobile responsive CSS (@media (max-width: 767px)) with touch navigation', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  // Mobile media query
  assert.ok(
    html.includes('@media (max-width: 767px)') || html.includes('@media (max-width: 768px)'),
    'Must define mobile @media query'
  );

  // Retains bottom navigation bar on mobile
  assert.ok(html.includes('m3-bottom-nav'), 'Must contain m3-bottom-nav');
  assert.ok(html.includes('min-height: 48px'), 'Must preserve >=48px touch targets');
});

test('www/index.html implements direct new-tab YouTube links and PWA install prompt hook', () => {
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  // YouTube _blank link structure
  assert.ok(html.includes('target="_blank"'), 'YouTube buttons must have target="_blank"');
  assert.ok(html.includes('rel="noopener noreferrer"'), 'YouTube buttons must have rel="noopener noreferrer"');
  assert.ok(html.includes('openYouTube'), 'Must bind openYouTube handler');

  // PWA install prompt button & hooks
  assert.ok(html.includes('id="pwa-install-btn"'), 'Must define pwa-install-btn');
  assert.ok(html.includes('beforeinstallprompt'), 'Must listen to beforeinstallprompt event');
  assert.ok(html.includes('triggerInstallPrompt'), 'Must define triggerInstallPrompt function');
  assert.ok(html.includes('appinstalled'), 'Must listen to appinstalled event');
});

test('www/index.html contains all 766 curriculum videos embedded', () => {
  const data = JSON.parse(fs.readFileSync('playlists_data_tr.json', 'utf8'));
  const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  let totalVideos = 0;
  for (const info of Object.values(data)) {
    for (const v of info.videos || []) {
      totalVideos++;
      assert.ok(html.includes(v.id), `Video ${v.id} (${v.title}) must be embedded in www/index.html`);
    }
  }
  assert.equal(totalVideos, 766, 'All 766 videos must be embedded in index.html');
});
