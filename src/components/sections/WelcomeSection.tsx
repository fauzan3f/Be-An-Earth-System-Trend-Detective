import React from "react";
import { ArrowDown, Satellite, MapPin, Calculator, ShieldCheck } from "lucide-react";

interface WelcomeSectionProps {
  onStartExploring: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onStartExploring }) => {
  return (
    <section
      id="welcome"
      aria-labelledby="welcome-hero-title"
      className="bg-[#0B0D10] text-white overflow-hidden border-b border-[#222222]"
    >
      {/* Top Countdown-Style Telemetry Strip (NASA Brand Blue #15418C) */}
      <div className="bg-[#15418C] text-white border-b border-[#0E2A5C] px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-blue-100">
            <ShieldCheck className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            <span>NASA Space Apps Challenge 2026 · Earth System Trend Detective</span>
          </div>

          {/* Telemetry Scope Numbers */}
          <div className="flex items-center gap-4 text-center">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white tracking-widest">2010</span>
              <span className="text-[9px] uppercase tracking-wider text-blue-200">START YR</span>
            </div>
            <span className="text-blue-300/60">:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white tracking-widest">2025</span>
              <span className="text-[9px] uppercase tracking-wider text-blue-200">END YR</span>
            </div>
            <span className="text-blue-300/60">:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white tracking-widest">193</span>
              <span className="text-[9px] uppercase tracking-wider text-blue-200">MONTHS</span>
            </div>
            <span className="text-blue-300/60">:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white tracking-widest">0.25°</span>
              <span className="text-[9px] uppercase tracking-wider text-blue-200">GRID RES</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-blue-100 uppercase tracking-wider">
            WEST KALIMANTAN, ID (108°E–114°E)
          </div>
        </div>
      </div>

      {/* Main Dramatic Earth/Space Hero */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* Subtle background glow/radial simulating orbital horizon */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent"
          aria-hidden="true"
        />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm text-[11px] font-mono font-bold tracking-widest uppercase bg-[#15418C] text-white border border-[#1967D2]">
            <span>OFFICIAL EARTH OBSERVATORY INVESTIGATION</span>
          </div>

          <h1
            id="welcome-hero-title"
            className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1]"
          >
            Be An Earth System Trend Detective
          </h1>

          <p className="text-base sm:text-lg text-gray-200 leading-relaxed font-body max-w-2xl">
            Detect, visualize, and rigorously test the statistical significance of
            spaceborne atmospheric observations across West Kalimantan, Indonesia.
            Investigate multi-decadal trends in Nitrogen Dioxide (NO2) and Aerosol Optical
            Depth (AOD) using NASA Giovanni Level-3 datasets.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onStartExploring}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-sm text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#E4002B] hover:bg-[#B80022] text-white shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#E4002B]"
            >
              <span>Start Exploring</span>
              <ArrowDown className="w-4 h-4 text-white" aria-hidden="true" />
            </button>
            <span className="text-xs text-gray-400 font-mono">
              Step 1 of 6 · Guided Earthdata Walkthrough
            </span>
          </div>
        </div>

        {/* Bottom Hero 3-Column Feature Links */}
        <div className="mt-16 pt-8 border-t border-white/20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              <Satellite className="w-4 h-4 text-blue-400" aria-hidden="true" />
              <span>SATELLITE MISSIONS</span>
            </div>
            <div className="text-sm font-bold text-white">Aura OMI &amp; Aqua/Terra MODIS</div>
            <div className="text-xs text-gray-400">
              OMNO2d Daily Level-3 Tropospheric Column &amp; MYD08_M3 550nm Combined AOD.
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              <MapPin className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>STUDY DOMAIN</span>
            </div>
            <div className="text-sm font-bold text-white">West Kalimantan Peatlands (108°E–114°E)</div>
            <div className="text-xs text-gray-400">
              Tropical peat domes, Kapuas watershed, and active concession areas.
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              <Calculator className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>STATISTICAL RIGOR</span>
            </div>
            <div className="text-sm font-bold text-white">Seasonal Mann-Kendall + Sen's Slope</div>
            <div className="text-xs text-gray-400">
              Non-parametric median trend evaluation evaluated at α = 0.05 significance.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
