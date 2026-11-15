import React, { useState, useMemo } from "react";
import {
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowDown,
  Calendar,
  Layers,
  Activity,
  TrendingDown,
  Flame,
} from "lucide-react";
import type {
  TrendAnalysisContract,
  MonthlyDataPoint,
  DailyDataPoint,
  AODMetadata,
  AODMonthlyRecord,
  DailyCoverageSummary,
} from "../../types";
import { TimeSeriesChart } from "../TimeSeriesChart";
import { formatSlope, formatSlopePerDecade } from "../../utils/formatters";

interface AodExplorerSectionProps {
  metadata: TrendAnalysisContract;
  filteredMonthlySeries: MonthlyDataPoint[];
  filteredDailySeries?: DailyDataPoint[];
  trendlinePoints: (number | null)[];
  rawMetadata?: AODMetadata;
  aodRecords?: AODMonthlyRecord[];
  dailyCoverage?: DailyCoverageSummary;
  onOpenGlossaryTooltip: (term: "AOD" | "SenSlope" | "pValue") => void;
  onNextStep: () => void;
}

export const AodExplorerSection: React.FC<AodExplorerSectionProps> = ({
  metadata,
  filteredMonthlySeries,
  filteredDailySeries = [],
  trendlinePoints,
  rawMetadata,
  aodRecords = [],
  dailyCoverage,
  onOpenGlossaryTooltip,
  onNextStep,
}) => {
  const [viewMode, setViewMode] = useState<"monthly" | "daily">("monthly");
  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(() => {
    // Default to the highest peak in the series if found (2015-09)
    const pIdx = filteredMonthlySeries.findIndex((d) => d.date === "2015-09");
    return pIdx >= 0 ? pIdx : Math.max(0, filteredMonthlySeries.length - 1);
  });

  // Keep index within bounds
  const clampedIdx = Math.min(
    Math.max(0, activeMonthIdx),
    Math.max(0, filteredMonthlySeries.length - 1)
  );
  const activePoint = filteredMonthlySeries[clampedIdx] || null;

  // Find corresponding full AOD record if available
  const activeRecord: AODMonthlyRecord | undefined = useMemo(() => {
    if (!activePoint) return undefined;
    return aodRecords.find((r) => r.date === activePoint.date);
  }, [activePoint, aodRecords]);

  // Dynamic KPI calculations over active filtered range
  const { meanAod, maxAodPoint, minAodPoint, validCount, totalCount } = useMemo(() => {
    const valid = filteredMonthlySeries.filter((d) => d.value !== null && !isNaN(d.value!));
    const total = filteredMonthlySeries.length;
    if (valid.length === 0) {
      return {
        meanAod: null,
        medianAod: null,
        maxAodPoint: null,
        minAodPoint: null,
        validCount: 0,
        totalCount: total,
      };
    }

    const values = valid.map((d) => d.value as number);
    const sum = values.reduce((acc, v) => acc + v, 0);
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    let maxPt = valid[0];
    let minPt = valid[0];
    valid.forEach((pt) => {
      if (pt.value! > maxPt.value!) maxPt = pt;
      if (pt.value! < minPt.value!) minPt = pt;
    });

    return {
      meanAod: sum / valid.length,
      medianAod: median,
      maxAodPoint: maxPt,
      minAodPoint: minPt,
      validCount: valid.length,
      totalCount: total,
    };
  }, [filteredMonthlySeries]);

  // Overall dataset constants from Giovanni package
  const overallMean = 0.304;
  const overallMedian = 0.239;
  const isSignificant = metadata.p_value < 0.05;

  // Determine color and label for active AOD value
  const getAodStyle = (val: number | null) => {
    if (val === null) {
      return {
        bg: "bg-[#F4F4F5]",
        border: "border-dashed border-[#A1A1AA]",
        textColor: "text-[#58585B]",
        badgeBg: "bg-[#E4E4E7]",
        label: "No QC-Accepted Value",
        desc: "Study boundary month (2010-10) or failed 3-segment temporal QC (2022-10).",
      };
    }
    if (val < 0.25) {
      return {
        bg: "bg-[#F0FDF4]",
        border: "border-[#86EFAC]",
        textColor: "text-[#166534]",
        badgeBg: "bg-[#DCFCE7]",
        label: "Baseline / Clean Air (< 0.25)",
        desc: "Normal tropical background aerosol attenuation with low atmospheric smoke.",
      };
    }
    if (val < 0.5) {
      return {
        bg: "bg-[#FEFCE8]",
        border: "border-[#FDE047]",
        textColor: "text-[#854D0E]",
        badgeBg: "bg-[#FEF9C3]",
        label: "Elevated Haze (0.25 - 0.50)",
        desc: "Moderate airborne particulate matter from localized dry-season biomass clearing.",
      };
    }
    if (val < 1.0) {
      return {
        bg: "bg-[#FFF7ED]",
        border: "border-[#FDBA74]",
        textColor: "text-[#9A3412]",
        badgeBg: "bg-[#FFEDD5]",
        label: "High Aerosol Loading (0.50 - 1.00)",
        desc: "Heavy particulate attenuation from regional peatland burning and dry-season haze transport.",
      };
    }
    return {
      bg: "bg-[#FEF2F2]",
      border: "border-[#FCA5A5]",
      textColor: "text-[#991B1B]",
      badgeBg: "bg-[#FEE2E2]",
      label: "Extreme Anomaly (> 1.00)",
      desc: "Severe episodic El Niño wildfire smoke storm attenuating > 80% of direct solar radiation.",
    };
  };

  const aodStyle = getAodStyle(activePoint?.value ?? null);

  return (
    <section
      id="aod-explorer"
      aria-labelledby="aod-heading"
      className="py-12 border-b border-[#E5E7EB] space-y-8"
    >
      {/* Header and Step Badge */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#58585B] uppercase tracking-widest">
          <span>STEP 04</span>
          <span>/</span>
          <span>VARIABLE 02 INVESTIGATION</span>
        </div>
        <h2
          id="aod-heading"
          className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B1B1B] tracking-tight flex items-center gap-2.5"
        >
          <span className="w-3 h-3 rounded-full bg-[#1B1B1B]" aria-hidden="true" />
          AOD Explorer: Aerosol Optical Depth
        </h2>
        <p className="text-xs text-[#58585B]">
          NASA Giovanni MODIS Terra Collection 6.1 (2010-10 to 2026-10) : West Kalimantan Bounding Box
        </p>
      </div>

      {/* Mandatory Methodology Notice Banner */}
      <div className="p-4 rounded-sm bg-[#F6F6F6] border-l-4 border-[#1B1B1B] text-xs sm:text-sm text-[#1B1B1B] leading-relaxed flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-[#1B1B1B] shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="text-[#1B1B1B] font-bold block mb-0.5 uppercase tracking-wide">
            Methodology Note:
          </strong>
          NO2 (NASA OMI OMNO2d v004, molecules/cm²) is calculated as the QC area-weighted mean of 0.25° grids
          intersecting West Kalimantan province. AOD (NASA Giovanni MODIS Terra MOD08_D3 v6.1, 550 nm dimensionless)
          is calculated as the daily bounding-box area average [108.5°E-113.5°E, 3.5°S-2.5°N]. All QC flags are exploratory
          and not final scientific validation.
        </div>
      </div>

      {/* 4 Dynamic KPI Cards (Strict NASA Horizon Design) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Mean AOD 550nm */}
        <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            <span>MEAN AOD (550 nm)</span>
            <button
              type="button"
              onClick={() => onOpenGlossaryTooltip("AOD")}
              className="text-[#58585B] hover:text-[#1B1B1B]"
              aria-label="What is AOD?"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="text-2xl font-display font-extrabold text-[#1B1B1B] tracking-tight">
            {meanAod !== null ? meanAod.toFixed(3) : "---"}
          </div>
          <div className="text-[11px] font-mono text-[#58585B] pt-0.5 flex flex-col gap-0.5">
            <span>Study Avg: {overallMean.toFixed(3)} (Median {overallMedian.toFixed(3)})</span>
            <span className="text-xs text-[#1B1B1B] font-bold">Dimensionless optical depth</span>
          </div>
        </div>

        {/* KPI 2: Peak AOD Anomaly */}
        <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            <span>PEAK ANOMALY</span>
            <Flame className="w-3.5 h-3.5 text-[#E4002B]" aria-hidden="true" />
          </div>
          <div className="text-2xl font-display font-extrabold text-[#991B1B] tracking-tight">
            {maxAodPoint ? Number(maxAodPoint.value).toFixed(3) : "2.060"}
          </div>
          <div className="text-[11px] font-mono text-[#58585B] pt-0.5 flex flex-col gap-0.5">
            <span className="font-bold text-[#1B1B1B]">
              {maxAodPoint ? maxAodPoint.date : "2015-09"} (El Niño Fire Peak)
            </span>
            <span>Followed by 2015-10 (1.996) &amp; 2026-10 (1.652)</span>
          </div>
        </div>

        {/* KPI 3: Minimum AOD Clean Baseline */}
        <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-1.5">
          <div className="text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            MINIMUM BASELINE
          </div>
          <div className="text-2xl font-display font-extrabold text-[#166534] tracking-tight">
            {minAodPoint ? Number(minAodPoint.value).toFixed(3) : "0.134"}
          </div>
          <div className="text-[11px] font-mono text-[#58585B] pt-0.5 flex flex-col gap-0.5">
            <span className="font-bold text-[#1B1B1B]">
              {minAodPoint ? minAodPoint.date : "2026-05"} (Clean Wet Season)
            </span>
            <span>Normal tropical background level</span>
          </div>
        </div>

        {/* KPI 4: QC Coverage */}
        <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-1.5">
          <div className="text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            QC DATA COVERAGE
          </div>
          <div className="text-2xl font-display font-extrabold text-[#1B1B1B] tracking-tight">
            {validCount} / {totalCount}
          </div>
          <div className="text-[11px] font-mono text-[#58585B] pt-0.5 flex flex-col gap-0.5">
            <span className="text-[#1B1B1B] font-bold">
              {((validCount / Math.max(1, totalCount)) * 100).toFixed(2)}% Valid Months
            </span>
            <span>Overall Study: 191 / 193 (98.96%)</span>
          </div>
        </div>
      </div>

      {/* RULE A: Bounding-Box Area Average Map Visualizer (NO Fabricated Grid Heatmap!) */}
      <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0F0] pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1B1B1B]" aria-hidden="true" />
              <h3 className="font-display font-bold text-[#1B1B1B] text-base">
                Giovanni Regional Area Average Visualizer
              </h3>
            </div>
            <p className="text-xs text-[#58585B]">
              Bounding Box Coordinates: [108.5°E to 113.5°E, 3.5°S to 2.5°N] (Encompassing West Kalimantan)
            </p>
          </div>

          {/* Strict Rule A Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F4F5] border border-[#E4E4E7] text-xs font-mono text-[#1B1B1B] rounded-sm">
            <span className="w-2 h-2 rounded-full bg-[#1B1B1B]" aria-hidden="true" />
            <span className="font-bold">
              Giovanni Bounding-Box Area Average (108.5°E-113.5°E, 3.5°S-2.5°N) - Spatial Grid Not Available
            </span>
          </div>
        </div>

        {/* Visualizer Canvas Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Uniform Bounding-Box Fill Representation */}
          <div
            className={`col-span-1 md:col-span-2 h-64 rounded-sm border p-6 flex flex-col justify-between transition-all ${aodStyle.bg} ${aodStyle.border}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#58585B]">
                  SATELLITE DOMAIN FILL
                </span>
                <div className="text-xl font-display font-extrabold text-[#1B1B1B] mt-0.5">
                  {activePoint ? activePoint.date : "---"}
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase ${aodStyle.badgeBg} ${aodStyle.textColor}`}
              >
                {aodStyle.label}
              </span>
            </div>

            <div className="text-center py-4">
              <div className="text-4xl sm:text-5xl font-display font-black tracking-tight text-[#1B1B1B]">
                {activePoint?.value !== null && activePoint?.value !== undefined
                  ? Number(activePoint.value).toFixed(3)
                  : "NULL"}
              </div>
              <div className="text-xs font-mono text-[#58585B] mt-1">
                AOD 550 nm ({rawMetadata?.unit || "dimensionless"})
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#58585B] border-t border-black/10 pt-3 font-mono">
              <span>Domain: 108.5°E - 113.5°E / 3.5°S - 2.5°N</span>
              <span>
                {activeRecord
                  ? `${activeRecord.valid_days} valid observation days (${activeRecord.temporal_coverage_pct}% coverage)`
                  : "Giovanni Area Integration"}
              </span>
            </div>
          </div>

          {/* Telemetry & Quality Details Sidebar */}
          <div className="p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-sm space-y-3 text-xs font-mono">
            <div className="font-bold text-[#1B1B1B] uppercase tracking-wider border-b border-[#E5E7EB] pb-2 flex items-center justify-between">
              <span>AOD QUALITY TELEMETRY</span>
              <Activity className="w-3.5 h-3.5 text-[#58585B]" aria-hidden="true" />
            </div>

            <div className="space-y-2 text-[#58585B]">
              <div className="flex justify-between">
                <span>Selected Month:</span>
                <span className="font-bold text-[#1B1B1B]">{activePoint?.date || "---"}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Mean AOD:</span>
                <span className="font-bold text-[#1B1B1B]">
                  {activePoint?.value !== null && activePoint?.value !== undefined
                    ? Number(activePoint.value).toFixed(3)
                    : "null"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Valid Days in Study:</span>
                <span className="font-bold text-[#1B1B1B]">
                  {activeRecord?.valid_days ?? (activePoint?.validDays || "---")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expected Study Days:</span>
                <span className="font-bold text-[#1B1B1B]">
                  {activeRecord?.expected_days_in_study ?? 30}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Temporal Coverage:</span>
                <span className="font-bold text-[#1B1B1B]">
                  {activeRecord
                    ? `${activeRecord.temporal_coverage_pct}%`
                    : activePoint?.coveragePct
                    ? `${activePoint.coveragePct}%`
                    : "---"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>QC Audit Status:</span>
                <span className="font-bold text-[#1B1B1B] uppercase">
                  {activeRecord?.qc_status || (activePoint?.value !== null ? "Pass" : "Fail")}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-sm bg-white border border-[#E5E7EB] text-[11px] text-[#58585B] leading-relaxed">
              {aodStyle.desc}
            </div>
          </div>
        </div>

        {/* Timeline Scrubber Slider */}
        <div className="space-y-2 pt-2 border-t border-[#F0F0F0]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#58585B]">
              Scrub Month ({clampedIdx + 1} of {filteredMonthlySeries.length}):
            </span>
            <span className="font-bold text-[#1B1B1B] bg-[#F4F4F5] px-2.5 py-0.5 rounded-sm border border-[#E4E4E7]">
              {activePoint ? activePoint.date : "---"}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, filteredMonthlySeries.length - 1)}
            value={clampedIdx}
            onChange={(e) => setActiveMonthIdx(parseInt(e.target.value, 10))}
            className="w-full accent-[#1B1B1B] cursor-pointer"
            aria-label="Select month on timeline"
          />
        </div>
      </div>

      {/* Statistical Analysis Row: Sen's Slope, Mann-Kendall, CI, Source */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Trend Direction */}
        <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-1.5">
          <div className="text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            TREND DIRECTION
          </div>
          <div className="pt-0.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-bold uppercase bg-[#F4F4F5] text-[#1B1B1B] border border-[#E4E4E7]">
              <TrendingDown className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
              Decreasing Trend
            </span>
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-mono font-bold uppercase bg-[#F4F4F5] text-[#1B1B1B] border border-[#D4D4D8]">
              {isSignificant ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-[#1B1B1B]" aria-hidden="true" />
                  Significant (p &lt; 0.05)
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-[#1B1B1B]" aria-hidden="true" />
                  Not Significant
                </>
              )}
            </span>
          </div>
        </div>

        {/* Sen's Slope */}
        <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            <span>SEN'S SLOPE</span>
            <button
              type="button"
              onClick={() => onOpenGlossaryTooltip("SenSlope")}
              className="text-[#58585B] hover:text-[#1B1B1B]"
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

        {/* p-value */}
        <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            <span>P-VALUE (MK TEST)</span>
            <button
              type="button"
              onClick={() => onOpenGlossaryTooltip("pValue")}
              className="text-[#58585B] hover:text-[#1B1B1B]"
              aria-label="What is p-value?"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="text-base sm:text-lg font-mono font-bold text-[#1B1B1B]">
            {metadata.p_value < 0.0001 ? "< 0.0001" : metadata.p_value}
          </div>
          <div className="text-[11px] font-mono text-[#58585B]">
            95% CI: [{metadata.confidence_interval[0].toFixed(4)}, {metadata.confidence_interval[1].toFixed(4)}]
          </div>
        </div>

        {/* Data Source & Instrument */}
        <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-1">
          <div className="text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            SENSOR &amp; ALGORITHM
          </div>
          <div className="text-xs font-bold text-[#1B1B1B]">
            NASA MODIS Terra (MOD08_D3)
          </div>
          <div className="text-[11px] font-mono text-[#1B1B1B]">
            Dark Target &amp; Deep Blue 550nm
          </div>
          <div className="text-[10px] text-[#58585B] pt-0.5 font-mono">
            Collection 6.1 via NASA Giovanni
          </div>
        </div>
      </div>

      {/* Interactive Time-Series Chart (Monthly / Daily View Toggle) */}
      <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0F0] pb-3">
          <div>
            <span className="font-display font-bold text-[#1B1B1B] text-base block">
              {viewMode === "monthly"
                ? "Monthly Mean Aerosol Optical Depth (2010 to 2026)"
                : "Daily High-Resolution AOD Observations (5,845 records)"}
            </span>
            <span className="text-xs text-[#58585B] font-mono">
              Dimensionless particulate attenuation at 550 nm | Sen's Slope Reference Line
            </span>
          </div>

          {/* Monthly / Daily Toggle Buttons */}
          <div className="inline-flex rounded-sm p-0.5 bg-[#F4F4F5] border border-[#E4E4E7] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("monthly")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-sm transition-all ${
                viewMode === "monthly"
                  ? "bg-white text-[#1B1B1B] shadow-sm"
                  : "text-[#58585B] hover:text-[#1B1B1B]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Monthly Mean</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("daily")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-sm transition-all ${
                viewMode === "daily"
                  ? "bg-white text-[#1B1B1B] shadow-sm"
                  : "text-[#58585B] hover:text-[#1B1B1B]"
              }`}
            >
              <Activity className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Daily High-Res</span>
            </button>
          </div>
        </div>

        <TimeSeriesChart
          variableName="AOD"
          unit={metadata.unit}
          colorScheme="amber"
          dataPoints={viewMode === "daily" && filteredDailySeries.length > 0 ? filteredDailySeries : filteredMonthlySeries}
          trendlinePoints={viewMode === "monthly" ? trendlinePoints : undefined}
          isDailyView={viewMode === "daily"}
          activePointIndex={viewMode === "monthly" ? clampedIdx : undefined}
          onHoverPointIndex={viewMode === "monthly" ? (idx) => setActiveMonthIdx(idx) : undefined}
        />

        {/* Daily Coverage Summary Bar if Daily mode active */}
        {viewMode === "daily" && dailyCoverage && (
          <div className="pt-2 border-t border-[#F0F0F0] flex flex-wrap items-center justify-between text-xs text-[#58585B] font-mono">
            <span>
              Total Days: <strong className="text-[#1B1B1B]">{dailyCoverage.totalDays}</strong>
            </span>
            <span>
              Valid Records: <strong className="text-[#1B1B1B]">{dailyCoverage.validDays}</strong> ({dailyCoverage.validPercentage.toFixed(2)}%)
            </span>
            <span>
              Missing / Cloud-Screened: <strong className="text-[#1B1B1B]">{dailyCoverage.missingDays}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Next Step CTA with Red Circle Arrow Hover Animation */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNextStep}
          className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#1B1B1B] hover:bg-[#000000] text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B1B1B]"
        >
          <span>Step 5: Compare the Trends</span>
          <span className="w-5 h-5 rounded-full bg-[#E4002B] flex items-center justify-center transition-transform group-hover:translate-x-1">
            <ArrowDown className="w-3 h-3 text-white" aria-hidden="true" />
          </span>
        </button>
      </div>
    </section>
  );
};
