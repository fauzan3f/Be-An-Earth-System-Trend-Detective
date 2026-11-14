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
  value: number | null; // null if Fill Value / missing
  validDays?: number; // valid observation days in this month
  coveragePct?: number; // calendar day coverage percent
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
}

export interface AppDatasets {
  no2: DatasetPayload;
  aod: DatasetPayload;
}
