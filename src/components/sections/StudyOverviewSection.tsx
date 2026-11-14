import React from "react";
import {
  MapPin,
  Calendar,
  SlidersHorizontal,
  RotateCcw,
  ArrowDown,
  Layers,
} from "lucide-react";
import type { DailyCoverageSummary } from "../../types";

interface StudyOverviewSectionProps {
  startYear: number;
  endYear: number;
  availableYears: number[];
  onStartYearChange: (year: number) => void;
  onEndYearChange: (year: number) => void;
  onResetDefaults: () => void;
  isCustomLoaded: boolean;
  excludePartialMonths: boolean;
  onToggleExcludePartialMonths: (val: boolean) => void;
  dailyCoverage?: DailyCoverageSummary;
  onNextStep: () => void;
}

export const StudyOverviewSection: React.FC<StudyOverviewSectionProps> = ({
  startYear,
  endYear,
  availableYears,
  onStartYearChange,
  onEndYearChange,
  onResetDefaults,
  isCustomLoaded,
  excludePartialMonths,
  onToggleExcludePartialMonths,
  dailyCoverage,
  onNextStep,
}) => {
  return (
    <section
      id="study-overview"
      aria-labelledby="overview-heading"
      className="py-14 border-b border-slate-800 space-y-8"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
          <span>Step 2</span>
          <span>·</span>
          <span>Scope &amp; Controls</span>
        </div>
        <h2 id="overview-heading" className="text-2xl sm:text-3xl font-bold text-slate-100">
          Study Overview: Explore Settings
        </h2>
        <p className="text-sm text-slate-400 max-w-3xl">
          Define your temporal scope and review geographic parameters. All downstream
          time-series charts, Sen's slope regressions, and statistical tests recalculate
          dynamically as you adjust settings.
        </p>
      </div>

      {/* Scope Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Region */}
        <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span>Study Region</span>
          </div>
          <div className="text-lg font-bold text-slate-100">West Kalimantan, Indonesia</div>
          <div className="text-xs text-slate-400 font-mono">
            Bounding Box: 108.0°E to 114.0°E, 3.5°S to 2.5°N
          </div>
          <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            Covers tropical equatorial peatlands, river basins, agricultural concessions, and coastal settlements.
          </p>
        </div>

        {/* Period */}
        <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>Analysis Baseline</span>
          </div>
          <div className="text-lg font-bold text-slate-100">2010 to 2025 Baseline</div>
          <div className="text-xs text-slate-400 font-mono">
            Active Slice: {startYear} to {endYear} ({endYear - startYear + 1} years)
          </div>
          <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            Captures severe 2015 El Niño peat fire crisis, 2019 fire flare-up, and multi-year peatland moratoria enforcement.
          </p>
        </div>

        {/* Temporal Resolution */}
        <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4" aria-hidden="true" />
            <span>Temporal Resolution</span>
          </div>
          <div className="text-lg font-bold text-slate-100">Monthly Aggregations</div>
          <div className="text-xs text-slate-400 font-mono">
            {dailyCoverage ? `${dailyCoverage.validDays.toLocaleString()} Daily Observations` : "Level-3 Satellite Grids"}
          </div>
          <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            Monthly means minimize transient cloud-masking noise while daily records allow inspecting episodic fire flare-ups.
          </p>
        </div>
      </div>

      {/* Interactive Controls & Filters Card */}
      <div className="p-5 rounded-xl bg-space-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <SlidersHorizontal className="w-4 h-4 text-sky-400" aria-hidden="true" />
            <span>Interactive Range Slicer &amp; Quality Filter</span>
          </div>

          {(isCustomLoaded || startYear !== 2010 || endYear !== 2025 || !excludePartialMonths) && (
            <button
              type="button"
              onClick={onResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset to 2010-2025 Default</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {/* Year Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-space-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
              <label htmlFor="overview-start-year" className="text-xs text-slate-400 font-medium">
                Start Year:
              </label>
              <select
                id="overview-start-year"
                value={startYear}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= endYear) onStartYearChange(val);
                }}
                className="bg-transparent text-xs font-mono font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
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
              <label htmlFor="overview-end-year" className="text-xs text-slate-400 font-medium">
                End Year:
              </label>
              <select
                id="overview-end-year"
                value={endYear}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= startYear) onEndYearChange(val);
                }}
                className="bg-transparent text-xs font-mono font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-400 rounded"
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

          {/* Quality Filter Checkbox */}
          <label
            htmlFor="overview-edge-filter"
            className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-slate-100 select-none"
          >
            <input
              id="overview-edge-filter"
              type="checkbox"
              checked={excludePartialMonths}
              onChange={(e) => onToggleExcludePartialMonths(e.target.checked)}
              className="w-4 h-4 rounded bg-space-850 border-slate-700 text-sky-500 focus:ring-sky-400"
            />
            <span>
              Exclude partial edge months (valid days &lt; 5)
              <span className="text-slate-400 ml-1">
                (removes 1-day Oct 2010 artifact)
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Dataset Briefs (2 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NO2 Brief */}
        <div className="p-4 rounded-xl bg-space-900 border border-sky-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-sky-950 text-sky-300 border border-sky-800">
              Variable 1: NO2
            </span>
            <span className="text-xs font-mono text-slate-400">molecules/cm²</span>
          </div>
          <h3 className="text-base font-bold text-slate-100">
            Tropospheric Nitrogen Dioxide
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            NASA Aura / OMI (<span className="font-mono text-slate-400">OMNO2d v004</span>). Measures
            vertical atmospheric loading associated with combustion engines, thermal power plants,
            and biomass clearing fires.
          </p>
        </div>

        {/* AOD Brief */}
        <div className="p-4 rounded-xl bg-space-900 border border-amber-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
              Variable 2: AOD
            </span>
            <span className="text-xs font-mono text-slate-400">Unitless (550 nm)</span>
          </div>
          <h3 className="text-base font-bold text-slate-100">
            Aerosol Optical Depth
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            NASA MODIS Aqua &amp; Terra (<span className="font-mono text-slate-400">MYD08_M3 / MOD08_M3</span>).
            Quantifies airborne particulate attenuation from smoke, dust, and haze columns across the atmosphere.
          </p>
        </div>
      </div>

      {/* Next Step CTA */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <span>Step 3: Explore NO2 Trends</span>
          <ArrowDown className="w-4 h-4 text-sky-200" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
