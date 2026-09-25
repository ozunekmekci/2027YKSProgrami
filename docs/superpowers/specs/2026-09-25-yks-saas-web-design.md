# YKS 2027 Koçu — Masaüstü SaaS Web Çalışma Alanı Tasarım Şartnamesi (Spec)

## 1. Vizyon ve Ürün Amacı

Bu şartname, YKS 2027 Equal Weight (EA) ve Sözel öğrencileri için 766 videoluk müfredatı yöneten, mobil ekran kısıtlamalarından tamamen arındırılmış, **bağımsız ve modern bir masaüstü SaaS (Software-as-a-Service) web çalışma alanının** mimarisini, kullanıcı arayüzünü ve teknik bileşenlerini tanımlar.

Mevcut mobil uyarlamalı görünümün yerine; Linear, Notion ve Raycast gibi üst düzey üretkenlik araçlarının tasarım kalitesini (`/impeccable`) taşıyan, geniş ekranları verimli kullanan profesyonel bir web platformu inşa edilecektir.

---

## 2. Temel Fonksiyonel Kısıtlar ve Sabitler

- **Müfredat Kapsamı:** 9 ders, 766 doğrulanmış YouTube videosu (`playlists_data_tr.json`).
- **Günlük Ritim:** Günde kesin olarak 4 blok (1 blok = 1 video).
- **Mola İlkesi:** Bloklar arası sabit 20 dakika mola (D5 587.33 Hz ve A5 880.0 Hz çift tonlu Web Audio zili).
- **Pazar İlkesi:** Pazar günü `⛔ PAZAR: ÇALIŞMAK KESİNLİKLE YASAK!` — zihinsel yenilenme ve tükenmişlik önleme modu.
- **Stress-Free Shift Engine:** Öğrenci video kaçırdığında suçluluk hissi yaratmadan, izlenmemiş videoları bugünden itibaren kronolojik olarak ileri haftalara kaydıran matematiksel motor.
- **Hedef Bitiş Tarihi:** 19 Haziran 2027 (~42 hafta).
- **Veri Kalıcılığı:** Tarayıcı `localStorage` üzerinde yerel saklama, JSON yedekleme/içe aktarma.

---

## 3. SaaS Kullanıcı Arayüzü Mimarisi (Impeccable & Slate/Mint)

### 3.1. Genel Sayfa Düzeni (Layout Shell)

```
+---------------------------------------------------------------------------------------+
|  [Sidebar]       |  [Top Command Bar: Breadcrumb | Ctrl+K Arama | Shift Butonu | KPI] |
|                  +--------------------------------------------------------------------+
|  Logo & Başlık   |                                                                    |
|  Aktif Hafta/Gün |  [Ana SaaS Çalışma Alanı (Workspace Canvas)]                       |
|  Navigasyon:     |                                                                    |
|  - 🎯 Bugün      |  - 2 Sütunlu Stüdyo (Sol: 4 Geniş Blok Kartı, Sağ: KPI & Mola)    |
|  - 🗺️ Radar     |  - 42 Haftalık Master Takvim Matrisi                               |
|  - 📚 Müfredat   |  - 766 Videoluk Filtrelenebilir SaaS Veri Tablosu                  |
|  - ⚙️ Ayarlar    |  - Veri & Yedekleme Merkezi                                        |
|                  |                                                                    |
|  [Hedef Geri Say]|                                                                    |
+---------------------------------------------------------------------------------------+
```

### 3.2. Sol Kenar Çubuğu (SaaS Sidebar)
- **Marka & Kimlik:** "Hermes • YKS 2027 Koçu" minimalist vektör amblem ve unvan.
- **Aktif Durum Kartı:** "1. Hafta • Pazartesi" göstergesi ve genel müfredat tamamlama yüzdesi halkası/barı.
- **Navigasyon Menüsü:**
  1. `🎯 Çalışma Stüdyosu (Bugün)`: Günün 4 ders bloğu, video oynatıcı bağlantıları ve mola paneli.
  2. `🗺️ Master Takvim (Radar)`: 42 haftalık zaman çizelgesi, hafta atlama ve Shift Engine tetikleyicisi.
  3. `📚 Müfredat Veri Bankası`: 9 dersin detaylı tablosu, filtreler ve arama.
  4. `⚙️ Veri & Yedekleme`: JSON dışa/içe aktarma ve ilerleme sıfırlama.
