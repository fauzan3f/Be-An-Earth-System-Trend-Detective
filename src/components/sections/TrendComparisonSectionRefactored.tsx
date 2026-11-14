import React from "react";
import { GitCompare, ShieldAlert, ArrowDown, ArrowUpRight, TrendingDown } from "lucide-react";
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
  const relationshipTitle = "Decoupled Decadal Trajectories: Significant AOD Reduction vs. Non-Significant NO2 Point Estimate";
  const dynamicDetail = `While tropospheric NO2 exhibits a positive point estimate (+5.36 × 10¹² molecules/cm²/yr) driven by localized fossil fuel combustion and transportation expansion, it shows insufficient statistical evidence of a nonzero linear trend at α = 0.05 (HAC p = 0.2568, with a 95% confidence interval spanning zero). In contrast, Aerosol Optical Depth (AOD) shows a statistically significant multi-year decline (p < 0.05). This decoupling illustrates fundamentally distinct emission pathways: nitrogen dioxide is steadily sustained by continuous industrial, vehicular, and energy activity, whereas particulate aerosol loading is dominated by episodic dry-season peatland wildfires, which have experienced substantial mitigation through Indonesian peatland re-wetting and post-2015 fire suppression enforcement.`;

  return (
    <section
      id="trend-comparison"
      aria-labelledby="comparison-heading"
      className="py-12 border-b border-[#E5E7EB] space-y-8"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#58585B] uppercase tracking-widest">
          <span>STEP 05</span>
          <span>/</span>
          <span>CROSS-VARIABLE SYNTHESIS</span>
        </div>
        <h2 id="comparison-heading" className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B1B1B] tracking-tight flex items-center gap-2.5">
          <GitCompare className="w-6 h-6 text-[#1B1B1B]" aria-hidden="true" />
          Compare the Trends: Discover Patterns
        </h2>
        <p className="text-sm text-[#58585B]">
          Side-by-side scientific comparison matrix of multi-decadal atmospheric changes across West Kalimantan ({periodLabel})
        </p>
      </div>

      {/* Side-by-Side Comparison Cards (NASA Strict Monochrome Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NO2 Card */}
        <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15418C]" aria-hidden="true" />
              <h3 className="font-bold text-[#1B1B1B]">Nitrogen Dioxide (NO2)</h3>
            </div>
            <span className="text-xs font-mono text-[#1B1B1B] bg-[#F4F4F5] px-2 py-0.5 rounded-sm border border-[#E4E4E7]">
              {no2Metadata.unit}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Trend Status:</span>
              <span className="font-bold text-[#1B1B1B] capitalize flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
                Positive Point Estimate
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
                p = 0.2568 (HAC){" "}
                <span className="font-bold text-[#1B1B1B]">
                  (Not Significant at α = 0.05)
                </span>
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">95% Confidence Interval:</span>
              <span className="font-mono text-[#58585B]">
                [-3.90 × 10¹², +1.46 × 10¹³] (Spans zero)
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Seasonal Peak Months:</span>
              <span className="text-[#1B1B1B] font-medium">August to October (Dry Season)</span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-[#58585B] font-mono uppercase">Primary Drivers:</span>
              <span className="text-[#1B1B1B] text-right max-w-[220px]">
                Fossil fuel combustion, diesel machinery, urban transport &amp; localized energy
              </span>
            </div>
          </div>
        </div>

        {/* AOD Card */}
        <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B1B1B]" aria-hidden="true" />
              <h3 className="font-bold text-[#1B1B1B]">Aerosol Optical Depth (AOD)</h3>
            </div>
            <span className="text-xs font-mono text-[#1B1B1B] bg-[#F4F4F5] px-2 py-0.5 rounded-sm border border-[#E4E4E7]">
              {aodMetadata.unit} (550 nm)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">Trend Status:</span>
              <span className="font-bold text-[#1B1B1B] capitalize flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
                Decreasing Trend
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
                <span className="text-[#1B1B1B] font-bold">
                  (Statistically Significant)
                </span>
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-[#F0F0F0]">
              <span className="text-[#58585B] font-mono uppercase">95% Confidence Interval:</span>
              <span className="font-mono text-[#58585B]">
                [-0.0125, -0.0055] (Strictly negative)
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
      <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-sm text-[11px] font-mono font-bold uppercase bg-[#F4F4F5] text-[#1B1B1B] border border-[#E4E4E7]">
            SYNTHESIS FINDING
          </span>
          <h3 className="text-base font-bold text-[#1B1B1B]">{relationshipTitle}</h3>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-[#58585B]">{dynamicDetail}</p>
      </div>

      {/* CRITICAL SCIENTIFIC GUARDRAIL BANNER (Strict NASA Red Accent Card) */}
      <div className="p-4 rounded-sm bg-[#F6F6F6] border-l-4 border-[#E4002B] text-xs sm:text-sm text-[#1B1B1B] leading-relaxed flex items-start gap-3.5 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-[#E4002B] shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="text-[#1B1B1B] block mb-0.5 font-bold uppercase tracking-wide">
            Important Methodological Note:
          </strong>
          NO2 and AOD are analyzed separately. Their raw values are never directly compared on the same numerical
          scale because they measure different physical atmospheric properties and use different units
          (<span className="font-mono font-bold text-[#1B1B1B]">molecules/cm²</span> vs.{" "}
          <span className="font-mono font-bold text-[#1B1B1B]">unitless optical thickness</span>). Similar trend directions
          or divergent trajectories do not imply direct causation.
        </div>
      </div>

      {/* Next Step CTA with Red Circle Arrow Hover Animation */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNextStep}
          className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#1B1B1B] hover:bg-[#000000] text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B1B1B]"
        >
          <span>Step 6: Read Insights &amp; Interpretation</span>
          <span className="w-5 h-5 rounded-full bg-[#E4002B] flex items-center justify-center transition-transform group-hover:translate-x-1">
            <ArrowDown className="w-3 h-3 text-white" aria-hidden="true" />
          </span>
        </button>
      </div>
    </section>
  );
};
