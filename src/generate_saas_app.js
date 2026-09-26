import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCalendarDays, DEFAULT_WEEKLY_BLUEPRINT } from './calendar_engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateSaaSApp() {
  const dataPath = path.resolve(__dirname, '../playlists_data_tr.json');
  const playlistsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const unitsPath = path.resolve(__dirname, './data/curriculum_units.json');
  const curriculumUnits = JSON.parse(fs.readFileSync(unitsPath, 'utf8'));
  const calendar = generateCalendarDays(playlistsData, { startDate: '2026-09-26' });

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
        navigator.serviceWorker.register('./sw.js').then((reg) => {
          reg.update();
        }).catch(err => {
          console.warn('SW registration failed:', err);
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
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
      --bg-canvas:  var(--slate-50);
      --border:     var(--slate-200);
      --border-light: var(--slate-200);
      --border-medium: var(--slate-300);
      --border-subtle: var(--slate-100);
      --border-strong: var(--slate-300);
      --brand-navy: var(--slate-900);
      --rose-600:   #e11d48;

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
      background: var(--mint-600);
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
      font-weight: 700;
      letter-spacing: 0.03em;
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

    /* Badges */
    .subject-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .badge-turkce      { background: #eff6ff; color: #1d4ed8; }
    .badge-tarih       { background: #fef2f2; color: #b91c1c; }
    .badge-cografya    { background: #f0fdf4; color: #15803d; }
    .badge-ayt-cografya{ background: #ecfdf5; color: #047857; }
    .badge-matematik   { background: #faf5ff; color: #6b21a8; }
    .badge-biyoloji    { background: #f0fdfa; color: #0f766e; }
    .badge-fizik       { background: #fff7ed; color: #c2410c; }
    .badge-kimya       { background: #ecfeff; color: #0e7490; }
    .badge-edebiyat    { background: #fff1f2; color: #be123c; }
    .badge-genel       { background: #f1f5f9; color: #475569; }

    /* Task 2: Study Studio (Bugün) */
    .studio-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .studio-top-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 16px 20px;
    }

    .studio-nav-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .week-select-dropdown {
      height: 38px;
      padding: 0 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background-color: var(--bg-surface);
      color: var(--text-main);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      outline: none;
    }

    .week-select-dropdown:focus {
      border-color: var(--mint-500);
    }

    .day-tab-buttons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .day-tab-btn {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      padding: 6px 12px;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      background-color: var(--bg-subtle);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      line-height: 1.2;
    }

    .day-tab-date {
      font-size: 11px;
      font-weight: 500;
      opacity: 0.8;
    }

    .day-tab-btn:hover {
      background-color: var(--slate-200);
      color: var(--text-main);
    }

    .day-tab-btn.active {
      background-color: var(--mint-500);
      color: var(--white);
    }

    .day-tab-btn.is-rest-tab:not(.active) {
      opacity: 0.8;
      color: var(--slate-500);
    }

    .day-tab-btn.is-past-tab:not(.active) {
      opacity: 0.55;
    }

    .day-tab-btn.day-done:not(.active) {
      border-color: rgba(16, 185, 129, 0.4);
      color: var(--mint-600);
      background-color: var(--mint-50);
      font-weight: 700;
    }

    .day-tab-btn.day-done::after {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-top: 2px;
      vertical-align: middle;
      border-radius: 50%;
      background-color: var(--mint-500);
    }

    .day-tab-btn.is-real-today:not(.active) {
      border-color: rgba(59, 130, 246, 0.4);
      color: var(--blue-600);
      background-color: var(--blue-50);
    }

    .btn-today-now {
      padding: 8px 14px;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-today-now:hover {
      border-color: var(--mint-500);
      color: var(--mint-600);
      background: var(--mint-50);
    }

    .topbar-live-clock {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      letter-spacing: -0.01em;
    }

    .live-clock-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--mint-500);
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .meta-card-sep {
      margin: 0 8px;
      color: var(--border-strong);
    }

    .meta-card-today {
      color: var(--text-main);
      font-weight: 600;
    }

    .sunday-rest-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      background: var(--rose-50);
      color: var(--rose-600);
      border: 1px solid rgba(244, 63, 94, 0.2);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 20px;
    }

    .studio-nav-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-nav-arrow {
      width: 36px;
      height: 36px;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-main);
      font-size: 16px;
      transition: all 0.15s;
    }

    .btn-nav-arrow:hover {
      border-color: var(--mint-500);
      color: var(--mint-600);
    }

    /* 2-Column Grid Layout */
    .studio-grid-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 360px;
      gap: 28px;
      align-items: start;
    }

    .studio-grid-layout.is-sunday {
      grid-template-columns: 1fr;
    }

    .studio-blocks-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .studio-day-meta-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .meta-card-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }

    .studio-date-title {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .study-day-badge {
      font-size: 13px;
      font-weight: 600;
      color: var(--mint-700);
      background: var(--mint-50);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .meta-card-subtitle {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .meta-card-badge {
      padding: 6px 14px;
      background: var(--mint-50);
      color: var(--mint-700);
      font-size: 13px;
      font-weight: 700;
      border-radius: 999px;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    /* Video Card */
    .saas-video-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      position: relative;
    }

    .saas-video-card:hover {
      border-color: var(--slate-300);
      box-shadow: var(--shadow-sm);
    }

    .saas-video-card.completed {
      background-color: #fcfdfc;
      border-color: rgba(16, 185, 129, 0.35);
    }

    .video-card-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .video-card-meta-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .block-pill {
      font-size: 11px;
      font-weight: 700;
      background-color: var(--slate-100);
      color: var(--slate-700);
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.02em;
    }

    .video-instructor-text {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .video-duration-tag {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      background: var(--bg-subtle);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .video-card-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .video-card-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 14px;
      border-top: 1px solid var(--slate-100);
    }

    .saas-checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      user-select: none;
    }

    .saas-checkbox-input {
      width: 18px;
      height: 18px;
      accent-color: var(--mint-500);
      cursor: pointer;
    }

    .video-card-action-btns {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-watch-youtube-square {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: var(--radius-md);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-canvas);
      color: #ef4444;
      border: 1px solid var(--border-light);
      text-decoration: none;
      transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
      flex-shrink: 0;
      cursor: pointer;
    }

    .btn-watch-youtube-square:hover {
      background-color: #fef2f2;
      border-color: #fca5a5;
      color: #dc2626;
      transform: translateY(-1px);
    }

    .btn-watch-youtube-square.mini {
      width: 28px;
      height: 28px;
      min-width: 28px;
      border-radius: var(--radius-sm);
    }

    .btn-toggle-embed {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      background: var(--bg-canvas);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-toggle-embed:hover {
      background: var(--slate-100);
      color: var(--text-main);
      border-color: var(--slate-300);
    }

    /* Embedded Video Player Styles */
    .video-embed-container {
      margin: 12px 0 16px 0;
      max-width: 720px;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--slate-950);
      border: 1px solid var(--border-light);
      transition: all 0.2s ease;
    }

    .video-embed-container.collapsed {
      display: none;
    }

    .video-embed-ratio {
      position: relative;
      width: 100%;
      padding-top: 56.25%; /* 16:9 Aspect Ratio */
    }

    .video-embed-iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      border-radius: var(--radius-md);
    }

    /* In-Site Video Theater Modal */
    .video-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      z-index: 2100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .video-modal-overlay.open {
      display: flex;
    }

    .video-modal-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 860px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: modalFadeIn 0.15s ease-out;
    }

    .video-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      border-bottom: 1px solid var(--border-light);
      background: var(--bg-surface);
    }

    .video-modal-meta {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .video-modal-instructor {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .modal-close-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-canvas);
      border: 1px solid var(--border-light);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .modal-close-btn:hover {
      background: var(--slate-100);
      color: var(--text-main);
    }

    .video-modal-player-wrap {
      position: relative;
      width: 100%;
      padding-top: 56.25%; /* 16:9 */
      background: #000;
    }

    .video-modal-player-wrap iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }

    .video-modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-light);
      gap: 16px;
    }

    .video-modal-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .table-play-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      color: var(--emerald-600);
      background: #ecfdf5;
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .table-play-btn:hover {
      background: #d1fae5;
    }

    /* Aside Column (KPI & Break Timer) */
    .studio-aside-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .saas-aside-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
    }

    .aside-card-header {
      margin-bottom: 16px;
    }

    .aside-card-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .aside-card-desc {
      font-size: 12px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    /* Circular SVG Timer */
    .saas-break-timer-card {
      text-align: center;
    }

    .svg-timer-circle-wrap {
      position: relative;
      width: 160px;
      height: 160px;
      margin: 16px auto 20px;
    }

    .svg-timer-circle {
      transform: rotate(-90deg);
    }

    .timer-circle-bg {
      stroke: var(--slate-100);
    }

    .timer-circle-bar {
      stroke: var(--mint-500);
      transition: stroke-dashoffset 0.5s ease;
    }

    .timer-center-display {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .timer-digits {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .timer-state-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      letter-spacing: 0.02em;
      margin-top: 2px;
    }

    .timer-btn-row {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 12px;
    }

    .btn-timer-primary {
      padding: 10px 24px;
      background-color: var(--mint-500);
      color: var(--white);
      border: none;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }

    .btn-timer-primary:hover {
      background-color: var(--mint-600);
    }

    .btn-timer-secondary {
      padding: 10px 16px;
      background-color: var(--bg-subtle);
      color: var(--text-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-timer-secondary:hover {
      background-color: var(--slate-200);
      color: var(--text-main);
    }

    .btn-timer-add {
      padding: 6px 12px;
      background: transparent;
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-timer-add:hover {
      border-color: var(--mint-500);
      color: var(--mint-600);
    }

    .btn-timer-add:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      border-color: var(--border-subtle);
      color: var(--text-muted);
      pointer-events: none;
    }

    /* KPI Items */
    .kpi-row-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid var(--slate-100);
      font-size: 13px;
    }

    .kpi-row-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .kpi-row-label {
      color: var(--text-secondary);
    }

    .kpi-row-val {
      font-weight: 700;
      color: var(--text-main);
    }

    /* Sunday Rest Screen */
    .sunday-rest-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 48px 32px;
      text-align: center;
      max-width: 680px;
      margin: 40px auto;
    }

    .sunday-rest-icon {
      font-size: 56px;
      margin-bottom: 16px;
      display: block;
    }

    .sunday-rest-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--rose-500);
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }

    .sunday-rest-text {
      font-size: 15px;
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .btn-preview-weekday {
      padding: 12px 28px;
      background-color: var(--mint-500);
      color: var(--white);
      border: none;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }

    .btn-preview-weekday:hover {
      background-color: var(--mint-600);
    }

    /* Task 3: Master Calendar & Radar */
    .radar-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .radar-header-area {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .radar-title-wrap h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
    }

    .radar-title-wrap p {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .radar-action-buttons {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-radar-primary {
      padding: 10px 18px;
      background-color: var(--mint-500);
      color: var(--white);
      border: none;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s;
    }

    .btn-radar-primary:hover {
      background-color: var(--mint-600);
    }

    .btn-radar-secondary {
      padding: 10px 16px;
      background-color: var(--bg-subtle);
      color: var(--text-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-radar-secondary:hover {
      background-color: var(--slate-200);
      color: var(--text-main);
    }

    .radar-week-selector {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 6px 2px 14px;
      scrollbar-width: thin;
    }

    .week-nav-chip {
      padding: 8px 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      min-width: 90px;
      transition: all 0.15s;
    }

    .week-nav-chip:hover {
      border-color: var(--mint-500);
      color: var(--text-main);
    }

    .week-nav-chip.active {
      background: var(--slate-900);
      border-color: var(--slate-900);
      color: var(--white);
    }

    .week-nav-chip.active .chip-pct {
      color: var(--mint-500);
    }

    .chip-pct {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
    }

    .radar-weekly-matrix {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
    }

    .matrix-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
    }

    .matrix-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
    }

    .matrix-days-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .matrix-day-card {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 16px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .matrix-day-card:hover {
      border-color: var(--mint-500);
      background: var(--bg-surface);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .matrix-day-card.rest-day {
      background: #fff1f2;
      border-color: rgba(244, 63, 94, 0.2);
    }

    .matrix-day-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .matrix-day-name {
      font-weight: 700;
      font-size: 14px;
      color: var(--text-main);
    }

    .matrix-day-blocks-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .matrix-block-item {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      font-size: 12px;
    }

    .matrix-block-item.done {
      border-color: rgba(16, 185, 129, 0.4);
      background: #f0fdf4;
    }

    .matrix-block-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .matrix-block-title {
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.3;
    }

    /* Curriculum Matrix (Task 4) */
    .curriculum-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .curriculum-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      padding: 16px 20px;
      border-radius: var(--radius-lg);
    }

    .toolbar-title-wrap h2 {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
    }

    .toolbar-title-wrap p {
      font-size: 13px;
      color: var(--text-muted);
      margin: 4px 0 0 0;
    }

    .toolbar-filters {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .filter-group select {
      background: var(--bg-canvas);
      border: 1px solid var(--border-light);
      color: var(--text-main);
      font-size: 13px;
      font-weight: 500;
      padding: 8px 12px;
      border-radius: var(--radius-md);
      outline: none;
      cursor: pointer;
    }

    .filter-group select:focus {
      border-color: var(--emerald-500);
    }

    .search-group input {
      background: var(--bg-canvas);
      border: 1px solid var(--border-light);
      color: var(--text-main);
      font-size: 13px;
      padding: 8px 14px;
      border-radius: var(--radius-md);
      outline: none;
      min-width: 220px;
    }

    .search-group input:focus {
      border-color: var(--emerald-500);
    }

    .curriculum-course-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 12px;
    }

    .course-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      cursor: pointer;
      transition: border-color 0.15s ease, transform 0.1s ease;
    }

    .course-card:hover {
      border-color: var(--slate-300);
      transform: translateY(-1px);
    }

    .course-card.active-filter {
      border-color: var(--emerald-500);
      background: #f0fdf4;
    }

    .course-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .course-card-instructor {
      font-size: 11px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 110px;
    }

    .course-progress-track {
      width: 100%;
      height: 6px;
      background: var(--slate-100);
      border-radius: 9999px;
      overflow: hidden;
    }

    .course-progress-fill {
      height: 100%;
      background: var(--emerald-500);
      transition: width 0.3s ease;
    }

    .course-card-stats {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .saas-table-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .table-meta-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-light);
    }

    .table-scroll-wrapper {
      max-height: 600px;
      overflow-y: auto;
    }

    .saas-data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }

    .saas-data-table th {
      position: sticky;
      top: 0;
      background: var(--bg-canvas);
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 600;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border-light);
      z-index: 2;
    }

    .saas-data-table td {
      padding: 10px 16px;
      border-bottom: 1px solid var(--border-light);
      vertical-align: middle;
      color: var(--text-main);
    }

    .saas-data-table tr:hover {
      background: var(--slate-50);
    }

    .saas-data-table tr.video-done {
      background: rgba(16, 185, 129, 0.03);
    }

    .table-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 500;
      color: var(--emerald-600);
      background: #ecfdf5;
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: var(--radius-sm);
      text-decoration: none;
      transition: background 0.15s ease;
    }

    .table-action-btn:hover {
      background: #d1fae5;
    }

    .table-check-wrap {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }

    .table-check-wrap input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: var(--emerald-500);
      cursor: pointer;
    }

    /* Command Palette Modal (Task 5) */
    .palette-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: none;
      align-items: flex-start;
      justify-content: center;
      padding-top: 100px;
    }

    .palette-overlay.open {
      display: flex;
    }

    .palette-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 640px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: paletteFadeIn 0.15s ease-out;
    }

    @keyframes paletteFadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .palette-input-wrap {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-light);
      gap: 12px;
    }

    .palette-search-icon {
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .palette-input-wrap input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 15px;
      color: var(--text-main);
      background: transparent;
    }

    .palette-input-wrap input::placeholder {
      color: var(--text-muted);
    }

    .palette-esc-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      background: var(--slate-100);
      color: var(--text-muted);
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid var(--border-light);
    }

    .palette-results-list {
      max-height: 400px;
      overflow-y: auto;
      padding: 8px 0;
    }

    .palette-result-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      cursor: pointer;
      transition: background 0.1s ease;
      gap: 12px;
    }

    .palette-result-item:hover, .palette-result-item.selected {
      background: var(--slate-50);
    }

    .palette-item-left {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex: 1;
    }

    .palette-item-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .palette-item-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .palette-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      background: var(--bg-canvas);
      border-top: 1px solid var(--border-light);
      font-size: 12px;
      color: var(--text-muted);
    }

    .palette-footer-hints {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .palette-footer-hints kbd {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: 3px;
      padding: 1px 5px;
      font-size: 10px;
      font-family: inherit;
    }

    /* Settings & Backup View (Task 6) */
    .settings-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 900px;
    }

    .settings-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
    }

    .settings-header p {
      font-size: 13px;
      color: var(--text-muted);
      margin: 4px 0 0 0;
    }

    .settings-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .settings-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .settings-card.danger-zone {
      border-color: #fecdd3;
      background: #fff;
    }

    .settings-card-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px 24px;
      border-bottom: 1px solid var(--border-light);
    }

    .settings-card-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--slate-100);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .settings-card-icon.danger {
      background: #ffe4e6;
      color: var(--rose-600);
    }

    .settings-card-header h3 {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-main);
      margin: 0;
    }

    .settings-card-header p {
      font-size: 12px;
      color: var(--text-muted);
      margin: 2px 0 0 0;
    }

    .settings-card-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .backup-action-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid var(--slate-100);
    }

    .backup-action-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .backup-action-row:first-child {
      padding-top: 0;
    }

    .action-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
    }

    .action-desc {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .btn-saas-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--emerald-500);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      padding: 9px 16px;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      transition: background 0.15s ease;
      white-space: nowrap;
    }

    .btn-saas-primary:hover {
      background: var(--emerald-600);
    }

    .btn-saas-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-canvas);
      color: var(--text-main);
      font-size: 13px;
      font-weight: 600;
      padding: 9px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-light);
      cursor: pointer;
      transition: background 0.15s ease;
      white-space: nowrap;
    }

    .btn-saas-secondary:hover {
      background: var(--slate-100);
    }

    .btn-saas-danger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #fee2e2;
      color: var(--rose-600);
      font-size: 13px;
      font-weight: 600;
      padding: 9px 16px;
      border-radius: var(--radius-md);
      border: 1px solid #fecdd3;
      cursor: pointer;
      transition: background 0.15s ease;
      white-space: nowrap;
    }

    .btn-saas-danger:hover {
      background: #fecdd3;
    }

    .settings-stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
    }

    .settings-stat-item {
      background: var(--bg-canvas);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .settings-stat-item .stat-num {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
    }

    .settings-stat-item .stat-label {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* ---------------------------------------------------- */
    /* PROJECTION & GANTT ROADMAP VIEW                      */
    /* ---------------------------------------------------- */
    .projection-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .projection-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      padding: 16px 20px;
      border-radius: var(--radius-lg);
    }

    .projection-title-wrap h2 {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .projection-title-wrap p {
      font-size: 13px;
      color: var(--text-muted);
    }

    .projection-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    .projection-kpi-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .projection-kpi-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .projection-kpi-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
    }

    .projection-kpi-desc {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .gantt-matrix-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .gantt-controls-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .gantt-legend {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-box {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      border: 1px solid var(--border-medium);
    }

    .gantt-scroll-area {
      overflow-x: auto;
      overflow-y: visible;
      padding-top: 28px;
      padding-bottom: 12px;
      position: relative;
    }

    .gantt-matrix-table {
      min-width: 1100px;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .gantt-timeline-header {
      display: flex;
      border-bottom: 2px solid var(--border-medium);
      padding-bottom: 8px;
      margin-bottom: 8px;
      position: relative;
    }

    .gantt-col-header-subject {
      width: 220px;
      min-width: 220px;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .gantt-col-header-weeks {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(42, 1fr);
      gap: 2px;
      text-align: center;
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .gantt-week-label {
      padding: 4px 0;
      border-radius: 3px;
      background: var(--bg-canvas);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      user-select: none;
    }

    .gantt-week-label.is-active-week {
      background: var(--brand-navy) !important;
      color: #ffffff !important;
      font-weight: 700;
      border-color: var(--brand-navy) !important;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.25);
    }

    .gantt-rows-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
    }

    .gantt-row {
      display: flex;
      align-items: center;
      height: 46px;
      border-bottom: 1px solid var(--border-light);
    }

    .gantt-row-label {
      width: 220px;
      min-width: 220px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-right: 12px;
      flex-shrink: 0;
    }

    .gantt-subject-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gantt-subject-meta {
      font-size: 11px;
      color: var(--text-muted);
    }

    .gantt-row-track {
      flex: 1;
      height: 38px;
      position: relative;
      background: var(--bg-canvas);
      background-image: linear-gradient(to right, transparent calc(100% - 1px), var(--border-subtle) calc(100% - 1px));
      background-size: calc(100% / 42) 100%;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-light);
    }

    .unit-segment {
      position: absolute;
      top: 3px;
      bottom: 3px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 6px;
      font-size: 10.5px;
      font-weight: 600;
      cursor: pointer;
      transition: filter 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease;
      overflow: hidden;
      white-space: nowrap;
      user-select: none;
      box-sizing: border-box;
      min-width: 6px;
    }

    .unit-segment:hover {
      filter: brightness(0.92);
      transform: translateY(-1px);
      z-index: 10;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    }

    .unit-segment.is-selected {
      outline: 2px solid #2563eb;
      outline-offset: 1px;
      z-index: 8;
    }

    .unit-segment-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 4px;
      font-weight: 600;
    }

    .unit-segment-pct {
      font-size: 9.5px;
      font-weight: 700;
      opacity: 0.85;
      flex-shrink: 0;
    }

    .unit-segment.status-completed {
      opacity: 0.95;
    }

    .unit-segment.status-in_progress {
      box-shadow: 0 0 0 2px var(--brand-navy);
      z-index: 5;
    }

    .unit-segment.status-upcoming {
      opacity: 0.88;
    }

    /* High-contrast subject themes */
    .theme-tarih { background: #fef3c7; color: #78350f; border: 1px solid #fcd34d; }
    .theme-turkce { background: #d1fae5; color: #064e3b; border: 1px solid #6ee7b7; }
    .theme-matematik { background: #dbeafe; color: #1e3a8a; border: 1px solid #93c5fd; }
    .theme-cografya { background: #ecfccb; color: #365314; border: 1px solid #bef264; }
    .theme-fizik { background: #e0e7ff; color: #312e81; border: 1px solid #a5b4fc; }
    .theme-kimya { background: #f3e8ff; color: #581c87; border: 1px solid #d8b4fe; }
    .theme-biyoloji { background: #dcfce7; color: #14532d; border: 1px solid #86efac; }
    .theme-edebiyat { background: #ffe4e6; color: #881337; border: 1px solid #fda4af; }

    /* Guide lines */
    .gantt-today-guide {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--brand-navy);
      z-index: 15;
      pointer-events: none;
    }

    .gantt-today-flag {
      position: absolute;
      top: -24px;
      transform: translateX(-50%);
      background: var(--brand-navy);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(15, 23, 42, 0.2);
    }

    .gantt-today-flag::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 4px 4px 0 4px;
      border-style: solid;
      border-color: var(--brand-navy) transparent transparent transparent;
    }

    .gantt-yks-guide {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--rose-600);
      z-index: 15;
      pointer-events: none;
    }

    .gantt-yks-flag {
      position: absolute;
      top: -24px;
      transform: translateX(-50%);
      background: var(--rose-600);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(225, 29, 72, 0.2);
    }

    .gantt-yks-flag::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 4px 4px 0 4px;
      border-style: solid;
      border-color: var(--rose-600) transparent transparent transparent;
    }

    /* Drilldown Panel */
    .projection-drilldown-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .drilldown-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      border-bottom: 1px solid var(--border-light);
      padding-bottom: 12px;
    }

    .drilldown-title-wrap h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 2px;
    }

    .drilldown-title-wrap p {
      font-size: 12px;
      color: var(--text-muted);
    }

    .drilldown-video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }

    .drilldown-video-item {
      background: var(--bg-canvas);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .drilldown-video-item.is-done {
      border-color: #a7f3d0;
      background: #f0fdf4;
    }

    .drilldown-video-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }

    .drilldown-video-title {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .drilldown-video-meta {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Floating Tooltip */
    .gantt-tooltip {
      position: fixed;
      z-index: 1000;
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 12px;
      line-height: 1.4;
      pointer-events: none;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.1);
      display: none;
      max-width: 320px;
    }

    .gantt-tooltip-title {
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 4px;
      color: #38bdf8;
    }

    .gantt-tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: #cbd5e1;
      font-size: 11.5px;
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
      .studio-grid-layout,
      .studio-grid-layout.is-sunday {
        grid-template-columns: 1fr !important;
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
          <span class="nav-btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
            </svg>
          </span>
          <span>Çalışma Stüdyosu</span>
          <span class="nav-btn-shortcut">1</span>
        </button>
        <button class="nav-btn" id="nav-btn-radar" onclick="switchSaaSTab('tab-radar')">
          <span class="nav-btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </span>
          <span>Master Takvim</span>
          <span class="nav-btn-shortcut">2</span>
        </button>
        <button class="nav-btn" id="nav-btn-curriculum" onclick="switchSaaSTab('tab-curriculum')">
          <span class="nav-btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </span>
          <span>Müfredat Tablosu</span>
          <span class="nav-btn-shortcut">3</span>
        </button>
        <button class="nav-btn" id="nav-btn-projection" data-tab="projection" onclick="switchSaaSTab('view-projection')">
          <span class="nav-btn-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </span>
          <span>Yol Haritası</span>
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
          <button class="mobile-menu-btn" onclick="toggleSidebar()" aria-label="Menü">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div class="topbar-breadcrumbs">
            <span class="breadcrumb-root">Çalışma Alanı</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current" id="topbar-breadcrumb-title">Çalışma Stüdyosu</span>
          </div>
          <div class="topbar-live-clock tabular-nums" id="topbar-live-clock" title="Sistem Tarihi ve Saati">
            <span class="live-clock-dot"></span>
            <span id="live-clock-text">--:--</span>
          </div>
        </div>

        <div class="topbar-center">
          <button class="command-search-trigger" onclick="openCommandPalette()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>Video veya konu ara...</span>
            <span class="command-search-shortcut">Ctrl+K</span>
          </button>
        </div>

        <div class="topbar-right">
          <button class="btn-shift-trigger" onclick="triggerShiftEngine()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span>Programı Dengele</span>
          </button>
          <div class="topbar-timer-pill tabular-nums" id="topbar-timer-pill" onclick="switchSaaSTab('tab-today')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Mola: </span><span id="topbar-timer-text">20:00</span>
          </div>
          <div class="topbar-progress-pill tabular-nums" id="topbar-progress-pill">
            0 / 766 Video
          </div>
        </div>
      </header>

      <!-- Content Canvas -->
      <main class="saas-content-canvas">
        <!-- View 1: Study Studio (Bugün) -->
        <div class="saas-tab-view active" id="tab-today">
          <div class="studio-container">
            <!-- Studio Navigation Header -->
            <div class="studio-top-nav">
              <div class="studio-nav-left">
                <select class="week-select-dropdown" id="studio-week-select" onchange="onStudioWeekChange(this.value)">
                  <!-- 1..42 populated dynamically -->
                </select>
                <div class="day-tab-buttons" id="studio-day-tabs">
                  <!-- Dynamically populated by renderStudioDayTabs -->
                </div>
              </div>
              <div class="studio-nav-right">
                <button class="btn-today-now" onclick="goToRealToday()" title="Bugünün takvim gününe git">Bugün</button>
                <button class="btn-nav-arrow" onclick="navigateStudioDay(-1)" title="Önceki Gün">←</button>
                <button class="btn-nav-arrow" onclick="navigateStudioDay(1)" title="Sonraki Gün">→</button>
              </div>
            </div>

            <!-- Studio 2-Column Grid Layout -->
            <div class="studio-grid-layout" id="studio-content-area">
              <!-- Left Column: Video Blocks -->
              <div class="studio-blocks-column" id="studio-blocks-column">
                <!-- Dynamically rendered -->
              </div>

              <!-- Right Column: KPI & Break Timer -->
              <div class="studio-aside-column" id="studio-aside-column">
                <!-- Inline Break Timer Card -->
                <div class="saas-aside-card saas-break-timer-card">
                  <div class="aside-card-header">
                    <div class="aside-card-title">20 Dakika Mola İstasyonu</div>
                    <div class="aside-card-desc">Bloklar arası 20 dakikalık dinlenme periyodu.</div>
                  </div>

                  <div class="svg-timer-circle-wrap">
                    <svg class="svg-timer-circle" width="160" height="160" viewBox="0 0 160 160">
                      <circle class="timer-circle-bg" cx="80" cy="80" r="70" stroke-width="8" stroke="var(--slate-100)" fill="none" />
                      <circle id="timer-circle-progress" class="timer-circle-bar" cx="80" cy="80" r="70" stroke-width="8" stroke="var(--mint-500)" stroke-linecap="round" fill="none" stroke-dasharray="440" stroke-dashoffset="0" />
                    </svg>
                    <div class="timer-center-display">
                      <div class="timer-digits tabular-nums" id="studio-timer-digits">20:00</div>
                      <div class="timer-state-label" id="studio-timer-label">Mola Sayacı</div>
                    </div>
                  </div>

                  <div class="timer-btn-row">
                    <button class="btn-timer-primary" id="btn-timer-toggle" onclick="toggleBreakTimer()">Molayı Başlat</button>
                    <button class="btn-timer-secondary" onclick="resetBreakTimer()">Sıfırla</button>
                  </div>
                  <button class="btn-timer-add" id="btn-timer-add-minutes" onclick="addBreakTimerMinutes(5)">+5 Dakika Uzat</button>
                </div>

                <!-- Daily KPI Card -->
                <div class="saas-aside-card studio-kpi-card">
                  <div class="aside-card-header">
                    <div class="aside-card-title">Günlük Odak Özeti</div>
                    <div class="aside-card-desc" id="aside-day-name-desc">Pazartesi Programı</div>
                  </div>

                  <div class="kpi-row-item">
                    <span class="kpi-row-label">Toplam Çalışma</span>
                    <span class="kpi-row-val tabular-nums" id="aside-total-study-time">4 Blok Video</span>
                  </div>
                  <div class="kpi-row-item">
                    <span class="kpi-row-label">Mola Sayısı</span>
                    <span class="kpi-row-val tabular-nums">3 Mola (60 dk)</span>
                  </div>
                  <div class="kpi-row-item">
                    <span class="kpi-row-label">Tamamlanan</span>
                    <span class="kpi-row-val tabular-nums" id="aside-completed-blocks-count">0 / 4 Blok</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- View 2: Master Calendar (Radar) -->
        <div class="saas-tab-view" id="tab-radar">
          <div class="radar-container">
            <div class="radar-header-area">
              <div class="radar-title-wrap">
                <h2>Master Takvim & İlerleme Radarı</h2>
                <p>42 haftalık müfredat zaman çizelgesi. Kaçan veya izlenmeyen videoları Program Dengeleme Motoru ile bugünden itibaren geleceğe aktarabilirsiniz.</p>
              </div>
              <div class="radar-action-buttons">
                <button class="btn-radar-primary" onclick="triggerShiftEngine()">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                  <span>Programı Dengele</span>
                </button>
                <button class="btn-radar-secondary" onclick="resetSchedule()">Orijinal Plana Sıfırla</button>
              </div>
            </div>

            <!-- Week Selector Track -->
            <div class="radar-week-selector" id="radar-week-selector">
              <!-- Dynamically populated 1..42 -->
            </div>

            <!-- Weekly Matrix Container -->
            <div class="radar-weekly-matrix" id="radar-weekly-matrix">
              <!-- Dynamically populated 7 days -->
            </div>
          </div>
        </div>

        <!-- View 3: Curriculum Matrix -->
        <div class="saas-tab-view" id="tab-curriculum">
          <div class="curriculum-container">
            <!-- Top Toolbar -->
            <div class="curriculum-toolbar">
              <div class="toolbar-title-wrap">
                <h2>Müfredat Veri Bankası</h2>
                <p>9 Ders • 766 Video • Kronolojik Çalışma Takibi & Veri Tabanı</p>
              </div>
              <div class="toolbar-filters">
                <div class="filter-group">
                  <label for="subject-filter-select">Ders:</label>
                  <select id="subject-filter-select" onchange="filterCurriculumTable()">
                    <option value="all">Tüm Dersler (9 Ders)</option>
                    <option value="TYT Türkçe">TYT Türkçe</option>
                    <option value="TYT-AYT Tarih">TYT-AYT Tarih</option>
                    <option value="TYT Coğrafya">TYT Coğrafya</option>
                    <option value="AYT Coğrafya">AYT Coğrafya</option>
                    <option value="TYT Matematik">TYT Matematik</option>
                    <option value="TYT Biyoloji">TYT Biyoloji</option>
                    <option value="TYT Fizik">TYT Fizik</option>
                    <option value="TYT Kimya">TYT Kimya</option>
                    <option value="AYT Edebiyat">AYT Edebiyat</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label for="status-filter-select">Durum:</label>
                  <select id="status-filter-select" onchange="filterCurriculumTable()">
                    <option value="all">Tüm Durumlar</option>
                    <option value="completed">Tamamlananlar</option>
                    <option value="uncompleted">Kalanlar</option>
                  </select>
                </div>
                <div class="search-group">
                  <input type="text" id="table-search-input" placeholder="Video veya konu ara..." oninput="filterCurriculumTable()" />
                </div>
              </div>
            </div>

            <!-- 9 Course Cards Overview -->
            <div class="curriculum-course-cards" id="curriculum-course-cards">
              <!-- Dynamically populated 9 cards -->
            </div>

            <!-- Table Card -->
            <div class="saas-table-card">
              <div class="table-meta-header">
                <span id="table-result-count" class="tabular-nums" style="font-size: 13px; font-weight: 600; color: var(--text-secondary);">766 video listeleniyor</span>
                <span style="font-size: 12px; color: var(--text-muted);">Durum kutucuğuna tıklayarak doğrudan tamamlandı olarak işaretleyebilirsiniz.</span>
              </div>
              <div class="table-scroll-wrapper">
                <table class="saas-data-table">
                  <thead>
                    <tr>
                      <th style="width: 140px;">Ders</th>
                      <th style="width: 80px;" class="tabular-nums">No</th>
                      <th>Başlık</th>
                      <th style="width: 150px;">Eğitmen</th>
                      <th style="width: 90px;" class="tabular-nums">Süre</th>
                      <th style="width: 110px;">Durum</th>
                      <th style="width: 110px; text-align: right;">Eylem</th>
                    </tr>
                  </thead>
                  <tbody id="curriculum-table-tbody">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- View 4: Curriculum Milestone Projection (Yol Haritası & Gantt) -->
        <div class="saas-tab-view" id="view-projection" data-tab="projection">
          <div class="projection-container">
            <!-- Header Bar -->
            <div class="projection-header-bar">
              <div class="projection-title-wrap">
                <h2>Müfredat Yol Haritası ve Gelecek Projeksiyonu</h2>
                <p>9 Ders • 766 Video • Ünitelerin kesin başlangıç ve tahmini bitiş haftaları, takvim tarihleri ve ilerleme durumu.</p>
              </div>
              <div class="toolbar-filters">
                <div class="filter-group">
                  <label for="projection-subject-filter">Ders Filtresi:</label>
                  <select id="projection-subject-filter" onchange="filterProjectionView(this.value)">
                    <option value="all">Tüm Dersler (9 Ders)</option>
                    <option value="TYT Türkçe">TYT Türkçe</option>
                    <option value="TYT-AYT Tarih">TYT-AYT Tarih</option>
                    <option value="TYT Coğrafya">TYT Coğrafya</option>
                    <option value="AYT Coğrafya">AYT Coğrafya</option>
                    <option value="TYT Matematik">TYT Matematik</option>
                    <option value="TYT Biyoloji">TYT Biyoloji</option>
                    <option value="TYT Fizik">TYT Fizik</option>
                    <option value="TYT Kimya">TYT Kimya</option>
                    <option value="AYT Edebiyat">AYT Edebiyat</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Top KPI Grid -->
            <div class="projection-kpi-grid">
              <div class="projection-kpi-card">
                <span class="projection-kpi-label">YKS 2027 Hedef Projeksiyonu</span>
                <span class="projection-kpi-value tabular-nums" id="projection-kpi-target">Hesaplanıyor...</span>
                <span class="projection-kpi-desc" id="projection-kpi-target-desc">19 Haziran 2027 sınav tarihine göre</span>
              </div>
              <div class="projection-kpi-card">
                <span class="projection-kpi-label">Şu An Odaktaki Ünite</span>
                <span class="projection-kpi-value" id="projection-kpi-active" style="font-size: 16px;">Yükleniyor...</span>
                <span class="projection-kpi-desc" id="projection-kpi-active-desc">Aktif çalışma haftası odak noktası</span>
              </div>
              <div class="projection-kpi-card">
                <span class="projection-kpi-label">Ünite Tamamlanma Oranı</span>
                <span class="projection-kpi-value tabular-nums" id="projection-kpi-units">0 / 68 Ünite</span>
                <span class="projection-kpi-desc" id="projection-kpi-units-desc">%0 tamamlandı</span>
              </div>
            </div>

            <!-- Gantt Matrix Card -->
            <div class="gantt-matrix-card" id="curriculum-gantt-matrix">
              <div class="gantt-controls-bar">
                <div class="gantt-legend">
                  <div class="legend-item">
                    <span class="legend-box" style="background: var(--brand-navy);"></span>
                    <span>Aktif Hafta (H1)</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-box" style="background: var(--rose-600);"></span>
                    <span>19 Haziran 2027 YKS Çizgisi</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-box" style="background: #a7f3d0; border-color: #059669;"></span>
                    <span>Tamamlanan Ünite</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-box" style="background: var(--bg-canvas); border: 2px solid var(--brand-navy);"></span>
                    <span>Çalışılan Ünite</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-box" style="background: var(--bg-canvas); outline: 2px solid #2563eb; outline-offset: 1px;"></span>
                    <span>Seçili / İncelenen</span>
                  </div>
                </div>
                <div style="font-size: 12px; color: var(--text-muted);">
                  Ünitenin üzerine gelerek detayları görebilir, tıklayarak videolarını aşağıda açabilirsiniz.
                </div>
              </div>

              <!-- Scroll Area for 42-week Gantt Table -->
              <div class="gantt-scroll-area">
                <div class="gantt-matrix-table">
                  <!-- Header: Weeks 1..42 -->
                  <div class="gantt-timeline-header">
                    <div class="gantt-col-header-subject">Ders / Branş</div>
                    <div class="gantt-col-header-weeks" id="gantt-weeks-header">
                      <!-- Rendered dynamically -->
                    </div>
                  </div>

                  <!-- Guide Lines (Today & YKS) -->
                  <div class="gantt-today-guide" id="gantt-today-line" style="display: none;">
                    <div class="gantt-today-flag" id="gantt-today-flag">Bugün</div>
                  </div>
                  <div class="gantt-yks-guide" id="gantt-yks-line" style="display: none;">
                    <div class="gantt-yks-flag">19 Haziran YKS</div>
                  </div>

                  <!-- Rows Container -->
                  <div class="gantt-rows-container" id="gantt-rows-container">
                    <!-- Rendered dynamically per subject -->
                  </div>
                </div>
              </div>
            </div>

            <!-- Unit Drilldown Drawer / Card -->
            <div class="projection-drilldown-card" id="projection-drilldown" style="display: none;">
              <div class="drilldown-header">
                <div class="drilldown-title-wrap">
                  <h3 id="drilldown-unit-title">Seçili Ünite Videoları</h3>
                  <p id="drilldown-unit-desc">Üniteye ait videoların listesi ve izlenme durumları</p>
                </div>
                <button class="btn-radar-secondary" onclick="closeProjectionDrilldown()">Kapat</button>
              </div>
              <div class="drilldown-video-grid" id="drilldown-video-grid">
                <!-- Video items dynamically populated -->
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- Global Command Palette Modal (Ctrl+K) -->
  <div class="palette-overlay" id="command-palette-modal" onclick="onPaletteOverlayClick(event)">
    <div class="palette-card">
      <div class="palette-input-wrap">
        <svg class="palette-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" id="command-palette-input" placeholder="Video başlığı, ders veya eğitmen arayın... (ESC kapatır)" oninput="onPaletteSearch(this.value)" autocomplete="off" />
        <span class="palette-esc-badge" onclick="closeCommandPalette()">ESC</span>
      </div>
      <div class="palette-results-list" id="palette-results-list">
        <!-- Dynamically rendered instant results -->
      </div>
      <div class="palette-footer">
        <div class="palette-footer-hints">
          <span><kbd>↑</kbd><kbd>↓</kbd> Gezin</span>
          <span><kbd>ESC</kbd> Kapat</span>
        </div>
        <div class="palette-footer-count" id="palette-total-count">766 Video İçinde Arama</div>
      </div>
    </div>
  </div>

  <!-- In-Site Video Theater Modal -->
  <div class="video-modal-overlay" id="in-site-video-modal" onclick="onVideoModalOverlayClick(event)">
    <div class="video-modal-card">
      <div class="video-modal-header">
        <div class="video-modal-meta">
          <span class="subject-badge" id="video-modal-badge">Ders</span>
          <span class="video-modal-instructor" id="video-modal-instructor"></span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <a class="btn-watch-youtube-square" id="video-modal-external-link" href="#" target="_blank" rel="noopener noreferrer" data-intent="" onclick="handleYouTubeModalClick(event)" title="YouTube'da Aç (Yeni Sekme)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <button class="modal-close-btn" onclick="closeInSiteVideoModal()" title="Kapat (ESC)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="video-modal-player-wrap">
        <iframe id="video-modal-iframe"
                src=""
                title="Ders Videosu"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>
      </div>
      <div class="video-modal-footer">
        <div class="video-modal-title" id="video-modal-title"></div>
        <label class="saas-checkbox-label">
          <input type="checkbox" class="saas-checkbox-input" id="video-modal-checkbox" onchange="onVideoModalCheckboxToggle(this.checked)">
          <span>Tamamlandı</span>
        </label>
      </div>
    </div>
  </div>

  <script>
    // Embedded Curriculum & Baseline Schedule
    const PLAYLISTS_DATA = ${JSON.stringify(playlistsData)};
    const BASELINE_CALENDAR = ${JSON.stringify(calendar)};
    const DEFAULT_BLUEPRINT = ${JSON.stringify(DEFAULT_WEEKLY_BLUEPRINT)};
    const CURRICULUM_UNITS = ${JSON.stringify(curriculumUnits)};

    function getActiveBlueprint() {
      try {
        const saved = localStorage.getItem('yks_weekly_blueprint');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return DEFAULT_BLUEPRINT;
    }

    const APP_BUILD_VERSION = '2026.09.26.v5';

    // State
    let completedVideos = {};
    let currentSchedule = [];
    let activeWeekNum = 1;
    let activeDayIndex = 5; // 0: Pazartesi ... 5: Cumartesi (Today) ... 6: Pazar

    // Break Timer State
    let timerDuration = 1200; // 20 min in sec
    let timerRemaining = 1200;
    let timerRunning = false;
    let timerExtended = false;
    let timerInterval = null;
    let timerTargetEnd = 0;

    // Web Audio Chime
    let audioCtx = null;
    function initAudio() {
      try {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (!audioCtx && AudioClass) {
          audioCtx = new AudioClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
      } catch (e) {
        console.warn('Audio init error:', e);
      }
    }

    function playChime() {
      try {
        initAudio();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // Tone 1: D5 (587.33 Hz)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now);
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.18);

        // Tone 2: A5 (880 Hz)
        const tone2Start = now + 0.18;
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, tone2Start);
        gain2.gain.setValueAtTime(0.3, tone2Start);
        gain2.gain.exponentialRampToValueAtTime(0.0001, tone2Start + 0.4);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(tone2Start);
        osc2.stop(tone2Start + 0.4);
      } catch (err) {
        console.warn('Chime audio error:', err);
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Storage Management
    function loadState() {
      try {
        const savedVersion = localStorage.getItem('yks_app_build_version');
        if (savedVersion !== APP_BUILD_VERSION) {
          localStorage.removeItem('yks_shifted_schedule');
          localStorage.removeItem('yks_active_week');
          localStorage.removeItem('yks_active_day');
          localStorage.setItem('yks_app_build_version', APP_BUILD_VERSION);
        }

        const savedComp = localStorage.getItem('yks_completed_videos');
        if (savedComp) completedVideos = JSON.parse(savedComp);

        const savedWeek = localStorage.getItem('yks_active_week');
        if (savedWeek) activeWeekNum = parseInt(savedWeek, 10) || 1;

        const savedDay = localStorage.getItem('yks_active_day');
        if (savedDay !== null) {
          activeDayIndex = parseInt(savedDay, 10);
        } else {
          // Default to today's Monday-based index
          activeDayIndex = (new Date().getDay() + 6) % 7;
        }

        const savedSchedule = localStorage.getItem('yks_shifted_schedule');
        const customBlueprint = localStorage.getItem('yks_weekly_blueprint');
        if (savedSchedule) {
          currentSchedule = JSON.parse(savedSchedule);
        } else if (customBlueprint) {
          try {
            const bp = JSON.parse(customBlueprint);
            currentSchedule = generateCalendarDays(PLAYLISTS_DATA, { startDate: '2026-09-26', blueprint: bp });
          } catch (e) {
            currentSchedule = JSON.parse(JSON.stringify(BASELINE_CALENDAR));
          }
        } else {
          currentSchedule = JSON.parse(JSON.stringify(BASELINE_CALENDAR));
        }
      } catch (e) {
        console.warn('Load state error:', e);
        currentSchedule = JSON.parse(JSON.stringify(BASELINE_CALENDAR));
      }
    }

    function saveState() {
      try {
        localStorage.setItem('yks_completed_videos', JSON.stringify(completedVideos));
        localStorage.setItem('yks_active_week', String(activeWeekNum));
        localStorage.setItem('yks_active_day', String(activeDayIndex));
      } catch (e) {
        console.warn('Save state error:', e);
      }
    }

    function toggleVideo(videoId, isChecked) {
      if (isChecked) {
        completedVideos[videoId] = true;
      } else {
        delete completedVideos[videoId];
      }
      saveState();
      updateAllUI();
    }

    // UI Tab Navigation
    function switchSaaSTab(tabId) {
      if (tabId === 'tab-settings') {
        window.location.href = '/admin';
        return;
      }

      document.querySelectorAll('.saas-tab-view').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');

      const btnMap = {
        'tab-today': 'nav-btn-today',
        'tab-radar': 'nav-btn-radar',
        'tab-curriculum': 'nav-btn-curriculum',
        'tab-projection': 'nav-btn-projection',
        'view-projection': 'nav-btn-projection'
      };
      const activeBtn = document.getElementById(btnMap[tabId]);
      if (activeBtn) activeBtn.classList.add('active');

      const breadcrumbMap = {
        'tab-today': 'Çalışma Stüdyosu (Bugün)',
        'tab-radar': 'Master Takvim & Radar',
        'tab-curriculum': 'Müfredat Veri Bankası',
        'tab-projection': 'Müfredat Yol Haritası (Gelecek Projeksiyonu)',
        'view-projection': 'Müfredat Yol Haritası (Gelecek Projeksiyonu)'
      };
      const bc = document.getElementById('topbar-breadcrumb-title');
      if (bc && breadcrumbMap[tabId]) bc.textContent = breadcrumbMap[tabId];

      if (tabId === 'tab-radar') {
        renderRadarView();
      } else if (tabId === 'tab-curriculum') {
        renderCurriculumView();
      } else if (tabId === 'tab-projection' || tabId === 'view-projection') {
        renderProjectionView();
      }
    }

    function toggleSidebar() {
      const sb = document.getElementById('saas-sidebar');
      if (sb) sb.classList.toggle('open');
    }

    // Studio Day Navigation
    function onStudioWeekChange(val) {
      activeWeekNum = parseInt(val, 10) || 1;
      saveState();
      updateAllUI();
    }

    function setStudioDay(idx) {
      activeDayIndex = idx;
      saveState();
      updateAllUI();
    }

    function navigateStudioDay(delta) {
      let nextDay = activeDayIndex + delta;
      if (nextDay < 0) {
        if (activeWeekNum > 1) {
          activeWeekNum--;
          nextDay = 6;
        } else {
          nextDay = 0;
        }
      } else if (nextDay > 6) {
        if (activeWeekNum < (currentSchedule.length || 42)) {
          activeWeekNum++;
          nextDay = 0;
        } else {
          nextDay = 6;
        }
      }
      activeDayIndex = nextDay;
      saveState();
      updateAllUI();
    }

    function getSubjectBadgeClass(subject) {
      const badges = {
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
      return badges[subject] || 'badge-genel';
    }

    // Render Studio Day Tabs Dynamically
    function renderStudioDayTabs(weekData) {
      const tabsContainer = document.getElementById('studio-day-tabs');
      if (!tabsContainer || !weekData || !weekData.days) return;

      const realNow = new Date();
      const realIso = toIsoDate(realNow);
      const realDayOfWeek = (realNow.getDay() + 6) % 7;

      let html = '';
      weekData.days.forEach((d, idx) => {
        const isActive = (idx === activeDayIndex);
        const isToday = d.dateIso ? (d.dateIso === realIso) : (idx === realDayOfWeek);
        const isRest = Boolean(d.isRestDay);
        const isPast = Boolean(d.isPast);

        let isDone = false;
        if (!isRest && !isPast && d.blocks && d.blocks.length > 0) {
          isDone = d.blocks.every(b => {
            const vid = b.video?.id;
            return vid && !vid.startsWith('tekrar-') ? Boolean(completedVideos[vid]) : true;
          });
        }

        const classList = ['day-tab-btn'];
        if (isActive) classList.push('active');
        if (isToday) classList.push('is-real-today');
        if (isDone) classList.push('day-done');
        if (isRest) classList.push('is-rest-tab');
        if (isPast) classList.push('is-past-tab');

        const shortDate = d.dateIso ? (d.dateIso.slice(8, 10) + ' ' + (TURKISH_MONTHS[parseInt(d.dateIso.slice(5, 7), 10) - 1] || '').slice(0, 3)) : '';
        const dayLabel = d.dayName || ('Gün ' + (idx + 1));
        let titleStr = isToday ? (dayLabel + ' (Bugün)') : (d.dateFormatted || dayLabel);
        if (isPast) titleStr += ' (Plan Öncesi Gün)';

        html += \`<button class="\${classList.join(' ')}" onclick="setStudioDay(\${idx})" title="\${escapeHtml(titleStr)}">
          <span class="day-tab-name">\${escapeHtml(dayLabel)}</span>
          \${shortDate ? \`<span class="day-tab-date tabular-nums">\${escapeHtml(shortDate)}</span>\` : ''}
        </button>\`;
      });

      tabsContainer.innerHTML = html;
    }

    // Render Studio Day (Task 2)
    function renderStudioDay() {
      const weekData = currentSchedule.find(w => w.weekNum === activeWeekNum) || currentSchedule[0];
      const dayData = weekData?.days?.[activeDayIndex];

      // Update week dropdown
      const weekSelect = document.getElementById('studio-week-select');
      if (weekSelect) {
        if (weekSelect.children.length !== currentSchedule.length) {
          let options = '';
          currentSchedule.forEach(w => {
            options += \`<option value="\${w.weekNum}">Hafta \${w.weekNum}</option>\`;
          });
          weekSelect.innerHTML = options;
        }
        weekSelect.value = String(activeWeekNum);
      }

      // Render day tabs dynamically
      renderStudioDayTabs(weekData);

      const blocksContainer = document.getElementById('studio-blocks-column');
      const asideColumn = document.getElementById('studio-aside-column');
      const contentArea = document.getElementById('studio-content-area');
      if (!blocksContainer) return;

      // Past day state
      if (dayData && dayData.isPast) {
        if (asideColumn) asideColumn.style.display = 'none';
        if (contentArea) contentArea.classList.remove('is-sunday');
        blocksContainer.innerHTML = \`
          <div class="sunday-rest-card" style="border-color: var(--border);">
            <div class="sunday-rest-badge" style="background: var(--slate-100); color: var(--text-secondary);">Plan Öncesi</div>
            <div class="sunday-rest-title" style="color: var(--text-main);">\${escapeHtml(dayData.dateFormatted || dayData.dayName)}</div>
            <div class="sunday-rest-text">
              Bu takvim günü, çalışma programınızın başlangıç tarihinden öncedir. Dersleriniz program başlangıcınızdan itibaren kesintisiz sıralanmıştır.
            </div>
            <button class="btn-preview-weekday" onclick="goToRealToday()">Bugünkü Derslere Git</button>
          </div>
        \`;
        return;
      }

      // Sunday rest state
      if (!dayData || dayData.isRestDay) {
        if (asideColumn) asideColumn.style.display = 'none';
        if (contentArea) contentArea.classList.add('is-sunday');
        const restDayName = (dayData?.dayName || 'PAZAR').toUpperCase();
        blocksContainer.innerHTML = \`
          <div class="sunday-rest-card">
            <div class="sunday-rest-badge">Dinlenme Günü</div>
            <div class="sunday-rest-title">PAZAR: ÇALIŞMAK KESİNLİKLE YASAK!</div>
            <div class="sunday-rest-text">
              Bugün beyninizi dinlendirme ve yenilenme günüdür. YKS uzun soluklu bir maratondur; düzenli dinlenme olmadan öğrenilen bilgiler kalıcı hafızaya aktarılamaz.
              Bir sonraki çalışma gününde zinde ve odaklanmış bir şekilde 4 blokluk yeni derslerinize başlayacaksınız.
            </div>
            <button class="btn-preview-weekday" onclick="navigateStudioDay(1)">Sonraki Çalışma Gününü Önizle</button>
          </div>
        \`;
        return;
      }

      // Weekday with 4 blocks
      if (asideColumn) asideColumn.style.display = '';
      if (contentArea) contentArea.classList.remove('is-sunday');

      const blocks = dayData.blocks || [];
      let completedCount = 0;
      let totalDurationMin = 0;

      const dayTitle = dayData.dateFormatted ? dayData.dateFormatted : (activeWeekNum + '. Hafta • ' + dayData.dayName);
      const studyDayBadge = dayData.studyDayNumber ? ('<span class="study-day-badge tabular-nums">• ' + dayData.studyDayNumber + '. Çalışma Günü</span>') : '';

      let html = \`
        <div class="studio-day-meta-card">
          <div>
            <div class="meta-card-title studio-date-title">
              \${dayTitle} \${studyDayBadge}
            </div>
            <div class="meta-card-subtitle">\${activeWeekNum}. Hafta • \${dayData.dayName} • \${blocks.length} blok video • \${Math.max(0, blocks.length - 1)} mola (\${Math.max(0, blocks.length - 1) * 20} dk)</div>
          </div>
          <div class="meta-card-badge tabular-nums" id="studio-completed-badge">0 / \${blocks.length} Blok</div>
        </div>
      \`;

      blocks.forEach((b, idx) => {
        const v = b.video;
        const videoId = v.id || ('tekrar-' + (b.subject || 'genel').replace(/[^a-zA-Z0-9]/g, '_') + '-w' + activeWeekNum + '-d' + activeDayIndex + '-b' + (idx + 1));
        const isDone = Boolean(completedVideos[videoId]);
        if (isDone) completedCount++;

        const durMin = v.duration_min ? Math.round(v.duration_min) : 40;
        totalDurationMin += durMin;
        const badgeClass = getSubjectBadgeClass(b.subject);

        const hasRealVideo = Boolean(v.id && !v.id.startsWith('tekrar-'));

        html += \`
          <div class="saas-video-card \${isDone ? 'completed' : ''}" id="video-card-\${idx}">
            <div class="video-card-top-row">
              <div class="video-card-meta-left">
                <span class="block-pill">Blok \${b.blockNum || idx + 1}</span>
                <span class="subject-badge \${badgeClass}">\${b.subject}</span>
                <span class="video-instructor-text">\${escapeHtml(b.instructor)}</span>
              </div>
              <span class="video-duration-tag tabular-nums">\${durMin} dk</span>
            </div>

            <div class="video-card-title">\${escapeHtml(v.title)}</div>

            \${hasRealVideo ? \`
              <div class="video-embed-container" id="embed-wrap-\${idx}">
                <div class="video-embed-ratio">
                  <iframe class="video-embed-iframe"
                          src="https://www.youtube-nocookie.com/embed/\${v.id}?enablejsapi=1&rel=0"
                          title="\${escapeHtml(v.title)}"
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen></iframe>
                </div>
              </div>
            \` : ''}

            <div class="video-card-actions">
              <label class="saas-checkbox-label" for="chk-\${activeWeekNum}-\${activeDayIndex}-\${idx}">
                <input type="checkbox" class="saas-checkbox-input" id="chk-\${activeWeekNum}-\${activeDayIndex}-\${idx}"
                  \${isDone ? 'checked' : ''}
                  onchange="toggleVideo('\${videoId}', this.checked)">
                <span>\${isDone ? 'Tamamlandı' : 'İzlendi olarak işaretle'}</span>
              </label>

              <div style="display: flex; align-items: center; gap: 8px;">
                \${hasRealVideo ? \`
                  <button type="button" class="btn-toggle-embed" onclick="toggleCardEmbed('\${idx}')" id="btn-toggle-embed-\${idx}" title="Oynatıcıyı Gizle / Göster">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <span>Oynatıcı</span>
                  </button>
                  <a class="btn-watch-youtube-square"
                     href="https://www.youtube.com/watch?v=\${v.id}"
                     data-intent="vnd.youtube:\${v.id}"
                     target="_blank"
                     rel="noopener noreferrer"
                     onclick="handleYouTubeClick(event, '\${v.id}')"
                     title="YouTube'da Aç (Harici)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                \` : ''}
              </div>
            </div>
          </div>
        \`;
      });

      blocksContainer.innerHTML = html;

      // Update KPI widgets
      const badgeEl = document.getElementById('studio-completed-badge');
      if (badgeEl) badgeEl.textContent = \`\${completedCount} / \${blocks.length} Blok\`;

      const asideTotalTime = document.getElementById('aside-total-study-time');
      if (asideTotalTime) asideTotalTime.textContent = \`\${totalDurationMin} dk (~\${(totalDurationMin / 60).toFixed(1)} sa)\`;

      const asideCompletedCount = document.getElementById('aside-completed-blocks-count');
      if (asideCompletedCount) asideCompletedCount.textContent = \`\${completedCount} / \${blocks.length} Blok\`;

      const asideDayDesc = document.getElementById('aside-day-name-desc');
      if (asideDayDesc) asideDayDesc.textContent = \`\${activeWeekNum}. Hafta • \${dayData.dayName}\`;
    }

    // Break Timer Logic
    function updateTimerDisplay() {
      const minutes = Math.floor(timerRemaining / 60);
      const seconds = timerRemaining % 60;
      const text = \`\${String(minutes).padStart(2, '0')}:\${String(seconds).padStart(2, '0')}\`;

      const studioDigits = document.getElementById('studio-timer-digits');
      if (studioDigits) studioDigits.textContent = text;

      const topbarPill = document.getElementById('topbar-timer-pill');
      const topbarText = document.getElementById('topbar-timer-text');
      if (topbarText) topbarText.textContent = text;

      if (topbarPill) {
        topbarPill.style.display = timerRunning ? 'inline-flex' : 'none';
      }

      // Update SVG Circular progress
      const circle = document.getElementById('timer-circle-progress');
      if (circle) {
        const circumference = 440; // 2 * pi * 70 ≈ 439.8
        const offset = circumference - (timerRemaining / timerDuration) * circumference;
        circle.style.strokeDashoffset = offset;
      }
    }

    function toggleBreakTimer() {
      initAudio();
      if (timerRunning) {
        pauseBreakTimer();
      } else {
        startBreakTimer();
      }
    }

    function startBreakTimer() {
      if (timerRunning) return;
      if (timerRemaining <= 0) timerRemaining = timerDuration;
      timerRunning = true;
      timerTargetEnd = Date.now() + timerRemaining * 1000;

      const btn = document.getElementById('btn-timer-toggle');
      if (btn) btn.textContent = 'Duraklat';

      const label = document.getElementById('studio-timer-label');
      if (label) label.textContent = 'Mola Akıyor...';

      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        const now = Date.now();
        timerRemaining = Math.max(0, Math.round((timerTargetEnd - now) / 1000));
        updateTimerDisplay();

        if (timerRemaining <= 0) {
          clearInterval(timerInterval);
          timerRunning = false;
          timerDuration = 1200;
          timerRemaining = 1200;
          timerExtended = false;
          if (btn) btn.textContent = 'Molayı Başlat';
          if (label) label.textContent = 'Mola Tamamlandı!';
          const addBtn = document.getElementById('btn-timer-add-minutes');
          if (addBtn) {
            addBtn.disabled = false;
            addBtn.textContent = '+5 Dakika Uzat';
          }
          playChime();
          alert('20 dakikalık mola tamamlandı. Sıradaki bloğa başlayabilirsiniz.');
          updateTimerDisplay();
        }
      }, 200);
      updateTimerDisplay();
    }

    function pauseBreakTimer() {
      timerRunning = false;
      if (timerInterval) clearInterval(timerInterval);
      const btn = document.getElementById('btn-timer-toggle');
      if (btn) btn.textContent = 'Devam Et';

      const label = document.getElementById('studio-timer-label');
      if (label) label.textContent = 'Duraklatıldı';
      updateTimerDisplay();
    }

    function resetBreakTimer() {
      timerRunning = false;
      if (timerInterval) clearInterval(timerInterval);
      timerDuration = 1200;
      timerRemaining = 1200;
      timerExtended = false;

      const btn = document.getElementById('btn-timer-toggle');
      if (btn) btn.textContent = 'Molayı Başlat';

      const label = document.getElementById('studio-timer-label');
      if (label) label.textContent = 'Mola Sayacı';

      const addBtn = document.getElementById('btn-timer-add-minutes');
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.textContent = '+5 Dakika Uzat';
      }

      updateTimerDisplay();
    }

    function addBreakTimerMinutes(min) {
      if (timerExtended) return;
      timerExtended = true;

      timerRemaining += min * 60;
      timerDuration = Math.max(timerDuration, timerRemaining);
      if (timerRunning) {
        timerTargetEnd += min * 60 * 1000;
      }

      const addBtn = document.getElementById('btn-timer-add-minutes');
      if (addBtn) {
        addBtn.disabled = true;
        addBtn.textContent = '+5 Dk Eklendi (Kullanıldı)';
      }

      updateTimerDisplay();
    }

    // Target Date Countdown (19 June 2027)
    function updateTargetCountdown() {
      const target = new Date('2027-06-19T10:00:00');
      const now = new Date();
      const diffMs = target - now;

      if (diffMs > 0) {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(days / 7);
        const remDays = days % 7;
        const el = document.getElementById('sidebar-target-countdown');
        if (el) el.textContent = \`\${days} Gün (\${weeks} Hafta \${remDays} Gün)\`;
      }
    }

    // Global UI Sync
    function updateAllUI() {
      const totalVideos = 766;
      const completedCount = Object.keys(completedVideos).length;
      const rawPct = (completedCount / totalVideos) * 100;
      const pctFormatted = completedCount === 0 ? '0' : (rawPct < 10 ? rawPct.toFixed(1) : Math.round(rawPct).toString());

      // Topbar pill
      const topbarPill = document.getElementById('topbar-progress-pill');
      if (topbarPill) topbarPill.textContent = \`\${completedCount} / \${totalVideos} Video (%\${pctFormatted})\`;

      // Sidebar pill
      const sidebarPct = document.getElementById('sidebar-pct-label');
      if (sidebarPct) sidebarPct.textContent = \`%\${pctFormatted}\`;

      const sidebarFill = document.getElementById('sidebar-progress-fill');
      if (sidebarFill) {
        const visualWidth = completedCount === 0 ? 0 : Math.max(1, Math.min(100, rawPct));
        sidebarFill.style.width = \`\${visualWidth.toFixed(2)}%\`;
      }

      const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      const curWeekData = currentSchedule.find(w => w.weekNum === activeWeekNum) || currentSchedule[0];
      const curDay = curWeekData?.days?.[activeDayIndex];
      const curDayName = curDay?.dayName || dayNames[activeDayIndex] || ('Gün ' + (activeDayIndex + 1));
      const sidebarTag = document.getElementById('sidebar-active-tag');
      if (sidebarTag) sidebarTag.textContent = \`Hafta \${activeWeekNum} • \${curDayName}\`;

      renderStudioDay();
      updateTargetCountdown();

      const currTab = document.getElementById('tab-curriculum');
      if (currTab && currTab.classList.contains('active')) {
        renderCurriculumView();
      }

      const projTab = document.getElementById('view-projection');
      if (projTab && projTab.classList.contains('active')) {
        renderProjectionView();
      }

      const settingsTab = document.getElementById('tab-settings');
      if (settingsTab && settingsTab.classList.contains('active')) {
        renderSettingsView();
      }
    }

    let radarActiveWeekNum = 1;

    function selectRadarWeek(wNum) {
      radarActiveWeekNum = wNum;
      renderRadarView();
    }

    function jumpToStudioWeek(wNum) {
      activeWeekNum = wNum;
      activeDayIndex = 0;
      saveState();
      updateAllUI();
      switchSaaSTab('tab-today');
    }

    function jumpToStudioDay(wNum, dIdx) {
      activeWeekNum = wNum;
      activeDayIndex = dIdx;
      saveState();
      updateAllUI();
      switchSaaSTab('tab-today');
    }

    function shiftSchedulePreservingPast(playlistData, compMap = {}, baseSchedule = null) {
      if (!playlistData || Object.keys(playlistData).length === 0) {
        return { schedule: [], nextActiveWeek: 1, nextActiveDay: 0 };
      }

      const baseline = baseSchedule && baseSchedule.length > 0 ? baseSchedule : BASELINE_CALENDAR;
      const completedSet = new Set(Object.keys(compMap || {}));

      if (completedSet.size === 0) {
        return { schedule: JSON.parse(JSON.stringify(baseline)), nextActiveWeek: 1, nextActiveDay: 0 };
      }

      let totalCurriculumCount = 0;
      for (const info of Object.values(playlistData)) {
        totalCurriculumCount += (info.videos || []).length;
      }
      if (completedSet.size >= totalCurriculumCount) {
        return { schedule: [], nextActiveWeek: 1, nextActiveDay: 0 };
      }

      const uncompletedQueues = {};
      for (const [subj, info] of Object.entries(playlistData)) {
        uncompletedQueues[subj] = (info?.videos || []).filter(v => !completedSet.has(v.id));
      }

      const newWeeks = [];
      let firstIncompleteWeek = 1;
      let firstIncompleteDay = 0;
      let firstFound = false;

      const dayConfigs = [
        { name: 'Pazartesi', s1: 'TYT Türkçe', c1: 2, s2: 'TYT Coğrafya', c2: 2 },
        { name: 'Salı', s1: 'TYT Matematik', c1: 2, s2: 'TYT-AYT Tarih', c2: 2 },
        { name: 'Çarşamba', s1: 'TYT Biyoloji', c1: 2, s2: 'AYT Edebiyat', c2: 2 },
        { name: 'Perşembe', s1: 'TYT Matematik', c1: 2, s2: 'TYT Kimya', c2: 2 },
        {
          name: 'Cuma',
          s1: 'TYT Fizik',
          c1: 2,
          s2: () => ((uncompletedQueues['AYT Edebiyat']?.length ?? 0) > 0 ? 'AYT Edebiyat' : 'AYT Coğrafya'),
          c2: 2
        },
        {
          name: 'Cumartesi',
          s1: 'TYT-AYT Tarih',
          c1: 2,
          s2: () => ((uncompletedQueues['TYT Biyoloji']?.length ?? 0) > 0 ? 'TYT Biyoloji' : 'Tekrar & Soru Çözümü'),
          c2: 2
        },
        { name: 'Pazar', isRestDay: true }
      ];

      for (let wIdx = 0; wIdx < baseline.length; wIdx++) {
        const baseWeek = baseline[wIdx];
        const weekNum = wIdx + 1;
        const newDays = [];

        for (let dIdx = 0; dIdx < 7; dIdx++) {
          const rawCfg = dayConfigs[dIdx];
          if (rawCfg.isRestDay || dIdx === 6) {
            newDays.push({ dayName: 'Pazar', isRestDay: true });
            continue;
          }

          const baseDay = baseWeek.days && baseWeek.days[dIdx];
          const baseBlocks = (baseDay && baseDay.blocks) || [];

          const s1 = typeof rawCfg.s1 === 'function' ? rawCfg.s1() : rawCfg.s1;
          const s2 = typeof rawCfg.s2 === 'function' ? rawCfg.s2() : rawCfg.s2;
          const c1 = rawCfg.c1 || 2;
          const c2 = rawCfg.c2 || 2;
          const blocks = [];

          for (let bIdx = 0; bIdx < 4; bIdx++) {
            const baseBlock = baseBlocks[bIdx];
            const vid = baseBlock && baseBlock.video && baseBlock.video.id;
            const isCompleted = vid && !vid.startsWith('tekrar-') && completedSet.has(vid);

            if (isCompleted) {
              blocks.push(JSON.parse(JSON.stringify(baseBlock)));
            } else {
              const targetSubj = (bIdx < c1) ? s1 : s2;
              const nextV = uncompletedQueues[targetSubj]?.shift();
              if (nextV) {
                const instructor = nextV.instructor || playlistData[targetSubj]?.metadata?.instructor || playlistData[targetSubj]?.instructor || '';
                blocks.push({
                  blockNum: bIdx + 1,
                  subject: targetSubj,
                  video: nextV,
                  instructor
                });
              } else {
                blocks.push({
                  blockNum: bIdx + 1,
                  subject: targetSubj,
                  video: {
                    id: 'tekrar-' + targetSubj.replace(/[^a-zA-Z0-9]/g, '_') + '-w' + weekNum + '-d' + dIdx + '-b' + (bIdx + 1),
                    title: 'Konu Tekrarı & Soru Çözümü',
                    duration_min: 40,
                    duration_sec: 2400,
                    url: ''
                  },
                  instructor: ''
                });
              }
            }
          }

          if (!firstFound) {
            const hasIncomplete = blocks.some(b => {
              const vid = b.video && b.video.id;
              return vid && !vid.startsWith('tekrar-') && !completedSet.has(vid);
            });
            if (hasIncomplete) {
              firstIncompleteWeek = weekNum;
              firstIncompleteDay = dIdx;
              firstFound = true;
            }
          }

          newDays.push({ dayName: rawCfg.name, isRestDay: false, blocks });
        }

        newWeeks.push({ weekNum, days: newDays });
      }

      let remainingCount = Object.values(uncompletedQueues).reduce((sum, q) => sum + q.length, 0);
      let extraWeekNum = newWeeks.length + 1;
      while (remainingCount > 0 && extraWeekNum <= 52) {
        const extraDays = [];
        for (let dIdx = 0; dIdx < 7; dIdx++) {
          const rawCfg = dayConfigs[dIdx];
          if (rawCfg.isRestDay || dIdx === 6) {
            extraDays.push({ dayName: 'Pazar', isRestDay: true });
            continue;
          }
          const s1 = typeof rawCfg.s1 === 'function' ? rawCfg.s1() : rawCfg.s1;
          const s2 = typeof rawCfg.s2 === 'function' ? rawCfg.s2() : rawCfg.s2;
          const c1 = rawCfg.c1 || 2;
          const c2 = rawCfg.c2 || 2;
          const blocks = [];
          for (let i = 0; i < c1; i++) {
            const v = uncompletedQueues[s1]?.shift();
            const bIdx = blocks.length;
            if (v) {
              const instructor = v.instructor || playlistData[s1]?.metadata?.instructor || playlistData[s1]?.instructor || '';
              blocks.push({ blockNum: bIdx + 1, subject: s1, video: v, instructor });
            } else {
              blocks.push({
                blockNum: bIdx + 1,
                subject: s1,
                video: {
                  id: 'tekrar-' + s1.replace(/[^a-zA-Z0-9]/g, '_') + '-w' + extraWeekNum + '-d' + dIdx + '-b' + (bIdx + 1),
                  title: 'Konu Tekrarı & Soru Çözümü',
                  duration_min: 40,
                  duration_sec: 2400,
                  url: ''
                },
                instructor: ''
              });
            }
          }
          for (let i = 0; i < c2; i++) {
            const v = uncompletedQueues[s2]?.shift();
            const bIdx = blocks.length;
            if (v) {
              const instructor = v.instructor || playlistData[s2]?.metadata?.instructor || playlistData[s2]?.instructor || '';
              blocks.push({ blockNum: bIdx + 1, subject: s2, video: v, instructor });
            } else {
              blocks.push({
                blockNum: bIdx + 1,
                subject: s2,
                video: {
                  id: 'tekrar-' + s2.replace(/[^a-zA-Z0-9]/g, '_') + '-w' + extraWeekNum + '-d' + dIdx + '-b' + (bIdx + 1),
                  title: 'Konu Tekrarı & Soru Çözümü',
                  duration_min: 40,
                  duration_sec: 2400,
                  url: ''
                },
                instructor: ''
              });
            }
          }

          if (!firstFound) {
            const hasIncomplete = blocks.some(b => {
              const vid = b.video && b.video.id;
              return vid && !vid.startsWith('tekrar-') && !completedSet.has(vid);
            });
            if (hasIncomplete) {
              firstIncompleteWeek = extraWeekNum;
              firstIncompleteDay = dIdx;
              firstFound = true;
            }
          }

          extraDays.push({ dayName: rawCfg.name, isRestDay: false, blocks });
        }
        newWeeks.push({ weekNum: extraWeekNum, days: extraDays });
        remainingCount = Object.values(uncompletedQueues).reduce((sum, q) => sum + q.length, 0);
        extraWeekNum++;
      }

      return {
        schedule: newWeeks,
        nextActiveWeek: firstIncompleteWeek,
        nextActiveDay: firstIncompleteDay
      };
    }

    function shiftSchedule(rawPlaylists, compMap = {}, baseSchedule = null) {
      return shiftSchedulePreservingPast(rawPlaylists, compMap, baseSchedule).schedule;
    }

    const DAY_KEY_MAP = ['pazar', 'pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'];
    const TURKISH_DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const TURKISH_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    function formatTurkishDate(date) {
      const day = date.getUTCDate();
      const month = TURKISH_MONTHS[date.getUTCMonth()];
      const year = date.getUTCFullYear();
      const dayName = TURKISH_DAY_NAMES[date.getUTCDay()];
      return day + ' ' + month + ' ' + year + ', ' + dayName;
    }

    function toIsoDate(date) {
      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const d = String(date.getUTCDate()).padStart(2, '0');
      return y + '-' + m + '-' + d;
    }

    function parseIsoDate(isoStr) {
      const parts = isoStr.split('-').map(Number);
      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    }

    function shiftScheduleWithBlueprint(playlistData, compMap = {}, options = {}) {
      const blueprint = options.blueprint || getActiveBlueprint();
      const startDateStr = options.startDate || toIsoDate(new Date());

      if (!playlistData || Object.keys(playlistData).length === 0) {
        return { schedule: [], nextActiveWeek: 1, nextActiveDay: 0 };
      }

      const completedSet = new Set(Object.keys(compMap || {}));
      const uncompletedQueues = {};
      let totalCurriculumCount = 0;
      for (const [subj, info] of Object.entries(playlistData)) {
        const vids = info?.videos || [];
        totalCurriculumCount += vids.length;
        uncompletedQueues[subj] = vids.filter(v => !completedSet.has(v.id));
      }

      if (completedSet.size >= totalCurriculumCount) {
        return { schedule: [], nextActiveWeek: 1, nextActiveDay: 0 };
      }

      const startDt = parseIsoDate(startDateStr);
      const mondayBasedIndex = (startDt.getUTCDay() + 6) % 7;
      const week1Monday = new Date(startDt.getTime());
      week1Monday.setUTCDate(week1Monday.getUTCDate() - mondayBasedIndex);

      let studyDayNumber = 1;
      let weekNum = 1;
      const maxWeeks = 52;
      const newWeeks = [];

      // Ordered study templates from weekly blueprint (excluding Sunday)
      const standardStudyDayKeys = ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi'];
      const activeStudyKeys = standardStudyDayKeys.filter(k => Array.isArray(blueprint[k]) && blueprint[k].length > 0);

      while (weekNum <= maxWeeks) {
        const days = [];
        let hasAnyVideoThisWeek = false;

        for (let dIdx = 0; dIdx < 7; dIdx++) {
          const curDate = new Date(week1Monday.getTime());
          curDate.setUTCDate(curDate.getUTCDate() + (weekNum - 1) * 7 + dIdx);

          const dayOfWeek = curDate.getUTCDay();
          const dayName = TURKISH_DAY_NAMES[dayOfWeek];
          const dateIso = toIsoDate(curDate);
          const dateFormatted = formatTurkishDate(curDate);

          const isPast = dateIso < startDateStr;
          const isRestDay = (dayOfWeek === 0 || activeStudyKeys.length === 0);

          if (isPast) {
            days.push({
              dayName,
              dateIso,
              dateFormatted,
              isPast: true,
              isRestDay: false,
              blocks: []
            });
          } else if (isRestDay) {
            days.push({
              dayName,
              dateIso,
              dateFormatted,
              isPast: false,
              isRestDay: true,
              blocks: []
            });
          } else {
            const templateIndex = (studyDayNumber - 1) % activeStudyKeys.length;
            const studyTemplateKey = activeStudyKeys[templateIndex];
            const slots = blueprint[studyTemplateKey] || [];
            const blocks = [];

            for (let bIdx = 0; bIdx < slots.length; bIdx++) {
              let subj = slots[bIdx];
              if (subj === 'AYT Edebiyat' && (!uncompletedQueues['AYT Edebiyat'] || uncompletedQueues['AYT Edebiyat'].length === 0) && (uncompletedQueues['AYT Coğrafya']?.length > 0)) {
                subj = 'AYT Coğrafya';
              }
              if (subj === 'TYT Biyoloji' && (!uncompletedQueues['TYT Biyoloji'] || uncompletedQueues['TYT Biyoloji'].length === 0)) {
                subj = 'Tekrar & Soru Çözümü';
              }

              const v = uncompletedQueues[subj]?.shift();
              if (v) {
                hasAnyVideoThisWeek = true;
                blocks.push({
                  blockNum: bIdx + 1,
                  subject: subj,
                  video: v,
                  instructor: v.instructor || playlistData[subj]?.metadata?.instructor || playlistData[subj]?.instructor || ''
                });
              } else {
                blocks.push({
                  blockNum: bIdx + 1,
                  subject: subj,
                  video: {
                    title: 'Konu Tekrarı & Soru Çözümü',
                    duration_min: 40,
                    url: ''
                  },
                  instructor: ''
                });
              }
            }

            days.push({
              dayName,
              dateIso,
              dateFormatted,
              studyDayNumber,
              blueprintOriginDay: studyTemplateKey,
              isPast: false,
              isRestDay: false,
              blocks
            });
            studyDayNumber++;
          }
        }

        newWeeks.push({ weekNum, days });

        const remainingVideos = Object.values(uncompletedQueues).reduce((sum, q) => sum + q.length, 0);
        if (remainingVideos === 0 && weekNum >= 40) break;
        if (!hasAnyVideoThisWeek && weekNum > 40) break;

        weekNum++;
      }

      return {
        schedule: newWeeks,
        nextActiveWeek: 1,
        nextActiveDay: mondayBasedIndex
      };
    }

    function triggerShiftEngine() {
      const blueprint = getActiveBlueprint();
      const today = new Date();
      const todayIso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

      const result = shiftScheduleWithBlueprint(PLAYLISTS_DATA, completedVideos, {
        startDate: todayIso,
        blueprint: blueprint
      });

      if (!result || !result.schedule || result.schedule.length === 0) {
        alert('Tüm videolar tamamlandı veya kaydırılacak ders bulunamadı.');
        return;
      }
      currentSchedule = result.schedule;
      try {
        localStorage.setItem('yks_shifted_schedule', JSON.stringify(result.schedule));
      } catch (e) {
        console.warn('Storage save error:', e);
      }
      activeWeekNum = result.nextActiveWeek || 1;
      activeDayIndex = typeof result.nextActiveDay === 'number' ? result.nextActiveDay : (today.getDay() + 6) % 7;
      saveState();
      updateAllUI();
      renderRadarView();
      alert('Program güncellendi. Kalan tüm videolar bugünün tarihinden (' + todayIso + ') itibaren haftalık ders şablonunuza göre takvime yeniden dağıtıldı.');
    }

    function resetSchedule() {
      if (confirm('Orijinal 42 haftalık temel plana dönmek istediğinize emin misiniz?')) {
        currentSchedule = JSON.parse(JSON.stringify(BASELINE_CALENDAR));
        try {
          localStorage.removeItem('yks_shifted_schedule');
        } catch (e) {}
        saveState();
        updateAllUI();
        renderRadarView();
        alert('Takvim orijinal başlangıç planına sıfırlandı.');
      }
    }

    function renderRadarView() {
      const weekSelector = document.getElementById('radar-week-selector');
      const matrixContainer = document.getElementById('radar-weekly-matrix');
      if (!weekSelector || !matrixContainer) return;

      // 1. Render Week Chips
      let chipsHtml = '';
      currentSchedule.forEach(w => {
        let weekTotal = 0;
        let weekDone = 0;
        w.days.forEach(d => {
          (d.blocks || []).forEach(b => {
            if (b.video?.id && !b.video.id.startsWith('tekrar-')) {
              weekTotal++;
              if (completedVideos[b.video.id]) weekDone++;
            }
          });
        });
        const pct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;
        const isActive = w.weekNum === radarActiveWeekNum;

        chipsHtml += \`
          <button class="week-nav-chip \${isActive ? 'active' : ''}" onclick="selectRadarWeek(\${w.weekNum})">
            <span>Hafta \${w.weekNum}</span>
            <span class="chip-pct tabular-nums">%\${pct}</span>
          </button>
        \`;
      });
      weekSelector.innerHTML = chipsHtml;

      // 2. Render Weekly Matrix
      const targetWeek = currentSchedule.find(w => w.weekNum === radarActiveWeekNum) || currentSchedule[0];
      if (!targetWeek) return;

      let matrixHtml = \`
        <div class="matrix-header">
          <div class="matrix-title">Hafta Planı (\${targetWeek.weekNum}. Hafta • 6 Günlük Ders Matrisi + Pazar)</div>
          <button class="btn-radar-secondary" onclick="jumpToStudioWeek(\${targetWeek.weekNum})">Bu Haftayı Stüdyoda Aç →</button>
        </div>
        <div class="matrix-days-grid">
      \`;

      targetWeek.days.forEach((d, dayIdx) => {
        if (d.isPast) {
          matrixHtml += \`
            <div class="matrix-day-card rest-day" onclick="jumpToStudioDay(\${targetWeek.weekNum}, \${dayIdx})" title="\${d.dayName} gününü stüdyoda aç">
              <div class="matrix-day-header">
                <span class="matrix-day-name">\${escapeHtml(d.dayName)}</span>
                <span class="subject-badge badge-genel">Plan Öncesi</span>
              </div>
              <p style="font-size: 13px; color: var(--text-muted); font-weight: 500; padding: 20px 0; text-align: center;">
                Plan Başlangıcı Öncesi
              </p>
            </div>
          \`;
          return;
        }

        if (d.isRestDay) {
          matrixHtml += \`
            <div class="matrix-day-card rest-day">
              <div class="matrix-day-header">
                <span class="matrix-day-name">\${escapeHtml(d.dayName || 'Pazar')}</span>
                <span class="subject-badge badge-tarih">Dinlenme</span>
              </div>
              <p style="font-size: 13px; color: var(--rose-500); font-weight: 600; padding: 20px 0; text-align: center;">
                Zihinsel Dinlenme Günü
              </p>
            </div>
          \`;
          return;
        }

        matrixHtml += \`
          <div class="matrix-day-card" onclick="jumpToStudioDay(\${targetWeek.weekNum}, \${dayIdx})" title="\${d.dayName} gününü stüdyoda aç">
            <div class="matrix-day-header">
              <span class="matrix-day-name">\${d.dayName}</span>
              <span class="tabular-nums" style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">4 Blok</span>
            </div>
            <div class="matrix-day-blocks-list">
        \`;

        (d.blocks || []).forEach(b => {
          const v = b.video;
          const isDone = Boolean(completedVideos[v.id]);
          const badgeClass = getSubjectBadgeClass(b.subject);
          const durMin = v.duration_min ? Math.round(v.duration_min) : 40;

          matrixHtml += \`
            <div class="matrix-block-item \${isDone ? 'done' : ''}">
              <div class="matrix-block-meta">
                <span class="subject-badge \${badgeClass}">\${b.subject}</span>
                <span class="tabular-nums" style="color: var(--text-muted); font-size: 11px;">\${durMin} dk</span>
              </div>
              <div class="matrix-block-title">\${escapeHtml(v.title)}</div>
            </div>
          \`;
        });

        matrixHtml += \`
            </div>
          </div>
        \`;
      });

      matrixHtml += '</div>';
      matrixContainer.innerHTML = matrixHtml;
    }

    // Curriculum View & Table Logic (Task 4)
    let selectedCurriculumSubject = 'all';

    function renderCurriculumView() {
      const cardsContainer = document.getElementById('curriculum-course-cards');
      if (!cardsContainer) return;

      let cardsHtml = '';
      for (const [subj, info] of Object.entries(PLAYLISTS_DATA)) {
        const videos = info.videos || [];
        const totalCount = videos.length;
        let doneCount = 0;
        let totalSec = 0;
        let remSec = 0;

        videos.forEach(v => {
          const sec = v.duration_sec || (v.duration_min ? v.duration_min * 60 : 2400);
          totalSec += sec;
          if (completedVideos[v.id]) {
            doneCount++;
          } else {
            remSec += sec;
          }
        });

        const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
        const remHours = (remSec / 3600).toFixed(1);
        const badgeClass = getSubjectBadgeClass(subj);
        const instructor = info.instructor || (info.metadata && info.metadata.instructor) || '';
        const isSelected = selectedCurriculumSubject === subj;

        cardsHtml += \`
          <div class="course-card \${isSelected ? 'active-filter' : ''}" onclick="selectCurriculumCourseCard('\${subj}')">
            <div class="course-card-top">
              <span class="subject-badge \${badgeClass}">\${subj}</span>
              <span class="course-card-instructor" title="\${escapeHtml(instructor)}">\${escapeHtml(instructor)}</span>
            </div>
            <div class="course-progress-track">
              <div class="course-progress-fill" style="width: \${pct}%"></div>
            </div>
            <div class="course-card-stats tabular-nums">
              <span>\${doneCount} / \${totalCount} Video</span>
              <span><strong>%\${pct}</strong> • \${remHours} sa kaldı</span>
            </div>
          </div>
        \`;
      }
      cardsContainer.innerHTML = cardsHtml;

      filterCurriculumTable();
    }

    function selectCurriculumCourseCard(subj) {
      const select = document.getElementById('subject-filter-select');
      if (select) {
        if (selectedCurriculumSubject === subj) {
          selectedCurriculumSubject = 'all';
          select.value = 'all';
        } else {
          selectedCurriculumSubject = subj;
          select.value = subj;
        }
      }
      renderCurriculumView();
    }

    function filterCurriculumTable() {
      const subjectSelect = document.getElementById('subject-filter-select');
      const statusSelect = document.getElementById('status-filter-select');
      const searchInput = document.getElementById('table-search-input');
      const tbody = document.getElementById('curriculum-table-tbody');
      const countEl = document.getElementById('table-result-count');

      if (!tbody) return;

      const currentSubj = subjectSelect ? subjectSelect.value : 'all';
      selectedCurriculumSubject = currentSubj;
      const currentStatus = statusSelect ? statusSelect.value : 'all';
      const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

      let matchedVideos = [];

      for (const [subj, info] of Object.entries(PLAYLISTS_DATA)) {
        if (currentSubj !== 'all' && currentSubj !== subj) continue;

        const instructor = info.instructor || (info.metadata && info.metadata.instructor) || '';
        const videos = info.videos || [];

        videos.forEach((v, idx) => {
          const isDone = Boolean(completedVideos[v.id]);

          if (currentStatus === 'completed' && !isDone) return;
          if (currentStatus === 'uncompleted' && isDone) return;

          if (query) {
            const titleMatch = (v.title || '').toLowerCase().includes(query);
            const instMatch = instructor.toLowerCase().includes(query);
            const subjMatch = subj.toLowerCase().includes(query);
            if (!titleMatch && !instMatch && !subjMatch) return;
          }

          matchedVideos.push({
            subject: subj,
            instructor,
            video: v,
            videoNum: idx + 1,
            isDone
          });
        });
      }

      if (countEl) {
        countEl.textContent = \`\${matchedVideos.length} video listeleniyor\`;
      }

      if (matchedVideos.length === 0) {
        tbody.innerHTML = \`
          <tr>
            <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
              Aramanıza veya filtre kriterlerinize uygun video bulunamadı.
            </td>
          </tr>
        \`;
        return;
      }

      let rowsHtml = '';
      matchedVideos.forEach(item => {
        const v = item.video;
        const badgeClass = getSubjectBadgeClass(item.subject);
        const durMin = v.duration_min ? Math.round(v.duration_min) : 40;
        const watchUrl = v.url || \`https://www.youtube.com/watch?v=\${v.id}\`;

        rowsHtml += \`
          <tr class="\${item.isDone ? 'video-done' : ''}">
            <td><span class="subject-badge \${badgeClass}">\${item.subject}</span></td>
            <td class="tabular-nums" style="color: var(--text-muted); font-weight: 600;">#\${item.videoNum}</td>
            <td style="font-weight: 600; color: var(--text-main);">\${escapeHtml(v.title)}</td>
            <td style="color: var(--text-secondary); font-size: 12px;">\${escapeHtml(item.instructor)}</td>
            <td class="tabular-nums" style="color: var(--text-secondary);">\${durMin} dk</td>
            <td>
              <label class="table-check-wrap">
                <input type="checkbox" \${item.isDone ? 'checked' : ''} onchange="toggleVideo('\${v.id}', this.checked)" />
                <span style="font-size: 12px; color: \${item.isDone ? 'var(--emerald-600)' : 'var(--text-muted)'}; font-weight: 500;">
                  \${item.isDone ? 'Tamamlandı' : 'Bekliyor'}
                </span>
              </label>
            </td>
            <td style="text-align: right;">
              <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 6px;">
                <button type="button"
                        class="table-play-btn"
                        data-video-id="\${v.id}"
                        data-title="\${escapeHtml(v.title)}"
                        data-subject="\${escapeHtml(item.subject)}"
                        data-instructor="\${escapeHtml(item.instructor)}"
                        onclick="onPlayTableVideo(this)"
                        title="Sitede Oynat">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <span>Oynat</span>
                </button>
                <a class="btn-watch-youtube-square mini"
                   href="https://www.youtube.com/watch?v=\${v.id}"
                   data-intent="vnd.youtube:\${v.id}"
                   target="_blank"
                   rel="noopener noreferrer"
                   onclick="handleYouTubeClick(event, '\${v.id}')"
                   title="YouTube'da Aç (Harici)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </td>
          </tr>
        \`;
      });

      tbody.innerHTML = rowsHtml;
    }

    // ----------------------------------------------------
    // Curriculum Milestone Projection & Gantt Matrix Logic
    // ----------------------------------------------------
    let activeProjectionFilter = 'all';
    let selectedProjectionUnitId = null;
    let selectedProjectionSubject = null;

    function getSubjectThemeClass(subject) {
      if (subject.includes('Tarih')) return 'theme-tarih';
      if (subject.includes('Türkçe')) return 'theme-turkce';
      if (subject.includes('Matematik')) return 'theme-matematik';
      if (subject.includes('Coğrafya')) return 'theme-cografya';
      if (subject.includes('Fizik')) return 'theme-fizik';
      if (subject.includes('Kimya')) return 'theme-kimya';
      if (subject.includes('Biyoloji')) return 'theme-biyoloji';
      if (subject.includes('Edebiyat')) return 'theme-edebiyat';
      return 'theme-matematik';
    }

    function calculateCurriculumProjectionClient(schedule, unitsData, completedMap, curWeek) {
      if (!Array.isArray(schedule) || schedule.length === 0 || !unitsData) {
        return {
          subjects: [],
          totalUnits: 0,
          completedUnits: 0,
          activeUnits: [],
          projectedCompletionDate: '',
          completesBeforeYks: true,
          weeksBeforeYks: 0
        };
      }

      const scheduledBySubject = {};
      for (const week of schedule) {
        const wNum = week.weekNum;
        for (let dIdx = 0; dIdx < (week.days || []).length; dIdx++) {
          const day = week.days[dIdx];
          if (day.isRestDay || !day.blocks) continue;
          const dateIso = day.dateIso || '';
          const dateFormatted = day.dateFormatted || '';

          for (let bIdx = 0; bIdx < day.blocks.length; bIdx++) {
            const b = day.blocks[bIdx];
            if (!b || !b.subject || !b.video) continue;
            const subj = b.subject;
            const v = b.video;
            const vId = v.id || '';
            const vIndex = v.index || v.order || 0;
            if (vId.startsWith('tekrar-')) continue;

            if (!scheduledBySubject[subj]) {
              scheduledBySubject[subj] = [];
            }
            scheduledBySubject[subj].push({
              weekNum: wNum,
              dayIndex: dIdx,
              blockIndex: bIdx,
              dateIso,
              dateFormatted,
              videoIndex: vIndex,
              videoId: vId
            });
          }
        }
      }

      for (const s of Object.keys(scheduledBySubject)) {
        scheduledBySubject[s].sort((a, b) => a.videoIndex - b.videoIndex);
      }

      const subjects = [];
      let totalUnitsCount = 0;
      let completedUnitsCount = 0;
      const activeUnits = [];
      let maxDateIso = '';
      let maxDateFormatted = '';

      for (const [subj, units] of Object.entries(unitsData)) {
        const scheduledList = scheduledBySubject[subj] || [];
        const unitProjections = [];

        let subjTotal = 0;
        let subjDone = 0;
        let subjMinWeek = Infinity;
        let subjMaxWeek = -Infinity;
        let subjStartDate = '';
        let subjEndDate = '';

        for (const u of units) {
          totalUnitsCount++;
          const uTotal = u.endVideo - u.startVideo + 1;
          subjTotal += uTotal;

          const entries = scheduledList.filter(item => item.videoIndex >= u.startVideo && item.videoIndex <= u.endVideo);
          let uDone = 0;
          for (const entry of entries) {
            if (completedMap[entry.videoId]) {
              uDone++;
            }
          }
          subjDone += uDone;

          let startWeek = 1;
          let endWeek = 1;
          let startFrac = 0;
          let endFrac = 1;
          let startDate = '';
          let endDate = '';
          let startDateIso = '';
          let endDateIso = '';

          if (entries.length > 0) {
            startWeek = entries[0].weekNum;
            endWeek = entries[entries.length - 1].weekNum;
            startDate = entries[0].dateFormatted;
            endDate = entries[entries.length - 1].dateFormatted;
            startDateIso = entries[0].dateIso;
            endDateIso = entries[entries.length - 1].dateIso;

            const first = entries[0];
            const last = entries[entries.length - 1];
            startFrac = (first.weekNum - 1) + (first.dayIndex * 4 + first.blockIndex) / 24;
            endFrac = (last.weekNum - 1) + (last.dayIndex * 4 + last.blockIndex + 1) / 24;

            if (startWeek < subjMinWeek) {
              subjMinWeek = startWeek;
              subjStartDate = startDate;
            }
            if (endWeek > subjMaxWeek) {
              subjMaxWeek = endWeek;
              subjEndDate = endDate;
            }
            if (endDateIso > maxDateIso) {
              maxDateIso = endDateIso;
              maxDateFormatted = endDate;
            }
          }

          const pct = uTotal > 0 ? Math.round((uDone / uTotal) * 100) : 0;
          let status = 'upcoming';
          if (uDone >= uTotal && uTotal > 0) {
            status = 'completed';
            completedUnitsCount++;
          } else if (uDone > 0 || (curWeek >= startWeek && curWeek <= endWeek)) {
            status = 'in_progress';
          }

          const unitProj = {
            id: u.id,
            title: u.title,
            subject: subj,
            startVideo: u.startVideo,
            endVideo: u.endVideo,
            totalVideos: uTotal,
            startWeek,
            endWeek,
            startFrac,
            endFrac,
            startDate,
            endDate,
            startDateIso,
            endDateIso,
            completedVideos: uDone,
            progressPercent: pct,
            status
          };
          unitProjections.push(unitProj);
          if (status === 'in_progress') {
            activeUnits.push(unitProj);
          }
        }

        const subjPct = subjTotal > 0 ? Math.round((subjDone / subjTotal) * 100) : 0;
        subjects.push({
          subject: subj,
          startWeek: subjMinWeek === Infinity ? 1 : subjMinWeek,
          endWeek: subjMaxWeek === -Infinity ? 1 : subjMaxWeek,
          startDate: subjStartDate,
          endDate: subjEndDate,
          totalVideos: subjTotal,
          completedVideos: subjDone,
          progressPercent: subjPct,
          units: unitProjections
        });
      }

      const yksTargetIso = '2027-06-19';
      const completesBeforeYks = maxDateIso ? maxDateIso <= yksTargetIso : true;
      let weeksBeforeYks = 0;
      if (maxDateIso) {
        const diffMs = new Date(yksTargetIso).getTime() - new Date(maxDateIso).getTime();
        weeksBeforeYks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
      }

      return {
        subjects,
        totalUnits: totalUnitsCount,
        completedUnits: completedUnitsCount,
        activeUnits,
        projectedCompletionDate: maxDateFormatted,
        projectedCompletionDateIso: maxDateIso,
        completesBeforeYks,
        weeksBeforeYks
      };
    }

    function renderProjectionView() {
      const container = document.getElementById('view-projection');
      if (!container) return;

      const report = calculateCurriculumProjectionClient(
        currentSchedule,
        CURRICULUM_UNITS,
        completedVideos,
        activeWeekNum
      );

      // 1. Update Top KPI Cards
      const targetEl = document.getElementById('projection-kpi-target');
      const targetDescEl = document.getElementById('projection-kpi-target-desc');
      if (targetEl) {
        if (report.completesBeforeYks && report.weeksBeforeYks > 0) {
          targetEl.textContent = report.weeksBeforeYks + ' Hafta Erken';
          if (targetDescEl) targetDescEl.textContent = '19 Haziran 2027 sınavından önce (' + (report.projectedCompletionDate || 'Temmuz 2027') + ' tahmini bitiş)';
        } else {
          targetEl.textContent = report.projectedCompletionDate ? report.projectedCompletionDate.split(',')[0] : 'Plan Tamamlandı';
          if (targetDescEl) targetDescEl.textContent = 'Müfredatın son video projeksiyonu';
        }
      }

      const activeEl = document.getElementById('projection-kpi-active');
      const activeDescEl = document.getElementById('projection-kpi-active-desc');
      if (activeEl) {
        if (report.activeUnits.length > 0) {
          const firstActive = report.activeUnits[0];
          activeEl.textContent = firstActive.subject.replace('TYT-AYT ', '').replace('TYT ', '') + ': ' + firstActive.title;
          if (activeDescEl) activeDescEl.textContent = firstActive.completedVideos + ' / ' + firstActive.totalVideos + ' video izlendi (%' + firstActive.progressPercent + ')';
        } else {
          activeEl.textContent = 'Müfredat Tamamlandı';
          if (activeDescEl) activeDescEl.textContent = 'Tüm üniteler başarıyla bitirildi';
        }
      }

      const unitsEl = document.getElementById('projection-kpi-units');
      const unitsDescEl = document.getElementById('projection-kpi-units-desc');
      if (unitsEl) {
        unitsEl.textContent = report.completedUnits + ' / ' + report.totalUnits + ' Ünite';
        const pct = report.totalUnits > 0 ? Math.round((report.completedUnits / report.totalUnits) * 100) : 0;
        if (unitsDescEl) unitsDescEl.textContent = '%' + pct + ' tamamlandı';
      }

      // 2. Render 42 Weeks Header
      const weeksHeaderEl = document.getElementById('gantt-weeks-header');
      if (weeksHeaderEl) {
        let headerHtml = '';
        for (let w = 1; w <= 42; w++) {
          const isActive = w === activeWeekNum;
          headerHtml += '<div class="gantt-week-label tabular-nums ' + (isActive ? 'is-active-week' : '') + '" title="' + w + '. Hafta">H' + w + '</div>';
        }
        weeksHeaderEl.innerHTML = headerHtml;
      }

      // 3. Position Guide Lines (Fluid & Responsive)
      const todayGuide = document.getElementById('gantt-today-line');
      const todayFlag = document.getElementById('gantt-today-flag');
      if (todayGuide) {
        const progressFrac = Math.max(0, Math.min(42, activeWeekNum - 0.5)) / 42;
        todayGuide.style.display = 'block';
        todayGuide.style.left = 'calc(220px + (100% - 220px) * ' + progressFrac.toFixed(4) + ')';
        if (todayFlag) todayFlag.textContent = 'Hafta ' + activeWeekNum;
      }

      const yksGuide = document.getElementById('gantt-yks-line');
      if (yksGuide) {
        const yksFrac = 38.5 / 42; // Mid June 2027
        yksGuide.style.display = 'block';
        yksGuide.style.left = 'calc(220px + (100% - 220px) * ' + yksFrac.toFixed(4) + ')';
      }

      // 4. Render Gantt Rows for Each Course
      const rowsContainer = document.getElementById('gantt-rows-container');
      if (rowsContainer) {
        let rowsHtml = '';
        const filteredSubjects = activeProjectionFilter === 'all'
          ? report.subjects
          : report.subjects.filter(s => s.subject === activeProjectionFilter);

        for (const subjProj of filteredSubjects) {
          const themeClass = getSubjectThemeClass(subjProj.subject);

          rowsHtml += '<div class="gantt-row">' +
            '<div class="gantt-row-label">' +
              '<div class="gantt-subject-title" title="' + escapeHtml(subjProj.subject) + '">' + escapeHtml(subjProj.subject) + '</div>' +
              '<div class="gantt-subject-meta tabular-nums">' + subjProj.units.length + ' Ünite • %' + subjProj.progressPercent + '</div>' +
            '</div>' +
            '<div class="gantt-row-track">';

          for (const u of subjProj.units) {
            const leftPct = (u.startFrac / 42) * 100;
            const widthPct = ((u.endFrac - u.startFrac) / 42) * 100;
            const safeLeft = Math.max(0, Math.min(99.5, leftPct));
            const safeWidth = Math.min(100 - safeLeft, Math.max(0.6, widthPct));
            const isSelected = selectedProjectionUnitId === u.id;

            let badgeHtml = '';
            if (u.progressPercent > 0) {
              badgeHtml = '<span class="unit-segment-pct tabular-nums">%' + u.progressPercent + '</span>';
            }

            rowsHtml += '<div class="unit-segment ' + themeClass + ' status-' + u.status + (isSelected ? ' is-selected' : '') + '"' +
              ' style="left: ' + safeLeft.toFixed(3) + '%; width: calc(' + safeWidth.toFixed(3) + '% - 1.5px);"' +
              ' data-unit-id="' + escapeHtml(u.id) + '"' +
              ' data-subject="' + escapeHtml(subjProj.subject) + '"' +
              ' onclick="selectUnitForDrilldown(this.dataset.unitId, this.dataset.subject)"' +
              ' onmouseenter="showGanttTooltip(event, this.dataset.unitId, this.dataset.subject)"' +
              ' onmouseleave="hideGanttTooltip()">' +
              '<span class="unit-segment-title">' + escapeHtml(u.title) + '</span>' +
              badgeHtml +
            '</div>';
          }

          rowsHtml += '</div></div>';
        }
        rowsContainer.innerHTML = rowsHtml;
      }

      // If a unit is already selected in drilldown, refresh it
      if (selectedProjectionUnitId && selectedProjectionSubject) {
        renderDrilldownContent(selectedProjectionUnitId, selectedProjectionSubject, report);
      }
    }

    function selectUnitForDrilldown(unitId, subject) {
      selectedProjectionUnitId = unitId;
      selectedProjectionSubject = subject;

      document.querySelectorAll('.unit-segment.is-selected').forEach(el => el.classList.remove('is-selected'));
      const clickedEl = document.querySelector('.unit-segment[data-unit-id="' + unitId + '"]');
      if (clickedEl) clickedEl.classList.add('is-selected');

      const report = calculateCurriculumProjectionClient(
        currentSchedule,
        CURRICULUM_UNITS,
        completedVideos,
        activeWeekNum
      );
      renderDrilldownContent(unitId, subject, report);

      const panel = document.getElementById('projection-drilldown');
      if (panel) {
        panel.style.display = 'flex';
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function renderDrilldownContent(unitId, subject, report) {
      const subjProj = report.subjects.find(s => s.subject === subject);
      if (!subjProj) return;
      const unit = subjProj.units.find(u => u.id === unitId);
      if (!unit) return;

      const titleEl = document.getElementById('drilldown-unit-title');
      const descEl = document.getElementById('drilldown-unit-desc');
      if (titleEl) {
        titleEl.textContent = subject + ' — ' + unit.title;
      }
      if (descEl) {
        descEl.textContent = 'Hafta ' + unit.startWeek + ' - ' + unit.endWeek + ' (' + unit.startDate + ' → ' + unit.endDate + ') • ' + unit.completedVideos + '/' + unit.totalVideos + ' Video Tamamlandı (%' + unit.progressPercent + ')';
      }

      const gridEl = document.getElementById('drilldown-video-grid');
      if (!gridEl) return;

      const allVideos = (PLAYLISTS_DATA[subject] && PLAYLISTS_DATA[subject].videos) || [];
      const unitVideos = allVideos.filter(v => (v.index || v.order || 0) >= unit.startVideo && (v.index || v.order || 0) <= unit.endVideo);

      let videosHtml = '';
      unitVideos.forEach(v => {
        const isDone = !!completedVideos[v.id];
        const durMin = v.duration_min ? Math.round(v.duration_min) : Math.round((v.duration_sec || 2400) / 60);

        videosHtml += '<div class="drilldown-video-item ' + (isDone ? 'is-done' : '') + '">' +
          '<div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">' +
            '<input type="checkbox"' +
                   ' class="saas-checkbox-input"' +
                   (isDone ? ' checked' : '') +
                   ' data-video-id="' + escapeHtml(v.id) + '"' +
                   ' onchange="toggleVideo(this.dataset.videoId, this.checked)"' +
                   ' title="Tamamlandı olarak işaretle" />' +
            '<div class="drilldown-video-info">' +
              '<div class="drilldown-video-title" title="' + escapeHtml(v.title) + '">' + escapeHtml(v.title) + '</div>' +
              '<div class="drilldown-video-meta tabular-nums">Video #' + (v.index || v.order || 0) + ' • ' + durMin + ' dk</div>' +
            '</div>' +
          '</div>' +
          '<button class="btn-play-video-square"' +
                  ' data-video-id="' + escapeHtml(v.id) + '"' +
                  ' data-video-title="' + escapeHtml(v.title) + '"' +
                  ' onclick="openInSiteVideoModal(this.dataset.videoId, this.dataset.videoTitle)">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">' +
              '<polygon points="5 3 19 12 5 21 5 3"/>' +
            '</svg>' +
          '</button>' +
        '</div>';
      });
      gridEl.innerHTML = videosHtml;
    }

    function closeProjectionDrilldown() {
      const panel = document.getElementById('projection-drilldown');
      if (panel) panel.style.display = 'none';
      selectedProjectionUnitId = null;
      selectedProjectionSubject = null;
      document.querySelectorAll('.unit-segment.is-selected').forEach(el => el.classList.remove('is-selected'));
    }

    function filterProjectionView(val) {
      activeProjectionFilter = val || 'all';
      renderProjectionView();
    }

    function showGanttTooltip(event, unitId, subject) {
      let tooltip = document.getElementById('gantt-floating-tooltip');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'gantt-floating-tooltip';
        tooltip.className = 'gantt-tooltip';
        document.body.appendChild(tooltip);
      }

      const report = calculateCurriculumProjectionClient(
        currentSchedule,
        CURRICULUM_UNITS,
        completedVideos,
        activeWeekNum
      );
      const subjProj = report.subjects.find(s => s.subject === subject);
      if (!subjProj) return;
      const unit = subjProj.units.find(u => u.id === unitId);
      if (!unit) return;

      tooltip.innerHTML = '<div class="gantt-tooltip-title">' + escapeHtml(unit.title) + '</div>' +
        '<div class="gantt-tooltip-row">' +
          '<span>Ders:</span>' +
          '<strong>' + escapeHtml(subject) + '</strong>' +
        '</div>' +
        '<div class="gantt-tooltip-row tabular-nums">' +
          '<span>Kapsam:</span>' +
          '<span>Videolar #' + unit.startVideo + ' - #' + unit.endVideo + ' (' + unit.totalVideos + ' Video)</span>' +
        '</div>' +
        '<div class="gantt-tooltip-row tabular-nums">' +
          '<span>Takvim:</span>' +
          '<span>Hafta ' + unit.startWeek + ' - ' + unit.endWeek + '</span>' +
        '</div>' +
        '<div class="gantt-tooltip-row tabular-nums">' +
          '<span>Bitiş Tarihi:</span>' +
          '<span>' + (unit.endDate || 'Planlanıyor') + '</span>' +
        '</div>' +
        '<div class="gantt-tooltip-row tabular-nums">' +
          '<span>İlerleme:</span>' +
          '<span>' + unit.completedVideos + ' / ' + unit.totalVideos + ' (%' + unit.progressPercent + ')</span>' +
        '</div>';

      tooltip.style.display = 'block';
      const x = event.clientX + 16;
      const y = event.clientY + 16;
      tooltip.style.left = Math.min(window.innerWidth - 340, x) + 'px';
      tooltip.style.top = Math.min(window.innerHeight - 180, y) + 'px';
    }

    function hideGanttTooltip() {
      const tooltip = document.getElementById('gantt-floating-tooltip');
      if (tooltip) tooltip.style.display = 'none';
    }

    // Command Palette Logic (Task 5)
    function openCommandPalette() {
      const modal = document.getElementById('command-palette-modal');
      const input = document.getElementById('command-palette-input');
      if (!modal) return;
      modal.classList.add('open');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 50);
      }
      onPaletteSearch('');
    }

    function closeCommandPalette() {
      const modal = document.getElementById('command-palette-modal');
      if (modal) modal.classList.remove('open');
    }

    function onPaletteOverlayClick(e) {
      if (e.target && e.target.id === 'command-palette-modal') {
        closeCommandPalette();
      }
    }

    function onPaletteSearch(query) {
      const listEl = document.getElementById('palette-results-list');
      const countEl = document.getElementById('palette-total-count');
      if (!listEl) return;

      const q = (query || '').toLowerCase().trim();
      let matches = [];

      for (const [subj, info] of Object.entries(PLAYLISTS_DATA)) {
        const instructor = info.instructor || (info.metadata && info.metadata.instructor) || '';
        const videos = info.videos || [];

        for (let i = 0; i < videos.length; i++) {
          const v = videos[i];
          const isDone = Boolean(completedVideos[v.id]);

          if (q) {
            const titleMatch = (v.title || '').toLowerCase().includes(q);
            const instMatch = instructor.toLowerCase().includes(q);
            const subjMatch = subj.toLowerCase().includes(q);
            if (titleMatch || instMatch || subjMatch) {
              matches.push({ subj, instructor, video: v, videoNum: i + 1, isDone });
            }
          } else {
            // Default: show first 12 uncompleted videos
            if (!isDone && matches.length < 12) {
              matches.push({ subj, instructor, video: v, videoNum: i + 1, isDone });
            }
          }
          if (matches.length >= 25) break;
        }
        if (matches.length >= 25) break;
      }

      if (countEl) {
        countEl.textContent = q ? \`\${matches.length} Sonuç Bulundu\` : '766 Video İçinde Arama';
      }

      if (matches.length === 0) {
        listEl.innerHTML = \`
          <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 13px;">
            Aramanızla eşleşen video veya konu bulunamadı.
          </div>
        \`;
        return;
      }

      let html = '';
      matches.forEach(item => {
        const v = item.video;
        const badgeClass = getSubjectBadgeClass(item.subj);
        const durMin = v.duration_min ? Math.round(v.duration_min) : 40;
        const watchUrl = v.url || \`https://www.youtube.com/watch?v=\${v.id}\`;

        html += \`
          <div class="palette-result-item"
               data-video-id="\${v.id}"
               data-title="\${escapeHtml(v.title)}"
               data-subject="\${escapeHtml(item.subj)}"
               data-instructor="\${escapeHtml(item.instructor)}"
               onclick="onPaletteSelectVideo(this)">
            <div class="palette-item-left">
              <span class="subject-badge \${badgeClass}">\${item.subj}</span>
              <span class="palette-item-title">\${escapeHtml(v.title)}</span>
            </div>
            <div class="palette-item-right">
              <span style="font-size: 11px; color: var(--text-muted);">\${escapeHtml(item.instructor)}</span>
              <span class="tabular-nums" style="font-size: 11px; color: var(--text-secondary);">\${durMin} dk</span>
              <span style="font-size: 11px; font-weight: 600; color: \${item.isDone ? 'var(--emerald-600)' : 'var(--text-muted)'};">
                \${item.isDone ? 'Tamamlandı' : 'Bekliyor'}
              </span>
            </div>
          </div>
        \`;
      });

      listEl.innerHTML = html;
    }

    function onPaletteSelectVideo(el) {
      closeCommandPalette();
      const videoId = el.getAttribute('data-video-id');
      const title = el.getAttribute('data-title');
      const subject = el.getAttribute('data-subject');
      const instructor = el.getAttribute('data-instructor');
      openInSiteVideoModal(videoId, title, subject, instructor);
    }

    function onPlayTableVideo(btn) {
      const videoId = btn.getAttribute('data-video-id');
      const title = btn.getAttribute('data-title');
      const subject = btn.getAttribute('data-subject');
      const instructor = btn.getAttribute('data-instructor');
      openInSiteVideoModal(videoId, title, subject, instructor);
    }

    // In-Site Video Theater Modal & Intent Logic
    let currentModalVideoId = null;

    function openInSiteVideoModal(videoId, title, subject, instructor) {
      if (!videoId) return;
      currentModalVideoId = videoId;
      const modal = document.getElementById('in-site-video-modal');
      const iframe = document.getElementById('video-modal-iframe');
      const titleEl = document.getElementById('video-modal-title');
      const badgeEl = document.getElementById('video-modal-badge');
      const instructorEl = document.getElementById('video-modal-instructor');
      const chkEl = document.getElementById('video-modal-checkbox');
      const extLink = document.getElementById('video-modal-external-link');

      if (!modal || !iframe) return;

      if (titleEl) titleEl.textContent = title || 'Ders Videosu';
      if (badgeEl) {
        badgeEl.textContent = subject || 'Ders';
        badgeEl.className = 'subject-badge ' + getSubjectBadgeClass(subject || '');
      }
      if (instructorEl) instructorEl.textContent = instructor || '';
      if (chkEl) chkEl.checked = Boolean(completedVideos[videoId]);
      if (extLink) {
        extLink.href = \`https://www.youtube.com/watch?v=\${videoId}\`;
        extLink.setAttribute('data-intent', \`vnd.youtube:\${videoId}\`);
      }

      iframe.src = \`https://www.youtube-nocookie.com/embed/\${videoId}?autoplay=1&rel=0&enablejsapi=1\`;
      modal.classList.add('open');
    }

    function closeInSiteVideoModal() {
      const modal = document.getElementById('in-site-video-modal');
      const iframe = document.getElementById('video-modal-iframe');
      if (modal) modal.classList.remove('open');
      if (iframe) iframe.src = '';
      currentModalVideoId = null;
    }

    function onVideoModalOverlayClick(e) {
      if (e.target && e.target.id === 'in-site-video-modal') {
        closeInSiteVideoModal();
      }
    }

    function onVideoModalCheckboxToggle(checked) {
      if (currentModalVideoId) {
        toggleVideo(currentModalVideoId, checked);
      }
    }

    function handleYouTubeModalClick(e) {
      if (!currentModalVideoId) return;
      handleYouTubeClick(e, currentModalVideoId);
    }

    function toggleCardEmbed(idx) {
      const wrap = document.getElementById(\`embed-wrap-\${idx}\`);
      const btn = document.getElementById(\`btn-toggle-embed-\${idx}\`);
      if (!wrap) return;
      if (wrap.classList.contains('collapsed')) {
        wrap.classList.remove('collapsed');
        if (btn) btn.classList.remove('active');
      } else {
        wrap.classList.add('collapsed');
        if (btn) btn.classList.add('active');
      }
    }

    function handleYouTubeClick(e, videoId) {
      if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
        e.preventDefault();
        window.location.href = \`vnd.youtube:\${videoId}\`;
        return;
      }
    }

    // Keyboard Shortcuts (Ctrl+K / Cmd+K, Escape)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
      } else if (e.key === 'Escape') {
        closeCommandPalette();
        closeInSiteVideoModal();
      }
    });

    // Live Real-Time Date & Clock Engine
    function updateLiveDateTime() {
      const clockEl = document.getElementById('live-clock-text');
      if (!clockEl) return;
      const now = new Date();
      const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
      const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      clockEl.textContent = \`\${dateStr} • \${timeStr}\`;
    }

    function goToRealToday() {
      const now = new Date();
      const todayIso = toIsoDate(now);

      let found = false;
      for (const w of currentSchedule) {
        if (!w.days) continue;
        for (let dIdx = 0; dIdx < w.days.length; dIdx++) {
          if (w.days[dIdx].dateIso === todayIso) {
            activeWeekNum = w.weekNum;
            activeDayIndex = dIdx;
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (!found) {
        const realDayIdx = (now.getDay() + 6) % 7;
        activeDayIndex = realDayIdx;
      }

      saveState();
      updateAllUI();
      switchSaaSTab('tab-today');
    }

    function renderSettingsView() {
      // Delegated to dedicated /admin route
    }

    function exportBackup() {
      const backupData = {
        app: 'YKS 2027 Koçu',
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        completedVideos,
        activeWeekNum,
        activeDayIndex,
        shiftedSchedule: localStorage.getItem('yks_shifted_schedule') ? JSON.parse(localStorage.getItem('yks_shifted_schedule')) : null
      };
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = \`yks_2027_yedek_\${dateStr}.json\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function importBackup(event) {
      const file = event.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data || typeof data.completedVideos !== 'object') {
            throw new Error('Geçersiz yedek dosyası şeması!');
          }
          completedVideos = data.completedVideos || {};
          if (typeof data.activeWeekNum === 'number') activeWeekNum = data.activeWeekNum;
          if (typeof data.activeDayIndex === 'number') activeDayIndex = data.activeDayIndex;
          if (data.shiftedSchedule && Array.isArray(data.shiftedSchedule)) {
            currentSchedule = data.shiftedSchedule;
            localStorage.setItem('yks_shifted_schedule', JSON.stringify(currentSchedule));
          } else {
            currentSchedule = JSON.parse(JSON.stringify(BASELINE_CALENDAR));
            localStorage.removeItem('yks_shifted_schedule');
          }
          saveState();
          updateAllUI();
          alert('Yedek başarıyla geri yüklendi.');
        } catch (err) {
          alert('Yedek dosyası okunamadı veya biçimi geçersiz: ' + err.message);
        }
        event.target.value = '';
      };
      reader.readAsText(file);
    }

    function resetAllProgress() {
      const confirm1 = confirm('DİKKAT: Tüm çalışma kayıtlarınız, işaretlediğiniz videolar ve takvim sıfırlanacaktır. Devam etmek istiyor musunuz?');
      if (!confirm1) return;
      const confirm2 = confirm('Son onay: İlerlemenizi geri getiremezsiniz. Sıfırlansın mı?');
      if (!confirm2) return;

      completedVideos = {};
      activeWeekNum = 1;
      activeDayIndex = 0;
      currentSchedule = JSON.parse(JSON.stringify(BASELINE_CALENDAR));
      try {
        localStorage.removeItem('yks_completed_videos');
        localStorage.removeItem('yks_shifted_schedule');
        localStorage.removeItem('yks_active_week');
        localStorage.removeItem('yks_active_day');
      } catch (e) {}
      saveState();
      updateAllUI();
      alert('Tüm veriler başarıyla sıfırlandı.');
    }

    // Initial Load
    window.addEventListener('DOMContentLoaded', () => {
      loadState();
      updateLiveDateTime();
      setInterval(updateLiveDateTime, 1000);
      updateAllUI();
      updateTimerDisplay();
    });
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
