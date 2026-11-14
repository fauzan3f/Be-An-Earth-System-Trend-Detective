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
        <h2 id="interpretation-heading" className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B1B1B] tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-[#1967D2]" aria-hidden="true" />
          Read the Interpretation: Understand the Results
        </h2>
        <p className="text-sm text-[#58585B] max-w-3xl leading-relaxed">
          Executive synthesis, educational guides, and verified scientific caveats for decision-makers,
          educators, and students exploring Earth system observations.
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
              01 · WHAT IS CHANGING?
            </span>
            <div className="text-sm font-bold text-[#1B1B1B]">
              NO2 is rising while AOD exhibits decadal decline.
            </div>
            <p className="text-xs text-[#58585B] leading-relaxed pt-1 border-t border-[#F0F0F0]">
              Nitrogen dioxide shows continuous upward drift from fossil fuel combustion and industrial machinery,
              whereas aerosol optical thickness shows slight multi-year decline punctuated by dry-season fire spikes.
            </p>
          </div>

          {/* Question 2: Where? */}
          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E4002B]">
              02 · WHERE?
            </span>
            <div className="text-sm font-bold text-[#1B1B1B]">
              West Kalimantan, Indonesia (108°E–114°E, 3.5°S–2.5°N)
            </div>
            <p className="text-xs text-[#58585B] leading-relaxed pt-1 border-t border-[#F0F0F0]">
              A province-wide bounding box spanning equatorial peat domes, the Kapuas River basin,
              Pontianak's urban transportation hub, and extensive agricultural concessions.
            </p>
          </div>

          {/* Question 3: How much? */}
          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D97706]">
              03 · HOW MUCH?
            </span>
            <div className="text-sm font-bold font-mono text-[#1B1B1B]">
              NO2: {formatSlope(no2Metadata.slope_per_year, no2Metadata.unit)}
            </div>
            <p className="text-xs text-[#58585B] leading-relaxed pt-1 border-t border-[#F0F0F0]">
              AOD shifts at an annual rate of <span className="font-mono font-semibold text-[#1B1B1B]">{formatSlope(aodMetadata.slope_per_year, aodMetadata.unit)}</span> across
              the multi-year observation baseline ({periodLabel}).
            </p>
          </div>

          {/* Question 4: Is it significant? */}
          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#059669]">
              04 · IS IT SIGNIFICANT?
            </span>
            <div className="text-sm font-bold text-[#1B1B1B]">
              Yes, both trends achieve statistical significance (p &lt; 0.05).
            </div>
            <p className="text-xs text-[#58585B] leading-relaxed pt-1 border-t border-[#F0F0F0]">
              Seasonal Mann-Kendall tests confirm the upward NO2 slope (p &lt; 0.0001) is not random noise,
              providing strong empirical evidence of persistent atmospheric accumulation.
            </p>
          </div>
        </div>
      </div>

      {/* Educational Guide to the Metrics */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#1B1B1B] flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#1967D2]" aria-hidden="true" />
          Educational Guide: How to Read the Metrics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-1.5">
            <h4 className="text-sm font-bold text-[#1B1B1B]">Trend Direction</h4>
            <p className="text-xs text-[#58585B] leading-relaxed">
              Indicates monotonic trajectory over multi-year periods. In atmospheric science, monotonic trends
              coexist with sharp seasonal oscillations (e.g. wet monsoon lows vs. August to October dry burning highs).
            </p>
          </div>

          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-1.5">
            <h4 className="text-sm font-bold text-[#1B1B1B]">Rate of Change (Sen's Slope)</h4>
            <p className="text-xs text-[#58585B] leading-relaxed">
              The median slope across all pair combinations in the time series. Unlike standard linear regression,
              Sen's slope is robust against severe single-year outliers, such as the catastrophic 2015 El Niño peat fire smoke surge.
            </p>
          </div>

          <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-1.5">
            <h4 className="text-sm font-bold text-[#1B1B1B]">Statistical Significance (p-value)</h4>
            <p className="text-xs text-[#58585B] leading-relaxed">
              A threshold of p &lt; 0.05 proves less than 5% probability that random weather variation generated the pattern.
              Note: a non-significant result does not mean fires did not happen; it often reflects intense episodic flare-ups
              masked by interannual variability.
            </p>
          </div>
        </div>
      </div>

      {/* Scientific Limitations & Data Quality Notes */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#1B1B1B] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
          Scientific Limitations &amp; Data Quality Caveats
        </h3>

        <div className="p-5 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-4 text-xs sm:text-sm text-[#58585B] leading-relaxed">
          <ol className="list-decimal list-inside space-y-3">
            <li className="pl-1">
              <strong className="text-[#1B1B1B]">Province-Wide Spatial Averaging:</strong> Observations represent
              spatial averages across the West Kalimantan boundary (108°E to 114°E, 3.5°S to 2.5°N). Regional averaging
              smoothes localized urban street-level pollution hotspots in Pontianak and specific peat fire coordinates.
            </li>
            <li className="pl-1">
              <strong className="text-[#1B1B1B]">Column Density vs. Surface Air Quality:</strong> Tropospheric NO2 and total
              AOD quantify total vertical atmospheric loading from ground to space, not human breathing level concentrations.
              Boundary layer height and vertical mixing dictate ground health impacts.
            </li>
            <li className="pl-1">
              <strong className="text-[#1B1B1B]">Cloud-Screening Gaps in Equatorial Tropics:</strong> Frequent convective cloud cover
              in maritime Southeast Asia causes satellite pixel obscuration. The cleaned dataset accounts for this through
              the <span className="font-mono text-[#1B1B1B] font-semibold">valid_days</span> metric, filtering unrepresentative monthly edge samples.
            </li>
          </ol>
        </div>
      </div>

      {/* Official References, Downloads & Tool Utility Bar */}
      <div className="p-6 rounded-sm bg-white border border-[#E0E0E0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0F0F0] pb-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#1B1B1B] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1967D2]" aria-hidden="true" />
              NASA Dataset Citations &amp; Export Utilities
            </h4>
            <p className="text-xs text-[#58585B]">
              NASA Giovanni Level-3 Daily and Monthly Products (Aura/OMI OMNO2d and MODIS MYD08_M3)
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

        <div className="text-xs text-[#58585B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
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
