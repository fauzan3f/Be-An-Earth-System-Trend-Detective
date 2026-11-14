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
      "Nitrogen dioxide is a reactive trace gas emitted primarily during high-temperature combustion of fossil fuels (vehicles, thermal power generators, industrial machinery) and biomass burning (forest and peatland fires). Satellite instruments like NASA Aura/OMI detect the total number of NO2 molecules in a vertical column of air extending from the Earth's surface to the tropopause.",
    practicalExample:
      "Analogy: Imagine looking straight down from orbit through a cylinder of air 1 cm² wide. The sensor tallies every NO2 molecule inside that cylinder. Clean tropical rainforests typically register 1.0 to 1.5 × 10¹⁵ molecules/cm², whereas industrial zones exceed 10.0 × 10¹⁵.",
  },
  AOD: {
    title: "AOD (Aerosol Optical Depth)",
    subtitle: "Atmospheric Particulate Attenuation (550 nm)",
    definition:
      "AOD is a dimensionless measure of how much airborne particles (smoke, dust, haze, and sea spray) prevent light from traveling through the atmosphere. An AOD of 0.0 corresponds to a completely clear, crystal sky. An AOD of 1.0 or higher indicates thick haze or severe wildfire smoke where the sun is obscured.",
    practicalExample:
      "Analogy: Think of sunglasses for the atmosphere. In Borneo, during wet months, AOD hovers around 0.2. During intense El Niño peat fire seasons (such as September 2015), smoke columns shoot AOD above 1.5, drastically reducing surface visibility.",
  },
  SenSlope: {
    title: "Sen's Slope Estimator",
    subtitle: "Robust Non-Parametric Median Slope",
    definition:
      "Sen's slope is a statistical method used in environmental science to determine the true annual rate of change in a time series. Unlike traditional linear regression (least squares), which gets skewed by extreme events like fire flare-ups or missing monsoon months, Sen's slope computes the slope between all possible pairs of data points and takes their median.",
    practicalExample:
      "Analogy: If 10 people measure the growth of a tree and 2 make huge errors due to foggy weather, standard averages get ruined. Taking the median of every pair's estimate filters out the bad measurements cleanly.",
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-[#E0E0E0] rounded-sm shadow-2xl p-6 text-[#1B1B1B] space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#1967D2]" aria-hidden="true" />
            <h2 id="glossary-modal-title" className="text-base font-bold text-[#1B1B1B]">
              NASA Earthdata Scientific Glossary &amp; Concept Explainer
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-1 text-[#58585B] hover:text-[#1B1B1B] rounded hover:bg-[#F0F0F0] focus:outline-none focus:ring-2 focus:ring-[#1967D2]"
            aria-label="Close glossary modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content list */}
        <div className="space-y-6 divide-y divide-[#E0E0E0]">
          {entriesToDisplay.map((termKey) => {
            const item = GLOSSARY_ENTRIES[termKey];
            if (!item) return null;
            return (
              <div key={termKey} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-bold text-[#1B1B1B]">{item.title}</h3>
                  <span className="text-xs font-mono text-[#58585B]">({item.subtitle})</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-[#1B1B1B]">{item.definition}</p>
                <div className="p-3 rounded-sm bg-[#F6F6F6] border border-[#E5E7EB] text-xs text-[#1B1B1B] leading-relaxed">
                  <strong className="text-[#1B1B1B] font-semibold">Scientific Guide: </strong>
                  {item.practicalExample}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#E0E0E0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#1B1B1B] hover:bg-[#000000] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B1B1B]"
          >
            Close Explainer
          </button>
        </div>
      </div>
    </div>
  );
};
