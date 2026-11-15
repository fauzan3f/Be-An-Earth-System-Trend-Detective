import React, { useState, useMemo } from "react";
import {
  GitCompare,
  ShieldAlert,
  ArrowDown,
  ArrowUpRight,
  TrendingDown,
  Flame,
  Calendar,
  Layers,
  BarChart3,
  Table as TableIcon,
} from "lucide-react";
import type { TrendAnalysisContract, NO2AODComparisonRecord } from "../../types";
import { formatSlope, formatSlopePerDecade, formatScientificValue } from "../../utils/formatters";
import { ComparisonDualAxisChart } from "../ComparisonDualAxisChart";

interface TrendComparisonSectionProps {
  no2Metadata: TrendAnalysisContract;
  aodMetadata: TrendAnalysisContract;
  comparisonRecords?: NO2AODComparisonRecord[];
  periodLabel: string;
  onNextStep: () => void;
}

interface PeakEpisode {
  id: string;
  date: string;
  title: string;
  tag: string;
  aod: string;
  no2: string;
  description: string;
}

const MAJOR_PEAK_EPISODES: PeakEpisode[] = [
  {
    id: "2015-09",
    date: "2015-09",
    title: "2015 Super El Niño Peatland Firestorm",
    tag: "Historic Max AOD",
    aod: "2.060",
    no2: "2.11 × 10¹⁵",
    description:
      "Catastrophic regional peat fire crisis during prolonged severe El Niño drought. Huge smoke plumes blanketed equatorial Borneo.",
  },
  {
    id: "2015-10",
    date: "2015-10",
    title: "2015 Post-Fire Residual Smoldering",
    tag: "High Persistence",
    aod: "1.996",
    no2: "8.34 × 10¹⁴",
    description:
      "Subsurface peat fires continued smoldering underground, maintaining extreme particulate levels across West Kalimantan.",
  },
  {
    id: "2019-09",
    date: "2019-09",
    title: "2019 Strong Positive IOD Fire Season",
    tag: "Severe Dry Season",
    aod: "1.199",
    no2: "1.96 × 10¹⁵",
    description:
      "Positive Indian Ocean Dipole generated prolonged dry spells and widespread peatland burning prior to monsoon onset.",
  },
  {
    id: "2026-08",
    date: "2026-08",
    title: "2026 Late Dry Season NO2 Surge",
    tag: "Urban & Industrial",
    aod: "0.903",
    no2: "2.68 × 10¹⁵",
    description:
      "Record localized NO2 column concentration accompanied by moderate particulate smoke before the autumn rains.",
  },
  {
    id: "2026-10",
    date: "2026-10",
    title: "2026 Autumn Biomass Burning Anomaly",
    tag: "Recent Peak AOD",
    aod: "1.652",
    no2: "6.94 × 10¹⁴",
    description:
      "Intense localized clearing smoke late in 2026, creating high aerosol extinction while NO2 remained baseline.",
  },
];

