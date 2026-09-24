import fs from 'node:fs';
import path from 'node:path';
import { generateCalendarDays } from './calendar_engine.js';

export function generateDashboardHtml(dataPath = 'playlists_data_tr.json', outputPath = 'yks_dashboard.html') {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const weeks = generateCalendarDays(data);

  // Compute curriculum summaries
  let totalCurriculumVideos = 0;
  let totalCurriculumSeconds = 0;
  const subjectsMap = {};

  for (const [subjectName, info] of Object.entries(data)) {
    const videoCount = info.videos?.length || 0;
    let sec = 0;
    for (const v of info.videos || []) {
      sec += v.duration_sec || Math.round((v.duration_min || 0) * 60);
    }
    totalCurriculumVideos += videoCount;
    totalCurriculumSeconds += sec;
    subjectsMap[subjectName] = {
      name: subjectName,
      instructor: info.metadata?.instructor || '',
      videoCount,
      totalMinutes: Math.round(sec / 60),
      totalHours: (sec / 3600).toFixed(1)
    };
  }

  const totalCurriculumHours = (totalCurriculumSeconds / 3600).toFixed(1);

  // Pre-generate week select options (Hafta 1 ... Hafta 42)
  const weekOptionsHtml = weeks.map(w => `<option value="${w.weekNum}">Hafta ${w.weekNum}</option>`).join('\n          ');

  // Schedule serialized for client-side interactivity
  const scheduleJson = JSON.stringify(weeks);
  const subjectsJson = JSON.stringify(subjectsMap);

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YKS 2027 Çalışma Takvimi • Etkileşimli Panel</title>
  <meta name="description" content="YKS 2027 Eşit Ağırlık ve Sözel hazırlık için 766 videoluk 42 haftalık etkileşimli çalışma takvimi ve 20 dakikalık mola zamanlayıcısı.">
  <style>
    :root {
      --bg-page: #f8fafc;
      --bg-surface: #ffffff;
      --bg-subtle: #f1f5f9;
      --border-color: #e2e8f0;
      --border-strong: #cbd5e1;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #64748b;
      --primary: #1e293b;
      --primary-hover: #0f172a;
      --accent: #2563eb;
      --accent-hover: #1d4ed8;
      --accent-subtle: #eff6ff;
      --accent-border: #bfdbfe;
      --success: #15803d;
      --success-subtle: #f0fdf4;
      --success-border: #bbf7d0;
      --amber-surface: #fef3c7;
      --amber-text: #78350f;
      --amber-secondary: #92400e;
      --amber-border: #fde68a;
      --red-surface: #fee2e2;
      --red-text: #7f1d1d;
      --red-secondary: #991b1b;
      --red-border: #fca5a5;
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 14px;
      --shadow-sm: 0 1px 2px 0 rgba(15, 23, 42, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05);
      --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-page);
      color: var(--text-primary);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      padding-bottom: 120px;
    }

    ::selection {
      background-color: #bfdbfe;
      color: #1e3a8a;
    }

    :focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .tabular-nums, .tabular {
      font-variant-numeric: tabular-nums;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 20px;
    }

    /* Header */
    .app-header {
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      padding: 20px 0;
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .app-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .app-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* KPI Summary Panel */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 18px 20px;
      box-shadow: var(--shadow-sm);
    }

    .kpi-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 6px;
    }

    .kpi-value {
      font-size: 1.85rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .kpi-subtext {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .progress-bar-bg {
      height: 8px;
      background-color: var(--bg-subtle);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 10px;
    }

    .progress-bar-fill {
      height: 100%;
      background-color: var(--success);
      width: 0%;
      transition: width 0.3s ease;
    }

    /* Course Breakdown Drawer */
    .course-section {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      margin-bottom: 24px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .course-section-header {
      padding: 14px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      background-color: var(--bg-surface);
      user-select: none;
    }

    .course-section-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .course-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
      padding: 16px 20px;
      background-color: var(--bg-subtle);
      border-top: 1px solid var(--border-color);
    }

    .course-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
    }

    .course-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .course-card-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .course-card-count {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .course-card-meta {
      font-size: 0.775rem;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    /* Subject Badges */
    .subject-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
      white-space: nowrap;
    }

    .badge-tyt-turkce { background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .badge-tyt-ayt-tarih { background-color: #fdf2f8; color: #be185d; border: 1px solid #fbcfe8; }
    .badge-tyt-cografya { background-color: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-ayt-cografya { background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .badge-tyt-matematik { background-color: #faf5ff; color: #7e22ce; border: 1px solid #e9d5ff; }
    .badge-tyt-biyoloji { background-color: #f0fdfa; color: #0f766e; border: 1px solid #99f6e4; }
    .badge-tyt-fizik { background-color: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
    .badge-tyt-kimya { background-color: #fefce8; color: #a16207; border: 1px solid #fef08a; }
    .badge-ayt-edebiyat { background-color: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
    .badge-tekrar { background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

    /* Navigation & Search Bar */
    .controls-bar {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 16px 20px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .week-nav-group {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      cursor: pointer;
      border: 1px solid var(--border-color);
      background-color: var(--bg-surface);
      color: var(--text-primary);
      transition: all 0.15s ease;
      text-decoration: none;
    }

    .btn:hover {
      background-color: var(--bg-subtle);
      border-color: var(--border-strong);
    }

    .btn-primary {
      background-color: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }

    .btn-primary:hover {
      background-color: var(--primary-hover);
      border-color: var(--primary-hover);
    }

    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .week-select {
      padding: 8px 12px;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      background-color: var(--bg-surface);
      color: var(--text-primary);
      cursor: pointer;
    }

    .search-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      max-width: 440px;
    }

    .search-input {
      width: 100%;
      padding: 8px 14px;
      font-size: 0.875rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      background-color: var(--bg-surface);
      color: var(--text-primary);
    }

    .search-input:focus {
      border-color: var(--accent);
      outline: none;
    }

    /* Week Info Banner */
    .week-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 20px;
      padding: 12px 18px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
    }

    .week-banner-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .week-banner-stats {
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    /* Day Cards & Blocks */
    .day-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .day-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }

    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .day-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .day-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .day-summary-text {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .day-progress-badge {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
      background-color: var(--bg-subtle);
      color: var(--text-secondary);
    }

    /* Video Block Row */
    .video-block {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }

    .video-block.completed {
      background-color: #f8fafc;
      border-color: #cbd5e1;
    }

    .video-block.completed .video-title {
      text-decoration: line-through;
      color: var(--text-muted);
    }

    .video-block-left {
      display: flex;
      align-items: center;
      gap: 14px;
      flex: 1;
      min-width: 0;
    }

    .block-checkbox {
      width: 20px;
      height: 20px;
      accent-color: var(--success);
      cursor: pointer;
      flex-shrink: 0;
    }

    .block-num-badge {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      background-color: var(--bg-subtle);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .video-details {
      min-width: 0;
      flex: 1;
    }

    .video-details-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }

    .video-title {
      font-size: 0.925rem;
      font-weight: 600;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .video-instructor {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .video-block-right {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-shrink: 0;
    }

    .video-duration {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .yt-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #b91c1c;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-sm);
      text-decoration: none;
      white-space: nowrap;
      transition: all 0.15s ease;
    }

    .yt-link:hover {
      background-color: #fee2e2;
      border-color: #f87171;
    }

    /* Break Interval Card */
    .break-interval {
      background-color: var(--amber-surface);
      border: 1px solid var(--amber-border);
      border-radius: var(--radius-md);
      padding: 12px 18px;
      margin: 10px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .break-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .break-icon {
      font-size: 1.25rem;
      line-height: 1;
    }

    .break-title {
      font-weight: 600;
      color: var(--amber-text);
      font-size: 0.9rem;
    }

    .break-subtext {
      color: var(--amber-secondary);
      font-size: 0.8rem;
    }

    .break-btn {
      background-color: #ffffff;
      color: var(--amber-text);
      border: 1px solid var(--amber-border);
      padding: 7px 15px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.825rem;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .break-btn:hover {
      background-color: #fef9c3;
      border-color: #f59e0b;
    }

    /* Sunday Rest Card */
    .sunday-card {
      background-color: var(--red-surface);
      border: 1px solid var(--red-border);
      border-radius: var(--radius-lg);
      padding: 32px 24px;
      text-align: center;
      box-shadow: var(--shadow-sm);
    }

    .sunday-title {
      color: var(--red-text);
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .sunday-desc {
      color: var(--red-secondary);
      font-size: 0.95rem;
      max-width: 720px;
      margin: 0 auto 20px auto;
      line-height: 1.6;
    }

    .sunday-tips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }

    .sunday-tip {
      background-color: #ffffff;
      border: 1px solid var(--red-border);
      color: var(--red-text);
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 500;
    }

    /* Search Results View */
    .search-view {
      display: none;
    }

    .search-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 12px 18px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
    }

    .search-results-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Floating Break Timer Widget */
    .timer-floating {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 330px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 18px 20px;
      z-index: 1000;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .timer-floating.minimized {
      transform: translateY(calc(100% + 40px));
      opacity: 0;
      pointer-events: none;
    }

    .timer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .timer-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .timer-close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      font-size: 1.1rem;
      line-height: 1;
    }

    .timer-display {
      font-size: 2.5rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      text-align: center;
      margin: 6px 0;
      color: var(--amber-text);
      letter-spacing: 0.05em;
    }

    .timer-bar-container {
      height: 6px;
      background-color: var(--bg-subtle);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 14px;
    }

    .timer-bar {
      height: 100%;
      background-color: #d97706;
      width: 100%;
      transition: width 1s linear;
    }

    .timer-controls {
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    .timer-btn {
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      font-size: 0.825rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--border-color);
      background-color: var(--bg-subtle);
      color: var(--text-primary);
      transition: background-color 0.15s ease;
    }

    .timer-btn-primary {
      background-color: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }

    .timer-btn-primary:hover {
      background-color: var(--primary-hover);
    }

    .timer-badge-pill {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: var(--amber-surface);
      border: 1px solid var(--amber-border);
      color: var(--amber-text);
      font-weight: 600;
      font-size: 0.875rem;
      padding: 10px 18px;
      border-radius: 9999px;
      box-shadow: var(--shadow-md);
      cursor: pointer;
      z-index: 999;
      display: none;
      align-items: center;
      gap: 8px;
      font-variant-numeric: tabular-nums;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .video-block {
        flex-direction: column;
        align-items: flex-start;
      }
      .video-block-right {
        width: 100%;
        justify-content: space-between;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--border-color);
      }
      .video-title {
        white-space: normal;
      }
      .break-interval {
        flex-direction: column;
        align-items: flex-start;
      }
      .break-btn {
        width: 100%;
        text-align: center;
      }
      .timer-floating {
        width: calc(100vw - 32px);
        right: 16px;
        bottom: 16px;
      }
    }
  </style>
</head>
<body>

  <!-- App Header -->
  <header class="app-header">
    <div class="container header-content">
      <div>
        <h1 class="app-title">YKS 2027 Çalışma Takvimi</h1>
        <p class="app-subtitle">Sıfırdan Zirveye • Eşit Ağırlık & Sözel Hazırlık • Hedef: 19 Haziran 2027</p>
      </div>
      <div class="header-actions">
        <button class="btn" id="open-timer-btn" onclick="toggleTimerWidget(true)">
          ☕ Mola Zamanlayıcı (<span id="timer-header-display" class="tabular-nums">20:00</span>)
        </button>
      </div>
    </div>
  </header>

  <main class="container">

    <!-- KPI Summary Section -->
    <section class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Toplam İlerleme</div>
        <div class="kpi-value tabular-nums" id="kpi-progress-pct">0.0%</div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" id="kpi-progress-bar"></div>
        </div>
        <div class="kpi-subtext" id="kpi-progress-sub">766 videodan 0 izlendi</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">İzlenen Videolar</div>
        <div class="kpi-value tabular-nums" id="kpi-watched">0</div>
        <div class="kpi-subtext">Müfredat toplamı: 766 video</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Kalan Videolar</div>
        <div class="kpi-value tabular-nums" id="kpi-remaining">766</div>
        <div class="kpi-subtext">Hedef: 19 Haziran 2027</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Toplam Çalışma Süresi</div>
        <div class="kpi-value tabular-nums" id="kpi-study-time">0 sa 0 dk</div>
        <div class="kpi-subtext">Toplam müfredat: ~${totalCurriculumHours} saat</div>
      </div>
    </section>

    <!-- Course Progress Section -->
    <section class="course-section">
      <div class="course-section-header" id="course-toggle-btn" onclick="toggleCourseSection()">
        <span class="course-section-title">Ders Bazlı İlerleme (9 Ders)</span>
        <span id="course-toggle-icon">▲</span>
      </div>
      <div class="course-grid" id="course-grid-container">
        <!-- Rendered dynamically -->
      </div>
    </section>

    <!-- Navigation & Search Bar -->
    <section class="controls-bar">
      <div class="week-nav-group">
        <button class="btn" id="prev-week-btn" onclick="changeWeek(-1)">← Önceki Hafta</button>
        <select class="week-select" id="week-select" onchange="onWeekSelectChange(this.value)">
          ${weekOptionsHtml}
        </select>
        <button class="btn" id="next-week-btn" onclick="changeWeek(1)">Sonraki Hafta →</button>
        <button class="btn" id="jump-active-btn" onclick="jumpToCurrentWeek()">Kaldığım Hafta</button>
      </div>

      <div class="search-group">
        <input type="search" id="search-input" class="search-input" placeholder="Konu, ders veya eğitmen ara..." oninput="handleSearch(this.value)">
        <button class="btn" id="clear-search-btn" onclick="clearSearch()" style="display: none;">Temizle</button>
      </div>
    </section>

    <!-- Regular Schedule View -->
    <div id="schedule-view">
      <div class="week-banner">
        <div>
          <span class="week-banner-title" id="week-display-title">Hafta 1 / 42</span>
        </div>
        <div class="week-banner-stats">
          <span id="week-completed-badge" class="tabular-nums">0 / 24 Blok Tamamlandı</span>
          <button class="btn" style="margin-left: 12px; padding: 4px 10px; font-size: 0.775rem;" onclick="markCurrentWeekCompleted()">Haftayı Tamamla</button>
        </div>
      </div>

      <div class="day-container" id="days-container">
        <!-- Days rendered dynamically -->
      </div>
    </div>

    <!-- Search Results View -->
    <div id="search-view" class="search-view">
      <div class="search-header">
        <span id="search-results-count" class="tabular-nums" style="font-weight: 600;">0 video bulundu</span>
        <button class="btn" onclick="clearSearch()">Aramayı Kapat</button>
      </div>
      <div class="search-results-list" id="search-results-list">
        <!-- Search items rendered dynamically -->
      </div>
    </div>

  </main>

  <!-- Floating Break Timer Widget -->
  <aside class="timer-floating minimized" id="timer-widget">
    <div class="timer-header">
      <span class="timer-title">☕ 20 dk Mola Zamanlayıcı</span>
      <button class="timer-close-btn" onclick="toggleTimerWidget(false)" title="Kapat">✕</button>
    </div>
    <div class="timer-display tabular-nums" id="timer-display">20:00</div>
    <div class="timer-bar-container">
      <div class="timer-bar" id="timer-bar"></div>
    </div>
    <div class="timer-controls">
      <button class="timer-btn timer-btn-primary" id="timer-toggle-btn" onclick="toggleTimer()">Başlat</button>
      <button class="timer-btn" onclick="resetTimer()">Sıfırla</button>
      <button class="timer-btn" onclick="addTimerMinutes(5)">+5 dk</button>
    </div>
  </aside>

  <!-- Minimized Floating Pill Button -->
  <button class="timer-badge-pill" id="timer-pill" onclick="toggleTimerWidget(true)">
    ☕ Mola: <span id="timer-pill-display" class="tabular-nums">20:00</span>
  </button>

  <!-- Embedded Schedule Data and Client Engine -->
  <script>
    const SCHEDULE_DATA = ${scheduleJson};
    const SUBJECTS_DATA = ${subjectsJson};
    const TOTAL_VIDEOS = ${totalCurriculumVideos};

    // State
    const STORAGE_KEY_WATCHED = 'yks_watched_videos_v1';
    const STORAGE_KEY_WEEK = 'yks_current_week_v1';
    let watchedSet = new Set();
    let currentWeekNum = 1;
    let isCourseSectionOpen = true;

    // Timer State (20 minutes = 1200 seconds)
    const DEFAULT_BREAK_SECONDS = 1200; // 20 * 60
    let timerDuration = DEFAULT_BREAK_SECONDS;
    let timerRemaining = DEFAULT_BREAK_SECONDS;
    let timerInterval = null;
    let timerRunning = false;

    // Initialize application
    function init() {
      loadStorage();
      populateWeekSelect();
      renderCurrentWeek();
      renderCourseGrid();
      updateKpis();

      // Keyboard shortcut: '/' focuses search
      window.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          const searchInput = document.getElementById('search-input');
          if (searchInput) searchInput.focus();
        }
      });
    }

    // LocalStorage Management
    function loadStorage() {
      try {
        const savedWatched = localStorage.getItem(STORAGE_KEY_WATCHED);
        if (savedWatched) {
          watchedSet = new Set(JSON.parse(savedWatched));
        }
        const savedWeek = localStorage.getItem(STORAGE_KEY_WEEK);
        if (savedWeek) {
          const num = parseInt(savedWeek, 10);
          if (num >= 1 && num <= SCHEDULE_DATA.length) {
            currentWeekNum = num;
          }
        }
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
    }

    function saveStorage() {
      try {
        localStorage.setItem(STORAGE_KEY_WATCHED, JSON.stringify(Array.from(watchedSet)));
        localStorage.setItem(STORAGE_KEY_WEEK, String(currentWeekNum));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
    }

    function toggleVideoWatched(key, checked) {
      if (checked) {
        watchedSet.add(key);
      } else {
        watchedSet.delete(key);
      }
      saveStorage();
      updateKpis();
      updateCurrentWeekBadges();
      renderCourseGrid();

      // Update video block visual state in DOM
      const blockEl = document.getElementById('block-' + key);
      if (blockEl) {
        if (checked) {
          blockEl.classList.add('completed');
        } else {
          blockEl.classList.remove('completed');
        }
      }
    }

    function markCurrentWeekCompleted() {
      const week = SCHEDULE_DATA.find(w => w.weekNum === currentWeekNum);
      if (!week) return;
      for (const day of week.days) {
        if (day.isRestDay || !day.blocks) continue;
        for (const b of day.blocks) {
          const key = b.video.id || ('rev_' + currentWeekNum + '_' + day.dayName + '_' + b.blockNum);
          watchedSet.add(key);
        }
      }
      saveStorage();
      renderCurrentWeek();
      updateKpis();
      renderCourseGrid();
    }

    // Week Navigation
    function populateWeekSelect() {
      const select = document.getElementById('week-select');
      select.innerHTML = '';
      SCHEDULE_DATA.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.weekNum;
        opt.textContent = 'Hafta ' + w.weekNum;
        if (w.weekNum === currentWeekNum) opt.selected = true;
        select.appendChild(opt);
      });
    }

    function changeWeek(delta) {
      const newWeek = currentWeekNum + delta;
      if (newWeek >= 1 && newWeek <= SCHEDULE_DATA.length) {
        currentWeekNum = newWeek;
        saveStorage();
        document.getElementById('week-select').value = newWeek;
        renderCurrentWeek();
      }
    }

    function onWeekSelectChange(val) {
      currentWeekNum = parseInt(val, 10);
      saveStorage();
      renderCurrentWeek();
    }

    function jumpToCurrentWeek() {
      // Find first week with incomplete videos
      let targetWeek = 1;
      for (const w of SCHEDULE_DATA) {
        let hasIncomplete = false;
        for (const day of w.days) {
          if (day.isRestDay || !day.blocks) continue;
          for (const b of day.blocks) {
            const key = b.video.id || ('rev_' + w.weekNum + '_' + day.dayName + '_' + b.blockNum);
            if (!watchedSet.has(key)) {
              hasIncomplete = true;
              break;
            }
          }
          if (hasIncomplete) break;
        }
        if (hasIncomplete) {
          targetWeek = w.weekNum;
          break;
        }
      }
      currentWeekNum = targetWeek;
      saveStorage();
      document.getElementById('week-select').value = targetWeek;
      renderCurrentWeek();
    }

    function getSubjectBadgeClass(subj) {
      const map = {
        'TYT Türkçe': 'badge-tyt-turkce',
        'TYT-AYT Tarih': 'badge-tyt-ayt-tarih',
        'TYT Coğrafya': 'badge-tyt-cografya',
        'AYT Coğrafya': 'badge-ayt-cografya',
        'TYT Matematik': 'badge-tyt-matematik',
        'TYT Biyoloji': 'badge-tyt-biyoloji',
        'TYT Fizik': 'badge-tyt-fizik',
        'TYT Kimya': 'badge-tyt-kimya',
        'AYT Edebiyat': 'badge-ayt-edebiyat'
      };
      return map[subj] || 'badge-tekrar';
    }

    // Render Current Week
    function renderCurrentWeek() {
      const week = SCHEDULE_DATA.find(w => w.weekNum === currentWeekNum);
      if (!week) return;

      document.getElementById('week-display-title').textContent = 'Hafta ' + week.weekNum + ' / 42';
      document.getElementById('prev-week-btn').disabled = (currentWeekNum === 1);
      document.getElementById('next-week-btn').disabled = (currentWeekNum === SCHEDULE_DATA.length);

      const daysContainer = document.getElementById('days-container');
      daysContainer.innerHTML = '';

      let weekTotalBlocks = 0;
      let weekCompletedBlocks = 0;

      week.days.forEach(day => {
        if (day.isRestDay) {
          // Sunday Rest Day Card
          const restCard = document.createElement('div');
          restCard.className = 'sunday-card';
          restCard.innerHTML = \`
            <h2 class="sunday-title">⛔ PAZAR: ÇALIŞMAK KESİNLİKLE YASAK! (Beyin dinlenmeden öğrenme kalıcı olmaz)</h2>
            <p class="sunday-desc">
              Haftalık dinlenme, öğrenilen bilgilerin beyinde pekişmesi ve tükenmişlik (burnout) yaşamamak için programın zorunlu bir parçasıdır. 
              Bugün ders çalışmak, video izlemek veya test çözmek kesinlikle yasaktır! Kendine vakit ayır, temiz hava al ve zihnini yenile.
            </p>
            <div class="sunday-tips">
              <span class="sunday-tip">🌲 Temiz havada yürüyüş yap</span>
              <span class="sunday-tip">👥 Sevdiklerinle vakit geçir</span>
              <span class="sunday-tip">📱 Ders ekranlarından uzaklaş</span>
              <span class="sunday-tip">😴 8 saat kaliteli uyu</span>
            </div>
          \`;
          daysContainer.appendChild(restCard);
          return;
        }

        // Daily study card
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';

        let dayCompleted = 0;
        const totalDayBlocks = day.blocks.length;
        weekTotalBlocks += totalDayBlocks;

        const dayBlocksHtml = [];
        let dayDurationMin = 0;

        day.blocks.forEach((block, idx) => {
          const video = block.video;
          const key = video.id || ('rev_' + week.weekNum + '_' + day.dayName + '_' + block.blockNum);
          const isDone = watchedSet.has(key);
          if (isDone) {
            dayCompleted++;
            weekCompletedBlocks++;
          }
          dayDurationMin += video.duration_min || 0;

          const badgeCls = getSubjectBadgeClass(block.subject);
          const blockTitle = video.title || 'Ders Videosu';
          const instructor = block.instructor || video.instructor || '';
          const durationStr = (video.duration_min ? video.duration_min + ' dk' : '40 dk');
          const ytUrl = video.url || '';

          const blockHtml = \`
            <div class="video-block \${isDone ? 'completed' : ''}" id="block-\${key}">
              <div class="video-block-left">
                <input type="checkbox" class="block-checkbox" \${isDone ? 'checked' : ''} 
                  onchange="toggleVideoWatched('\${key}', this.checked)" title="Tamamlandı olarak işaretle">
                <span class="block-num-badge tabular-nums">Blok \${block.blockNum}</span>
                <div class="video-details">
                  <div class="video-details-header">
                    <span class="subject-badge \${badgeCls}">\${block.subject}</span>
                    <span class="video-title" title="\${blockTitle}">\${video.index ? '#' + video.index + ' ' : ''}\${blockTitle}</span>
                  </div>
                  <div class="video-instructor">\${instructor}</div>
                </div>
              </div>
              <div class="video-block-right">
                <span class="video-duration tabular-nums">\${durationStr}</span>
                \${ytUrl ? \`<a href="\${ytUrl}" target="_blank" rel="noopener noreferrer" class="yt-link">Videoyu Aç ↗</a>\` : ''}
              </div>
            </div>
          \`;

          dayBlocksHtml.push(blockHtml);

          // Add 20-minute break interval card between blocks (after blocks 1, 2, 3)
          if (idx < day.blocks.length - 1) {
            const breakCardHtml = \`
              <div class="break-interval">
                <div class="break-info">
                  <span class="break-icon">☕</span>
                  <div>
                    <div class="break-title">20 dk Mola (\${block.blockNum}. Blok Sonrası)</div>
                    <div class="break-subtext">Zihnini toparla, su iç, hareket et. Beyin dinlenirken öğrenir.</div>
                  </div>
                </div>
                <button class="break-btn" onclick="startBreakTimer(1200)">☕ 20 dk Mola Başlat</button>
              </div>
            \`;
            dayBlocksHtml.push(breakCardHtml);
          }
        });

        // Unique subjects summary for day header
        const daySubjects = Array.from(new Set(day.blocks.map(b => b.subject))).join(' & ');

        dayCard.innerHTML = \`
          <div class="day-header">
            <div class="day-title-group">
              <h2 class="day-title">\${day.dayName}</h2>
              <span class="day-summary-text">\${daySubjects} • \${Math.round(dayDurationMin)} dk video + 60 dk mola</span>
            </div>
            <span class="day-progress-badge tabular-nums" id="day-badge-\${day.dayName}">\${dayCompleted} / \${totalDayBlocks} Tamamlandı</span>
          </div>
          <div class="day-blocks-list">
            \${dayBlocksHtml.join('')}
          </div>
        \`;

        daysContainer.appendChild(dayCard);
      });

      // Update week completion banner stats
      const pct = weekTotalBlocks > 0 ? ((weekCompletedBlocks / weekTotalBlocks) * 100).toFixed(0) : 0;
      document.getElementById('week-completed-badge').textContent = \`\${weekCompletedBlocks} / \${weekTotalBlocks} Blok Tamamlandı (%\${pct})\`;
    }

    function updateCurrentWeekBadges() {
      const week = SCHEDULE_DATA.find(w => w.weekNum === currentWeekNum);
      if (!week) return;

      let weekTotalBlocks = 0;
      let weekCompletedBlocks = 0;

      week.days.forEach(day => {
        if (day.isRestDay || !day.blocks) return;
        let dayCompleted = 0;
        day.blocks.forEach(b => {
          weekTotalBlocks++;
          const key = b.video.id || ('rev_' + week.weekNum + '_' + day.dayName + '_' + b.blockNum);
          if (watchedSet.has(key)) {
            dayCompleted++;
            weekCompletedBlocks++;
          }
        });
        const badgeEl = document.getElementById('day-badge-' + day.dayName);
        if (badgeEl) {
          badgeEl.textContent = \`\${dayCompleted} / \${day.blocks.length} Tamamlandı\`;
        }
      });

      const pct = weekTotalBlocks > 0 ? ((weekCompletedBlocks / weekTotalBlocks) * 100).toFixed(0) : 0;
      document.getElementById('week-completed-badge').textContent = \`\${weekCompletedBlocks} / \${weekTotalBlocks} Blok Tamamlandı (%\${pct})\`;
    }

    // Render Course Breakdown Grid
    function renderCourseGrid() {
      const container = document.getElementById('course-grid-container');
      if (!container) return;

      // Calculate progress per subject
      const subjectProgress = {};
      for (const subj of Object.keys(SUBJECTS_DATA)) {
        subjectProgress[subj] = { watched: 0, total: SUBJECTS_DATA[subj].videoCount };
      }

      // Count watched curriculum videos
      for (const w of SCHEDULE_DATA) {
        for (const day of w.days) {
          if (day.isRestDay || !day.blocks) continue;
          for (const b of day.blocks) {
            if (b.video?.id && watchedSet.has(b.video.id)) {
              if (subjectProgress[b.subject]) {
                subjectProgress[b.subject].watched++;
              }
            }
          }
        }
      }

      container.innerHTML = Object.entries(SUBJECTS_DATA).map(([subj, info]) => {
        const prog = subjectProgress[subj] || { watched: 0, total: info.videoCount };
        const pct = prog.total > 0 ? ((prog.watched / prog.total) * 100).toFixed(1) : 0;
        const badgeCls = getSubjectBadgeClass(subj);

        return \`
          <div class="course-card">
            <div class="course-card-top">
              <span class="subject-badge \${badgeCls}">\${subj}</span>
              <span class="course-card-count tabular-nums">\${prog.watched} / \${prog.total}</span>
            </div>
            <div class="course-card-meta">\${info.instructor} • ~\${info.totalHours} saat</div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: \${pct}%"></div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function toggleCourseSection() {
      isCourseSectionOpen = !isCourseSectionOpen;
      const container = document.getElementById('course-grid-container');
      const icon = document.getElementById('course-toggle-icon');
      if (isCourseSectionOpen) {
        container.style.display = 'grid';
        icon.textContent = '▲';
      } else {
        container.style.display = 'none';
        icon.textContent = '▼';
      }
    }

    // Live KPI Counters Update
    function updateKpis() {
      let watchedCount = 0;
      let watchedMinutes = 0;

      // Calculate from schedule data
      for (const w of SCHEDULE_DATA) {
        for (const day of w.days) {
          if (day.isRestDay || !day.blocks) continue;
          for (const b of day.blocks) {
            if (b.video?.id && watchedSet.has(b.video.id)) {
              watchedCount++;
              watchedMinutes += b.video.duration_min || 0;
            }
          }
        }
      }

      const remaining = Math.max(0, TOTAL_VIDEOS - watchedCount);
      const pct = TOTAL_VIDEOS > 0 ? ((watchedCount / TOTAL_VIDEOS) * 100).toFixed(1) : '0.0';

      const hours = Math.floor(watchedMinutes / 60);
      const mins = Math.round(watchedMinutes % 60);
      const studyTimeStr = hours + ' sa ' + mins + ' dk';

      document.getElementById('kpi-progress-pct').textContent = pct + '%';
      document.getElementById('kpi-progress-bar').style.width = pct + '%';
      document.getElementById('kpi-progress-sub').textContent = \`\${TOTAL_VIDEOS} videodan \${watchedCount} izlendi\`;
      document.getElementById('kpi-watched').textContent = watchedCount;
      document.getElementById('kpi-remaining').textContent = remaining;
      document.getElementById('kpi-study-time').textContent = studyTimeStr;
    }

    // Search and Topic Filtering
    function handleSearch(rawQuery) {
      const query = (rawQuery || '').trim().toLowerCase();
      const queryTr = (rawQuery || '').trim().toLocaleLowerCase('tr-TR');
      const scheduleView = document.getElementById('schedule-view');
      const searchView = document.getElementById('search-view');
      const clearBtn = document.getElementById('clear-search-btn');

      if (!query) {
        scheduleView.style.display = 'block';
        searchView.style.display = 'none';
        clearBtn.style.display = 'none';
        return;
      }

      scheduleView.style.display = 'none';
      searchView.style.display = 'block';
      clearBtn.style.display = 'inline-flex';

      const results = [];
      SCHEDULE_DATA.forEach(w => {
        w.days.forEach(day => {
          if (day.isRestDay || !day.blocks) return;
          day.blocks.forEach(b => {
            const video = b.video;
            if (!video || !video.id) return;

            const t = (video.title || '').toLowerCase();
            const s = (b.subject || '').toLowerCase();
            const ins = (b.instructor || video.instructor || '').toLowerCase();

            const titleMatch = t.includes(query) || (video.title || '').toLocaleLowerCase('tr-TR').includes(queryTr);
            const subjMatch = s.includes(query) || (b.subject || '').toLocaleLowerCase('tr-TR').includes(queryTr);
            const instMatch = ins.includes(query) || (b.instructor || video.instructor || '').toLocaleLowerCase('tr-TR').includes(queryTr);

            if (titleMatch || subjMatch || instMatch) {
              results.push({
                weekNum: w.weekNum,
                dayName: day.dayName,
                blockNum: b.blockNum,
                subject: b.subject,
                instructor: b.instructor || video.instructor || '',
                video
              });
            }
          });
        });
      });

      document.getElementById('search-results-count').textContent = results.length + ' video bulundu';

      const resultsList = document.getElementById('search-results-list');
      if (results.length === 0) {
        resultsList.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-secondary); background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md);">Aramanıza uygun video bulunamadı.</div>';
        return;
      }

      resultsList.innerHTML = results.map(item => {
        const key = item.video.id;
        const isDone = watchedSet.has(key);
        const badgeCls = getSubjectBadgeClass(item.subject);

        return \`
          <div class="video-block \${isDone ? 'completed' : ''}" id="block-\${key}">
            <div class="video-block-left">
              <input type="checkbox" class="block-checkbox" \${isDone ? 'checked' : ''} 
                onchange="toggleVideoWatched('\${key}', this.checked)">
              <span class="block-num-badge tabular-nums">H\${item.weekNum} • \${item.dayName}</span>
              <div class="video-details">
                <div class="video-details-header">
                  <span class="subject-badge \${badgeCls}">\${item.subject}</span>
                  <span class="video-title">\${item.video.index ? '#' + item.video.index + ' ' : ''}\${item.video.title}</span>
                </div>
                <div class="video-instructor">\${item.instructor}</div>
              </div>
            </div>
            <div class="video-block-right">
              <span class="video-duration tabular-nums">\${item.video.duration_min} dk</span>
              <button class="btn" style="padding: 5px 10px; font-size: 0.775rem;" onclick="goToWeekFromSearch(\${item.weekNum})">Haftaya Git</button>
              <a href="\${item.video.url}" target="_blank" rel="noopener noreferrer" class="yt-link">Videoyu Aç ↗</a>
            </div>
          </div>
        \`;
      }).join('');
    }

    function clearSearch() {
      const input = document.getElementById('search-input');
      if (input) input.value = '';
      handleSearch('');
    }

    function goToWeekFromSearch(weekNum) {
      clearSearch();
      currentWeekNum = weekNum;
      saveStorage();
      document.getElementById('week-select').value = weekNum;
      renderCurrentWeek();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Break Timer Logic (20 minutes = 1200 seconds)
    function formatTime(totalSec) {
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function updateTimerDisplay() {
      const str = formatTime(timerRemaining);
      const displayEl = document.getElementById('timer-display');
      const pillDisplayEl = document.getElementById('timer-pill-display');
      const headerDisplayEl = document.getElementById('timer-header-display');
      const barEl = document.getElementById('timer-bar');

      if (displayEl) displayEl.textContent = str;
      if (pillDisplayEl) pillDisplayEl.textContent = str;
      if (headerDisplayEl) headerDisplayEl.textContent = str;

      if (barEl) {
        const pct = (timerRemaining / timerDuration) * 100;
        barEl.style.width = pct + '%';
      }

      if (timerRunning) {
        document.title = '(' + str + ') ☕ Mola Devam Ediyor • YKS Takvimi';
      } else {
        document.title = 'YKS 2027 Çalışma Takvimi • Etkileşimli Panel';
      }
    }

    function toggleTimerWidget(show) {
      const widget = document.getElementById('timer-widget');
      const pill = document.getElementById('timer-pill');
      if (show) {
        widget.classList.remove('minimized');
        pill.style.display = 'none';
      } else {
        widget.classList.add('minimized');
        if (timerRunning) {
          pill.style.display = 'flex';
        }
      }
    }

    function startBreakTimer(seconds = 1200) {
      timerDuration = seconds;
      timerRemaining = seconds;
      toggleTimerWidget(true);
      resumeTimer();
    }

    let audioCtx = null;
    let targetEndTime = 0;

    function getAudioContext() {
      if (!audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) audioCtx = new AudioCtx();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function toggleTimer() {
      if (timerRunning) {
        pauseTimer();
      } else {
        resumeTimer();
      }
    }

    function resumeTimer() {
      if (timerRunning) return;
      getAudioContext();
      timerRunning = true;
      document.getElementById('timer-toggle-btn').textContent = 'Duraklat';
      targetEndTime = Date.now() + timerRemaining * 1000;
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        const now = Date.now();
        timerRemaining = Math.max(0, Math.round((targetEndTime - now) / 1000));
        updateTimerDisplay();
        if (timerRemaining <= 0) {
          clearInterval(timerInterval);
          onTimerComplete();
        }
      }, 500);
      updateTimerDisplay();
    }

    function pauseTimer() {
      timerRunning = false;
      clearInterval(timerInterval);
      document.getElementById('timer-toggle-btn').textContent = 'Devam Et';
      updateTimerDisplay();
    }

    function resetTimer() {
      pauseTimer();
      timerRemaining = timerDuration;
      targetEndTime = Date.now() + timerRemaining * 1000;
      document.getElementById('timer-toggle-btn').textContent = 'Başlat';
      updateTimerDisplay();
    }

    function addTimerMinutes(mins = 5) {
      timerRemaining += mins * 60;
      timerDuration = Math.max(timerDuration, timerRemaining);
      if (timerRunning) {
        targetEndTime += mins * 60 * 1000;
      }
      updateTimerDisplay();
    }

    // Synthesize gentle dual-tone chime with Web Audio API (offline, zero audio assets)
    function playChime() {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // First tone: D5 (587.33 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now);
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.8);

        // Second tone: A5 (880.00 Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.25);
        gain2.gain.setValueAtTime(0.3, now + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.25);
        osc2.stop(now + 1.2);
      } catch (err) {
        console.warn('Audio chime unavailable:', err);
      }
    }

    function onTimerComplete() {
      pauseTimer();
      playChime();
      document.title = '☕ (Mola Bitti!) YKS 2027 Çalışma Takvimi';
      setTimeout(() => {
        alert('☕ 20 dakikalık mola tamamlandı! Zihnin dinlendi, bir sonraki video bloğuna geçmeye hazırsın.');
      }, 1300);
    }

    // Run on page load
    window.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Generated companion HTML dashboard: ${outputPath} (${(html.length / 1024).toFixed(1)} KB)`);
  return html;
}

// Direct CLI execution
if (process.argv[1] && process.argv[1].endsWith('generate_dashboard.js')) {
  generateDashboardHtml();
}
