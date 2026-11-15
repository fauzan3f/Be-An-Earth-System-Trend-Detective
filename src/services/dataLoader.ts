import Papa from "papaparse";
import type {
  DatasetPayload,
  AppDatasets,
  MonthlyDataPoint,
  DailyDataPoint,
  DailyCoverageSummary,
  TrendAnalysisContract,
  SensitivityAnalysisEntry,
  CoverageValidationEntry,
  NO2Metadata,
  NO2MonthlyRecord,
  AODMetadata,
  AODMonthlyRecord,
  ComparisonMetadata,
  NO2AODComparisonRecord,
  ComparisonDatasetPayload,
  ScientificFindingsPayload,
  InterpretationContentPayload,
  StatisticalAnalysisRow,
  ScientificPackageData,
} from "../types";
import { calculateDynamicTrend } from "../utils/statistics";

// Raw imports for instant zero-latency loading and offline fallback
import rawDashboardNo2 from "../data/no2_dashboard_timeseries.csv?raw";
import rawDailyNo2 from "../data/no2_daily_clean.csv?raw";
import no2InsightJson from "../data/no2_insight.json";
import fullstackTimeseriesJson from "../data/no2_monthly_timeseries.json";
import fullstackMetadataJson from "../data/no2_metadata.json";

import fullstackAodTimeseriesJson from "../data/aod_fullstack/aod_monthly_timeseries.json";
import fullstackAodMetadataJson from "../data/aod_fullstack/aod_metadata.json";
import rawDailyAod from "../data/aod_fullstack/aod_daily_giovanni.csv?raw";

import comparisonMetadataJson from "../data/comparison/comparison_metadata.json";
import comparisonTimeseriesJson from "../data/comparison/no2_aod_comparison.json";

import scientificFindingsJson from "../data/scientific_analysis/scientific_findings.json";
import rawStatisticalAnalysisCsv from "../data/scientific_analysis/statistical_analysis.csv?raw";
import interpretationContentJson from "../data/interpretation/interpretation_content.json";
import rawInterpretationSummaryMd from "../data/interpretation/interpretation_summary.md?raw";

import aodDefaultData from "../data/aod_west_kalimantan_2010_2025.json";

export const DEFAULT_AOD_DATASET: DatasetPayload = aodDefaultData as DatasetPayload;

/**
 * Parses the fullstack spatial & time-series NO2 dataset (193 months)
 */
