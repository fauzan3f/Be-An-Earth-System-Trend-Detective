import { useState, useMemo, useEffect } from "react";
import { StickyStepperNav } from "./components/StickyStepperNav";
import { WelcomeSection } from "./components/sections/WelcomeSection";
import { StudyOverviewSection } from "./components/sections/StudyOverviewSection";
import { No2ExplorerSection } from "./components/sections/No2ExplorerSection";
import { AodExplorerSection } from "./components/sections/AodExplorerSection";
import { TrendComparisonSectionRefactored } from "./components/sections/TrendComparisonSectionRefactored";
import { InterpretationSection } from "./components/sections/InterpretationSection";
import { GlossaryModal, type GlossaryTerm } from "./components/GlossaryModal";
import { UploadModal } from "./components/UploadModal";
import {
  loadDefaultDatasets,
  exportToCsv,
  DEFAULT_AOD_DATASET,
} from "./services/dataLoader";
import type { DatasetPayload, MonthlyDataPoint, DailyDataPoint } from "./types";
import { calculateDynamicTrend } from "./utils/statistics";

export function App() {
  // Datasets loaded into state
  const [no2Dataset, setNo2Dataset] = useState<DatasetPayload | null>(null);
  const [aodDataset, setAodDataset] = useState<DatasetPayload>(DEFAULT_AOD_DATASET);
  const [isCustomLoaded, setIsCustomLoaded] = useState<boolean>(false);
  const [excludePartialMonths, setExcludePartialMonths] = useState<boolean>(true);
  const [no2ViewMode, setNo2ViewMode] = useState<"monthly" | "daily">("monthly");
  const [, setIsLoading] = useState<boolean>(true);

  // Default analysis period: 2010 to 2025
  const [startYear, setStartYear] = useState<number>(2010);
  const [endYear, setEndYear] = useState<number>(2025);
  const [activeMapMonthIndex, setActiveMapMonthIndex] = useState<number>(0);

  // Load real cleaned NASA Giovanni datasets on mount and when filter changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    loadDefaultDatasets(excludePartialMonths)
      .then((data) => {
        if (isMounted) {
          setNo2Dataset(data.no2);
          if (!isCustomLoaded) {
            setAodDataset(data.aod);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error loading datasets:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [excludePartialMonths, isCustomLoaded]);

  // Derive available years from active datasets (2010 to 2026)
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    if (no2Dataset) {
      no2Dataset.series.forEach((dp) => {
        const yr = parseInt(dp.date.slice(0, 4), 10);
        if (!isNaN(yr)) yearsSet.add(yr);
      });
    }
    aodDataset.series.forEach((dp) => {
      const yr = parseInt(dp.date.slice(0, 4), 10);
      if (!isNaN(yr)) yearsSet.add(yr);
    });
    const sorted = Array.from(yearsSet).sort((a, b) => a - b);
    return sorted.length > 0 ? sorted : [2010, 2025, 2026];
  }, [no2Dataset, aodDataset]);

  // Modal states
  const [glossaryTerm, setGlossaryTerm] = useState<GlossaryTerm>("All");
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Slice NO2 monthly series according to active year range
  const filteredNo2MonthlySeries: MonthlyDataPoint[] = useMemo(() => {
    if (!no2Dataset) return [];
    const startPrefix = `${startYear}-01`;
    const endPrefix = `${endYear}-12`;
    return no2Dataset.series.filter(
      (dp) => dp.date >= startPrefix && dp.date <= endPrefix
    );
  }, [no2Dataset, startYear, endYear]);

  // Slice NO2 daily series according to active year range
  const filteredNo2DailySeries: DailyDataPoint[] = useMemo(() => {
    if (!no2Dataset || !no2Dataset.dailySeries) return [];
    const startPrefix = `${startYear}-01-01`;
    const endPrefix = `${endYear}-12-31`;
    return no2Dataset.dailySeries.filter(
      (dp) => dp.date >= startPrefix && dp.date <= endPrefix
    );
  }, [no2Dataset, startYear, endYear]);

  // Slice AOD series according to active year range
  const filteredAodSeries: MonthlyDataPoint[] = useMemo(() => {
    const startPrefix = `${startYear}-01`;
    const endPrefix = `${endYear}-12`;
    return aodDataset.series.filter(
      (dp) => dp.date >= startPrefix && dp.date <= endPrefix
    );
  }, [aodDataset, startYear, endYear]);

  const periodLabel = `${startYear}-${endYear}`;

  // Dynamically recalculate NO2 statistics and trendline on the active monthly slice
  const { recalculated: no2Metadata, trendlinePoints: no2Trendline } =
    useMemo(() => {
      if (!no2Dataset) {
        return {
          recalculated: {
            variable: "NO2",
            region: "West Kalimantan",
            period: periodLabel,
            unit: "molecules/cm²",
            trend_direction: "no trend" as const,
            slope_per_year: 0,
            p_value: 1,
            confidence_interval: [0, 0] as [number, number],
            method: "Seasonal Mann-Kendall + Sen's slope",
            valid_months: 0,
            missing_months: 0,
          },
          trendlinePoints: [],
        };
      }
      return calculateDynamicTrend(
        filteredNo2MonthlySeries,
        no2Dataset.metadata,
        periodLabel
      );
    }, [filteredNo2MonthlySeries, no2Dataset, periodLabel]);

  // Dynamically recalculate AOD statistics and trendline on active slice
  const { recalculated: aodMetadata, trendlinePoints: aodTrendline } =
    useMemo(() => {
      return calculateDynamicTrend(
        filteredAodSeries,
        aodDataset.metadata,
        periodLabel
      );
    }, [filteredAodSeries, aodDataset.metadata, periodLabel]);

  // Scroll to section helper
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handlers
  const handleOpenGlossary = (term: GlossaryTerm = "All") => {
    setGlossaryTerm(term);
    setIsGlossaryOpen(true);
  };

  const handleDownloadCsv = (variable: "NO2" | "AOD") => {
    if (variable === "NO2") {
      const dataToExport =
        no2ViewMode === "daily" && filteredNo2DailySeries.length > 0
          ? filteredNo2DailySeries
          : filteredNo2MonthlySeries;
      const csvContent = exportToCsv(
        dataToExport,
        no2ViewMode === "daily" ? "no2_daily" : "no2_mean"
      );
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `no2_${no2ViewMode}_west_kalimantan_${startYear}_${endYear}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const csvContent = exportToCsv(filteredAodSeries, "aod");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `aod_monthly_west_kalimantan_${startYear}_${endYear}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleApplyCustomDataset = (
    variable: "NO2" | "AOD",
    dataset: DatasetPayload
  ) => {
    if (variable === "NO2") {
      setNo2Dataset(dataset);
    } else {
      setAodDataset(dataset);
    }
    setIsCustomLoaded(true);
  };

  const handleResetDefaults = () => {
    setIsLoading(true);
    setExcludePartialMonths(true);
    setNo2ViewMode("monthly");
    setStartYear(2010);
    setEndYear(2025);
    setIsCustomLoaded(false);

    loadDefaultDatasets(true).then((data) => {
      setNo2Dataset(data.no2);
      setAodDataset(data.aod);
      setIsLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#1B1B1B] flex flex-col justify-between font-body antialiased selection:bg-[#1967D2]/20 selection:text-[#1967D2]">
      {/* Official Pure Black Sticky Top Stepper Navigation */}
      <StickyStepperNav
        onOpenGlossary={() => handleOpenGlossary("All")}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <main className="flex-1">
        {/* Section 1: Official NASA Dark Hero + Telemetry Strip */}
        <WelcomeSection onStartExploring={() => scrollTo("study-overview")} />

        {/* Transition to Clean High-Contrast Light Editorial Canvas (#F6F6F6 and #FFFFFF) */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section 2: Study Overview - Explore Settings */}
          <StudyOverviewSection
            startYear={startYear}
            endYear={endYear}
            availableYears={availableYears}
            onStartYearChange={setStartYear}
            onEndYearChange={setEndYear}
            onResetDefaults={handleResetDefaults}
            isCustomLoaded={isCustomLoaded}
            excludePartialMonths={excludePartialMonths}
            onToggleExcludePartialMonths={setExcludePartialMonths}
            dailyCoverage={no2Dataset?.dailyCoverage}
            no2Series={no2Dataset?.series || []}
            activeMapMonthIndex={activeMapMonthIndex}
            onSelectMapMonthIndex={setActiveMapMonthIndex}
            onNextStep={() => scrollTo("no2-explorer")}
          />

          {/* Section 3: NO2 Explorer - Nitrogen Dioxide */}
          <No2ExplorerSection
            metadata={no2Metadata}
            filteredMonthlySeries={filteredNo2MonthlySeries}
            filteredDailySeries={filteredNo2DailySeries}
            trendlinePoints={no2Trendline}
            dailyCoverage={no2Dataset?.dailyCoverage}
            sensitivityAnalysis={no2Dataset?.sensitivityAnalysis}
            coverageValidation={no2Dataset?.coverageValidation}
            viewMode={no2ViewMode}
            onViewModeChange={setNo2ViewMode}
            onOpenGlossaryTooltip={handleOpenGlossary}
            activeMapMonthIndex={activeMapMonthIndex}
            onSelectMapMonthIndex={setActiveMapMonthIndex}
            onNextStep={() => scrollTo("aod-explorer")}
          />

          {/* Section 4: AOD Explorer - Aerosol Optical Depth */}
          <AodExplorerSection
            metadata={aodMetadata}
            filteredMonthlySeries={filteredAodSeries}
            trendlinePoints={aodTrendline}
            onOpenGlossaryTooltip={handleOpenGlossary}
            onNextStep={() => scrollTo("trend-comparison")}
          />

          {/* Section 5: Compare the Trends - Discover Patterns */}
          <TrendComparisonSectionRefactored
            no2Metadata={no2Metadata}
            aodMetadata={aodMetadata}
            periodLabel={periodLabel}
            onNextStep={() => scrollTo("interpretation")}
          />

          {/* Section 6: Read the Interpretation - Understand the Results */}
          <InterpretationSection
            no2Metadata={no2Metadata}
            aodMetadata={aodMetadata}
            periodLabel={periodLabel}
            onDownloadCsv={handleDownloadCsv}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenGlossary={handleOpenGlossary}
          />
        </div>
      </main>

      {/* Official NASA Earthdata Dark Navy / Black Footer */}
      <footer className="bg-[#000000] text-white border-t border-[#222222] pt-12 pb-14 mt-16 font-body">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-[#222222] pb-8">
            {/* NASA Emblem Column */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#15418C] flex items-center justify-center font-bold text-xs tracking-tighter text-white border border-[#E4002B]">
                  <span>NASA</span>
                </div>
                <div>
                  <div className="font-bold text-sm tracking-wide text-white uppercase font-display">
                    National Aeronautics and Space Administration
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    Earth Science Data and Information System (ESDIS) Project
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 max-w-md leading-relaxed">
                Earth System Trend Detective is an open-access scientific interface developed for the
                2026 NASA Space Apps Challenge, evaluating multi-decadal satellite trends in tropospheric NO2 and AOD over West Kalimantan.
              </p>
            </div>

            {/* Scientific Sources */}
            <div className="space-y-2 text-xs">
              <div className="font-mono font-bold uppercase tracking-wider text-gray-300">
                DATA SOURCES &amp; SENSORS
              </div>
              <ul className="space-y-1.5 text-gray-400 font-mono">
                <li>NASA Aura / OMI (OMNO2d v004)</li>
                <li>NASA Terra &amp; Aqua / MODIS (MYD08_M3)</li>
                <li>NASA GES DISC Giovanni Portal</li>
                <li>World Meteorological Org. (WMO)</li>
              </ul>
            </div>

            {/* Official Disclaimers */}
            <div className="space-y-2 text-xs">
              <div className="font-mono font-bold uppercase tracking-wider text-gray-300">
                GOVERNMENT &amp; COMPLIANCE
              </div>
              <ul className="space-y-1.5 text-gray-400">
                <li>
                  <a
                    href="https://www.nasa.gov/privacy/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-white transition-colors"
                  >
                    NASA Web Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.nasa.gov/foia/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-white transition-colors"
                  >
                    Freedom of Information Act (FOIA)
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.nasa.gov/general/no-fear-act-notice/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-white transition-colors"
                  >
                    No FEAR Act Notice
                  </a>
                </li>
                <li>
                  <a
                    href="https://giovanni.gsfc.nasa.gov/giovanni/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-white transition-colors text-[#1967D2]"
                  >
                    NASA Giovanni System
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-mono">
            <span>NASA Official: ESDIS Project · Earth Science Division</span>
            <span>West Kalimantan Multi-Decadal Atmospheric Assessment (2010-2025)</span>
          </div>
        </div>
      </footer>

      {/* Tooltips & Scientific Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        activeTerm={glossaryTerm}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Load Role 1 CSV/JSON Data Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onApplyDataset={handleApplyCustomDataset}
      />
    </div>
  );
}

export default App;