export const TrendComparisonSectionRefactored: React.FC<TrendComparisonSectionProps> = ({
  no2Metadata,
  aodMetadata,
  comparisonRecords = [],
  periodLabel,
  onNextStep,
}) => {
  const [chartViewMode, setChartViewMode] = useState<"dual" | "split">("dual");
  const [seasonFilter, setSeasonFilter] = useState<"all" | "dry">("all");
  const [activeDate, setActiveDate] = useState<string>("2015-09");
  const [comparisonTab, setComparisonTab] = useState<"chart" | "yoy">("chart");

  // Filter comparison records according to season filter and active period
  const activeRecords = useMemo(() => {
    if (comparisonRecords.length === 0) return [];
    if (seasonFilter === "dry") {
      // August (08), September (09), October (10) only
      return comparisonRecords.filter((r) => {
        const m = r.month;
        return m === 8 || m === 9 || m === 10;
      });
    }
    return comparisonRecords;
  }, [comparisonRecords, seasonFilter]);

  // Compute Annual YoY Comparison table where both_available === true
  const annualAverages = useMemo(() => {
    const yearMap = new Map<number, { no2Vals: number[]; aodVals: number[] }>();

    comparisonRecords.forEach((r) => {
      // Strict rule: only compute where both_available is true
      if (r.both_available && r.no2 !== null && r.aod !== null) {
        if (!yearMap.has(r.year)) {
          yearMap.set(r.year, { no2Vals: [], aodVals: [] });
        }
        const bucket = yearMap.get(r.year)!;
        bucket.no2Vals.push(r.no2);
        bucket.aodVals.push(r.aod);
      }
    });

    const years = Array.from(yearMap.keys()).sort((a, b) => a - b);
    return years.map((yr, idx) => {
      const data = yearMap.get(yr)!;
      const avgNo2 = data.no2Vals.reduce((a, b) => a + b, 0) / data.no2Vals.length;
      const avgAod = data.aodVals.reduce((a, b) => a + b, 0) / data.aodVals.length;

      let no2YoyChange: number | null = null;
      let aodYoyChange: number | null = null;

      if (idx > 0) {
        const prevYr = years[idx - 1];
        const prevData = yearMap.get(prevYr)!;
        const prevAvgNo2 = prevData.no2Vals.reduce((a, b) => a + b, 0) / prevData.no2Vals.length;
        const prevAvgAod = prevData.aodVals.reduce((a, b) => a + b, 0) / prevData.aodVals.length;
        no2YoyChange = ((avgNo2 - prevAvgNo2) / prevAvgNo2) * 100;
        aodYoyChange = ((avgAod - prevAvgAod) / prevAvgAod) * 100;
      }

      return {
        year: yr,
        monthsCount: data.no2Vals.length,
        avgNo2,
        avgAod,
        no2YoyChange,
        aodYoyChange,
      };
    });
  }, [comparisonRecords]);

  const relationshipTitle =
    "Decoupled Decadal Trajectories: Significant AOD Reduction vs. Non-Significant NO2 Point Estimate";
  const dynamicDetail = `While tropospheric NO2 exhibits a positive point estimate (+5.36 × 10¹² molecules/cm²/yr) driven by localized fossil fuel combustion and transportation expansion, it shows insufficient statistical evidence of a nonzero linear trend at α = 0.05 (HAC p = 0.2568, with a 95% confidence interval spanning zero). In contrast, Aerosol Optical Depth (AOD) shows a statistically significant multi-year decline (p < 0.05). This decoupling illustrates fundamentally distinct emission pathways: nitrogen dioxide is steadily sustained by continuous industrial, vehicular, and energy activity, whereas particulate aerosol loading is dominated by episodic dry-season peatland wildfires, which have experienced substantial mitigation through Indonesian peatland re-wetting and post-2015 fire suppression enforcement.`;

  return (
    <section
      id="trend-comparison"
      aria-labelledby="comparison-heading"
      className="py-12 border-b border-[#E5E7EB] space-y-8"
    >
      {/* Step Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#58585B] uppercase tracking-widest">
          <span>STEP 05</span>
          <span>/</span>
          <span>CROSS-VARIABLE SYNTHESIS</span>
        </div>
        <h2
          id="comparison-heading"
          className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B1B1B] tracking-tight flex items-center gap-2.5"
        >
          <GitCompare className="w-6 h-6 text-[#1B1B1B]" aria-hidden="true" />
          Compare the Trends: Discover Patterns
        </h2>
        <p className="text-sm text-[#58585B]">
          Cross-variable synthesis of multi-decadal atmospheric changes across West Kalimantan ({periodLabel})
        </p>
      </div>

      {/* Mandatory Methodology Notice Banner */}
      <div className="p-4 rounded-sm bg-[#F6F6F6] border-l-4 border-[#E4002B] text-xs sm:text-sm text-[#1B1B1B] leading-relaxed flex items-start gap-3.5 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-[#E4002B] shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="text-[#1B1B1B] block mb-0.5 font-bold uppercase tracking-wide">
            Methodology Note:
          </strong>
          NO2 (NASA OMI OMNO2d v004, molecules/cm²) is calculated as the QC area-weighted mean of 0.25° grids
          intersecting West Kalimantan province. AOD (NASA Giovanni MODIS Terra MOD08_D3 v6.1, 550 nm dimensionless)
          is calculated as the daily bounding-box area average [108.5°E-113.5°E, 3.5°S-2.5°N]. All QC flags are exploratory
          and not final scientific validation.
        </div>
      </div>

      {/* Quick-Jump Chips for Major Biomass Burning Haze Episodes */}
      <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#E4002B]" aria-hidden="true" />
            <h3 className="font-display font-bold text-[#1B1B1B] text-sm uppercase tracking-wide">
              Major Biomass Burning Haze Episodes (Quick-Jump)
            </h3>
          </div>
          <span className="text-xs text-[#58585B] font-mono">Click to inspect episode on chart</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {MAJOR_PEAK_EPISODES.map((ep) => {
            const isSelected = activeDate === ep.date;
            return (
              <button
                key={ep.id}
                type="button"
                onClick={() => setActiveDate(ep.date)}
                className={`p-3 rounded-sm text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#0B0D10] text-white border-black shadow-md scale-[1.02]"
                    : "bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#1B1B1B] border-[#E5E7EB]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-xs ${
                        isSelected
                          ? "bg-[#E4002B] text-white"
                          : "bg-[#E4E4E7] text-[#1B1B1B]"
                      }`}
                    >
                      {ep.tag}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isSelected ? "text-gray-300" : "text-[#58585B]"
                      }`}
                    >
                      {ep.date}
                    </span>
                  </div>
                  <div className="text-xs font-bold leading-snug line-clamp-2">
                    {ep.title}
                  </div>
                </div>

                <div
                  className={`mt-2 pt-2 border-t text-[11px] font-mono flex items-center justify-between ${
                    isSelected ? "border-gray-800 text-gray-300" : "border-gray-200 text-[#58585B]"
                  }`}
                >
                  <span>AOD: {ep.aod}</span>
                  <span>NO2: {ep.no2}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Episode Summary Card */}
        {(() => {
          const selectedEp = MAJOR_PEAK_EPISODES.find((e) => e.date === activeDate);
          if (!selectedEp) return null;
          return (
            <div className="p-3 bg-[#F4F4F5] border border-[#E4E4E7] rounded-sm text-xs text-[#1B1B1B] flex items-center justify-between">
              <div>
                <strong className="font-bold text-[#1B1B1B]">{selectedEp.title} ({selectedEp.date}):</strong>{" "}
                <span className="text-[#58585B]">{selectedEp.description}</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#E4002B] shrink-0 ml-3">
                AOD {selectedEp.aod} | NO2 {selectedEp.no2}
              </span>
            </div>
          );
        })()}
      </div>

      {/* RULE A: Dual Y-Axis / Split Chart & YoY Table Section */}
      <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#F0F0F0] pb-3">
          <div>
            <h3 className="font-display font-bold text-[#1B1B1B] text-base">
              Synchronized Multi-Decadal Time Series (NO2 vs. AOD)
            </h3>
            <p className="text-xs text-[#58585B] font-mono">
              Left Axis: NO2 (molecules/cm²) | Right Axis: AOD 550nm (dimensionless)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode: Dual Axis vs Split */}
            <div className="inline-flex rounded-sm p-0.5 bg-[#F4F4F5] border border-[#E4E4E7]">
              <button
                type="button"
                onClick={() => {
                  setComparisonTab("chart");
                  setChartViewMode("dual");
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-sm transition-all ${
                  comparisonTab === "chart" && chartViewMode === "dual"
                    ? "bg-white text-[#1B1B1B] shadow-sm"
                    : "text-[#58585B] hover:text-[#1B1B1B]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Dual Y-Axis</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setComparisonTab("chart");
                  setChartViewMode("split");
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-sm transition-all ${
                  comparisonTab === "chart" && chartViewMode === "split"
                    ? "bg-white text-[#1B1B1B] shadow-sm"
                    : "text-[#58585B] hover:text-[#1B1B1B]"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Split View</span>
              </button>
              <button
                type="button"
                onClick={() => setComparisonTab("yoy")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-sm transition-all ${
                  comparisonTab === "yoy"
                    ? "bg-white text-[#1B1B1B] shadow-sm"
                    : "text-[#58585B] hover:text-[#1B1B1B]"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>YoY Table</span>
              </button>
            </div>

            {/* Dry Season Filter Toggle */}
            <button
              type="button"
              onClick={() => setSeasonFilter(seasonFilter === "all" ? "dry" : "all")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-sm border transition-all ${
                seasonFilter === "dry"
                  ? "bg-[#1B1B1B] text-white border-black"
                  : "bg-white text-[#58585B] border-[#E5E7EB] hover:text-[#1B1B1B]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{seasonFilter === "dry" ? "Aug-Oct Fire Season Only" : "All Months (Jan-Dec)"}</span>
            </button>
          </div>
        </div>

        {/* Content Tab: Chart or Table */}
        {comparisonTab === "chart" ? (
          <div>
            <ComparisonDualAxisChart
              records={activeRecords}
              activeDate={activeDate}
              onSelectDate={setActiveDate}
              viewMode={chartViewMode}
            />

            <div className="flex flex-wrap items-center justify-between text-xs text-[#58585B] pt-3 border-t border-[#F0F0F0] font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#15418C]" aria-hidden="true" />
                  <span>NO2: NASA Aura OMI (OMNO2d v004)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#1B1B1B]" aria-hidden="true" />
                  <span>AOD: NASA Terra MODIS (MOD08_D3 v6.1)</span>
                </span>
              </div>
              <span>Click on any point to focus active episode</span>
            </div>
          </div>
        ) : (
          /* YoY Comparison Table (strictly where both_available === true) */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#58585B]">
                  <th className="py-2.5 px-3 font-bold">YEAR</th>
                  <th className="py-2.5 px-3 font-bold">VALID MONTHS</th>
                  <th className="py-2.5 px-3 font-bold text-right text-[#15418C]">
                    MEAN NO2 (molecules/cm²)
                  </th>
                  <th className="py-2.5 px-3 font-bold text-right text-[#15418C]">
                    NO2 YoY (%)
                  </th>
                  <th className="py-2.5 px-3 font-bold text-right text-[#1B1B1B]">
                    MEAN AOD (550nm)
                  </th>
                  <th className="py-2.5 px-3 font-bold text-right text-[#1B1B1B]">
                    AOD YoY (%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {annualAverages.map((row) => (
                  <tr key={row.year} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-2 px-3 font-bold text-[#1B1B1B]">{row.year}</td>
                    <td className="py-2 px-3 text-[#58585B]">{row.monthsCount} / 12</td>
                    <td className="py-2 px-3 text-right font-medium text-[#15418C]">
                      {formatScientificValue(row.avgNo2, 2)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-bold ${
                        row.no2YoyChange === null
                          ? "text-[#58585B]"
                          : row.no2YoyChange > 0
                          ? "text-[#991B1B]"
                          : "text-[#166534]"
                      }`}
                    >
                      {row.no2YoyChange !== null
                        ? `${row.no2YoyChange > 0 ? "+" : ""}${row.no2YoyChange.toFixed(1)}%`
                        : "---"}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-[#1B1B1B]">
                      {row.avgAod.toFixed(3)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-bold ${
                        row.aodYoyChange === null
                          ? "text-[#58585B]"
                          : row.aodYoyChange > 0
                          ? "text-[#991B1B]"
                          : "text-[#166534]"
                      }`}
                    >
                      {row.aodYoyChange !== null
                        ? `${row.aodYoyChange > 0 ? "+" : ""}${row.aodYoyChange.toFixed(1)}%`
                        : "---"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-[11px] text-[#58585B] font-mono pt-2">
              * Note: Annual calculations strictly require both_available === true (QC pass for both sensors in the month).
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Cards (NASA Horizon Layout) */}
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

      {/* Synthesis Card: Decoupled Emission Pathways */}
      <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-sm text-[11px] font-mono font-bold uppercase bg-[#F4F4F5] text-[#1B1B1B] border border-[#E4E4E7]">
            SYNTHESIS FINDING
          </span>
          <h3 className="text-base font-bold text-[#1B1B1B]">{relationshipTitle}</h3>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-[#58585B]">{dynamicDetail}</p>
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