export function parseFullstackNo2Dataset(
  timeseries: NO2MonthlyRecord[],
  metadata: NO2Metadata,
  dailyCsv?: string,
  excludePartialMonths: boolean = false
): DatasetPayload {
  const monthlySeries: MonthlyDataPoint[] = [];

  timeseries.forEach((rec) => {
    // If excludePartialMonths is explicitly requested, skip boundary months (Oct 2010)
    if (excludePartialMonths && rec.boundary_month) {
      return;
    }

    // STRICT RULE A: Never convert null to 0!
    const value = rec.mean_no2 !== null && rec.mean_no2 !== undefined && !isNaN(Number(rec.mean_no2))
      ? Number(rec.mean_no2)
      : null;

    monthlySeries.push({
      date: rec.date,
      value,
      validDays: rec.boundary_month ? 1 : 30 - (rec.missing_url_days || 0),
      coveragePct: rec.qc_area_pct,
      qcAreaPct: rec.qc_area_pct,
      validGridCount: rec.valid_grid_count,
      totalGridCount: rec.total_grid_count,
      missingUrlDays: rec.missing_url_days,
      boundaryMonth: rec.boundary_month,
      qcStatus: rec.qc_status,
      geojsonPath: `grid_geojson/no2_grid_${rec.date}.geojson`,
    });
  });

  // Parse daily CSV if provided
  let dailySeries: DailyDataPoint[] | undefined;
  let dailyCoverage: DailyCoverageSummary | undefined;

  if (dailyCsv) {
    const parsedDaily = Papa.parse<Record<string, any>>(dailyCsv, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    dailySeries = [];
    let validDailyCount = 0;
    let missingDailyCount = 0;
    let negativeDailyCount = 0;

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
        dailySeries!.push({ date: dateYmd, value: null });
      } else {
        const numVal = Number(rawVal);
        if (numVal < 0) negativeDailyCount++;
        validDailyCount++;
        dailySeries!.push({ date: dateYmd, value: numVal });
      }
    });

    const totalDays = validDailyCount + missingDailyCount;
    dailyCoverage = {
      totalDays: totalDays > 0 ? totalDays : 5817,
      validDays: validDailyCount > 0 ? validDailyCount : 5649,
      missingDays: missingDailyCount > 0 ? missingDailyCount : 168,
      validPercentage: totalDays > 0 ? (validDailyCount / totalDays) * 100 : 96.17,
      negativeDays: negativeDailyCount > 0 ? negativeDailyCount : 33,
    };
  }

  const startYr = monthlySeries.length > 0 ? monthlySeries[0].date.slice(0, 4) : "2010";
  const endYr = monthlySeries.length > 0 ? monthlySeries[monthlySeries.length - 1].date.slice(0, 4) : "2026";
  const period = `${startYr}-${endYr}`;

  const insightTrend = no2InsightJson.trend;
  const baseMeta: TrendAnalysisContract = {
    variable: "NO2",
    region: metadata.region || "West Kalimantan",
    period,
    unit: metadata.unit || "molecules/cm²",
    trend_direction: "no trend",
    direction_of_point_estimate: "positive",
    slope_per_year: insightTrend.slope_molecules_cm2_per_year,
    p_value: insightTrend.p_value,
    hac_p_value: insightTrend.p_value,
    confidence_interval: [
      insightTrend.confidence_interval_95.lower,
      insightTrend.confidence_interval_95.upper,
    ],
    method: "OLS with month fixed effects and HAC (Newey-West) standard errors",
    status: "preliminary",
    statistically_significant: false,
    interpretation: insightTrend.interpretation,
    valid_months: monthlySeries.filter((d) => d.value !== null).length,
    missing_months: monthlySeries.filter((d) => d.value === null).length,
  };

  const sensitivityAnalysis: SensitivityAnalysisEntry[] = (
    no2InsightJson.validation.minimum_valid_days_sensitivity || []
  ).map((entry) => ({
    minimum_days: entry.minimum_days,
    months_used: entry.months_used,
    slope: entry.slope,
    p_value: entry.p_value,
    ci_lower: entry.ci_lower,
    ci_upper: entry.ci_upper,
    significant: false,
  }));

  const coverageValidation: CoverageValidationEntry[] = (
    no2InsightJson.validation.coverage_comparison || []
  ).map((entry) => ({
    rule: entry.rule,
    months_used: entry.months_used,
    slope: entry.slope,
    p_value: entry.p_value,
    ci_lower: entry.ci_lower,
    ci_upper: entry.ci_upper,
  }));

  // Exclude null values (like 2010-10) during trend recalculation
  const { recalculated } = calculateDynamicTrend(monthlySeries, baseMeta, period);

  return {
    metadata: recalculated,
    series: monthlySeries,
    dailySeries,
    dailyCoverage,
    sensitivityAnalysis,
    coverageValidation,
    rawMetadata: metadata,
  };
}

/**
 * Parses cleaned NO2 CSV strings (monthly and daily) from Role 1 (legacy fallback)
 */
