# YKS 2027 Koçu — Birleşik Duyarlı Web & PWA Uygulaması Tasarım Belgesi (Spec)

## 1. Genel Bakış ve Amaç

Bu tasarım, **YKS 2027 Koçu** uygulamasını hem masaüstü/dizüstü bilgisayar ekranlarında hem de tablet ve akıllı telefon tarayıcılarında mükemmel çalışan, tek merkezden yönetilen **Birleşik Duyarlı Web Uygulaması ve Progressive Web App (PWA)** haline getirmeyi amaçlar.

### Temel Hedefler
- **Duyarlı (Responsive) Tasarım:** Masaüstü geniş ekranlarda ferah, çok sütunlu profesyonel çalışma panosu; mobil ekranlarda ise parmak dostu ergonomik Material 3 arayüzü.
- **Doğrudan ve Hızlı Erişim:** Kullanıcı isteği doğrultusunda videolara tıklandığında doğrudan `youtube.com` üzerinde yeni bir sekmede açılır (`target="_blank"`), mobil ortamda ise yerel YouTube uygulaması önceliklendirilir.
- **PWA (Progressive Web App) Desteği:** `manifest.json` ve `sw.js` (Service Worker) ile masaüstü (Chrome, Edge) ve mobil (Safari, Chrome) tarayıcılarda tek tıkla sisteme uygulama gibi kurulabilir, internet bağlantısı olmadan da arayüz ve tüm müfredat verileri ışık hızında yüklenir.
- **Tam Özellik Paritesi:** 4 blok/gün kuralı, 20 dk sesli/titreşimli mola asistanı, Pazar dinlenme kalkanı, **Stress-Free Shift Engine** (geciken günleri bugünden itibaren kronolojik sırayla yeniden dağıtma), 9 ders ilerleme çubukları, Türkçe arama ve JSON yedek senkronizasyonu.
- **Tek Gerçek Kaynak (Single Source of Truth):** Web sürümü ve Android yerel paketi aynı `www/` dizinini ve derleme motorunu paylaşır. Kod tekrarı sıfıra indirilir.

---

## 2. Mimari ve Teknoloji Yığını

### Dosya ve Dizin Yapısı
```
.
├── www/                             # Dağıtıma hazır web & PWA paketi (Capacitor varlık kökü)
│   ├── index.html                   # Duyarlı (desktop + mobile) tek sayfa web uygulaması
│   ├── manifest.json                # PWA manifest dosyası (app name, theme color, icons)
│   ├── sw.js                        # Offline önbellekleme ve PWA service worker
│   └── icons/                       # PWA ikonları (192x192, 512x512 SVG/PNG)
├── src/
│   ├── generate_mobile_app.js       # Birleşik web/PWA ve mobil HTML derleyicisi
│   ├── calendar_engine.js           # 42 haftalık kronolojik blok dağıtım algoritması
│   └── serve_web.js                 # Yerel geliştirme ve web sunucusu (sıfır bağımlılık)
└── tests/
    ├── web_pwa.test.js              # PWA manifest, Service Worker ve duyarlı arayüz testleri
    └── ...                          # Mevcut 29 birim testi
```

### Teknoloji Seçimleri
- **Duyarlı CSS & Material 3:** CSS Grid ve Flexbox ile ekran genişliğine göre uyarlanan yerleşim (`@media (min-width: 768px)` ve `@media (min-width: 1024px)`).
- **Service Worker (`sw.js`):** Cache-first stratejisi ile HTML, CSS, JS ve 766 videoluk JSON verisini çevrimdışı depolar.
- **Vanilla ESM & Web Standartları:** Sıfır ağır JS kütüphanesi; saf, sürdürülebilir, hafif ve aşırı hızlı istemci mimarisi (Ponytail prensibi).

---

## 3. Duyarlı Arayüz ve Görsel Sistem (Desktop & Mobile)

### Ekran Kırılımları (Breakpoints)
1. **Masaüstü ve Geniş Ekranlar (`>= 1024px`):**
   - **Genişletilmiş Başlık & Sekme Çubuğu:** Üstte ferah istatistik paneli (İzlenen, Kalan, Yüzde, Güncel Hafta/Gün), ortada geniş çalışma kartları.
   - **Çift Sütunlu / Ferah Blok Düzeni:** Bugün sekmesinde 4 video bloğu ferah 2x2 veya geniş tek sütun halinde listelenir; her kartta ders adı, hoca adı, süre hapı, tamamlama kutucuğu ve "YouTube'da İzle" butonu yer alır.
   - **Sağ Alt Sabit Mola Dock'u:** Mola sayacı masaüstünde ekranın sağ altında zarif bir widget olarak çalışır; sekme başlığında geri sayım devam eder (`(17:45) ☕ Mola Devam Ediyor...`).
   - **Radar Sekmesinde Geniş Akordiyon:** 42 haftalık takvim masaüstünde kolay taranabilir çift sütunlu veya genişletilmiş grid görünümüne kavuşur.
2. **Tablet Ekranlar (`768px - 1023px`):**
   - Optimize edilmiş orta ölçekli kartlar ve akıcı geçişler.
