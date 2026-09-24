import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';
import { generateCalendarDays } from './calendar_engine.js';

// Styles & Palette (Conforming to Impeccable standards)
const FONT_FAMILY = 'Segoe UI';

const COLORS = {
  slateDark: 'FF0F172A',     // Deep slate for workbook title banners
  slateHeader: 'FF1E293B',   // Dark slate for table headers & KPI cards
  slateSubheader: 'FF334155',// Slate subheader for week banners
  slateSubtle: 'FFE2E8F0',   // Light slate for day banners & borders
  slateCard: 'FFF1F5F9',     // Subtle slate for summary rows & KPI labels
  textPrimary: 'FF0F172A',   // Primary text
  textMuted: 'FF64748B',     // Muted secondary text
  textWhite: 'FFFFFFFF',     // White text
  amberBg: 'FFFEF3C7',       // Warm amber for break rows
  amberText: 'FF92400E',     // Golden-brown for break text
  coralBg: 'FFFEE2E2',       // Soft coral for Sunday rest rows
  coralText: 'FF991B1B',     // Deep crimson for Sunday text
  mintBg: 'FFDCFCE7',        // Soft mint for completed rows
  mintText: 'FF166534',      // Deep forest green for completed text
  linkBlue: 'FF2563EB',      // Clean cobalt blue for links
  borderLight: 'FFE2E8F0',   // Light cell borders
  borderMedium: 'FFCBD5E1',  // Medium borders for cards
  zebraBg: 'FFF8FAFC'        // Subtle alternating row background
};

function thinBorder(colorArgb = COLORS.borderLight) {
  return {
    top: { style: 'thin', color: { argb: colorArgb } },
    left: { style: 'thin', color: { argb: colorArgb } },
    bottom: { style: 'thin', color: { argb: colorArgb } },
    right: { style: 'thin', color: { argb: colorArgb } }
  };
}

function styleCell(cell, style) {
  if (style.font) cell.font = style.font;
  if (style.fill) cell.fill = style.fill;
  if (style.alignment) cell.alignment = style.alignment;
  if (style.border) cell.border = style.border;
  if (style.numFmt) cell.numFmt = style.numFmt;
}

function styleRow(row, style, startCol = 1, endCol = 7) {
  for (let c = startCol; c <= endCol; c++) {
    styleCell(row.getCell(c), style);
  }
}

/**
 * Builds Sheet 3: Veri Bankası
 * Complete database of 766 videos with defined named ranges for dependent dropdowns
 */
