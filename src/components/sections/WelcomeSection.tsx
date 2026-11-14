import React from "react";
import { ArrowDown, Globe, Compass, Activity, ShieldCheck } from "lucide-react";

interface WelcomeSectionProps {
  onStartExploring: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onStartExploring }) => {
  return (
    <section
      id="welcome"
      aria-labelledby="welcome-hero-title"
      className="pt-10 pb-16 border-b border-slate-800 space-y-8"
    >
      <div className="max-w-4xl space-y-6">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-800/80">
          <Globe className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
          <span>NASA Space Apps Challenge 2026 · Earth System Trend Detective</span>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2">
          <h1
            id="welcome-hero-title"
            className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight"
          >
            Earth System Trend Detective
          </h1>
          <p className="text-lg sm:text-xl font-medium text-sky-300/90 italic">
            Explore. Detect. Understand Earth System Trends.
          </p>
        </div>

        {/* Introduction Narrative */}
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          Investigate 16 years of spaceborne atmospheric observations across West Kalimantan, Indonesia.
          This interactive scientific workspace combines multi-sensor NASA satellite records with
          rigorous non-parametric statistical testing (Seasonal Mann-Kendall and Sen's slope) to
          distinguish genuine, long-term environmental shifts from seasonal weather cycles and episodic
          wildfire surges.
        </p>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-space-900 border border-slate-800 flex items-start gap-3">
            <Compass className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs space-y-0.5">
              <span className="font-semibold text-slate-200 block">Target Study Region</span>
              <span className="text-slate-400">West Kalimantan tropical peatlands and forest ecosystems</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-space-900 border border-slate-800 flex items-start gap-3">
            <Activity className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs space-y-0.5">
              <span className="font-semibold text-slate-200 block">Atmospheric Variables</span>
              <span className="text-slate-400">Tropospheric NO2 (OMI) and Aerosol Optical Depth (MODIS)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-space-900 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs space-y-0.5">
              <span className="font-semibold text-slate-200 block">Statistical Testing</span>
              <span className="text-slate-400">Seasonal Mann-Kendall at α = 0.05 significance threshold</span>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="pt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onStartExploring}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/30 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-space-950"
          >
            <span>Start Exploring</span>
            <ArrowDown className="w-4 h-4 text-sky-200" aria-hidden="true" />
          </button>
          <span className="text-xs text-slate-400">
            6-step guided walkthrough with dynamic data slicing
          </span>
        </div>
      </div>
    </section>
  );
};
