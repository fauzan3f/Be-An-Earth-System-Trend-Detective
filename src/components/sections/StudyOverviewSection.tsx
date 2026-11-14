import React from "react";
import {
  MapPin,
  Calendar,
  SlidersHorizontal,
  RotateCcw,
  ArrowDown,
  Layers,
  Compass,
} from "lucide-react";
import type { DailyCoverageSummary, MonthlyDataPoint } from "../../types";
import { WindyPollutionMap } from "../WindyPollutionMap";

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
  no2Series: MonthlyDataPoint[];
  activeMapMonthIndex: number;
  onSelectMapMonthIndex: (index: number) => void;
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
  no2Series,
  activeMapMonthIndex,
  onSelectMapMonthIndex,
  onNextStep,
}) => {
  return (
    <section
      id="study-overview"
      aria-labelledby="overview-heading"
      className="py-12 border-b border-[#E5E7EB] space-y-8"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#58585B] uppercase tracking-widest">
          <span>STEP 02</span>
          <span>/</span>
          <span>STUDY PARAMETERS &amp; SATELLITE VISUALIZER</span>
        </div>
        <h2 id="overview-heading" className="text-2xl sm:text-3xl font-display font-extrabold text-[#1B1B1B] tracking-tight">
          Study Overview: Parameters, Controls &amp; Atmospheric Map
        </h2>
        <p className="text-sm text-[#58585B] max-w-3xl leading-relaxed">
          Configure temporal parameters and explore the interactive satellite visualizer centered on West Kalimantan.
          Downstream time-series charts, Sen's slope regressions, and statistical tests recalculate dynamically.
        </p>
      </div>

      {/* Scope Cards Grid (Strict NASA Monochrome Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Region */}
        <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-[#58585B] text-xs font-mono font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
            <span>STUDY REGION</span>
          </div>
          <div className="text-base font-bold text-[#1B1B1B]">West Kalimantan, Indonesia</div>
          <div className="text-xs text-[#58585B] font-mono">
            Bounding Box: 108.0°E to 114.0°E, 3.5°S to 2.5°N
          </div>
          <p className="text-xs text-[#58585B] pt-1 leading-relaxed border-t border-[#F0F0F0]">
            Tropical peatland hydrological units, Kapuas River basin, and provincial agricultural corridors.
          </p>
        </div>

        {/* Period */}
        <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-[#58585B] text-xs font-mono font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
            <span>TEMPORAL BASELINE</span>
          </div>
          <div className="text-base font-bold text-[#1B1B1B]">2010 to 2026 Multi-Year Baseline</div>
          <div className="text-xs text-[#58585B] font-mono">
            Active Slice: {startYear} to {endYear} ({endYear - startYear + 1} Years)
          </div>
          <p className="text-xs text-[#58585B] pt-1 leading-relaxed border-t border-[#F0F0F0]">
            Captures the 2015 extreme El Niño fire crisis, 2019 season, and subsequent peatland re-wetting policies.
          </p>
        </div>

        {/* Temporal Resolution */}
        <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-[#58585B] text-xs font-mono font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
            <span>PROCESSING RESOLUTION</span>
          </div>
          <div className="text-base font-bold text-[#1B1B1B]">Monthly Level-3 Grids</div>
          <div className="text-xs text-[#58585B] font-mono">
            {dailyCoverage ? `${dailyCoverage.validDays.toLocaleString()} Valid Daily Observations` : "Level-3 Composites"}
          </div>
          <p className="text-xs text-[#58585B] pt-1 leading-relaxed border-t border-[#F0F0F0]">
            Monthly composites smooth convective tropical cloud noise while daily data isolates episodic smoke spikes.
          </p>
        </div>
      </div>

      {/* Interactive Controls & Filters Card */}
      <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F0F0] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1B1B1B]">
            <SlidersHorizontal className="w-4 h-4 text-[#1B1B1B]" aria-hidden="true" />
            <span>Interactive Range Slicer &amp; Quality Filter</span>
          </div>

          {(isCustomLoaded || startYear !== 2010 || endYear !== 2025 || !excludePartialMonths) && (
            <button
              type="button"
              onClick={onResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] text-[#1B1B1B] border border-[#E0E0E0] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset to 2010-2025 Default</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {/* Year Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#F6F6F6] border border-[#D1D5DB] rounded-sm px-3 py-1.5">
              <label htmlFor="overview-start-year" className="text-xs font-medium text-[#58585B]">
                Start Year:
              </label>
              <select
                id="overview-start-year"
                value={startYear}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= endYear) onStartYearChange(val);
                }}
                className="bg-transparent text-xs font-mono font-bold text-[#1B1B1B] focus:outline-none focus:ring-1 focus:ring-[#1967D2] rounded-sm"
              >
                {availableYears.map((yr) => (
                  <option
                    key={`start-${yr}`}
                    value={yr}
                    disabled={yr > endYear}
                    className="bg-white text-[#1B1B1B]"
                  >
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-[#58585B] font-bold" aria-hidden="true">to</span>

            <div className="flex items-center gap-2 bg-[#F6F6F6] border border-[#D1D5DB] rounded-sm px-3 py-1.5">
              <label htmlFor="overview-end-year" className="text-xs font-medium text-[#58585B]">
                End Year:
              </label>
              <select
                id="overview-end-year"
                value={endYear}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= startYear) onEndYearChange(val);
                }}
                className="bg-transparent text-xs font-mono font-bold text-[#1B1B1B] focus:outline-none focus:ring-1 focus:ring-[#1967D2] rounded-sm"
              >
                {availableYears.map((yr) => (
                  <option
                    key={`end-${yr}`}
                    value={yr}
                    disabled={yr < startYear}
                    className="bg-white text-[#1B1B1B]"
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
            className="flex items-center gap-2 cursor-pointer text-xs text-[#1B1B1B] hover:text-[#000000] select-none"
          >
            <input
              id="overview-edge-filter"
              type="checkbox"
              checked={excludePartialMonths}
              onChange={(e) => onToggleExcludePartialMonths(e.target.checked)}
              className="w-4 h-4 rounded-sm border-[#D1D5DB] text-[#E4002B] focus:ring-[#E4002B]"
            />
            <span className="font-medium">
              Exclude partial edge months (valid days &lt; 5)
              <span className="text-[#58585B] ml-1 font-normal font-mono">
                (removes 1-day Oct 2010 outlier)
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Windy.com-Style Interactive Satellite & Atmospheric Map Visualizer */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#58585B] uppercase tracking-wider">
              <Compass className="w-4 h-4 text-[#E4002B]" aria-hidden="true" />
              <span>WINDY.COM-STYLE SATELLITE &amp; POLLUTION VISUALIZER</span>
            </div>
            <h3 className="text-lg font-bold text-[#1B1B1B]">
              West Kalimantan Atmospheric Column Density &amp; Particle Streamlines
            </h3>
          </div>
          <div className="text-xs font-mono text-[#58585B]">
            Interactive Timeline Sync · 190 Monthly Observation Records
          </div>
        </div>

        {/* The Windy Pollution Map Component */}
        <WindyPollutionMap
          series={no2Series}
          activeIndex={activeMapMonthIndex}
          onSelectIndex={onSelectMapMonthIndex}
          variableName="NO2"
          unit="molecules/cm²"
        />
      </div>

      {/* Dataset Briefs (2 Cards - Clean Monochrome) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* NO2 Brief */}
        <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-2">
            <span className="px-2 py-0.5 rounded-sm text-[11px] font-mono font-bold uppercase bg-[#F4F4F5] text-[#1B1B1B] border border-[#E4E4E7]">
              DATASET 01 : NO2
            </span>
            <span className="text-xs font-mono text-[#58585B]">molecules/cm²</span>
          </div>
          <h3 className="text-base font-bold text-[#1B1B1B]">
            Tropospheric Nitrogen Dioxide (OMI OMNO2d)
          </h3>
          <p className="text-xs text-[#58585B] leading-relaxed">
            NASA Aura Ozone Monitoring Instrument (OMI), Version 004 Daily Level-3 0.25° grid.
            Measures vertical atmospheric loading from fossil fuel combustion and localized agricultural clearing.
          </p>
        </div>

        {/* AOD Brief */}
        <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-2">
          <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-2">
            <span className="px-2 py-0.5 rounded-sm text-[11px] font-mono font-bold uppercase bg-[#F4F4F5] text-[#1B1B1B] border border-[#E4E4E7]">
              DATASET 02 : AOD
            </span>
            <span className="text-xs font-mono text-[#58585B]">Unitless (550 nm)</span>
          </div>
          <h3 className="text-base font-bold text-[#1B1B1B]">
            Aerosol Optical Depth (MODIS MYD08_M3)
          </h3>
          <p className="text-xs text-[#58585B] leading-relaxed">
            NASA MODIS Aqua &amp; Terra Combined Monthly Level-3 1.0° product.
            Measures total particulate attenuation (wildfire smoke, haze, dust) across the vertical atmospheric column.
          </p>
        </div>
      </div>

      {/* Next Step CTA with Red Circle Arrow Hover Animation */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNextStep}
          className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#1B1B1B] hover:bg-[#000000] text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B1B1B]"
        >
          <span>Step 3: Explore NO2 Trends</span>
          <span className="w-5 h-5 rounded-full bg-[#E4002B] flex items-center justify-center transition-transform group-hover:translate-x-1">
            <ArrowDown className="w-3 h-3 text-white" aria-hidden="true" />
          </span>
        </button>
      </div>
    </section>
  );
};
