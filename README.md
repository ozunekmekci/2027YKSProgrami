# YKS 2027 Çalışma Programı & Dijital Çalışma Asistanı

Sıfırdan başlayan ("temelim hiç yok" diyen), Eşit Ağırlık (EA) ve Sözel hedefleri olan öğrenciler için özel olarak tasarlanmış, tükenmişlik (burnout) riskini önleyen ve bilişsel yükü ortadan kaldıran kapsamlı YKS 2027 hazırlık sistemi.

Bu proje, Türkiye'nin önde gelen eğitim kanallarından özenle seçilmiş **9 oynatma listesi**, **766 video** ve yaklaşık **444 saatlik** video müfredatını; etkileşimli bir Excel çalışma kitabı (`YKS_2027_Calisma_Programi.xlsx`) ve internet bağlantısı olmadan da çalışan modern bir HTML takip panosu (`yks_dashboard.html`) halinde sunar.

---

## Sistemin Temel İlkeleri

1. **Günde 4 Blok Kuralı (1 Blok = 1 Video)**
   - Her çalışma günü tam 4 bloktan oluşur. Her blokta yalnızca 1 video izlenir.
   - "Bugün ne çalışsam?", "Hangi videodaydım?" gibi karar yorgunlukları tamamen elenmiştir. Sıradaki video her zaman bellidir.
2. **20 Dakikalık Zorunlu Mola Ritmi**
   - Her blok sonrasında 20 dakika ara verilir.
   - Bilimsel aralıklı öğrenme (*spaced learning*) ilkelerine uygun olarak zihnin bilgiyi pekiştirmesi ve odaklanmanın korunması sağlanır.
3. **Pazar Günü Dinlenme (Çalışmak Kesinlikle Yasak!)**
   - Pazar günleri programda kırmızı uyarı bandıyla işaretlenmiştir ve ders çalışılmaz.
   - Beyin dinlenmeden ve uyku döngüleri tamamlanmadan öğrenme uzun süreli hafızaya aktarılamaz. Haftada bir gün tam dinlenme, 42 haftalık maratonu tükenmeden bitirmenin anahtarıdır.
4. **Saniyesine Kadar Gerçek Süreler**
   - Tahmini veya soyut çalışma süreleri yerine YouTube API üzerinden doğrulanmış gerçek video süreleri kullanılmıştır.
5. **Hedef: 19 Haziran 2027 Öncesi Tam Hazırlık**
   - 42 haftalık dengeli takvim sayesinde müfredat sınav tarihinden aylar önce biter; kalan süre deneme ve genel tekrarlara ayrılır.

---

## Müfredat ve Oynatma Listeleri Özeti

Tüm videolar alanında yetkin eğitmenlerin güncel ve tam kapsamlı oynatma listelerinden derlenmiştir:

| Ders | Eğitmen & Kanal | Video Sayısı | Toplam Süre | Ort. Video | Haftalık Plan |
|---|---|---|---|---|---|
| **TYT Türkçe** | Aker Kartal *(Retro Yayıncılık)* | 71 | ~23,1 saat | ~19,5 dk | Pazartesi (2 video) |
| **TYT-AYT Tarih** | Mehmet Celal Özyıldız *(Retro Yayıncılık)* | 166 | ~101,6 saat | ~36,7 dk | Salı (2) + Cumartesi (2) |
| **TYT Matematik** | Selim Yüksel *(Bıyıklı Matematik)* | 118 | ~88,1 saat | ~44,8 dk | Salı (2) + Perşembe (2) |
| **TYT Coğrafya** | Yunus Hoca *(Coğrafyanın Kodları)* | 60 | ~36,0 saat | ~36,0 dk | Pazartesi (2 video) |
| **AYT Coğrafya** | Yunus Hoca *(Coğrafyanın Kodları)* | 54 | ~32,9 saat | ~36,5 dk | Cuma (Edebiyat bitince 2 video) |
| **TYT Biyoloji** | Semih Hoca *(Biosem)* | 80 | ~41,8 saat | ~31,3 dk | Çarşamba (2) + Cumartesi (2) |
| **TYT Fizik** | Altuğ Güneş *(Fizikfinito)* | 76 | ~51,7 saat | ~40,8 dk | Cuma (2 video) |
| **TYT Kimya** | Mesut Hoca *(Meschemy Kimya)* | 79 | ~32,3 saat | ~24,6 dk | Perşembe (2 video) |
| **AYT Edebiyat** | Deniz Hoca *(Deniz Hoca)* | 62 | ~36,3 saat | ~35,2 dk | Çarşamba (2) + Cuma (2) |
| **TOPLAM** | **9 Oynatma Listesi** | **766 Video** | **~444 Saat** | **~34,8 dk** | **Haftada 24 Blok** |

