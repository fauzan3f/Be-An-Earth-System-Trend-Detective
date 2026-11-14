import React from "react";
import type { TrendAnalysisContract } from "../types";
import { GitCompare, ShieldAlert, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatSlope } from "../utils/formatters";

interface TrendComparisonSectionProps {
  no2Metadata: TrendAnalysisContract;
  aodMetadata: TrendAnalysisContract;
  periodLabel: string;
}

export const TrendComparisonSection: React.FC<TrendComparisonSectionProps> = ({
  no2Metadata,
  aodMetadata,
  periodLabel,
}) => {
  const no2Significant = no2Metadata.p_value < 0.05;
  const aodSignificant = aodMetadata.p_value < 0.05;

  const no2Dir = no2Metadata.trend_direction;
  const aodDir = aodMetadata.trend_direction;

  // Scientific plain-language synthesis
  let relationshipSummary = "";
  let dynamicDetail = "";

  if (no2Dir === aodDir && no2Dir !== "no trend") {
    relationshipSummary = `Both atmospheric variables exhibit concordant ${no2Dir} trends over ${periodLabel}.`;
    dynamicDetail = `Tropospheric NO2 and Aerosol Optical Depth (AOD) show aligned multi-year directional shifts across West Kalimantan. In tropical maritime Southeast Asia, synchronized changes often correlate with macro-scale regional activity, land-use clearing cycles, and broad atmospheric transport patterns.`;
  } else if (
    (no2Dir === "increasing" && aodDir === "decreasing") ||
    (no2Dir === "decreasing" && aodDir === "increasing")
  ) {
    relationshipSummary = `NO2 and AOD exhibit diverging trends across the ${periodLabel} observation record.`;
    dynamicDetail = `While NO2 exhibits an ${no2Dir} trajectory (${formatSlope(no2Metadata.slope_per_year, no2Metadata.unit)}, p = ${no2Metadata.p_value < 0.0001 ? "< 0.0001" : no2Metadata.p_value}), AOD trends in the opposite direction (${formatSlope(aodMetadata.slope_per_year, aodMetadata.unit)}, p = ${aodMetadata.p_value}). This divergence underscores differing emission sources: nitrogen dioxide is predominantly linked to ongoing fossil fuel combustion, transport, and localized energy infrastructure, whereas regional aerosol optical depth is heavily influenced by episodic peatland wildfire events and fire prevention policies enacted after the severe 2015 El Niño episode.`;
  } else {
    relationshipSummary = `NO2 and AOD show decoupled statistical patterns during ${periodLabel}.`;
    const significantVar = no2Significant ? "NO2" : aodSignificant ? "AOD" : null;
    if (significantVar) {
      dynamicDetail = `Only ${significantVar} demonstrates a statistically significant monotonic trend (p < 0.05), whereas the other variable shows no statistically detectable long-term trend after accounting for seasonal variability.`;
    } else {
      dynamicDetail = `Neither variable exhibits a statistically significant monotonic trend at the 95% confidence level (p >= 0.05) over this time slice, indicating that short-term seasonal and episodic fire fluctuations outweigh multi-year drift.`;
    }
  }

  const getDirIcon = (dir: string) => {
    if (dir === "increasing") return <TrendingUp className="w-4 h-4 text-rose-400" aria-hidden="true" />;
    if (dir === "decreasing") return <TrendingDown className="w-4 h-4 text-emerald-400" aria-hidden="true" />;
    return <Minus className="w-4 h-4 text-slate-400" aria-hidden="true" />;
  };

  return (
    <section
      aria-labelledby="trend-comparison-title"
      className="bg-space-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-950/70 border border-sky-800/80 text-sky-400">
            <GitCompare className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="trend-comparison-title" className="text-lg font-semibold text-slate-100">
              Trend Comparison
            </h2>
            <p className="text-xs text-slate-400">
              Integrated cross-variable evaluation for {no2Metadata.region} ({periodLabel})
            </p>
          </div>
        </div>

        {/* Status Indicators Pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-space-850 border border-slate-700/80 text-xs">
            <span className="font-semibold text-sky-400">NO2:</span>
            {getDirIcon(no2Dir)}
            <span className="capitalize text-slate-200">{no2Dir}</span>
            <span className="text-slate-400 font-mono text-[11px]">
              ({no2Significant ? "p < 0.05" : "p ≥ 0.05"})
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-space-850 border border-slate-700/80 text-xs">
            <span className="font-semibold text-amber-400">AOD:</span>
            {getDirIcon(aodDir)}
            <span className="capitalize text-slate-200">{aodDir}</span>
            <span className="text-slate-400 font-mono text-[11px]">
              ({aodSignificant ? "p < 0.05" : "p ≥ 0.05"})
            </span>
          </div>
        </div>
      </div>

      {/* Synthesis Prose */}
      <div className="space-y-3">
        <p className="text-base font-medium text-slate-200">
          {relationshipSummary}
        </p>
        <p className="text-sm leading-relaxed text-slate-300">
          {dynamicDetail}
        </p>
      </div>

      {/* Strict Scientific Guardrail Notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-950/40 border border-amber-900/60 text-amber-200/90 text-xs sm:text-sm leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-semibold text-amber-300">Scientific Guardrail Notice:</span> Co-occurring
          trends reflect regional atmospheric dynamics (such as seasonal biomass burning, wind transport,
          and meteorological cycles) and do not imply direct causation between NO2 and AOD. Satellite
          observations capture column-integrated abundance across heterogeneous geographic landscapes.
        </div>
      </div>
    </section>
  );
};
