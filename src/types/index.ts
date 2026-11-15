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

export interface AODMetadata {
  region: string;
  source: string;
  variable: string;
  wavelength_nm: number;
  unit: string;
  requested_bbox: [number, number, number, number];
  data_bbox: [number, number, number, number];
  spatial_method: string;
  spatial_grid_available: boolean;
  start_date: string;
  end_date: string;
  months: number;
  months_qc_pass: number;
  daily_source_rows: number;
  daily_fill_value_rows: number;
  daily_missing_dates: number;
  daily_valid_values: number;
  qc_note: string;
  comparability_note: string;
  map_note: string;
}

export interface AODMonthlyRecord {
  date: string; // "2010-10" to "2026-10"
  year: number;
  month: number;
  mean_aod: number | null; // null for boundary month or QC fail (e.g. 2010-10, 2022-10)
  unit: string; // "dimensionless"
  valid_days: number;
  expected_days_in_study: number;
  source_record_days: number;
  missing_source_days: number;
  missing_value_days: number;
  temporal_coverage_pct: number;
  qc_pass: boolean;
  boundary_month: boolean;
  data_available: boolean;
  qc_status: "boundary_month" | "exploratory_pass" | "exploratory_fail" | string;
}

export interface ComparisonMetadata {
  region: string;
  period: string;
  records: number;
  both_available: number;
  no2_available: number;
  aod_available: number;
  no2: {
    source: string;
    unit: string;
    spatial_method: string;
  };
  aod: {
    source: string;
    unit: string;
    spatial_method: string;
  };
  limitations: string[];
}

export interface NO2AODComparisonRecord {
  date: string; // "2010-10" to "2026-10"
  year: number;
  month: number;
  no2: number | null;
  aod: number | null;
  no2_available: boolean;
  aod_available: boolean;
  both_available: boolean;
  no2_qc_status: string;
  aod_qc_status: string;
  no2_qc_area_pct: number;
  aod_temporal_coverage_pct: number;
}

export interface DatasetPayload {
  metadata: TrendAnalysisContract;
  series: MonthlyDataPoint[];
  dailySeries?: DailyDataPoint[];
  dailyCoverage?: DailyCoverageSummary;
  sensitivityAnalysis?: SensitivityAnalysisEntry[];
  coverageValidation?: CoverageValidationEntry[];
  rawMetadata?: NO2Metadata | AODMetadata;
  aodRecords?: AODMonthlyRecord[];
}

export interface ComparisonDatasetPayload {
  metadata: ComparisonMetadata;
  records: NO2AODComparisonRecord[];
}

export interface AppDatasets {
  no2: DatasetPayload;
  aod: DatasetPayload;
  comparison?: ComparisonDatasetPayload;
}
