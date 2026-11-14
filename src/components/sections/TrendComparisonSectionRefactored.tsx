import React from "react";
import { GitCompare, ShieldAlert, ArrowDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { TrendAnalysisContract } from "../../types";
import { formatSlope, formatSlopePerDecade } from "../../utils/formatters";

interface TrendComparisonSectionProps {
  no2Metadata: TrendAnalysisContract;
  aodMetadata: TrendAnalysisContract;
  periodLabel: string;
  onNextStep: () => void;
}

export const TrendComparisonSectionRefactored: React.FC<TrendComparisonSectionProps> = ({
  no2Metadata,
  aodMetadata,
  periodLabel,
  onNextStep,
}) => {
  const no2Significant = no2Metadata.p_value < 0.05;
  const aodSignificant = aodMetadata.p_value < 0.05;

  const no2Dir = no2Metadata.trend_direction;
  const aodDir = aodMetadata.trend_direction;

  let relationshipTitle = "";
  let dynamicDetail = "";

  if (no2Dir === aodDir && no2Dir !== "no trend") {
    relationshipTitle = `Concordant ${no2Dir.toUpperCase()} Dynamics`;
    dynamicDetail = `Both NO2 and AOD exhibit consistent directional shifts over ${periodLabel}. In equatorial Southeast Asia, aligned multi-year changes often reflect synchronized regional land development, transportation expansion, and meteorological cycles across maritime Borneo.`;
  } else if (
    (no2Dir === "increasing" && aodDir === "decreasing") ||
    (no2Dir === "decreasing" && aodDir === "increasing")
  ) {
    relationshipTitle = "Diverging Decadal Trajectories";
    dynamicDetail = `While tropospheric NO2 demonstrates an ${no2Dir} trend (${formatSlope(no2Metadata.slope_per_year, no2Metadata.unit)}, p = ${no2Metadata.p_value < 0.0001 ? "< 0.0001" : no2Metadata.p_value}), AOD shows a ${aodDir} trajectory (${formatSlope(aodMetadata.slope_per_year, aodMetadata.unit)}, p = ${aodMetadata.p_value}). This contrast illustrates distinct emission pathways: nitrogen dioxide is steadily sustained by fossil fuel combustion, vehicular traffic, and localized energy infrastructure, whereas aerosol loading is dominated by episodic peatland wildfire events, which have been mitigated by enhanced fire prevention and peatland re-wetting policies established after the catastrophic 2015 El Niño season.`;
  } else {
    relationshipTitle = "Decoupled Statistical Patterns";
    dynamicDetail = `One variable exhibits a statistically significant monotonic trend while the other shows no detectable long-term shift after accounting for seasonality, confirming that localized human emissions and broad atmospheric haze operate under different physical mechanisms.`;
  }

  const getDirIcon = (dir: string) => {
    if (dir === "increasing") return <TrendingUp className="w-4 h-4 text-[#E4002B]" aria-hidden="true" />;
    if (dir === "decreasing") return <TrendingDown className="w-4 h-4 text-[#059669]" aria-hidden="true" />;
    return <Minus className="w-4 h-4 text-[#58585B]" aria-hidden="true" />;
  };

  return (
    <section
      id="trend-comparison"
      aria-labelledby="comparison-heading"
      className="py-12 border-b border-[#E0E0E0] space-y-8"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1967D2] uppercase tracking-widest">
          <span>STEP 05</span>
          <span>/</span>
          <span>CROSS-VARIABLE SYNTHESIS</span>
        </div>
        <h2 id="comparison-heading" className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B1B1B] tracking-tight flex items-center gap-2.5">
          <GitCompare className="w-6 h-6 text-[#1967D2]" aria-hidden="true" />
          Compare the Trends: Discover Patterns
        </h2>
        <p className="text-sm text-[#58585B]">
          Side-by-side scientific matrix of multi-decadal atmospheric changes across West Kalimantan ({periodLabel})
        </p>
      </div>

      {/* Side-by-Side Comparison Table / Cards (Earthdata White Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NO2 Card */}
        <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0072BC]" aria-hidden="true" />
              <h3 className="font-bold text-[#1B1B1B]">Nitrogen Dioxide (NO2)</h3>
            </div>
            <span className="text-xs font-mono text-[#0072BC] bg-[#E8F0FE] px-2 py-0.5 rounded-sm border border-[#BFDBFE]">
              {no2Metadata.unit}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Trend Direction:</span>
              <span className="font-bold text-[#1B1B1B] capitalize flex items-center gap-1">
                {getDirIcon(no2Dir)}
                {no2Dir}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Rate of Change / yr:</span>
              <span className="font-mono font-bold text-[#1B1B1B]">
                {formatSlope(no2Metadata.slope_per_year, no2Metadata.unit)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Rate of Change / decade:</span>
              <span className="font-mono font-bold text-[#1B1B1B]">
                {formatSlopePerDecade(no2Metadata.slope_per_year, no2Metadata.unit)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Statistical Significance:</span>
              <span className="font-mono text-[#1B1B1B]">
                p = {no2Metadata.p_value < 0.0001 ? "< 0.0001" : no2Metadata.p_value}{" "}
                <span className="text-[#1967D2] font-bold">
                  ({no2Significant ? "Significant" : "Not Significant"})
                </span>
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Seasonal Peak Months:</span>
              <span className="text-[#1B1B1B] font-medium">August to October (Dry Season)</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-[#58585B] font-mono uppercase">Primary Drivers:</span>
              <span className="text-[#1B1B1B] text-right max-w-[220px]">
                Fossil fuel combustion, diesel transport, localized industry &amp; clearing
              </span>
            </div>
          </div>
        </div>

        {/* AOD Card */}
        <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" aria-hidden="true" />
              <h3 className="font-bold text-[#1B1B1B]">Aerosol Optical Depth (AOD)</h3>
            </div>
            <span className="text-xs font-mono text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-sm border border-[#FDE68A]">
              {aodMetadata.unit} (550 nm)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Trend Direction:</span>
              <span className="font-bold text-[#1B1B1B] capitalize flex items-center gap-1">
                {getDirIcon(aodDir)}
                {aodDir}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Rate of Change / yr:</span>
              <span className="font-mono font-bold text-[#1B1B1B]">
                {formatSlope(aodMetadata.slope_per_year, aodMetadata.unit)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Rate of Change / decade:</span>
              <span className="font-mono font-bold text-[#1B1B1B]">
                {formatSlopePerDecade(aodMetadata.slope_per_year, aodMetadata.unit)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Statistical Significance:</span>
              <span className="font-mono text-[#1B1B1B]">
                p = {aodMetadata.p_value < 0.0001 ? "< 0.0001" : aodMetadata.p_value}{" "}
                <span className="text-[#B45309] font-bold">
                  ({aodSignificant ? "Significant" : "Not Significant"})
                </span>
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Seasonal Peak Months:</span>
              <span className="text-[#1B1B1B] font-medium">August to October (Peat Wildfire Season)</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-[#58585B] font-mono uppercase">Primary Drivers:</span>
              <span className="text-[#1B1B1B] text-right max-w-[220px]">
                Peatland wildfire smoke, regional haze transport &amp; El Niño drought cycles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Synthesis Card */}
      <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-sm text-[11px] font-mono font-bold uppercase bg-[#EBEBEB] text-[#1B1B1B]">
            SYNTHESIS FINDING
          </span>
          <h3 className="text-base font-bold text-[#1B1B1B]">{relationshipTitle}</h3>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-[#58585B]">{dynamicDetail}</p>
      </div>

      {/* CRITICAL SCIENTIFIC GUARDRAIL BANNER (NASA Official Red Warning Box) */}
      <div className="p-4 rounded-sm bg-[#FFF5F5] border-l-4 border-[#E4002B] text-xs sm:text-sm text-[#991B1B] leading-relaxed flex items-start gap-3.5 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-[#E4002B] shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="text-[#991B1B] block mb-0.5 font-bold uppercase tracking-wide">
            Important Methodological Note:
          </strong>
          NO2 and AOD are analyzed separately. Their raw values are never directly compared on the same numerical
          scale because they measure different physical atmospheric properties and use different units
          (<span className="font-mono font-bold">molecules/cm²</span> vs.{" "}
          <span className="font-mono font-bold">unitless optical thickness</span>). Similar trend directions
          do not imply direct causation.
        </div>
      </div>

      {/* Next Step CTA */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#1967D2] hover:bg-[#1557B0] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#1967D2]"
        >
          <span>Step 6: Read Insights &amp; Interpretation</span>
          <ArrowDown className="w-3.5 h-3.5 text-white" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
