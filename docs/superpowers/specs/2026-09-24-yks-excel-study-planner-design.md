# YKS Excel Study Planner & Automated Curriculum Engine Design

## 1. Overview and Core Objectives

This project delivers an interactive, automated Excel workbook (`YKS_2027_Calisma_Programi.xlsx`) and an accompanying visual companion dashboard specifically tailored for a YKS (TYT + AYT) student aiming for Equal Weight (EA) and Verbal (Sözel) success.

### Key Constraints & User Characteristics
- **Audience**: High school student/graduate with zero foundational knowledge ("hiçbir şey bilmeyen"), dislikes long study sessions, requires structured breaks, and needs zero cognitive friction regarding what to study next.
- **Daily Structure**: Exactly 4 blocks per day.
  - 1 block = 1 video.
  - Mandatory fixed 20-minute break between blocks.
  - 1. Block: Subject 1, Video N
  - 2. Block: Subject 1, Video N+1
  - 3. Block: Subject 2, Video M
  - 4. Block: Subject 2, Video M+1
- **Sundays (Pazar)**: Strictly off ("ÇALIŞMAK KESİNLİKLE YASAK" - non-negotiable mental reset).
- **Target Deadline**: 19 June 2027 (YKS 2027).
- **Chronology**: Strict chronological progression across all 9 playlists; the student never has to guess or search for where they left off.

---

## 2. Curriculum Data & Mathematical Feasibility

The 9 curated YouTube playlists comprise **746 videos** and **443.8 hours** of high-yield instructional content:

| Subject | Instructor / Series | Video Count | Total Hours | Avg Video (Min) | Weekly Allocation | Completion Timeline |
|---|---|---|---|---|---|---|
| **TYT Türkçe** | Aker Kartal | 71 | 23.1 h | 19.5 min | 2 videos / week (Pzt) | ~35.5 Weeks |
| **TYT-AYT Tarih** | Sadettin Akyuva | 166 | 101.6 h | 36.7 min | 4 videos / week (Salı, Cmt) | ~41.5 Weeks |
| **TYT Matematik** | Mert Hoca | 118 | 88.1 h | 44.8 min | 4 videos / week (Salı, Per) | ~29.5 Weeks |
| **TYT Coğrafya** | Coğrafyanın Kodları | 60 | 36.0 h | 36.0 min | 2 videos / week (Pzt) | ~30.0 Weeks |
| **AYT Coğrafya** | Coğrafyanın Kodları | 54 | 32.9 h | 36.5 min | 2 videos / week (Cuma - 2. devre) | ~27.0 Weeks |
| **TYT Biyoloji** | Dr. Biyoloji | 80 | 41.8 h | 31.3 min | 4 videos / week (Çar, Cmt) | ~20.0 Weeks |
| **TYT Fizik** | VIP Fizik | 76 | 51.7 h | 40.8 min | 2 videos / week (Cuma) | ~38.0 Weeks |
| **TYT Kimya** | Görkem Şahin | 79 | 32.3 h | 24.6 min | 2 videos / week (Per) | ~39.5 Weeks |
| **AYT Edebiyat** | Kadir Gümüş | 62 | 36.3 h | 35.2 min | 4 videos / week (Çar, Cuma - 1. devre) | ~15.5 Weeks |

### Weekly Day Distribution (4 Blocks / Day)
- **Pazartesi**: TYT Türkçe (2 video) + TYT Coğrafya (2 video)
- **Salı**: TYT Matematik (2 video) + TYT-AYT Tarih (2 video)
- **Çarşamba**: TYT Biyoloji (2 video) + AYT Edebiyat (2 video)
- **Perşembe**: TYT Matematik (2 video) + TYT Kimya (2 video)
- **Cuma**: TYT Fizik (2 video) + AYT Edebiyat (2 video - 16. haftadan sonra AYT Coğrafya 2 video)
- **Cumartesi**: TYT-AYT Tarih (2 video) + TYT Biyoloji (2 video - 21. haftadan sonra soru/tekrar)
- **Pazar**: **DİNLENME GÜNÜ - ÇALIŞMAK KESİNLİKLE YASAK!**

