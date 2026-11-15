export interface NO2Metadata {
  region: string;
  source: string;
  variable: string;
  unit: string;
  spatial_resolution_degrees: number;
  start_period: string;
  end_period: string;
  expected_months: number;
  processed_months: number;
  missing_months: string[];
  invalid_months: string[];
  grid_index_file: string;
  grid_geometry: string;
  qc_note: string;
  boundary_note: string;
  generated_utc: string;
}

export interface NO2MonthlyRecord {
  date: string; // "2010-10" to "2026-10"
  year: number;
  month: number;
  mean_no2: number | null; // null for "2010-10"
  unit: string; // "molecules/cm2"
  qc_area_pct: number; // 0 to 100
  valid_grid_count: number; // out of 246
  total_grid_count: number; // 246
  missing_url_days: number;
  boundary_month: boolean; // true for "2010-10"
  data_available: boolean;
  qc_status: string; // "boundary_month" | "exploratory_pass"
  processing_version: string;
}

export interface GridCellProperties {
  date: string;
  no2: number | null; // null if failed QC or missing - NEVER convert null to 0!
  qc_pass: boolean;
  area_km2: number;
  valid_days: number;
  temporal_coverage_pct: number;
  unit: string;
}

export interface TrendAnalysisContract {
  variable: "NO2" | "AOD" | string;
  region: string; // e.g., "West Kalimantan"
  period: string; // e.g., "2010-2026"
  unit: string; // read dynamically from dataset metadata
  trend_direction: "increasing" | "decreasing" | "no trend";
  slope_per_year: number;
  p_value: number;
  confidence_interval: [number, number];
  method: string; // "OLS with month fixed effects and HAC (Newey-West)" or "Seasonal Mann-Kendall + Sen's slope"
  valid_months: number;
  missing_months: number;
  status?: "preliminary" | "verified";
  statistically_significant?: boolean;
  hac_p_value?: number;
  interpretation?: string;
  direction_of_point_estimate?: "positive" | "negative" | "neutral";
}

export interface MonthlyDataPoint {
  date: string; // YYYY-MM
  value: number | null; // null if Fill Value / missing / boundary month - NEVER converted to 0
  validDays?: number; // valid observation days in this month
  coveragePct?: number; // calendar day coverage percent
  qcAreaPct?: number; // qc_area_pct (0 to 100)
  validGridCount?: number; // valid_grid_count (out of 246)
  totalGridCount?: number; // total_grid_count (246)
  missingUrlDays?: number; // missing_url_days
  boundaryMonth?: boolean; // boundary_month (true for 2010-10)
  qcStatus?: string; // "boundary_month" | "exploratory_pass"
  geojsonPath?: string; // "grid_geojson/no2_grid_YYYY-MM.geojson"
}

export interface DailyDataPoint {
  date: string; // YYYY-MM-DD
  value: number | null; // null if cloud-screened / missing
}

export interface DailyCoverageSummary {
  totalDays: number;
  validDays: number;
  missingDays: number;
  validPercentage: number;
  negativeDays?: number;
}

export interface SensitivityAnalysisEntry {
  minimum_days: number;
  months_used: number;
  slope: number;
  p_value: number;
  ci_lower: number;
  ci_upper: number;
  significant?: boolean;
}

export interface CoverageValidationEntry {
  rule: string;
  months_used: number;
  slope: number;
  p_value: number;
  ci_lower: number;
  ci_upper: number;
}

export interface DatasetPayload {
  metadata: TrendAnalysisContract;
  series: MonthlyDataPoint[];
  dailySeries?: DailyDataPoint[];
  dailyCoverage?: DailyCoverageSummary;
  sensitivityAnalysis?: SensitivityAnalysisEntry[];
  coverageValidation?: CoverageValidationEntry[];
  rawMetadata?: NO2Metadata;
}

export interface AppDatasets {
  no2: DatasetPayload;
  aod: DatasetPayload;
}
