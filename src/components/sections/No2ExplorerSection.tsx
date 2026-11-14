import React from "react";
import {
  Info,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  Layers,
  ArrowDown,
} from "lucide-react";
import type { TrendAnalysisContract, MonthlyDataPoint, DailyDataPoint, DailyCoverageSummary } from "../../types";
import { TimeSeriesChart } from "../TimeSeriesChart";
import { formatScientificValue, formatSlope, formatSlopePerDecade } from "../../utils/formatters";

interface No2ExplorerSectionProps {
  metadata: TrendAnalysisContract;
  filteredMonthlySeries: MonthlyDataPoint[];
  filteredDailySeries: DailyDataPoint[];
  trendlinePoints: (number | null)[];
  dailyCoverage?: DailyCoverageSummary;
  viewMode: "monthly" | "daily";
  onViewModeChange: (mode: "monthly" | "daily") => void;
  onOpenGlossaryTooltip: (term: "NO2" | "SenSlope" | "pValue") => void;
  onNextStep: () => void;
}

export const No2ExplorerSection: React.FC<No2ExplorerSectionProps> = ({
  metadata,
  filteredMonthlySeries,
  filteredDailySeries,
  trendlinePoints,
  dailyCoverage,
  viewMode,
  onViewModeChange,
  onOpenGlossaryTooltip,
  onNextStep,
}) => {
  const isSignificant = metadata.p_value < 0.05;
  const totalMonths = metadata.valid_months + metadata.missing_months;
  const validPercentage = totalMonths > 0 ? (metadata.valid_months / totalMonths) * 100 : 0;

  const renderTrendBadge = () => {
    if (metadata.trend_direction === "increasing") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-rose-950/70 text-rose-300 border border-rose-800/80">
          <ArrowUpRight className="w-4 h-4 text-rose-400" aria-hidden="true" />
          Increasing Trend
        </span>
      );
    }
    if (metadata.trend_direction === "decreasing") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
          <ArrowDownRight className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          Decreasing Trend
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
        <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
        No Significant Trend
      </span>
    );
  };

  const renderSignificanceBadge = () => {
    if (isSignificant) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-950 text-sky-300 border border-sky-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
          Significant (p &lt; 0.05)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950 text-amber-300 border border-amber-800">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
        Not Significant (p &ge; 0.05)
      </span>
    );
  };

  return (
    <section
      id="no2-explorer"
      aria-labelledby="no2-heading"
      className="py-14 border-b border-slate-800 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
            <span>Step 3</span>
            <span>·</span>
            <span>Variable 1 Exploration</span>
          </div>
          <h2 id="no2-heading" className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-sky-400" aria-hidden="true" />
            NO2 Explorer: Tropospheric Nitrogen Dioxide
          </h2>
          <p className="text-xs text-slate-400">
            Aura/OMI Cleaned Record ({metadata.period}) · West Kalimantan
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-space-850 p-1 rounded-lg border border-slate-700/80 self-start sm:self-center">
          <Layers className="w-3.5 h-3.5 text-slate-400 ml-1.5" aria-hidden="true" />
          <button
            type="button"
            onClick={() => onViewModeChange("monthly")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === "monthly"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            aria-pressed={viewMode === "monthly"}
          >
            Monthly Mean
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("daily")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === "daily"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            aria-pressed={viewMode === "daily"}
            title="Inspect 5,817 daily satellite observations"
          >
            Daily Observations
          </button>
        </div>
      </div>

      {/* Plain-Language Explainer Box */}
      <div className="p-4 rounded-xl bg-space-900 border border-sky-900/40 text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="text-sky-300 font-semibold block mb-0.5">What Satellite NO2 Represents:</strong>
          Tropospheric column NO2 measures the total count of nitrogen dioxide molecules in a vertical column of air
          extending from the ground up to the tropopause (measured in <span className="font-mono text-slate-200">molecules/cm²</span>).
          In West Kalimantan, emissions originate from fossil fuel combustion (vehicles, diesel power plants, mining and palm oil machinery)
          as well as seasonal agricultural clearing and peatland fires. It reflects total atmospheric column loading,
          not a direct nose-level ground air station.
        </div>
      </div>

      {/* Dynamic Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Trend Direction */}
        <div className="p-3.5 rounded-xl bg-space-900 border border-slate-800 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Trend Direction
          </div>
          <div className="pt-0.5">{renderTrendBadge()}</div>
          <div className="pt-1">{renderSignificanceBadge()}</div>
        </div>

        {/* Rate of Change per year & decade */}
        <div className="p-3.5 rounded-xl bg-space-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Sen's Slope</span>
            <button
              type="button"
              onClick={() => onOpenGlossaryTooltip("SenSlope")}
              className="text-slate-500 hover:text-slate-300"
              aria-label="What is Sen's Slope?"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="text-sm sm:text-base font-mono font-bold text-slate-100">
            {formatSlope(metadata.slope_per_year, metadata.unit)}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {formatSlopePerDecade(metadata.slope_per_year, metadata.unit)}
          </div>
        </div>

        {/* Statistical Significance */}
        <div className="p-3.5 rounded-xl bg-space-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>p-value (MK Test)</span>
            <button
              type="button"
              onClick={() => onOpenGlossaryTooltip("pValue")}
              className="text-slate-500 hover:text-slate-300"
              aria-label="What is p-value?"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="text-base sm:text-lg font-mono font-bold text-slate-100">
            {metadata.p_value < 0.0001 ? "< 0.0001" : metadata.p_value}
          </div>
          <div className="text-[11px] text-slate-400">
            95% CI: [{formatScientificValue(metadata.confidence_interval[0])}, {formatScientificValue(metadata.confidence_interval[1])}]
          </div>
        </div>

        {/* Data Coverage & Quality */}
        <div className="p-3.5 rounded-xl bg-space-900 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Data Quality &amp; Source
          </div>
          <div className="text-xs font-semibold text-slate-200">
            NASA Aura / OMI OMNO2d
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {metadata.valid_months} valid months ({validPercentage.toFixed(1)}%)
          </div>
          {dailyCoverage && (
            <div className="flex items-center gap-1 text-[10px] text-sky-300/90 pt-0.5">
              <CalendarCheck className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>{dailyCoverage.validDays.toLocaleString()} valid days / {dailyCoverage.missingDays} cloud days</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Time-Series Chart */}
      <div className="p-5 rounded-2xl bg-space-900 border border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            {viewMode === "monthly"
              ? "Monthly Mean Tropospheric NO2 with Sen's Slope Trendline"
              : "High-Resolution Daily Satellite Observations (5,817 Daily Points)"}
          </span>
          <span className="font-mono text-[11px]">
            Unit: {metadata.unit}
          </span>
        </div>

        <TimeSeriesChart
          variableName="NO2"
          unit={metadata.unit}
          colorScheme="cyan"
          dataPoints={viewMode === "daily" ? filteredDailySeries : filteredMonthlySeries}
          trendlinePoints={viewMode === "monthly" ? trendlinePoints : undefined}
          isDailyView={viewMode === "daily"}
        />
      </div>

      {/* Next Step CTA */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <span>Step 4: Explore AOD Trends</span>
          <ArrowDown className="w-4 h-4 text-amber-200" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