- **Sidebar Alt Bilgisi (Footer):** 19 Haziran 2027'ye Kalan Gün / Hafta dinamik geri sayım widget'ı.
- **Duyarlı Davranış:** 1024px ve üzerinde sabit genişlik (260px); tablet ve mobil cihazlarda simge moduna veya açılır çekmeceye (drawer) dönüşme yeteneği.

### 3.3. Üst SaaS Komut Çubuğu (Top Command Bar)
- **Breadcrumb:** `Çalışma Alanı / Hafta [N] / [Gün Adı]`.
- **Global Hızlı Arama (`Ctrl+K` / `⌘K`):** Tıklandığında veya kısayolla açılan modal/komut paleti; 766 video arasında anında başlık, konu veya eğitmen araması.
- **Hızlı Eylemler:**
  - "Stressiz Kaydır" hızlı erişim butonu (badge ile kaç video kaydırılacağını gösterir).
  - Canlı Mola Durum Hapı (eğer mola aktifse üst barda akan geri sayım süresi).
  - Genel İlerleme yüzdesi hapı (`tabular-nums`).

---

## 4. Sayfa Görünümleri ve Fonksiyonel Derinlik

### 4.1. Görünüm 1: Çalışma Stüdyosu (Bugün)
Günün odak masasıdır. Mobil benzeri tek sütunlu kartlar yerine 2 sütunlu ergonomik bir masaüstü çalışma paneli sunar:
- **Sol Sütun (%68 Genişlik - Günün Blokları):**
  - **Günün Başlık Barı:** Gün adı, toplam video süresi, tamamlanan blok sayısı.
  - **Geniş SaaS Video Kartları (4 Adet):**
    - Üst şerit: Blok numarası ("Blok 1"), Ders rozeti (renk kodlu), Eğitmen adı, Süre hapı ("42 dk").
    - Başlık: Net, yüksek kontrastlı video başlığı (`escapeHtml` korumalı).
    - Alt Eylem Barı:
      - Sol: "Tamamlandı" işaretleme anahtarı (modern checkbox/switch).
      - Sağ: YouTube'da İzle butonu (`_blank`, `noopener`, `noreferrer`).
- **Sağ Sütun (%32 Genişlik - Odak & Mola İstasyonu):**
  - **KPI Kartı:** Günlük ders dağılımı (örn: 2 Blok Türkçe, 2 Blok Coğrafya), kalan çalışma süresi.
  - **Entegre Mola Aracı (Inline Widget):** Sayfadan ayrılmadan veya modal açmadan çalışan 20 dakikalık dairesel SVG geri sayım sayacı, Başlat / Duraklat / Sıfırla kontrolleri ve süre ekleme (+5 dk) butonları.
  - **Mola Bitiş Bildirimi:** Süre dolduğunda D5/A5 Web Audio zili ve tarayıcı bildirimi.
- **Pazar Dinlenme Ekranı:** Pazar günü seçildiğinde çalışma blokları gizlenir; dinlendirici, şık bir SaaS sakinlik ekranı görüntülenir ("⛔ Pazar: Zihinsel Yenilenme & Dinlenme Günü").

### 4.2. Görünüm 2: Master Takvim (Radar & 42 Hafta)
- **Hafta Seçici & Navigasyon:** 1'den 42'ye kadar tüm haftaları yatay veya dikey matriste gösteren hızlı seçim bandı.
- **Haftalık Matris Görünümü:** Seçilen haftanın 6 çalışma günü kartlar halinde listelenir; her günün 4 bloğu ve dersleri toplu olarak incelenebilir.
- **Stress-Free Shift Engine Entegrasyonu:**
  - Tek tıkla "Stressiz Kaydırma Motoru" çalıştırılır.
  - İzlenmemiş tüm videolar bugünün gününden itibaren sırasıyla geleceğe dağıtılır.
  - "3 izlenmemiş video sonraki haftalara dağıtıldı" şeklinde bilgilendirme ve anında arayüz güncellemesi.

