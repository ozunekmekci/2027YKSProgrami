# Tasarım Spesifikasyonu: Çok Şeritli İnteraktif Gantt Matrisi & Müfredat Projeksiyon Motoru

**Tarih:** 26 Eylül 2026  
**Durum:** Onaylandı / İnceleme Bekliyor  
**Kapsam:** YKS 2027 Çalışma Programı V2 (Gelecek Projeksiyonu & Ünite Yol Haritası)  
**Tasarım İlkeleri:** Diagram Design (Gantt Çizelgesi) & Impeccable UI Craft (Sıfır Emoji, Editoryal Renk Paleti, tabular-nums)

---

## 1. Problem Tanımı ve Kullanıcı İhtiyacı

YKS maratonuna hazırlanan öğrencinin en kritik motivasyon ve planlama ihtiyacı, çalıştığı konuların **ne zaman biteceğini** ve **tüm müfredatın sınav tarihinden (19 Haziran 2027) ne kadar önce tamamlanacağını** net takvim tarihleriyle görmektir:
- Öğrenci, "Tarih çalışıyorum ama Osmanlı Devleti ünitesi tam olarak hangi haftada ve hangi ayda bitecek?", "Ses Bilgisi ne zaman tamamlanıp Paragraf'a ne zaman geçeceğim?", "Tüm Matematik konuları sınavdan önce yetişiyor mu?" gibi sorulara anında ve dinamik olarak yanıt bulabilmelidir.
- Bir ders veya gün aksadığında ve telafi motoru (Shift Engine) çalıştığında, bu projeksiyon gerçeğe uygun şekilde dinamik olarak güncellenmelidir.

---

## 2. Sistem Mimarisi ve Bileşenler

Sistem 3 temel katmandan oluşur:

```
[Müfredat Verisi (766 Video)] + [Ünite Sözlüğü (curriculum_units.json)]
                          │
                          ▼
            [Projeksiyon Motoru (projection_engine.ts)]
                          │  (Takvim Motoru + LocalStorage İlerlemesi)
                          ▼
        [Çok Şeritli İnteraktif Gantt Matrisi (UI)]
   (Üst KPI Paneli + Zaman Cetveli + Ders Şeritleri + Ünite Detay Çekmecesi)
```

### 2.1. Ünite Sözlüğü Modeli (`src/data/curriculum_units.json`)

Müfredattaki 9 dersin 766 videosu pedagojik ve ÖSYM ünite standartlarına göre bölünür. Her ünite; ders adı, ünite kimliği, başlık ve başlangıç-bitiş video sıra numaralarını (`startVideo`, `endVideo`) içerir:

