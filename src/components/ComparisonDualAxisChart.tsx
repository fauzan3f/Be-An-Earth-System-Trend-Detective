import React from "react";
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
import type { NO2AODComparisonRecord } from "../types";
import { formatScientificValue } from "../utils/formatters";

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

interface ComparisonDualAxisChartProps {
  records: NO2AODComparisonRecord[];
  activeDate?: string;
  onSelectDate?: (date: string) => void;
  viewMode: "dual" | "split";
}

export const ComparisonDualAxisChart: React.FC<ComparisonDualAxisChartProps> = ({
  records,
  activeDate,
  onSelectDate,
  viewMode,
}) => {
  const labels = records.map((r) => r.date);
  const no2Values = records.map((r) => r.no2);
  const aodValues = records.map((r) => r.aod);

  const sharedTooltipCallback = {
    label: (context: any) => {
      const date = context.label;
      const rawVal = context.raw as number | null;
      const isNo2 = context.dataset.yAxisID === "yNo2" || context.dataset.label.includes("NO2");

      if (date === "2010-10") {
        return `${context.dataset.label}: Boundary Month (Oct 31 only, no monthly QC exported)`;
      }
      if (date === "2022-10" && !isNo2) {
        return "AOD: QC Fail (12 valid days / 38.7% coverage; 3-segment rule failed)";
      }
      if (rawVal === null || rawVal === undefined) {
        return `${context.dataset.label}: No QC-Accepted Value`;
      }
      if (isNo2) {
        return `NO2: ${formatScientificValue(rawVal, 3)} molecules/cm²`;
      }
      return `AOD: ${Number(rawVal).toFixed(3)} (dimensionless at 550 nm)`;
    },
  };

  if (viewMode === "split") {
    // Synchronized Stacked / Split View
    const no2Options: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      onClick: (_evt, elements) => {
        if (elements && elements.length > 0 && onSelectDate) {
          onSelectDate(labels[elements[0].index]);
        }
      },
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: {
            color: "#15418C",
            font: { family: "Public Sans, sans-serif", size: 11, weight: 700 },
            boxWidth: 14,
          },
        },
        tooltip: {
          backgroundColor: "#0B0D10",
          titleColor: "#FFFFFF",
          bodyColor: "#E0E0E0",
          borderColor: "#333333",
          borderWidth: 1,
          padding: 10,
          cornerRadius: 3,
          callbacks: sharedTooltipCallback,
        },
      },
      scales: {
        x: {
          grid: { color: "#F0F0F0" },
          ticks: {
            color: "#58585B",
            font: { family: "DM Mono, monospace", size: 10 },
            maxTicksLimit: 14,
            maxRotation: 45,
          },
          border: { color: "#E0E0E0" },
        },
        y: {
          title: {
            display: true,
            text: "NO2 (molecules/cm²)",
            color: "#15418C",
            font: { family: "Public Sans, sans-serif", size: 11, weight: 700 },
          },
          grid: { color: "#F0F0F0" },
          ticks: {
            color: "#15418C",
            font: { family: "DM Mono, monospace", size: 10 },
            callback: (v) => formatScientificValue(Number(v), 1),
          },
          border: { color: "#E0E0E0" },
        },
      },
    };

    const aodOptions: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      onClick: (_evt, elements) => {
        if (elements && elements.length > 0 && onSelectDate) {
          onSelectDate(labels[elements[0].index]);
        }
      },
      plugins: {
        legend: {
          position: "top",
          align: "end",
          labels: {
            color: "#1B1B1B",
            font: { family: "Public Sans, sans-serif", size: 11, weight: 700 },
            boxWidth: 14,
          },
        },
        tooltip: {
          backgroundColor: "#0B0D10",
          titleColor: "#FFFFFF",
          bodyColor: "#E0E0E0",
          borderColor: "#333333",
          borderWidth: 1,
          padding: 10,
          cornerRadius: 3,
          callbacks: sharedTooltipCallback,
        },
      },
      scales: {
        x: {
          grid: { color: "#F0F0F0" },
          ticks: {
            color: "#58585B",
            font: { family: "DM Mono, monospace", size: 10 },
            maxTicksLimit: 14,
            maxRotation: 45,
          },
          border: { color: "#E0E0E0" },
        },
        y: {
          title: {
            display: true,
            text: "AOD (550 nm, dimensionless)",
            color: "#1B1B1B",
            font: { family: "Public Sans, sans-serif", size: 11, weight: 700 },
          },
          grid: { color: "#F0F0F0" },
          ticks: {
            color: "#1B1B1B",
            font: { family: "DM Mono, monospace", size: 10 },
            callback: (v) => Number(v).toFixed(2),
          },
          border: { color: "#E0E0E0" },
        },
      },
    };

    const no2Data = {
      labels,
      datasets: [
        {
          label: "NO2 Monthly Mean (NASA OMI OMNO2d)",
          data: no2Values,
          borderColor: "#15418C",
          backgroundColor: "rgba(21, 65, 140, 0.08)",
          borderWidth: 2,
          pointRadius: (ctx: any) => (activeDate && labels[ctx.dataIndex] === activeDate ? 6 : 2),
          pointBackgroundColor: (ctx: any) =>
            activeDate && labels[ctx.dataIndex] === activeDate ? "#E4002B" : "#15418C",
          spanGaps: false,
          tension: 0.1,
          fill: true,
        },
      ],
    };

    const aodData = {
      labels,
      datasets: [
        {
          label: "AOD Monthly Mean (NASA Giovanni MODIS Terra)",
          data: aodValues,
          borderColor: "#1B1B1B",
          backgroundColor: "rgba(27, 27, 27, 0.06)",
          borderWidth: 2,
          pointRadius: (ctx: any) => (activeDate && labels[ctx.dataIndex] === activeDate ? 6 : 2),
          pointBackgroundColor: (ctx: any) =>
            activeDate && labels[ctx.dataIndex] === activeDate ? "#E4002B" : "#1B1B1B",
          spanGaps: false,
          tension: 0.1,
          fill: true,
        },
      ],
    };

    return (
      <div className="space-y-4">
        <div className="h-56 bg-white p-2 border border-[#E5E7EB] rounded-sm">
          <Line data={no2Data} options={no2Options} />
        </div>
        <div className="h-56 bg-white p-2 border border-[#E5E7EB] rounded-sm">
          <Line data={aodData} options={aodOptions} />
        </div>
      </div>
    );
  }

  // Dual Y-Axis Synchronized Chart
  const dualOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    onClick: (_evt, elements) => {
      if (elements && elements.length > 0 && onSelectDate) {
        onSelectDate(labels[elements[0].index]);
      }
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          color: "#1B1B1B",
          font: {
            family: "Public Sans, sans-serif",
            size: 11,
            weight: 600,
          },
          boxWidth: 14,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: "#0B0D10",
        titleColor: "#FFFFFF",
        bodyColor: "#E0E0E0",
        borderColor: "#333333",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 3,
        callbacks: sharedTooltipCallback,
      },
    },
    scales: {
      x: {
        grid: {
          color: "#F0F0F0",
        },
        ticks: {
          color: "#58585B",
          font: {
            family: "DM Mono, monospace",
            size: 10,
          },
          maxTicksLimit: 14,
          maxRotation: 45,
        },
        border: {
          color: "#E0E0E0",
        },
      },
      yNo2: {
        type: "linear" as const,
        position: "left" as const,
        title: {
          display: true,
          text: "NO2 (molecules/cm²)",
          color: "#15418C",
          font: {
            family: "Public Sans, sans-serif",
            size: 11,
            weight: 700,
          },
        },
        ticks: {
          color: "#15418C",
          font: {
            family: "DM Mono, monospace",
            size: 10,
          },
          callback: (v) => formatScientificValue(Number(v), 1),
        },
        grid: {
          color: "#F0F0F0",
        },
        border: {
          color: "#E0E0E0",
        },
      },
      yAod: {
        type: "linear" as const,
        position: "right" as const,
        title: {
          display: true,
          text: "AOD 550nm (dimensionless)",
          color: "#1B1B1B",
          font: {
            family: "Public Sans, sans-serif",
            size: 11,
            weight: 700,
          },
        },
        ticks: {
          color: "#1B1B1B",
          font: {
            family: "DM Mono, monospace",
            size: 10,
          },
          callback: (v) => Number(v).toFixed(2),
        },
        grid: {
          drawOnChartArea: false, // Prevent overlapping horizontal grid lines
        },
        border: {
          color: "#E0E0E0",
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "NO2 Monthly Mean (NASA OMI OMNO2d)",
        data: no2Values,
        yAxisID: "yNo2",
        borderColor: "#15418C",
        backgroundColor: "rgba(21, 65, 140, 0.08)",
        borderWidth: 2.2,
        pointRadius: (ctx: any) =>
          activeDate && labels[ctx.dataIndex] === activeDate ? 6.5 : 2.5,
        pointBackgroundColor: (ctx: any) =>
          activeDate && labels[ctx.dataIndex] === activeDate ? "#E4002B" : "#15418C",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 1.5,
        tension: 0.1,
        spanGaps: false,
        fill: false,
      },
      {
        label: "AOD Monthly Mean (NASA Giovanni MODIS Terra)",
        data: aodValues,
        yAxisID: "yAod",
        borderColor: "#1B1B1B",
        backgroundColor: "rgba(27, 27, 27, 0.06)",
        borderWidth: 2.2,
        pointRadius: (ctx: any) =>
          activeDate && labels[ctx.dataIndex] === activeDate ? 6.5 : 2.5,
        pointBackgroundColor: (ctx: any) =>
          activeDate && labels[ctx.dataIndex] === activeDate ? "#E4002B" : "#1B1B1B",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 1.5,
        tension: 0.1,
        spanGaps: false,
        fill: false,
      },
    ],
  };

  return (
    <div className="relative w-full h-80 sm:h-96 pt-2 bg-white">
      <Line data={chartData} options={dualOptions} />
    </div>
  );
};