export function buildVeriBankasi(workbook, playlistData) {
  const ws = workbook.addWorksheet('Veri Bankası', {
    views: [{ state: 'frozen', ySplit: 1 }],
    properties: { tabColor: { argb: 'FF64748B' } }
  });

  ws.columns = [
    { header: 'Ders', key: 'subject', width: 18 },
    { header: 'Sıra No', key: 'index', width: 12 },
    { header: 'Video Başlığı', key: 'title', width: 52 },
    { header: 'Süre (Dk)', key: 'duration_min', width: 14 },
    { header: 'Süre (Saniye)', key: 'duration_sec', width: 14 },
    { header: 'Eğitmen & Kanal', key: 'instructor_channel', width: 34 },
    { header: 'YouTube URL', key: 'url', width: 48 },
    { header: '', key: 'spacer', width: 4 },
    { header: 'Ders Listesi', key: 'subject_list', width: 22 }
  ];

  const headerRow = ws.getRow(1);
  headerRow.height = 28;
  for (let c = 1; c <= 7; c++) {
    styleCell(headerRow.getCell(c), {
      font: { name: FONT_FAMILY, size: 10.5, bold: true, color: { argb: COLORS.textWhite } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } },
      alignment: { horizontal: c === 2 || c === 4 || c === 5 ? 'right' : (c === 7 ? 'center' : 'left'), vertical: 'middle' },
      border: thinBorder(COLORS.slateSubheader)
    });
  }
  // Col 9 header
  styleCell(headerRow.getCell(9), {
    font: { name: FONT_FAMILY, size: 10.5, bold: true, color: { argb: COLORS.textWhite } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateSubheader } },
    alignment: { horizontal: 'left', vertical: 'middle' },
    border: thinBorder(COLORS.slateSubheader)
  });

  const subjects = Object.keys(playlistData);
  for (let i = 0; i < subjects.length; i++) {
    ws.getCell(i + 2, 9).value = subjects[i];
    styleCell(ws.getCell(i + 2, 9), {
      font: { name: FONT_FAMILY, size: 10 },
      alignment: { vertical: 'middle' },
      border: thinBorder()
    });
  }
  workbook.definedNames.add(`'Veri Bankası'!$I$2:$I$${subjects.length + 1}`, 'Ders_Listesi');

  let currentRowNum = 2;
  for (const [subj, info] of Object.entries(playlistData)) {
    const startRow = currentRowNum;
    const instructorChannel = `${info.metadata.instructor} (${info.metadata.channel})`;

    for (const v of info.videos) {
      const row = ws.getRow(currentRowNum);
      row.height = 20;
      row.getCell(1).value = subj;
      row.getCell(2).value = v.index;
      row.getCell(3).value = v.title;
      row.getCell(4).value = v.duration_min;
      row.getCell(5).value = v.duration_sec;
      row.getCell(6).value = instructorChannel;
      row.getCell(7).value = v.url;

      const isEven = (currentRowNum % 2 === 0);
      const bgArgb = isEven ? COLORS.textWhite : COLORS.zebraBg;

      for (let c = 1; c <= 7; c++) {
        let align = 'left';
        if (c === 2 || c === 4 || c === 5) align = 'right';
        if (c === 7) align = 'left';

        styleCell(row.getCell(c), {
          font: { name: FONT_FAMILY, size: 10, color: { argb: COLORS.textPrimary } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } },
          alignment: { horizontal: align, vertical: 'middle' },
          border: thinBorder(),
          numFmt: (c === 4) ? '0.0' : (c === 2 || c === 5 ? '#,##0' : undefined)
        });
      }

      currentRowNum++;
    }

    const endRow = currentRowNum - 1;
    const cleanName = subj.replace(/[\s-]/g, '_');
    workbook.definedNames.add(`'Veri Bankası'!$C$${startRow}:$C$${endRow}`, cleanName);

    const asciiName = cleanName
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/İ/g, 'I')
      .replace(/Ğ/g, 'G')
      .replace(/Ü/g, 'U')
      .replace(/Ş/g, 'S')
      .replace(/Ö/g, 'O')
      .replace(/Ç/g, 'C');
    if (asciiName !== cleanName) {
      workbook.definedNames.add(`'Veri Bankası'!$C$${startRow}:$C$${endRow}`, asciiName);
    }
  }

  workbook.definedNames.add(`'Veri Bankası'!$A$2:$G$${currentRowNum - 1}`, 'Veri_Tablosu');
  ws.autoFilter = `A1:G${currentRowNum - 1}`;
  return ws;
}

/**
 * Builds Sheet 1: Hazır YKS Kamp Takvimi
 * 42 weeks of pre-populated video schedules, break rows, Sunday banners, and KPI dashboard
 */
