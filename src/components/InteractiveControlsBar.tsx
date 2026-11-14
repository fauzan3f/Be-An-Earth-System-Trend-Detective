import React from "react";
import { SlidersHorizontal, Download, Upload, RotateCcw } from "lucide-react";

interface InteractiveControlsBarProps {
  startYear: number;
  endYear: number;
  availableYears: number[];
  onStartYearChange: (year: number) => void;
  onEndYearChange: (year: number) => void;
  onDownloadCsv: (variable: "NO2" | "AOD") => void;
  onOpenUploadModal: () => void;
  onResetDefaults: () => void;
  isCustomLoaded: boolean;
}

export const InteractiveControlsBar: React.FC<InteractiveControlsBarProps> = ({
  startYear,
  endYear,
  availableYears,
  onStartYearChange,
  onEndYearChange,
  onDownloadCsv,
  onOpenUploadModal,
  onResetDefaults,
  isCustomLoaded,
}) => {
  return (
    <section
      aria-label="Interactive Controls Bar"
      className="bg-space-900 border border-slate-800 rounded-xl p-4 shadow-sm mb-6 space-y-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Year Range Slicer */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <SlidersHorizontal className="w-4 h-4 text-sky-400" aria-hidden="true" />
            <span>Time-Series Range Filter:</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-space-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
              <label htmlFor="start-year-select" className="text-xs text-slate-400 font-medium">
                Start:
              </label>
              <select
                id="start-year-select"
                value={startYear}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= endYear) {
                    onStartYearChange(val);
                  }
                }}
                className="bg-transparent text-xs font-mono font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400 rounded pr-1"
              >
                {availableYears.map((yr) => (
                  <option
                    key={`start-${yr}`}
                    value={yr}
                    disabled={yr > endYear}
                    className="bg-slate-900 text-slate-100"
                  >
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-500 font-bold" aria-hidden="true">to</span>

            <div className="flex items-center gap-1.5 bg-space-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
              <label htmlFor="end-year-select" className="text-xs text-slate-400 font-medium">
                End:
              </label>
              <select
                id="end-year-select"
                value={endYear}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= startYear) {
                    onEndYearChange(val);
                  }
                }}
                className="bg-transparent text-xs font-mono font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400 rounded pr-1"
              >
                {availableYears.map((yr) => (
                  <option
                    key={`end-${yr}`}
                    value={yr}
                    disabled={yr < startYear}
                    className="bg-slate-900 text-slate-100"
                  >
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            ({endYear - startYear + 1} years · {(endYear - startYear + 1) * 12} monthly time-steps)
          </span>
        </div>

        {/* Right: Data Export & Upload Utilities */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export NO2 CSV */}
          <button
            type="button"
            onClick={() => onDownloadCsv("NO2")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-space-850 hover:bg-slate-800 border border-slate-700 text-sky-300 hover:text-sky-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
            title="Download active NO2 monthly series as CSV"
            aria-label="Download active NO2 CSV"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
            <span>Export NO2 CSV</span>
          </button>

          {/* Export AOD CSV */}
          <button
            type="button"
            onClick={() => onDownloadCsv("AOD")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-space-850 hover:bg-slate-800 border border-slate-700 text-amber-300 hover:text-amber-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
            title="Download active AOD monthly series as CSV"
            aria-label="Download active AOD CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>Export AOD CSV</span>
          </button>

          {/* Import Dataset Modal Trigger */}
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-900/60 hover:bg-sky-850 border border-sky-700/80 text-sky-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
            title="Import custom NASA Giovanni CSV or JSON datasets"
            aria-label="Import Custom CSV or JSON Dataset"
          >
            <Upload className="w-3.5 h-3.5 text-sky-300" aria-hidden="true" />
            <span>Import Dataset</span>
          </button>

          {/* Reset Defaults button */}
          {(isCustomLoaded || startYear !== 2010 || endYear !== 2025) && (
            <button
              type="button"
              onClick={onResetDefaults}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
              title="Reset time slice and restore default 2010-2025 datasets"
              aria-label="Reset to Default Data"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
