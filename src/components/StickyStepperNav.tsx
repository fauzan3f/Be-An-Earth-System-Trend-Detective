import React, { useEffect, useState } from "react";
import { HelpCircle, Upload, Radio } from "lucide-react";

interface StepperStep {
  id: string;
  number: number;
  label: string;
  shortLabel: string;
}

const STEPS: StepperStep[] = [
  { id: "welcome", number: 1, label: "Welcome", shortLabel: "1. Welcome" },
  { id: "study-overview", number: 2, label: "Study Area & Map", shortLabel: "2. Map & Scope" },
  { id: "no2-explorer", number: 3, label: "NO2 Explorer", shortLabel: "3. NO2" },
  { id: "aod-explorer", number: 4, label: "AOD Explorer", shortLabel: "4. AOD" },
  { id: "trend-comparison", number: 5, label: "Comparison", shortLabel: "5. Compare" },
  { id: "interpretation", number: 6, label: "Interpretation", shortLabel: "6. Insights" },
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
      const scrollPosition = window.scrollY + 180;
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
      aria-label="Official NASA Earthdata Navigation"
      className="sticky top-0 z-50 bg-[#000000] text-white border-b border-[rgba(255,255,255,0.12)] shadow-xl select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Official NASA / Earthdata Brand */}
          <a
            href="#welcome"
            onClick={(e) => scrollToSection(e, "welcome")}
            className="flex items-center gap-2.5 shrink-0 group py-1"
            title="NASA Earthdata : Earth System Trend Detective"
          >
            {/* NASA Meatball Insignia Badge */}
            <div className="w-8 h-8 rounded-full bg-[#15418C] flex items-center justify-center font-bold text-[11px] tracking-tighter text-white border border-[#E4002B] shadow-sm">
              <span className="text-[#FFFFFF]">NASA</span>
            </div>

            <div className="flex items-baseline gap-1.5 text-xs sm:text-sm">
              <span className="font-light tracking-wide text-white">EARTH</span>
              <span className="font-black tracking-wider text-white">DATA</span>
              <span className="text-[#58585B] hidden sm:inline">|</span>
              <span className="text-[#A1A1AA] font-medium hidden sm:inline text-xs">
                Trend Detective
              </span>
            </div>
          </a>

          {/* Stepper Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {STEPS.map((step) => {
              const isActive = activeStepId === step.id;
              return (
                <a
                  key={step.id}
                  href={`#${step.id}`}
                  onClick={(e) => scrollToSection(e, step.id)}
                  aria-current={isActive ? "step" : undefined}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? "text-white border-[#E4002B] bg-[#12151B]"
                      : "text-[#A1A1AA] hover:text-white border-transparent hover:bg-[#12151B]/50"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-mono ${
                      isActive
                        ? "bg-[#E4002B] text-white"
                        : "bg-[#27272A] text-[#A1A1AA]"
                    }`}
                  >
                    {step.number}
                  </span>
                  <span className="hidden md:inline">{step.label}</span>
                  <span className="inline md:hidden">{step.shortLabel}</span>
                </a>
              );
            })}
          </div>

          {/* Right Action Badges */}
          <div className="flex items-center gap-2 shrink-0">
            {/* NASA+ Style Live Data Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-mono font-bold tracking-wider uppercase border border-[#E4002B] text-white bg-[#E4002B]/10">
              <Radio className="w-3 h-3 text-[#E4002B] animate-pulse" aria-hidden="true" />
              <span>LIVE DATA</span>
            </div>

            {/* Ingestion & Glossary Buttons */}
            <button
              type="button"
              onClick={onOpenUpload}
              className="px-2.5 py-1 rounded-sm text-xs font-medium bg-[#12151B] hover:bg-[#27272A] text-white border border-[rgba(255,255,255,0.15)] transition-colors flex items-center gap-1.5"
              title="Load custom Role 1 CSV or JSON data"
              aria-label="Load Role 1 Data"
            >
              <Upload className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              <span className="hidden sm:inline">Data</span>
            </button>

            <button
              type="button"
              onClick={onOpenGlossary}
              className="px-2.5 py-1 rounded-sm text-xs font-medium bg-[#12151B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white border border-[rgba(255,255,255,0.15)] transition-colors flex items-center gap-1.5"
              title="Open Scientific Definitions"
              aria-label="Open Scientific Glossary"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#A1A1AA]" aria-hidden="true" />
              <span className="hidden sm:inline">Glossary</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
