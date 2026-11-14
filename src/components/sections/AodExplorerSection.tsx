import React from "react";
import {
  Info,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowDown,
} from "lucide-react";
import type { TrendAnalysisContract, MonthlyDataPoint } from "../../types";
import { TimeSeriesChart } from "../TimeSeriesChart";
import { formatScientificValue, formatSlope, formatSlopePerDecade } from "../../utils/formatters";

interface AodExplorerSectionProps {
  metadata: TrendAnalysisContract;
  filteredMonthlySeries: MonthlyDataPoint[];
  trendlinePoints: (number | null)[];
  onOpenGlossaryTooltip: (term: "AOD" | "SenSlope" | "pValue") => void;
  onNextStep: () => void;
}

export const AodExplorerSection: React.FC<AodExplorerSectionProps> = ({
  metadata,
  filteredMonthlySeries,
  trendlinePoints,
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
      id="aod-explorer"
      aria-labelledby="aod-heading"
      className="py-14 border-b border-slate-800 space-y-6"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
          <span>Step 4</span>
          <span>·</span>
          <span>Variable 2 Exploration</span>
        </div>
        <h2 id="aod-heading" className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-amber-400" aria-hidden="true" />
          AOD Explorer: Aerosol Optical Depth
        </h2>
        <p className="text-xs text-slate-400">
          NASA MODIS Aqua/Terra Combined Record ({metadata.period}) · West Kalimantan
        </p>
      </div>

      {/* Plain-Language Explainer Box */}
      <div className="p-4 rounded-xl bg-space-900 border border-amber-900/40 text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="text-amber-300 font-semibold block mb-0.5">What Satellite AOD Measures:</strong>
          Aerosol Optical Depth (AOD) is a dimensionless measure of how much airborne particulate matter
          (haze, wildfire smoke, dust, and sea spray) attenuates solar radiation passing through the atmosphere at 550 nm.
          Clear tropical conditions register around 0.15 to 0.25. During intense dry-season peatland fires
          (prominently during the extreme 2015 El Niño), smoke plumes shoot AOD beyond 1.5, severely degrading surface visibility.
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
            NASA MODIS MYD08_M3
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {metadata.valid_months} valid months ({validPercentage.toFixed(1)}%)
          </div>
          <div className="text-[10px] text-amber-300/90 pt-0.5">
            Combined Terra &amp; Aqua 550nm dark-target + deep-blue
          </div>
        </div>
      </div>

      {/* Interactive Time-Series Chart */}
      <div className="p-5 rounded-2xl bg-space-900 border border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Monthly Mean Aerosol Optical Depth (2010 to 2025) with Sen's Slope Trendline
          </span>
          <span className="font-mono text-[11px]">
            Unit: {metadata.unit}
          </span>
        </div>

        <TimeSeriesChart
          variableName="AOD"
          unit={metadata.unit}
          colorScheme="amber"
          dataPoints={filteredMonthlySeries}
          trendlinePoints={trendlinePoints}
          isDailyView={false}
        />
      </div>

      {/* Next Step CTA */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <span>Step 5: Compare the Trends</span>
          <ArrowDown className="w-4 h-4 text-sky-200" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
