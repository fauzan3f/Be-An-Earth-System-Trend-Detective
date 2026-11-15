import React, { useState, useMemo } from "react";
import {
  Grid,
  ShieldCheck,
  Flame,
  MapPin,
  Table as TableIcon,
  Download,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  Search,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { SpatialAnalysisPackageData } from "../../types";
import { formatScientificValue } from "../../utils/formatters";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SpatialAnalysisInsightsProps {
  spatialPackage: SpatialAnalysisPackageData;
  onJumpToMap?: () => void;
}

export const SpatialAnalysisInsights: React.FC<SpatialAnalysisInsightsProps> = ({
  spatialPackage,
  onJumpToMap,
}) => {
  const [coverageFilter, setCoverageFilter] = useState<"all" | "high">("high");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(20);

  const {
    findings,
    gridSummaries,
    monthlySummaries,
    highReliabilityCount,
    highReliabilityPct,
  } = spatialPackage;

  // Helper to trigger file download
  const handleDownloadFile = (path: string, filename: string) => {
    const link = document.createElement("a");
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to determine if a grid cell falls in the candidate elevated NO2 cluster
  const isCandidateClusterGrid = (lat: number, lon: number): boolean => {
    return lat >= 0.375 && lat <= 0.625 && lon >= 110.125 && lon <= 110.625;
  };

  // Filtered and searched grid rows
  const filteredGridRows = useMemo(() => {
    let list = gridSummaries;

    if (coverageFilter === "high") {
      list = list.filter((r) => r.coverage_pct >= 80);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.lat.toString().includes(q) ||
          r.lon.toString().includes(q) ||
          (isCandidateClusterGrid(r.lat, r.lon) && "cluster".includes(q))
      );
    }

    return list;
  }, [gridSummaries, coverageFilter, searchQuery]);

  // Chart data for monthly spatial variability (193 months)
  const chartData = useMemo(() => {
    const labels = monthlySummaries.map((m) => m.date);
    // Strict null handling: null values remain null so Chart.js breaks the line without plotting 0
    const meanValues = monthlySummaries.map((m) => m.weighted_mean_no2);
    const validGridCounts = monthlySummaries.map((m) => m.valid_grids);

    return {
      labels,
      datasets: [
        {
          label: "Provincial Weighted Mean NO2 (molecules/cm²)",
          data: meanValues,
          borderColor: "#15418C",
          backgroundColor: "rgba(21, 65, 140, 0.08)",
          borderWidth: 2,
          pointRadius: 1.5,
          pointHoverRadius: 4,
          pointBackgroundColor: "#15418C",
          pointBorderColor: "#FFFFFF",
          pointBorderWidth: 1,
          tension: 0.1,
          spanGaps: false,
          yAxisID: "y",
          fill: false,
        },
        {
          label: "Active Valid Grids (out of 246)",
          data: validGridCounts,
          borderColor: "rgba(100, 116, 139, 0.5)",
          backgroundColor: "rgba(100, 116, 139, 0.08)",
          borderWidth: 1.5,
          borderDash: [3, 3],
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0.1,
          yAxisID: "y1",
          fill: true,
        },
      ],
    };
  }, [monthlySummaries]);

  const chartOptions: ChartOptions<"line"> = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          align: "end",
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            font: {
              family: "Inter, sans-serif",
              size: 11,
            },
            color: "#1B1B1B",
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          titleFont: {
            family: "JetBrains Mono, monospace",
            size: 11,
          },
          bodyFont: {
            family: "Inter, sans-serif",
            size: 11,
          },
          padding: 10,
          callbacks: {
            label: (ctx) => {
              if (ctx.datasetIndex === 0) {
                const val = ctx.raw as number | null;
                if (val === null || val === undefined) {
                  return "NO2 Mean: Data Unavailable (Boundary Month)";
                }
                return `NO2 Mean: ${formatScientificValue(val, 2)} molecules/cm²`;
              }
              const gridCount = ctx.raw as number;
              const pct = ((gridCount / 246) * 100).toFixed(1);
              return `Valid Grids: ${gridCount} / 246 (${pct}% coverage)`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(0, 0, 0, 0.04)",
          },
          ticks: {
            font: {
              family: "JetBrains Mono, monospace",
              size: 10,
            },
            color: "#6B7280",
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 14,
          },
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "Mean NO2 (molecules/cm²)",
            font: {
              family: "Inter, sans-serif",
              size: 10,
              weight: "bold",
            },
            color: "#15418C",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            font: {
              family: "JetBrains Mono, monospace",
              size: 10,
            },
            color: "#15418C",
            callback: (val) => formatScientificValue(Number(val), 1),
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          min: 0,
          max: 260,
          title: {
            display: true,
            text: "Valid Grids (out of 246)",
            font: {
              family: "Inter, sans-serif",
              size: 10,
              weight: "bold",
            },
            color: "#475569",
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            font: {
              family: "JetBrains Mono, monospace",
              size: 10,
            },
            color: "#475569",
            stepSize: 50,
          },
        },
      },
    };
  }, []);

  return (
    <div className="space-y-8 pt-6 border-t border-[#E5E7EB]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase bg-[#1B1B1B] text-white rounded-xs">
              SPATIAL VALIDATION
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase bg-[#F4F4F5] text-[#58585B] border border-[#E4E4E7] rounded-xs">
              0.25° RESOLUTION
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase bg-[#F4F4F5] text-[#58585B] border border-[#E4E4E7] rounded-xs">
              246 GRID CELLS
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-[#1B1B1B] tracking-tight">
            Spatial Analysis &amp; Candidate Hotspot Insights
          </h3>
          <p className="text-xs sm:text-sm text-[#58585B]">
            Long-term 0.25° spatial grid validation, temporal reliability benchmarking, and candidate elevated NO2 cluster identification (193 months: 2010-10 to 2026-10).
          </p>
        </div>

        {onJumpToMap && (
          <button
            type="button"
            onClick={onJumpToMap}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-semibold bg-[#15418C] hover:bg-[#10326F] text-white shadow-sm transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Inspect on NO2 Map</span>
          </button>
        )}
      </div>

      {/* Mandatory Scientific Exploratory Screening Disclaimer */}
      <div className="p-4 bg-[#FFFBEB] border-l-4 border-[#F59E0B] rounded-xs text-xs sm:text-sm text-[#78350F] space-y-1.5 shadow-xs">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[#92400E]">
          <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" aria-hidden="true" />
          <span>Exploratory Spatial Analysis &amp; Hotspot Screening Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          Identified high-NO2 grid clusters (0.375°N to 0.625°N, 110.125°E to 110.625°E) represent relative satellite tropospheric vertical column density anomalies (NASA OMI OMNO2d v004, molecules/cm²) and are NOT an official pollution classification or regulatory ground-level air quality index (AQI/ISPU). Spatial validation is exploratory and accounts for variable tropical cloud screening.
        </p>
      </div>

      {/* Spatial Validation & Coverage KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Analyzed Grids */}
        <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#58585B]">
              TOTAL PROVINCIAL GRIDS
            </span>
            <span className="p-1.5 rounded-xs bg-[#F4F4F5] text-[#1B1B1B]">
              <Grid className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-display font-extrabold text-[#1B1B1B] tracking-tight">
              {findings.grid_count}
            </div>
            <div className="text-xs text-[#58585B] font-medium">
              0.25° grid cells intersecting West Kalimantan province
            </div>
          </div>

          <div className="pt-2 border-t border-[#F0F0F0] text-[11px] text-[#58585B] space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Provincial Area:</span>
              <span className="font-bold text-[#1B1B1B]">147,307 km²</span>
            </div>
            <div className="flex justify-between">
              <span>Total Months:</span>
              <span className="font-bold text-[#1B1B1B]">{findings.months} months</span>
            </div>
          </div>
        </div>

        {/* Card 2: High-Reliability Grids (>= 80% Coverage) */}
        <div className="p-5 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#58585B]">
              HIGH-RELIABILITY GRIDS
            </span>
            <span className="p-1.5 rounded-xs bg-[#ECFDF5] text-[#059669]">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-[#1B1B1B] tracking-tight">
                {highReliabilityCount}
              </span>
              <span className="text-sm font-bold text-[#58585B]">
                / {findings.grid_count}
              </span>
              <span className="ml-auto px-2 py-0.5 rounded-xs text-xs font-mono font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                {highReliabilityPct.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-[#58585B] font-medium">
              Grids meeting the ≥ 80% temporal observation threshold
            </div>
          </div>

          <div className="pt-2 border-t border-[#F0F0F0] text-[11px] text-[#58585B] space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Benchmark Threshold:</span>
              <span className="font-bold text-[#1B1B1B]">≥ 154 / 192 valid months</span>
            </div>
            <div className="flex justify-between">
              <span>Reduced-Coverage Grids:</span>
              <span className="font-bold text-[#D97706]">36 grids (&lt; 80%)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Candidate Elevated NO2 Cluster */}
        <div className="p-5 rounded-sm bg-white border-2 border-[#15418C]/20 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#15418C]">
              CANDIDATE ELEVATED CLUSTER
            </span>
            <span className="p-1.5 rounded-xs bg-[#EFF6FF] text-[#15418C]">
              <Flame className="w-4 h-4 text-[#E4002B]" aria-hidden="true" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-base font-bold font-mono text-[#1B1B1B]">
              0.375°N – 0.625°N, 110.125°E – 110.625°E
            </div>
            <div className="text-xs text-[#58585B]">
              Primary high-density grid cluster with persistent 84.4% to 93.2% observation coverage
            </div>
          </div>

          <div className="pt-2 border-t border-[#F0F0F0] flex items-center justify-between">
            <div className="text-[11px] font-mono text-[#1B1B1B]">
              Mean: <strong className="text-[#15418C]">1.18 – 1.26 × 10¹⁵</strong>
            </div>
            {onJumpToMap && (
              <button
                type="button"
                onClick={onJumpToMap}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15418C] hover:underline"
              >
                <span>Locate on Map</span>
                <MapPin className="w-3 h-3" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Spatial Variability Chart */}
      <div className="p-5 sm:p-6 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0F0] pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#15418C]" aria-hidden="true" />
              <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-[#1B1B1B]">
                Monthly Spatial Variability &amp; Coverage Dynamics (2010–2026)
              </h4>
            </div>
            <p className="text-xs text-[#58585B]">
              Provincial area-weighted mean NO2 vs. active valid grid count across 193 months
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#58585B]">
            <span className="inline-block w-3 h-3 bg-[#15418C] rounded-xs" />
            <span>Mean NO2</span>
            <span className="inline-block w-3 h-0.5 border-t border-dashed border-[#64748B] ml-2" />
            <span>Valid Grids</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="pt-2 border-t border-[#F0F0F0] text-xs text-[#58585B] leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>
            <strong>Observational Note:</strong> Severe drops in valid grid counts (e.g., September-October 2026 with 6-9 grids, ~2.0% area) reflect tropical cloud obscuration, while dry season peaks (August 2012, September 2015, August 2026) illustrate episodic column surges.
          </span>
          <button
            type="button"
            onClick={() =>
              handleDownloadFile(
                "/data/spatial_analysis/no2_spatial_monthly_summary.csv",
                "no2_spatial_monthly_summary.csv"
              )
            }
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] border border-[#D1D5DB] text-[#1B1B1B] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
            <span>Monthly CSV</span>
          </button>
        </div>
      </div>

      {/* Candidate Hotspot & Per-Grid Summary Table */}
      <div className="p-5 sm:p-6 rounded-sm bg-white border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0F0F0] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-[#1B1B1B]" aria-hidden="true" />
              <h4 className="text-sm font-bold font-mono uppercase tracking-wider text-[#1B1B1B]">
                Per-Grid Spatial Summary &amp; Candidate Hotspot Table
              </h4>
            </div>
            <p className="text-xs text-[#58585B]">
              Ranked by long-term mean tropospheric NO2 (246 grid cells across West Kalimantan)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Toggle */}
            <div className="inline-flex rounded-sm border border-[#D1D5DB] p-0.5 bg-[#F6F6F6]">
              <button
                type="button"
                onClick={() => setCoverageFilter("high")}
                className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors ${
                  coverageFilter === "high"
                    ? "bg-[#1B1B1B] text-white shadow-xs"
                    : "text-[#58585B] hover:text-[#1B1B1B]"
                }`}
              >
                High Coverage (≥80%) ({highReliabilityCount})
              </button>
              <button
                type="button"
                onClick={() => setCoverageFilter("all")}
                className={`px-3 py-1 text-xs font-semibold rounded-xs transition-colors ${
                  coverageFilter === "all"
                    ? "bg-[#1B1B1B] text-white shadow-xs"
                    : "text-[#58585B] hover:text-[#1B1B1B]"
                }`}
              >
                All 246 Grids
              </button>
            </div>

            {/* CSV Downloads */}
            <button
              type="button"
              onClick={() =>
                handleDownloadFile(
                  "/data/spatial_analysis/no2_spatial_grid_summary.csv",
                  "no2_spatial_grid_summary.csv"
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] border border-[#D1D5DB] text-[#1B1B1B] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
              <span>Grid Summary CSV</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleDownloadFile(
                  "/data/spatial_analysis/no2_spatial_coverage_all_grids.csv",
                  "no2_spatial_coverage_all_grids.csv"
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] border border-[#D1D5DB] text-[#1B1B1B] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
              <span>Coverage CSV</span>
            </button>

            {/* Toggle Table Collapse */}
            <button
              type="button"
              onClick={() => setIsTableExpanded(!isTableExpanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] border border-[#D1D5DB] text-[#1B1B1B]"
              aria-label={isTableExpanded ? "Collapse Table" : "Expand Table"}
            >
              {isTableExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-[#1B1B1B]" aria-hidden="true" />
                  <span>Expand</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {isTableExpanded && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter coordinates (e.g. 0.375 or cluster)..."
                className="w-full pl-9 pr-3 py-1.5 rounded-sm text-xs font-mono bg-[#F9FAFB] border border-[#E5E7EB] text-[#1B1B1B] placeholder-[#9CA3AF] focus:outline-hidden focus:border-[#15418C] focus:bg-white"
              />
            </div>
            <span className="text-xs font-mono text-[#58585B]">
              Showing {Math.min(visibleCount, filteredGridRows.length)} of {filteredGridRows.length} matching grid cells
            </span>
          </div>
        )}

        {/* Table Body */}
        {isTableExpanded && (
          <div className="overflow-x-auto border border-[#E5E7EB] rounded-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0B0D10] text-white font-mono text-[11px] uppercase tracking-wider border-b border-[#222222]">
                  <th scope="col" className="py-2.5 px-3"># Rank</th>
                  <th scope="col" className="py-2.5 px-3">Grid Center (Lat, Lon)</th>
                  <th scope="col" className="py-2.5 px-3">Cluster Status</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Mean NO2 (molecules/cm²)</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Median NO2 (molecules/cm²)</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Valid Months</th>
                  <th scope="col" className="py-2.5 px-3 text-right">Coverage %</th>
                  <th scope="col" className="py-2.5 px-3 text-center">Reliability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0] font-mono">
                {filteredGridRows.slice(0, visibleCount).map((row, idx) => {
                  const isCluster = isCandidateClusterGrid(row.lat, row.lon);
                  const isHighReliability = row.coverage_pct >= 80;

                  return (
                    <tr
                      key={`${row.lat}_${row.lon}`}
                      className={`hover:bg-[#F8FAFC] transition-colors ${
                        isCluster ? "bg-[#EFF6FF]/40 font-semibold" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 text-[#58585B]">
                        #{idx + 1}
                      </td>
                      <td className="py-2.5 px-3 text-[#1B1B1B]">
                        {row.lat > 0 ? `+${row.lat.toFixed(3)}` : row.lat.toFixed(3)}°N,{" "}
                        {row.lon.toFixed(3)}°E
                      </td>
                      <td className="py-2.5 px-3">
                        {isCluster ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#15418C] border border-[#BFDBFE]">
                            <Flame className="w-3 h-3 text-[#E4002B]" aria-hidden="true" />
                            <span>Candidate Cluster</span>
                          </span>
                        ) : (
                          <span className="text-[#9CA3AF] text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#1B1B1B] font-bold">
                        {formatScientificValue(row.mean_no2, 2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#58585B]">
                        {formatScientificValue(row.median_no2, 2)}
                      </td>
                      <td className="py-2.5 px-3 text-center text-[#58585B]">
                        {row.valid_months} / 192
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#1B1B1B]">
                        {row.coverage_pct.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isHighReliability ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10px] font-bold bg-[#ECFDF5] text-[#059669]">
                            High (≥80%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                            &lt; 80% Valid
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination / Expand footer */}
        {isTableExpanded && filteredGridRows.length > visibleCount && (
          <div className="flex items-center justify-between pt-2 border-t border-[#F0F0F0]">
            <span className="text-xs text-[#58585B]">
              Showing top {visibleCount} of {filteredGridRows.length} grid cells.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => Math.min(prev + 20, filteredGridRows.length))}
                className="px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#F6F6F6] hover:bg-[#EBEBEB] border border-[#D1D5DB] text-[#1B1B1B] transition-colors"
              >
                Show 20 More
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filteredGridRows.length)}
                className="px-3 py-1.5 rounded-sm text-xs font-semibold bg-[#1B1B1B] hover:bg-[#000000] text-white transition-colors"
              >
                Show All ({filteredGridRows.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
