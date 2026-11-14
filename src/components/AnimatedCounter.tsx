import React, { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animId: number;

    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
