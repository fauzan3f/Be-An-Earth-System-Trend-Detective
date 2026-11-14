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
  trendlineLabel?: string;
  isDailyView?: boolean;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  variableName,
  unit,
  colorScheme,
  dataPoints,
  trendlinePoints,
  trendlineLabel,
  isDailyView = false,
}) => {
  const isCyan = colorScheme === "cyan";
  // NASA Earthdata palette: NO2 uses NASA Cobalt Blue #0072BC; AOD uses Earthdata Amber #D97706
  const primaryColor = isCyan ? "#0072BC" : "#D97706";
  const primaryBg = isCyan
    ? "rgba(0, 114, 188, 0.08)"
    : "rgba(217, 119, 6, 0.08)";
  // Trendline: NASA Red #E4002B for NO2; Emerald Green #059669 for AOD
  const trendlineColor = isCyan ? "#E4002B" : "#059669";

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
      borderWidth: isDailyView ? 1.2 : 2.2,
      pointRadius: isDailyView ? 0 : 2.5,
      pointHoverRadius: isDailyView ? 3 : 5,
      pointBackgroundColor: primaryColor,
      pointBorderColor: "#FFFFFF",
      pointBorderWidth: 1.5,
      tension: isDailyView ? 0 : 0.1,
      spanGaps: false, // Visual gaps for missing days/months
      fill: false,
    },
  ];

  if (!isDailyView && trendlinePoints && trendlinePoints.length > 0) {
    const defaultTrendLabel =
      variableName === "NO2"
        ? "Simple Linear Reference Line"
        : "Sen's Slope Trendline";
    datasets.push({
      label: trendlineLabel || defaultTrendLabel,
      data: trendlinePoints,
      borderColor: trendlineColor,
      borderWidth: 2.2,
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
      duration: isDailyView ? 0 : 300,
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as const,
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
          color: "#F0F0F0",
        },
        ticks: {
          color: "#58585B",
          font: {
            family: "DM Mono, monospace",
            size: 10,
          },
          maxTicksLimit: isDailyView ? 10 : 14,
          maxRotation: 45,
          minRotation: 0,
        },
        border: {
          color: "#E0E0E0",
        },
      },
      y: {
        grid: {
          color: "#F0F0F0",
        },
        ticks: {
          color: "#58585B",
          font: {
            family: "DM Mono, monospace",
            size: 10,
          },
          callback: (tickVal) => {
            return formatScientificValue(Number(tickVal), 1);
          },
        },
        title: {
          display: true,
          text: unit,
          color: "#58585B",
          font: {
            family: "Public Sans, sans-serif",
            size: 11,
            weight: 600,
          },
        },
        border: {
          color: "#E0E0E0",
        },
      },
    },
  };

  return (
    <div className="relative w-full h-72 sm:h-80 md:h-88 pt-2 bg-white">
      <Line data={chartData} options={options} />
    </div>
  );
};
