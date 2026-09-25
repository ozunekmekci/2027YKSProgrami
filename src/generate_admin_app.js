import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCalendarDays, shiftSchedulePreservingPast } from './calendar_engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateAdminApp() {
  const dataPath = path.resolve(__dirname, '../playlists_data_tr.json');
  const playlistsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const calendar = generateCalendarDays(playlistsData);

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YKS 2027 Koçu — Yönetim Paneli</title>
  <meta name="description" content="YKS 2027 Koçu sistem ve veri yönetim paneli. Yedekleme, takvim kaydırma denetimi ve ilerleme sıfırlama araçları.">
  <meta name="theme-color" content="#0f172a">
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
      --mint-50:   #ecfdf5;

      --rose-500:  #f43f5e;
      --rose-600:  #e11d48;
      --rose-50:   #fff1f2;

      --blue-500:  #3b82f6;
      --blue-600:  #2563eb;
      --blue-50:   #eff6ff;

      --bg-page:    #f8fafc;
      --bg-surface: #ffffff;
      --bg-subtle:  #f1f5f9;
      --border:     #e2e8f0;
      --border-strong: #cbd5e1;
      --text-main:  #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;

      --radius-sm:  6px;
      --radius-md:  10px;
      --radius-lg:  14px;
      --radius-xl:  20px;
      --shadow-sm:  0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      --shadow-md:  0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-page);
      color: var(--text-main);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .tabular-nums {
      font-variant-numeric: tabular-nums;
    }

    /* Admin Header */
    .admin-header {
      background: var(--slate-900);
      color: var(--white);
      border-bottom: 1px solid var(--slate-800);
      padding: 16px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .admin-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 32px;
      height: 32px;
      background: var(--mint-500);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--slate-950);
    }

    .brand-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .admin-tag {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      background: var(--slate-800);
      color: var(--mint-400);
      border: 1px solid var(--slate-700);
      border-radius: 4px;
      margin-left: 8px;
    }

    .admin-header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .admin-live-clock {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--slate-300);
      background: var(--slate-800);
      padding: 6px 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--slate-700);
    }

    .clock-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--mint-500);
    }

    .btn-return-app {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--mint-500);
      color: var(--slate-950);
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      border-radius: var(--radius-md);
      transition: all 0.15s;
    }

    .btn-return-app:hover {
      background: var(--mint-400);
    }

    /* Admin Container */
    .admin-container {
      max-width: 1200px;
      margin: 32px auto;
      padding: 0 24px 64px 24px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .admin-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .admin-main-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .admin-main-desc {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    /* KPI Grid */
    .admin-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    .admin-kpi-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-shadow: var(--shadow-sm);
    }

    .kpi-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .kpi-value {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .kpi-sub {
      font-size: 13px;
      color: var(--text-secondary);
    }

    /* Sections */
    .admin-section-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 28px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
    }

    .section-header h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
    }

    .section-header p {
      font-size: 13px;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    /* Action Rows */
    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }

    .action-box {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      background: var(--bg-subtle);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 16px;
    }

    .action-box-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
    }

    .action-box-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .action-box-footer {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
    }

    .btn-action-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: var(--slate-900);
      color: var(--white);
      border: none;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-action-primary:hover {
      background: var(--slate-800);
    }

    .btn-action-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: var(--bg-surface);
      color: var(--text-main);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-action-secondary:hover {
      background: var(--slate-100);
    }

    .btn-action-danger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: var(--rose-600);
      color: var(--white);
      border: none;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-action-danger:hover {
      background: var(--rose-500);
    }

    .file-input-hidden {
      display: none;
    }

    /* Course Table */
    .admin-table-wrap {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
    }

    .admin-table th {
      background: var(--bg-subtle);
      color: var(--text-secondary);
      font-weight: 600;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }

    .admin-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      color: var(--text-main);
    }

    .admin-table tr:last-child td {
      border-bottom: none;
    }

    .admin-progress-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .admin-mini-bar {
      width: 100px;
      height: 6px;
      background: var(--slate-200);
      border-radius: 999px;
      overflow: hidden;
    }

    .admin-mini-fill {
      height: 100%;
      background: var(--mint-500);
      border-radius: 999px;
    }

    /* Danger Card */
    .admin-section-card.danger {
      border-color: rgba(244, 63, 94, 0.3);
      background: #fffafa;
    }

    .admin-section-card.danger .section-header {
      border-bottom-color: rgba(244, 63, 94, 0.2);
    }
  </style>