---

## 3. Excel Workbook Architecture (`.xlsx`)

The workbook consists of three purpose-built worksheets:

### Sheet 1: `Hazır YKS Kamp Takvimi`
- Pre-populated chronologically from Week 1 to Week 42.
- Each study day contains:
  1. Header with Week No and Day name.
  2. Block 1 (Subject 1, Video N, Title, Duration in Minutes, Clickable YouTube link, Checkbox `[ ]`).
  3. Mola 1 (`☕ 20 Dakika Mola - Zihni Dinlendir`).
  4. Block 2 (Subject 1, Video N+1, Title, Duration, Link, Checkbox).
  5. Mola 2 (`☕ 20 Dakika Mola`).
  6. Block 3 (Subject 2, Video M, Title, Duration, Link, Checkbox).
  7. Mola 3 (`☕ 20 Dakika Mola`).
  8. Block 4 (Subject 2, Video M+1, Title, Duration, Link, Checkbox).
  9. Daily summary row: Total Study Time (Dk / Saat), Total Break Time (60 dk).
- Sundays formatted across merged cells with an explicit resting banner (`⛔ PAZAR: ÇALIŞMAK KESİNLİKLE YASAK`).
- Top dashboard summary: Total Videos Watched, Remaining Videos, Total Hours Studied, Progress %.

### Sheet 2: `Dinamik Haftalık Planlayıcı`
- Interactive planner allowing user to assemble custom weeks.
- Column A: Gün / Blok
- Column B: `Ders Seçimi` (Data Validation drop-down with subject list).
- Column C: `Video / Konu Adı` (Dependent drop-down filtered dynamically based on Column B).
- Column D: `Süre (Dk)` (Calculated dynamically using `=IFERROR(VLOOKUP(...) / INDEX-MATCH, "")`).
- Column E: `Mola (Dk)` (Auto-populated with 20 minutes).
- Column F: `YouTube Linki` (Hyperlink formula to video).
- Column G: `Durum [X]` (When checked, row turns soft mint green via conditional formatting).
- Bottom row: Sum formulas for total study minutes and break minutes.

### Sheet 3: `Veri Bankası`
- Complete tabular database of all 746 videos.
- Columns:
  - `Ders`
  - `Video No`
  - `Video Başlığı`
  - `Süre (Dk)`
  - `Süre (Saniye)`
  - `YouTube URL`
- Dedicated named ranges for each course to power dependent data validation in Sheet 2.

---

## 4. Visual Design & Ergonomics (/impeccable standards)

- **Typography**: Clean `Segoe UI` / `Aptos` with tabular numerical alignment.
- **Palette**:
  - Primary Headers: Deep Slate `#1E293B` with bold white text.
  - Day Headers: Subtle Steel `#334155` with crisp white text.
  - Break Rows: Warm Amber `#FEF3C7` with dark golden-brown text `#92400E`.
  - Sunday Warning: Soft Coral `#FEE2E2` with deep crimson text `#991B1B`.
  - Completed Rows: Soft Mint `#DCFCE7` with deep forest green text `#166534`.
  - Hyperlinks: Clean cobalt blue `#2563EB` with underline.
- **Microcopy**: Direct, calming, non-judgmental guidance ("Zihni dinlendir", "Tebrikler, bugünün hedefleri bitti").

---

## 5. Technical Implementation & Automation

1. **Extractor / Data Engine**:
   - `extract_playlists.py`: Scrapes and caches full metadata (titles, durations, URLs) via `yt-dlp` into `playlists_data.json`.
2. **Excel Builder**:
   - `build_excel.js` (Node.js with `exceljs`): Assembles all 3 worksheets with proper cell formats, formulas, conditional formatting rules, widths, and styling.
3. **Verification**:
   - Programmatic verification of all 746 entries, formulas, cell coordinates, and Excel integrity.
