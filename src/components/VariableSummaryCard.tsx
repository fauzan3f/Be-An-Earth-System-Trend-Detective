import React from "react";
import type { TrendAnalysisContract, DailyCoverageSummary } from "../types";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info,
  CalendarCheck,
} from "lucide-react";
import { formatScientificValue, formatSlope } from "../utils/formatters";

interface VariableSummaryCardProps {
  metadata: TrendAnalysisContract;
  colorScheme: "cyan" | "amber";
  dailyCoverage?: DailyCoverageSummary;
  onOpenGlossaryTooltip: (term: "NO2" | "AOD" | "SenSlope" | "pValue") => void;
}

export const VariableSummaryCard: React.FC<VariableSummaryCardProps> = ({
  metadata,
  colorScheme,
  dailyCoverage,
  onOpenGlossaryTooltip,
}) => {
  const isCyan = colorScheme === "cyan";
  const isSignificant = metadata.p_value < 0.05;
  const totalMonths = metadata.valid_months + metadata.missing_months;
  const validMonthPercentage =
    totalMonths > 0 ? (metadata.valid_months / totalMonths) * 100 : 0;

  // Trend direction styling
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
          <ArrowDownRight
            className="w-4 h-4 text-emerald-400"
            aria-hidden="true"
          />
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

  const formattedSlope = formatSlope(metadata.slope_per_year, metadata.unit);
  const formattedCiLower = formatScientificValue(metadata.confidence_interval[0]);
  const formattedCiUpper = formatScientificValue(metadata.confidence_interval[1]);

  return (
    <div className="bg-space-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
              isCyan
                ? "bg-sky-950/80 text-sky-300 border-sky-700"
                : "bg-amber-950/80 text-amber-300 border-amber-700"
            }`}
          >
            {metadata.variable}
          </span>
          <button
            type="button"
            onClick={() =>
              onOpenGlossaryTooltip(metadata.variable as "NO2" | "AOD")
            }
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-400"
            aria-label={`Learn about ${metadata.variable}`}
            title={`View scientific definition for ${metadata.variable}`}
          >
            <Info className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {renderTrendBadge()}
          {renderSignificanceBadge()}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-space-850 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Sen's Slope / yr
            </span>
            <button
              type="button"
              onClick={() => onOpenGlossaryTooltip("SenSlope")}
              className="text-slate-500 hover:text-slate-300"
              aria-label="What is Sen's Slope?"
              title="What is Sen's Slope?"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-1 text-sm sm:text-base font-mono font-semibold text-slate-100 truncate" title={formattedSlope}>
            {metadata.slope_per_year > 0 ? "+" : ""}
            {formatScientificValue(metadata.slope_per_year)}
          </div>
          <div className="text-[11px] text-slate-400 truncate" title={metadata.unit}>
            {metadata.unit}/yr
          </div>
        </div>

        <div className="bg-space-850 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              p-value
            </span>
            <button
              type="button"
              onClick={() => onOpenGlossaryTooltip("pValue")}
              className="text-slate-500 hover:text-slate-300"
              aria-label="What is p-value?"
              title="What is p-value?"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-1 text-base sm:text-lg font-mono font-semibold text-slate-100">
            {metadata.p_value < 0.0001 ? "< 0.0001" : metadata.p_value}
          </div>
          <div className="text-[11px] text-slate-400">
            {isSignificant ? "Strong evidence" : "Inconclusive"}
          </div>
        </div>

        <div className="bg-space-850 border border-slate-800/80 rounded-lg p-3 col-span-2 sm:col-span-2">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            95% Confidence Interval
          </div>
          <div className="mt-1 text-xs sm:text-sm font-mono font-semibold text-slate-100 truncate">
            [{formattedCiLower}, {formattedCiUpper}]
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Method: {metadata.method}
          </div>
        </div>
      </div>

      {/* Valid Data Coverage Bar (P1) */}
      <div className="bg-space-850/60 border border-slate-800/60 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Monthly Data Coverage</span>
          <span className="font-mono text-slate-400">
            {metadata.valid_months} valid / {metadata.missing_months} missing months ({validMonthPercentage.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
          <div
            className={`h-full transition-all duration-300 ${
              isCyan ? "bg-sky-500" : "bg-amber-500"
            }`}
            style={{ width: `${validMonthPercentage}%` }}
            title={`${metadata.valid_months} valid monthly composites`}
          />
          <div
            className="h-full bg-rose-500/70 transition-all duration-300"
            style={{ width: `${100 - validMonthPercentage}%` }}
            title={`${metadata.missing_months} missing months`}
          />
        </div>

        {/* Daily Coverage Metric (when available from Role 1 daily clean CSV) */}
        {dailyCoverage && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-sky-300 font-medium">
              <CalendarCheck className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              <span>Daily Cleaned Record:</span>
            </div>
            <div className="font-mono">
              <span className="text-slate-200 font-semibold">{dailyCoverage.validDays.toLocaleString()}</span> valid days ·{" "}
              <span className="text-rose-400">{dailyCoverage.missingDays}</span> cloud-screened days (
              {dailyCoverage.validPercentage.toFixed(1)}% daily coverage)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
