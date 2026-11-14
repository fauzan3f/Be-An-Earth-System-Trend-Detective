export interface TrendAnalysisContract {
  variable: "NO2" | "AOD" | string;
  region: string; // e.g., "West Kalimantan"
  period: string; // e.g., "2010-2026"
  unit: string; // read dynamically from dataset metadata
  trend_direction: "increasing" | "decreasing" | "no trend";
  slope_per_year: number;
  p_value: number;
  confidence_interval: [number, number];
  method: string; // "Seasonal Mann-Kendall + Sen's slope"
  valid_months: number;
  missing_months: number;
}

export interface MonthlyDataPoint {
  date: string; // YYYY-MM
  value: number | null; // null if Fill Value / missing
  validDays?: number; // valid observation days in this month
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
}

export interface DatasetPayload {
  metadata: TrendAnalysisContract;
  series: MonthlyDataPoint[];
  dailySeries?: DailyDataPoint[];
  dailyCoverage?: DailyCoverageSummary;
}

export interface AppDatasets {
  no2: DatasetPayload;
  aod: DatasetPayload;
}
