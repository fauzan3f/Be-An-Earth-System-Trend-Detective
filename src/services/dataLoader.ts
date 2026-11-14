import Papa from "papaparse";
import type {
  DatasetPayload,
  AppDatasets,
  MonthlyDataPoint,
  DailyDataPoint,
  DailyCoverageSummary,
  TrendAnalysisContract,
} from "../types";
import { calculateDynamicTrend } from "../utils/statistics";

// Raw imports for instant zero-latency loading and offline fallback
import rawMonthlyNo2 from "../data/no2_monthly_clean.csv?raw";
import rawDailyNo2 from "../data/no2_daily_clean.csv?raw";
import aodDefaultData from "../data/aod_west_kalimantan_2010_2025.json";

export const DEFAULT_AOD_DATASET: DatasetPayload = aodDefaultData as DatasetPayload;

/**
 * Parses cleaned NO2 CSV strings (monthly and daily) from Role 1
 */
export function parseCleanNo2Csvs(
  monthlyCsv: string,
  dailyCsv: string,
  excludePartialMonths: boolean = true
): DatasetPayload {
  // 1. Parse monthly CSV (date, no2_mean, valid_days)
  const parsedMonthly = Papa.parse<Record<string, any>>(monthlyCsv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const monthlySeries: MonthlyDataPoint[] = [];

  parsedMonthly.data.forEach((row) => {
    if (!row.date) return;
    const rawDateStr = String(row.date).trim();
    // Format YYYY-MM from 'YYYY-MM-DD 00:00:00+00:00'
    const dateYm = rawDateStr.split(" ")[0].slice(0, 7);
    const validDays = Number(row.valid_days) || 0;
    const rawVal = row.no2_mean;

    // Filter partial edge months (e.g. Oct 2010 has valid_days = 1 with negative outlier)
    if (excludePartialMonths && validDays < 5) {
      return;
    }

    const value =
      rawVal === null ||
      rawVal === undefined ||
      rawVal === "" ||
      isNaN(Number(rawVal))
        ? null
        : Number(rawVal);

    monthlySeries.push({
      date: dateYm,
      value,
      validDays,
    });
  });

  // 2. Parse daily CSV (date, no2)
  const parsedDaily = Papa.parse<Record<string, any>>(dailyCsv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const dailySeries: DailyDataPoint[] = [];
  let validDailyCount = 0;
  let missingDailyCount = 0;

  parsedDaily.data.forEach((row) => {
    if (!row.date) return;
    const rawDateStr = String(row.date).trim();
    const dateYmd = rawDateStr.split(" ")[0];
    const rawVal = row.no2;

    const isMissing =
      rawVal === null ||
      rawVal === undefined ||
      rawVal === "" ||
      isNaN(Number(rawVal));

    if (isMissing) {
      missingDailyCount++;
      dailySeries.push({
        date: dateYmd,
        value: null,
      });
    } else {
      validDailyCount++;
      dailySeries.push({
        date: dateYmd,
        value: Number(rawVal),
      });
    }
  });

  const totalDays = validDailyCount + missingDailyCount;
  const dailyCoverage: DailyCoverageSummary = {
    totalDays,
    validDays: validDailyCount,
    missingDays: missingDailyCount,
    validPercentage: totalDays > 0 ? (validDailyCount / totalDays) * 100 : 0,
  };

  const startYr =
    monthlySeries.length > 0 ? monthlySeries[0].date.slice(0, 4) : "2010";
  const endYr =
    monthlySeries.length > 0
      ? monthlySeries[monthlySeries.length - 1].date.slice(0, 4)
      : "2026";
  const period = `${startYr}-${endYr}`;

  const baseMeta: TrendAnalysisContract = {
    variable: "NO2",
    region: "West Kalimantan",
    period,
    unit: "molecules/cm²",
    trend_direction: "increasing",
    slope_per_year: 0,
    p_value: 0,
    confidence_interval: [0, 0],
    method: "Seasonal Mann-Kendall + Sen's slope",
    valid_months: monthlySeries.filter((d) => d.value !== null).length,
    missing_months: monthlySeries.filter((d) => d.value === null).length,
  };

  const { recalculated } = calculateDynamicTrend(
    monthlySeries,
    baseMeta,
    period
  );

  return {
    metadata: recalculated,
    series: monthlySeries,
    dailySeries,
    dailyCoverage,
  };
}

/**
 * Loads the actual cleaned Role 1 NO2 dataset directly
 */
export async function loadCleanNo2Dataset(
  excludePartialMonths: boolean = true
): Promise<DatasetPayload> {
  try {
    // Try browser fetch first for live runtime updates
    const [monthlyRes, dailyRes] = await Promise.all([
      fetch("/data/no2_monthly_clean.csv"),
      fetch("/data/no2_daily_clean.csv"),
    ]);

    if (monthlyRes.ok && dailyRes.ok) {
      const [monthlyCsv, dailyCsv] = await Promise.all([
        monthlyRes.text(),
        dailyRes.text(),
      ]);
      return parseCleanNo2Csvs(monthlyCsv, dailyCsv, excludePartialMonths);
    }
  } catch (err) {
    console.warn("Fetch failed, falling back to bundled CSV raw text:", err);
  }

  // Resilient fallback using bundled raw text
  return parseCleanNo2Csvs(rawMonthlyNo2, rawDailyNo2, excludePartialMonths);
}

/**
 * Default datasets loaded on app boot
 */
export async function loadDefaultDatasets(
  excludePartialMonths: boolean = true
): Promise<AppDatasets> {
  const no2 = await loadCleanNo2Dataset(excludePartialMonths);
  return {
    no2,
    aod: JSON.parse(JSON.stringify(DEFAULT_AOD_DATASET)),
  };
}

/**
 * Exports time-series data to standard CSV string
 */
export function exportToCsv(
  series: (MonthlyDataPoint | DailyDataPoint)[],
  variableName: string
): string {
  const data = series.map((pt) => ({
    date: pt.date,
    [variableName.toLowerCase()]: pt.value !== null ? pt.value : "",
  }));
  return Papa.unparse(data);
}

/**
 * Parses user-uploaded JSON or CSV content from Role 1
 */
export function parseUploadedFile(
  content: string,
  fileName: string,
  targetVariable: "NO2" | "AOD"
): DatasetPayload {
  const isJson =
    fileName.toLowerCase().endsWith(".json") || content.trim().startsWith("{");

  if (isJson) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.series && Array.isArray(parsed.series)) {
        const series: MonthlyDataPoint[] = parsed.series.map((item: any) => ({
          date: String(item.date || item.Date || item.time || "").trim(),
          value:
            item.value === null ||
            item.value === undefined ||
            item.value === "" ||
            isNaN(Number(item.value))
              ? null
              : Number(item.value),
        }));

        const period =
          parsed.metadata?.period ||
          (series.length > 0
            ? `${series[0].date.slice(0, 4)}-${series[series.length - 1].date.slice(0, 4)}`
            : "2010-2026");

        const baseMeta: TrendAnalysisContract = {
          variable: parsed.metadata?.variable || targetVariable,
          region: parsed.metadata?.region || "West Kalimantan",
          period,
          unit:
            parsed.metadata?.unit ||
            (targetVariable === "NO2" ? "molecules/cm²" : "unitless"),
          trend_direction: parsed.metadata?.trend_direction || "no trend",
          slope_per_year: parsed.metadata?.slope_per_year ?? 0,
          p_value: parsed.metadata?.p_value ?? 1,
          confidence_interval: parsed.metadata?.confidence_interval || [0, 0],
          method:
            parsed.metadata?.method || "Seasonal Mann-Kendall + Sen's slope",
          valid_months: parsed.metadata?.valid_months ?? 0,
          missing_months: parsed.metadata?.missing_months ?? 0,
        };

        const { recalculated } = calculateDynamicTrend(
          series,
          baseMeta,
          period
        );

        return {
          metadata: {
            ...recalculated,
            ...parsed.metadata,
          },
          series,
        };
      }
    } catch (err) {
      throw new Error(`Invalid JSON format: ${(err as Error).message}`);
    }
  }

  // Parse CSV
  const parseResult = Papa.parse<Record<string, any>>(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
    throw new Error(`CSV Parsing error: ${parseResult.errors[0].message}`);
  }

  const rows = parseResult.data;
  if (rows.length === 0) {
    throw new Error("CSV file contains no data rows.");
  }

  // Find date column and value column
  const sampleRow = rows[0];
  const keys = Object.keys(sampleRow);
  const dateKey =
    keys.find((k) => /date|time|month|year_month/i.test(k)) || keys[0];
  const valueKey =
    keys.find((k) => /no2_mean|no2|value|val|aod/i.test(k)) ||
    keys.find((k) => k !== dateKey) ||
    keys[1];

  if (!valueKey) {
    throw new Error("Could not find a valid numeric value column in the CSV.");
  }

  const series: MonthlyDataPoint[] = rows
    .map((row) => {
      const rawDateStr = String(row[dateKey] || "").trim();
      const dateFormatted = rawDateStr.split(" ")[0].slice(0, 7);
      const rawVal = row[valueKey];
      const validDays = Number(row.valid_days) || undefined;
      const numVal =
        rawVal === "" ||
        rawVal === null ||
        rawVal === undefined ||
        rawVal === "-999" ||
        rawVal === "-9999" ||
        isNaN(Number(rawVal))
          ? null
          : Number(rawVal);

      return {
        date: dateFormatted,
        value: numVal,
        validDays,
      };
    })
    .filter((pt) => pt.date.length > 0);

  if (series.length === 0) {
    throw new Error("No valid monthly entries parsed from CSV.");
  }

  const period = `${series[0].date.slice(0, 4)}-${series[series.length - 1].date.slice(0, 4)}`;

  const defaultMeta: TrendAnalysisContract = {
    variable: targetVariable,
    region: "West Kalimantan",
    period,
    unit: targetVariable === "NO2" ? "molecules/cm²" : "unitless",
    trend_direction: "no trend",
    slope_per_year: 0,
    p_value: 1,
    confidence_interval: [0, 0],
    method: "Seasonal Mann-Kendall + Sen's slope",
    valid_months: 0,
    missing_months: 0,
  };

  const { recalculated } = calculateDynamicTrend(series, defaultMeta, period);

  return {
    metadata: recalculated,
    series,
  };
}
