# Tarih Çapalı Yuvarlanan Takvim ve Özelleştirilebilir Haftalık Şablon Tasarım Dokümanı

## 1. Giriş ve Amaç

YKS 2027 Koçu platformunda "Programı Dengele" motoru ve haftalık çalışma planlayıcısı pedagojik ve işlevsel olarak yeniden tasarlanmaktadır. 

Mevcut sistemde haftanın günleri sabit ders branşlarına kilitliydi (Pazartesi daima Türkçe + Coğrafya, Cuma daima Fizik + Edebiyat). Bu durum, programa Cuma günü başlayan veya geciken bir öğrencinin ilk gününde Fizik ile karşılaşmasına ya da takvimde geçmiş Pazartesi'yi aramak zorunda kalmasına yol açıyordu. Ayrıca bir günün bir dersi izlenip diğeri kaçırıldığında branş sıralamasının bozulmaması ve haftalık blok yapısının (blok sayısı ve ders dağılımı) kullanıcı/yönetici tarafından özelleştirilebilmesi gerekmektedir.

Bu doküman, şu üç ana yeteneği bir araya getiren **"Tarih Çapalı Yuvarlanan Takvim ve Özelleştirilebilir Şablon Mimarisi"**ni tanımlar:
1. **Gerçek Tarih Çapalama & Yuvarlanan Çalışma Günleri (Date-Anchored Rolling Study Days):** Takvim bugünün gerçek tarihinden (örneğin *25 Eylül 2026, Cuma*) başlar. Öğrenci Cuma günü "Programı Dengele" dediğinde 1. Çalışma Günü bugüne (Cuma) bağlanır, Cumartesi 2. Gün olur, Pazar kesin dinlenme uygulanır, Pazartesi 3. Gün olarak devam eder.
2. **Branş Bazlı Kesintisiz Sıra (FIFO Subject Feeder):** Bir günde Türkçe izlenip Coğrafya izlenmediğinde, Türkçe bir sonraki numaraya geçer; Coğrafya ise izlenmeyen `#1` ve `#2` videolarında bekler. Bir sonraki Coğrafya yuvası geldiğinde kesinlikle `#1` ve `#2` gelir; öğrenci hiçbir önkoşul videoyu atlamaz.
3. **Özelleştirilebilir Haftalık Şablon (Custom Weekly Blueprint Matrix & Admin Editor):** Her günün kaç blok olacağı ve hangi blokta hangi dersin yer alacağı `/admin` panelinde görsel olarak düzenlenebilir (Örn: Salı 2. blok Matematik yerine Tarih, Cumartesi 5 blok).

---

## 2. Temel İlkeler ve Değişmezler (Invariants)

1. **Sıfır Video Kaybı / Mükerrer Yok:** 766 videoluk müfredatın her biri takvimde tam olarak 1 kez yer alır (tamamlananlar geçmiş tarihlerine sabitlenir, izlenmeyenler geleceğe dizilir).
2. **Pazar Günü Kesin Dinlenme Kuralı:** Gerçek takvimde Pazar gününe denk gelen her tarih istisnasız **Dinlenme Günü**dür (`isRestDay: true`). Pazar gününe asla ders bloğu konulamaz.
3. **Branş İçi Önkoşul Korunumu:** Hiçbir ders kendi video sırasını (1, 2, 3...) atlayamaz. Bir dersten izlenmeyen video varken o dersin daha ileri bir videosu takvime yerleştirilemez.
4. **Gerçek Takvim Bitiş Projeksiyonu:** 19 Haziran 2027 hedefine kalan süre, haftalık aktif blok hızına (haftada kaç video tamamlandığına) göre net bitiş tarihiyle dinamik hesaplanır.
5. **Sıfır Emoji & Impeccable Tasarım:** Tüm arayüzlerde emoji kullanılmaz; tipografik hiyerarşi, SVG ikonlar ve tabular-nums korunur.

---

## 3. Sistem Mimarisi

Sistem 3 temel katmandan oluşur:

### Katman 1: Haftalık Şablon Matrisi (Weekly Blueprint Matrix)
Haftanın 6 çalışma günü (Pazartesi - Cumartesi) için varsayılan veya özelleştirilmiş ders yuvalarını tutar:

```typescript
export interface WeeklyBlueprint {
  pazartesi: string[]; // ['TYT Türkçe', 'TYT Türkçe', 'TYT Coğrafya', 'TYT Coğrafya']
  sali: string[];      // ['TYT Matematik', 'TYT-AYT Tarih', 'TYT Matematik', 'TYT-AYT Tarih']
  carsamba: string[];  // ['TYT Biyoloji', 'TYT Biyoloji', 'AYT Edebiyat', 'AYT Edebiyat']
  persembe: string[];  // ['TYT Matematik', 'TYT Matematik', 'TYT Kimya', 'TYT Kimya']
  cuma: string[];      // ['TYT Fizik', 'TYT Fizik', 'AYT Edebiyat', 'AYT Edebiyat']
  cumartesi: string[]; // ['TYT-AYT Tarih', 'TYT-AYT Tarih', 'TYT Biyoloji', 'TYT Biyoloji', 'Tekrar & Soru Çözümü']
}
```

* Depolama: `localStorage.getItem('yks_weekly_blueprint')` (yoksa varsayılan şablon kullanılır).
* Dinamik Boyut: Bir günün dizisinde 3 eleman varsa o gün 3 blok; 5 eleman varsa 5 blok üretilir.

