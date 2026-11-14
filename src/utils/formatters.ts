/**
 * Converts exponent number to unicode superscript string (e.g. 14 -> ¹⁴, -3 -> ⁻³)
 */
export function toSuperscript(num: number): string {
  const map: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "-": "⁻",
  };
  return String(num)
    .split("")
    .map((ch) => map[ch] || ch)
    .join("");
}

/**
 * Formats values in scientific notation (e.g., 5.18 × 10¹⁴ molecules/cm²)
 * or standard decimals for index values like AOD.
 */
export function formatScientificValue(
  val: number | null | undefined,
  precision: number = 2
): string {
  if (val === null || val === undefined || isNaN(val)) {
    return "N/A";
  }

  const absVal = Math.abs(val);

  // If value is in scientific atmospheric scale (e.g. >= 1e4 or <= 1e-4)
  if (absVal >= 1e4 || (absVal > 0 && absVal <= 1e-3)) {
    const expStr = val.toExponential(precision);
    const [mantissa, exponent] = expStr.split("e");
    const expInt = parseInt(exponent, 10);
    return `${mantissa} × 10${toSuperscript(expInt)}`;
  }

  // Otherwise standard decimal format
  if (absVal < 0.001) {
    return val.toExponential(precision);
  }

  return val.toFixed(precision);
}

/**
 * Formats slope per year with sign and unit
 */
export function formatSlope(
  slope: number,
  unit: string,
  precision: number = 2
): string {
  const sign = slope > 0 ? "+" : "";
  const formatted = formatScientificValue(slope, precision);
  return `${sign}${formatted} ${unit}/yr`;
}

/**
 * Formats slope per decade (10 years) with sign and unit
 */
export function formatSlopePerDecade(
  slope: number,
  unit: string,
  precision: number = 2
): string {
  const slopeDecade = slope * 10;
  const sign = slopeDecade > 0 ? "+" : "";
  const formatted = formatScientificValue(slopeDecade, precision);
  return `${sign}${formatted} ${unit}/decade`;
}
