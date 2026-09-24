import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ExcelJS from 'exceljs';

const EXCEL_PATH = 'YKS_2027_Calisma_Programi.xlsx';

test('build_excel produces valid XLSX file with all 3 worksheets', async () => {
  assert.ok(fs.existsSync(EXCEL_PATH), `${EXCEL_PATH} does not exist`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_PATH);

  assert.equal(workbook.worksheets.length, 3);
  const sheetNames = workbook.worksheets.map(s => s.name);
  assert.ok(sheetNames.includes('Hazır YKS Kamp Takvimi'));
  assert.ok(sheetNames.includes('Dinamik Haftalık Planlayıcı'));
  assert.ok(sheetNames.includes('Veri Bankası'));
});

test('Veri Bankası sheet contains all 766 curriculum videos and defined named ranges', async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_PATH);

  const dbSheet = workbook.getWorksheet('Veri Bankası');
  assert.ok(dbSheet, 'Veri Bankası sheet not found');

  // Verify header row
  const headerValues = [];
  const headerRow = dbSheet.getRow(1);
  for (let c = 1; c <= 7; c++) {
    headerValues.push(headerRow.getCell(c).value);
  }
  assert.deepEqual(headerValues, [
    'Ders',
    'Sıra No',
    'Video Başlığı',
    'Süre (Dk)',
    'Süre (Saniye)',
    'Eğitmen & Kanal',
    'YouTube URL'
  ]);

  // Assert row count: 1 header + 766 data rows = 767 total rows
  assert.ok(dbSheet.rowCount >= 747, `Expected at least 747 rows, got ${dbSheet.rowCount}`);
  assert.equal(dbSheet.rowCount, 767, `Expected exactly 767 rows for 766 videos + header, got ${dbSheet.rowCount}`);

  // Verify first and last rows
  const firstVideoRow = dbSheet.getRow(2);
  assert.equal(firstVideoRow.getCell(1).value, 'TYT Türkçe');
  assert.equal(firstVideoRow.getCell(2).value, 1);
  assert.ok(String(firstVideoRow.getCell(3).value).includes('Türkçe Derse Giriş'));
  assert.ok(Number(firstVideoRow.getCell(4).value) > 0);
  assert.ok(String(firstVideoRow.getCell(7).value).startsWith('https://www.youtube.com/'));

  const lastVideoRow = dbSheet.getRow(767);
  assert.equal(lastVideoRow.getCell(1).value, 'AYT Edebiyat');
  assert.equal(lastVideoRow.getCell(2).value, 62);
  assert.ok(String(lastVideoRow.getCell(7).value).startsWith('https://www.youtube.com/'));

  // Verify defined names in workbook
  const definedNames = workbook.definedNames.model || [];
  const nameKeys = definedNames.map(d => d.name);
  assert.ok(nameKeys.includes('TYT_Türkçe') || nameKeys.includes('TYT_Turkce'), 'Missing TYT_Türkçe defined name');
  assert.ok(nameKeys.includes('TYT_AYT_Tarih'), 'Missing TYT_AYT_Tarih defined name');
  assert.ok(nameKeys.includes('TYT_Matematik'), 'Missing TYT_Matematik defined name');
});

test('Hazır YKS Kamp Takvimi contains KPI dashboard, 42 weeks, Sunday rest banners, and formulas', async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_PATH);

  const calSheet = workbook.getWorksheet('Hazır YKS Kamp Takvimi');
  assert.ok(calSheet, 'Hazır YKS Kamp Takvimi sheet not found');

  // 1. KPI Dashboard check (Row 4 & 5)
  // B5: Total Videos (766)
  const totalVideosCell = calSheet.getCell('B5');
  assert.equal(totalVideosCell.value, 766, 'KPI Total Videos must be 766');

  // C5: Watched Videos formula (COUNTIF)
  const watchedCell = calSheet.getCell('C5');
  const watchedFormula = watchedCell.value?.formula || String(watchedCell.value);
  assert.ok(watchedFormula.includes('COUNTIF'), 'KPI Watched Videos must use COUNTIF formula');

  // D5: Remaining formula
  const remainingCell = calSheet.getCell('D5');
  const remainingFormula = remainingCell.value?.formula || String(remainingCell.value);
  assert.ok(remainingFormula.includes('B5') || remainingFormula.includes('766'), 'KPI Remaining Videos must reference Total - Watched');

  // E5: Progress % formula
  const progressCell = calSheet.getCell('E5');
  const progressFormula = progressCell.value?.formula || String(progressCell.value);
  assert.ok(progressFormula.includes('/') || progressFormula.includes('C5'), 'KPI Progress % must calculate ratio');

  // F5: Total Hours
  const totalHoursCell = calSheet.getCell('F5');
  const totalHoursVal = totalHoursCell.value?.result || totalHoursCell.value?.formula || totalHoursCell.value;
  assert.ok(totalHoursVal !== undefined, 'KPI Total Hours must be defined');

  // 2. Scan calendar rows for weeks, Sundays, breaks, video hyperlinks, and daily summaries
  let weekHeaderCount = 0;
  let sundayCount = 0;
  let breakRowCount = 0;
  let videoLinkCount = 0;
  let summaryRowCount = 0;

  for (let r = 7; r <= calSheet.rowCount; r++) {
    const row = calSheet.getRow(r);
    const cellA = String(row.getCell(1).value || '');
    const cellB = String(row.getCell(2).value || '');
    const cellC = String(row.getCell(3).value || '');
    const cellF = row.getCell(6).value;

    // Week header detection
    if (cellA.includes('HAFTA PROGRAMI')) {
      weekHeaderCount++;
    }

    // Sunday rest banner detection
    if (cellA.includes('PAZAR: ÇALIŞMAK KESİNLİKLE YASAK') || (cellA.includes('PAZAR') && cellA.includes('YASAK'))) {
      sundayCount++;
      // Check soft coral background (FEE2E2)
      const fillArgb = row.getCell(1).fill?.fgColor?.argb;
      assert.ok(fillArgb?.toUpperCase().includes('FEE2E2'), `Sunday banner on row ${r} must have soft coral fill, got ${fillArgb}`);
    }

    // Break row detection
    if (cellA.startsWith('Mola')) {
      breakRowCount++;
      const fillArgb = row.getCell(1).fill?.fgColor?.argb || row.getCell(2).fill?.fgColor?.argb;
      assert.ok(fillArgb?.toUpperCase().includes('FEF3C7'), `Break row ${r} must have warm amber fill, got ${fillArgb}`);
    }

    // Video block with clickable YouTube link
    if (cellF && typeof cellF === 'object' && cellF.hyperlink) {
      assert.ok(cellF.hyperlink.startsWith('https://www.youtube.com/'), `Invalid hyperlink on row ${r}: ${cellF.hyperlink}`);
      videoLinkCount++;
    }

    // Daily summary row detection
    if (cellA === 'Günlük Toplam') {
      summaryRowCount++;
      // Check Col E formula (SUM)
      const sumCell = row.getCell(5);
      const sumFormula = sumCell.value?.formula || '';
      assert.ok(sumFormula.includes('SUM'), `Daily summary row ${r} must have SUM formula in column E`);
    }
  }

  assert.equal(weekHeaderCount, 42, `Expected 42 week headers, got ${weekHeaderCount}`);
  assert.equal(sundayCount, 42, `Expected 42 Sunday rest banners, got ${sundayCount}`);
  // 42 weeks * 6 study days = 252 study days
  // 252 study days * 3 breaks/day = 756 break rows
  assert.equal(breakRowCount, 756, `Expected 756 break rows, got ${breakRowCount}`);
  // 252 study days * 1 summary row/day = 252 summary rows
  assert.equal(summaryRowCount, 252, `Expected 252 daily summary rows, got ${summaryRowCount}`);
  // 766 curriculum videos have links
  assert.equal(videoLinkCount, 766, `Expected 766 clickable YouTube video links, got ${videoLinkCount}`);
});

