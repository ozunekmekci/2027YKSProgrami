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

## Kurulum ve Geliştirici Kılavuzu

Proje Node.js tabanlı otomasyon araçlarına sahiptir. Dosyaları sıfırdan derlemek veya testleri yürütmek için:

### Gereksinimler
- Node.js (v18 veya üzeri önerilir)
- npm

### Adımlar

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Test paketini çalıştırın:
   ```bash
   npm test
   ```
   *15 otomatik test veri bütünlüğünü, takvim dağıtımını, Excel şablonlarını ve HTML arayüzünü doğrular.*

3. Excel çalışma kitabını yeniden oluşturun:
   ```bash
   npm run build
   ```
   *`YKS_2027_Calisma_Programi.xlsx` dosyası tüm formüller, stiller ve ad alanlarıyla birlikte üretilir.*

4. HTML takip panosunu yeniden oluşturun:
   ```bash
   node src/generate_dashboard.js
   ```
   *`yks_dashboard.html` dosyası güncellenir.*

---

## Dosya Yapısı

```
.
├── YKS_2027_Calisma_Programi.xlsx   # Üretilen 3 sayfalı hazır Excel çalışma kitabı
├── yks_dashboard.html               # Tek dosyalık çevrimdışı HTML çalışma asistanı
├── playlists_data_tr.json           # 9 oynatma listesi ve 766 videoluk doğrulanmış veri seti
├── PRODUCT.md                       # Ürün tasarım ilkeleri ve pedagojik hedefler
├── README.md                        # Kullanım kılavuzu ve teknik dökümantasyon
├── package.json                     # Proje konfigürasyonu ve test scriptleri
├── src/
│   ├── calendar_engine.js           # 42 haftalık kronolojik blok dağıtım algoritması
│   ├── build_excel.js               # ExcelJS tabanlı çok sayfalı XLSX üreticisi
│   └── generate_dashboard.js        # Standalone HTML dashboard derleyicisi
└── tests/
    ├── test_data_integrity.test.js  # 766 video ve oynatma listesi veri doğrulama testi
    ├── calendar_engine.test.js      # Takvim mantığı, geçişler ve blok bütünlüğü testleri
    ├── excel_generation.test.js     # Excel çalışma sayfaları, formüller ve aralık testleri
    └── dashboard_generation.test.js # HTML dashboard, sayaç, LocalStorage ve stil testleri
```

---

## Başarılar!

Bu program, disiplinli ve yormayan bir ritimle sizi hedefinize ulaştırmak için tasarlandı. Unutmayın: Günde 4 blok, düzenli molalar ve pazar günleri dinlenmek başarının sırrıdır. 2027 YKS yolculuğunuzda şimdiden üstün başarılar!
