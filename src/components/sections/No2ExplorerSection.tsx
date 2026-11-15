import React, { useState } from "react";
import {
  Info,
  ArrowUpRight,
  AlertCircle,
  CalendarCheck,
  Layers,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";
import type {
  TrendAnalysisContract,
  MonthlyDataPoint,
  DailyDataPoint,
  DailyCoverageSummary,
  SensitivityAnalysisEntry,
  CoverageValidationEntry,
} from "../../types";
import { TimeSeriesChart } from "../TimeSeriesChart";
import { formatScientificValue, formatSlope, formatSlopePerDecade } from "../../utils/formatters";

interface No2ExplorerSectionProps {
  metadata: TrendAnalysisContract;
  filteredMonthlySeries: MonthlyDataPoint[];
  filteredDailySeries: DailyDataPoint[];
  trendlinePoints: (number | null)[];
  dailyCoverage?: DailyCoverageSummary;
  sensitivityAnalysis?: SensitivityAnalysisEntry[];
  coverageValidation?: CoverageValidationEntry[];
  viewMode: "monthly" | "daily";
  onViewModeChange: (mode: "monthly" | "daily") => void;
  onOpenGlossaryTooltip: (term: "NO2" | "SenSlope" | "pValue") => void;
  activeMapMonthIndex?: number;
  onSelectMapMonthIndex?: (idx: number) => void;
  onNextStep: () => void;
}

export const No2ExplorerSection: React.FC<No2ExplorerSectionProps> = ({
  metadata,
  filteredMonthlySeries,
  filteredDailySeries,
  trendlinePoints,
  dailyCoverage,
  sensitivityAnalysis,
  coverageValidation,
  viewMode,
  onViewModeChange,
  onOpenGlossaryTooltip,
  activeMapMonthIndex,
  onSelectMapMonthIndex,
  onNextStep,
}) => {
  const [showValidationTable, setShowValidationTable] = useState<boolean>(false);
  const [showCoverageTooltip, setShowCoverageTooltip] = useState<boolean>(false);

  // Official Role 1 Handoff Statistical Display Constants
  const hacPValue = metadata.hac_p_value ?? 0.2568;
  const slopeValue = metadata.slope_per_year || 5357255853493.992;
  const ciLower = metadata.confidence_interval?.[0] ?? -3901643485967.95;
  const ciUpper = metadata.confidence_interval?.[1] ?? 14616155192955.94;
  const totalMonths = metadata.valid_months + metadata.missing_months;
  const validPercentage = totalMonths > 0 ? (metadata.valid_months / totalMonths) * 100 : 98.4;
  const activePoint = filteredMonthlySeries[activeMapMonthIndex ?? 0];
  const isBoundaryActive = activePoint?.boundaryMonth || activePoint?.date === "2010-10";

  const sensitivityRows =
    sensitivityAnalysis && sensitivityAnalysis.length > 0
      ? sensitivityAnalysis
      : [
          { minimum_days: 15, months_used: 192, slope: 5453196152103.758, p_value: 0.24243249937431188, ci_lower: -3690279613116.86, ci_upper: 14596671917324.375, significant: false },
          { minimum_days: 20, months_used: 190, slope: 5357255853493.992, p_value: 0.25677476517548736, ci_lower: -3901643485967.9497, ci_upper: 14616155192955.936, significant: false },
          { minimum_days: 25, months_used: 189, slope: 5322958253110.827, p_value: 0.2589516248543422, ci_lower: -3918835223259.199, ci_upper: 14564751729480.855, significant: false },
        ];

  const coverageRows =
    coverageValidation && coverageValidation.length > 0
      ? coverageValidation
      : [
          { rule: "min_20_days", months_used: 190, slope: 5357255853493.992, p_value: 0.25677476517548736, ci_lower: -3901643485967.9497, ci_upper: 14616155192955.936 },
          { rule: "min_80_percent", months_used: 189, slope: 5322958253110.827, p_value: 0.2589516248543422, ci_lower: -3918835223259.199, ci_upper: 14564751729480.855 },
        ];

  return (
    <section
      id="no2-explorer"
      aria-labelledby="no2-heading"
      className="py-12 border-b border-[#E5E7EB] space-y-6"
    >
      {/* Header and Status Badges */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-[#58585B] uppercase tracking-widest">
            <span>STEP 03</span>
            <span>/</span>
            <span>VARIABLE 01 INVESTIGATION</span>
            <span className="text-[#58585B]">:</span>
            {/* Status Badge: Preliminary per no2_analysis_summary.md */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#12151B] text-white border border-[rgba(255,255,255,0.15)] text-[10px] font-mono font-bold">
              <ShieldCheck className="w-3 h-3 text-[#E4002B]" aria-hidden="true" />
              STATUS: PRELIMINARY
            </span>
          </div>

          <h2
            id="no2-heading"
            className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B1B1B] tracking-tight flex items-center gap-2.5"
          >
            <span className="w-3 h-3 rounded-full bg-[#15418C]" aria-hidden="true" />
            NO2 Explorer: Tropospheric Nitrogen Dioxide
          </h2>

          <p className="text-xs text-[#58585B] max-w-3xl leading-relaxed">
            NASA Giovanni / OMI Aura OMNO2d Version 004 Cleaned Record ({metadata.period}) : West Kalimantan Bounding Box (108°E-114°E, 3.5°S-2.5°N).
            <span className="block mt-0.5 text-[11px] text-[#71717A]">
              Preliminary analysis suitable for exploratory dashboard inspection; not full Level-2 spatial validation.
            </span>
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-sm border border-[#D1D5DB] self-start sm:self-center shadow-sm">
          <Layers className="w-3.5 h-3.5 text-[#58585B] ml-1.5" aria-hidden="true" />
          <button
            type="button"
            onClick={() => onViewModeChange("monthly")}
            className={`px-3 py-1 rounded-sm text-xs font-semibold transition-colors ${
              viewMode === "monthly"
                ? "bg-[#1B1B1B] text-white"
                : "text-[#58585B] hover:text-[#1B1B1B] hover:bg-[#F6F6F6]"
            }`}
            aria-pressed={viewMode === "monthly"}
          >
            Monthly Mean ({metadata.valid_months} Mos)
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("daily")}
            className={`px-3 py-1 rounded-sm text-xs font-semibold transition-colors ${
              viewMode === "daily"
                ? "bg-[#1B1B1B] text-white"
                : "text-[#58585B] hover:text-[#1B1B1B] hover:bg-[#F6F6F6]"
            }`}
            aria-pressed={viewMode === "daily"}
            title="Inspect 5,817 daily satellite observations"
          >
            Daily Observations
          </button>
        </div>
      </div>

      {/* Earthdata Callout Explainer Box with Strict Scientific Guardrail */}
      <div className="p-4 rounded-sm bg-[#F6F6F6] border-l-4 border-[#15418C] text-xs sm:text-sm text-[#1B1B1B] leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-[#15418C] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <div>
            <strong className="text-[#1B1B1B] font-bold">What Satellite NO2 Represents:</strong> Tropospheric
            column NO2 measures the integrated total quantity of nitrogen dioxide molecules in a vertical column of air
            from ground level up to the tropopause (expressed in <span className="font-mono font-semibold">molecules/cm²</span>).
            Emissions originate from high-temperature fossil fuel combustion (vehicles, diesel power plants, mining machinery)
            and seasonal biomass clearing.
          </div>
          <div className="text-[11px] text-[#58585B] font-medium">
            Strict Scientific Guardrail: These satellite data quantify vertical column density across a regional bounding box.
            They do NOT represent ground-level breathing concentrations, causal proof of local industry effects, or urban street-level hotspots.
          </div>
        </div>
      </div>

      {/* Mandatory Statistical Display Row (NASA Strict Monochrome 4-Metric Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Trend Direction & Statistical Significance Badge */}
        <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
          <div className="text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            POINT ESTIMATE &amp; STATUS
          </div>
          <div className="pt-0.5 flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-bold uppercase bg-[#F4F4F5] text-[#1B1B1B] border border-[#E4E4E7]">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
              Positive Point Estimate
            </span>
            {/* Explicit NOT STATISTICALLY SIGNIFICANT Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-mono font-bold uppercase bg-[#F4F4F5] text-[#1B1B1B] border border-[#D4D4D8]">
              <AlertCircle className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
              NOT STATISTICALLY SIGNIFICANT (α = 0.05)
            </span>
          </div>
          <p className="text-[10px] text-[#58585B] leading-tight pt-1">
            Insufficient statistical evidence of a nonzero linear trend at α = 0.05.
          </p>
        </div>

        {/* Metric 2: Rate of Change (Slope Point Estimate) */}
        <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            <span>SLOPE POINT ESTIMATE</span>
            <button
              type="button"
              onClick={() => onOpenGlossaryTooltip("SenSlope")}
              className="text-[#58585B] hover:text-[#1B1B1B]"
              aria-label="What is Slope Point Estimate?"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="text-sm sm:text-base font-mono font-bold text-[#1B1B1B]">
            {formatSlope(slopeValue, metadata.unit)}
          </div>
          <div className="text-[11px] font-mono text-[#58585B]">
            {formatSlopePerDecade(slopeValue, metadata.unit)}
          </div>
          <div className="text-[10px] text-[#58585B] pt-0.5">
            OLS with month fixed effects
          </div>
        </div>

        {/* Metric 3: HAC Significance & 95% Confidence Interval */}
        <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            <span>HAC P-VALUE (NEWEY-WEST)</span>
            <button
              type="button"
              onClick={() => onOpenGlossaryTooltip("pValue")}
              className="text-[#58585B] hover:text-[#1B1B1B]"
              aria-label="What is HAC p-value?"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="text-base sm:text-lg font-mono font-bold text-[#1B1B1B]">
            p = {hacPValue.toFixed(4)}
          </div>
          <div className="text-[11px] font-mono text-[#58585B]">
            95% CI: [{formatScientificValue(ciLower)}, {formatScientificValue(ciUpper)}]
          </div>
          <div className="text-[10px] text-[#58585B] pt-0.5">
            CI spans zero: includes both negative &amp; positive values
          </div>
        </div>

        {/* Metric 4: Area-Average Coverage & Data Quality */}
        <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-1 relative">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#58585B] uppercase tracking-wider">
            <span>AREA &amp; QC SPATIAL COVERAGE</span>
            <button
              type="button"
              onClick={() => setShowCoverageTooltip(!showCoverageTooltip)}
              className="text-[#58585B] hover:text-[#1B1B1B]"
              aria-label="Important coverage clarification"
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="text-xs font-bold text-[#1B1B1B]">
            NASA Giovanni / OMI OMNO2d (0.25° Grid)
          </div>

          <div className="text-[11px] font-mono text-[#58585B]">
            {metadata.valid_months} of {totalMonths} months ({validPercentage.toFixed(1)}% QC pass)
          </div>

          {/* Dynamic Active Month Telemetry Readout (Rule C) */}
          {activePoint && (
            <div className="pt-1.5 border-t border-[#F0F0F0] text-[10px] font-mono text-[#1B1B1B] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-[#58585B]">Selected Month ({activePoint.date}):</span>
                <span className="font-bold">
                  {activePoint.qcAreaPct !== undefined ? `${activePoint.qcAreaPct.toFixed(1)}%` : "N/A"} area · {activePoint.validGridCount ?? 246}/246 cells
                </span>
              </div>
              {activePoint.missingUrlDays !== undefined && activePoint.missingUrlDays > 0 && (
                <div className="text-[#DC2626]">
                  Missing Observations: {activePoint.missingUrlDays} cloud/satellite days
                </div>
              )}
            </div>
          )}

          {dailyCoverage && (
            <div className="flex items-center gap-1 text-[10px] text-[#58585B] pt-0.5 font-mono">
              <CalendarCheck className="w-3 h-3 shrink-0 text-[#58585B]" aria-hidden="true" />
              <span>
                {dailyCoverage.validPercentage.toFixed(2)}% calendar days ({dailyCoverage.validDays.toLocaleString()} valid / {dailyCoverage.missingDays} cloud days)
              </span>
            </div>
          )}

          {/* Interactive Tooltip on Coverage Clarification */}
          {showCoverageTooltip && (
            <div className="absolute z-20 left-0 right-0 top-full mt-1 p-3 rounded-sm bg-[#12151B] text-white text-[11px] leading-snug shadow-xl border border-[rgba(255,255,255,0.15)]">
              <strong className="text-white block mb-1">Important Coverage Clarification:</strong>
              The {dailyCoverage?.validPercentage.toFixed(2) || "96.17"}% coverage metric represents the{" "}
              <strong>proportion of calendar days with available area-averaged values</strong>, NOT spatial pixel coverage.
              Spatial 0.25° grid cells are screened through Giovanni quality flags and exported in the fullstack package.
            </div>
          )}
        </div>
      </div>

      {/* Interactive Time-Series Chart Card */}
      <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#58585B] px-1 border-b border-[#F0F0F0] pb-2">
          <div className="space-y-0.5">
            <span className="font-bold text-[#1B1B1B]">
              {viewMode === "monthly"
                ? "Monthly Mean Tropospheric NO2 with Simple Linear Reference Line"
                : "High-Resolution Daily Satellite Observations (5,817 Daily Observation Points)"}
            </span>
            <p className="text-[11px] text-[#58585B]">
              {viewMode === "monthly"
                ? "Dashed red line represents a Simple Linear Reference Line across available monthly observations (valid_days >= 20)."
                : "Daily time-series showing localized episodic spikes and cloud-screened missing data gaps."}
            </p>
          </div>
          <span className="font-mono text-[11px] self-start sm:self-auto bg-[#F6F6F6] text-[#1B1B1B] px-2 py-0.5 rounded-sm border border-[#E0E0E0]">
            Unit: {metadata.unit}
          </span>
        </div>

        <TimeSeriesChart
          variableName="NO2"
          unit={metadata.unit}
          colorScheme="cyan"
          dataPoints={viewMode === "daily" ? filteredDailySeries : filteredMonthlySeries}
          trendlinePoints={viewMode === "monthly" ? trendlinePoints : undefined}
          trendlineLabel="Simple Linear Reference Line"
          isDailyView={viewMode === "daily"}
          activePointIndex={viewMode === "monthly" ? activeMapMonthIndex : undefined}
          onHoverPointIndex={onSelectMapMonthIndex}
        />

        {/* October 2010 Boundary Month Notice (Rule A) */}
        {isBoundaryActive && (
          <div className="p-3 rounded-sm bg-[#3B1214] border border-[#DC2626] text-white flex items-start gap-2 text-xs leading-snug">
            <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Study Boundary Month Notice (October 2010):</strong> October 2010 is a study boundary month
              (contains only 2010-10-31); no monthly QC average or spatial grid values are exported.
            </span>
          </div>
        )}

        {/* Mandatory QC & Color Scale Disclaimer (Rule C) */}
        <div className="p-3 rounded-sm bg-[#F6F6F6] border border-[#E5E7EB] text-[11px] text-[#1B1B1B] leading-relaxed flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#15418C] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>Mandatory QC &amp; Color Scale Disclaimer:</strong> Exploratory QC (not final). Color scale (blue to red) represents relative tropospheric NO₂ vertical column density (molecules/cm²), NOT official ground-level air quality index (AQI) or health risk categories.
          </span>
        </div>

        {/* Mandatory Trendline Labeling Notice per no2_analysis_summary.md */}
        <div className="p-3 rounded-sm bg-[#F6F6F6] border border-[#E5E7EB] text-[11px] text-[#1B1B1B] leading-relaxed flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-[#58585B] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>Mandatory Labeling Note:</strong> The chart trendline is labeled strictly as a{" "}
            <strong>"Simple Linear Reference Line"</strong>. Do <strong>NOT</strong> interpret this line as the seasonal
            OLS + HAC (Newey-West) model fit, which incorporates monthly dummy fixed effects and 12-lag autocorrelation adjustments.
          </span>
        </div>
      </div>

      {/* Sensitivity & Coverage Validation Section (Collapsible Table - Strict Monochrome) */}
      <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-[#1B1B1B] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#1B1B1B]" aria-hidden="true" />
              Sensitivity Analysis &amp; Coverage Validation Tests
            </h3>
            <p className="text-xs text-[#58585B]">
              Verification across valid-day inclusion thresholds (15, 20, 25 days) and calendar coverage criteria
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowValidationTable(!showValidationTable)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] border border-[#D1D5DB] text-[#1B1B1B] transition-colors self-start sm:self-auto"
            aria-expanded={showValidationTable}
          >
            <span>{showValidationTable ? "Hide Validation Table" : "Show Validation Table (4 Tests)"}</span>
            {showValidationTable ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#58585B]" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#58585B]" aria-hidden="true" />
            )}
          </button>
        </div>

        {showValidationTable && (
          <div className="space-y-3 pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#E5E7EB] rounded-sm">
                <thead className="bg-[#F6F6F6] text-[#58585B] font-mono text-[11px] uppercase border-b border-[#E5E7EB]">
                  <tr>
                    <th className="p-2.5">Inclusion Criteria / Rule</th>
                    <th className="p-2.5">Months Used</th>
                    <th className="p-2.5">Slope (molecules/cm²/yr)</th>
                    <th className="p-2.5">HAC P-Value</th>
                    <th className="p-2.5">95% Confidence Interval</th>
                    <th className="p-2.5">Statistical Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] font-mono text-[11px]">
                  {sensitivityRows.map((entry) => {
                    const isPrimary = entry.minimum_days === 20;
                    return (
                      <tr
                        key={`min-${entry.minimum_days}`}
                        className={isPrimary ? "bg-[#F4F4F5] font-semibold" : "hover:bg-[#F9FAFB]"}
                      >
                        <td className="p-2.5 font-sans text-[#1B1B1B]">
                          Minimum {entry.minimum_days} Valid Days {isPrimary && "(Primary Baseline)"}
                        </td>
                        <td className="p-2.5 text-[#1B1B1B]">{entry.months_used}</td>
                        <td className="p-2.5 text-[#1B1B1B] font-bold">
                          {formatSlope(entry.slope, "molecules/cm²")}
                        </td>
                        <td className="p-2.5 text-[#1B1B1B]">{entry.p_value.toFixed(4)}</td>
                        <td className="p-2.5 text-[#58585B]">
                          [{formatScientificValue(entry.ci_lower)}, {formatScientificValue(entry.ci_upper)}]
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-sm bg-white text-[#1B1B1B] border border-[#D4D4D8] font-bold text-[10px]">
                            Not Significant
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {coverageRows
                    .filter((c) => c.rule === "min_80_percent")
                    .map((entry) => (
                      <tr key={entry.rule} className="hover:bg-[#F9FAFB]">
                        <td className="p-2.5 font-sans text-[#1B1B1B]">
                          Coverage ≥ 80% Calendar Days
                        </td>
                        <td className="p-2.5 text-[#1B1B1B]">{entry.months_used}</td>
                        <td className="p-2.5 text-[#1B1B1B] font-bold">
                          {formatSlope(entry.slope, "molecules/cm²")}
                        </td>
                        <td className="p-2.5 text-[#1B1B1B]">{entry.p_value.toFixed(4)}</td>
                        <td className="p-2.5 text-[#58585B]">
                          [{formatScientificValue(entry.ci_lower)}, {formatScientificValue(entry.ci_upper)}]
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-sm bg-white text-[#1B1B1B] border border-[#D4D4D8] font-bold text-[10px]">
                            Not Significant
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-sm bg-[#F6F6F6] border border-[#E5E7EB] text-xs text-[#58585B] leading-relaxed">
              <strong className="text-[#1B1B1B]">Methodological Robustness Confirmation:</strong> Across all tested valid-day
              inclusion thresholds (15, 20, 25 days) and coverage criteria (≥ 80%), the point estimate remains consistently
              positive (+5.32 × 10¹² to +5.45 × 10¹² molecules/cm²/yr) and consistently non-significant at α = 0.05
              (p = 0.2424 to 0.2590). This demonstrates that the statistical conclusion is robust and not sensitive to
              threshold filtering decisions.
            </div>
          </div>
        )}
      </div>

      {/* Methodology & Data Quality Caveats */}
      <div className="p-4 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2 text-xs text-[#58585B] leading-relaxed">
        <strong className="text-xs font-bold text-[#1B1B1B] block uppercase tracking-wider">
          NASA Giovanni Data Quality &amp; Limitation Notes:
        </strong>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Negative Daily Observations Retained:</strong> Valid negative area-averaged daily values (33 days out of 5,817)
            were intentionally retained per the NASA OMNO2 Collection 4 Version 5.0 README (Section 4.4) to avoid introducing an artificial positive bias into monthly means.
          </li>
          <li>
            <strong>Fill Value Treatment:</strong> Giovanni missing/fill values (~-1.26765×10³⁰) were screened and converted to null.
          </li>
          <li>
            <strong>Instrumental Caveats:</strong> OMI row anomalies and variations in orbital sampling patterns can influence
            long-term decadal trends (see OMNO2 README Sections 2.4, 4.4, 6.4). Giovanni area-average CSV exports do not provide
            per-grid cell quality flags or Weight matrices for independent pixel validation.
          </li>
        </ul>
      </div>

      {/* Next Step CTA with Red Circle Arrow Hover Animation */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNextStep}
          className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#1B1B1B] hover:bg-[#000000] text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B1B1B]"
        >
          <span>Step 4: Explore AOD Trends</span>
          <span className="w-5 h-5 rounded-full bg-[#E4002B] flex items-center justify-center transition-transform group-hover:translate-x-1">
            <ArrowDown className="w-3 h-3 text-white" aria-hidden="true" />
          </span>
        </button>
      </div>
    </section>
  );
};
