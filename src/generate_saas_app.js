import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCalendarDays } from './calendar_engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateSaaSApp() {
  const dataPath = path.resolve(__dirname, '../playlists_data_tr.json');
  const playlistsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const calendar = generateCalendarDays(playlistsData);

  const subjectBadges = {
    'TYT Türkçe': 'badge-turkce',
    'TYT-AYT Tarih': 'badge-tarih',
    'TYT Coğrafya': 'badge-cografya',
    'AYT Coğrafya': 'badge-ayt-cografya',
    'TYT Matematik': 'badge-matematik',
    'TYT Biyoloji': 'badge-biyoloji',
    'TYT Fizik': 'badge-fizik',
    'TYT Kimya': 'badge-kimya',
    'AYT Edebiyat': 'badge-edebiyat'
  };

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YKS 2027 Koçu — Profesyonel SaaS Çalışma Alanı</title>
  <meta name="description" content="Sıfırdan başlayan YKS 2027 öğrencileri için 766 videoluk masaüstü çalışma stüdyosu, master takvim, 20 dakikalık mola istasyonu ve stressiz kaydırma motoru.">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#0f172a">
  <link rel="apple-touch-icon" href="icons/icon-192.svg">
  <script>
    if ('serviceWorker' in navigator && (location.protocol.startsWith('http') || location.hostname === 'localhost')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.warn('SW registration failed:', err);
        });
      });
    }
  </script>
  <style>
    :root {
      --slate-950: #020617;
      --slate-900: #0f172a;
      --slate-800: #1e293b;
      --slate-700: #334155;
      --slate-600: #475569;
      --slate-500: #64748b;
      --slate-400: #94a3b8;
      --slate-300: #cbd5e1;
      --slate-200: #e2e8f0;
      --slate-100: #f1f5f9;
      --slate-50:  #f8fafc;
      --white:     #ffffff;

      --mint-500:  #10b981;
      --mint-600:  #059669;
      --mint-700:  #047857;
      --mint-100:  #d1fae5;
      --mint-50:   #ecfdf5;

      --amber-500: #f59e0b;
      --amber-50:  #fffbeb;
      --rose-500:  #f43f5e;
      --rose-50:   #fff1f2;
      --sky-500:   #0ea5e9;
      --sky-50:    #f0f9ff;
      --indigo-500:#6366f1;
      --indigo-50: #eef2ff;

      --bg-page:    var(--slate-50);
      --bg-surface: var(--white);
      --bg-subtle:  var(--slate-100);
      --border:     var(--slate-200);
      --border-strong: var(--slate-300);

      --text-main:      var(--slate-900);
      --text-secondary: var(--slate-600);
      --text-muted:     var(--slate-400);

      --sidebar-width: 260px;
      --topbar-height: 64px;
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 14px;
      --radius-xl: 18px;

      --shadow-sm: 0 1px 2px 0 rgba(15, 23, 42, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05);
      --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04);
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif;
      background-color: var(--bg-page);
      color: var(--text-main);
      line-height: 1.5;
      font-size: 15px;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    .tabular-nums {
      font-variant-numeric: tabular-nums;
    }

    /* Layout Structure */
    .saas-layout-wrapper {
      display: flex;
      min-height: 100vh;
      width: 100vw;
    }

    /* Sidebar */
    .saas-sidebar {
      width: var(--sidebar-width);
      background-color: var(--slate-900);
      color: var(--slate-100);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      border-right: 1px solid var(--slate-800);
      z-index: 100;
      transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-brand-area {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--slate-800);
    }

    .brand-logo-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--mint-500), var(--mint-700));
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--white);
      flex-shrink: 0;
    }

    .brand-title-wrap {
      overflow: hidden;
    }

    .brand-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--white);
      letter-spacing: -0.01em;
      white-space: nowrap;
    }

    .brand-subtitle {
      font-size: 12px;
      color: var(--slate-400);
      white-space: nowrap;
    }

    .sidebar-status-pill {
      margin: 16px 16px 8px;
      padding: 12px;
      background-color: var(--slate-800);
      border-radius: var(--radius-md);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .status-pill-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 12px;
    }

    .status-pill-title {
      font-weight: 600;
      color: var(--mint-500);
    }

    .status-pill-pct {
      font-weight: 700;
      color: var(--white);
    }

    .progress-bar-track {
      width: 100%;
      height: 6px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background-color: var(--mint-500);
      border-radius: 999px;
      transition: width 0.3s ease;
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--slate-400);
      padding: 12px 12px 4px;
    }

    .nav-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      color: var(--slate-300);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      transition: background 0.15s, color 0.15s;
    }

    .nav-btn:hover {
      background-color: rgba(255, 255, 255, 0.06);
      color: var(--white);
    }

    .nav-btn.active {
      background-color: var(--mint-500);
      color: var(--white);
      font-weight: 600;
    }

    .nav-btn-icon {
      font-size: 18px;
      width: 22px;
      text-align: center;
      flex-shrink: 0;
    }

    .nav-btn-shortcut {
      margin-left: auto;
      font-size: 11px;
      padding: 2px 6px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: var(--slate-400);
    }

    .nav-btn.active .nav-btn-shortcut {
      background-color: rgba(0, 0, 0, 0.2);
      color: var(--white);
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--slate-800);
      font-size: 12px;
    }

    .countdown-widget {
      padding: 12px;
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-md);
    }

    .countdown-label {
      color: var(--slate-400);
      margin-bottom: 4px;
    }

    .countdown-val {
      font-size: 14px;
      font-weight: 700;
      color: var(--white);
    }

    /* Main Container */
    .saas-main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      background-color: var(--bg-page);
    }

    /* Top Command Bar */
    .saas-topbar {
      height: var(--topbar-height);
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 90;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .mobile-menu-btn {
      display: none;
      background: transparent;
      border: none;
      color: var(--text-main);
      font-size: 20px;
      cursor: pointer;
    }

    .topbar-breadcrumbs {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .breadcrumb-root {
      color: var(--text-secondary);
      font-weight: 500;
    }

    .breadcrumb-sep {
      color: var(--text-muted);
    }

    .breadcrumb-current {
      color: var(--text-main);
      font-weight: 600;
    }

    .topbar-center {
      flex: 1;
      max-width: 480px;
      margin: 0 24px;
    }

    .command-search-trigger {
      width: 100%;
      height: 38px;
      background-color: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 13px;
      cursor: pointer;
      transition: border-color 0.15s, background-color 0.15s;
    }

    .command-search-trigger:hover {
      border-color: var(--mint-500);
      background-color: var(--bg-surface);
    }

    .command-search-shortcut {
      margin-left: auto;
      font-size: 11px;
      padding: 2px 6px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-shift-trigger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 14px;
      background-color: var(--mint-50);
      color: var(--mint-700);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-shift-trigger:hover {
      background-color: var(--mint-100);
      border-color: var(--mint-500);
    }

    .topbar-timer-pill {
      display: none;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background-color: var(--amber-50);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      color: #b45309;
      cursor: pointer;
    }

    .topbar-progress-pill {
      font-size: 13px;
      font-weight: 700;
      color: var(--slate-700);
      background-color: var(--slate-100);
      padding: 6px 12px;
      border-radius: 999px;
    }

    /* Content Canvas */
    .saas-content-canvas {
      flex: 1;
      padding: 32px;
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
    }

    .saas-tab-view {
      display: none;
    }

    .saas-tab-view.active {
      display: block;
      animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .saas-sidebar {
        width: 72px;
      }
      .brand-title-wrap, .sidebar-status-pill, .nav-btn span:not(.nav-btn-icon), .nav-btn-shortcut, .nav-section-title, .countdown-widget {
        display: none !important;
      }
      .nav-btn {
        justify-content: center;
        padding: 12px 0;
      }
      .saas-topbar {
        padding: 0 16px;
      }
      .saas-content-canvas {
        padding: 20px 16px;
      }
    }

    @media (max-width: 768px) {
      .saas-sidebar {
        position: fixed;
        left: -260px;
        width: 260px;
        height: 100vh;
        z-index: 1000;
      }
      .saas-sidebar.open {
        left: 0;
      }
      .brand-title-wrap, .sidebar-status-pill, .nav-btn span, .nav-btn-shortcut, .nav-section-title, .countdown-widget {
        display: block !important;
      }
      .mobile-menu-btn {
        display: block;
      }
      .topbar-center {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="saas-layout-wrapper">
    <!-- Left SaaS Sidebar -->
    <aside class="saas-sidebar" id="saas-sidebar">
      <div class="sidebar-brand-area">
        <div class="brand-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <div class="brand-title-wrap">
          <div class="brand-name">YKS 2027 Koçu</div>
          <div class="brand-subtitle">Masaüstü Çalışma Alanı</div>
        </div>
      </div>

      <div class="sidebar-status-pill">
        <div class="status-pill-header">
          <span class="status-pill-title" id="sidebar-active-tag">Hafta 1 • Pazartesi</span>
          <span class="status-pill-pct tabular-nums" id="sidebar-pct-label">%0</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="sidebar-progress-fill" style="width: 0%;"></div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">Çalışma Alanı</div>
        <button class="nav-btn active" id="nav-btn-today" onclick="switchSaaSTab('tab-today')">
          <span class="nav-btn-icon">🎯</span>
          <span>Çalışma Stüdyosu</span>
          <span class="nav-btn-shortcut">1</span>
        </button>
        <button class="nav-btn" id="nav-btn-radar" onclick="switchSaaSTab('tab-radar')">
          <span class="nav-btn-icon">🗺️</span>
          <span>Master Takvim</span>
          <span class="nav-btn-shortcut">2</span>
        </button>
        <button class="nav-btn" id="nav-btn-curriculum" onclick="switchSaaSTab('tab-curriculum')">
          <span class="nav-btn-icon">📚</span>
          <span>Müfredat Tablosu</span>
          <span class="nav-btn-shortcut">3</span>
        </button>
        <div class="nav-section-title">Yönetim</div>
        <button class="nav-btn" id="nav-btn-settings" onclick="switchSaaSTab('tab-settings')">
          <span class="nav-btn-icon">⚙️</span>
          <span>Veri & Yedekleme</span>
          <span class="nav-btn-shortcut">4</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="countdown-widget">
          <div class="countdown-label">19 Haziran 2027 Hedefi</div>
          <div class="countdown-val tabular-nums" id="sidebar-target-countdown">Geri sayım yükleniyor...</div>
        </div>
      </div>
    </aside>

    <!-- Main Container -->
    <div class="saas-main-container">
      <!-- Top Command Bar -->
      <header class="saas-topbar">
        <div class="topbar-left">
          <button class="mobile-menu-btn" onclick="toggleSidebar()" aria-label="Menü">☰</button>
          <div class="topbar-breadcrumbs">
            <span class="breadcrumb-root">Çalışma Alanı</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current" id="topbar-breadcrumb-title">Çalışma Stüdyosu</span>
          </div>
        </div>

        <div class="topbar-center">
          <button class="command-search-trigger" onclick="openCommandPalette()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>Video veya konu ara...</span>
            <span class="command-search-shortcut">⌘K / Ctrl+K</span>
          </button>
        </div>

        <div class="topbar-right">
          <button class="btn-shift-trigger" onclick="triggerShiftEngine()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span>Stressiz Kaydır</span>
          </button>
          <div class="topbar-timer-pill tabular-nums" id="topbar-timer-pill" onclick="switchSaaSTab('tab-today')">
            <span>☕ Mola: </span><span id="topbar-timer-text">20:00</span>
          </div>
          <div class="topbar-progress-pill tabular-nums" id="topbar-progress-pill">
            0 / 766 Video
          </div>
        </div>
      </header>

      <!-- Content Canvas -->
      <main class="saas-content-canvas">
        <div class="saas-tab-view active" id="tab-today">
          <!-- Populated in Task 2 -->
        </div>

        <div class="saas-tab-view" id="tab-radar">
          <!-- Populated in Task 3 -->
        </div>

        <div class="saas-tab-view" id="tab-curriculum">
          <!-- Populated in Task 4 -->
        </div>

        <div class="saas-tab-view" id="tab-settings">
          <!-- Populated in Task 6 -->
        </div>
      </main>
    </div>
  </div>

  <script>
    function switchSaaSTab(tabId) {
      document.querySelectorAll('.saas-tab-view').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');

      const btnMap = {
        'tab-today': 'nav-btn-today',
        'tab-radar': 'nav-btn-radar',
        'tab-curriculum': 'nav-btn-curriculum',
        'tab-settings': 'nav-btn-settings'
      };
      const activeBtn = document.getElementById(btnMap[tabId]);
      if (activeBtn) activeBtn.classList.add('active');

      const breadcrumbMap = {
        'tab-today': 'Çalışma Stüdyosu (Bugün)',
        'tab-radar': 'Master Takvim & Radar',
        'tab-curriculum': 'Müfredat Veri Bankası',
        'tab-settings': 'Veri & Yedekleme'
      };
      const bc = document.getElementById('topbar-breadcrumb-title');
      if (bc && breadcrumbMap[tabId]) bc.textContent = breadcrumbMap[tabId];
    }

    function toggleSidebar() {
      const sb = document.getElementById('saas-sidebar');
      if (sb) sb.classList.toggle('open');
    }

    function openCommandPalette() {
      // Defined in Task 5
    }

    function triggerShiftEngine() {
      // Defined in Task 3
    }
  </script>
</body>
</html>`;

  return html;
}

// CLI entry point
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const html = generateSaaSApp();
  const outPath = path.resolve(__dirname, '../www/index.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`Generated SaaS web application: ${outPath} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
}
