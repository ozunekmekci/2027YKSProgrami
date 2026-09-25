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
      padding: 8px 14px;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      background-color: var(--bg-subtle);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .day-tab-btn:hover {
      background-color: var(--slate-200);
      color: var(--text-main);
    }

    .day-tab-btn.active {
      background-color: var(--mint-500);
      color: var(--white);
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
      text-transform: uppercase;
      letter-spacing: 0.04em;
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

    .btn-watch-youtube {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background-color: #dc2626;
      color: var(--white);
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--radius-md);
      transition: background 0.15s;
    }

    .btn-watch-youtube:hover {
      background-color: #b91c1c;
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
      text-transform: uppercase;
      letter-spacing: 0.05em;
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
      .studio-grid-layout {
        grid-template-columns: 1fr;
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
                  <button class="day-tab-btn active" onclick="setStudioDay(0)">Pazartesi</button>
                  <button class="day-tab-btn" onclick="setStudioDay(1)">Salı</button>
                  <button class="day-tab-btn" onclick="setStudioDay(2)">Çarşamba</button>
                  <button class="day-tab-btn" onclick="setStudioDay(3)">Perşembe</button>
                  <button class="day-tab-btn" onclick="setStudioDay(4)">Cuma</button>
                  <button class="day-tab-btn" onclick="setStudioDay(5)">Cumartesi</button>
                  <button class="day-tab-btn" onclick="setStudioDay(6)">Pazar</button>
                </div>
              </div>
              <div class="studio-nav-right">
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
                    <div class="aside-card-title">☕ 20 Dakika Mola İstasyonu</div>
                    <div class="aside-card-desc">Beyin dinlenmeden öğrenme kalıcı olmaz.</div>
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
                  <button class="btn-timer-add" onclick="addBreakTimerMinutes(5)">+5 Dakika Uzat</button>
                </div>

                <!-- Daily KPI Card -->
                <div class="saas-aside-card studio-kpi-card">
                  <div class="aside-card-header">
                    <div class="aside-card-title">📊 Günlük Odak Özeti</div>
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
          <!-- Populated in Task 3 -->
        </div>

        <!-- View 3: Curriculum Matrix -->
        <div class="saas-tab-view" id="tab-curriculum">
          <!-- Populated in Task 4 -->
        </div>

        <!-- View 4: Preferences & Backup -->
        <div class="saas-tab-view" id="tab-settings">
          <!-- Populated in Task 6 -->
        </div>
      </main>
    </div>
  </div>

  <script>
    // Embedded Curriculum & Baseline Schedule
    const PLAYLISTS_DATA = ${JSON.stringify(playlistsData)};
    const BASELINE_CALENDAR = ${JSON.stringify(calendar)};

    // State
    let completedVideos = {};
    let currentSchedule = [];
    let activeWeekNum = 1;
    let activeDayIndex = 0; // 0: Pazartesi ... 6: Pazar

    // Break Timer State
    let timerDuration = 1200; // 20 min in sec
    let timerRemaining = 1200;
    let timerRunning = false;
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
        const savedComp = localStorage.getItem('yks_completed_videos');
        if (savedComp) completedVideos = JSON.parse(savedComp);

        const savedWeek = localStorage.getItem('yks_active_week');
        if (savedWeek) activeWeekNum = parseInt(savedWeek, 10) || 1;

        const savedDay = localStorage.getItem('yks_active_day');
        if (savedDay !== null) activeDayIndex = parseInt(savedDay, 10) || 0;

        const savedSchedule = localStorage.getItem('yks_shifted_schedule');
        if (savedSchedule) {
          currentSchedule = JSON.parse(savedSchedule);
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

    // Render Studio Day (Task 2)
    function renderStudioDay() {
      const weekData = currentSchedule.find(w => w.weekNum === activeWeekNum) || currentSchedule[0];
      const dayData = weekData?.days?.[activeDayIndex];

      // Update week dropdown
      const weekSelect = document.getElementById('studio-week-select');
      if (weekSelect && weekSelect.children.length === 0) {
        let options = '';
        currentSchedule.forEach(w => {
          options += \`<option value="\${w.weekNum}">Hafta \${w.weekNum}</option>\`;
        });
        weekSelect.innerHTML = options;
      }
      if (weekSelect) weekSelect.value = String(activeWeekNum);

      // Update day tabs active state
      const dayTabBtns = document.querySelectorAll('.day-tab-btn');
      dayTabBtns.forEach((btn, idx) => {
        if (idx === activeDayIndex) btn.classList.add('active');
        else btn.classList.remove('active');
      });

      const blocksContainer = document.getElementById('studio-blocks-column');
      const asideColumn = document.getElementById('studio-aside-column');
      const contentArea = document.getElementById('studio-content-area');
      if (!blocksContainer) return;

      // Sunday rest state
      if (!dayData || dayData.isRestDay || activeDayIndex === 6) {
        if (asideColumn) asideColumn.style.display = 'none';
        contentArea.style.gridTemplateColumns = '1fr';
        blocksContainer.innerHTML = \`
          <div class="sunday-rest-card">
            <span class="sunday-rest-icon">☕</span>
            <div class="sunday-rest-title">⛔ PAZAR: ÇALIŞMAK KESİNLİKLE YASAK!</div>
            <div class="sunday-rest-text">
              Bugün beyninizi dinlendirme ve ödüllendirme günüdür. YKS bir maratondur; dinlenmeden zihinsel güç yenilenemez.
              Yarın zinde ve odaklanmış bir şekilde 4 blokla haftaya başlayacaksınız.
            </div>
            <button class="btn-preview-weekday" onclick="setStudioDay(0)">Pazartesi Programını Önizle</button>
          </div>
        \`;
        return;
      }

      // Weekday with 4 blocks
      if (asideColumn) asideColumn.style.display = 'flex';
      contentArea.style.gridTemplateColumns = 'minmax(0, 1fr) 360px';

      const blocks = dayData.blocks || [];
      let completedCount = 0;
      let totalDurationMin = 0;

      let html = \`
        <div class="studio-day-meta-card">
          <div>
            <div class="meta-card-title">\${activeWeekNum}. Hafta • \${dayData.dayName}</div>
            <div class="meta-card-subtitle">4 blok video • 3 mola (60 dk)</div>
          </div>
          <div class="meta-card-badge" id="studio-completed-badge">0 / 4 Blok</div>
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

            <div class="video-card-actions">
              <label class="saas-checkbox-label" for="chk-\${activeWeekNum}-\${activeDayIndex}-\${idx}">
                <input type="checkbox" class="saas-checkbox-input" id="chk-\${activeWeekNum}-\${activeDayIndex}-\${idx}"
                  \${isDone ? 'checked' : ''}
                  onchange="toggleVideo('\${videoId}', this.checked)">
                <span>\${isDone ? 'Tamamlandı' : 'İzlendi olarak işaretle'}</span>
              </label>

              \${v.id ? \`
                <a class="btn-watch-youtube" href="https://www.youtube.com/watch?v=\${v.id}" target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube'da İzle</span>
                </a>
              \` : ''}
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
          if (btn) btn.textContent = 'Molayı Başlat';
          if (label) label.textContent = 'Mola Tamamlandı!';
          playChime();
          alert('☕ 20 dakikalık mola tamamlandı! Zihnin yenilendi, sonraki bloğa hazırsın.');
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
      timerRemaining = timerDuration;

      const btn = document.getElementById('btn-timer-toggle');
      if (btn) btn.textContent = 'Molayı Başlat';

      const label = document.getElementById('studio-timer-label');
      if (label) label.textContent = 'Mola Sayacı';

      updateTimerDisplay();
    }

    function addBreakTimerMinutes(min) {
      timerRemaining += min * 60;
      timerDuration = Math.max(timerDuration, timerRemaining);
      if (timerRunning) {
        timerTargetEnd += min * 60 * 1000;
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
      const pct = Math.round((completedCount / totalVideos) * 100);

      // Topbar pill
      const topbarPill = document.getElementById('topbar-progress-pill');
      if (topbarPill) topbarPill.textContent = \`\${completedCount} / \${totalVideos} Video (% \${pct})\`;

      // Sidebar pill
      const sidebarPct = document.getElementById('sidebar-pct-label');
      if (sidebarPct) sidebarPct.textContent = \`%\${pct}\`;

      const sidebarFill = document.getElementById('sidebar-progress-fill');
      if (sidebarFill) sidebarFill.style.width = \`\${pct}%\`;

      const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      const sidebarTag = document.getElementById('sidebar-active-tag');
      if (sidebarTag) sidebarTag.textContent = \`Hafta \${activeWeekNum} • \${dayNames[activeDayIndex]}\`;

      renderStudioDay();
      updateTargetCountdown();
    }

    // Placeholders for Task 3, 4, 5
    function openCommandPalette() {}
    function triggerShiftEngine() {}

    // Initial Load
    window.addEventListener('DOMContentLoaded', () => {
      loadState();
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
