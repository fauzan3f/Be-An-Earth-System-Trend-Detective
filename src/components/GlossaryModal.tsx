import React, { useEffect, useRef } from "react";
import { X, BookOpen } from "lucide-react";

export type GlossaryTerm = "NO2" | "AOD" | "SenSlope" | "pValue" | "All";

interface GlossaryModalProps {
  isOpen: boolean;
  activeTerm: GlossaryTerm;
  onClose: () => void;
}

const GLOSSARY_ENTRIES: Record<
  "NO2" | "AOD" | "SenSlope" | "pValue",
  { title: string; subtitle: string; definition: string; practicalExample: string }
> = {
  NO2: {
    title: "NO2 (Nitrogen Dioxide)",
    subtitle: "Tropospheric Column Density",
    definition:
      "Nitrogen dioxide is a reactive gas emitted primarily during high-temperature combustion of fossil fuels (vehicles, thermal power generators, industrial machinery) and biomass burning (forest and peatland fires). Satellite instruments like NASA Aura/OMI detect the total number of NO2 molecules in a vertical column of air extending from the Earth's surface to the tropopause.",
    practicalExample:
      "Student analogy: Imagine looking straight down from orbit through a cylinder of air 1 cm² wide. The sensor tallies every NO2 molecule inside that cylinder. Clean tropical rainforests typically register 1.0 to 1.5 × 10¹⁵ molecules/cm², whereas industrial zones exceed 10.0 × 10¹⁵.",
  },
  AOD: {
    title: "AOD (Aerosol Optical Depth)",
    subtitle: "Atmospheric Particulate Attenuation (550 nm)",
    definition:
      "AOD is a dimensionless measure of how much airborne particles (smoke, dust, haze, and sea spray) prevent light from traveling through the atmosphere. An AOD of 0.0 corresponds to a completely clear, crystal sky. An AOD of 1.0 or higher indicates thick haze or severe wildfire smoke where the sun is obscured.",
    practicalExample:
      "Student analogy: Think of sunglasses for the atmosphere. In Borneo, during wet months, AOD hovers around 0.2. During intense El Niño peat fire seasons (such as September 2015), smoke columns shoot AOD above 1.5, drastically reducing surface visibility.",
  },
  SenSlope: {
    title: "Sen's Slope Estimator",
    subtitle: "Robust Non-Parametric Median Slope",
    definition:
      "Sen's slope is a statistical method used in environmental science to determine the true annual rate of change in a time series. Unlike traditional linear regression (least squares), which gets skewed by extreme events like fire flare-ups or missing monsoon months, Sen's slope computes the slope between all possible pairs of data points and takes their median.",
    practicalExample:
      "Student analogy: If 10 people measure the growth of a tree and 2 make huge errors due to foggy weather, standard averages get ruined. Taking the median of every pair's estimate filters out the bad measurements cleanly.",
  },
  pValue: {
    title: "p-value (Statistical Significance)",
    subtitle: "Probability of Observing Trend by Random Chance",
    definition:
      "The p-value measures whether an observed upward or downward slope is a real persistent geophysical shift or merely a coincidence caused by random weather swings. In Earth science, a threshold of p < 0.05 is standard: it means there is less than a 5% chance that random variation produced this pattern.",
    practicalExample:
      "Rule of thumb: If p < 0.05, scientists consider the trend statistically significant (reliable evidence of an actual multi-year increase or decrease). If p >= 0.05, the data is inconclusive.",
  },
};

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  activeTerm,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key (R-32)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap / auto focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const entriesToDisplay =
    activeTerm === "All"
      ? (["NO2", "AOD", "SenSlope", "pValue"] as const)
      : ([activeTerm] as const);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-space-900 border border-slate-700 rounded-xl shadow-2xl p-6 text-slate-100 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-sky-400" aria-hidden="true" />
            <h2 id="glossary-modal-title" className="text-lg font-semibold text-slate-100">
              Scientific Glossary &amp; Concept Explainer
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Close glossary modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content list */}
        <div className="space-y-6 divide-y divide-slate-800">
          {entriesToDisplay.map((termKey) => {
            const item = GLOSSARY_ENTRIES[termKey];
            if (!item) return null;
            return (
              <div key={termKey} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-bold text-sky-300">{item.title}</h3>
                  <span className="text-xs font-mono text-slate-400">({item.subtitle})</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{item.definition}</p>
                <div className="p-3 rounded-lg bg-space-850 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                  <strong className="text-amber-300">Student Guide: </strong>
                  {item.practicalExample}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            Close Explainer
          </button>
        </div>
      </div>
    </div>
  );
};