### Katman 2: Branş İçi Kesintisiz Kuyruk Besleyicisi (FIFO Subject Feeder)
* 9 dersin her biri için izlenmemiş videolar kronolojik sırada bir kuyrukta (`uncompletedQueues[subject]`) tutulur.
* Tamamlanan videolar bu kuyruktan çıkarılır ve geçmişte tamamlandıkları gün ve blok numarasına çivilenir.
* Şablondaki bir yuva `TYT Coğrafya` istediğinde, kuyruğun başındaki ilk video çekilir (`shift()`).
* Eğer öğrenci Cuma günü Coğrafya'yı izlemediyse, o Coğrafya videosu kuyruğun başında kalır; Cumartesi veya sonraki hafta Coğrafya yuvası geldiğinde ilk olarak o video yerleştirilir!

### Katman 3: Tarih Çapalı Takvim Sericisi (Date-Anchored Real Calendar Engine)
* Başlangıç Tarihi: `startDate` (Öğrencinin çalıştığı ilk gün veya bugünün gerçek tarihi: `2026-09-25`).
* Gün Döngüsü:
  - Tarih `currentDate` üzerinden 1'er gün artırılarak ilerler.
  - Eğer `currentDate.getDay() === 0` (Pazar) ise:
    - Gün `isRestDay: true, dayName: 'Pazar'` olarak işaretlenir, ders bloğu eklenmez.
  - Eğer çalışma günüyse (Pzt-Cmt):
    - Günün Türkçe adı ve gerçek tarihi (`25 Eylül 2026, Cuma`) yazılır.
    - Şablondan ilgili günün yuvaları alınır.
    - Her yuva için Katman 2'den sıradaki video çekilir.
  - Tüm ders kuyrukları boşalana kadar günler üretilir.
* Projeksiyon Hesabı:
  - Son çalışma gününün tarihi belirlenir.
  - 19 Haziran 2027 ile karşılaştırılarak öğrenciye net rapor sunulur (Örn: *"Müfredat 8 Mayıs 2027'de tamamlanıyor. Sınavdan 42 gün önce tüm konular bitmiş olacak."*).

---

## 4. Kullanıcı Deneyimi ve Arayüz (UI/UX)

### 4.1. Öğrenci Çalışma Stüdyosu (`www/index.html`)
* **Günün Başlığı:** `25 Eylül 2026, Cuma • 1. Çalışma Günü`
* **Blok Kartları:** Şablona göre 4 (veya 5) adet video kartı.
* **Günün Durumu:** Tamamlanan bloklar anında kaydedilir.
* **"Programı Dengele" Butonu:**
  - Tıklandığında öğrencinin ilk tamamlanmamış ders gününü **BUGÜNE** kilitler.
  - Kaçan derslerin sırasını korur, takvimi bugünden itibaren ileriye doğru dizer.
  - Onay penceresinde bilgilendirme: *"Program dengelendi. Tamamlanan videolarınız korundu; kaçan konular branş sırası bozulmadan bugünden itibaren takvime yerleştirildi."*

### 4.2. Yönetici Masası (`www/admin.html`)
* Yeni Bölüm: **"Haftalık Ders ve Blok Şablonu Düzenleyici"**
  - Pazartesi'den Cumartesi'ye 6 gün sütun veya sekmeler halinde listelenir.
  - Her gün için blok listesi:
    - Blok 1: Dropdown (`TYT Türkçe`, `TYT Matematik`, ...)
    - Blok 2: Dropdown
    - `[+ Blok Ekle]` butonu (Maksimum 6 blok).
    - `[- Bloğu Sil]` butonu (Minimum 2 blok).
  - "Şablonu Kaydet ve Takvime Uygula" butonu.
  - "Varsayılan Şablona Sıfırla" butonu.

---

## 5. Veri Modeli ve TypeScript Tip Tanımları

```typescript
export interface DaySchedule {
  dateIso: string;          // '2026-09-25'
  dateFormatted: string;    // '25 Eylül 2026, Cuma'
  dayName: string;          // 'Cuma'
  dayIndex: number;         // 0: Pazartesi .. 6: Pazar
  studyDayNumber?: number;  // 1, 2, 3... (Dinlenme günlerinde undefined)
  isRestDay: boolean;
  blocks: StudyBlock[];
}

export interface WeekSchedule {
  weekNum: number;
  startDateIso: string;
  endDateIso: string;
  days: DaySchedule[];
}

export interface ShiftEngineResult {
  schedule: WeekSchedule[];
  nextActiveWeek: number;
  nextActiveDay: number;
  estimatedFinishDate: string;
  daysAheadOfTarget: number;
}
```

---

## 6. Doğrulama ve Test Stratejisi

Aşağıdaki yeni test senaryoları `tests/` altında otomatikleştirilecektir:

1. **Date-Anchored Shifting Test:** 25 Eylül 2026 Cuma günü "Dengele" dendiğinde 1. Çalışma Günü'nün 25 Eylül Cuma olması; 27 Eylül'ün Pazar dinlenme günü olarak atanması.
2. **Independent Subject Queue Test:** Cuma günü Türkçe izlenip Coğrafya izlenmediğinde, Cumartesi ve sonraki günlerde Türkçe'nin #3'e geçmesi; Coğrafya yuvası ilk açıldığında kesinlikle kaçan #1 ve #2'nin gelmesi.
3. **Custom Blueprint Block Count Test:** Cumartesi gününe 5 blok tanımlandığında Cumartesi gününde 5 video bloğunun oluşturulması ve KPI'ın 5 blok üzerinden hesaplanması.
4. **Custom Blueprint Subject Swap Test:** Salı 2. blok Matematik yerine Tarih yapıldığında Tarih kuyruğundan sıradaki videonun çekilmesi.
5. **Full Curriculum Integrity Test:** Şablon ve tarihler ne kadar değiştirilirse değiştirilsin tüm 766 videonun eksiksiz ve 0 mükerrer ile takvimde yer alması.
