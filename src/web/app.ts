/**
 * YKS 2027 Koçu - Responsive Web & PWA Client Application Controller
 * Strict TypeScript controller logic for scheduling, timer, storage,
 * responsive navigation, PWA hooks, and YouTube playback.
 */

import type {
  PlaylistsData,
  WeekSchedule,
  StoredProgress,
  BreakTimer,
  TimerState,
  Video,
  CourseProgress,
  BackupPayload
} from './types.js';
import { shiftSchedule } from './shift_engine.js';
import { createBreakTimer, playChime, initAudioContext } from './timer.js';
import {
  loadProgress,
  saveProgress,
  exportBackup,
  validateBackup,
  calculateCourseProgress,
  MemoryStorage
} from './storage.js';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface AppState {
  completedVideos: Record<string, boolean>;
  currentSchedule: WeekSchedule[];
  baselineWeeks: WeekSchedule[];
  rawPlaylists: PlaylistsData;
  activeWeekNum: number;
  activeDayIndex: number; // 0: Pazartesi ... 6: Pazar
  activeTab: string;      // 'tab-today' | 'tab-radar' | 'tab-curriculum'
  breakTimer: BreakTimer | null;
  deferredPrompt: BeforeInstallPromptEvent | null;
  storage: Storage;
}

export class AppController {
  private state: AppState;

  constructor(
    rawPlaylists: PlaylistsData = {},
    baselineWeeks: WeekSchedule[] = [],
    storage?: Storage
  ) {
    const effectiveStorage = storage || (typeof window !== 'undefined' && window.localStorage ? window.localStorage : new MemoryStorage());
    const stored = loadProgress(effectiveStorage);

    this.state = {
      completedVideos: stored.completedVideos || {},
      currentSchedule: stored.shiftedSchedule && stored.shiftedSchedule.length > 0 ? stored.shiftedSchedule : [...baselineWeeks],
      baselineWeeks: [...baselineWeeks],
      rawPlaylists,
      activeWeekNum: stored.activeWeek || 1,
      activeDayIndex: typeof stored.activeDay === 'number' ? stored.activeDay : 0,
      activeTab: 'tab-today',
      breakTimer: null,
      deferredPrompt: null,
      storage: effectiveStorage
    };
  }

  // ---------------------------------------------------------------------------
  // State Accessors
  // ---------------------------------------------------------------------------
  public getState(): AppState {
    return { ...this.state };
  }

  public get completedVideos(): Record<string, boolean> {
    return this.state.completedVideos;
  }

  public get currentSchedule(): WeekSchedule[] {
    return this.state.currentSchedule;
  }

  public get activeWeekNum(): number {
    return this.state.activeWeekNum;
  }

  public get activeDayIndex(): number {
    return this.state.activeDayIndex;
  }

  public get activeTab(): string {
    return this.state.activeTab;
  }

  public get deferredPrompt(): BeforeInstallPromptEvent | null {
    return this.state.deferredPrompt;
  }

  public setPlaylistsAndBaseline(playlists: PlaylistsData, baseline: WeekSchedule[]): void {
    this.state.rawPlaylists = playlists;
    this.state.baselineWeeks = [...baseline];
    if (this.state.currentSchedule.length === 0) {
      this.state.currentSchedule = [...baseline];
    }
  }

  // ---------------------------------------------------------------------------
  // Tab Navigation (Bugün, Radar, Müfredat)
  // ---------------------------------------------------------------------------
  public switchTab(tabId: string): void {
    const validTabs = ['tab-today', 'tab-radar', 'tab-curriculum'];
    if (!validTabs.includes(tabId)) return;

    this.state.activeTab = tabId;

    if (typeof document !== 'undefined') {
      // Toggle panes
      document.querySelectorAll('.tab-pane').forEach(el => {
        el.classList.toggle('active', el.id === tabId);
      });

      // Update mobile bottom nav items
      document.querySelectorAll('.m3-bottom-nav .nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
      });

      // Update desktop horizontal nav buttons
      document.querySelectorAll('.desktop-nav-tabs .desktop-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
      });