1. **TYT-AYT Tarih (166 Video):**
   - Ünite 1: Tarih Bilimi ve İlk Türk Devletleri (#1 - #22)
   - Ünite 2: Klasik Çağda Osmanlı (Kuruluş ve Yükselme) (#23 - #45)
   - Ünite 3: Osmanlı Kültür ve Medeniyeti (#46 - #60)
   - Ünite 4: Değişim Çağında Osmanlı (Duraklama ve Gerileme) (#61 - #78)
   - Ünite 5: Osmanlı Dağılma Dönemi ve Islahatlar (#79 - #91)
   - Ünite 6: XX. Yüzyıl Başlarında Osmanlı ve I. Dünya Savaşı (#92 - #106)
   - Ünite 7: Milli Mücadele ve Kurtuluş Savaşı (#107 - #128)
   - Ünite 8: Atatürk İlkeleri ve İnkılap Tarihi (#129 - #148)
   - Ünite 9: Çağdaş Türk ve Dünya Tarihi (#149 - #166)

2. **TYT Türkçe (71 Video):**
   - Ünite 1: Ses Bilgisi (#1 - #8)
   - Ünite 2: Yazım Kuralları (#9 - #16)
   - Ünite 3: Noktalama İşaretleri (#17 - #22)
   - Ünite 4: Sözcükte Yapı ve Ekler (#23 - #32)
   - Ünite 5: Sözcük Türleri (#33 - #42)
   - Ünite 6: Fiiller, Fiilimsiler ve Çatı (#43 - #47)
   - Ünite 7: Cümle Bilgisi ve Anlatım Bozuklukları (#48 - #54)
   - Ünite 8: Sözcükte ve Cümlede Anlam (#55 - #60)
   - Ünite 9: Paragrafta Anlam ve Taktikler (#61 - #71)

3. **TYT Matematik (118 Video):**
   - Ünite 1: Temel Kavramlar ve Sayı Kümeleri (#1 - #19)
   - Ünite 2: Bölme-Bölünebilme ve EBOB-EKOK (#20 - #28)
   - Ünite 3: Rasyonel Sayılar, 1. Dereceden Denklemler ve Eşitsizlikler (#29 - #39)
   - Ünite 4: Mutlak Değer, Üslü ve Köklü Sayılar (#40 - #51)
   - Ünite 5: Çarpanlara Ayırma ve Oran-Orantı (#52 - #57)
   - Ünite 6: Problemler Maratonu (#58 - #77)
   - Ünite 7: Mantık ve Kümeler (#78 - #86)
   - Ünite 8: Fonksiyonlar (#87 - #100)
   - Ünite 9: Veri, İstatistik ve Grafikler (#101 - #103)
   - Ünite 10: Sayma ve Olasılık (PKOB) (#104 - #118)

4. **TYT Coğrafya (60 Video):**
   - Ünite 1: Doğa, İnsan ve Coğrafyanın Gelişimi (#1 - #6)
   - Ünite 2: Atmosfer, Sıcaklık ve İklim Elemanları (#7 - #26)
   - Ünite 3: Yerin Şekillenmesi ve İç-Dış Kuvvetler (#27 - #44)
   - Ünite 4: Nüfus, Yerleşme ve Göç (#45 - #54)
   - Ünite 5: Coğrafi Konum ve Harita Bilgisi (#55 - #60)

5. **AYT Coğrafya (54 Video):**
   - Ünite 1: Ekosistem ve Madde Döngüleri (#1 - #7)
   - Ünite 2: Nüfus Politikaları ve Şehirlerin Fonksiyonları (#8 - #20)
   - Ünite 3: Türkiye Ekonomisi ve Sektörler (#21 - #38)
   - Ünite 4: Küresel Ticaret, Turizm ve Bölgeler (#39 - #50)
   - Ünite 5: Çevre, Toplum ve AYT Genel Tekrar (#51 - #54)

6. **TYT Fizik (76 Video):**
   - Ünite 1: Fizik Bilimine Giriş ve Madde Özellikleri (#1 - #12)
   - Ünite 2: Hareket ve Kuvvet (#13 - #24)
   - Ünite 3: İş, Güç, Enerji (#25 - #34)
   - Ünite 4: Isı, Sıcaklık ve Genleşme (#35 - #46)
   - Ünite 5: Elektrostatik, Elektrik Akımı ve Manyetizma (#47 - #60)
   - Ünite 6: Optik ve Dalgalar (#61 - #76)

7. **TYT Kimya (79 Video):**
   - Ünite 1: Kimya Bilimi (#1 - #8)
   - Ünite 2: Atom ve Periyodik Sistem (#9 - #22)
   - Ünite 3: Kimyasal Türler Arası Etkileşimler (#23 - #36)
   - Ünite 4: Maddenin Halleri (#37 - #48)
   - Ünite 5: Doğa ve Kimya (#49 - #52)
   - Ünite 6: Kimyanın Temel Kanunları ve Hesaplamalar (#53 - #66)
   - Ünite 7: Karışımlar, Asitler, Bazlar, Tuzlar ve Kimya Her Yerde (#67 - #79)

8. **TYT Biyoloji (80 Video):**
   - Ünite 1: Yaşam Bilimi Biyoloji ve Canlıların Temel Bileşenleri (#1 - #20)
   - Ünite 2: Hücre ve Organelleri (#21 - #36)
   - Ünite 3: Canlılar Dünyası ve Sınıflandırma (#37 - #48)
   - Ünite 4: Hücre Bölünmeleri ve Üreme (#49 - #60)
   - Ünite 5: Kalıtım ve Biyoteknoloji (#61 - #72)
   - Ünite 6: Ekosistem Ekolojisi ve Güncel Çevre Sorunları (#73 - #80)

9. **AYT Edebiyat (62 Video):**
   - Ünite 1: Edebiyat Bilimi ve Metinlerin Sınıflandırılması (#1 - #10)
   - Ünite 2: Şiir Bilgisi ve Edebi Sanatlar (#11 - #22)
   - Ünite 3: İslamiyet Öncesi ve Geçiş Dönemi Türk Edebiyatı (#23 - #28)
   - Ünite 4: Halk Edebiyatı ve Divan Edebiyatı (#29 - #42)
   - Ünite 5: Tanzimat, Servet-i Fünun ve Fecr-i Ati Edebiyatı (#43 - #52)
   - Ünite 6: Milli Edebiyat ve Cumhuriyet Dönemi Türk Edebiyatı (#53 - #62)

---

### 2.2. Projeksiyon Motoru Mantığı (`src/web/projection_engine.ts`)

Motor, `generateCalendarDays` fonksiyonundan çıkan 42 haftalık takvim çıktısını ve `localStorage` içindeki `completedVideos` haritasını tarar:

1. **Konum Belirleme:**
   - Her dersin videolarının takvimde hangi haftada (`weekNum`), hangi günde ve hangi takvim tarihinde (`dateIso`, `dateFormatted`) yer aldığını tespit eder.
2. **Ünite Projeksiyonu:**
   - Bir ünitenin ilk videosunun (`startVideo`) takvimdeki tarihi -> `startDate`, `startWeek`.
   - Bir ünitenin son videosunun (`endVideo`) takvimdeki tarihi -> `endDate`, `endWeek`.
   - Ünitedeki toplam video sayısı -> `totalVideos`.
   - İzlenen video sayısı -> `completedVideos`.
   - İlerleme oranı -> `progressPercent` (örn: `%35`).
   - Durum -> `status`:
     - `completed`: Tüm videolar izlenmiş.
     - `in_progress`: En az 1 video izlenmiş veya takvim haftası şu anki haftaya denk geliyor.
     - `upcoming`: Henüz başlanmamış.
3. **Ders Projeksiyonu:**
   - Dersin başlangıç tarihi ve genel bitiş tarihi (son videosunun tarihi).
   - 19 Haziran 2027 sınav tarihi ile farkı (`completesBeforeYks`: true/false, `weeksBeforeYks`: pozitif tam sayı).

---

## 3. Kullanıcı Arayüzü ve Diagram Tasarımı (Gantt Matrisi)

### 3.1. Navigasyon
- Masaüstü sol kenar çubuğunda ve üst navigasyonda:
  - "Stüdyo"
  - "Radar"
  - "Müfredat"
  - **"Yol Haritası"** (Yeni sekme: `#tab-projection`)
  - "Yönetim"

### 3.2. Üst KPI Özet Paneli
- **Genel Bitiş Projeksiyonu Kartı:**
  - "Hedef: Sınavdan 4 Hafta Önce Tamamlanıyor"
  - Bitiş Tarihi: `16 Temmuz 2027` veya güncel telafi durumuna göre hesaplanan tarih.
- **Aktif Ünite Odak Kartı:**
  - Öğrencinin takvimde şu an çalıştığı haftanın üniteleri (Örn: `TYT Türkçe - Ses Bilgisi: 3/8 video tamamlandı`).
- **Müfredat İlerleme Kartı:**
  - Toplam ünite sayısı ve tamamlanan ünite adedi (`tabular-nums`).

### 3.3. Gantt Diagram Matrisi (İnteraktif Zaman Çizelgesi)
- **Zaman Ekseni (Header):**
  - X koordinatı: 42 hafta (Hafta 1 ... Hafta 42).
  - Ay gruplamaları: Eylül 2026, Ekim 2026 ... Temmuz 2027.
- **Kılavuz Çizgileri:**
  - **Bugün / Aktif Hafta Göstergesi:** Dikey kesikli çizgi ile öğrencinin bulunduğu aktif haftayı vurgular.
  - **19 Haziran 2027 Sınav Göstergesi:** Kırmızımsı editoryal dikey çizgiyle YKS sınav gününü işaretler.
- **Ders Satırları ve Ünite Segmentleri:**
  - 9 ders için ayrı satırlar (satır yüksekliği 48px).
  - Sol kolon: Ders adı, eğitmen ve toplam ünite sayısı.
  - Sağ zaman alanı: Üniteler yatay segment blokları halinde yerleştirilir.
  - Genişlik formülü: `width = (endWeek - startWeek + 1) * pitch`.
- **Editoryal Renk Aileleri (Impeccable Uyumu):**
  - Tarih: Kehribar ve terrakotta tonları (`#b45309`, `#d97706`).
  - Türkçe: Zümrüt ve nane tonları (`#047857`, `#059669`).
  - Matematik: Kobalt ve gece mavisi tonları (`#1d4ed8`, `#2563eb`).
  - Coğrafya: Zeytin ve toprak tonları (`#4d7c0f`, `#65a30d`).
  - Fizik: Çelik mavisi ve lacivert tonları (`#4338ca`, `#4f46e5`).
  - Kimya: Mor ve lavanta tonları (#7e22ce, #9333ea).
  - Biyoloji: Canlı orman yeşili tonları (`#15803d`, `#16a34a`).
  - Edebiyat: Bordo ve gül tonları (`#be123c`, `#e11d48`).
- **Görsel Durumlar:**
  - Tamamlanmış ünite: Doygun renk ve onay rozeti `[x]`.
  - Çalışılmakta olan ünite: Çevresinde zarif odak çerçevesi ve anlık ilerleme göstergesi.
  - Gelecek ünite: Hafif yarı-saydam editoryal zemin.

### 3.4. Etkileşimler
- **Fare Üzerine Gelme (Hover Tooltip):**
  - Ünite adı, ders adı, video aralığı (#23 - #45), hafta aralığı (8. Hafta - 14. Hafta), kesin başlangıç ve tahmini bitiş tarihi, tamamlanma yüzdesi.
- **Tıklama (Drilldown Drawer / Alt Panel):**
  - Ünite segmentine tıklandığında alt tarafta o ünitenin videolarını listeleyen odak paneli açılır. Öğrenci doğrudan ilgili videoyu oynatabilir veya durumunu değiştirebilir.

---

## 4. Kısıtlamalar ve Kalite Standartları

1. **Sıfır Emoji Kuralı:** Kod, arayüz, stil ve bildirimlerde hiçbir emoji yer almayacaktır.
2. **Impeccable Standartları:**
   - Sayısal ve tarihsel verilerde `tabular-nums` zorunludur.
   - Yapay zeka klişesi (AI slop) olan gradyan yazılar, neobrutalist kalın blok gölgeler ve gereksiz neon ışıltılar kesinlikle kullanılmayacaktır.
   - Sayfa Operate modunda çalışacak; bilgi yoğunluğu ve taranabilirlik en üst düzeyde olacaktır.
3. **Sıfır Dış Bağımlılık:**
   - Harici charting veya Gantt kütüphaneleri (Chart.js, D3, vb.) kullanılmayacaktır. Tüm diagram saf SVG ve hafif CSS Grid/Flexbox ile üretilecektir.
4. **Tip ve Test Güvenliği:**
   - Strict TypeScript tip kontrolü (`tsc --noEmit`) 0 hata ile geçmelidir.
   - Tüm 766 videonun bir üniteye bağlı olduğu birim testleriyle doğrulanacaktır.