> *Not:* İlk planlamadaki 746 sayısı matematiksel bir yazım hatası olup, 9 oynatma listesindeki güncel ve eksiksiz video sayısı tam **766 adettir**. Sistemde hiçbir konu veya video atlanmamıştır.

---

## Haftalık Dağılım Çizelgesi

- **Pazartesi:** TYT Türkçe (2 video) + TYT Coğrafya (2 video)
- **Salı:** TYT Matematik (2 video) + TYT-AYT Tarih (2 video)
- **Çarşamba:** TYT Biyoloji (2 video) + AYT Edebiyat (2 video)
- **Perşembe:** TYT Matematik (2 video) + TYT Kimya (2 video)
- **Cuma:** TYT Fizik (2 video) + AYT Edebiyat (Deniz Hoca 16. haftada bitince AYT Coğrafya'ya geçer)
- **Cumartesi:** TYT-AYT Tarih (2 video) + TYT Biyoloji (Biosem 21. haftada bitince tekrar/soru çözümüne geçer)
- **Pazar:** **DİNLENME GÜNÜ — ÇALIŞMAK KESİNLİKLE YASAK!**

---

## Excel Çalışma Kitabı Kullanımı (`YKS_2027_Calisma_Programi.xlsx`)

Çalışma kitabı Microsoft Excel, LibreOffice Calc veya Google E-Tablolar ile tam uyumludur. Kitap 3 ana sayfadan oluşur:

### 1. Sayfa: "Hazır YKS Kamp Takvimi"
Hemen çalışmaya başlamak isteyenler için 42 haftanın tamamı gün gün, blok blok dizilmiştir.
- **Canlı KPI Gösterge Paneli:** Sayfanın en üstünde izlenen video sayısı, kalan video sayısı, toplam çalışma süresi ve genel ilerleme yüzdesi formüllerle canlı hesaplanır.
- **Doğrudan Video Bağlantıları:** Her ders bloğundaki "Videoyu Aç" bağlantısına tıklayarak ilgili YouTube videosuna doğrudan gidebilirsiniz.
- **20 Dakikalık Mola Satırları:** Her blok arasına yerleştirilmiş amber renkli mola satırları gün içindeki dinlenme disiplinini hatırlatır.
- **Tamamlandı İşareti:** İlgili satırdaki Durum hücresine `X` yazdığınızda satır otomatik olarak açık nane yeşiline döner ve üst paneldeki sayaçlar anında güncellenir.
- **Pazar Dinlenme Bandı:** Her haftanın Pazar günü kırmızı dinlenme uyarısıyla ayrılmıştır.

### 2. Sayfa: "Dinamik Haftalık Planlayıcı"
Kendi haftalık çalışma programını esnek bir şekilde düzenlemek isteyen öğrenciler için tasarlanmıştır.
- **Bağımlı Açılır Listeler (Dropdowns):**
  1. `Ders Seçimi` sütunundan çalışmak istediğiniz dersi seçin (Örn: "TYT Matematik").
  2. `Video / Konu Adı` sütunundaki açılır liste otomatik filtrelenir ve yalnızca o dersin videolarını listeler.
- **Otomatik Süre Hesaplama:** Video seçildiğinde `VLOOKUP` formülü devreye girer ve Veri Bankası'ndan videonun net süresini dakika cinsinden anında çeker.
- **Toplam Süre Sayaçları:** Sayfanın altındaki formüller gün veya hafta boyunca kaç dakika ders çalışıldığını ve kaç dakika mola verildiğini otomatik toplar.

### 3. Sayfa: "Veri Bankası"
Programın arka planındaki 766 videoluk ana veritabanıdır.
- Her videonun sıra numarası, ders adı, konu başlığı, eğitmeni, net süresi (dakika ve saniye) ve YouTube bağlantısı yer alır.
- Excel ad yöneticisi (`Ders_Listesi` ve ders bazlı aralıklar) bu sayfadaki dinamik aralıkları kullanarak açılır listeleri besler.

---

## Web Tabanlı Dijital Takip Panosu (`yks_dashboard.html`)

Excel'e alternatif veya masaüstünde video izlerken yan sekmede açık tutabileceğiniz modern, tek dosyalık interaktif bir web asistanıdır.

### Özellikler ve Kullanım
- **Sıfır Kurulum, Çevrimdışı Çalışma:** `yks_dashboard.html` dosyasını tarayıcınıza (Chrome, Firefox, Edge, Safari) sürükleyip bırakmanız veya çift tıklamanız yeterlidir. İnternet olmadan da tüm arayüz, sayaç ve filtreler çalışır (yalnızca YouTube videolarını oynatmak için internet gerekir).
- **Entegre 20 Dakikalık Mola Sayacı:**
  - Her blok bitiminde "☕ 20 dk Mola Başlat" butonuna tıklayarak sayacı çalıştırabilirsiniz.
  - Sayaç ekranın sağ alt köşesinde yüzen bir kart olarak geri sayar; istendiğinde küçültülebilir.
  - Tarayıcı sekme başlığında anlık kalan süre gösterilir (`(18:42) ☕ Mola Devam Ediyor...`).
  - Mola bittiğinde **Web Audio API** ile sentezlenen iki tonlu hoş bir zil sesi (D5 → A5) çalarak sizi uyarır. Dışarıdan ses dosyası yüklemesi gerekmez.
- **Kalıcı İlerleme (LocalStorage):**
  - Videoların yanındaki kutucukları işaretlediğinizde durumunuz tarayıcınızın yerel hafızasına kaydedilir. Sayfayı yenileseniz veya bilgisayarı yeniden başlatsanız dahi ilerlemeniz kaybolmaz.
- **Canlı İlerleme Çubukları & KPI:**
  - Üst kısımda genel tamamlama oranı (%), izlenen/kalan video sayıları ve toplam harcanan zaman gösterilir.
  - "Ders İlerleme Durumu" bölümünden 9 dersin her birinin yüzde kaç bittiğini tek tek görebilirsiniz.
- **Akıllı Arama ve Konu Filtresi:**
  - Sayfa başındaki arama çubuğuna konu adı, eğitmen veya video başlığı yazarak aradığınız konunun hangi haftada olduğunu anında bulabilir, "Haftaya Git" butonuyla doğrudan o haftaya zıplayabilirsiniz. Türkçe karakterleri (`ı-i`, `ş-s`, `ç-c` vb.) tam destekler.

---

## Duyarlı Web & PWA Sürümü (Desktop, Tablet & Mobil)

Mobil uygulamanın yanı sıra, masaüstü geniş ekranlar, dizüstü bilgisayarlar ve tabletler için optimize edilmiş tam teşekküllü ve duyarlı bir **Aşamalı Web Uygulaması (PWA - Progressive Web App)** sürümü sunulmaktadır.

### Temel Özellikler

1. **Duyarlı (Responsive) Çok Panelli Tasarım:**
   - **Masaüstü & Geniş Ekranlar (`>= 1024px`):** İki panelli geniş ekran arayüzü sunar; sol tarafta haftalık takvim seçici ve hızlı aksiyonlar, sağ tarafta seçili günün 4 çalışma bloğu ve mola kartları yer alır.
   - **Tablet & Mobil (`< 1024px`):** Alt navigasyon barı (Bottom Navigation) ve dokunmatik optimize kaydırma deneyimiyle tek elle kolay kullanım sağlar.

2. **Çevrimdışı Çalışma (Offline-First) & Service Worker:**
   - `www/sw.js` Servis Çalışanı, uygulamanın çekirdek varlıklarını (`index.html`, `manifest.json`, SVG ikonlar) yerel önbelleğe (Cache Storage) kaydeder.
   - İnternet bağlantınız kopsa veya çevrimdışı olsanız dahi çalışma takviminiz, mola sayacınız, müfredat arama motorunuz ve kayıtlı ilerlemeniz kesintisiz çalışmaya devam eder.

3. **Doğrudan Yeni Sekmede YouTube Oynatma:**
   - Masaüstü ve web ortamında "YouTube'da İzle" butonuna tıklandığında, video güvenli bir şekilde yeni tarayıcı sekmesinde (`window.open(url, '_blank', 'noopener,noreferrer')`) açılır. Böylece çalışma panonuz ve mola sayacınız arka planda kapanmadan akmaya devam eder.
   - Android Capacitor ortamında ise yerel YouTube uygulaması derin bağlantıyla (`vnd.youtube:`) tetiklenir.

4. **Stress-Free Shift Engine (Kayıpsız Telafi Motoru):**
   - Beklenmeyen aksamalar, hastalık veya tatillerde programdan kopmayı önler.
   - Henüz izlenmemiş olan tüm ders bloklarını, konuların ve derslerin pedagojik sırasını kesinlikle bozmadan bugünden itibaren sonraki çalışma günlerine dengeli şekilde yeniden dağıtır.
   - Öğrenciye başarısızlık hissi yaşatmaz; takvimi güncel gerçeğe göre sıfırlar.

5. **TypeScript Tabanlı Sağlam Mimari:**
   - Web ve PWA çekirdeği katı modda (`strict: true`) yapılandırılmış TypeScript modülleri (`src/web/`) ile inşa edilmiştir:
     - `types.ts`: Tüm veri modelleri, takvim ve oynatma listesi arayüz sözleşmeleri.
     - `shift_engine.ts`: Telafi ve blok kaydırma algoritması.
     - `timer.ts`: Web Audio API tabanlı 20 dakikalık mola sayacı ve D5-A5 çift tonlu zil motoru.
     - `storage.ts`: LocalStorage kalıcılığı, JSON veri yedekleme ve doğrulama mekanizması.
     - `app.ts`: Etkileşim kontrolcüsü, sekme ve PWA yükleme yönetimi.

---

### PWA Olarak Yükleme Kılavuzu

Uygulamayı tarayıcı sekmelerinden bağımsız, yerel bir masaüstü veya mobil uygulama gibi penceresiz (standalone) kullanabilirsiniz:

- **Masaüstü (Google Chrome & Microsoft Edge):**
  1. `http://localhost:3000` (veya canlı sunucu) adresini tarayıcınızda açın.
  2. Adres çubuğunun sağ tarafındaki **"Uygulamayı Yükle"** (monitör / indirme ikonu) simgesine tıklayın (veya tarayıcı menüsünden `Diğer Araçlar` > `Uygulama olarak yükle`).
  3. Açılan onay penceresinde "Yükle" butonuna basın. Uygulama bağımsız bir pencerede açılır ve masaüstünüze kısayol eklenir.

- **Mobil (iOS Safari):**
  1. Safari'de adresi açın.
  2. Alt kısımdaki **Paylaş** (kare ve yukarı ok) simgesine dokunun.
  3. Menüden **"Ana Ekrana Ekle"** seçeneğini seçin ve "Ekle" butonuna basın.

- **Mobil (Android Chrome):**
  1. Chrome'da adresi açın.
  2. Ekranın altındaki "YKS 2027 Koçu Ana Ekrana Ekle" başlığına dokunun veya sağ üstteki üç noktaya basıp **"Uygulamayı Yükle"** deyin.

---

## Android Mobil Uygulaması ("YKS 2027 Koçu")

Öğrencinin çalışma programını cebinde taşıyabilmesi, YouTube videolarını tek dokunuşla doğrudan YouTube uygulamasında açabilmesi, mola saatlerinde telefon titreşimiyle uyarılması ve aksayan günlerde sıfır stresle programı kaydırabilmesi için **Capacitor 7** ve **Material Design 3** standartlarında yerel bir Android mobil uygulaması geliştirilmiştir.

### Ekranlar ve Temel Özellikler

1. **Bugün Sekmesi (Günün 4 Bloğu & Mola Asistanı):**
   - Aktif haftanın seçili günündeki 4 video bloğunu kartlar halinde sunar.
   - Her blokta konu adı, eğitmen, tahmini süre ve nane yeşili durum kutucuğu yer alır.
   - **Doğrudan YouTube Açma:** "YouTube'da İzle" butonuna dokunulduğunda doğrudan telefondaki YouTube uygulamasını derin bağlantıyla (`vnd.youtube:VIDEO_ID`) açar; uygulama yoksa web tarayıcısına yumuşak geçiş yapar.
   - **Haptik Titreşimli 20 Dk Mola Sayacı:** Blok aralarındaki mola kartları Capacitor Haptics motorunu tetikler. Mola başladığında ve bittiğinde telefon titreşir, Web Audio API çift tonlu zil sesi (D5 → A5) çalar.
   - **Pazar Koruma Kalkanı:** Pazar günleri ekran otomatik olarak kırmızı dinlenme kartına bürünür ve öğrenciyi zihnini dinlendirmeye zorlar.

2. **Radar Sekmesi (Gelecek & Geçmiş + Stress-Free Shift Engine):**
   - 42 haftalık maratonun tüm haftalarını akordiyon kartlar halinde listeler. Geçmişte kaç video izlendiğini, gelecekte hangi konuların geleceğini şeffafça gösterir.
   - **19 Haziran 2027 Geri Sayımı:** Sınav gününe kaç gün, kaç saat kaldığını anlık gösterir.
   - **Stress-Free Shift Engine (Programı Bugüne Göre Güncelle):** Hastalık, motivasyon düşüklüğü veya beklenmeyen durumlarda bir ya da birkaç gün çalışılamadığında öğrenciyi suçlu hissettirmez. Tek dokunuşla henüz izlenmemiş tüm videoları kronolojik sırasını hiç bozmadan bugünden itibaren 4 blokluk günlere yeniden dağıtır.

3. **Müfredat & Arama Sekmesi:**
   - 9 dersin bağımsız ilerleme çubukları (TYT Türkçe, TYT Matematik vb.).
   - Türkçe arama desteği (`toLocaleLowerCase('tr-TR')`): Konu veya eğitmen arandığında tüm müfredat taranır ve aranan video tek dokunuşla izlenebilir.
   - **JSON Yedekleme & Geri Yükleme:** İlerleme verilerini (`yks_2027_ilerleme_yedek.json`) tek tıkla dışa aktarabilir veya başka bir cihaza yükleyebilirsiniz.

---

## Kurulum ve Geliştirici Kılavuzu

Proje Node.js ve Capacitor 7 tabanlı otomasyon araçlarına sahiptir:

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm
- Android Studio & JDK 17 (Mobil derlemeler ve APK üretimi için)

### Komutlar ve Kullanım

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Yerel PWA Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run serve
   ```
   *Sıfır bağımlılıklı yerel HTTP sunucusu `http://localhost:3000` adresinde başlar; statik PWA varlıklarını ve Service Worker başlıklarını (`Service-Worker-Allowed: /`) eksiksiz sunar.*

3. **TypeScript Statik Tip Kontrolünü Çalıştırın:**
   ```bash
   npm run typecheck
   ```
   *`tsc --noEmit` komutuyla `src/web/` altındaki tüm TypeScript modüllerini katı kurallarla (`strict: true`) tip kontrolünden geçirir.*

4. **Tüm Test Paketini Çalıştırın:**
   ```bash
   npm test
   ```
   *77 otomatik birim testi veri bütünlüğünü, takvim motorunu, Excel sayfalarını, HTML takip panosunu, mobil uygulamayı, PWA altyapısını ve yerel geliştirme sunucusunu doğrular.*

5. **Web ve Mobil Varlıklarını Derleyin:**
   ```bash
   npm run build:web       # Yalnızca www/index.html web/PWA paketini derler
   npm run build:mobile    # www/index.html derler ve Capacitor ile Android'e senkronlar
   npm run build:all       # Excel, Web ve Mobil tüm varlıkları tek seferde derler
   ```

6. **Android Studio'da Projeyi Açın:**
   ```bash
   npx cap open android
   ```
   *Proje Android Studio'da açılır; emulator veya fiziksel cihazda tek tıkla (Run 'app') çalıştırılabilir.*

7. **Komut Satırından Debug APK Derleyin:**
   ```bash
   cd android && ./gradlew assembleDebug
   ```
   *Üretilen APK konumu: `android/app/build/outputs/apk/debug/app-debug.apk`.*

8. **Excel Çalışma Kitabını Yeniden Oluşturun:**
   ```bash
   npm run build:excel
   ```
   *`YKS_2027_Calisma_Programi.xlsx` dosyası üretilir.*

---

## Dosya Yapısı

```
.
├── YKS_2027_Calisma_Programi.xlsx   # Üretilen 3 sayfalı hazır Excel çalışma kitabı
├── yks_dashboard.html               # Tek dosyalık çevrimdışı masaüstü HTML çalışma asistanı
├── playlists_data_tr.json           # 9 oynatma listesi ve 766 videoluk doğrulanmış veri seti
├── capacitor.config.json            # Capacitor 7 Android konfigürasyonu (com.yks.planner)
├── tsconfig.json                    # TypeScript derleyici yapılandırması (ES2022 / ESNext)
├── PRODUCT.md                       # Ürün tasarım ilkeleri ve pedagojik hedefler
├── README.md                        # Kullanım kılavuzu ve teknik dökümantasyon
├── package.json                     # Proje konfigürasyonu, bağımlılıklar ve test scriptleri
├── android/                         # Yerel Android Studio & Gradle projesi
│   ├── app/src/main/AndroidManifest.xml # İzinler (INTERNET, VIBRATE) ve launcher aktivitesi
│   ├── app/build.gradle             # Android SDK 35, applicationId ve bağımlılıklar
│   └── gradlew                      # Linux/macOS Gradle derleme wrapper'ı
├── www/                             # Mobil ve PWA web dağıtım paketi
│   ├── index.html                   # Material 3 & Responsive Web asistanı (766 video gömülü)
│   ├── manifest.json                # PWA Web App Manifest yapılandırması
│   ├── sw.js                        # Offline-first Service Worker önbellekleme motoru
│   └── icons/                       # PWA vektörel SVG uygulama ikonları (192x192, 512x512)
├── src/
│   ├── calendar_engine.js           # 42 haftalık kronolojik blok dağıtım algoritması
│   ├── build_excel.js               # ExcelJS tabanlı çok sayfalı XLSX üreticisi
│   ├── generate_dashboard.js        # Standalone masaüstü HTML dashboard derleyicisi
│   ├── generate_mobile_app.js       # Material 3 mobil/web uygulama üreticisi & derleyicisi
│   ├── serve_web.js                 # Sıfır bağımlılıklı yerel statik PWA dev sunucusu
│   └── web/                         # Modüler TypeScript Web & PWA mimarisi
│       ├── types.ts                 # Domain arayüzleri ve veri tipi sözleşmeleri
│       ├── shift_engine.ts          # Telafi ve blok kaydırma algoritması
│       ├── timer.ts                 # Web Audio API 20 dk mola sayacı ve çift tonlu zil
│       ├── storage.ts               # LocalStorage kalıcılığı ve JSON yedekleme/geri yükleme
│       └── app.ts                   # UI kontrolcüsü, sekme ve PWA yükleme yönetimi
└── tests/
    ├── test_data_integrity.test.js  # 766 video ve oynatma listesi veri doğrulama testi
    ├── calendar_engine.test.js      # Takvim mantığı, geçişler ve blok bütünlüğü testleri
    ├── excel_generation.test.js     # Excel çalışma sayfaları, formüller ve aralık testleri
    ├── dashboard_generation.test.js # Masaüstü HTML dashboard, sayaç ve stil testleri
    ├── test_capacitor_setup.test.js # Capacitor paketleri ve konfigürasyon testi
    ├── mobile_app.test.js           # Mobil arayüz, Shift Motoru, 3 sekme ve Impeccable testleri
    ├── android_project.test.js      # Android izinleri, Gradle ve varlık senkronizasyon testleri
    ├── ts_types_and_setup.test.js   # TypeScript kurulumu ve domain tip sözleşmeleri testi
    ├── ts_core_modules.test.js      # TypeScript motor modülleri (shift, timer, storage) testi
    ├── pwa_infrastructure.test.js   # Manifest, SVG ikonlar ve Service Worker testleri
    ├── web_responsive_app.test.js   # Masaüstü/mobil responsive düzen ve app.ts testleri
    └── serve_web.test.js            # Yerel PWA dev sunucusu ve statik dosya sunumu testi
```

---

## Başarılar!

Bu program, disiplinli ve yormayan bir ritimle sizi hedefinize ulaştırmak için tasarlandı. Unutmayın: Günde 4 blok, düzenli molalar ve pazar günleri dinlenmek başarının sırrıdır. 2027 YKS yolculuğunuzda şimdiden üstün başarılar!