export function buildHazirKampTakvimi(workbook, playlistData, weeks) {
  const ws = workbook.addWorksheet('Hazır YKS Kamp Takvimi', {
    views: [{ state: 'frozen', ySplit: 7 }],
    properties: { tabColor: { argb: 'FF2563EB' } }
  });

  ws.columns = [
    { key: 'colA', width: 22 },
    { key: 'colB', width: 20 },
    { key: 'colC', width: 50 },
    { key: 'colD', width: 32 },
    { key: 'colE', width: 14 },
    { key: 'colF', width: 14 },
    { key: 'colG', width: 18 }
  ];

  // Row 1: Title
  ws.mergeCells('A1:G1');
  const titleRow = ws.getRow(1);
  titleRow.height = 36;
  titleRow.getCell(1).value = '🎯 YKS 2027 ÇALIŞMA PLANI • 42 HAFTALIK BÜYÜK KAMP';
  styleRow(titleRow, {
    font: { name: FONT_FAMILY, size: 14, bold: true, color: { argb: COLORS.textWhite } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateDark } },
    alignment: { horizontal: 'center', vertical: 'middle' }
  });

  // Row 2: Subtitle
  ws.mergeCells('A2:G2');
  const subRow = ws.getRow(2);
  subRow.height = 22;
  subRow.getCell(1).value = '📌 Günde 4 Blok Video (1 Blok = 1 Video) • Bloklar Arası 20 Dk Mola • Pazar Günleri Dinlenme • Hedef: 19 Haziran 2027';
  styleRow(subRow, {
    font: { name: FONT_FAMILY, size: 9.5, color: { argb: 'FF94A3B8' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } },
    alignment: { horizontal: 'center', vertical: 'middle' }
  });

  // Row 3: Blank separator
  ws.getRow(3).height = 8;

  // Rows 4 & 5: KPI Dashboard
  ws.mergeCells('A4:A5');
  const kpiRow4 = ws.getRow(4);
  const kpiRow5 = ws.getRow(5);
  kpiRow4.height = 18;
  kpiRow5.height = 28;

  kpiRow4.getCell(1).value = '📊 KAMP\nDURUMU';
  styleCell(kpiRow4.getCell(1), {
    font: { name: FONT_FAMILY, size: 11, bold: true, color: { argb: COLORS.textWhite } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: thinBorder(COLORS.slateSubheader)
  });
  styleCell(kpiRow5.getCell(1), {
    font: { name: FONT_FAMILY, size: 11, bold: true, color: { argb: COLORS.textWhite } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: thinBorder(COLORS.slateSubheader)
  });

  const cards = [
    { col: 2, label: 'TOPLAM VİDEO', val: 766, color: COLORS.textPrimary, fmt: undefined },
    { col: 3, label: 'İZLENEN VİDEO', val: { formula: 'COUNTIF(G8:G3500, "X")', result: 0 }, color: COLORS.mintText, fmt: undefined },
    { col: 4, label: 'KALAN VİDEO', val: { formula: 'B5-C5', result: 766 }, color: COLORS.coralText, fmt: undefined },
    { col: 5, label: 'İLERLEME', val: { formula: 'IFERROR(C5/B5, 0)', result: 0 }, color: COLORS.linkBlue, fmt: '0.0%' },
    { col: 6, label: 'TOPLAM SAAT', val: { formula: "ROUND(SUM('Veri Bankası'!D2:D767)/60, 1)", result: 443.8 }, color: COLORS.amberText, fmt: '0.0 "Saat"' },
    { col: 7, label: 'BİTEN SAAT', val: { formula: 'IFERROR(ROUND((C5/B5)*F5, 1), 0)', result: 0 }, color: COLORS.mintText, fmt: '0.0 "Saat"' }
  ];

  for (const card of cards) {
    kpiRow4.getCell(card.col).value = card.label;
    styleCell(kpiRow4.getCell(card.col), {
      font: { name: FONT_FAMILY, size: 9, bold: true, color: { argb: COLORS.textMuted } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateCard } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: thinBorder(COLORS.borderMedium)
    });

    kpiRow5.getCell(card.col).value = card.val;
    styleCell(kpiRow5.getCell(card.col), {
      font: { name: FONT_FAMILY, size: 15, bold: true, color: { argb: card.color } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.textWhite } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: thinBorder(COLORS.borderMedium),
      numFmt: card.fmt
    });
  }

  // Row 6: Blank separator
  ws.getRow(6).height = 8;

  // Row 7: Main Table Header
  const tableHeader = ws.getRow(7);
  tableHeader.height = 26;
  const headers = [
    'Hafta / Gün / Blok',
    'Ders',
    'Video / Konu Başlığı',
    'Eğitmen & Kanal',
    'Süre (Dk)',
    'YouTube Linki',
    'Tamamlandı [X]'
  ];
  for (let c = 1; c <= 7; c++) {
    tableHeader.getCell(c).value = headers[c - 1];
    let align = 'center';
    if (c === 2 || c === 3 || c === 4) align = 'left';
    if (c === 5) align = 'right';

    styleCell(tableHeader.getCell(c), {
      font: { name: FONT_FAMILY, size: 10.5, bold: true, color: { argb: COLORS.textWhite } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } },
      alignment: { horizontal: align, vertical: 'middle' },
      border: thinBorder(COLORS.slateSubheader)
    });
  }

  let currentRow = 8;

  for (const week of weeks) {
    // Week Header
    ws.mergeCells(`A${currentRow}:G${currentRow}`);
    const wRow = ws.getRow(currentRow);
    wRow.height = 25;
    wRow.getCell(1).value = `📅 ${week.weekNum}. HAFTA PROGRAMI`;
    styleRow(wRow, {
      font: { name: FONT_FAMILY, size: 11, bold: true, color: { argb: COLORS.textWhite } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateSubheader } },
      alignment: { horizontal: 'left', vertical: 'middle', indent: 1 }
    });
    currentRow++;

    for (const day of week.days) {
      if (day.isRestDay) {
        // Sunday
        ws.mergeCells(`A${currentRow}:G${currentRow}`);
        const sunRow = ws.getRow(currentRow);
        sunRow.height = 28;
        sunRow.getCell(1).value = '⛔ PAZAR: ÇALIŞMAK KESİNLİKLE YASAK! (Zorunlu Dinlenme & Beyin Resetleme)';
        styleRow(sunRow, {
          font: { name: FONT_FAMILY, size: 11, bold: true, color: { argb: COLORS.coralText } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.coralBg } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: {
            top: { style: 'thin', color: { argb: 'FFFECACA' } },
            bottom: { style: 'thin', color: { argb: 'FFFECACA' } }
          }
        });
        currentRow++;
        continue;
      }

      // Weekday
      // Day Header
      ws.mergeCells(`A${currentRow}:G${currentRow}`);
      const dRow = ws.getRow(currentRow);
      dRow.height = 22;
      dRow.getCell(1).value = `📌 ${day.dayName} (4 Blok Video + 3 Mola)`;
      styleRow(dRow, {
        font: { name: FONT_FAMILY, size: 10, bold: true, color: { argb: COLORS.slateHeader } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateSubtle } },
        alignment: { horizontal: 'left', vertical: 'middle', indent: 1 }
      });
      currentRow++;

      const blockRowIndices = [];
      let dayStudyMin = 0;

      for (let b = 0; b < 4; b++) {
        if (b > 0) {
          // Break Row
          const bRow = ws.getRow(currentRow);
          bRow.height = 20;
          bRow.getCell(1).value = `Mola ${b}`;
          bRow.getCell(2).value = '☕ 20 Dk Mola';
          bRow.getCell(3).value = 'Zihni Dinlendir & Beyin Resetleme';
          bRow.getCell(4).value = '-';
          bRow.getCell(5).value = '';
          bRow.getCell(6).value = '-';
          bRow.getCell(7).value = '-';

          for (let c = 1; c <= 7; c++) {
            styleCell(bRow.getCell(c), {
              font: { name: FONT_FAMILY, size: 9.5, italic: true, color: { argb: COLORS.amberText } },
              fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.amberBg } },
              alignment: { horizontal: (c === 1 || c === 6 || c === 7) ? 'center' : (c === 5 ? 'right' : 'left'), vertical: 'middle' },
              border: thinBorder('FFFDE68A')
            });
          }
          currentRow++;
        }

        // Video Block Row
        const block = day.blocks[b];
        blockRowIndices.push(currentRow);
        const vRow = ws.getRow(currentRow);
        vRow.height = 22;

        vRow.getCell(1).value = `${b + 1}. Blok`;
        vRow.getCell(2).value = block.subject;
        vRow.getCell(3).value = block.video.title;
        vRow.getCell(4).value = block.instructor || block.video.instructor || '';
        vRow.getCell(5).value = block.video.duration_min;
        dayStudyMin += Number(block.video.duration_min || 0);

        if (block.video.url && block.video.url.startsWith('https://')) {
          vRow.getCell(6).value = { text: 'İzle', hyperlink: block.video.url };
        } else {
          vRow.getCell(6).value = '-';
        }
        vRow.getCell(7).value = '';

        for (let c = 1; c <= 7; c++) {
          let align = 'left';
          if (c === 1 || c === 6 || c === 7) align = 'center';
          if (c === 5) align = 'right';

          const cell = vRow.getCell(c);
          styleCell(cell, {
            font: (c === 6 && block.video.url)
              ? { name: FONT_FAMILY, size: 10, color: { argb: COLORS.linkBlue }, underline: true }
              : { name: FONT_FAMILY, size: 10, color: { argb: COLORS.textPrimary } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.textWhite } },
            alignment: { horizontal: align, vertical: 'middle' },
            border: thinBorder(),
            numFmt: (c === 5) ? '0.0' : undefined
          });
        }
        currentRow++;
      }

      // Daily summary row
      const sRow = ws.getRow(currentRow);
      sRow.height = 24;
      sRow.getCell(1).value = 'Günlük Toplam';
      sRow.getCell(2).value = '4 Blok + 3 Mola';
      sRow.getCell(3).value = 'Günlük Çalışma & Mola';
      sRow.getCell(4).value = 'Toplam Mola: 60 Dk';

      const sumFormula = `SUM(E${blockRowIndices[0]},E${blockRowIndices[1]},E${blockRowIndices[2]},E${blockRowIndices[3]})`;
      sRow.getCell(5).value = { formula: sumFormula, result: Math.round(dayStudyMin * 10) / 10 };
      sRow.getCell(6).value = { formula: `ROUND(E${currentRow}/60, 1) & " Saat"`, result: `${(dayStudyMin / 60).toFixed(1)} Saat` };
      sRow.getCell(7).value = { formula: `COUNTIF(G${blockRowIndices[0]}:G${blockRowIndices[3]}, "X") & "/4"`, result: '0/4' };

      for (let c = 1; c <= 7; c++) {
        let align = 'left';
        if (c === 1 || c === 2 || c === 6 || c === 7) align = 'center';
        if (c === 5) align = 'right';

        styleCell(sRow.getCell(c), {
          font: { name: FONT_FAMILY, size: 9.5, bold: true, color: { argb: COLORS.slateHeader } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateCard } },
          alignment: { horizontal: align, vertical: 'middle' },
          border: {
            top: { style: 'thin', color: { argb: COLORS.borderMedium } },
            bottom: { style: 'thin', color: { argb: COLORS.borderMedium } }
          },
          numFmt: (c === 5) ? '0.0' : undefined
        });
      }
      currentRow++;
    }

    // Blank separator after each week
    ws.getRow(currentRow).height = 8;
    currentRow++;
  }

  // Conditional formatting on completed video rows
  ws.addConditionalFormatting({
    ref: `A8:G${currentRow}`,
    rules: [
      {
        type: 'expression',
        formulae: ['$G8="X"'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: COLORS.mintBg }, fgColor: { argb: COLORS.mintBg } }
        }
      }
    ]
  });

  return ws;
}

