const TEMPLATE_MAP = {
  hourly: "CongSuatDuBao_IAH_15Phut_Template.xlsx",
  daily: "CongSuatDuBao_DAH_15Phut_Template.xlsx",
  weekly: "CongSuatDuBao_WAH_Template.xlsx",
};

const AVAILABLE_POWER_MW = Number(import.meta.env.VITE_AVAILABLE_POWER_MW || 38);

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getPowerMw(row) {
  const mw = toNumber(row?.power_mw);
  if (mw !== null) return mw;
  const kw = toNumber(row?.power_kw);
  return kw !== null ? kw / 1000 : null;
}

function getCycleBase(rows) {
  const cycles = rows.map((row) => toNumber(row?.cycle)).filter((val) => val !== null);
  if (!cycles.length) return 0;
  if (cycles.includes(0)) return 0;
  if (cycles.includes(96)) return 1;
  return 0;
}

function toRowFromCycle(cycle, base, maxCycle) {
  const numeric = toNumber(cycle);
  if (numeric === null) return null;
  const oneBased = numeric - base + 1;
  if (oneBased < 1 || oneBased > maxCycle) return null;
  return 11 + oneBased;
}

function setTotalRowBySummingColumns(sheet, totalRow, startRow, endRow, columns) {
  for (const col of columns) {
    let total = 0;
    let hasValue = false;
    for (let row = startRow; row <= endRow; row += 1) {
      const value = toNumber(sheet.getCell(row, col).value);
      if (value === null) continue;
      total += value;
      hasValue = true;
    }
    sheet.getCell(totalRow, col).value = hasValue ? total : null;
  }
}

function fillDailyOrHourlySheet(sheet, rows, { includeTotalRow = false } = {}) {
  for (let row = 12; row <= 107; row += 1) {
    sheet.getCell(row, 2).value = null;
    sheet.getCell(row, 3).value = null;
  }

  const base = getCycleBase(rows);
  for (const item of rows) {
    const targetRow = toRowFromCycle(item?.cycle, base, 96);
    if (!targetRow) continue;
    const powerMw = getPowerMw(item);
    if (powerMw === null) continue;
    sheet.getCell(targetRow, 2).value = powerMw;
    sheet.getCell(targetRow, 3).value = AVAILABLE_POWER_MW;
  }

  if (includeTotalRow) {
    setTotalRowBySummingColumns(sheet, 108, 12, 107, [2, 3]);
  }
}

function fillWeeklySheet(sheet, rows) {
  for (let row = 12; row <= 59; row += 1) {
    for (let col = 2; col <= 15; col += 1) {
      sheet.getCell(row, col).value = null;
    }
  }

  for (const item of rows) {
    const dayIndex = toNumber(item?.dayIndex);
    const cycle = toNumber(item?.cycle);
    const powerMw = getPowerMw(item);
    if (dayIndex === null || cycle === null || powerMw === null) continue;
    if (dayIndex < 0 || dayIndex > 6) continue;
    const targetRow = toRowFromCycle(cycle, 1, 48);
    if (!targetRow) continue;
    const forecastCol = 2 + dayIndex * 2;
    sheet.getCell(targetRow, forecastCol).value = powerMw;
    sheet.getCell(targetRow, forecastCol + 1).value = AVAILABLE_POWER_MW;
  }

  const orderedDays = [...rows]
    .filter((item) => typeof item?.day === "string")
    .sort((a, b) => (toNumber(a?.dayIndex) ?? 0) - (toNumber(b?.dayIndex) ?? 0));
  if (orderedDays.length) {
    sheet.getCell("B7").value = orderedDays[0].day;
    sheet.getCell("E7").value = orderedDays[orderedDays.length - 1].day;
  }

  setTotalRowBySummingColumns(sheet, 60, 12, 59, [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  ]);
}

function formatDateForFile(value) {
  const date = value instanceof Date ? value : new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function exportForecastXlsx({ period, rows, plantName }) {
  const { default: ExcelJS } = await import("exceljs");
  const templateFile = TEMPLATE_MAP[period];
  if (!templateFile) throw new Error("Unsupported period for XLSX export.");
  if (!Array.isArray(rows) || !rows.length) throw new Error("No data to export.");

  const templateUrl = `${import.meta.env.BASE_URL}templates/xlsx/${templateFile}`;
  const templateRes = await fetch(templateUrl);
  if (!templateRes.ok) {
    throw new Error(`Failed to load template file: ${templateFile}`);
  }
  const templateBuffer = await templateRes.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(templateBuffer);
  const sheet = workbook.getWorksheet(1);
  if (!sheet) throw new Error("Template has no worksheet.");

  if (plantName) {
    if (period === "weekly") {
      sheet.getCell("B8").value = plantName;
    } else {
      sheet.getCell("B7").value = plantName;
    }
  }

  if (period === "weekly") {
    fillWeeklySheet(sheet, rows);
  } else {
    fillDailyOrHourlySheet(sheet, rows, { includeTotalRow: period === "daily" });
  }

  const fileBuffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([fileBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const fileName = `${templateFile.replace(
    "_Template.xlsx",
    "",
  )}_${formatDateForFile()}.xlsx`;
  triggerDownload(blob, fileName);
}
