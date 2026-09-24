import fs from 'node:fs';
import path from 'node:path';
import { generateCalendarDays } from './calendar_engine.js';

export function generateMobileAppHtml(dataPath = 'playlists_data_tr.json', outputDir = 'www') {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const baselineWeeks = generateCalendarDays(data);

  // Curriculum calculations
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
      instructor: info.metadata?.instructor || (info.videos && info.videos[0]?.instructor) || '',
      videoCount,
      totalMinutes: Math.round(sec / 60),
      totalHours: (sec / 3600).toFixed(1)
    };
  }

  const totalCurriculumHours = (totalCurriculumSeconds / 3600).toFixed(1);

  // Pre-generate static Day Selector options for all 42 weeks
  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const daySelectorOptionsHtml = baselineWeeks.map(w => {
    const opts = dayNames.map((dName, dIdx) => {
      const isSelected = w.weekNum === 1 && dIdx === 0 ? 'selected' : '';
      return `<option value="${w.weekNum}-${dIdx}" ${isSelected}>Hafta ${w.weekNum} • ${dName}</option>`;
    }).join('\n            ');
    return `
          <optgroup label="Hafta ${w.weekNum}">
            ${opts}
          </optgroup>`;
  }).join('\n');

  // Pre-generate static 42-week Timeline cards
  const staticTimelineHtml = baselineWeeks.map(w => {
    let weekTotalBlocks = 0;
    w.days.forEach(d => {
      if (!d.isRestDay && d.blocks) {
        weekTotalBlocks += d.blocks.length;
      }
    });

    const dayRows = w.days.map(d => {
      if (d.isRestDay) {
        return `<div class="week-day-row"><span>${d.dayName}</span><span style="color: var(--m3-red-primary); font-weight: 600;">⛔ Dinlenme Günü</span></div>`;
      }
      const bCount = d.blocks?.length || 4;
      return `
        <div class="week-day-row">
          <span>${d.dayName}</span>
          <span class="tabular-nums" style="color: var(--m3-text-secondary);">0 / ${bCount} İzlendi</span>
        </div>
      `;
    }).join('\n                ');

    return `
        <div class="week-card" id="week-card-${w.weekNum}">
          <div class="week-header" onclick="toggleWeekAccordion(${w.weekNum})">
            <div class="week-header-left">
              <span class="week-title">Hafta ${w.weekNum}</span>
            </div>
            <span class="week-progress-pill tabular-nums">
              0 / ${weekTotalBlocks} Blok
            </span>
          </div>
          <div class="week-details" id="week-details-${w.weekNum}">
            ${dayRows}
            <button class="btn btn-outline" style="width: 100%; margin-top: 10px; min-height: 48px; font-size: 0.85rem;"
              onclick="jumpToWeek(${w.weekNum})">
              Bu Haftayı 'Bugün' Olarak Aç
            </button>
          </div>
        </div>`;
  }).join('\n');

  // Pre-generate 9 Subjects progress cards
  const subjectsCardsHtml = Object.entries(subjectsMap).map(([subjectName, info]) => {
    return `
        <div class="course-card">
          <div class="course-card-top">
            <span class="course-name">${subjectName}</span>
            <span class="course-pct tabular-nums" id="course-pct-${subjectName.replace(/\s+/g, '-')}">%0.0</span>
          </div>
          <div class="course-meta">Eğitmen: ${info.instructor}</div>
          <div class="progress-track">
            <div class="progress-fill" id="course-bar-${subjectName.replace(/\s+/g, '-')}" style="width: 0%;"></div>
          </div>
          <div class="course-stats-line tabular-nums" id="course-stats-${subjectName.replace(/\s+/g, '-')}">
            <span>0 / ${info.videoCount} Video</span>
            <span>0.0 / ${info.totalHours} Saat</span>
            <span>${info.videoCount} Video Kaldı</span>
          </div>
        </div>`;
  }).join('\n');

  // Serialized data for the client app
  const rawPlaylistsJson = JSON.stringify(data);
  const baselineWeeksJson = JSON.stringify(baselineWeeks);
  const subjectsJson = JSON.stringify(subjectsMap);

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no">
  <title>YKS 2027 Koçu</title>
  <meta name="description" content="YKS 2027 hazırlığı için 766 videoluk kişisel çalışma koçu, stressiz kaydırma motoru ve 20 dakikalık haptik mola zamanlayıcısı.">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#0f172a">
  <link rel="apple-touch-icon" href="icons/icon-192.svg">
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.warn('SW registration failed:', err);
        });
      });
    }
  </script>
  <style>
    :root {
      --sat: env(safe-area-inset-top);
      --sab: env(safe-area-inset-bottom);
      --sal: env(safe-area-inset-left);
      --sar: env(safe-area-inset-right);

      --m3-bg: #f8fafc;
      --m3-surface: #ffffff;
      --m3-surface-subtle: #f1f5f9;
      --m3-surface-variant: #e2e8f0;
      --m3-border: #e2e8f0;
      --m3-border-strong: #cbd5e1;

      --m3-primary: #1e293b;
      --m3-primary-hover: #0f172a;
      --m3-primary-container: #e2e8f0;
      --m3-on-primary-container: #0f172a;

      --m3-accent: #2563eb;
      --m3-accent-hover: #1d4ed8;
      --m3-accent-subtle: #eff6ff;
      --m3-accent-border: #bfdbfe;

      /* Mint Completion Palette */
      --m3-mint: #10b981;
      --m3-mint-hover: #059669;
      --m3-mint-surface: #ecfdf5;
      --m3-mint-border: #a7f3d0;
      --m3-mint-text: #065f46;

      /* Amber Palette for Breaks */
      --m3-amber-surface: #fffbeb;
      --m3-amber-border: #fde68a;
      --m3-amber-text: #92400e;
      --m3-amber-primary: #d97706;

      /* Red Palette for Sunday Rest */
      --m3-red-surface: #fef2f2;
      --m3-red-border: #fecaca;
      --m3-red-text: #991b1b;
      --m3-red-primary: #dc2626;

      --m3-text-primary: #0f172a;
      --m3-text-secondary: #475569;
      --m3-text-muted: #64748b;

      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --radius-full: 9999px;

      --shadow-sm: 0 1px 2px 0 rgba(15, 23, 42, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04);
      --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.05);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      background-color: var(--m3-bg);
      color: var(--m3-text-primary);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      padding-top: calc(56px + env(safe-area-inset-top));
      padding-bottom: calc(72px + env(safe-area-inset-bottom));
      min-height: 100vh;
      overflow-x: hidden;
    }

    ::selection {
      background-color: #dbeafe;
      color: #1e40af;
    }

    :focus-visible {
      outline: 2px solid var(--m3-accent);
      outline-offset: 2px;
    }

    .tabular-nums {
      font-variant-numeric: tabular-nums;
    }

    /* ==========================================================================
       Top App Bar (Material 3)
       ========================================================================== */
    .top-app-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: calc(56px + env(safe-area-inset-top));
      padding-top: env(safe-area-inset-top);
      padding-left: 16px;
      padding-right: 16px;
      background-color: var(--m3-surface);
      border-bottom: 1px solid var(--m3-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 100;
    }

    .top-bar-left {
      display: flex;
      flex-direction: column;
    }

    .top-bar-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--m3-text-primary);
      letter-spacing: -0.01em;
    }

    .top-bar-subtitle {
      font-size: 0.75rem;
      color: var(--m3-text-secondary);
      font-weight: 500;
    }

    .top-bar-progress-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      background-color: var(--m3-mint-surface);
      border: 1px solid var(--m3-mint-border);
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--m3-mint-text);
    }

    .progress-dot {
      width: 7px;
      height: 7px;
      background-color: var(--m3-mint);
      border-radius: 50%;
    }

    /* ==========================================================================
       Bottom Navigation Bar (Material 3, >=48dp touch targets)
       ========================================================================== */
    .m3-bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: calc(64px + env(safe-area-inset-bottom));
      padding-bottom: env(safe-area-inset-bottom);
      background-color: var(--m3-surface);
      border-top: 1px solid var(--m3-border);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 100;
    }

    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      min-width: 48px;
      height: 100%;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--m3-text-secondary);
      transition: color 0.15s ease;
      user-select: none;
    }

    .nav-item.active {
      color: var(--m3-text-primary);
    }

    .nav-pill {
      width: 52px;
      height: 30px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2px;
      transition: background-color 0.2s ease;
    }

    .nav-item.active .nav-pill {
      background-color: var(--m3-primary-container);
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      stroke-width: 2;
    }

    .nav-label {
      font-size: 0.725rem;
      font-weight: 600;
    }

    /* ==========================================================================
       Tab Navigation System
       ========================================================================== */
    .tab-pane {
      display: none;
      padding: 16px;
      max-width: 680px;
      margin: 0 auto;
    }

    .tab-pane.active {
      display: block;
    }

    /* ==========================================================================
       Shared Elements & Cards
       ========================================================================== */
    .card {
      background-color: var(--m3-surface);
      border: 1px solid var(--m3-border);
      border-radius: var(--radius-md);
      padding: 16px;
      margin-bottom: 14px;
      box-shadow: var(--shadow-sm);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 16px;
      min-height: 48px;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      cursor: pointer;
      border: 1px solid var(--m3-border);
      background-color: var(--m3-surface);
      color: var(--m3-text-primary);
      transition: all 0.15s ease;
      text-decoration: none;
    }

    .btn:hover {
      background-color: var(--m3-surface-subtle);
    }

    .btn-primary {
      background-color: var(--m3-primary);
      color: #ffffff;
      border-color: var(--m3-primary);
    }

    .btn-primary:hover {
      background-color: var(--m3-primary-hover);
    }

    .btn-shift {
      background-color: #2563eb;
      color: #ffffff;
      border-color: #2563eb;
      width: 100%;
    }

    .btn-shift:hover {
      background-color: #1d4ed8;
    }

    .btn-outline {
      background-color: transparent;
      border-color: var(--m3-border-strong);
      color: var(--m3-text-primary);
    }

    /* Subject Badges */
    .subject-badge {
      font-size: 0.725rem;
      font-weight: 700;
      padding: 2px 7px;
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

    /* ==========================================================================
       TAB 1: Bugün (Daily 4 Blocks + Break Cards + Sunday Rest)
       ========================================================================== */
    .day-selector-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 12px;
    }

    .day-selector-btn {
      min-width: 48px;
      min-height: 48px;
      padding: 6px 12px;
      background-color: var(--m3-surface);
      border: 1px solid var(--m3-border);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--m3-text-primary);
      cursor: pointer;
    }

    .day-select-dropdown {
      flex: 1;
      height: 48px;
      padding: 8px 12px;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: 1px solid var(--m3-border);
      background-color: var(--m3-surface);
      color: var(--m3-text-primary);
      cursor: pointer;
    }

    .today-summary-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background-color: var(--m3-surface);
      border: 1px solid var(--m3-border);
      border-radius: var(--radius-md);
      margin-bottom: 16px;
    }

    .summary-text-group h3 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--m3-text-primary);
    }

    .summary-text-group p {
      font-size: 0.775rem;
      color: var(--m3-text-secondary);
    }

    .summary-badge {
      font-size: 0.8rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      background-color: var(--m3-surface-subtle);
      color: var(--m3-text-primary);
    }

    /* Video Block Row */
    .video-block-card {
      background-color: var(--m3-surface);
      border: 1px solid var(--m3-border);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      margin-bottom: 10px;
      transition: background-color 0.15s ease, border-color 0.15s ease;
      box-shadow: var(--shadow-sm);
    }

    .video-block-card.completed {
      background-color: var(--m3-mint-surface);
      border-color: var(--m3-mint-border);
    }

    .video-block-card.completed .video-title {
      text-decoration: line-through;
      color: var(--m3-text-muted);
    }

    .video-block-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .video-block-meta-left {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .block-num-pill {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--m3-text-muted);
      background-color: var(--m3-surface-subtle);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .video-instructor-label {
      font-size: 0.75rem;
      color: var(--m3-text-secondary);
      font-weight: 500;
    }

    .video-duration-pill {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--m3-text-secondary);
      background-color: var(--m3-surface-subtle);
      padding: 2px 7px;
      border-radius: 4px;
    }

    .video-title {
      font-size: 0.925rem;
      font-weight: 600;
      color: var(--m3-text-primary);
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .video-block-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 48px;
      min-width: 48px;
      cursor: pointer;
      user-select: none;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--m3-text-primary);
    }

    .block-checkbox {
      width: 24px;
      height: 24px;
      accent-color: var(--m3-mint);
      cursor: pointer;
    }

    .yt-intent-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 48px;
      padding: 8px 14px;
      font-size: 0.825rem;
      font-weight: 700;
      color: #b91c1c;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-sm);
      text-decoration: none;
      transition: background-color 0.15s ease;
      cursor: pointer;
    }

    .yt-intent-btn:hover {
      background-color: #fee2e2;
    }

    /* Break Card Between Blocks */
    .break-card {
      background-color: var(--m3-amber-surface);
      border: 1px solid var(--m3-amber-border);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      margin: 10px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .break-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .break-icon {
      font-size: 1.25rem;
    }

    .break-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--m3-amber-text);
    }

    .break-desc {
      font-size: 0.75rem;
      color: #b45309;
    }

    .break-start-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 8px 14px;
      background-color: #ffffff;
      color: var(--m3-amber-text);
      border: 1px solid var(--m3-amber-border);
      border-radius: var(--radius-sm);
      font-size: 0.825rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }

    .break-start-btn:hover {
      background-color: #fef3c7;
    }

    /* Sunday Rest Screen */
    .sunday-rest-card {
      background-color: var(--m3-red-surface);
      border: 1px solid var(--m3-red-border);
      border-radius: var(--radius-lg);
      padding: 24px 18px;
      text-align: center;
      margin: 16px 0;
      box-shadow: var(--shadow-sm);
    }

    .sunday-icon {
      font-size: 2.2rem;
      margin-bottom: 8px;
    }

    .sunday-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--m3-red-text);
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .sunday-desc {
      font-size: 0.875rem;
      color: #b91c1c;
      line-height: 1.6;
      margin-bottom: 18px;
    }

    .sunday-tips-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 20px;
    }

    .sunday-tip-chip {
      background-color: #ffffff;
      border: 1px solid var(--m3-red-border);
      color: var(--m3-red-text);
      padding: 10px 8px;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      text-align: center;
    }

    /* ==========================================================================
       TAB 2: Radar (42 Weeks + Stress-Free Shift Engine + Target Countdown)
       ========================================================================== */
    .radar-target-card {
      background-color: var(--m3-surface);
      border: 1px solid var(--m3-border);
      border-radius: var(--radius-lg);
      padding: 18px;
      margin-bottom: 16px;
      box-shadow: var(--shadow-sm);
    }

    .target-badge-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .target-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--m3-text-primary);
    }

    .target-countdown-badge {
      font-size: 0.825rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      background-color: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }

    .radar-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 12px;
    }

    .radar-stat-box {
      background-color: var(--m3-surface-subtle);
      border-radius: var(--radius-sm);
      padding: 10px 8px;
      text-align: center;
    }

    .radar-stat-val {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--m3-text-primary);
    }

    .radar-stat-lbl {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--m3-text-secondary);
      margin-top: 2px;
    }

    /* Stress-Free Shift Card */
    .shift-engine-card {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: var(--radius-md);
      padding: 16px;
      margin-bottom: 16px;
    }

    .shift-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .shift-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #166534;
    }

    .shift-desc {
      font-size: 0.8rem;
      color: #15803d;
      line-height: 1.5;
      margin-bottom: 14px;
    }

    .shift-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Timeline Accordion */
    .timeline-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .week-card {
      background-color: var(--m3-surface);
      border: 1px solid var(--m3-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .week-header {
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 48px;
      cursor: pointer;
      user-select: none;
    }

    .week-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .week-title {
      font-size: 0.925rem;
      font-weight: 700;
      color: var(--m3-text-primary);
    }

    .week-progress-pill {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-full);
      background-color: var(--m3-surface-subtle);
      color: var(--m3-text-secondary);
    }

    .week-progress-pill.all-done {
      background-color: var(--m3-mint-surface);
      color: var(--m3-mint-text);
      border: 1px solid var(--m3-mint-border);
    }

    .week-details {
      display: none;
      padding: 12px 16px;
      background-color: var(--m3-surface-subtle);
      border-top: 1px solid var(--m3-border);
    }

    .week-details.open {
      display: block;
    }

    .week-day-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.825rem;
    }

    .week-day-row:last-child {
      border-bottom: none;
    }

    /* ==========================================================================
       TAB 3: Müfredat (9 Subjects Progress + Turkish Search + JSON Backup)
       ========================================================================== */
    .search-box-wrapper {
      margin-bottom: 16px;
    }

    .search-input {
      width: 100%;
      min-height: 48px;
      padding: 10px 16px;
      font-size: 0.9rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--m3-border-strong);
      background-color: var(--m3-surface);
      color: var(--m3-text-primary);
    }

    .search-input:focus {
      border-color: var(--m3-accent);
      outline: none;
    }

    .search-results-box {
      display: none;
      margin-bottom: 20px;
    }

    .course-cards-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .course-card {
      background-color: var(--m3-surface);
      border: 1px solid var(--m3-border);
      border-radius: var(--radius-md);
      padding: 14px 16px;
      box-shadow: var(--shadow-sm);
    }

    .course-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .course-name {
      font-size: 0.925rem;
      font-weight: 700;
      color: var(--m3-text-primary);
    }

    .course-pct {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--m3-mint-text);
    }

    .course-meta {
      font-size: 0.775rem;
      color: var(--m3-text-secondary);
      margin-bottom: 8px;
    }

    .progress-track {
      height: 8px;
      background-color: var(--m3-surface-subtle);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background-color: var(--m3-mint);
      width: 0%;
      transition: width 0.3s ease;
    }

    .course-stats-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--m3-text-muted);
      font-weight: 500;
    }

    /* Backup Card */
    .backup-card {
      background-color: var(--m3-surface);
      border: 1px solid var(--m3-border);
      border-radius: var(--radius-md);
      padding: 16px;
      margin-top: 16px;
    }

    .backup-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--m3-text-primary);
      margin-bottom: 6px;
    }

    .backup-desc {
      font-size: 0.8rem;
      color: var(--m3-text-secondary);
      margin-bottom: 12px;
    }

    .backup-buttons {
      display: flex;
      gap: 10px;
    }

    /* ==========================================================================
       Break Timer Modal / Bottom Sheet
       ========================================================================== */
    .timer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(2px);
      z-index: 200;
      display: none;
      align-items: flex-end;
      justify-content: center;
    }

    .timer-overlay.open {
      display: flex;
    }

    .timer-sheet {
      width: 100%;
      max-width: 500px;
      background-color: var(--m3-surface);
      border-top-left-radius: var(--radius-lg);
      border-top-right-radius: var(--radius-lg);
      padding: 24px 20px calc(24px + env(safe-area-inset-bottom)) 20px;
      box-shadow: var(--shadow-lg);
      text-align: center;
      animation: slideUp 0.25s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .timer-sheet-handle {
      width: 36px;
      height: 4px;
      background-color: var(--m3-border-strong);
      border-radius: 2px;
      margin: 0 auto 16px auto;
    }

    .timer-heading {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--m3-text-primary);
      margin-bottom: 4px;
    }

    .timer-subheading {
      font-size: 0.8rem;
      color: var(--m3-text-secondary);
      margin-bottom: 16px;
    }

    .timer-clock {
      font-size: 3.5rem;
      font-weight: 800;
      color: var(--m3-amber-primary);
      letter-spacing: 0.04em;
      margin-bottom: 14px;
    }

    .timer-progress-bar {
      height: 8px;
      background-color: var(--m3-surface-subtle);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .timer-progress-fill {
      height: 100%;
      background-color: var(--m3-amber-primary);
      width: 100%;
      transition: width 1s linear;
    }

    .timer-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    /* Top Bar Actions & Install Button */
    .top-bar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pwa-install-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background-color: var(--m3-surface-subtle);
      border: 1px solid var(--m3-border);
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--m3-text-primary);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .pwa-install-btn:hover {
      background-color: var(--m3-surface-variant);
    }

    .desktop-nav-tabs {
      display: none;
    }

    .desktop-nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--m3-text-secondary);
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .desktop-nav-btn:hover {
      background-color: var(--m3-surface-subtle);
      color: var(--m3-text-primary);
    }

    .desktop-nav-btn.active {
      background-color: var(--m3-primary-container);
      color: var(--m3-on-primary-container);
      border-color: var(--m3-border);
    }

    /* ==========================================================================
       Responsive Breakpoints: Desktop Widescreen (>=1024px) & Mobile (<=767px)
       ========================================================================== */
    @media (min-width: 1024px) {
      body {
        padding-bottom: 32px;
      }

      .top-app-bar {
        max-width: 1300px;
        margin: 0 auto;
        left: 0;
        right: 0;
        padding-left: 24px;
        padding-right: 24px;
        height: 64px;
      }

      .desktop-nav-tabs {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .m3-bottom-nav {
        display: none !important;
      }

      .tab-pane {
        max-width: 1300px;
        margin: 0 auto;
        padding: 24px;
      }

      .today-blocks-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        align-items: start;
      }

      .today-blocks-grid .break-card,
      .today-blocks-grid .sunday-rest-card {
        grid-column: 1 / -1;
      }

      .timeline-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        align-items: start;
      }

      .timer-overlay {
        align-items: center;
        justify-content: center;
      }

      .timer-sheet {
        border-radius: var(--radius-lg);
        max-width: 520px;
        padding: 28px 24px;
        animation: modalFadeIn 0.2s ease-out;
      }

      @keyframes modalFadeIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
    }

    @media (max-width: 767px) {
      .desktop-nav-tabs {
        display: none;
      }

      .m3-bottom-nav {
        display: flex;
      }

      .tab-pane {
        padding: 16px;
        max-width: 680px;
      }

      .today-blocks-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .timeline-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    }
  </style>
