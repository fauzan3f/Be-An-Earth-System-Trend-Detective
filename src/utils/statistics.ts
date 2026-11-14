import type { MonthlyDataPoint, TrendAnalysisContract } from "../types";

/**
 * Standard Normal Cumulative Distribution Function (error function approximation)
 */
function normalCdf(z: number): number {
  if (z === 0) return 0.5;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - prob : prob;
}

/**
 * Calculates Sen's Slope, Mann-Kendall p-value, and confidence interval dynamically for any series slice.
 */
export function calculateDynamicTrend(
  series: MonthlyDataPoint[],
  baseMetadata: TrendAnalysisContract,
  periodLabel: string
): {
  recalculated: TrendAnalysisContract;
  trendlinePoints: (number | null)[];
} {
  // Extract valid points with their monthly time index
  const validPairs: { monthIndex: number; value: number }[] = [];
  let validMonths = 0;
  let missingMonths = 0;

  series.forEach((dp, idx) => {
    if (dp.value !== null && !isNaN(dp.value)) {
      validPairs.push({ monthIndex: idx, value: dp.value });
      validMonths++;
    } else {
      missingMonths++;
    }
  });

  const n = validPairs.length;

  if (n < 4) {
    // Insufficient points for robust statistical test
    return {
      recalculated: {
        ...baseMetadata,
        period: periodLabel,
        valid_months: validMonths,
        missing_months: missingMonths,
        trend_direction: "no trend",
        slope_per_year: 0,
        p_value: 1.0,
        confidence_interval: [0, 0],
      },
      trendlinePoints: series.map(() => null),
    };
  }

  // 1. Calculate all pairwise slopes (scaled to per year = 12 months)
  const slopes: number[] = [];
  let S = 0;

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const dtMonths = validPairs[j].monthIndex - validPairs[i].monthIndex;
      const dy = validPairs[j].value - validPairs[i].value;

      if (dtMonths !== 0) {
        const slopePerYear = (dy / dtMonths) * 12;
        slopes.push(slopePerYear);
      }

      if (dy > 0) S += 1;
      else if (dy < 0) S -= 1;
    }
  }

  slopes.sort((a, b) => a - b);
  const numSlopes = slopes.length;

  // Median slope = Sen's Slope
  const mid = Math.floor(numSlopes / 2);
  const sensSlopePerYear =
    numSlopes % 2 === 0
      ? (slopes[mid - 1] + slopes[mid]) / 2
      : slopes[mid];

  // 2. Mann-Kendall variance of S (assuming negligible ties)
  const varS = (n * (n - 1) * (2 * n + 5)) / 18;
  const stdS = Math.sqrt(varS);

  let Z = 0;
  if (S > 0) {
    Z = (S - 1) / stdS;
  } else if (S < 0) {
    Z = (S + 1) / stdS;
  }

  const pValue = 2 * (1 - normalCdf(Math.abs(Z)));

  // 3. 95% Confidence Interval for Sen's Slope
  const zAlpha = 1.95996; // 95% confidence z-score
  const cAlpha = zAlpha * stdS;
  const rankLower = Math.max(0, Math.floor((numSlopes - cAlpha) / 2));
  const rankUpper = Math.min(numSlopes - 1, Math.ceil((numSlopes + cAlpha) / 2));

  const ciLower = slopes[rankLower] !== undefined ? slopes[rankLower] : sensSlopePerYear;
  const ciUpper = slopes[rankUpper] !== undefined ? slopes[rankUpper] : sensSlopePerYear;

  // Determine trend direction
  let direction: "increasing" | "decreasing" | "no trend" = "no trend";
  if (pValue < 0.05) {
    if (sensSlopePerYear > 0) {
      direction = "increasing";
    } else if (sensSlopePerYear < 0) {
      direction = "decreasing";
    }
  }

  // 4. Calculate trendline intercept (median of residual values)
  const sensSlopePerMonth = sensSlopePerYear / 12;
  const intercepts = validPairs.map((p) => p.value - sensSlopePerMonth * p.monthIndex);
  intercepts.sort((a, b) => a - b);
  const medianIntercept =
    intercepts.length % 2 === 0
      ? (intercepts[Math.floor(intercepts.length / 2) - 1] +
          intercepts[Math.floor(intercepts.length / 2)]) /
        2
      : intercepts[Math.floor(intercepts.length / 2)];

  // Generate trendline values for each index in the slice
  const trendlinePoints = series.map((_, idx) => {
    const val = medianIntercept + sensSlopePerMonth * idx;
    return Math.abs(val) >= 1e4 ? Number(val.toPrecision(6)) : Number(val.toFixed(4));
  });

  const formatStatNum = (v: number) => {
    return Math.abs(v) >= 1e4 || (Math.abs(v) > 0 && Math.abs(v) < 1e-3)
      ? Number(v.toPrecision(6))
      : Number(v.toFixed(5));
  };

  return {
    recalculated: {
      ...baseMetadata,
      period: periodLabel,
      trend_direction: direction,
      slope_per_year: formatStatNum(sensSlopePerYear),
      p_value: pValue < 0.0001 ? 0.0001 : Number(pValue.toFixed(4)),
      confidence_interval: [formatStatNum(ciLower), formatStatNum(ciUpper)],
      valid_months: validMonths,
      missing_months: missingMonths,
    },
    trendlinePoints,
  };
}