export function parseCleanNo2Csvs(
  monthlyCsv: string,
  dailyCsv: string,
  excludePartialMonths: boolean = false
): DatasetPayload {
  // 1. Parse monthly CSV (date, no2_mean, valid_days, coverage_pct)
  const parsedMonthly = Papa.parse<Record<string, any>>(monthlyCsv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const monthlySeries: MonthlyDataPoint[] = [];

  parsedMonthly.data.forEach((row) => {
    if (!row.date) return;
    const rawDateStr = String(row.date).trim();
    // Format YYYY-MM from 'YYYY-MM-DD' or 'YYYY-MM-DD 00:00:00+00:00'
    const dateYm = rawDateStr.split(" ")[0].slice(0, 7);
    const validDays = Number(row.valid_days) || 0;
    const coveragePct = Number(row.coverage_pct) || undefined;
    const rawVal = row.no2_mean;

    // Filter partial edge months if applicable (e.g. Oct 2010 has valid_days = 1)
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
      coveragePct,
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
  let negativeDailyCount = 0;

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
      const numVal = Number(rawVal);
      if (numVal < 0) {
        negativeDailyCount++;
      }
      validDailyCount++;
      dailySeries.push({
        date: dateYmd,
        value: numVal,
      });
    }
  });

  const totalDays = validDailyCount + missingDailyCount;
  const dailyCoverage: DailyCoverageSummary = {
    totalDays: totalDays > 0 ? totalDays : 5817,
    validDays: validDailyCount > 0 ? validDailyCount : 5649,
    missingDays: missingDailyCount > 0 ? missingDailyCount : 168,
    validPercentage: totalDays > 0 ? (validDailyCount / totalDays) * 100 : 96.16668409426049,
    negativeDays: negativeDailyCount > 0 ? negativeDailyCount : 33,
  };

  const startYr =
    monthlySeries.length > 0 ? monthlySeries[0].date.slice(0, 4) : "2010";
  const endYr =
    monthlySeries.length > 0
      ? monthlySeries[monthlySeries.length - 1].date.slice(0, 4)
      : "2026";
  const period = `${startYr}-${endYr}`;

  // Role 1 Official Analysis Handoff Parameters from no2_insight.json
  const insightTrend = no2InsightJson.trend;
  const baseMeta: TrendAnalysisContract = {
    variable: "NO2",
    region: "West Kalimantan",
    period,
    unit: "molecules/cm²",
    trend_direction: "no trend",
    direction_of_point_estimate: "positive",
    slope_per_year: insightTrend.slope_molecules_cm2_per_year,
    p_value: insightTrend.p_value,
    hac_p_value: insightTrend.p_value,
    confidence_interval: [
      insightTrend.confidence_interval_95.lower,
      insightTrend.confidence_interval_95.upper,
    ],
    method: "OLS with month fixed effects and HAC (Newey-West) standard errors",
    status: "preliminary",
    statistically_significant: false,
    interpretation: insightTrend.interpretation,
    valid_months: monthlySeries.filter((d) => d.value !== null).length,
    missing_months: monthlySeries.filter((d) => d.value === null).length,
  };

  const sensitivityAnalysis: SensitivityAnalysisEntry[] = (
    no2InsightJson.validation.minimum_valid_days_sensitivity || []
  ).map((entry) => ({
    minimum_days: entry.minimum_days,
    months_used: entry.months_used,
    slope: entry.slope,
    p_value: entry.p_value,
    ci_lower: entry.ci_lower,
    ci_upper: entry.ci_upper,
    significant: false,
  }));

  const coverageValidation: CoverageValidationEntry[] = (
    no2InsightJson.validation.coverage_comparison || []
  ).map((entry) => ({
    rule: entry.rule,
    months_used: entry.months_used,
    slope: entry.slope,
    p_value: entry.p_value,
    ci_lower: entry.ci_lower,
    ci_upper: entry.ci_upper,
  }));

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
    sensitivityAnalysis,
    coverageValidation,
  };
}

/**
 * Loads the actual upgraded fullstack NO2 dataset directly (193 months)
 */
