import React from "react";
import { ArrowDown, Satellite, MapPin, Calculator, ShieldCheck } from "lucide-react";
import { AnimatedCounter } from "../AnimatedCounter";

interface WelcomeSectionProps {
  onStartExploring: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onStartExploring }) => {
  return (
    <section
      id="welcome"
      aria-labelledby="welcome-hero-title"
      className="bg-[#0B0D10] text-white overflow-hidden border-b border-[rgba(255,255,255,0.12)]"
    >
      {/* Top Countdown-Style Telemetry Strip (NASA Brand Blue #15418C) */}
      <div className="bg-[#15418C] text-white border-b border-[#0E2A5C] px-4 py-2.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-[#E4E4E7]">
            <ShieldCheck className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            <span>NASA Space Apps Challenge 2026 : Earth System Trend Detective</span>
          </div>

          {/* Telemetry Scope Numbers with Animated Counters */}
          <div className="flex items-center gap-4 text-center">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white tracking-widest font-mono">2010</span>
              <span className="text-[9px] uppercase tracking-wider text-[#A1A1AA]">START YR</span>
            </div>
            <span className="text-white/30">:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white tracking-widest font-mono">2026</span>
              <span className="text-[9px] uppercase tracking-wider text-[#A1A1AA]">END YR</span>
            </div>
            <span className="text-white/30">:</span>
            <div className="flex items-baseline gap-1.5">
              <AnimatedCounter value={190} className="text-sm font-bold text-white tracking-widest font-mono" />
              <span className="text-[9px] uppercase tracking-wider text-[#A1A1AA]">MONTHS</span>
            </div>
            <span className="text-white/30">:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white tracking-widest font-mono">0.25°</span>
              <span className="text-[9px] uppercase tracking-wider text-[#A1A1AA]">GRID RES</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#E4E4E7] uppercase tracking-wider">
            WEST KALIMANTAN, ID (108°E-114°E)
          </div>
        </div>
      </div>

      {/* Main Dramatic Earth/Space Hero */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* Subtle background glow/radial simulating orbital horizon */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent"
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

          <p className="text-base sm:text-lg text-[#E4E4E7] leading-relaxed font-body max-w-2xl">
            Detect, visualize, and rigorously test the statistical significance of
            spaceborne atmospheric observations across West Kalimantan, Indonesia.
            Investigate multi-decadal trends in Nitrogen Dioxide (NO2) and Aerosol Optical
            Depth (AOD) using NASA Giovanni Level-3 datasets.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onStartExploring}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-sm text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#E4002B] hover:bg-[#B80022] text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#E4002B] active:scale-95"
            >
              <span>Start Exploring</span>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1">
                <ArrowDown className="w-3 h-3 text-white" aria-hidden="true" />
              </span>
            </button>
            <span className="text-xs text-[#A1A1AA] font-mono">
              Step 1 of 6 : Guided Earthdata Walkthrough
            </span>
          </div>
        </div>

        {/* Bottom Hero 3-Column Feature Cards (Strict NASA Monochrome) */}
        <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.12)] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group p-4 rounded-sm bg-[#12151B] border border-[rgba(255,255,255,0.12)] space-y-2 hover:border-[rgba(255,255,255,0.3)] transition-colors">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-white" aria-hidden="true" />
                <span>SATELLITE MISSIONS</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#E4002B] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-bold text-white">Aura OMI &amp; Aqua/Terra MODIS</div>
            <div className="text-xs text-[#A1A1AA] leading-relaxed">
              OMNO2d Daily Level-3 Tropospheric Column &amp; MYD08_M3 550nm Combined AOD.
            </div>
          </div>

          <div className="group p-4 rounded-sm bg-[#12151B] border border-[rgba(255,255,255,0.12)] space-y-2 hover:border-[rgba(255,255,255,0.3)] transition-colors">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white" aria-hidden="true" />
                <span>STUDY DOMAIN</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#E4002B] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-bold text-white">West Kalimantan Peatlands (108°E-114°E)</div>
            <div className="text-xs text-[#A1A1AA] leading-relaxed">
              Tropical peat domes, Kapuas watershed, and active concession areas.
            </div>
          </div>

          <div className="group p-4 rounded-sm bg-[#12151B] border border-[rgba(255,255,255,0.12)] space-y-2 hover:border-[rgba(255,255,255,0.3)] transition-colors">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-white" aria-hidden="true" />
                <span>STATISTICAL RIGOR</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#E4002B] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-bold text-white">OLS + HAC (Newey-West) Model</div>
            <div className="text-xs text-[#A1A1AA] leading-relaxed">
              12-lag autocorrelation adjustments evaluated strictly at α = 0.05 significance.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