test('Dinamik Haftalık Planlayıcı contains valid columns, dropdown validation, and lookup formulas', async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_PATH);

  const plannerSheet = workbook.getWorksheet('Dinamik Haftalık Planlayıcı');
  assert.ok(plannerSheet, 'Dinamik Haftalık Planlayıcı sheet not found');

  // Verify header row (Row 4)
  const headerRow = plannerSheet.getRow(4);
  const expectedCols = [
    'Gün / Blok',
    'Ders Seçimi',
    'Video / Konu Adı',
    'Süre (Dk)',
    'Mola (Dk)',
    'YouTube Linki',
    'Tamamlandı [X]'
  ];
  for (let c = 1; c <= 7; c++) {
    assert.equal(headerRow.getCell(c).value, expectedCols[c - 1], `Column ${c} header mismatch`);
  }

  // Check interactive block rows for validation and formulas
  // Block 1 row is row 6 (after Pazartesi day header on row 5)
  const block1Row = plannerSheet.getRow(6);
  assert.equal(block1Row.getCell(1).value, '1. Blok');

  // Column B data validation (subject list)
  const cellB = block1Row.getCell(2);
  assert.ok(cellB.dataValidation, 'Block 1 Column B must have dataValidation');
  assert.equal(cellB.dataValidation.type, 'list');
  const bFormula = cellB.dataValidation.formulae?.[0] || '';
  assert.ok(bFormula.includes('TYT Türkçe') || bFormula.includes('Ders'), `Subject validation list formula unexpected: ${bFormula}`);

  // Column C data validation (dependent list)
  const cellC = block1Row.getCell(3);
  assert.ok(cellC.dataValidation, 'Block 1 Column C must have dataValidation');
  assert.equal(cellC.dataValidation.type, 'list');
  const cFormula = cellC.dataValidation.formulae?.[0] || '';
  assert.ok(cFormula.includes('INDIRECT'), `Video validation list formula must use INDIRECT: ${cFormula}`);

  // Column D formula (VLOOKUP with IFERROR)
  const cellD = block1Row.getCell(4);
  const dFormula = cellD.value?.formula || '';
  assert.ok(dFormula.includes('VLOOKUP'), `Column D must contain VLOOKUP formula, got: ${dFormula}`);
  assert.ok(dFormula.includes('Veri Bankası'), `Column D formula must reference Veri Bankası, got: ${dFormula}`);

  // Column E on break rows should have 20 minutes
  const break1Row = plannerSheet.getRow(7);
  assert.equal(break1Row.getCell(1).value, 'Mola 1');
  assert.equal(break1Row.getCell(5).value, 20);

  // Column F formula (HYPERLINK)
  const cellF = block1Row.getCell(6);
  const fFormula = cellF.value?.formula || '';
  assert.ok(fFormula.includes('HYPERLINK'), `Column F must contain HYPERLINK formula, got: ${fFormula}`);

  // Verify daily summary row formulas exist (row 13 for Pazartesi)
  const summaryRow = plannerSheet.getRow(13);
  assert.equal(summaryRow.getCell(1).value, 'Günlük Toplam');
  const studySumFormula = summaryRow.getCell(4).value?.formula || '';
  assert.ok(studySumFormula.includes('SUM'), `Planner daily study total must have SUM formula: ${studySumFormula}`);
  const breakSumFormula = summaryRow.getCell(5).value?.formula || '';
  assert.ok(breakSumFormula.includes('SUM'), `Planner daily break total must have SUM formula: ${breakSumFormula}`);
});