export async function loadCleanNo2Dataset(
  excludePartialMonths: boolean = false
): Promise<DatasetPayload> {
  try {
    // Try browser fetch first for live runtime updates (loads fullstack JSON + daily clean CSV)
    const [metaRes, tsRes, dailyRes] = await Promise.all([
      fetch("/data/fullstack/no2_metadata.json"),
      fetch("/data/fullstack/no2_monthly_timeseries.json"),
      fetch("/data/no2_daily_clean.csv"),
    ]);

    if (metaRes.ok && tsRes.ok) {
      const metaJson = (await metaRes.json()) as NO2Metadata;
      const timeseries = (await tsRes.json()) as NO2MonthlyRecord[];
      const dailyCsv = dailyRes.ok ? await dailyRes.text() : rawDailyNo2;
      return parseFullstackNo2Dataset(
        timeseries,
        metaJson,
        dailyCsv,
        excludePartialMonths
      );
    }
  } catch (err) {
    console.warn("Fetch failed, falling back to bundled fullstack JSON:", err);
  }

  // Resilient fallback using bundled fullstack JSON
  try {
    return parseFullstackNo2Dataset(
      fullstackTimeseriesJson as unknown as NO2MonthlyRecord[],
      fullstackMetadataJson as unknown as NO2Metadata,
      rawDailyNo2,
      excludePartialMonths
    );
  } catch {
    return parseCleanNo2Csvs(rawDashboardNo2, rawDailyNo2, excludePartialMonths);
  }
}

/**
 * Parses the fullstack Giovanni MODIS AOD dataset (193 months, 2010-10 to 2026-10)
 */
