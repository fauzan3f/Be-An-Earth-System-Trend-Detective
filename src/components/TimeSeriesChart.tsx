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
import type { MonthlyDataPoint, DailyDataPoint } from "../types";
import { formatScientificValue } from "../utils/formatters";

// Register ChartJS modules
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

interface TimeSeriesChartProps {
  variableName: string;
  unit: string;
  colorScheme: "cyan" | "amber";
  dataPoints: (MonthlyDataPoint | DailyDataPoint)[];
  trendlinePoints?: (number | null)[];
  isDailyView?: boolean;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  variableName,
  unit,
  colorScheme,
  dataPoints,
  trendlinePoints,
  isDailyView = false,
}) => {
  const isCyan = colorScheme === "cyan";
  const primaryColor = isCyan ? "#38bdf8" : "#fbbf24";
  const primaryBg = isCyan
    ? "rgba(56, 189, 248, 0.12)"
    : "rgba(251, 191, 36, 0.12)";
  const trendlineColor = isCyan ? "#a78bfa" : "#34d399";

  const labels = dataPoints.map((d) => d.date);
  const values = dataPoints.map((d) => d.value);

  const observationLabel = isDailyView
    ? `${variableName} Daily Observations`
    : `${variableName} Monthly Mean`;

  const datasets: any[] = [
    {
      label: observationLabel,
      data: values,
      borderColor: primaryColor,
      backgroundColor: primaryBg,
      borderWidth: isDailyView ? 1.2 : 2,
      pointRadius: isDailyView ? 0 : 2.5,
      pointHoverRadius: isDailyView ? 3 : 5,
      pointBackgroundColor: primaryColor,
      pointBorderColor: "#0f172a",
      pointBorderWidth: 1,
      tension: isDailyView ? 0 : 0.15,
      spanGaps: false, // Visual gaps for missing days/months
      fill: false,
    },
  ];

  if (!isDailyView && trendlinePoints && trendlinePoints.length > 0) {
    datasets.push({
      label: "Sen's Slope Trendline",
      data: trendlinePoints,
      borderColor: trendlineColor,
      borderWidth: 2.5,
      borderDash: [6, 4],
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
      tension: 0,
    });
  }

  const chartData = {
    labels,
    datasets,
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: isDailyView ? 0 : 350,
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#cbd5e1",
          font: {
            family: "Inter, sans-serif",
            size: 11,
            weight: 500,
          },
          boxWidth: 14,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#94a3b8",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context) => {
            const rawVal = context.raw as number | null;
            if (rawVal === null || rawVal === undefined) {
              return `${context.dataset.label}: Missing / Cloud Gap`;
            }
            const formattedVal = formatScientificValue(rawVal, 3);
            return `${context.dataset.label}: ${formattedVal} ${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(51, 65, 85, 0.35)",
        },
        ticks: {
          color: "#94a3b8",
          font: {
            family: "JetBrains Mono, monospace",
            size: 10,
          },
          maxTicksLimit: isDailyView ? 10 : 14,
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          color: "rgba(51, 65, 85, 0.35)",
        },
        ticks: {
          color: "#94a3b8",
          font: {
            family: "JetBrains Mono, monospace",
            size: 10,
          },
          callback: (tickVal) => {
            return formatScientificValue(Number(tickVal), 1);
          },
        },
        title: {
          display: true,
          text: unit,
          color: "#94a3b8",
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="relative w-full h-72 sm:h-80 md:h-88 pt-2">
      <Line data={chartData} options={options} />
    </div>
  );
};
