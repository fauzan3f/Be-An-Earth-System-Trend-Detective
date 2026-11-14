import React, { useEffect, useState } from "react";
import { Globe, HelpCircle, Upload, ChevronRight } from "lucide-react";

interface StepperStep {
  id: string;
  number: number;
  label: string;
  shortLabel: string;
}

const STEPS: StepperStep[] = [
  { id: "welcome", number: 1, label: "Welcome", shortLabel: "1. Welcome" },
  { id: "study-overview", number: 2, label: "Study Overview", shortLabel: "2. Overview" },
  { id: "no2-explorer", number: 3, label: "NO2 Explorer", shortLabel: "3. NO2" },
  { id: "aod-explorer", number: 4, label: "AOD Explorer", shortLabel: "4. AOD" },
  { id: "trend-comparison", number: 5, label: "Trend Comparison", shortLabel: "5. Compare" },
  { id: "interpretation", number: 6, label: "Insights & Interpretation", shortLabel: "6. Insights" },
];

interface StickyStepperNavProps {
  onOpenGlossary: () => void;
  onOpenUpload: () => void;
}

export const StickyStepperNav: React.FC<StickyStepperNavProps> = ({
  onOpenGlossary,
  onOpenUpload,
}) => {
  const [activeStepId, setActiveStepId] = useState<string>("welcome");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = STEPS.length - 1; i >= 0; i--) {
        const step = STEPS[i];
        const el = document.getElementById(step.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveStepId(step.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveStepId(id);
    }
  };

  return (
    <nav
      aria-label="Guided Journey Navigation"
      className="sticky top-0 z-40 bg-space-950/95 backdrop-blur-md border-b border-slate-800 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Brand Mark */}
          <a
            href="#welcome"
            onClick={(e) => scrollToSection(e, "welcome")}
            className="flex items-center gap-2 group shrink-0 py-1"
            title="Return to Welcome Hero"
          >
            <span className="p-1.5 rounded-lg bg-sky-950/80 border border-sky-800 text-sky-400 group-hover:border-sky-500 transition-colors">
              <Globe className="w-4 h-4" aria-hidden="true" />
            </span>
            <span className="hidden xl:inline text-xs font-bold uppercase tracking-wider text-slate-200">
              Earth System Trend Detective
            </span>
          </a>

          {/* Stepper Tabs */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
            {STEPS.map((step, idx) => {
              const isActive = activeStepId === step.id;
              return (
                <React.Fragment key={step.id}>
                  <a
                    href={`#${step.id}`}
                    onClick={(e) => scrollToSection(e, step.id)}
                    aria-current={isActive ? "step" : undefined}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-sky-900/70 text-sky-200 border border-sky-600/80 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-space-850 border border-transparent"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-sky-400 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {step.number}
                    </span>
                    <span className="hidden md:inline">{step.label}</span>
                    <span className="inline md:hidden">{step.shortLabel}</span>
                  </a>
                  {idx < STEPS.length - 1 && (
                    <ChevronRight
                      className="w-3 h-3 text-slate-600 shrink-0 hidden lg:inline"
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onOpenUpload}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium bg-space-850 hover:bg-slate-800 border border-slate-700 text-sky-300 hover:text-sky-200 transition-colors flex items-center gap-1.5"
              title="Load custom Role 1 CSV or JSON data"
              aria-label="Load Role 1 Data"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Data</span>
            </button>

            <button
              type="button"
              onClick={onOpenGlossary}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium bg-space-850 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-sky-300 transition-colors flex items-center gap-1.5"
              title="Open Scientific Definitions"
              aria-label="Open Scientific Glossary"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              <span className="hidden sm:inline">Glossary</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
