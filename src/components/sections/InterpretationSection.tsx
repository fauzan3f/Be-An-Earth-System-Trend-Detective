import React from "react";
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
} from "lucide-react";
import type { TrendAnalysisContract } from "../../types";
import { formatSlope } from "../../utils/formatters";

interface InterpretationSectionProps {
  no2Metadata: TrendAnalysisContract;
  aodMetadata: TrendAnalysisContract;
  periodLabel: string;
  onDownloadCsv: (variable: "NO2" | "AOD") => void;
  onOpenUpload: () => void;
  onOpenGlossary: (term?: "NO2" | "AOD" | "SenSlope" | "pValue" | "All") => void;
}

export const InterpretationSection: React.FC<InterpretationSectionProps> = ({
  no2Metadata,
  aodMetadata,
  periodLabel,
  onDownloadCsv,
  onOpenUpload,
  onOpenGlossary,
}) => {
  const downloadFile = (filePath: string, filename: string) => {
    const link = document.createElement("a");
    link.href = filePath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      id="interpretation"
      aria-labelledby="interpretation-heading"
      className="py-12 space-y-10"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#059669] uppercase tracking-widest">
          <span>STEP 06</span>
          <span>/</span>
          <span>SCIENTIFIC INTERPRETATION &amp; DECISION SUPPORT</span>
        </div>
        <h2
          id="interpretation-heading"
          className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B1B1B] tracking-tight flex items-center gap-2.5"
        >
          <BookOpen className="w-6 h-6 text-[#1967D2]" aria-hidden="true" />
          Read the Interpretation: Understand the Results
        </h2>
        <p className="text-sm text-[#58585B] max-w-3xl leading-relaxed">
          Executive synthesis, educational guides, and verified scientific caveats for decision-makers,
          educators, and researchers exploring multi-decadal Earth system observations.
        </p>
      </div>

      {/* 4 Core NASA Detective Questions Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#1B1B1B] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1967D2]" aria-hidden="true" />
          The 4 Core Trend Detective Questions Answered
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Question 1: What is changing? */}
          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1967D2]">
              01 : WHAT IS CHANGING?
            </span>
            <div className="text-sm font-bold text-[#1B1B1B]">
              Positive NO2 point estimate; significant AOD decadal decline.
            </div>
            <p className="text-xs text-[#58585B] leading-relaxed pt-1 border-t border-[#F0F0F0]">
              Tropospheric NO2 exhibits a positive point estimate (+5.36 × 10¹² molecules/cm²/yr) associated with regional
              combustion and economic development, while particulate aerosol optical depth shows a statistically significant
              downward trend across the multi-year baseline.
            </p>
          </div>

          {/* Question 2: Where? */}
          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E4002B]">
              02 : WHERE?
            </span>
            <div className="text-sm font-bold text-[#1B1B1B]">
              West Kalimantan Bounding Box (108°E-114°E, 3.5°S-2.5°N)
            </div>
            <p className="text-xs text-[#58585B] leading-relaxed pt-1 border-t border-[#F0F0F0]">
              A regional geographic bounding box covering equatorial peat domes, the Kapuas River basin,
              Pontianak, and surrounding areas. This is a regional bounding box, not an exact administrative province mask.
            </p>
          </div>

          {/* Question 3: How much? */}
          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D97706]">
              03 : HOW MUCH?
            </span>
            <div className="text-sm font-bold font-mono text-[#1B1B1B]">
              NO2: {formatSlope(no2Metadata.slope_per_year, no2Metadata.unit)}
            </div>
            <p className="text-xs text-[#58585B] leading-relaxed pt-1 border-t border-[#F0F0F0]">
              NO2 shifts at +5.36 × 10¹² molecules/cm²/yr (95% CI: [-3.90 × 10¹², +1.46 × 10¹³]). AOD declines at{" "}
              <span className="font-mono font-semibold text-[#1B1B1B]">{formatSlope(aodMetadata.slope_per_year, aodMetadata.unit)}</span> across {periodLabel}.
            </p>
          </div>

          {/* Question 4: Is it significant? */}
          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#059669]">
              04 : IS IT SIGNIFICANT?
            </span>
            <div className="text-sm font-bold text-[#1B1B1B]">
              NO2 is NOT significant; AOD IS statistically significant.
            </div>
            <p className="text-xs text-[#58585B] leading-relaxed pt-1 border-t border-[#F0F0F0]">
              OLS regression with month fixed effects and HAC standard errors indicates insufficient statistical evidence of a
              nonzero linear trend for NO2 (p = 0.2568, CI spans zero). In contrast, AOD decline is statistically significant (p &lt; 0.05).
            </p>
          </div>
        </div>
      </div>

      {/* Educational Guide to the Metrics */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#1B1B1B] flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#1967D2]" aria-hidden="true" />
          Educational Guide: How to Interpret Scientific Metrics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-1.5">
            <h4 className="text-sm font-bold text-[#1B1B1B]">Point Estimate vs. Significant Trend</h4>
            <p className="text-xs text-[#58585B] leading-relaxed">
              A positive point estimate alone does not prove an upward trend. When the HAC p-value exceeds 0.05 and the
              confidence interval spans both negative and positive numbers, the data cannot rule out zero trend or natural variability.
            </p>
          </div>

          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-1.5">
            <h4 className="text-sm font-bold text-[#1B1B1B]">HAC / Newey-West Standard Errors</h4>
            <p className="text-xs text-[#58585B] leading-relaxed">
              Atmospheric data exhibit serial autocorrelation (what happens in month t affects month t+1). HAC (Heteroskedasticity
              and Autocorrelation Consistent) standard errors prevent false-positive conclusions caused by weather persistence.
            </p>
          </div>

          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-1.5">
            <h4 className="text-sm font-bold text-[#1B1B1B]">Simple Linear Reference Line vs. Model Fit</h4>
            <p className="text-xs text-[#58585B] leading-relaxed">
              The dashed reference line drawn on the chart is a simple linear regression for visual orientation only. It is not
              the seasonal OLS + HAC model fit, which controls for month fixed effects and seasonal cycles.
            </p>
          </div>
        </div>
      </div>

      {/* Scientific Limitations & Data Quality Notes */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#1B1B1B] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
          Official Data Quality, Limitations &amp; Guardrails
        </h3>

        <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-4 text-xs sm:text-sm text-[#58585B] leading-relaxed">
          <ol className="list-decimal list-inside space-y-3">
            <li className="pl-1">
              <strong className="text-[#1B1B1B]">Coverage Metric Definition:</strong> The 96.17% coverage metric represents
              the proportion of calendar days with available area-averaged values, <strong>NOT</strong> spatial pixel coverage or ground sensor density.
            </li>
            <li className="pl-1">
              <strong className="text-[#1B1B1B]">Negative Observations &amp; Fill Values:</strong> Giovanni fill values (~-1.26765×10³⁰)
              were screened and converted to missing. Valid negative area-averaged daily values (33 days) were retained per
              the NASA OMNO2 Collection 4 Version 5.0 README (Section 4.4) to maintain unbiased monthly means.
            </li>
            <li className="pl-1">
              <strong className="text-[#1B1B1B]">Instrumental &amp; Sampling Factors:</strong> OMI row anomalies and variations
              in sampling geometry over time can affect multi-year trend estimates (OMNO2 README Sections 2.4, 4.4, 6.4).
            </li>
            <li className="pl-1">
              <strong className="text-[#1B1B1B]">Scientific Presentation Guardrail:</strong> Do NOT describe results as ground-level NO2
              concentrations, causal proof of localized industry activities, or specific city hotspots.
            </li>
          </ol>
        </div>
      </div>

      {/* Official Handoff Files & Export Utilities */}
      <div className="p-6 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0F0F0] pb-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#1B1B1B] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1967D2]" aria-hidden="true" />
              Role 1 Official Handoff Data Files &amp; Export Utilities
            </h4>
            <p className="text-xs text-[#58585B]">
              Verified datasets, statistical audit tables, and synthesis packages
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onDownloadCsv("NO2")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] border border-[#D1D5DB] text-[#1B1B1B] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#0072BC]" aria-hidden="true" />
              <span>Export NO2 CSV</span>
            </button>

            <button
              type="button"
              onClick={() => onDownloadCsv("AOD")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] border border-[#D1D5DB] text-[#1B1B1B] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#D97706]" aria-hidden="true" />
              <span>Export AOD CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#1967D2] hover:bg-[#1557B0] text-white transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              <span>Load Role 1 Data</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenGlossary("All")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] border border-[#D1D5DB] text-[#1B1B1B] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#1967D2]" aria-hidden="true" />
              <span>Full Glossary</span>
            </button>
          </div>
        </div>

        {/* Direct Download Links for Role 1 Artifacts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => downloadFile("/data/no2_dashboard_timeseries.csv", "no2_dashboard_timeseries.csv")}
            className="flex items-center gap-2 p-2.5 rounded-sm bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EFF6FF] text-left transition-colors"
          >
            <FileCheck2 className="w-4 h-4 text-[#0072BC] shrink-0" aria-hidden="true" />
            <div>
              <div className="text-xs font-bold text-[#1B1B1B]">Timeseries CSV</div>
              <div className="text-[10px] text-[#64748B]">190 months (≥20 days)</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => downloadFile("/data/no2_insight.json", "no2_insight.json")}
            className="flex items-center gap-2 p-2.5 rounded-sm bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EFF6FF] text-left transition-colors"
          >
            <Database className="w-4 h-4 text-[#1967D2] shrink-0" aria-hidden="true" />
            <div>
              <div className="text-xs font-bold text-[#1B1B1B]">Insight JSON</div>
              <div className="text-[10px] text-[#64748B]">Metadata, stats &amp; CIs</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => downloadFile("/data/no2_sensitivity_analysis.csv", "no2_sensitivity_analysis.csv")}
            className="flex items-center gap-2 p-2.5 rounded-sm bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EFF6FF] text-left transition-colors"
          >
            <FileText className="w-4 h-4 text-[#D97706] shrink-0" aria-hidden="true" />
            <div>
              <div className="text-xs font-bold text-[#1B1B1B]">Sensitivity CSV</div>
              <div className="text-[10px] text-[#64748B]">15, 20, 25 day tests</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => downloadFile("/data/no2_quality_audit.csv", "no2_quality_audit.csv")}
            className="flex items-center gap-2 p-2.5 rounded-sm bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EFF6FF] text-left transition-colors"
          >
            <FileText className="w-4 h-4 text-[#059669] shrink-0" aria-hidden="true" />
            <div>
              <div className="text-xs font-bold text-[#1B1B1B]">Quality Audit CSV</div>
              <div className="text-[10px] text-[#64748B]">Monthly coverage data</div>
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
            className="inline-flex items-center gap-1 text-[#1967D2] hover:text-[#1557B0] font-semibold underline underline-offset-2"
          >
            <span>Access NASA Giovanni Portal</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};