</head>
<body>

  <!-- Top App Bar (Material 3 Responsive) -->
  <header class="top-app-bar">
    <div class="top-bar-left">
      <span class="top-bar-title">YKS 2027 Koçu</span>
      <span class="top-bar-subtitle" id="top-bar-week-date">Hafta 1 • Pazartesi</span>
    </div>

    <!-- Desktop Horizontal Navigation Tabs -->
    <nav class="desktop-nav-tabs" aria-label="Masaüstü Menü">
      <button class="desktop-nav-btn active" data-tab="tab-today" onclick="switchTab('tab-today')">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>Bugün</span>
      </button>
      <button class="desktop-nav-btn" data-tab="tab-radar" onclick="switchTab('tab-radar')">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="9"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>Radar</span>
      </button>
      <button class="desktop-nav-btn" data-tab="tab-curriculum" onclick="switchTab('tab-curriculum')">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <span>Müfredat</span>
      </button>
    </nav>

    <div class="top-bar-right">
      <button id="pwa-install-btn" class="pwa-install-btn" style="display: none;" onclick="triggerInstallPrompt()" aria-label="Uygulamayı Yükle">
        <svg class="pwa-install-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Yükle</span>
      </button>
      <div class="top-bar-progress-pill tabular-nums" id="top-bar-pill">
        <span class="progress-dot"></span>
        <span id="top-bar-pct">0.0%</span>
      </div>
    </div>
  </header>

  <!-- Main Views Container -->
  <main>

    <!-- ========================================================================
         TAB 1: BUGÜN
         ======================================================================== -->
    <section id="tab-today" class="tab-pane active">
      <div class="day-selector-bar">
        <button class="day-selector-btn" onclick="navigateDay(-1)" aria-label="Önceki Gün">←</button>
        <select class="day-select-dropdown" id="day-selector" onchange="onDaySelectChange(this.value)">
          ${daySelectorOptionsHtml}
        </select>
        <button class="day-selector-btn" onclick="navigateDay(1)" aria-label="Sonraki Gün">→</button>
      </div>

      <div class="today-summary-banner">
        <div class="summary-text-group">
          <h3 id="day-summary-title">Bugünkü Hedef</h3>
          <p id="day-summary-subtitle">4 blok video • 3 mola</p>
        </div>
        <div class="summary-badge tabular-nums" id="day-completed-badge">
          0 / 4 Blok
        </div>
      </div>

      <!-- Container where current day's blocks or Sunday Rest is injected -->
      <div id="today-content-area"></div>
    </section>

    <!-- ========================================================================
         TAB 2: RADAR & STRESS-FREE SHIFT
         ======================================================================== -->
    <section id="tab-radar" class="tab-pane">
      <div class="radar-target-card">
        <div class="target-badge-header">
          <span class="target-title">YKS 2027 Hedef Radarı</span>
          <span class="target-countdown-badge tabular-nums" id="yks-target-countdown">19 Haziran 2027</span>
        </div>
        <div class="radar-stats-grid">
          <div class="radar-stat-box">
            <div class="radar-stat-val tabular-nums" id="radar-watched-count">0</div>
            <div class="radar-stat-lbl">İzlenen Video</div>
          </div>
          <div class="radar-stat-box">
            <div class="radar-stat-val tabular-nums" id="radar-remaining-count">766</div>
            <div class="radar-stat-lbl">Kalan Video</div>
          </div>
          <div class="radar-stat-box">
            <div class="radar-stat-val tabular-nums" id="radar-total-hours">0h</div>
            <div class="radar-stat-lbl">Çalışma Süresi</div>
          </div>
        </div>
      </div>

      <!-- Stress-Free Shift Engine Component -->
      <div class="shift-engine-card">
        <div class="shift-header">
          <span style="font-size: 1.2rem;">⚡</span>
          <span class="shift-title">Stress-Free Otomatik Kaydırma</span>
        </div>
        <p class="shift-desc">
          Planın aksaması seni asla yıldırmasın! Kaçırdığın veya izleyemediğin günlerin videolarını bugünden itibaren kronolojik sırayla ileri kaydır. Sıfır suçluluk, sıfır stres!
        </p>
        <div class="shift-actions">
          <button class="btn btn-shift" onclick="triggerShiftEngine()">
            <span>Programı Bugüne Göre Güncelle (Shift)</span>
          </button>
          <button class="btn btn-outline" style="min-height: 48px; font-size: 0.85rem;" onclick="resetToOriginalSchedule()">
            Orijinal Takvime Sıfırla
          </button>
        </div>
      </div>

      <!-- 42-Week Timeline List -->
      <h3 style="font-size: 1rem; font-weight: 700; margin: 16px 0 10px 0;">42 Haftalık Çalışma Akışı</h3>
      <div class="timeline-container" id="timeline-container">
        ${staticTimelineHtml}
      </div>
    </section>

    <!-- ========================================================================
         TAB 3: MÜFREDAT & ARAMA & YEDEK
         ======================================================================== -->
    <section id="tab-curriculum" class="tab-pane">
      <!-- Search Input -->
      <div class="search-box-wrapper">
        <input type="search" id="curriculum-search-input" class="search-input" placeholder="Konu, ders veya hoca ara (örn: Cümlede Anlam, Limit)..." oninput="handleCurriculumSearch(this.value)">
      </div>

      <!-- Search Results Area -->
      <div id="search-results-area" class="search-results-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span id="search-results-count" style="font-size: 0.85rem; font-weight: 700; color: var(--m3-text-secondary);"></span>
          <button class="btn" style="min-height: 48px; padding: 4px 14px; font-size: 0.85rem;" onclick="clearCurriculumSearch()">Temizle</button>
        </div>
        <div id="search-results-list"></div>
      </div>

      <!-- 9 Subject Progress Cards -->
      <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 12px;">Ders Bazlı İlerleme Durumu</h3>
      <div class="course-cards-list" id="curriculum-cards-container">
        ${subjectsCardsHtml}
      </div>

      <!-- JSON Backup & Restore -->
      <div class="backup-card">
        <h4 class="backup-title">İlerleme Yedekleme & Geri Yükleme</h4>
        <p class="backup-desc">Tüm izleme geçmişini JSON dosyası olarak cihazına indirebilir veya başka bir cihaza aktarabilirsin.</p>
        <div class="backup-buttons">
          <button class="btn btn-outline" style="flex: 1;" onclick="exportProgress()">
            <span>Yedek İndir (JSON)</span>
          </button>
          <button class="btn btn-outline" style="flex: 1;" onclick="document.getElementById('import-file-input').click()">
            <span>Yedek Yükle (JSON)</span>
          </button>
          <input type="file" id="import-file-input" accept=".json" style="display: none;" onchange="importProgress(event)">
        </div>
      </div>
    </section>

  </main>

  <!-- ==========================================================================
       Bottom Navigation Bar (Material 3)
       ========================================================================== -->
  <nav class="m3-bottom-nav">
    <button class="nav-item active" data-tab="tab-today" onclick="switchTab('tab-today')" aria-label="Bugün">
      <div class="nav-pill">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
      <span class="nav-label">Bugün</span>
    </button>

    <button class="nav-item" data-tab="tab-radar" onclick="switchTab('tab-radar')" aria-label="Radar">
      <div class="nav-pill">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="9"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <span class="nav-label">Radar</span>
    </button>

    <button class="nav-item" data-tab="tab-curriculum" onclick="switchTab('tab-curriculum')" aria-label="Müfredat">
      <div class="nav-pill">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      </div>
      <span class="nav-label">Müfredat</span>
    </button>
  </nav>

  <!-- ==========================================================================
       20-Min Break Timer Bottom Sheet / Modal
       ========================================================================== -->
  <div class="timer-overlay" id="timer-modal-overlay">
    <div class="timer-sheet">
      <div class="timer-sheet-handle"></div>
      <h3 class="timer-heading">20 Dakika Zihinsel Mola</h3>
      <p class="timer-subheading">Öğrenilenlerin kalıcı belleğe aktarılması için mola şart!</p>

      <div class="timer-clock tabular-nums" id="timer-display">20:00</div>

      <div class="timer-progress-bar">
        <div class="timer-progress-fill" id="timer-progress-fill"></div>
      </div>

      <div class="timer-actions">
        <button class="btn btn-primary" id="timer-toggle-btn" style="min-width: 110px;" onclick="toggleTimer()">Duraklat</button>
        <button class="btn" onclick="addTimerMinutes(5)">+5 dk</button>
        <button class="btn" onclick="resetTimer()">Sıfırla</button>
        <button class="btn btn-outline" onclick="closeTimerModal()">Kapat</button>
      </div>
    </div>
  </div>

  <!-- Client Application Logic -->
  <script>
    // Embedded Data
    const RAW_PLAYLISTS = ${rawPlaylistsJson};
    const BASELINE_WEEKS = ${baselineWeeksJson};
    const SUBJECTS_INFO = ${subjectsJson};

    // State Variables
    let currentSchedule = [];
    let completedVideos = {};
    let activeWeekNum = 1;
    let activeDayIndex = 0; // 0: Pazartesi ... 6: Pazar

    // Timer Variables
    let timerDuration = 1200; // 20 minutes in seconds
    let timerRemaining = 1200;
    let timerRunning = false;
    let timerInterval = null;
    let timerTargetEndTime = 0;
    let audioCtx = null;

    // Helper: Subject CSS Badge Classes
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

    // Native YouTube Intent with Web Fallback (prevents fallback race on blur) & Desktop Web _blank
    function openYouTube(id, event) {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      const webFallback = 'https://www.youtube.com/watch?v=' + id;
      const isCapacitorAndroid = typeof window !== 'undefined' && Boolean(
        ((window.Capacitor?.isNativePlatform && window.Capacitor.isNativePlatform()) ||
        (window.Capacitor?.getPlatform && window.Capacitor.getPlatform() === 'android'))
      );

      if (isCapacitorAndroid) {
        const intentUri = 'vnd.youtube:' + id;
        let appCaptured = false;
        const onBlur = () => { appCaptured = true; };
        window.addEventListener('blur', onBlur, { once: true });
        try {
          window.location.href = intentUri;
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.removeEventListener) {
              window.removeEventListener('blur', onBlur);
            }
            if (!appCaptured && typeof window !== 'undefined') {
              window.open(webFallback, '_blank', 'noopener,noreferrer');
            }
          }, 800);
        } catch (err) {
          if (typeof window !== 'undefined' && window.removeEventListener) {
            window.removeEventListener('blur', onBlur);
          }
          if (typeof window !== 'undefined') {
            window.open(webFallback, '_blank', 'noopener,noreferrer');
          }
        }
      } else {
        // Direct opening on Web Desktop/Browser with _blank
        window.open(webFallback, '_blank', 'noopener,noreferrer');
      }
    }

    // Capacitor Haptics
    function triggerHaptic(duration = 500) {
      try {
        if (window.Capacitor?.Plugins?.Haptics?.vibrate) {
          window.Capacitor.Plugins.Haptics.vibrate({ duration });
        } else if (navigator.vibrate) {
          navigator.vibrate([duration, 150, duration]);
        }
      } catch (err) {
        console.warn('Haptics unavailable:', err);
      }
    }

    // Web Audio API Dual-Tone Chime: D5 (587.33 Hz) -> A5 (880 Hz)
    function initAudioContext() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtx && AudioCtx) audioCtx = new AudioCtx();
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      } catch (e) {
        console.warn('AudioContext init error:', e);
      }
    }

    function playChime() {
      try {
        initAudioContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        // First tone: D5 (587.33 Hz)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now);
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.8);

        // Second tone: A5 (880 Hz)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.25);
        gain2.gain.setValueAtTime(0.3, now + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.25);
        osc2.stop(now + 1.2);
      } catch (err) {
        console.warn('Audio chime unavailable:', err);
      }
    }

    // Break Timer Logic
    function openTimerModal(duration = 1200) {
      initAudioContext();
      if (!timerRunning && timerRemaining <= 0) {
        timerDuration = duration;
        timerRemaining = duration;
      }
      document.getElementById('timer-modal-overlay').classList.add('open');
      resumeTimer();
    }

    function closeTimerModal() {
      document.getElementById('timer-modal-overlay').classList.remove('open');
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
      initAudioContext();
      timerRunning = true;
      document.getElementById('timer-toggle-btn').textContent = 'Duraklat';
      timerTargetEndTime = Date.now() + timerRemaining * 1000;
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        const now = Date.now();
        timerRemaining = Math.max(0, Math.round((timerTargetEndTime - now) / 1000));
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
      timerTargetEndTime = Date.now() + timerRemaining * 1000;
      updateTimerDisplay();
    }

    function addTimerMinutes(mins = 5) {
      timerRemaining += mins * 60;
      timerDuration = Math.max(timerDuration, timerRemaining);
      if (timerRunning) {
        timerTargetEndTime += mins * 60 * 1000;
      }
      updateTimerDisplay();
    }

    function updateTimerDisplay() {
      const m = Math.floor(timerRemaining / 60);
      const s = timerRemaining % 60;
      const str = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      document.getElementById('timer-display').textContent = str;

      const pct = Math.max(0, Math.min(100, (timerRemaining / timerDuration) * 100));
      document.getElementById('timer-progress-fill').style.width = pct + '%';
    }

    function onTimerComplete() {
      pauseTimer();
      playChime();
      triggerHaptic(800);
      setTimeout(() => {
        alert('☕ 20 dakikalık mola tamamlandı! Zihnin dinlendi, bir sonraki video bloğuna geçmeye hazırsın.');
      }, 1000);
    }

    // Storage Management
    function loadState() {
      try {
        const savedComp = localStorage.getItem('yks_completed_videos');
        if (savedComp) {
          completedVideos = JSON.parse(savedComp);
        }
        const savedSchedule = localStorage.getItem('yks_shifted_schedule');
        if (savedSchedule) {
          currentSchedule = JSON.parse(savedSchedule);
        } else {
          currentSchedule = JSON.parse(JSON.stringify(BASELINE_WEEKS));
        }

        const savedWeek = localStorage.getItem('yks_active_week');
        if (savedWeek) activeWeekNum = parseInt(savedWeek, 10) || 1;

        const savedDay = localStorage.getItem('yks_active_day');
        if (savedDay !== null) activeDayIndex = parseInt(savedDay, 10) || 0;
      } catch (err) {
        console.warn('Storage read error:', err);
        currentSchedule = JSON.parse(JSON.stringify(BASELINE_WEEKS));
      }
    }

    function saveCompletedVideos() {
      try {
        localStorage.setItem('yks_completed_videos', JSON.stringify(completedVideos));
      } catch (err) {
        console.warn('Storage write error:', err);
      }
    }

    function toggleVideo(videoId, isChecked) {
      if (isChecked) {
        completedVideos[videoId] = true;
        triggerHaptic(70);
      } else {
        delete completedVideos[videoId];
      }
      saveCompletedVideos();
      updateAllUI();
    }

    // UI Tab Navigation
    function switchTab(tabId) {
      document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.desktop-nav-btn').forEach(el => el.classList.remove('active'));

      const targetPane = document.getElementById(tabId);
      if (targetPane) targetPane.classList.add('active');

      document.querySelectorAll(\`[data-tab="\${tabId}"]\`).forEach(el => el.classList.add('active'));

      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Render Tab 1: Bugün
    function populateDayDropdown() {
      const select = document.getElementById('day-selector');
      if (!select) return;
      select.innerHTML = '';

      const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

      currentSchedule.forEach(w => {
        const optGroup = document.createElement('optgroup');
        optGroup.label = \`Hafta \${w.weekNum}\`;

        dayNames.forEach((dName, dIdx) => {
          const opt = document.createElement('option');
          opt.value = \`\${w.weekNum}-\${dIdx}\`;
          opt.textContent = \`Hafta \${w.weekNum} • \${dName}\`;
          if (w.weekNum === activeWeekNum && dIdx === activeDayIndex) {
            opt.selected = true;
          }
          optGroup.appendChild(opt);
        });
        select.appendChild(optGroup);
      });
    }

    function onDaySelectChange(val) {
      if (!val) return;
      const [wStr, dStr] = val.split('-');
      activeWeekNum = parseInt(wStr, 10);
      activeDayIndex = parseInt(dStr, 10);
      localStorage.setItem('yks_active_week', activeWeekNum);
      localStorage.setItem('yks_active_day', activeDayIndex);
      renderTodayTab();
      updateTopBar();
    }

    function navigateDay(direction) {
      let nextDay = activeDayIndex + direction;
      let nextWeek = activeWeekNum;

      if (nextDay > 6) {
        nextDay = 0;
        nextWeek = Math.min(currentSchedule.length, activeWeekNum + 1);
      } else if (nextDay < 0) {
        nextDay = 6;
        nextWeek = Math.max(1, activeWeekNum - 1);
      }

      activeWeekNum = nextWeek;
      activeDayIndex = nextDay;
      localStorage.setItem('yks_active_week', activeWeekNum);
      localStorage.setItem('yks_active_day', activeDayIndex);

      const select = document.getElementById('day-selector');
      if (select) select.value = \`\${activeWeekNum}-\${activeDayIndex}\`;

      renderTodayTab();
      updateTopBar();
    }

    function previewWeekday() {
      activeDayIndex = 0; // Jump to Monday
      localStorage.setItem('yks_active_day', activeDayIndex);
      const select = document.getElementById('day-selector');
      if (select) select.value = \`\${activeWeekNum}-\${activeDayIndex}\`;
      renderTodayTab();
      updateTopBar();
    }

    function renderTodayTab() {
      const container = document.getElementById('today-content-area');
      if (!container) return;

      const week = currentSchedule.find(w => w.weekNum === activeWeekNum);
      if (!week) {
        container.innerHTML = '<p>Bu hafta için plan bulunamadı.</p>';
        return;
      }

      const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      const currentDayName = dayNames[activeDayIndex];
      const dayData = week.days.find(d => d.dayName === currentDayName) || week.days[activeDayIndex];

      // Update Summary Header
      document.getElementById('day-summary-title').textContent = \`Hafta \${activeWeekNum} • \${currentDayName}\`;

      // Check if it's Sunday
      if (dayData && dayData.isRestDay) {
        document.getElementById('day-summary-subtitle').textContent = 'Zihinsel Dinlenme & Konsolidasyon Günü';
        document.getElementById('day-completed-badge').textContent = 'Dinlenme Günü';

        container.innerHTML = \`
          <div class="sunday-rest-card">
            <div class="sunday-icon">⛔</div>
            <div class="sunday-title">⛔ PAZAR: ÇALIŞMAK KESİNLİKLE YASAK! (Beyin dinlenmeden öğrenme kalıcı olmaz)</div>
            <p class="sunday-desc">
              Haftanın 6 günü boyunca disiplinle zihnini zorladın. Bilimsel araştırmalar, beynin öğrendiklerini uzun vadeli hafızaya aktarabilmesi için haftada en az bir gün ders çalışmadan dinlenmesi gerektiğini kanıtlamıştır.
            </p>
            <div class="sunday-tips-grid">
              <div class="sunday-tip-chip">🚶 Açık Havada Yürüyüş</div>
              <div class="sunday-tip-chip">😴 Kaliteli & Uzun Uyku</div>
              <div class="sunday-tip-chip">👥 Sevdiklerinle Vakit Geçir</div>
              <div class="sunday-tip-chip">🎮 Rahatlatıcı Hobiler</div>
            </div>
            <button class="btn btn-outline" style="width: 100%;" onclick="previewWeekday()">Pazartesi Programını Önizle</button>
          </div>
        \`;
        return;
      }

      // Weekday with 4 blocks
      const blocks = dayData?.blocks || [];
      let completedBlocksCount = 0;

      let blocksHtml = '<div class="today-blocks-grid">';
      blocks.forEach((b, idx) => {
        const v = b.video;
        const videoId = v.id || ('tekrar-' + (b.subject || 'genel').replace(/[^a-zA-Z0-9]/g, '_') + '-w' + activeWeekNum + '-d' + activeDayIndex + '-b' + (idx + 1));
        const isDone = Boolean(completedVideos[videoId]);
        if (isDone) completedBlocksCount++;

        const badgeClass = getSubjectBadgeClass(b.subject);
        const durationText = v.duration_min ? \`\${Math.round(v.duration_min)} dk\` : '40 dk';

        blocksHtml += \`
          <div class="video-block-card \${isDone ? 'completed' : ''}" id="block-card-\${idx}">
            <div class="video-block-header">
              <div class="video-block-meta-left">
                <span class="block-num-pill">Blok \${b.blockNum || idx + 1}</span>
                <span class="subject-badge \${badgeClass}">\${b.subject}</span>
                <span class="video-instructor-label">\${b.instructor}</span>
              </div>
              <span class="video-duration-pill tabular-nums">\${durationText}</span>
            </div>

            <div class="video-title">\${v.title}</div>

            <div class="video-block-actions">
              <label class="checkbox-label" for="chk-\${activeWeekNum}-\${activeDayIndex}-\${idx}">
                <input type="checkbox" class="block-checkbox" id="chk-\${activeWeekNum}-\${activeDayIndex}-\${idx}"
                  \${isDone ? 'checked' : ''}
                  onchange="toggleVideo('\${videoId}', this.checked)">
                <span>\${isDone ? 'Tamamlandı' : 'İzlendi olarak işaretle'}</span>
              </label>

              \${v.id ? \`
                <a class="yt-intent-btn" href="https://www.youtube.com/watch?v=\${v.id}" target="_blank" rel="noopener noreferrer" onclick="openYouTube('\${v.id}', event)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>YouTube'da İzle</span>
                </a>
              \` : ''}
            </div>
          </div>
        \`;

        // Insert 20-min break card after each block (except after block 4)
        if (idx < blocks.length - 1) {
          blocksHtml += \`
            <div class="break-card">
              <div class="break-content">
                <span class="break-icon">☕</span>
                <div>
                  <div class="break-title">20 dk Mola</div>
                  <div class="break-desc">Beyin dinlenmeden öğrenme kalıcı olmaz.</div>
                </div>
              </div>
              <button class="break-start-btn" onclick="openTimerModal(1200)">Mola Başlat</button>
            </div>
          \`;
        }
      });
      blocksHtml += '</div>';

      document.getElementById('day-summary-subtitle').textContent = '4 blok video • 3 mola';
      document.getElementById('day-completed-badge').textContent = \`\${completedBlocksCount} / \${blocks.length} Blok\`;

      container.innerHTML = blocksHtml;
    }

    // Render Tab 2: Radar & Timeline
    function renderRadarTab() {
      // Countdown to 19 June 2027
      const targetDate = new Date('2027-06-19T10:00:00');
      const now = new Date();
      const diffMs = targetDate - now;
      const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      document.getElementById('yks-target-countdown').textContent = \`19 Haziran 2027 • \${diffDays} gün kaldı\`;

      // Radar KPIs
      const watchedCount = Object.keys(completedVideos).length;
      const remainingCount = Math.max(0, 766 - watchedCount);

      let totalWatchedSec = 0;
      for (const [subj, info] of Object.entries(RAW_PLAYLISTS)) {
        for (const v of info.videos || []) {
          if (completedVideos[v.id]) {
            totalWatchedSec += v.duration_sec || Math.round((v.duration_min || 0) * 60);
          }
        }
      }
      const watchedHours = (totalWatchedSec / 3600).toFixed(1);

      document.getElementById('radar-watched-count').textContent = watchedCount;
      document.getElementById('radar-remaining-count').textContent = remainingCount;
      document.getElementById('radar-total-hours').textContent = \`\${watchedHours} sa\`;

      // Timeline 42 Weeks
      const container = document.getElementById('timeline-container');
      if (!container) return;

      let html = '';
      currentSchedule.forEach(w => {
        let weekTotalBlocks = 0;
        let weekCompletedBlocks = 0;

        w.days.forEach(d => {
          if (!d.isRestDay && d.blocks) {
            d.blocks.forEach(b => {
              weekTotalBlocks++;
              if (b.video?.id && completedVideos[b.video.id]) {
                weekCompletedBlocks++;
              }
            });
          }
        });

        const isAllDone = weekTotalBlocks > 0 && weekCompletedBlocks === weekTotalBlocks;

        html += \`
          <div class="week-card" id="week-card-\${w.weekNum}">
            <div class="week-header" onclick="toggleWeekAccordion(\${w.weekNum})">
              <div class="week-header-left">
                <span class="week-title">Hafta \${w.weekNum}</span>
              </div>
              <span class="week-progress-pill tabular-nums \${isAllDone ? 'all-done' : ''}">
                \${weekCompletedBlocks} / \${weekTotalBlocks} Blok
              </span>
            </div>
            <div class="week-details" id="week-details-\${w.weekNum}">
              \${w.days.map((d, dIdx) => {
                if (d.isRestDay) {
                  return \`<div class="week-day-row"><span>\${d.dayName}</span><span style="color: var(--m3-red-primary); font-weight: 600;">⛔ Dinlenme Günü</span></div>\`;
                }
                const bCount = d.blocks?.length || 4;
                const dCompleted = d.blocks?.filter(b => b.video?.id && completedVideos[b.video.id]).length || 0;
                return \`
                  <div class="week-day-row">
                    <span>\${d.dayName}</span>
                    <span class="tabular-nums" style="color: var(--m3-text-secondary);">\${dCompleted} / \${bCount} İzlendi</span>
                  </div>
                \`;
              }).join('')}
              <button class="btn btn-outline" style="width: 100%; margin-top: 10px; min-height: 48px; font-size: 0.85rem;"
                onclick="jumpToWeek(\${w.weekNum})">
                Bu Haftayı 'Bugün' Olarak Aç
              </button>
            </div>
          </div>
        \`;
      });

      container.innerHTML = html;
    }

    function toggleWeekAccordion(weekNum) {
      const details = document.getElementById(\`week-details-\${weekNum}\`);
      if (details) {
        details.classList.toggle('open');
      }
    }

    function jumpToWeek(wNum) {
      activeWeekNum = wNum;
      activeDayIndex = 0; // Monday
      localStorage.setItem('yks_active_week', activeWeekNum);
      localStorage.setItem('yks_active_day', activeDayIndex);

      const select = document.getElementById('day-selector');
      if (select) select.value = \`\${activeWeekNum}-\${activeDayIndex}\`;

      renderTodayTab();
      updateTopBar();
      switchTab('tab-today');
    }

    // Stress-Free Shift Engine
    function triggerShiftEngine() {
      // Collect uncompleted videos by subject in strict sequential order
      const remainingQueues = {};
      for (const [subj, info] of Object.entries(RAW_PLAYLISTS)) {
        remainingQueues[subj] = (info.videos || []).filter(v => !completedVideos[v.id]);
      }

      const totalRemaining = Object.values(remainingQueues).reduce((sum, q) => sum + q.length, 0);
      if (totalRemaining === 0) {
        alert('Tebrikler! Tüm müfredat videoları zaten tamamlandı. Kaydırılacak video kalmadı!');
        return;
      }

      // Re-distribute uncompleted videos across weeks using the calendar distribution algorithm
      const shiftedWeeks = shiftSchedule(remainingQueues);
      currentSchedule = shiftedWeeks;
      activeWeekNum = 1;
      activeDayIndex = 0;
      localStorage.setItem('yks_active_week', 1);
      localStorage.setItem('yks_active_day', 0);

      try {
        localStorage.setItem('yks_shifted_schedule', JSON.stringify(shiftedWeeks));
      } catch (err) {
        console.warn('Shift save error:', err);
      }

      // Re-render
      populateDayDropdown();
      const select = document.getElementById('day-selector');
      if (select) select.value = '1-0';
      renderTodayTab();
      renderRadarTab();
      updateTopBar();

      alert('✨ Program başarıyla güncellendi! Sıfır suçluluk, sıfır stres: Kalan tüm videolar bugünden itibaren kronolojik sırayla yeniden düzenlendi. Hedef 19 Haziran 2027!');
    }

    function shiftSchedule(queues) {
      // Deep clone queues
      const qCopy = {};
      for (const [subj, arr] of Object.entries(queues)) {
        qCopy[subj] = [...arr];
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
            s1: 'TYT Fizik',
            c1: 2,
            s2: () => (qCopy['AYT Edebiyat']?.length > 0 ? 'AYT Edebiyat' : 'AYT Coğrafya'),
            c2: 2
          },
          {
            name: 'Cumartesi',
            s1: 'TYT-AYT Tarih',
            c1: 2,
            s2: () => (qCopy['TYT Biyoloji']?.length > 0 ? 'TYT Biyoloji' : 'Tekrar & Soru Çözümü'),
            c2: 2
          },
          { name: 'Pazar', isRestDay: true }
        ];

        let hasAnyVideo = false;

        for (const rawCfg of dayConfigs) {
          if (rawCfg.isRestDay) {
            days.push({ dayName: rawCfg.name, isRestDay: true });
            continue;
          }

          const s1 = typeof rawCfg.s1 === 'function' ? rawCfg.s1() : rawCfg.s1;
          const s2 = typeof rawCfg.s2 === 'function' ? rawCfg.s2() : rawCfg.s2;
          const c1 = rawCfg.c1;
          const c2 = rawCfg.c2;

          const blocks = [];

          // Subject 1
          for (let i = 0; i < c1; i++) {
            const v = qCopy[s1]?.shift();
            if (v) {
              hasAnyVideo = true;
              blocks.push({
                blockNum: blocks.length + 1,
                subject: s1,
                video: v,
                instructor: v.instructor || RAW_PLAYLISTS[s1]?.metadata?.instructor || ''
              });
            } else {
              blocks.push({
                blockNum: blocks.length + 1,
                subject: s1,
                video: { title: 'Konu Tekrarı & Soru Çözümü', duration_min: 40, url: '' },
                instructor: ''
              });
            }
          }

          // Subject 2
          for (let i = 0; i < c2; i++) {
            const v = qCopy[s2]?.shift();
            if (v) {
              hasAnyVideo = true;
              blocks.push({
                blockNum: blocks.length + 1,
                subject: s2,
                video: v,
                instructor: v.instructor || RAW_PLAYLISTS[s2]?.metadata?.instructor || ''
              });
            } else {
              blocks.push({
                blockNum: blocks.length + 1,
                subject: s2,
                video: { title: 'Konu Tekrarı & Soru Çözümü', duration_min: 40, url: '' },
                instructor: ''
              });
            }
          }

          days.push({ dayName: rawCfg.name, isRestDay: false, blocks });
        }

        weeks.push({ weekNum, days });

        const remaining = Object.values(qCopy).reduce((sum, q) => sum + q.length, 0);
        if (remaining === 0) break;
        if (!hasAnyVideo && weekNum > 40) break;

        weekNum++;
      }

      return weeks;
    }

    function resetToOriginalSchedule() {
      if (confirm('Takvimi orijinal başlangıç dağılımına sıfırlamak istediğine emin misin?')) {
        currentSchedule = JSON.parse(JSON.stringify(BASELINE_WEEKS));
        localStorage.removeItem('yks_shifted_schedule');
        populateDayDropdown();
        renderTodayTab();
        renderRadarTab();
        updateTopBar();
        alert('Takvim orijinal haline getirildi.');
      }
    }

    // Render Tab 3: Müfredat & Turkish Search
    function renderCurriculumTab() {
      const container = document.getElementById('curriculum-cards-container');
      if (!container) return;

      let html = '';
      for (const [subjectName, info] of Object.entries(SUBJECTS_INFO)) {
        const playlist = RAW_PLAYLISTS[subjectName];
        const totalV = playlist?.videos?.length || 0;

        let watchedV = 0;
        let watchedSec = 0;

        (playlist?.videos || []).forEach(v => {
          if (completedVideos[v.id]) {
            watchedV++;
            watchedSec += v.duration_sec || Math.round((v.duration_min || 0) * 60);
          }
        });

        const pct = totalV > 0 ? ((watchedV / totalV) * 100).toFixed(1) : '0.0';
        const watchedHours = (watchedSec / 3600).toFixed(1);
        const remainingV = Math.max(0, totalV - watchedV);

        html += \`
          <div class="course-card">
            <div class="course-card-top">
              <span class="course-name">\${subjectName}</span>
              <span class="course-pct tabular-nums">%\${pct}</span>
            </div>
            <div class="course-meta">Eğitmen: \${info.instructor}</div>
            <div class="progress-track">
              <div class="progress-fill" style="width: \${pct}%;"></div>
            </div>
            <div class="course-stats-line tabular-nums">
              <span>\${watchedV} / \${totalV} Video</span>
              <span>\${watchedHours} / \${info.totalHours} Saat</span>
              <span>\${remainingV} Video Kaldı</span>
            </div>
          </div>
        \`;
      }

      container.innerHTML = html;
    }

    function handleCurriculumSearch(rawQuery) {
      const resultsBox = document.getElementById('search-results-area');
      const resultsList = document.getElementById('search-results-list');
      const resultsCount = document.getElementById('search-results-count');

      if (!rawQuery || rawQuery.trim().length === 0) {
        resultsBox.style.display = 'none';
        return;
      }

      // Turkish locale-aware lowercase search
      const q = rawQuery.trim().toLocaleLowerCase('tr-TR');
      const matches = [];

      for (const [subj, info] of Object.entries(RAW_PLAYLISTS)) {
        for (const v of info.videos || []) {
          const titleTr = (v.title || '').toLocaleLowerCase('tr-TR');
          const subjTr = subj.toLocaleLowerCase('tr-TR');
          const instTr = (v.instructor || info.metadata?.instructor || '').toLocaleLowerCase('tr-TR');

          if (titleTr.includes(q) || subjTr.includes(q) || instTr.includes(q)) {
            matches.push({ subject: subj, video: v, instructor: v.instructor || info.metadata?.instructor });
          }
        }
      }

      // Turkish collation sort
      matches.sort((a, b) => a.video.title.localeCompare(b.video.title, 'tr-TR'));

      resultsBox.style.display = 'block';
      resultsCount.textContent = \`\${matches.length} video bulundu\`;

      if (matches.length === 0) {
        resultsList.innerHTML = '<p style="font-size: 0.85rem; color: var(--m3-text-secondary); padding: 12px 0;">Eşleşen video bulunamadı.</p>';
        return;
      }

      let html = '';
      matches.slice(0, 30).forEach(m => {
        const v = m.video;
        const isDone = completedVideos[v.id];
        const badgeClass = getSubjectBadgeClass(m.subject);
        const durationText = v.duration_min ? \`\${Math.round(v.duration_min)} dk\` : '40 dk';

        html += \`
          <div class="video-block-card \${isDone ? 'completed' : ''}" style="margin-bottom: 8px;">
            <div class="video-block-header">
              <div class="video-block-meta-left">
                <span class="subject-badge \${badgeClass}">\${m.subject}</span>
                <span class="video-instructor-label">\${m.instructor}</span>
              </div>
              <span class="video-duration-pill tabular-nums">\${durationText}</span>
            </div>
            <div class="video-title" style="margin-bottom: 8px;">\${v.title}</div>
            <div class="video-block-actions">
              <label class="checkbox-label" for="search-chk-\${v.id}">
                <input type="checkbox" class="block-checkbox" id="search-chk-\${v.id}"
                  \${isDone ? 'checked' : ''}
                  onchange="toggleVideo('\${v.id}', this.checked)">
                <span>\${isDone ? 'Tamamlandı' : 'İzlendi'}</span>
              </label>
              <a class="yt-intent-btn" href="https://www.youtube.com/watch?v=\${v.id}" target="_blank" rel="noopener noreferrer" onclick="openYouTube('\${v.id}', event)">
                <span>YouTube'da İzle</span>
              </a>
            </div>
          </div>
        \`;
      });

      if (matches.length > 30) {
        html += \`<p style="font-size: 0.75rem; color: var(--m3-text-muted); text-align: center; margin-top: 8px;">Ve \${matches.length - 30} video daha... (Aramayı daraltabilirsiniz)</p>\`;
      }

      resultsList.innerHTML = html;
    }

    function clearCurriculumSearch() {
      const input = document.getElementById('curriculum-search-input');
      if (input) input.value = '';
      document.getElementById('search-results-area').style.display = 'none';
    }

    // JSON Backup & Restore
    function exportProgress() {
      const backupData = {
        appName: 'YKS 2027 Koçu',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        completedCount: Object.keys(completedVideos).length,
        completedVideos: completedVideos,
        activeWeek: activeWeekNum,
        activeDay: activeDayIndex
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'yks_2027_ilerleme_yedek.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function importProgress(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed && typeof parsed.completedVideos === 'object') {
            completedVideos = parsed.completedVideos;
            saveCompletedVideos();
            if (parsed.activeWeek) {
              activeWeekNum = parseInt(parsed.activeWeek, 10);
              localStorage.setItem('yks_active_week', activeWeekNum);
            }
            if (parsed.activeDay !== undefined) {
              activeDayIndex = parseInt(parsed.activeDay, 10);
              localStorage.setItem('yks_active_day', activeDayIndex);
            }
            populateDayDropdown();
            updateAllUI();
            alert(\`Yedek başarıyla yüklendi! \${Object.keys(completedVideos).length} video tamamlandı olarak işaretlendi.\`);
          } else {
            alert('Geçersiz yedek dosyası formatı.');
          }
        } catch (err) {
          alert('Dosya okunurken bir hata oluştu: ' + err.message);
        }
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset input
    }

    // Overall UI Sync
    function updateTopBar() {
      const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
      const dateText = \`Hafta \${activeWeekNum} • \${dayNames[activeDayIndex]}\`;
      const dateEl = document.getElementById('top-bar-week-date');
      if (dateEl) dateEl.textContent = dateText;

      const watched = Object.keys(completedVideos).length;
      const pct = ((watched / 766) * 100).toFixed(1);
      const pctEl = document.getElementById('top-bar-pct');
      if (pctEl) pctEl.textContent = \`%\${pct}\`;
    }

    function updateAllUI() {
      updateTopBar();
      renderTodayTab();
      renderRadarTab();
      renderCurriculumTab();
    }

    // PWA Install Prompt Handling
    let deferredInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      const btn = document.getElementById('pwa-install-btn');
      if (btn) btn.style.display = 'inline-flex';
    });

    function triggerInstallPrompt() {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(() => {
          deferredInstallPrompt = null;
          const btn = document.getElementById('pwa-install-btn');
          if (btn) btn.style.display = 'none';
        });
      }
    }

    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      const btn = document.getElementById('pwa-install-btn');
      if (btn) btn.style.display = 'none';
    });

    // Application Initialization
    function init() {
      loadState();
      populateDayDropdown();
      updateAllUI();
    }

    window.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>`;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Generated mobile web application: ${outputPath} (${(html.length / 1024).toFixed(1)} KB)`);
  return html;
}

// CLI Execution
if (process.argv[1] && process.argv[1].endsWith('generate_mobile_app.js')) {
  generateMobileAppHtml();
}