### 4.3. Görünüm 3: Müfredat Veri Bankası (SaaS Data Table)
- **Ders Özet Kartları:** 9 dersin her biri için yatay ilerleme çubukları, toplam video, izlenen video ve kalan saat istatistiği.
- **SaaS Veri Tablosu:**
  - Kolonlar: `Ders`, `Video No`, `Başlık`, `Eğitmen`, `Süre`, `Durum`, `Eylem`.
  - Filtreleme: Ders seçimi (Türkçe, Tarih, Matematik vb.), Tamamlanma durumu (Tümü / Tamamlananlar / Kalanlar).
  - Tablo içi arama girdisi: Türkçe karakter duyarlı anlık filtreleme.

### 4.4. Görünüm 4: Veri & Ayarlar
- **JSON Dışa Aktarma:** Tek tıkla `yks_2027_yedek_[tarih].json` indirme.
- **JSON İçe Aktarma:** Sürükle-bırak veya dosya seçici ile ilerlemeyi geri yükleme (şema doğrulamalı).
- **İlerleme Sıfırlama:** Çift onaylı yerel veriyi temizleme seçeneği.

---

## 5. Tasarım Dili ve Tipografi Kuralları (`/impeccable`)

- **Palet (Slate & Emerald/Mint):**
  - Arka Plan: `#f8fafc` (Canvas), `#ffffff` (Yüzeyler), `#0f172a` (Sidebar & Vurgular).
  - Kenarlıklar: `#e2e8f0` (Hafif), `#cbd5e1` (Belirgin).
  - Vurgu Rengi: `#10b981` (Mint/Emerald), hover: `#059669`.
  - Metin: `#0f172a` (Birincil), `#475569` (İkincil), `#94a3b8` (Muted).
- **Yasaklar (Absolute Bans):**
  - Kart içinde kart yuvalama (Cardocalypse) yasaktır.
  - Kartların soluna dikey 4px renk şeridi (`border-left`) koymak yasaktır.
  - Gradyan metin yasaktır.
  - Gereksiz glassmorphism veya yapay 3D gölgeler yasaktır.
- **Tipografi:** Sistem sans-serif font ailesi (`system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif`). Sayısal sayaçlarda ve KPI değerlerinde `font-variant-numeric: tabular-nums`.

---

## 6. Teknik Mimari ve Kod Organizasyonu

- **Teknoloji:** Sıkı TypeScript 5 modülleri (`src/web/`).
- **Sıfır Dış UI Bağımlılığı:** React/Vue/Angular gibi ağır bağımlılıklar olmadan, saf TypeScript controller ve DOM motoru ile 0 milisaniye açılış süresi.
- **Dosya Dağılımı:**
  - `src/web/types.ts`: Domain ve UI modelleri.
  - `src/web/shift_engine.ts`: 42 haftalık kaydırma algoritması.
  - `src/web/timer.ts`: Web Audio mola sayacı.
  - `src/web/storage.ts`: Kalıcılık ve yedekleme yönetimi.
  - `src/web/saas_view.ts`: Masaüstü SaaS bileşenlerinin oluşturulması ve render motoru.
  - `src/web/app.ts`: Global uygulama yöneticisi, arama paleti ve klavye kısayolları.
  - `src/generate_saas_app.js`: Tüm TypeScript derlemesini, HTML/CSS şablonunu ve 766 videoluk veri tabanını `www/index.html` olarak üreten derleyici script.
- **Geriye Dönük Uyumluluk:**
  - Android projesindeki `android/` klasörü bu modern web çıktısı ile senkronize kalabilir.
  - PWA offline özellikleri (`manifest.json`, `sw.js`) korunur.

---

## 7. Doğrulama ve Test Kriterleri

1. **Birim & Entegrasyon Testleri:**
   - Masaüstü SaaS layout öğelerinin varlığı (Sidebar, Top Command Bar, 2-column Studio, Data Table).
   - `Ctrl+K` arama paleti ve klavye kısayollarının doğrulanması.
   - Entegre mola sayacı ve D5/A5 ses frekanslarının doğrulanması.
   - Stress-Free Shift Engine'in masaüstü arayüzünde hatasız çalışması.
   - JSON içe/dışa aktarma ve veri kalıcılığı testleri.
2. **TypeScript Tip Denetimi:** `npm run typecheck` (`tsc --noEmit`) 0 hata.
3. **Canlı Sunucu Doğrulaması:** `npm run serve` ile `http://localhost:3000` ve `http://192.168.1.40:3000` üzerinden HTTP 200 yanıtı ve anında yükleme.
