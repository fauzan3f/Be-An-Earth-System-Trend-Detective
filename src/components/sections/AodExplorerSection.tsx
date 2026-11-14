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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
          <ArrowUpRight className="w-3.5 h-3.5 text-[#E4002B]" aria-hidden="true" />
          Increasing Trend
        </span>
      );
    }
    if (metadata.trend_direction === "decreasing") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]">
          <ArrowDownRight className="w-3.5 h-3.5 text-[#059669]" aria-hidden="true" />
          Decreasing Trend
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase bg-[#EBEBEB] text-[#4B5563] border border-[#D1D5DB]">
        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        No Significant Trend
      </span>
    );
  };

  const renderSignificanceBadge = () => {
    if (isSignificant) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-mono font-bold uppercase bg-[#E8F0FE] text-[#1967D2] border border-[#BFDBFE]">
          <CheckCircle2 className="w-3 h-3 text-[#1967D2]" aria-hidden="true" />
          Significant (p &lt; 0.05)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-mono font-bold uppercase bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
        <AlertCircle className="w-3 h-3 text-[#B45309]" aria-hidden="true" />
        Not Significant (p &ge; 0.05)
      </span>
    );
  };

  return (
    <section
      id="aod-explorer"
      aria-labelledby="aod-heading"
      className="py-12 border-b border-[#E0E0E0] space-y-6"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D97706] uppercase tracking-widest">
          <span>STEP 04</span>
          <span>/</span>
          <span>VARIABLE 02 INVESTIGATION</span>
        </div>
        <h2 id="aod-heading" className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B1B1B] tracking-tight flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#D97706]" aria-hidden="true" />
          AOD Explorer: Aerosol Optical Depth
        </h2>
        <p className="text-xs text-[#58585B]">
          NASA MODIS Aqua/Terra Combined Record ({metadata.period}) · West Kalimantan
        </p>
      </div>

      {/* Earthdata Callout Explainer Box */}
      <div className="p-4 rounded-sm bg-[#FEF9EE] border-l-4 border-[#D97706] text-xs sm:text-sm text-[#1B1B1B] leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="text-[#B45309] font-bold block mb-0.5">What Satellite AOD Measures:</strong>
          Aerosol Optical Depth (AOD) is a dimensionless measure of how much airborne particulate matter
          (smoke from peatland/forest fires, haze, dust) attenuates solar radiation passing through the atmosphere at 550 nm.
          Clean tropical air typically registers between 0.15 and 0.25. During intense El Niño peat fire seasons
          (such as September 2015), thick smoke plumes shoot AOD beyond 1.5, severely degrading surface visibility.
        </div>
      </div>

      {/* Dynamic Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Trend Direction */}
        <div className="p-4 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-1.5">
          <div className="text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            TREND DIRECTION
          </div>
          <div className="pt-0.5">{renderTrendBadge()}</div>
          <div className="pt-1">{renderSignificanceBadge()}</div>
        </div>

        {/* Rate of Change per year & decade */}
        <div className="p-4 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            <span>SEN'S SLOPE</span>
            <button
              type="button"
              onClick={() => onOpenGlossaryTooltip("SenSlope")}
              className="text-[#58585B] hover:text-[#D97706]"
              aria-label="What is Sen's Slope?"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="text-sm sm:text-base font-mono font-bold text-[#1B1B1B]">
            {formatSlope(metadata.slope_per_year, metadata.unit)}
          </div>
          <div className="text-[11px] font-mono text-[#58585B]">
            {formatSlopePerDecade(metadata.slope_per_year, metadata.unit)}
          </div>
        </div>

        {/* Statistical Significance */}
        <div className="p-4 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            <span>P-VALUE (MK TEST)</span>
            <button
              type="button"
              onClick={() => onOpenGlossaryTooltip("pValue")}
              className="text-[#58585B] hover:text-[#D97706]"
              aria-label="What is p-value?"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="text-base sm:text-lg font-mono font-bold text-[#1B1B1B]">
            {metadata.p_value < 0.0001 ? "< 0.0001" : metadata.p_value}
          </div>
          <div className="text-[11px] font-mono text-[#58585B]">
            95% CI: [{formatScientificValue(metadata.confidence_interval[0])}, {formatScientificValue(metadata.confidence_interval[1])}]
          </div>
        </div>

        {/* Data Coverage & Quality */}
        <div className="p-4 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-1">
          <div className="text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            SOURCE &amp; COVERAGE
          </div>
          <div className="text-xs font-bold text-[#1B1B1B]">
            NASA MODIS MYD08_M3
          </div>
          <div className="text-[11px] font-mono text-[#58585B]">
            {metadata.valid_months} valid months ({validPercentage.toFixed(1)}%)
          </div>
          <div className="text-[10px] text-[#B45309] pt-0.5 font-mono">
            Combined Terra &amp; Aqua 550nm dark-target + deep-blue
          </div>
        </div>
      </div>

      {/* Interactive Time-Series Chart */}
      <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-[#58585B] px-1 border-b border-[#F0F0F0] pb-2">
          <span className="font-semibold text-[#1B1B1B]">
            Monthly Mean Aerosol Optical Depth (2010 to 2025) with Sen's Slope Trendline (Emerald Dashed)
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#1967D2] hover:bg-[#1557B0] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#1967D2]"
        >
          <span>Step 5: Compare the Trends</span>
          <ArrowDown className="w-3.5 h-3.5 text-white" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
