# YKS 2027 Koçu — SaaS Web Çalışma Alanı Görev Listesi

- [x] **Task 1: SaaS Layout Shell & Design System Stylesheet**
  - Dosyalar: `tests/saas_layout_and_design.test.js`, `src/generate_saas_app.js`
  - Kabul Kriteri: Sol Sidebar (260px sabit, daraltılabilir), Üst Komut Çubuğu, Slate/Mint CSS tokenları ve Canvas düzeni.
  - Doğrulama: `node --test tests/saas_layout_and_design.test.js`

- [x] **Task 2: Study Studio (Bugün) 2-Column SaaS Workspace View**
  - Dosyalar: `tests/saas_today_studio.test.js`, `src/generate_saas_app.js`
  - Kabul Kriteri: 2 sütunlu düzen (Sol: 4 video kartı, Sağ: KPI & dairesel SVG 20 dk mola sayacı), Pazar tatil ekranı.
  - Doğrulama: `node --test tests/saas_today_studio.test.js`

- [x] **Task 3: Master Calendar & Timeline (Radar & Shift Engine) SaaS View**
  - Dosyalar: `tests/saas_calendar_view.test.js`, `src/generate_saas_app.js`
  - Kabul Kriteri: 42 haftalık seçim bandı, haftalık matris görünümü, tek tıkla Stressiz Kaydırma Motoru ve 19 Haziran 2027 geri sayımı.
  - Doğrulama: `node --test tests/saas_calendar_view.test.js`

- [x] **Task 4: Curriculum Matrix (Müfredat Veri Bankası) SaaS Data Table View**
  - Dosyalar: `tests/saas_curriculum_table.test.js`, `src/generate_saas_app.js`
  - Kabul Kriteri: 9 ders ilerleme kartı, 766 videoluk interaktif veri tablosu (`<table>`), ders ve durum filtreleri, anlık arama.
  - Doğrulama: `node --test tests/saas_curriculum_table.test.js`

- [x] **Task 5: Global Command Palette (`Ctrl+K` / `⌘K`) & Search Modal**
  - Dosyalar: `tests/saas_command_palette.test.js`, `src/generate_saas_app.js`
  - Kabul Kriteri: `Ctrl+K` / `Cmd+K` klavye kısayoluyla açılan arama paleti, Türkçe uyumlu anlık video filtreleme ve direkt YouTube eylemleri.
  - Doğrulama: `node --test tests/saas_command_palette.test.js`

- [x] **Task 6: Preferences, Backup & PWA / Server Integration & Verification**
  - Dosyalar: `tests/saas_integration.test.js`, `src/generate_saas_app.js`, `package.json`
  - Kabul Kriteri: JSON yedekleme/içe aktarma, `www/index.html` SaaS üretimi, Android bundle senkronizasyonu, `npm run typecheck`, 100% test geçişi, `http://localhost:3000` canlı sunucu doğrulaması.
  - Doğrulama: `npm run typecheck && npm test && curl -s -I http://localhost:3000/`
