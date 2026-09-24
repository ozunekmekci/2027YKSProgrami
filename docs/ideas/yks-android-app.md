# YKS 2027 Android Companion App

## Problem Statement
Ders çalışmayı sevmeyen bir YKS öğrencisinin, telefonundan 4 blok + 20 dk mola akışını tek dokunuşla yönetebilmesi, kaçırılan günlerde takvimin otomatik kayarak "geride kaldım" stresi yaratmaması ve 19 Haziran 2027 hedefine doğru ilerlemesini cebinden kolayca takip edebilmesi.

## Recommended Direction (Capacitor Android Native)
Uygulamayı modern web teknolojileri (HTML5/CSS3/ESM) ve **Capacitor 7** ile yerel bir Android uygulaması olarak inşa ediyoruz.
Bu mimari:
1. Halihazırda doğrulanmış 766 videoluk veri kümesini ve matematiksel takvim motorunu (`calendar_engine.js`) doğrudan kullanır.
2. Android'in yerel donanım yeteneklerini (Titreşim/Haptics, Yerel Bildirimler, Çevrimdışı Depolama) etkinleştirir.
3. Tam bir `android/` klasörü üreterek hem Android Studio üzerinden tek tıkla telefona yüklenebilir hem de `./gradlew assembleDebug` ile doğrudan `.apk` çıktısı verir.

## Key Assumptions to Validate
- [x] **Mola Ergonomisi:** Öğrenci telefon cebindeyken 20 dakikalık mola bittiğinde sesli ve titreşimli uyarıyı net şekilde algılayabilmeli.
- [x] **Stress-Free Kaydırma:** Aksayan günlerin videoları bir sonraki çalışma gününe kaydırıldığında 19 Haziran 2027 hedef tarihiyle uyumlu kalmalı.
- [x] **Çevrimdışı Çalışma:** İnternet olmasa dahi ders programı, mola sayacı ve geçmiş kayıtlar çalışmalı (yalnızca YouTube videosunu izlemek için internete ihtiyaç duyar).

## MVP Scope (Neler Var)
- **Ekran 1 (Bugün):**
  - Bugünün 4 video bloğu (Ders, Eğitmen, Süre, Konu Adı).
  - Tek dokunuşla YouTube uygulamasında başlatma.
  - 20 dakikalık interaktif mola sayacı (Haptics titreşim + Web Audio çift tonlu melodi).
  - Pazar günleri "ÇALIŞMAK KESİNLİKLE YASAK!" zihinsel dinlenme kilit ekranı.
- **Ekran 2 (Gelecek & Geçmiş Radarı):**
  - Hafta hafta akış ve nerede olunduğunu gösteren dinamik ajanda.
  - Otomatik kaydırma mekanizmasıyla kaçırılan günlerin stressiz telafisi.
  - 19 Haziran 2027 hedef sayacı ve tahmini bitiş tarihi.
- **Ekran 3 (Müfredat & Arama):**
  - 9 dersin tek tek ilerleme yüzdeleri ve kalan video sayıları.
  - 766 videoda anlık Türkçe karakter destekli konu arama.
  - İlerlemeyi JSON olarak dışa aktarma / geri yükleme (yedekleme).
- **Android Projesi:**
  - `capacitor.config.json`
  - Yerel `android/` projesi (Gradle, AndroidManifest, Native WebView köprüsü).

## Not Doing (Kapsam Dışı - Odaklanma Amacıyla)
- **Karmaşık Sosyal Özellikler / Liderlik Tablosu:** Öğrencinin dikkatini dağıtır ve kıyaslama stresi yaratır; uygulama öğrencinin kendi ritmine odaklanır.
- **PDF / Ağır Dosya Yükleme:** Sadece video blokları ve mola yönetimine odaklanılır.
- **Kayıt Olma / Giriş Yapma Zorunluluğu:** Sıfır sürtünme; uygulama açıldığı anda kullanıcı adı/şifre sormadan doğrudan çalışır.

## Open Questions
- Telefona doğrudan USB ile yüklemek için `adb` veya Android Studio mu kullanılacak, yoksa doğrudan `.apk` dosyası mı üretilsin? (Her ikisi de desteklenecek şekilde Android Studio proje yapısı oluşturulacak).