3. **Mobil Ekranlar (`< 768px`):**
   - Mevcut ergonomik Material 3 tasarımı: Üst bar, alt navigasyon çubuğu (Bottom Navigation Bar) ve 48dp dokunma alanları.

### Renk Paleti ve Craft Kuralları (Impeccable)
- **Arka Plan:** Slate `#0f172a` (koyu mod) ve temiz açık yüzeyler (`#ffffff` / `#f8fafc`).
- **Nane Yeşili (Mint):** Tamamlanan videolar için `#10b981` / `#059669`.
- **Amber (Mola):** 20 dakikalık molalar için `#f59e0b` / `#d97706`.
- **Mercan/Kırmızı (Pazar):** Zorunlu dinlenme günü için `#ef4444` / `#dc2626`.
- **Tipografi:** `tabular-nums` rakamsal hizalama, `clamp()` duyarlı font boyutları, sıfır yapay gradyan metin, sıfır neobrütalist blok gölge.

---

## 4. Temel Özellikler ve Kullanıcı Deneyimi

### A. Video Açma Deneyimi (Kullanıcı Tercihi)
- Masaüstü tarayıcılarda: Butona tıklandığında `https://www.youtube.com/watch?v=VIDEO_ID` yeni sekmede (`target="_blank"`, `rel="noopener noreferrer"`) açılır.
- Android yerel uygulamasında: `vnd.youtube:VIDEO_ID` derin bağlantısı telefonun YouTube uygulamasını çağırır.

### B. Stress-Free Shift Engine (Programı Bugüne Göre Güncelle)
- Herhangi bir gün aksadığında, hasta olunduğunda veya mola verildiğinde tek tıkla çalıştırılır.
- Henüz tamamlanmamış tüm videolar kronolojik sıralaması bozulmadan bugünden itibaren 4 blokluk günlere yeniden dizilir.
- Sıfır suçluluk, sıfır stres: Öğrenci takvimi bozduğu hissine kapılmaz, hedef 19 Haziran 2027 olarak kalır.

### C. 20 Dakikalık Mola Asistanı
- Mola başladığında ve bittiğinde Web Audio API sentezleyici tonu (D5: 587.33Hz -> A5: 880Hz) çalar.
- Tarayıcı sekme başlığında anlık dakika ve saniye akar.
- Web Notification veya Vibration API (destekleyen tarayıcılarda) bildirim tetikler.

### D. Pazar Dinlenme Kalkanı
- Pazar günleri "⛔ PAZAR: ÇALIŞMAK KESİNLİKLE YASAK! (Beyin dinlenmeden öğrenme kalıcı olmaz)" ekranı gösterilir ve çalışma blokları kilitlenir.

### E. Çapraz Cihaz JSON Senkronizasyonu
- Masaüstü web sürümünden alınan `yks_2027_ilerleme_yedek.json` dosyası Android telefona aktarılabilir; aynı şekilde telefondan alınan yedek web sürümüne yüklenerek iki ortam 1 saniyede eşitlenebilir.

---

## 5. PWA (Progressive Web App) Özellikleri

1. **`www/manifest.json`:**
   - `name`: "YKS 2027 Koçu — Çalışma Programı & Dijital Asistan"
   - `short_name`: "YKS 2027"
   - `start_url`: "./index.html"
   - `display`: "standalone"
   - `background_color`: "#0f172a"
   - `theme_color`: "#0f172a"
   - İkonlar: 192x192 ve 512x512 maskable SVG/PNG.
2. **`www/sw.js`:**
   - Service worker kaydı: `index.html`, `manifest.json` ve ikonları önbelleğe alır.
   - Çevrimdışı desteği: İnternet kesilse bile uygulama tam fonksiyonellikle açılır.
3. **PWA Yükleme Butonu:**
   - Tarayıcının `beforeinstallprompt` olayını yakalayarak arayüzde zarif bir "Uygulamayı Yükle" butonu sunar.

---

## 6. Geliştirici Deneyimi ve Komutlar

- `npm run build:web` / `npm run build:mobile`: Web ve mobil dosyalarını derler ve senkronlar.
- `npm run serve`: `localhost:3000` adresinde PWA destekli hafif yerel sunucu başlatır.
- `npm test`: Web, mobil, takvim ve veri bütünlüğünü içeren tüm testleri koşturur.

---

## 7. Doğrulama ve Test Kriterleri

- [ ] `www/manifest.json` geçerli PWA standartlarında yapılandırılmış olmalı.
- [ ] `www/sw.js` service worker dosyası mevcut olmalı ve önbellekleme yapmalı.
- [ ] Masaüstü ekran genişliklerinde (`>= 1024px`) responsive CSS kuralları devreye girmeli.
- [ ] Mobil ekran genişliklerinde (`< 768px`) alt menü ve dokunmatik düzen korunmalı.
- [ ] YouTube butonları yeni sekmede `https://www.youtube.com/watch?v=ID` açmalı.
- [ ] Stress-Free Shift Engine hem masaüstü hem mobilde sorunsuz çalışmalı.
- [ ] Tüm testler (`npm test`) sıfır hata ile geçmeli.