/**
 * Builds Sheet 2: Dinamik Haftalık Planlayıcı
 * Interactive weekly template with subject dropdowns, indirect video dropdowns, and automated lookups
 */
export function buildDinamikPlanlayici(workbook, playlistData) {
  const ws = workbook.addWorksheet('Dinamik Haftalık Planlayıcı', {
    views: [{ state: 'frozen', ySplit: 4 }],
    properties: { tabColor: { argb: 'FF0D9488' } }
  });

  ws.columns = [
    { key: 'colA', width: 20 },
    { key: 'colB', width: 22 },
    { key: 'colC', width: 50 },
    { key: 'colD', width: 14 },
    { key: 'colE', width: 14 },
    { key: 'colF', width: 16 },
    { key: 'colG', width: 18 }
  ];

  // Row 1: Title Banner
  ws.mergeCells('A1:G1');
  const tRow = ws.getRow(1);
  tRow.height = 36;
  tRow.getCell(1).value = '🎯 DİNAMİK HAFTALIK ÇALIŞMA PLANLAYICI (ÖZELLEŞTİRİLEBİLİR)';
  styleRow(tRow, {
    font: { name: FONT_FAMILY, size: 14, bold: true, color: { argb: COLORS.textWhite } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateDark } },
    alignment: { horizontal: 'center', vertical: 'middle' }
  });

  // Row 2: Instructions
  ws.mergeCells('A2:G2');
  const subRow = ws.getRow(2);
  subRow.height = 22;
  subRow.getCell(1).value = '💡 Kullanım: Ders seçin -> Video konusunu seçin -> Süre ve YouTube linki otomatik gelir. Günde 4 blok ve 20 dk mola esastır.';
  styleRow(subRow, {
    font: { name: FONT_FAMILY, size: 9.5, color: { argb: 'FF94A3B8' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } },
    alignment: { horizontal: 'center', vertical: 'middle' }
  });

  // Row 3: Blank separator
  ws.getRow(3).height = 8;

  // Row 4: Column Headers
  const hRow = ws.getRow(4);
  hRow.height = 26;
  const colHeaders = [
    'Gün / Blok',
    'Ders Seçimi',
    'Video / Konu Adı',
    'Süre (Dk)',
    'Mola (Dk)',
    'YouTube Linki',
    'Tamamlandı [X]'
  ];
  for (let c = 1; c <= 7; c++) {
    hRow.getCell(c).value = colHeaders[c - 1];
    let align = 'center';
    if (c === 2 || c === 3) align = 'left';
    if (c === 4 || c === 5) align = 'right';

    styleCell(hRow.getCell(c), {
      font: { name: FONT_FAMILY, size: 10.5, bold: true, color: { argb: COLORS.textWhite } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateHeader } },
      alignment: { horizontal: align, vertical: 'middle' },
      border: thinBorder(COLORS.slateSubheader)
    });
  }

  const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const subjectListValidationFormula = '"TYT Türkçe,TYT-AYT Tarih,TYT Coğrafya,AYT Coğrafya,TYT Matematik,TYT Biyoloji,TYT Fizik,TYT Kimya,AYT Edebiyat"';

  let currentRow = 5;
  const allDailySummaryRows = [];

  for (const dayName of daysOfWeek) {
    if (dayName === 'Pazar') {
      // Sunday banner
      ws.mergeCells(`A${currentRow}:G${currentRow}`);
      const sRow = ws.getRow(currentRow);
      sRow.height = 28;
      sRow.getCell(1).value = '⛔ PAZAR: ÇALIŞMAK KESİNLİKLE YASAK! (Zorunlu Dinlenme & Beyin Resetleme)';
      styleRow(sRow, {
        font: { name: FONT_FAMILY, size: 11, bold: true, color: { argb: COLORS.coralText } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.coralBg } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: 'FFFECACA' } },
          bottom: { style: 'thin', color: { argb: 'FFFECACA' } }
        }
      });
      currentRow++;
      continue;
    }

    // Weekday
    // Day Header
    ws.mergeCells(`A${currentRow}:G${currentRow}`);
    const dRow = ws.getRow(currentRow);
    dRow.height = 22;
    dRow.getCell(1).value = `📌 ${dayName.toUpperCase()} (4 Blok + 3 Mola)`;
    styleRow(dRow, {
      font: { name: FONT_FAMILY, size: 10, bold: true, color: { argb: COLORS.slateHeader } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateSubtle } },
      alignment: { horizontal: 'left', vertical: 'middle', indent: 1 }
    });
    currentRow++;

    const dayBlockRows = [];
    const dayBreakRows = [];

    for (let b = 0; b < 4; b++) {
      if (b > 0) {
        // Break Row
        dayBreakRows.push(currentRow);
        const bRow = ws.getRow(currentRow);
        bRow.height = 20;
        bRow.getCell(1).value = `Mola ${b}`;
        bRow.getCell(2).value = '☕ Mola';
        bRow.getCell(3).value = '20 Dakika Zihinsel Dinlenme';
        bRow.getCell(4).value = '';
        bRow.getCell(5).value = 20;
        bRow.getCell(6).value = '-';
        bRow.getCell(7).value = '-';

        for (let c = 1; c <= 7; c++) {
          styleCell(bRow.getCell(c), {
            font: { name: FONT_FAMILY, size: 9.5, italic: true, color: { argb: COLORS.amberText } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.amberBg } },
            alignment: { horizontal: (c === 1 || c === 6 || c === 7) ? 'center' : (c === 5 ? 'right' : 'left'), vertical: 'middle' },
            border: thinBorder('FFFDE68A')
          });
        }
        currentRow++;
      }

      // Video Block Row
      dayBlockRows.push(currentRow);
      const vRow = ws.getRow(currentRow);
      vRow.height = 22;

      vRow.getCell(1).value = `${b + 1}. Blok`;
      vRow.getCell(2).value = '';
      vRow.getCell(3).value = '';
      vRow.getCell(4).value = {
        formula: `IFERROR(VLOOKUP(C${currentRow}, 'Veri Bankası'!$C:$D, 2, FALSE), "")`,
        result: ''
      };
      vRow.getCell(5).value = '';
      vRow.getCell(6).value = {
        formula: `IFERROR(HYPERLINK(VLOOKUP(C${currentRow}, 'Veri Bankası'!$C:$G, 5, FALSE), "İzle"), "")`,
        result: ''
      };
      vRow.getCell(7).value = '';

      // Column B Data Validation
      vRow.getCell(2).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [subjectListValidationFormula]
      };

      // Column C Data Validation (Dependent)
      vRow.getCell(3).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`=INDIRECT(SUBSTITUTE(SUBSTITUTE(B${currentRow}," ","_"),"-","_"))`]
      };

      for (let c = 1; c <= 7; c++) {
        let align = 'left';
        if (c === 1 || c === 6 || c === 7) align = 'center';
        if (c === 4 || c === 5) align = 'right';

        styleCell(vRow.getCell(c), {
          font: { name: FONT_FAMILY, size: 10, color: { argb: (c === 6) ? COLORS.linkBlue : COLORS.textPrimary } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.textWhite } },
          alignment: { horizontal: align, vertical: 'middle' },
          border: thinBorder(),
          numFmt: (c === 4) ? '0.0' : undefined
        });
      }
      currentRow++;
    }

    // Daily summary row
    allDailySummaryRows.push(currentRow);
    const sumRow = ws.getRow(currentRow);
    sumRow.height = 24;
    sumRow.getCell(1).value = 'Günlük Toplam';
    sumRow.getCell(2).value = '4 Blok + 3 Mola';
    sumRow.getCell(3).value = 'Toplam Çalışma & Mola';
    sumRow.getCell(4).value = {
      formula: `IFERROR(SUM(D${dayBlockRows[0]},D${dayBlockRows[1]},D${dayBlockRows[2]},D${dayBlockRows[3]}), 0)`,
      result: 0
    };
    sumRow.getCell(5).value = {
      formula: `SUM(E${dayBreakRows[0]},E${dayBreakRows[1]},E${dayBreakRows[2]})`,
      result: 60
    };
    sumRow.getCell(6).value = {
      formula: `IF(D${currentRow}>0, "~" & ROUND(D${currentRow}/60, 1) & " Saat", "-")`,
      result: '-'
    };
    sumRow.getCell(7).value = {
      formula: `COUNTIF(G${dayBlockRows[0]}:G${dayBlockRows[3]}, "X") & "/4"`,
      result: '0/4'
    };

    for (let c = 1; c <= 7; c++) {
      let align = 'left';
      if (c === 1 || c === 2 || c === 6 || c === 7) align = 'center';
      if (c === 4 || c === 5) align = 'right';

      styleCell(sumRow.getCell(c), {
        font: { name: FONT_FAMILY, size: 9.5, bold: true, color: { argb: COLORS.slateHeader } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateCard } },
        alignment: { horizontal: align, vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: COLORS.borderMedium } },
          bottom: { style: 'thin', color: { argb: COLORS.borderMedium } }
        },
        numFmt: (c === 4 || c === 5) ? '0.0' : undefined
      });
    }
    currentRow++;
  }

  // Separator
  ws.getRow(currentRow).height = 8;
  currentRow++;

  // Weekly Grand Total Row
  const grandRow = ws.getRow(currentRow);
  grandRow.height = 28;
  grandRow.getCell(1).value = '📈 Haftalık Genel Toplam';
  grandRow.getCell(2).value = '24 Blok + 18 Mola';
  grandRow.getCell(3).value = 'Haftalık Toplam Süre';
  grandRow.getCell(4).value = {
    formula: `SUM(${allDailySummaryRows.map(r => 'D' + r).join(',')})`,
    result: 0
  };
  grandRow.getCell(5).value = {
    formula: `SUM(${allDailySummaryRows.map(r => 'E' + r).join(',')})`,
    result: 360
  };
  grandRow.getCell(6).value = {
    formula: `IF(D${currentRow}>0, "~" & ROUND(D${currentRow}/60, 1) & " Saat", "0 Saat")`,
    result: '0 Saat'
  };
  grandRow.getCell(7).value = {
    formula: `COUNTIF(G5:G${currentRow - 2}, "X") & " / 24"`,
    result: '0 / 24'
  };

  for (let c = 1; c <= 7; c++) {
    let align = 'left';
    if (c === 1 || c === 2 || c === 6 || c === 7) align = 'center';
    if (c === 4 || c === 5) align = 'right';

    styleCell(grandRow.getCell(c), {
      font: { name: FONT_FAMILY, size: 10, bold: true, color: { argb: COLORS.textWhite } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.slateDark } },
      alignment: { horizontal: align, vertical: 'middle' },
      border: thinBorder(COLORS.slateSubheader),
      numFmt: (c === 4 || c === 5) ? '0.0' : undefined
    });
  }

  // Conditional formatting on completed video rows
  ws.addConditionalFormatting({
    ref: `A5:G${currentRow}`,
    rules: [
      {
        type: 'expression',
        formulae: ['$G5="X"'],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: COLORS.mintBg }, fgColor: { argb: COLORS.mintBg } }
        }
      }
    ]
  });

  return ws;
}

/**
 * Main generator assembling the entire production-grade workbook
 */
export async function buildExcelWorkbook(outputPath = 'YKS_2027_Calisma_Programi.xlsx') {
  const jsonPath = path.resolve('playlists_data_tr.json');
  const playlistData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const weeks = generateCalendarDays(playlistData);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'YKS Study Planner Generator';
  workbook.lastModifiedBy = 'YKS Study Planner Generator';
  workbook.created = new Date('2026-09-24T12:00:00Z');
  workbook.modified = new Date();

  // 1. Hazır YKS Kamp Takvimi
  buildHazirKampTakvimi(workbook, playlistData, weeks);

  // 2. Dinamik Haftalık Planlayıcı
  buildDinamikPlanlayici(workbook, playlistData);

  // 3. Veri Bankası
  buildVeriBankasi(workbook, playlistData);

  await workbook.xlsx.writeFile(outputPath);
  console.log(`Excel file successfully generated at: ${outputPath}`);
  return outputPath;
}

// CLI entry point
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectExecution) {
  buildExcelWorkbook().catch(err => {
    console.error('Failed to generate Excel workbook:', err);
    process.exit(1);
  });
}