</head>
<body>
  <header class="admin-header">
    <div class="admin-brand">
      <div class="brand-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </div>
      <span class="brand-title">YKS 2027 Koçu</span>
      <span class="admin-tag">Sistem Yönetimi</span>
    </div>

    <div class="admin-header-actions">
      <div class="admin-live-clock tabular-nums" id="admin-live-clock">
        <span class="clock-dot"></span>
        <span id="admin-clock-text">--:--</span>
      </div>
      <a href="/" class="btn-return-app">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <span>Öğrenci Stüdyosuna Dön</span>
      </a>
    </div>
  </header>

  <main class="admin-container">
    <div class="admin-title-row">
      <div>
        <h1 class="admin-main-title">Yönetim ve Sistem Masası</h1>
        <p class="admin-main-desc">Müfredat durumunu inceleyin, JSON yedekleri yönetin veya takvim planını düzenleyin.</p>
      </div>
    </div>

    <!-- KPIs -->
    <div class="admin-kpi-grid">
      <div class="admin-kpi-card">
        <span class="kpi-title">Müfredat Kapsamı</span>
        <span class="kpi-value tabular-nums">766 Video</span>
        <span class="kpi-sub">9 Ders • ~441 Saat Video</span>
      </div>
      <div class="admin-kpi-card">
        <span class="kpi-title">Tamamlanan Video</span>
        <span class="kpi-value tabular-nums" id="kpi-done-count">0</span>
        <span class="kpi-sub" id="kpi-done-sub">0 / 766 (%0)</span>
      </div>
      <div class="admin-kpi-card">
        <span class="kpi-title">Kalan Video</span>
        <span class="kpi-value tabular-nums" id="kpi-remaining-count">766</span>
        <span class="kpi-sub" id="kpi-remaining-sub">Takvimde planlanmış</span>
      </div>
      <div class="admin-kpi-card">
        <span class="kpi-title">19 Haziran 2027 Hedefi</span>
        <span class="kpi-value tabular-nums" id="kpi-days-left">- Gün</span>
        <span class="kpi-sub" id="kpi-weeks-left">- Hafta Kalan Süre</span>
      </div>
    </div>

    <!-- Section: Data Backup -->
    <div class="admin-section-card">
      <div class="section-header">
        <div>
          <h3>Veri Yedekleme ve Taşıma</h3>
          <p>Tüm çalışma verilerini, işaretlenen videoları ve takvim durumunu cihazlar arasında aktarın.</p>
        </div>
      </div>
      <div class="action-grid">
        <div class="action-box">
          <div>
            <div class="action-box-title">JSON Yedek İndir (Dışa Aktar)</div>
            <div class="action-box-desc">Mevcut tüm tamamlanma geçmişinizi, aktif hafta durumunu ve kaydırılmış takvim planını içeren standart bir JSON dosyası üretir.</div>
          </div>
          <div class="action-box-footer">
            <button class="btn-action-primary" onclick="exportBackupJson()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Yedek İndir (.json)</span>
            </button>
          </div>
        </div>

        <div class="action-box">
          <div>
            <div class="action-box-title">JSON Yedek Yükle (İçe Aktar)</div>
            <div class="action-box-desc">Daha önce indirdiğiniz bir JSON yedeğini yükleyerek kaldığınız yerden devam edin. Dosya otomatik olarak doğrulanır.</div>
          </div>
          <div class="action-box-footer">
            <button class="btn-action-secondary" onclick="document.getElementById('import-file-input').click()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>Dosya Seç ve Yükle</span>
            </button>
            <input type="file" id="import-file-input" class="file-input-hidden" accept=".json" onchange="importBackupJson(event)">
          </div>
        </div>
      </div>
    </div>

    <!-- Section: Schedule & Shift Control -->
    <div class="admin-section-card">
      <div class="section-header">
        <div>
          <h3>Takvim ve Kaydırma Motoru Yönetimi</h3>
          <p>Müfredat akışını yeniden senkronize edin veya başlangıçtaki 42 haftalık plana geri dönün.</p>
        </div>
        <span class="admin-tag" id="schedule-status-badge">Standart Plan</span>
      </div>
      <div class="action-grid">
        <div class="action-box">
          <div>
            <div class="action-box-title">Stressiz Kaydırma Motorunu Çalıştır</div>
            <div class="action-box-desc">Geçmişte tamamladığınız günleri %100 korur; henüz izlenmemiş videoları ilk eksik günden itibaren kronolojik sırayla geleceğe aktarır.</div>
          </div>
          <div class="action-box-footer">
            <button class="btn-action-primary" onclick="triggerAdminShift()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span>Kaydırma Motorunu Başlat</span>
            </button>
          </div>
        </div>

        <div class="action-box">
          <div>
            <div class="action-box-title">Orijinal Plana Sıfırla</div>
            <div class="action-box-desc">Tüm kaydırmaları iptal eder ve takvimi ilk oluşturulan standart 42 haftalık başlangıç dağılımına döndürür.</div>
          </div>
          <div class="action-box-footer">
            <button class="btn-action-secondary" onclick="resetAdminSchedule()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              <span>Orijinal Plana Dön</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section: Course Breakdown -->
    <div class="admin-section-card">
      <div class="section-header">
        <div>
          <h3>9 Ders Müfredat Durumu ve İlerleme</h3>
          <p>Her dersin video sayısı, tamamlanma yüzdesi ve eğitmen bilgisi.</p>
        </div>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Ders Adı</th>
              <th>Eğitmen</th>
              <th>Toplam Video</th>
              <th>Tamamlanan</th>
              <th>Kalan</th>
              <th>İlerleme</th>
            </tr>
          </thead>
          <tbody id="admin-courses-tbody">
            <!-- Dynamically populated -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section: Danger Zone -->
    <div class="admin-section-card danger">
      <div class="section-header">
        <div>
          <h3 style="color: var(--rose-600);">Tehlikeli Alan (İlerleme Sıfırlama)</h3>
          <p>Geri alınamaz sistem işlemleri. İşleme başlamadan önce yedek almanız önerilir.</p>
        </div>
      </div>
      <div class="action-grid">
        <div class="action-box" style="background: var(--white); border-color: rgba(244, 63, 94, 0.3);">
          <div>
            <div class="action-box-title" style="color: var(--rose-600);">Tüm Çalışma İlerlemesini Temizle</div>
            <div class="action-box-desc">İşaretlenen tüm izlendi kayıtlarını siler, takvimi sıfırlar ve programı 1. Hafta Pazartesi gününe geri döndürür.</div>
          </div>
          <div class="action-box-footer">
            <button class="btn-action-danger" onclick="resetAllProgress()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>Tüm İlerlemeyi Sıfırla</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    const PLAYLISTS_DATA = ${JSON.stringify(playlistsData)};
    const BASELINE_CALENDAR = ${JSON.stringify(calendar)};

    let completedVideos = {};
    let activeWeekNum = 1;
    let activeDayIndex = 0;
    let currentSchedule = [];

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
        console.warn('Storage read error:', e);
        currentSchedule = JSON.parse(JSON.stringify(BASELINE_CALENDAR));
      }
    }

    function saveState() {
      try {
        localStorage.setItem('yks_completed_videos', JSON.stringify(completedVideos));
        localStorage.setItem('yks_active_week', String(activeWeekNum));
        localStorage.setItem('yks_active_day', String(activeDayIndex));
      } catch (e) {
        console.warn('Storage save error:', e);
      }
    }

    // Live Clock & Date Awareness
    function updateLiveDateTime() {
      const now = new Date();
      const day = now.getDate();
      const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      const monthName = months[now.getMonth()];
      const dayName = days[now.getDay()];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      const clockEl = document.getElementById('admin-clock-text');
      if (clockEl) {
        clockEl.textContent = \`\${day} \${monthName} \${now.getFullYear()}, \${dayName} • \${hours}:\${minutes}:\${seconds}\`;
      }
    }

    function updateTargetCountdown() {
      const target = new Date('2027-06-19T10:00:00');
      const now = new Date();
      const diffMs = target - now;

      if (diffMs > 0) {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(days / 7);
        const remDays = days % 7;

        const daysEl = document.getElementById('kpi-days-left');
        if (daysEl) daysEl.textContent = \`\${days} Gün\`;

        const weeksEl = document.getElementById('kpi-weeks-left');
        if (weeksEl) weeksEl.textContent = \`\${weeks} Hafta \${remDays} Gün Kalan Süre\`;
      }
    }

    function renderAdminDashboard() {
      const totalVideos = 766;
      const completedCount = Object.keys(completedVideos).length;
      const rawPct = (completedCount / totalVideos) * 100;
      const pctFormatted = completedCount === 0 ? '0' : (rawPct < 10 ? rawPct.toFixed(1) : Math.round(rawPct).toString());

      // KPIs
      const kpiDone = document.getElementById('kpi-done-count');
      if (kpiDone) kpiDone.textContent = String(completedCount);

      const kpiDoneSub = document.getElementById('kpi-done-sub');
      if (kpiDoneSub) kpiDoneSub.textContent = \`\${completedCount} / \${totalVideos} (%\${pctFormatted})\`;

      const kpiRemaining = document.getElementById('kpi-remaining-count');
      if (kpiRemaining) kpiRemaining.textContent = String(totalVideos - completedCount);

      // Status Badge
      const statusBadge = document.getElementById('schedule-status-badge');
      const hasShifted = Boolean(localStorage.getItem('yks_shifted_schedule'));
      if (statusBadge) {
        statusBadge.textContent = hasShifted ? 'Kaydırılmış Plan (Aktif)' : 'Standart Plan';
        statusBadge.style.color = hasShifted ? 'var(--mint-500)' : 'var(--slate-400)';
      }

      // Course Table
      const tbody = document.getElementById('admin-courses-tbody');
      if (tbody) {
        let html = '';
        for (const [subj, info] of Object.entries(PLAYLISTS_DATA)) {
          const videos = info.videos || [];
          const instructor = info.metadata?.instructor || '';
          let done = 0;
          videos.forEach(v => {
            if (completedVideos[v.id]) done++;
          });
          const cPct = videos.length > 0 ? (done === videos.length ? 100 : (done > 0 && (done / videos.length) * 100 < 10 ? ((done / videos.length) * 100).toFixed(1) : Math.round((done / videos.length) * 100))) : 0;
          const rem = videos.length - done;

          html += \`
            <tr>
              <td><strong>\${subj}</strong></td>
              <td>\${instructor}</td>
              <td class="tabular-nums">\${videos.length}</td>
              <td class="tabular-nums" style="color: var(--mint-600); font-weight: 600;">\${done}</td>
              <td class="tabular-nums" style="color: var(--text-secondary);">\${rem}</td>
              <td>
                <div class="admin-progress-cell">
                  <div class="admin-mini-bar">
                    <div class="admin-mini-fill" style="width: \${cPct}%;"></div>
                  </div>
                  <span class="tabular-nums" style="font-size: 12px; font-weight: 600;">%\${cPct}</span>
                </div>
              </td>
            </tr>
          \`;
        }
        tbody.innerHTML = html;
      }
    }

    // Backup & Restore
    function exportBackupJson() {
      const backupData = {
        app: 'yks-2027-kocu',
        version: '2.3.0',
        exportedAt: new Date().toISOString(),
        completedVideos: completedVideos,
        activeWeekNum: activeWeekNum,
        activeDayIndex: activeDayIndex,
        shiftedSchedule: localStorage.getItem('yks_shifted_schedule') ? JSON.parse(localStorage.getItem('yks_shifted_schedule')) : null
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = 'yks_2027_yedek_' + dateStr + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function importBackupJson(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed && typeof parsed === 'object') {
            if (parsed.completedVideos && typeof parsed.completedVideos === 'object') {
              completedVideos = parsed.completedVideos;
              localStorage.setItem('yks_completed_videos', JSON.stringify(completedVideos));
            }
            if (typeof parsed.activeWeekNum === 'number') {
              activeWeekNum = parsed.activeWeekNum;
              localStorage.setItem('yks_active_week', String(activeWeekNum));
            }
            if (typeof parsed.activeDayIndex === 'number') {
              activeDayIndex = parsed.activeDayIndex;
              localStorage.setItem('yks_active_day', String(activeDayIndex));
            }
            if (parsed.shiftedSchedule && Array.isArray(parsed.shiftedSchedule)) {
              currentSchedule = parsed.shiftedSchedule;
              localStorage.setItem('yks_shifted_schedule', JSON.stringify(currentSchedule));
            } else {
              currentSchedule = JSON.parse(JSON.stringify(BASELINE_CALENDAR));
              localStorage.removeItem('yks_shifted_schedule');
            }
            renderAdminDashboard();
            alert('Yedek başarıyla geri yüklendi.');
          } else {
            alert('Geçersiz yedek dosyası formatı.');
          }
        } catch (err) {
          alert('Dosya okuma hatası: Geçerli bir JSON yedek dosyası seçiniz.');
        }
      };
      reader.readAsText(file);
    }

    // Schedule Operations
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
      let shiftStarted = false;
      let firstIncompleteWeek = 1;
      let firstIncompleteDay = 0;

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

          if (!shiftStarted && baseBlocks.length > 0) {
            const hasUncompleted = baseBlocks.some(b => {
              const vid = b.video && b.video.id;
              return vid && !vid.startsWith('tekrar-') && !completedSet.has(vid);
            });

            if (!hasUncompleted) {
              newDays.push(JSON.parse(JSON.stringify(baseDay)));
              continue;
            } else {
              shiftStarted = true;
              firstIncompleteWeek = weekNum;
              firstIncompleteDay = dIdx;
            }
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
                  id: 'tekrar-' + s1.replace(/[^a-zA-Z0-9]/g, '_') + '-w' + weekNum + '-d' + dIdx + '-b' + (bIdx + 1),
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
                  id: 'tekrar-' + s2.replace(/[^a-zA-Z0-9]/g, '_') + '-w' + weekNum + '-d' + dIdx + '-b' + (bIdx + 1),
                  title: 'Konu Tekrarı & Soru Çözümü',
                  duration_min: 40,
                  duration_sec: 2400,
                  url: ''
                },
                instructor: ''
              });
            }
          }

          newDays.push({ dayName: rawCfg.name, isRestDay: false, blocks });
        }

        newWeeks.push({ weekNum, days: newDays });
      }

      let remainingCount = Object.values(uncompletedQueues).reduce((sum, q) => sum + q.length, 0);
      let extraWeekNum = newWeeks.length + 1;
      while (remainingCount > 0 && extraWeekNum <= 45) {
        const extraDays = [];
        for (let dIdx = 0; dIdx < 7; dIdx++) {
          const rawCfg = dayConfigs[dIdx];
          if (rawCfg.isRestDay || dIdx === 6) {
            extraDays.push({ dayName: 'Pazar', isRestDay: true });
            continue;
          }
          const s1 = typeof rawCfg.s1 === 'function' ? rawCfg.s1() : rawCfg.s1;
          const s2 = typeof rawCfg.s2 === 'function' ? rawCfg.s2() : rawCfg.s2;
          const blocks = [];
          for (let i = 0; i < (rawCfg.c1 || 2); i++) {
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
          for (let i = 0; i < (rawCfg.c2 || 2); i++) {
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
          extraDays.push({ dayName: rawCfg.name, isRestDay: false, blocks });
        }
        newWeeks.push({ weekNum: extraWeekNum, days: extraDays });
        remainingCount = Object.values(uncompletedQueues).reduce((sum, q) => sum + q.length, 0);
        extraWeekNum++;
      }

      if (!shiftStarted) {
        firstIncompleteWeek = baseline.length;
        firstIncompleteDay = 5;
      }

      return {
        schedule: newWeeks,
        nextActiveWeek: firstIncompleteWeek,
        nextActiveDay: firstIncompleteDay
      };
    }

    function triggerAdminShift() {
      const result = shiftSchedulePreservingPast(PLAYLISTS_DATA, completedVideos, currentSchedule || BASELINE_CALENDAR);
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
      activeWeekNum = result.nextActiveWeek;
      activeDayIndex = result.nextActiveDay;
      saveState();
      renderAdminDashboard();
      alert('Program güncellendi. Geçmişte tamamlanan günler korundu, kalan videolar bugünden itibaren takvime yeniden dağıtıldı.');
    }

    function resetAdminSchedule() {
      if (confirm('Orijinal 42 haftalık plana dönmek istediğinize emin misiniz?')) {
        currentSchedule = JSON.parse(JSON.stringify(BASELINE_CALENDAR));
        try {
          localStorage.removeItem('yks_shifted_schedule');
        } catch (e) {}
        saveState();
        renderAdminDashboard();
        alert('Takvim orijinal başlangıç planına sıfırlandı.');
      }
    }

    function resetAllProgress() {
      const confirm1 = confirm('DİKKAT: Tüm çalışma kayıtlarınız, işaretlediğiniz videolar ve takvim sıfırlanacaktır. Devam etmek istiyor musunuz?');
      if (!confirm1) return;

      const confirm2 = confirm('Bu işlem GERİ ALINAMAZ. Son onay: Tüm ilerlemeyi silmek istediğinize emin misiniz?');
      if (!confirm2) return;

      completedVideos = {};
      activeWeekNum = 1;
      activeDayIndex = 0;
      currentSchedule = JSON.parse(JSON.stringify(BASELINE_CALENDAR));

      try {
        localStorage.removeItem('yks_completed_videos');
        localStorage.removeItem('yks_active_week');
        localStorage.removeItem('yks_active_day');
        localStorage.removeItem('yks_shifted_schedule');
      } catch (e) {
        console.warn('Storage clear error:', e);
      }

      renderAdminDashboard();
      alert('Tüm çalışma ilerlemesi ve takvim başarıyla sıfırlandı.');
    }

    // Init
    loadState();
    updateLiveDateTime();
    updateTargetCountdown();
    renderAdminDashboard();
    setInterval(updateLiveDateTime, 1000);
  </script>
</body>
</html>`;

  const outputPath = path.resolve(__dirname, '../www/admin.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Generated Admin web application: ${outputPath} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
  return html;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateAdminApp();
}
