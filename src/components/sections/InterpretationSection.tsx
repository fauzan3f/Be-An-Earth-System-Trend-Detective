import React, { useState } from "react";
import {
  FileText,
  HelpCircle,
  AlertTriangle,
  Database,
  Download,
  Upload,
  ExternalLink,
  BookOpen,
  FileCheck2,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Activity,
  FileSpreadsheet,
} from "lucide-react";
import type {
  TrendAnalysisContract,
  ScientificPackageData,
  StatisticalAnalysisRow,
  SpatialAnalysisPackageData,
} from "../../types";
import { SpatialAnalysisInsights } from "./SpatialAnalysisInsights";

interface InterpretationSectionProps {
  no2Metadata: TrendAnalysisContract;
  aodMetadata: TrendAnalysisContract;
  periodLabel: string;
  scientificPackage?: ScientificPackageData | null;
  spatialPackage?: SpatialAnalysisPackageData | null;
  onJumpToMap?: () => void;
  onDownloadCsv: (variable: "NO2" | "AOD") => void;
  onOpenUpload: () => void;
  onOpenGlossary: (term?: "NO2" | "AOD" | "SenSlope" | "pValue" | "All") => void;
}

export const InterpretationSection: React.FC<InterpretationSectionProps> = ({
  periodLabel,
  scientificPackage,
  spatialPackage,
  onJumpToMap,
  onDownloadCsv,
  onOpenUpload,
  onOpenGlossary,
}) => {
  const [tableFilter, setTableFilter] = useState<"all" | "trend" | "correlation">("all");
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(true);
  const [isExecutiveSummaryOpen, setIsExecutiveSummaryOpen] = useState<boolean>(false);

  const content = scientificPackage?.content;
  const statisticalRows: StatisticalAnalysisRow[] = scientificPackage?.statisticalRows || [];

  const downloadFile = (filePath: string, filename: string) => {
    const link = document.createElement("a");
    link.href = filePath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter rows for statistical table
  const filteredRows = statisticalRows.filter((row) => {
    if (tableFilter === "trend") {
      return row.analysis.includes("trend");
    }
    if (tableFilter === "correlation") {
      return row.analysis.includes("correlation");
    }
    return true;
  });

  return (
    <section
      id="interpretation"
      aria-labelledby="interpretation-heading"
      className="py-12 space-y-10"
    >
      {/* Step Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#58585B] uppercase tracking-widest">
          <span>STEP 06</span>
          <span>/</span>
          <span>SCIENTIFIC INTERPRETATION &amp; DECISION SUPPORT</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2
            id="interpretation-heading"
            className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B1B1B] tracking-tight flex items-center gap-2.5"
          >
            <BookOpen className="w-6 h-6 text-[#1B1B1B]" aria-hidden="true" />
            {content?.title || "Interpretation: NO2 and AOD in West Kalimantan"}
          </h2>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-2.5 py-1 rounded-sm text-xs font-mono font-bold uppercase bg-[#F4F4F5] text-[#1B1B1B] border border-[#E4E4E7]">
              Status: {content?.status || "Exploratory"}
            </span>
            <button
              type="button"
              onClick={() => setIsExecutiveSummaryOpen(!isExecutiveSummaryOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#1B1B1B] hover:bg-[#000000] text-white transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              <span>Executive / PM Summary</span>
            </button>
          </div>
        </div>
        <p className="text-sm text-[#58585B] max-w-3xl leading-relaxed">
          {content?.period
            ? `Analysis Period: ${content.period} | Sample Size: 191 Paired Valid Months (193 Total Study Months)`
            : `Analysis Period: 2010-11 to 2026-10 | Sample Size: 191 Paired Valid Months (193 Total Study Months)`}
        </p>
      </div>

      {/* Collapsible Executive / PM Summary Drawer (aligned with interpretation_summary.md) */}
      {isExecutiveSummaryOpen && (
        <div className="p-6 rounded-sm bg-[#0B0D10] text-white border border-[#27272A] shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E4002B]" aria-hidden="true" />
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white">
                Executive Scientific Summary (PM &amp; Decision-Maker Brief)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    "/data/interpretation/interpretation_summary.md",
                    "interpretation_summary.md"
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-mono bg-[#1E293B] hover:bg-[#334155] text-white border border-slate-700 transition-colors"
              >
                <Download className="w-3 h-3 text-white" aria-hidden="true" />
                <span>Download Summary MD</span>
              </button>
              <button
                type="button"
                onClick={() => setIsExecutiveSummaryOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-mono px-2 py-1"
                aria-label="Close Executive Summary"
              >
                ✕ Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-gray-300 font-mono">
            <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xs space-y-1.5">
              <span className="font-bold text-white uppercase text-[11px] block text-[#93C5FD]">
                1. NO2 Trend Trajectory
              </span>
              <p>
                Point estimate of +0.0274 × 10¹⁴ molecules/cm²/year (p = 0.663). There is currently insufficient
                statistical evidence of a nonzero linear decadal trend across 2010 to 2026.
              </p>
            </div>

            <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xs space-y-1.5">
              <span className="font-bold text-white uppercase text-[11px] block text-[#FDE047]">
                2. AOD Trend &amp; Sensitivity
              </span>
              <p>
                Full period linear trend: -0.00315/year (p = 0.590). In the subset with NO2 area coverage ≥30%,
                AOD slope shifts to -0.00511/year (p = 0.0134). Conclusions are highly sensitive to spatial QC criteria.
              </p>
            </div>

            <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xs space-y-1.5">
              <span className="font-bold text-white uppercase text-[11px] block text-[#86EFAC]">
                3. Association &amp; Drivers
              </span>
              <p>
                Pearson correlation r = 0.417; seasonal-anomaly correlation r = 0.367. NO2 and AOD share a moderate
                co-occurrence during dry-season burning, but correlation does not imply direct causation.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 font-mono border-t border-[#27272A] pt-3 flex flex-wrap items-center justify-between gap-2">
            <span>Method: OLS linear regression with calendar-month fixed effects and Newey-West HAC (12 lags).</span>
            <span>Source: NO2_AOD_Interpretation_REBUILT_20261115 / interpretation_summary.md</span>
          </div>
        </div>
      )}

      {/* 3 Core Interpretation Cards (Dynamically populated from interpretation_content.json) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#1B1B1B] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1B1B1B]" aria-hidden="true" />
            Core Scientific Findings &amp; Quantitative Metrics
          </h3>
          <span className="text-xs text-[#58585B] font-mono">
            Sample: n = 191 valid paired months (2010-11 to 2026-10)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: NO2 Trend */}
          <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-2.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#58585B]">
                VARIABLE 01 : TROPOSPHERIC NO2
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#15418C]" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-display font-extrabold text-[#1B1B1B] tracking-tight">
                {content?.cards?.[0]?.value || "+0.0274 × 10¹⁴ molecules/cm²/yr"}
              </div>
              <div className="text-xs font-mono text-[#58585B]">
                p-value:{" "}
                <strong className="text-[#1B1B1B]">
                  {content?.cards?.[0]?.p_value !== undefined
                    ? content.cards[0].p_value.toFixed(4)
                    : "0.6630"}
                </strong>{" "}
                (HAC lag 12)
              </div>
            </div>

            <p className="text-xs text-[#58585B] leading-relaxed pt-2 border-t border-[#F0F0F0]">
              {content?.cards?.[0]?.finding ||
                "There is insufficient statistical evidence to conclude that linear NO2 is increasing or decreasing over the observation period."}
            </p>

            <div className="p-2.5 rounded-sm bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] font-mono text-[#58585B] space-y-1">
              <div className="flex justify-between">
                <span>95% Confidence Interval:</span>
                <span className="font-bold text-[#1B1B1B]">[-0.096, +0.151]</span>
              </div>
              <div className="flex justify-between">
                <span>Spatial Support:</span>
                <span className="text-[#1B1B1B]">QC-weighted provincial grid</span>
              </div>
            </div>
          </div>

          {/* Card 2: AOD Trend */}
          <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-2.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#58585B]">
                VARIABLE 02 : AEROSOL OPTICAL DEPTH
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B1B1B]" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-display font-extrabold text-[#1B1B1B] tracking-tight">
                {content?.cards?.[1]?.value || "-0.00315 / yr"}
              </div>
              <div className="text-xs font-mono text-[#58585B]">
                p-value:{" "}
                <strong className="text-[#1B1B1B]">
                  {content?.cards?.[1]?.p_value !== undefined
                    ? content.cards[1].p_value.toFixed(4)
                    : "0.5901"}
                </strong>{" "}
                (HAC lag 12)
              </div>
            </div>

            <p className="text-xs text-[#58585B] leading-relaxed pt-2 border-t border-[#F0F0F0]">
              {content?.cards?.[1]?.finding ||
                "The linear AOD trend across the full 191-month period is not statistically significant; results are sensitive to month selection based on NO2 spatial coverage."}
            </p>

            <div className="p-2.5 rounded-sm bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] font-mono text-[#58585B] space-y-1">
              <div className="flex justify-between">
                <span>95% Confidence Interval:</span>
                <span className="font-bold text-[#1B1B1B]">[-0.0146, +0.0083]</span>
              </div>
              <div className="flex justify-between">
                <span>Spatial Support:</span>
                <span className="text-[#1B1B1B]">Giovanni regional bbox</span>
              </div>
            </div>
          </div>

          {/* Card 3: NO2 - AOD Association */}
          <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-2.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#58585B]">
                CROSS-VARIABLE ASSOCIATION
              </span>
              <Activity className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-display font-extrabold text-[#1B1B1B] tracking-tight">
                {content?.cards?.[2]?.value || "Pearson r = 0.417"}
              </div>
              <div className="text-xs font-mono text-[#58585B]">
                Seasonal Anomaly: <strong className="text-[#1B1B1B]">r = 0.367</strong> (Spearman ρ = 0.326)
              </div>
            </div>

            <p className="text-xs text-[#58585B] leading-relaxed pt-2 border-t border-[#F0F0F0]">
              {content?.cards?.[2]?.finding ||
                "Both atmospheric parameters exhibit a moderate positive association (seasonal-anomaly r = 0.367). This observational co-occurrence does not establish direct causation."}
            </p>

            <div className="p-2.5 rounded-sm bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] font-mono text-[#58585B] space-y-1">
              <div className="flex justify-between">
                <span>Pearson p-value:</span>
                <span className="font-bold text-[#1B1B1B]">1.95 × 10⁻⁹ (Naive)</span>
              </div>
              <div className="flex justify-between">
                <span>Autocorrelation:</span>
                <span className="text-[#1B1B1B]">Not adjusted for serial lag</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensitivity Analysis & Spatial Coverage Comparison Panel */}
      <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0F0] pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#1B1B1B]" aria-hidden="true" />
              <h3 className="font-display font-bold text-[#1B1B1B] text-base">
                Sensitivity Analysis: Impact of Spatial Coverage Filters
              </h3>
            </div>
            <p className="text-xs text-[#58585B]">
              Testing model stability when excluding months with sparse satellite coverage
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F4F5] border border-[#E4E4E7] text-xs font-mono text-[#1B1B1B] rounded-sm self-start sm:self-auto">
            <CheckCircle2 className="w-3 h-3 text-[#1B1B1B]" aria-hidden="true" />
            <span>Robustness Validation</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#1B1B1B] leading-relaxed">
          {content?.sensitivity ||
            "Excluding the six months where NO2 area coverage was < 30% shifts the AOD trend to -0.00511 per year (p = 0.0134). This serves as a sensitivity robustness test, not standalone proof of an AOD decline."}
        </p>

        {/* Sensitivity Metrics Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-sm space-y-2">
            <span className="font-bold text-[#1B1B1B] block">SUBSET A : ALL QC PASS (n = 191)</span>
            <div className="text-[11px] text-[#58585B] space-y-1">
              <div>NO2 Slope: +0.0274 × 10¹⁴ (p = 0.663)</div>
              <div>AOD Slope: -0.00315 / yr (p = 0.590)</div>
              <div>Pearson Correlation: r = 0.417</div>
            </div>
            <span className="inline-block text-[10px] uppercase font-bold text-[#58585B] bg-[#E4E4E7] px-1.5 py-0.5 rounded-xs">
              Baseline Full Period
            </span>
          </div>

          <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-sm space-y-2">
            <span className="font-bold text-[#166534] block">SUBSET B : NO2 AREA ≥ 30% (n = 185)</span>
            <div className="text-[11px] text-[#166534] space-y-1">
              <div>NO2 Slope: +0.0427 × 10¹⁴ (p = 0.531)</div>
              <div>AOD Slope: -0.00511 / yr (p = 0.0134*)</div>
              <div>Pearson Correlation: r = 0.537</div>
            </div>
            <span className="inline-block text-[10px] uppercase font-bold text-[#166534] bg-[#DCFCE7] px-1.5 py-0.5 rounded-xs">
              AOD p &lt; 0.05 on Subset
            </span>
          </div>

          <div className="p-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-sm space-y-2">
            <span className="font-bold text-[#1B1B1B] block">SUBSET C : NO2 AREA ≥ 50% (n = 183)</span>
            <div className="text-[11px] text-[#58585B] space-y-1">
              <div>NO2 Slope: +0.0430 × 10¹⁴ (p = 0.534)</div>
              <div>AOD Slope: -0.00508 / yr (p = 0.0160*)</div>
              <div>Pearson Correlation: r = 0.536</div>
            </div>
            <span className="inline-block text-[10px] uppercase font-bold text-[#58585B] bg-[#E4E4E7] px-1.5 py-0.5 rounded-xs">
              High Spatial Reliability
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Collapsible Statistical Analysis Table (from statistical_analysis.csv) */}
      <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F0F0] pb-3">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-[#1B1B1B]" aria-hidden="true" />
            <h3 className="font-display font-bold text-[#1B1B1B] text-base">
              Statistical Analysis Dataset Table
            </h3>
            <span className="text-xs text-[#58585B] font-mono">
              ({filteredRows.length} records from statistical_analysis.csv)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <div className="inline-flex rounded-sm p-0.5 bg-[#F4F4F5] border border-[#E4E4E7]">
              <button
                type="button"
                onClick={() => setTableFilter("all")}
                className={`px-2.5 py-1 text-xs font-bold rounded-sm transition-all ${
                  tableFilter === "all" ? "bg-white text-[#1B1B1B] shadow-sm" : "text-[#58585B]"
                }`}
              >
                All Models ({statisticalRows.length})
              </button>
              <button
                type="button"
                onClick={() => setTableFilter("trend")}
                className={`px-2.5 py-1 text-xs font-bold rounded-sm transition-all ${
                  tableFilter === "trend" ? "bg-white text-[#1B1B1B] shadow-sm" : "text-[#58585B]"
                }`}
              >
                Trends Only
              </button>
              <button
                type="button"
                onClick={() => setTableFilter("correlation")}
                className={`px-2.5 py-1 text-xs font-bold rounded-sm transition-all ${
                  tableFilter === "correlation" ? "bg-white text-[#1B1B1B] shadow-sm" : "text-[#58585B]"
                }`}
              >
                Correlations Only
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                downloadFile(
                  "/data/scientific_analysis/statistical_analysis.csv",
                  "statistical_analysis.csv"
                )
              }
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-mono font-bold bg-[#F6F6F6] hover:bg-[#EBEBEB] text-[#1B1B1B] border border-[#D1D5DB] rounded-sm transition-colors"
            >
              <Download className="w-3 h-3 text-[#1B1B1B]" aria-hidden="true" />
              <span>Download CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTableExpanded(!isTableExpanded)}
              className="p-1 text-[#58585B] hover:text-[#1B1B1B] rounded-sm border border-[#E5E7EB]"
              aria-label={isTableExpanded ? "Collapse Table" : "Expand Table"}
            >
              {isTableExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isTableExpanded && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#58585B]">
                  <th className="py-2.5 px-3 font-bold">ANALYSIS METHOD</th>
                  <th className="py-2.5 px-3 font-bold">SUBSET</th>
                  <th className="py-2.5 px-3 font-bold">VARIABLE</th>
                  <th className="py-2.5 px-3 font-bold text-center">N</th>
                  <th className="py-2.5 px-3 font-bold text-right">SLOPE / COEFF</th>
                  <th className="py-2.5 px-3 font-bold">UNIT</th>
                  <th className="py-2.5 px-3 font-bold text-right">P-VALUE</th>
                  <th className="py-2.5 px-3 font-bold text-right">95% CI</th>
                  <th className="py-2.5 px-3 font-bold text-center">RANGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {filteredRows.map((row, idx) => {
                  const isCorrelation = row.analysis.includes("correlation");
                  const valDisplay = isCorrelation
                    ? row.coefficient !== undefined
                      ? `r = ${row.coefficient.toFixed(3)}`
                      : "---"
                    : row.slope_per_year !== undefined
                    ? row.slope_per_year > 0
                      ? `+${row.slope_per_year.toFixed(4)}`
                      : row.slope_per_year.toFixed(4)
                    : "---";

                  const pValDisplay =
                    row.p_value !== undefined
                      ? row.p_value < 0.0001
                        ? row.p_value.toExponential(2)
                        : row.p_value.toFixed(4)
                      : row.p_value_naive !== undefined
                      ? `${row.p_value_naive.toExponential(2)} (naive)`
                      : "---";

                  const ciDisplay =
                    row.ci95_lower !== undefined && row.ci95_upper !== undefined
                      ? `[${row.ci95_lower.toFixed(3)}, ${row.ci95_upper.toFixed(3)}]`
                      : "---";

                  return (
                    <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-2 px-3 font-bold text-[#1B1B1B]">
                        {row.analysis.replace(/_/g, " ")}
                      </td>
                      <td className="py-2 px-3 text-[#58585B]">{row.subset.replace(/_/g, " ")}</td>
                      <td className="py-2 px-3 font-medium text-[#1B1B1B] uppercase">
                        {row.variable.replace(/_/g, " ")}
                      </td>
                      <td className="py-2 px-3 text-center text-[#58585B]">{row.n_months}</td>
                      <td className="py-2 px-3 text-right font-bold text-[#1B1B1B]">{valDisplay}</td>
                      <td className="py-2 px-3 text-[#58585B] text-[11px]">{row.slope_unit || "dimensionless"}</td>
                      <td className="py-2 px-3 text-right text-[#1B1B1B]">{pValDisplay}</td>
                      <td className="py-2 px-3 text-right text-[#58585B] text-[11px]">{ciDisplay}</td>
                      <td className="py-2 px-3 text-center text-[#58585B] text-[11px]">
                        {row.start} to {row.end}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4 Core NASA Detective Questions Answered (Strict Monochrome) */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#1B1B1B] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1B1B1B]" aria-hidden="true" />
          The 4 Core Trend Detective Questions Answered
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Question 1: What is changing? */}
          <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#58585B]">
              01 : WHAT IS CHANGING?
            </span>
            <div className="text-sm font-bold text-[#1B1B1B]">
              Non-significant NO2 point estimate; AOD trend sensitive to spatial filter.
            </div>
            <p className="text-xs text-[#58585B] leading-relaxed pt-1 border-t border-[#F0F0F0]">
              Tropospheric NO2 exhibits a point estimate of +0.0274 × 10¹⁴ molecules/cm²/yr (p = 0.663), while AOD
              shows a slope of -0.00315/yr (p = 0.590) on the full 191-month dataset. Neither linear trend is statistically significant at α = 0.05.
            </p>
          </div>

          {/* Question 2: Where? */}
          <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#58585B]">
              02 : WHERE?
            </span>
            <div className="text-sm font-bold text-[#1B1B1B]">
              West Kalimantan Bounding Box (108.5°E-113.5°E, 3.5°S-2.5°N)
            </div>
            <p className="text-xs text-[#58585B] leading-relaxed pt-1 border-t border-[#F0F0F0]">
              Regional tropical domain encompassing Borneo peat domes and coastal urban centers. Note: NO2 is an
              area-weighted provincial grid average, whereas AOD is a regional bounding-box average.
            </p>
          </div>

          {/* Question 3: How much? */}
          <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#58585B]">
              03 : HOW MUCH?
            </span>
            <div className="text-sm font-bold font-mono text-[#1B1B1B]">
              NO2: +0.0274 × 10¹⁴ | AOD: -0.00315
            </div>
            <p className="text-xs text-[#58585B] leading-relaxed pt-1 border-t border-[#F0F0F0]">
              NO2 slope 95% CI: [-0.096, +0.151] molecules/cm²/yr. AOD slope 95% CI: [-0.0146, +0.0083] across {periodLabel}.
              Both 95% confidence intervals cross zero in the primary model.
            </p>
          </div>

          {/* Question 4: Is it significant? */}
          <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#58585B]">
              04 : IS IT SIGNIFICANT?
            </span>
            <div className="text-sm font-bold text-[#1B1B1B]">
              Neither is statistically significant (α = 0.05) on the full dataset.
            </div>
            <p className="text-xs text-[#58585B] leading-relaxed pt-1 border-t border-[#F0F0F0]">
              OLS regression with month fixed effects and 12-lag Newey-West HAC standard errors confirms no statistically
              detectable decadal linear trend for either variable on the complete 191-month record.
            </p>
          </div>
        </div>
      </div>

      {/* Atmospheric Anomaly Case Studies Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#E4002B]" aria-hidden="true" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#1B1B1B]">
            Documented Atmospheric Case Studies &amp; Biomass Fire Episodes
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-[#E4002B] text-white">
                HISTORIC PEAK
              </span>
              <span className="text-xs font-mono font-bold text-[#58585B]">Sep-Oct 2015</span>
            </div>
            <h4 className="text-sm font-bold text-[#1B1B1B]">Super El Niño Peatland Crisis</h4>
            <p className="text-xs text-[#58585B] leading-relaxed">
              Prolonged drought spawned widespread subsurface peat fires across Borneo. Peak AOD reached 2.060 (Sep 2015)
              and 1.996 (Oct 2015), attenuating over 80% of direct solar radiation. NO2 reached 2.11 × 10¹⁵ molecules/cm².
            </p>
          </div>

          <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-[#1B1B1B] text-white">
                STRONG IOD EVENT
              </span>
              <span className="text-xs font-mono font-bold text-[#58585B]">Aug-Sep 2019</span>
            </div>
            <h4 className="text-sm font-bold text-[#1B1B1B]">Positive Indian Ocean Dipole Haze</h4>
            <p className="text-xs text-[#58585B] leading-relaxed">
              Severe dry-season meteorological conditions triggered extensive peat burning before monsoon arrival.
              September 2019 recorded AOD 1.199 and NO2 1.96 × 10¹⁵ molecules/cm², confirming tight seasonal co-occurrence.
            </p>
          </div>

          <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-[#F4F4F5] text-[#1B1B1B] border border-[#E4E4E7]">
                RECENT ANOMALY
              </span>
              <span className="text-xs font-mono font-bold text-[#58585B]">Aug-Oct 2026</span>
            </div>
            <h4 className="text-sm font-bold text-[#1B1B1B]">Late Dry-Season Column Spike</h4>
            <p className="text-xs text-[#58585B] leading-relaxed">
              August 2026 recorded a sharp NO2 peak of 2.68 × 10¹⁵ molecules/cm² with moderate AOD (0.903), followed by an
              AOD spike of 1.652 in October 2026, illustrating episodic emission dynamics.
            </p>
          </div>
        </div>
      </div>

      {/* Spatial Analysis & Candidate Hotspot Insights */}
      {spatialPackage && (
        <SpatialAnalysisInsights
          spatialPackage={spatialPackage}
          onJumpToMap={onJumpToMap}
        />
      )}

      {/* Official Data Quality, Limitations & Scientific Guardrails */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#1B1B1B] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#1B1B1B]" aria-hidden="true" />
          Official Data Quality, Limitations &amp; Guardrails
        </h3>

        <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-4 text-xs sm:text-sm text-[#58585B] leading-relaxed">
          <ol className="list-decimal list-inside space-y-3">
            <li className="pl-1">
              <strong className="text-[#1B1B1B]">Spatial Support Mismatch:</strong> NO2 is calculated as the area-weighted mean
              of 0.25° grids intersecting West Kalimantan province. AOD is a regional bounding-box area average
              [108.5°E-113.5°E, 3.5°S-2.5°N]. Their geographical boundaries and spatial averaging supports are not directly identical.
            </li>
            <li className="pl-1">
              <strong className="text-[#1B1B1B]">Variable Spatial Coverage:</strong> Satellite spatial coverage varies across
              months due to tropical cloud screening; September and October 2026 have under 2% valid provincial area coverage.
            </li>
            <li className="pl-1">
              <strong className="text-[#1B1B1B]">Exploratory Quality Control:</strong> All quality control flags are exploratory
              and designed for interactive investigation, not final scientific Level-2 spatial validation.
            </li>
            <li className="pl-1">
              <strong className="text-[#1B1B1B]">AOD Spatial Resolution Limitation:</strong> AOD data from Giovanni is not spatial
              grid data. No spatial AOD heatmap is fabricated or rendered.
            </li>
            <li className="pl-1">
              <strong className="text-[#1B1B1B]">No Ground-Level Air Quality Claims:</strong> Satellite tropospheric vertical
              column density (NO2) and columnar aerosol extinction (AOD) must NOT be framed as official ground-level air quality
              index (AQI/ISPU) health categories.
            </li>
          </ol>

          {/* Spatial Interpretation Alert Box */}
          <div className="p-3 bg-[#FEF2F2] border-l-4 border-[#E4002B] rounded-xs text-xs text-[#1B1B1B] font-mono space-y-1 mt-4">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[#991B1B]">
              <AlertTriangle className="w-4 h-4 text-[#E4002B]" aria-hidden="true" />
              <span>
                Spatial Interpretation Advisory (Status:{" "}
                {spatialPackage
                  ? "exploratory validation complete"
                  : content?.spatial_interpretation?.status || "pending_grid_validation"}
                )
              </span>
            </div>
            <p className="text-[#58585B]">
              {spatialPackage
                ? "Spatial validation across all 246 grid cells (0.25°) has been evaluated. 210 grids (85.4%) achieve >=80% temporal coverage. Candidate elevated NO2 cluster identified around 0.375°N to 0.625°N, 110.125°E to 110.625°E as relative satellite column anomalies rather than regulatory ambient air quality classifications (AQI/ISPU)."
                : content?.spatial_interpretation?.message ||
                  "NO2 spatial patterns (hotspots, top grids, location persistence) have not been evaluated. Avoid claiming specific regulatory hotspots."}
            </p>
          </div>
        </div>
      </div>

      {/* Official Data Files & Export Utilities */}
      <div className="p-6 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0F0F0] pb-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#1B1B1B] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1B1B1B]" aria-hidden="true" />
              NASA Earthdata &amp; Scientific Analysis Export Utilities
            </h4>
            <p className="text-xs text-[#58585B]">
              Research-ready data files, model results, and executive summaries
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onDownloadCsv("NO2")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] border border-[#D1D5DB] text-[#1B1B1B] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
              <span>Export NO2 CSV</span>
            </button>

            <button
              type="button"
              onClick={() => onDownloadCsv("AOD")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] border border-[#D1D5DB] text-[#1B1B1B] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
              <span>Export AOD CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#1B1B1B] hover:bg-[#000000] text-white transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              <span>Import Dataset</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenGlossary("All")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] border border-[#D1D5DB] text-[#1B1B1B] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
              <span>Full Glossary</span>
            </button>
          </div>
        </div>

        {/* Direct Download Links for Packages */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() =>
              downloadFile(
                "/data/scientific_analysis/statistical_analysis.csv",
                "statistical_analysis.csv"
              )
            }
            className="flex items-center gap-2 p-2.5 rounded-sm bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-left transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#1B1B1B] shrink-0" aria-hidden="true" />
            <div>
              <div className="text-xs font-bold text-[#1B1B1B]">Statistical CSV</div>
              <div className="text-[10px] text-[#64748B]">Full regression models</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              downloadFile(
                "/data/spatial_analysis/no2_spatial_grid_summary.csv",
                "no2_spatial_grid_summary.csv"
              )
            }
            className="flex items-center gap-2 p-2.5 rounded-sm bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-left transition-colors"
          >
            <TableIcon className="w-4 h-4 text-[#1B1B1B] shrink-0" aria-hidden="true" />
            <div>
              <div className="text-xs font-bold text-[#1B1B1B]">Grid Summary CSV</div>
              <div className="text-[10px] text-[#64748B]">246 grid cells statistics</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              downloadFile(
                "/data/spatial_analysis/no2_spatial_findings.json",
                "no2_spatial_findings.json"
              )
            }
            className="flex items-center gap-2 p-2.5 rounded-sm bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-left transition-colors"
          >
            <Database className="w-4 h-4 text-[#1B1B1B] shrink-0" aria-hidden="true" />
            <div>
              <div className="text-xs font-bold text-[#1B1B1B]">Spatial Findings</div>
              <div className="text-[10px] text-[#64748B]">Hotspot cluster JSON</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              downloadFile(
                "/data/interpretation/interpretation_summary.md",
                "interpretation_summary.md"
              )
            }
            className="flex items-center gap-2 p-2.5 rounded-sm bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-left transition-colors"
          >
            <FileCheck2 className="w-4 h-4 text-[#1B1B1B] shrink-0" aria-hidden="true" />
            <div>
              <div className="text-xs font-bold text-[#1B1B1B]">Summary MD</div>
              <div className="text-[10px] text-[#64748B]">Executive PM report</div>
            </div>
          </button>
        </div>

        <div className="text-xs text-[#58585B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-[#F0F0F0]">
          <span>
            Data processed via NASA Goddard Earth Sciences Data and Information Services Center (GES DISC).
          </span>
          <a
            href="https://giovanni.gsfc.nasa.gov/giovanni/"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-[#1B1B1B] hover:text-[#000000] font-semibold underline underline-offset-2"
          >
            <span>Access NASA Giovanni Portal</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};