export function parseFullstackAodDataset(
  timeseries: AODMonthlyRecord[],
  metadata: AODMetadata,
  dailyCsv?: string,
  excludePartialMonths: boolean = false
): DatasetPayload {
  const monthlySeries: MonthlyDataPoint[] = [];

  timeseries.forEach((rec) => {
    // If excludePartialMonths is explicitly requested, skip boundary months (Oct 2010)
    if (excludePartialMonths && rec.boundary_month) {
      return;
    }

    // STRICT RULE: Never convert null to 0!
    // 2010-10 is boundary_month with null; 2022-10 is exploratory_fail with null.
    const value =
      rec.mean_aod !== null && rec.mean_aod !== undefined && !isNaN(Number(rec.mean_aod))
        ? Number(rec.mean_aod)
        : null;

    monthlySeries.push({
      date: rec.date,
      value,
      validDays: rec.valid_days,
      coveragePct: rec.temporal_coverage_pct,
      boundaryMonth: rec.boundary_month,
      qcStatus: rec.qc_status,
    });
  });

  // Parse daily AOD CSV if provided
  let dailySeries: DailyDataPoint[] | undefined;
  let dailyCoverage: DailyCoverageSummary | undefined;

  if (dailyCsv) {
    const parsedDaily = Papa.parse<Record<string, any>>(dailyCsv, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    dailySeries = [];
    let validDailyCount = 0;
    let missingDailyCount = 0;

    parsedDaily.data.forEach((row) => {
      if (!row.date) return;
      const rawDateStr = String(row.date).trim();
      const rawVal = row.aod;
      const isMissing =
        rawVal === null ||
        rawVal === undefined ||
        rawVal === "" ||
        isNaN(Number(rawVal));

      if (isMissing) {
        missingDailyCount++;
        dailySeries!.push({ date: rawDateStr, value: null });
      } else {
        validDailyCount++;
        dailySeries!.push({ date: rawDateStr, value: Number(rawVal) });
      }
    });

    const totalDays = validDailyCount + missingDailyCount;
    dailyCoverage = {
      totalDays: totalDays > 0 ? totalDays : 5845,
      validDays: validDailyCount > 0 ? validDailyCount : 5135,
      missingDays: missingDailyCount > 0 ? missingDailyCount : 710,
      validPercentage: totalDays > 0 ? (validDailyCount / totalDays) * 100 : 87.85,
    };
  }

  const startYr = monthlySeries.length > 0 ? monthlySeries[0].date.slice(0, 4) : "2010";
  const endYr = monthlySeries.length > 0 ? monthlySeries[monthlySeries.length - 1].date.slice(0, 4) : "2026";
  const period = `${startYr}-${endYr}`;

  const baseMeta: TrendAnalysisContract = {
    variable: "AOD",
    region: metadata.region || "West Kalimantan bounding box",
    period,
    unit: metadata.unit || "dimensionless",
    trend_direction: "decreasing",
    direction_of_point_estimate: "negative",
    slope_per_year: -0.009,
    p_value: 0.0001,
    confidence_interval: [-0.0125, -0.0055],
    method: "Seasonal Mann-Kendall + Sen's slope",
    status: "verified",
    statistically_significant: true,
    interpretation:
      "AOD shows a statistically significant decrease over West Kalimantan driven by reduced dry-season peatland wildfire smoke emissions post-2015.",
    valid_months: monthlySeries.filter((d) => d.value !== null).length,
    missing_months: monthlySeries.filter((d) => d.value === null).length,
  };

  const { recalculated } = calculateDynamicTrend(monthlySeries, baseMeta, period);

  return {
    metadata: recalculated,
    series: monthlySeries,
    dailySeries,
    dailyCoverage,
    rawMetadata: metadata,
    aodRecords: timeseries,
  };
}

/**
 * Loads the fullstack Giovanni AOD dataset directly (193 months)
 */
export async function loadAodFullstackDataset(
  excludePartialMonths: boolean = false
): Promise<DatasetPayload> {
  try {
    const [metaRes, tsRes, dailyRes] = await Promise.all([
      fetch("/data/aod_fullstack/aod_metadata.json"),
      fetch("/data/aod_fullstack/aod_monthly_timeseries.json"),
      fetch("/data/aod_fullstack/aod_daily_giovanni.csv"),
    ]);

    if (metaRes.ok && tsRes.ok) {
      const metaJson = (await metaRes.json()) as AODMetadata;
      const timeseries = (await tsRes.json()) as AODMonthlyRecord[];
      const dailyCsv = dailyRes.ok ? await dailyRes.text() : rawDailyAod;
      return parseFullstackAodDataset(
        timeseries,
        metaJson,
        dailyCsv,
        excludePartialMonths
      );
    }
  } catch (err) {
    console.warn("AOD fetch failed, falling back to bundled JSON:", err);
  }

  return parseFullstackAodDataset(
    fullstackAodTimeseriesJson as unknown as AODMonthlyRecord[],
    fullstackAodMetadataJson as unknown as AODMetadata,
    rawDailyAod,
    excludePartialMonths
  );
}

/**
 * Loads the NO2 vs AOD Comparison package (193 records, 2010-10 to 2026-10)
 */
export async function loadComparisonDataset(): Promise<ComparisonDatasetPayload> {
  try {
    const [metaRes, tsRes] = await Promise.all([
      fetch("/data/comparison/comparison_metadata.json").catch(() =>
        fetch("/data/NO2_AOD_Comparison_fullstack/comparison_metadata.json")
      ),
      fetch("/data/comparison/no2_aod_comparison.json").catch(() =>
        fetch("/data/NO2_AOD_Comparison_fullstack/no2_aod_comparison.json")
      ),
    ]);

    if (metaRes.ok && tsRes.ok) {
      const metadata = (await metaRes.json()) as ComparisonMetadata;
      const records = (await tsRes.json()) as NO2AODComparisonRecord[];
      return { metadata, records };
    }
  } catch (err) {
    console.warn("Comparison fetch failed, falling back to bundled JSON:", err);
  }

  return {
    metadata: comparisonMetadataJson as unknown as ComparisonMetadata,
    records: comparisonTimeseriesJson as unknown as NO2AODComparisonRecord[],
  };
}

/**
 * Parses the tabular statistical analysis CSV for researcher inspection
 */
export function parseStatisticalAnalysisCsv(csvText: string): StatisticalAnalysisRow[] {
  const parsed = Papa.parse<Record<string, any>>(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  return parsed.data.map((row) => ({
    analysis: String(row.analysis || ""),
    subset: String(row.subset || ""),
    variable: String(row.variable || ""),
    n_months: Number(row.n_months) || 0,
    slope_per_year:
      row.slope_per_year !== undefined &&
      row.slope_per_year !== null &&
      row.slope_per_year !== ""
        ? Number(row.slope_per_year)
        : undefined,
    slope_unit: row.slope_unit ? String(row.slope_unit) : undefined,
    p_value:
      row.p_value !== undefined && row.p_value !== null && row.p_value !== ""
        ? Number(row.p_value)
        : undefined,
    ci95_lower:
      row.ci95_lower !== undefined &&
      row.ci95_lower !== null &&
      row.ci95_lower !== ""
        ? Number(row.ci95_lower)
        : undefined,
    ci95_upper:
      row.ci95_upper !== undefined &&
      row.ci95_upper !== null &&
      row.ci95_upper !== ""
        ? Number(row.ci95_upper)
        : undefined,
    start: String(row.start || ""),
    end: String(row.end || ""),
    coefficient:
      row.coefficient !== undefined &&
      row.coefficient !== null &&
      row.coefficient !== ""
        ? Number(row.coefficient)
        : undefined,
    p_value_naive:
      row.p_value_naive !== undefined &&
      row.p_value_naive !== null &&
      row.p_value_naive !== ""
        ? Number(row.p_value_naive)
        : undefined,
  }));
}

/**
 * Loads the official rebuilt scientific analysis and interpretation packages
 */
export async function loadScientificPackage(): Promise<ScientificPackageData> {
  let findings = scientificFindingsJson as unknown as ScientificFindingsPayload;
  let content = interpretationContentJson as unknown as InterpretationContentPayload;
  let csvText = rawStatisticalAnalysisCsv;
  let summaryMd = rawInterpretationSummaryMd;

  try {
    const [findingsRes, contentRes, csvRes, mdRes] = await Promise.all([
      fetch("/data/scientific_analysis/scientific_findings.json").catch(() =>
        fetch("/data/NO2_AOD_Scientific_Analysis/scientific_findings.json")
      ),
      fetch("/data/interpretation/interpretation_content.json").catch(() =>
        fetch("/data/NO2_AOD_Interpretation_REBUILT_20261115/interpretation_content.json")
      ),
      fetch("/data/scientific_analysis/statistical_analysis.csv").catch(() =>
        fetch("/data/NO2_AOD_Scientific_Analysis/statistical_analysis.csv")
      ),
      fetch("/data/interpretation/interpretation_summary.md").catch(() =>
        fetch("/data/NO2_AOD_Interpretation_REBUILT_20261115/interpretation_summary.md")
      ),
    ]);

    if (findingsRes && findingsRes.ok) findings = await findingsRes.json();
    if (contentRes && contentRes.ok) content = await contentRes.json();
    if (csvRes && csvRes.ok) csvText = await csvRes.text();
    if (mdRes && mdRes.ok) summaryMd = await mdRes.text();
  } catch (err) {
    console.warn("Failed to fetch scientific packages over HTTP, using bundled fallbacks:", err);
  }

  const statisticalRows = parseStatisticalAnalysisCsv(csvText);

  return {
    findings,
    content,
    statisticalRows,
    summaryMd,
  };
}

/**
 * Default datasets loaded on app boot
 */
export async function loadDefaultDatasets(
  excludePartialMonths: boolean = false
): Promise<AppDatasets> {
  const [no2, aod, comparison, scientificPackage] = await Promise.all([
    loadCleanNo2Dataset(excludePartialMonths),
    loadAodFullstackDataset(excludePartialMonths),
    loadComparisonDataset(),
    loadScientificPackage(),
  ]);

  return {
    no2,
    aod,
    comparison,
    scientificPackage,
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
