import React from "react";
import { Database, Calculator, AlertTriangle, ExternalLink, HelpCircle } from "lucide-react";

interface ScientificFooterProps {
  onOpenGlossary: (term: "NO2" | "AOD" | "SenSlope" | "pValue" | "All") => void;
}

export const ScientificFooter: React.FC<ScientificFooterProps> = ({ onOpenGlossary }) => {
  return (
    <footer className="mt-12 pt-8 pb-12 border-t border-slate-800 space-y-8">
      {/* Sources, Methods & Limitations Card */}
      <div className="bg-space-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/80">
              <Database className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Data Sources, Methods &amp; Limitations
              </h3>
              <p className="text-xs text-slate-400">
                NASA Giovanni Level-3 Monthly Atmospheric Products and Non-Parametric Trend Detection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenGlossary("All")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" aria-hidden="true" />
            Open Full Scientific Glossary
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Data Sources */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-300">
              <Database className="w-4 h-4 text-sky-400" aria-hidden="true" />
              <span>NASA Data Sources</span>
            </div>
            <ul className="text-xs space-y-2 text-slate-300 leading-relaxed">
              <li className="p-2.5 rounded-lg bg-space-850 border border-slate-800/80">
                <span className="font-semibold text-slate-100 block">NO2 Product: OMNO2d v004</span>
                <span className="text-slate-400">
                  NASA Aura Ozone Monitoring Instrument (OMI), Daily Level-3 0.25° grid, Tropospheric Column.
                </span>
              </li>
              <li className="p-2.5 rounded-lg bg-space-850 border border-slate-800/80">
                <span className="font-semibold text-slate-100 block">AOD Product: MYD08_M3 / MOD08_M3</span>
                <span className="text-slate-400">
                  NASA Aqua and Terra Moderate Resolution Imaging Spectroradiometer (MODIS), 1.0° Monthly Combined.
                </span>
              </li>
              <li>
                <a
                  href="https://giovanni.gsfc.nasa.gov/giovanni/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2"
                >
                  Access NASA Giovanni Portal
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Statistical Methodology */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <Calculator className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Statistical Methodology</span>
            </div>
            <div className="p-3 rounded-lg bg-space-850 border border-slate-800/80 text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong className="text-slate-100">Seasonal Mann-Kendall + Sen's Slope:</strong> Recommended
                by the World Meteorological Organization (WMO) for non-normally distributed atmospheric time series.
              </p>
              <p>
                Sen's slope computes the median of all pairwise temporal slopes, rendering it immune to episodic wildfire outliers.
              </p>
              <p className="text-slate-400">
                Significance is evaluated at the α = 0.05 threshold (p &lt; 0.05) using the standard normal test statistic Z.
              </p>
            </div>
          </div>

          {/* Column 3: Limitations & Caveats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>Limitations &amp; Caveats</span>
            </div>
            <ol className="text-xs space-y-2 text-slate-300 leading-relaxed list-decimal list-inside">
              <li className="p-2.5 rounded-lg bg-space-850 border border-slate-800/80">
                <span className="font-semibold text-slate-100">Province-wide Area-Averaged Data:</span>
                <span className="block mt-0.5 text-slate-400">
                  Values represent spatial averages across the West Kalimantan bounding box (108°E to 114°E, 3.5°S to 2.5°N), not pixel-level urban hotspots or localized roadside monitoring.
                </span>
              </li>
              <li className="p-2.5 rounded-lg bg-space-850 border border-slate-800/80">
                <span className="font-semibold text-slate-100">Column vs. Surface Concentration:</span>
                <span className="block mt-0.5 text-slate-400">
                  Tropospheric column NO2 and total column AOD measure total vertical atmospheric loading from ground to stratosphere, rather than direct ground-level human breathing exposure.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Attribution bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
        <div>
          <span>Earth System Trend Detective · 2026 NASA Space Apps Challenge</span>
        </div>
        <div>
          <span>Atmospheric Science Data &amp; Web Visualization Platform</span>
        </div>
      </div>
    </footer>
  );
};
