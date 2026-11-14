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
    if (dir === "increasing") return <TrendingUp className="w-4 h-4 text-rose-400" aria-hidden="true" />;
    if (dir === "decreasing") return <TrendingDown className="w-4 h-4 text-emerald-400" aria-hidden="true" />;
    return <Minus className="w-4 h-4 text-slate-400" aria-hidden="true" />;
  };

  return (
    <section
      id="trend-comparison"
      aria-labelledby="comparison-heading"
      className="py-14 border-b border-slate-800 space-y-8"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
          <span>Step 5</span>
          <span>·</span>
          <span>Cross-Variable Discovery</span>
        </div>
        <h2 id="comparison-heading" className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2.5">
          <GitCompare className="w-6 h-6 text-sky-400" aria-hidden="true" />
          Compare the Trends: Discover Patterns
        </h2>
        <p className="text-sm text-slate-400">
          Side-by-side synthesis of multi-year atmospheric changes across West Kalimantan ({periodLabel})
        </p>
      </div>

      {/* Side-by-Side Comparison Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NO2 Card */}
        <div className="p-5 rounded-2xl bg-space-900 border border-sky-900/50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" aria-hidden="true" />
              <h3 className="font-bold text-slate-100">Nitrogen Dioxide (NO2)</h3>
            </div>
            <span className="text-xs font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
              {no2Metadata.unit}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Trend Direction:</span>
              <span className="font-semibold text-slate-200 capitalize flex items-center gap-1">
                {getDirIcon(no2Dir)}
                {no2Dir}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Rate of Change / yr:</span>
              <span className="font-mono font-semibold text-slate-200">
                {formatSlope(no2Metadata.slope_per_year, no2Metadata.unit)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Rate of Change / decade:</span>
              <span className="font-mono font-semibold text-slate-200">
                {formatSlopePerDecade(no2Metadata.slope_per_year, no2Metadata.unit)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Statistical Significance:</span>
              <span className="font-mono text-slate-200">
                p = {no2Metadata.p_value < 0.0001 ? "< 0.0001" : no2Metadata.p_value}{" "}
                <span className="text-sky-400 font-semibold">
                  ({no2Significant ? "Significant" : "Not Significant"})
                </span>
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Seasonal Peak Months:</span>
              <span className="text-slate-200 font-medium">August to October (Dry Season)</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Primary Atmospheric Drivers:</span>
              <span className="text-slate-200 text-right max-w-[220px]">
                Fossil fuel combustion, diesel transportation, localized industry &amp; clearing
              </span>
            </div>
          </div>
        </div>

        {/* AOD Card */}
        <div className="p-5 rounded-2xl bg-space-900 border border-amber-900/50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" aria-hidden="true" />
              <h3 className="font-bold text-slate-100">Aerosol Optical Depth (AOD)</h3>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              {aodMetadata.unit} (550 nm)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Trend Direction:</span>
              <span className="font-semibold text-slate-200 capitalize flex items-center gap-1">
                {getDirIcon(aodDir)}
                {aodDir}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Rate of Change / yr:</span>
              <span className="font-mono font-semibold text-slate-200">
                {formatSlope(aodMetadata.slope_per_year, aodMetadata.unit)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Rate of Change / decade:</span>
              <span className="font-mono font-semibold text-slate-200">
                {formatSlopePerDecade(aodMetadata.slope_per_year, aodMetadata.unit)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Statistical Significance:</span>
              <span className="font-mono text-slate-200">
                p = {aodMetadata.p_value < 0.0001 ? "< 0.0001" : aodMetadata.p_value}{" "}
                <span className="text-amber-400 font-semibold">
                  ({aodSignificant ? "Significant" : "Not Significant"})
                </span>
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Seasonal Peak Months:</span>
              <span className="text-slate-200 font-medium">August to October (Peat Wildfire Season)</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Primary Atmospheric Drivers:</span>
              <span className="text-slate-200 text-right max-w-[220px]">
                Peatland wildfire smoke, regional haze transport &amp; El Niño drought cycles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Synthesis Card */}
      <div className="p-6 rounded-2xl bg-space-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-xs font-bold uppercase bg-slate-800 text-slate-300">
            Synthesis Insight
          </span>
          <h3 className="text-base font-bold text-slate-100">{relationshipTitle}</h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{dynamicDetail}</p>
      </div>

      {/* CRITICAL SCIENTIFIC GUARDRAIL BANNER */}
      <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-800/70 text-amber-200/90 text-xs sm:text-sm leading-relaxed flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="text-amber-300 block mb-1 font-bold">Important Methodological Note:</strong>
          NO2 and AOD are analyzed separately. Their raw values are never directly compared on the same numerical
          scale because they measure different physical atmospheric properties and use different units
          (<span className="font-mono text-slate-200">molecules/cm²</span> vs.{" "}
          <span className="font-mono text-slate-200">unitless optical thickness</span>). Similar trend directions
          do not imply direct causation.
        </div>
      </div>

      {/* Next Step CTA */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <span>Step 6: Read Insights &amp; Interpretation</span>
          <ArrowDown className="w-4 h-4 text-emerald-200" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
