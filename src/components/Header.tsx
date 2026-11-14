import React from "react";
import { Globe, MapPin, Calendar, HelpCircle } from "lucide-react";

interface HeaderProps {
  onOpenGlossary: () => void;
  periodLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGlossary, periodLabel = "2010-2026" }) => {
  return (
    <header className="border-b border-slate-800 pb-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Project Branding */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-sky-950/80 border border-sky-800 text-sky-400">
              <Globe className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              NASA Space Apps 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Earth System Trend Detective
          </h1>
          <p className="text-sm text-slate-400 italic">
            Explore. Detect. Understand Earth System Trends.
          </p>
        </div>

        {/* Study Area Banner & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="bg-space-900 border border-slate-700/80 rounded-xl p-3.5 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <MapPin className="w-4 h-4 text-rose-400" aria-hidden="true" />
              <span>Study Area: West Kalimantan, Indonesia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-space-850 text-sky-300 border border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                Province-wide · Cleaned OMI Dataset · {periodLabel}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenGlossary}
            className="self-start sm:self-center p-2.5 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-300 hover:text-sky-300 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 flex items-center gap-1.5 text-xs font-medium"
            title="Open Scientific Definitions"
            aria-label="Open Scientific Definitions"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" aria-hidden="true" />
            <span className="hidden sm:inline">Glossary</span>
          </button>
        </div>
      </div>
    </header>
  );
};