      if (typeof window !== 'undefined' && window.scrollTo) {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Calendar Navigation
  // ---------------------------------------------------------------------------
  public navigateDay(direction: number): void {
    let newDay = this.state.activeDayIndex + direction;
    let newWeek = this.state.activeWeekNum;

    if (newDay > 6) {
      if (newWeek < 42) {
        newWeek += 1;
        newDay = 0;
      } else {
        newDay = 6;
      }
    } else if (newDay < 0) {
      if (newWeek > 1) {
        newWeek -= 1;
        newDay = 6;
      } else {
        newDay = 0;
      }
    }

    this.state.activeWeekNum = newWeek;
    this.state.activeDayIndex = newDay;

    saveProgress(
      { activeWeek: this.state.activeWeekNum, activeDay: this.state.activeDayIndex },
      this.state.storage
    );

    if (typeof document !== 'undefined') {
      const select = document.getElementById('day-selector') as HTMLSelectElement | null;
      if (select) {
        select.value = `${newWeek}-${newDay}`;
      }
      this.renderTodayTab();
      this.updateTopBar();
    }
  }

  public onDaySelectChange(val: string): void {
    const parts = val.split('-');
    if (parts.length === 2) {
      this.state.activeWeekNum = parseInt(parts[0], 10) || 1;
      this.state.activeDayIndex = parseInt(parts[1], 10) || 0;

      saveProgress(
        { activeWeek: this.state.activeWeekNum, activeDay: this.state.activeDayIndex },
        this.state.storage
      );

      this.renderTodayTab();
      this.updateTopBar();
    }
  }

  public jumpToWeek(weekNum: number): void {
    this.state.activeWeekNum = weekNum;
    this.state.activeDayIndex = 0;

    saveProgress(
      { activeWeek: this.state.activeWeekNum, activeDay: this.state.activeDayIndex },
      this.state.storage
    );

    if (typeof document !== 'undefined') {
      const select = document.getElementById('day-selector') as HTMLSelectElement | null;
      if (select) {
        select.value = `${weekNum}-0`;
      }
    }

    this.switchTab('tab-today');
    this.renderTodayTab();
    this.updateTopBar();
  }

  // ---------------------------------------------------------------------------
  // Video Completion Toggle
  // ---------------------------------------------------------------------------
  public toggleVideo(videoId: string, isChecked: boolean): void {
    if (isChecked) {
      this.state.completedVideos[videoId] = true;
    } else {
      delete this.state.completedVideos[videoId];
    }

    saveProgress(
      { completedVideos: this.state.completedVideos },
      this.state.storage
    );

    this.updateTopBar();
    this.renderTodayTab();
    this.renderRadarTab();
    this.renderCurriculumTab();
  }

  // ---------------------------------------------------------------------------
  // Direct YouTube Opening (Desktop _blank vs Android Native Intent)
  // ---------------------------------------------------------------------------
  public openYouTube(id: string, event?: Event | { preventDefault?: () => void }): void {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    const webUrl = `https://www.youtube.com/watch?v=${id}`;

    const isCapacitorAndroid = typeof window !== 'undefined' && Boolean(
      ((window as any).Capacitor?.isNativePlatform && (window as any).Capacitor.isNativePlatform()) ||
      ((window as any).Capacitor?.getPlatform && (window as any).Capacitor.getPlatform() === 'android')
    );

    if (isCapacitorAndroid && typeof window !== 'undefined') {
      const intentUri = `vnd.youtube:${id}`;
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
            window.open(webUrl, '_blank', 'noopener,noreferrer');
          }
        }, 800);
      } catch {
        if (typeof window !== 'undefined' && window.removeEventListener) {
          window.removeEventListener('blur', onBlur);
        }
        if (typeof window !== 'undefined') {
          window.open(webUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } else if (typeof window !== 'undefined') {
      // On web desktop/browser: opens in new tab via https://www.youtube.com/watch?v=ID with window.open(url, '_blank', 'noopener,noreferrer')
      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }
  }

  // ---------------------------------------------------------------------------
  // Stress-Free Shift Engine Invocation
  // ---------------------------------------------------------------------------
  public triggerShiftEngine(): WeekSchedule[] {
    const shifted = shiftSchedule(this.state.rawPlaylists, this.state.completedVideos);

    if (!shifted || shifted.length === 0) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Tebrikler! Tüm müfredat videoları zaten tamamlandı. Kaydırılacak video kalmadı!');
      }
      return [];
    }

    this.state.currentSchedule = shifted;
    this.state.activeWeekNum = 1;
    this.state.activeDayIndex = 0;

    saveProgress({
      activeWeek: 1,
      activeDay: 0,
      shiftedSchedule: shifted
    }, this.state.storage);

    if (typeof document !== 'undefined') {
      const select = document.getElementById('day-selector') as HTMLSelectElement | null;
      if (select) select.value = '1-0';
      this.populateDayDropdown();
      this.renderTodayTab();
      this.renderRadarTab();
      this.updateTopBar();

      if (typeof window !== 'undefined' && window.alert) {
        window.alert('✨ Program başarıyla güncellendi! Sıfır suçluluk, sıfır stres: Kalan tüm videolar bugünden itibaren kronolojik sırayla yeniden düzenlendi. Hedef 19 Haziran 2027!');
      }
    }

    return shifted;
  }

  public resetToOriginalSchedule(): void {
    this.state.currentSchedule = [...this.state.baselineWeeks];
    this.state.activeWeekNum = 1;
    this.state.activeDayIndex = 0;

    saveProgress({
      activeWeek: 1,
      activeDay: 0,
      shiftedSchedule: null
    }, this.state.storage);

    if (typeof document !== 'undefined') {
      const select = document.getElementById('day-selector') as HTMLSelectElement | null;
      if (select) select.value = '1-0';
      this.populateDayDropdown();
      this.renderTodayTab();
      this.renderRadarTab();
      this.updateTopBar();

      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Orijinal 42 haftalık takvime dönüldü.');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Break Timer Controller
  // ---------------------------------------------------------------------------
  public initTimer(durationSeconds: number = 1200): BreakTimer {
    if (!this.state.breakTimer) {
      this.state.breakTimer = createBreakTimer(durationSeconds, {
        onTick: (remaining) => {
          this.updateTimerDisplay(remaining, durationSeconds);
        },
        onComplete: () => {
          this.onTimerComplete();
        }
      });
    }
    return this.state.breakTimer;
  }

  public openTimerModal(duration: number = 1200): void {
    initAudioContext();
    const timer = this.initTimer(duration);
    const state = timer.getState();
    if (!state.running && state.remaining <= 0) {
      timer.reset(duration);
    }

    if (typeof document !== 'undefined') {
      const overlay = document.getElementById('timer-modal-overlay');
      if (overlay) overlay.classList.add('open');
      const toggleBtn = document.getElementById('timer-toggle-btn');
      if (toggleBtn) toggleBtn.textContent = 'Duraklat';
    }

    timer.start();
  }

  public closeTimerModal(): void {
    if (typeof document !== 'undefined') {
      const overlay = document.getElementById('timer-modal-overlay');
      if (overlay) overlay.classList.remove('open');
    }
  }

  public toggleTimer(): void {
    const timer = this.initTimer();
    const state = timer.getState();
    if (state.running) {
      this.pauseTimer();
    } else {
      this.resumeTimer();
    }
  }

  public pauseTimer(): void {
    this.state.breakTimer?.pause();
    if (typeof document !== 'undefined') {
      const toggleBtn = document.getElementById('timer-toggle-btn');
      if (toggleBtn) toggleBtn.textContent = 'Devam Et';
    }
  }

  public resumeTimer(): void {
    initAudioContext();
    this.state.breakTimer?.resume();
    if (typeof document !== 'undefined') {
      const toggleBtn = document.getElementById('timer-toggle-btn');
      if (toggleBtn) toggleBtn.textContent = 'Duraklat';
    }
  }

  public resetTimer(): void {
    this.state.breakTimer?.reset();
    if (typeof document !== 'undefined') {
      const toggleBtn = document.getElementById('timer-toggle-btn');
      if (toggleBtn) toggleBtn.textContent = 'Başlat';
    }
    const state = this.state.breakTimer?.getState();
    if (state) {
      this.updateTimerDisplay(state.remaining, state.duration);
    }
  }

  public addTimerMinutes(mins: number = 5): void {
    const timer = this.initTimer();
    const current = timer.getState();
    const newRemaining = current.remaining + mins * 60;
    const newDuration = Math.max(current.duration, newRemaining);
    timer.reset(newDuration);
    // Adjust remaining
    if (current.running) {
      timer.start();
    }
    this.updateTimerDisplay(newRemaining, newDuration);
  }

  public updateTimerDisplay(remaining: number, duration: number): void {
    if (typeof document === 'undefined') return;
    const displayEl = document.getElementById('timer-display');
    const fillEl = document.getElementById('timer-progress-fill');

    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    const str = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    if (displayEl) displayEl.textContent = str;
    if (fillEl && duration > 0) {
      const pct = Math.max(0, Math.min(100, (remaining / duration) * 100));
      fillEl.style.width = `${pct}%`;
    }
  }

  public onTimerComplete(): void {
    playChime();
    this.triggerHaptic(800);

    if (typeof document !== 'undefined') {
      const toggleBtn = document.getElementById('timer-toggle-btn');
      if (toggleBtn) toggleBtn.textContent = 'Başlat';
    }

    if (typeof window !== 'undefined' && window.alert) {
      setTimeout(() => {
        window.alert('☕ 20 dakikalık mola tamamlandı! Zihnin dinlendi, bir sonraki video bloğuna geçmeye hazırsın.');
      }, 500);
    }
  }

  public triggerHaptic(duration: number = 500): void {
    try {
      if (typeof window !== 'undefined') {
        const cap = (window as any).Capacitor;
        if (cap?.Plugins?.Haptics?.vibrate) {
          cap.Plugins.Haptics.vibrate({ duration });
          return;
        }
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([duration, 150, duration]);
      }
    } catch {
      // Haptics unsupported
    }
  }

  // ---------------------------------------------------------------------------
  // PWA Service Worker & Install Prompt
  // ---------------------------------------------------------------------------
  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
        return registration;
      } catch (err) {
        console.warn('ServiceWorker registration error:', err);
        return null;
      }
    }
    return null;
  }

  public setupInstallPrompt(installBtnId: string = 'pwa-install-btn'): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.state.deferredPrompt = e as BeforeInstallPromptEvent;
      const btn = document.getElementById(installBtnId);
      if (btn) {
        btn.style.display = 'inline-flex';
      }
    });

    window.addEventListener('appinstalled', () => {
      this.state.deferredPrompt = null;
      const btn = document.getElementById(installBtnId);
      if (btn) {
        btn.style.display = 'none';
      }
    });
  }

  public async triggerInstallPrompt(installBtnId: string = 'pwa-install-btn'): Promise<boolean> {
    if (this.state.deferredPrompt) {
      try {
        await this.state.deferredPrompt.prompt();
        const choice = await this.state.deferredPrompt.userChoice;
        this.state.deferredPrompt = null;
        if (typeof document !== 'undefined') {
          const btn = document.getElementById(installBtnId);
          if (btn) btn.style.display = 'none';
        }
        return choice.outcome === 'accepted';
      } catch {
        return false;
      }
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // JSON Backup & Restore
  // ---------------------------------------------------------------------------
  public exportProgress(): BackupPayload {
    const payload = exportBackup({
      completedVideos: this.state.completedVideos,
      activeWeek: this.state.activeWeekNum,
      activeDay: this.state.activeDayIndex,
      shiftedSchedule: this.state.currentSchedule !== this.state.baselineWeeks ? this.state.currentSchedule : null
    });

    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      try {
        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'yks_2027_ilerleme_yedek.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.warn('Backup export download failed:', err);
      }
    }

    return payload;
  }

  public importProgress(data: unknown): boolean {
    const validated = validateBackup(data);
    if (!validated) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Geçersiz yedek dosyası formatı.');
      }
      return false;
    }

    this.state.completedVideos = validated.completedVideos;
    if (validated.activeWeek) this.state.activeWeekNum = validated.activeWeek;
    if (typeof validated.activeDay === 'number') this.state.activeDayIndex = validated.activeDay;

    saveProgress({
      completedVideos: this.state.completedVideos,
      activeWeek: this.state.activeWeekNum,
      activeDay: this.state.activeDayIndex
    }, this.state.storage);

    this.updateAllUI();

    if (typeof window !== 'undefined' && window.alert) {
      window.alert(`Yedek başarıyla yüklendi! ${Object.keys(this.state.completedVideos).length} video tamamlandı olarak işaretlendi.`);
    }

    return true;
  }

  // ---------------------------------------------------------------------------
  // Curriculum Search
  // ---------------------------------------------------------------------------
  public handleCurriculumSearch(rawQuery: string): Video[] {
    const q = (rawQuery || '').trim().toLocaleLowerCase('tr-TR');
    if (!q) {
      this.clearCurriculumSearch();
      return [];
    }

    const matches: Video[] = [];
    for (const [subjectName, info] of Object.entries(this.state.rawPlaylists)) {
      for (const v of info.videos || []) {
        const titleLower = (v.title || '').toLocaleLowerCase('tr-TR');
        const subjLower = subjectName.toLocaleLowerCase('tr-TR');
        const instLower = (info.instructor || '').toLocaleLowerCase('tr-TR');

        if (titleLower.includes(q) || subjLower.includes(q) || instLower.includes(q)) {
          matches.push(v);
        }
      }
    }

    if (typeof document !== 'undefined') {
      const area = document.getElementById('search-results-area');
      const countEl = document.getElementById('search-results-count');
      const listEl = document.getElementById('search-results-list');

      if (area && countEl && listEl) {
        area.style.display = 'block';
        countEl.textContent = `${matches.length} video bulundu`;

        if (matches.length === 0) {
          listEl.innerHTML = '<p style="padding: 12px; font-size: 0.85rem; color: var(--m3-text-muted);">Aramanızla eşleşen video bulunamadı.</p>';
        } else {
          listEl.innerHTML = matches.slice(0, 30).map(v => {
            const isDone = Boolean(this.state.completedVideos[v.id]);
            return `
              <div class="video-block-card ${isDone ? 'completed' : ''}" style="margin-bottom: 8px;">
                <div class="video-title" style="margin-bottom: 8px;">${v.title}</div>
                <div class="video-block-actions">
                  <label class="checkbox-label" for="search-chk-${v.id}">
                    <input type="checkbox" class="block-checkbox" id="search-chk-${v.id}"
                      ${isDone ? 'checked' : ''}
                      onchange="app.toggleVideo('${v.id}', this.checked)">
                    <span>${isDone ? 'Tamamlandı' : 'İzlendi'}</span>
                  </label>
                  <a class="yt-intent-btn" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener noreferrer" onclick="app.openYouTube('${v.id}', event)">
                    <span>YouTube'da İzle</span>
                  </a>
                </div>
              </div>
            `;
          }).join('') + (matches.length > 30 ? `<p style="font-size: 0.75rem; color: var(--m3-text-muted); text-align: center; margin-top: 8px;">Ve ${matches.length - 30} video daha...</p>` : '');
        }
      }
    }

    return matches;
  }

  public clearCurriculumSearch(): void {
    if (typeof document !== 'undefined') {
      const input = document.getElementById('curriculum-search-input') as HTMLInputElement | null;
      if (input) input.value = '';
      const area = document.getElementById('search-results-area');
      if (area) area.style.display = 'none';
    }
  }

  // ---------------------------------------------------------------------------
  // UI Rendering & Synchronization
  // ---------------------------------------------------------------------------
  public updateTopBar(): void {
    if (typeof document === 'undefined') return;
    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const dateText = `Hafta ${this.state.activeWeekNum} • ${dayNames[this.state.activeDayIndex] || 'Pazartesi'}`;
    const dateEl = document.getElementById('top-bar-week-date');
    if (dateEl) dateEl.textContent = dateText;

    const watched = Object.keys(this.state.completedVideos).filter(k => this.state.completedVideos[k]).length;
    const pct = ((watched / 766) * 100).toFixed(1);
    const pctEl = document.getElementById('top-bar-pct');
    if (pctEl) pctEl.textContent = `%${pct}`;
  }

  public populateDayDropdown(): void {
    if (typeof document === 'undefined') return;
    const select = document.getElementById('day-selector') as HTMLSelectElement | null;
    if (!select) return;

    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const html = this.state.currentSchedule.map(w => {
      const opts = dayNames.map((dName, dIdx) => {
        const isSelected = w.weekNum === this.state.activeWeekNum && dIdx === this.state.activeDayIndex ? 'selected' : '';
        return `<option value="${w.weekNum}-${dIdx}" ${isSelected}>Hafta ${w.weekNum} • ${dName}</option>`;
      }).join('\n');
      return `<optgroup label="Hafta ${w.weekNum}">${opts}</optgroup>`;
    }).join('\n');

    select.innerHTML = html;
  }

  public renderTodayTab(): void {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('today-content-area');
    if (!container) return;

    const week = this.state.currentSchedule.find(w => w.weekNum === this.state.activeWeekNum);
    if (!week) {
      container.innerHTML = '<p>Bu hafta için plan bulunamadı.</p>';
      return;
    }

    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const currentDayName = dayNames[this.state.activeDayIndex];
    const dayData = week.days.find(d => d.dayName === currentDayName) || week.days[this.state.activeDayIndex];

    const titleEl = document.getElementById('day-summary-title');
    const subtitleEl = document.getElementById('day-summary-subtitle');
    const badgeEl = document.getElementById('day-completed-badge');

    if (titleEl) titleEl.textContent = `Hafta ${this.state.activeWeekNum} • ${currentDayName}`;

    // Sunday rest
    if (dayData && dayData.isRestDay) {
      if (subtitleEl) subtitleEl.textContent = 'Zihinsel Dinlenme & Konsolidasyon Günü';
      if (badgeEl) badgeEl.textContent = 'Dinlenme Günü';

      container.innerHTML = `
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
          <button class="btn btn-outline" style="width: 100%;" onclick="app.navigateDay(1)">Pazartesi Programını Önizle</button>
        </div>
      `;
      return;
    }

    // Weekday with 4 blocks
    const blocks = dayData?.blocks || [];
    let completedBlocksCount = 0;

    let blocksHtml = '<div class="today-blocks-grid">';
    blocks.forEach((b, idx) => {
      const v = b.video;
      const videoId = v.id || (`tekrar-${(b.subject || 'genel').replace(/[^a-zA-Z0-9]/g, '_')}-w${this.state.activeWeekNum}-d${this.state.activeDayIndex}-b${idx + 1}`);
      const isDone = Boolean(this.state.completedVideos[videoId]);
      if (isDone) completedBlocksCount++;

      const durationText = v.duration_min ? `${Math.round(v.duration_min)} dk` : '40 dk';

      blocksHtml += `
        <div class="video-block-card ${isDone ? 'completed' : ''}" id="block-card-${idx}">
          <div class="video-block-header">
            <div class="video-block-meta-left">
              <span class="block-num-pill">Blok ${b.blockNum || idx + 1}</span>
              <span class="subject-badge badge-${(b.subject || '').toLowerCase().replace(/[^a-z0-9]/g, '-')}">${b.subject}</span>
              <span class="video-instructor-label">${b.instructor || ''}</span>
            </div>
            <span class="video-duration-pill tabular-nums">${durationText}</span>
          </div>

          <div class="video-title">${v.title}</div>

          <div class="video-block-actions">
            <label class="checkbox-label" for="chk-${this.state.activeWeekNum}-${this.state.activeDayIndex}-${idx}">
              <input type="checkbox" class="block-checkbox" id="chk-${this.state.activeWeekNum}-${this.state.activeDayIndex}-${idx}"
                ${isDone ? 'checked' : ''}
                onchange="app.toggleVideo('${videoId}', this.checked)">
              <span>${isDone ? 'Tamamlandı' : 'İzlendi olarak işaretle'}</span>
            </label>

            ${v.id ? `
              <a class="yt-intent-btn" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener noreferrer" onclick="app.openYouTube('${v.id}', event)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>YouTube'da İzle</span>
              </a>
            ` : ''}
          </div>
        </div>
      `;

      // 20-min break card
      if (idx < blocks.length - 1) {
        blocksHtml += `
          <div class="break-card">
            <div class="break-content">
              <span class="break-icon">☕</span>
              <div>
                <div class="break-title">20 dk Mola</div>
                <div class="break-desc">Beyin dinlenmeden öğrenme kalıcı olmaz.</div>
              </div>
            </div>
            <button class="break-start-btn" onclick="app.openTimerModal(1200)">Mola Başlat</button>
          </div>
        `;
      }
    });

    blocksHtml += '</div>';

    if (subtitleEl) subtitleEl.textContent = '4 blok video • 3 mola';
    if (badgeEl) badgeEl.textContent = `${completedBlocksCount} / ${blocks.length} Blok`;

    container.innerHTML = blocksHtml;
  }

  public renderRadarTab(): void {
    if (typeof document === 'undefined') return;

    // 19 Haziran 2027 Countdown
    const targetDate = new Date('2027-06-19T10:00:00');
    const now = new Date();
    const diffDays = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const countdownEl = document.getElementById('yks-target-countdown');
    if (countdownEl) countdownEl.textContent = `19 Haziran 2027 • ${diffDays} gün kaldı`;

    // Radar KPIs
    const watchedCount = Object.keys(this.state.completedVideos).filter(k => this.state.completedVideos[k]).length;
    const remainingCount = Math.max(0, 766 - watchedCount);

    let totalWatchedSec = 0;
    for (const [, info] of Object.entries(this.state.rawPlaylists)) {
      for (const v of info.videos || []) {
        if (this.state.completedVideos[v.id]) {
          totalWatchedSec += v.duration_sec || Math.round((v.duration_min || 0) * 60);
        }
      }
    }
    const watchedHours = (totalWatchedSec / 3600).toFixed(1);

    const watchedEl = document.getElementById('radar-watched-count');
    const remainingEl = document.getElementById('radar-remaining-count');
    const hoursEl = document.getElementById('radar-total-hours');

    if (watchedEl) watchedEl.textContent = String(watchedCount);
    if (remainingEl) remainingEl.textContent = String(remainingCount);
    if (hoursEl) hoursEl.textContent = `${watchedHours} sa`;

    // 42 Weeks Timeline
    const container = document.getElementById('timeline-container');
    if (!container) return;

    let html = '';
    this.state.currentSchedule.forEach(w => {
      let weekTotal = 0;
      let weekDone = 0;

      w.days.forEach(d => {
        if (!d.isRestDay && d.blocks) {
          d.blocks.forEach(b => {
            weekTotal++;
            if (b.video?.id && this.state.completedVideos[b.video.id]) {
              weekDone++;
            }
          });
        }
      });

      const isAllDone = weekTotal > 0 && weekDone === weekTotal;

      html += `
        <div class="week-card" id="week-card-${w.weekNum}">
          <div class="week-header" onclick="app.toggleWeekAccordion(${w.weekNum})">
            <div class="week-header-left">
              <span class="week-title">Hafta ${w.weekNum}</span>
            </div>
            <span class="week-progress-pill tabular-nums ${isAllDone ? 'all-done' : ''}">
              ${weekDone} / ${weekTotal} Blok
            </span>
          </div>
          <div class="week-details" id="week-details-${w.weekNum}">
            ${w.days.map(d => {
              if (d.isRestDay) {
                return `<div class="week-day-row"><span>${d.dayName}</span><span style="color: var(--m3-red-primary); font-weight: 600;">⛔ Dinlenme Günü</span></div>`;
              }
              const bCount = d.blocks?.length || 4;
              const dCompleted = d.blocks?.filter(b => b.video?.id && this.state.completedVideos[b.video.id]).length || 0;
              return `
                <div class="week-day-row">
                  <span>${d.dayName}</span>
                  <span class="tabular-nums" style="color: var(--m3-text-secondary);">${dCompleted} / ${bCount} İzlendi</span>
                </div>
              `;
            }).join('')}
            <button class="btn btn-outline" style="width: 100%; margin-top: 10px; min-height: 48px; font-size: 0.85rem;"
              onclick="app.jumpToWeek(${w.weekNum})">
              Bu Haftayı 'Bugün' Olarak Aç
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  public toggleWeekAccordion(weekNum: number): void {
    if (typeof document === 'undefined') return;
    const details = document.getElementById(`week-details-${weekNum}`);
    if (details) {
      details.classList.toggle('open');
    }
  }

  public renderCurriculumTab(): void {
    if (typeof document === 'undefined') return;
    const courses = calculateCourseProgress(this.state.rawPlaylists, this.state.completedVideos);

    courses.forEach(c => {
      const slug = c.subject.replace(/\s+/g, '-');
      const pctEl = document.getElementById(`course-pct-${slug}`);
      const barEl = document.getElementById(`course-bar-${slug}`);
      const statsEl = document.getElementById(`course-stats-${slug}`);

      if (pctEl) pctEl.textContent = `%${c.progressPct.toFixed(1)}`;
      if (barEl) barEl.style.width = `${c.progressPct}%`;
      if (statsEl) {
        const remaining = c.totalVideos - c.completedVideos;
        statsEl.innerHTML = `
          <span>${c.completedVideos} / ${c.totalVideos} Video</span>
          <span>${remaining} Video Kaldı</span>
        `;
      }
    });
  }

  public updateAllUI(): void {
    this.updateTopBar();
    this.populateDayDropdown();
    this.renderTodayTab();
    this.renderRadarTab();
    this.renderCurriculumTab();
  }

  public initApp(): void {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.updateAllUI();
  }
}

// ---------------------------------------------------------------------------
// Global Controller Instance and Bridge
// ---------------------------------------------------------------------------
export const app = new AppController();

// Global top-level delegated functions for inline template handlers
export function switchTab(tabId: string): void {
  app.switchTab(tabId);
}

export function navigateDay(direction: number): void {
  app.navigateDay(direction);
}

export function onDaySelectChange(val: string): void {
  app.onDaySelectChange(val);
}

export function jumpToWeek(weekNum: number): void {
  app.jumpToWeek(weekNum);
}

export function toggleVideo(videoId: string, isChecked: boolean): void {
  app.toggleVideo(videoId, isChecked);
}

export function openYouTube(id: string, event?: Event | { preventDefault?: () => void }): void {
  app.openYouTube(id, event);
}

export function triggerShiftEngine(): WeekSchedule[] {
  return app.triggerShiftEngine();
}

export function resetToOriginalSchedule(): void {
  app.resetToOriginalSchedule();
}

export function openTimerModal(duration: number = 1200): void {
  app.openTimerModal(duration);
}

export function closeTimerModal(): void {
  app.closeTimerModal();
}

export function toggleTimer(): void {
  app.toggleTimer();
}

export function pauseTimer(): void {
  app.pauseTimer();
}

export function resumeTimer(): void {
  app.resumeTimer();
}

export function resetTimer(): void {
  app.resetTimer();
}

export function addTimerMinutes(mins: number = 5): void {
  app.addTimerMinutes(mins);
}

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  return app.registerServiceWorker();
}

export function setupInstallPrompt(installBtnId?: string): void {
  app.setupInstallPrompt(installBtnId);
}

export function triggerInstallPrompt(installBtnId?: string): Promise<boolean> {
  return app.triggerInstallPrompt(installBtnId);
}

export function exportProgress(): BackupPayload {
  return app.exportProgress();
}

export function importProgress(data: unknown): boolean {
  return app.importProgress(data);
}

export function handleCurriculumSearch(rawQuery: string): Video[] {
  return app.handleCurriculumSearch(rawQuery);
}

export function clearCurriculumSearch(): void {
  app.clearCurriculumSearch();
}

export function initApp(): void {
  app.initApp();
}

// Bind to window if in browser environment
if (typeof window !== 'undefined') {
  (window as any).app = app;
  (window as any).switchTab = switchTab;
  (window as any).navigateDay = navigateDay;
  (window as any).onDaySelectChange = onDaySelectChange;
  (window as any).jumpToWeek = jumpToWeek;
  (window as any).toggleVideo = toggleVideo;
  (window as any).openYouTube = openYouTube;
  (window as any).triggerShiftEngine = triggerShiftEngine;
  (window as any).resetToOriginalSchedule = resetToOriginalSchedule;
  (window as any).openTimerModal = openTimerModal;
  (window as any).closeTimerModal = closeTimerModal;
  (window as any).toggleTimer = toggleTimer;
  (window as any).pauseTimer = pauseTimer;
  (window as any).resumeTimer = resumeTimer;
  (window as any).resetTimer = resetTimer;
  (window as any).addTimerMinutes = addTimerMinutes;
  (window as any).registerServiceWorker = registerServiceWorker;
  (window as any).triggerInstallPrompt = triggerInstallPrompt;
  (window as any).exportProgress = exportProgress;
  (window as any).importProgress = importProgress;
  (window as any).handleCurriculumSearch = handleCurriculumSearch;
  (window as any).clearCurriculumSearch = clearCurriculumSearch;
}
