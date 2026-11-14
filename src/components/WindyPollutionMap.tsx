import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { Play, Pause, RotateCcw } from "lucide-react";
import type { MonthlyDataPoint } from "../types";
import { formatScientificValue } from "../utils/formatters";

interface WindyPollutionMapProps {
  series: MonthlyDataPoint[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  variableName?: string;
  unit?: string;
}

export const WindyPollutionMap: React.FC<WindyPollutionMapProps> = ({
  series,
  activeIndex,
  onSelectIndex,
  variableName = "NO2",
  unit = "molecules/cm²",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(350); // ms per frame
  const animFrameIdRef = useRef<number | null>(null);

  // Geographic Bounding Box for West Kalimantan study area
  // 108°E – 114°E, 3.5°S – 2.5°N
  const bbox = {
    south: -3.5,
    north: 2.5,
    west: 108.0,
    east: 114.0,
  };

  const currentPoint = series[activeIndex] || series[0] || { date: "2010-11", value: null };
  const rawValue = currentPoint?.value ?? 0;

  // Categorize pollution / optical density intensity
  const getEpisodeSeverity = (val: number | null) => {
    if (val === null || val === 0) return { label: "Missing / Fill Value", color: "#71717A", glowRgba: "rgba(113, 113, 122, 0.2)" };
    if (val < 4.0e14) return { label: "Baseline / Clean Atmosphere", color: "#3B82F6", glowRgba: "rgba(59, 130, 246, 0.35)" };
    if (val < 7.5e14) return { label: "Moderate Column Loading", color: "#F59E0B", glowRgba: "rgba(245, 158, 11, 0.45)" };
    return { label: "Severe Smoke & Combustion Episode", color: "#E4002B", glowRgba: "rgba(228, 0, 43, 0.65)" };
  };

  const severity = getEpisodeSeverity(rawValue);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on West Kalimantan, Indonesia
    const map = L.map(mapContainerRef.current, {
      center: [-0.5, 111.0],
      zoom: 6,
      minZoom: 5,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom control to top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // 1. Esri World Imagery (High-res satellite base)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 17,
        attribution: "Esri, Maxar, Earthstar Geographics",
      }
    ).addTo(map);

    // 2. Esri Boundaries and Places (City labels and national/provincial borders)
    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 17,
        opacity: 0.85,
      }
    ).addTo(map);

    // 3. Draw Study Bounding Box Rectangle (108°E - 114°E, 3.5°S - 2.5°N)
    const bounds: L.LatLngBoundsExpression = [
      [bbox.south, bbox.west],
      [bbox.north, bbox.east],
    ];

    L.rectangle(bounds, {
      color: "#FFFFFF",
      weight: 1.8,
      dashArray: "6, 6",
      fillColor: "transparent",
      fillOpacity: 0.1,
    }).addTo(map);

    // Geographic City Markers for context
    const cities = [
      { name: "Pontianak", lat: -0.0263, lon: 109.3425 },
      { name: "Ketapang", lat: -1.8488, lon: 109.9722 },
      { name: "Sintang", lat: 0.0617, lon: 111.4984 },
      { name: "Singkawang", lat: 0.9071, lon: 108.9868 },
    ];

    cities.forEach((c) => {
      const icon = L.divIcon({
        className: "custom-city-marker",
        html: `<div style="display:flex;align-items:center;gap:4px;">
          <div style="width:6px;height:6px;border-radius:50%;background:#FFFFFF;border:1.5px solid #000000;"></div>
          <span style="font-family:'DM Mono',monospace;font-size:10px;font-weight:700;color:#FFFFFF;text-shadow:0 1px 3px rgba(0,0,0,0.9);letter-spacing:0.05em;">${c.name.toUpperCase()}</span>
        </div>`,
        iconSize: [80, 20],
        iconAnchor: [3, 10],
      });
      L.marker([c.lat, c.lon], { icon, interactive: false }).addTo(map);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Atmospheric Particle Flow and Plume Overlay Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const map = mapInstanceRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    // Particle system (Windy.com-inspired streamlines)
    const numParticles = 140;
    interface Particle {
      x: number;
      y: number;
      speed: number;
      life: number;
      maxLife: number;
      size: number;
    }

    const particles: Particle[] = [];

    const resetParticle = (p: Partial<Particle> = {}): Particle => {
      return {
        x: p.x ?? Math.random() * canvas.width,
        y: p.y ?? Math.random() * canvas.height,
        speed: 0.8 + Math.random() * 1.6,
        life: 0,
        maxLife: 60 + Math.random() * 80,
        size: 1 + Math.random() * 1.5,
      };
    };

    const resizeCanvas = () => {
      if (!canvas || !mapContainerRef.current) return;
      canvas.width = mapContainerRef.current.clientWidth;
      canvas.height = mapContainerRef.current.clientHeight;

      particles.length = 0;
      for (let i = 0; i < numParticles; i++) {
        particles.push(resetParticle());
      }
    };

    resizeCanvas();
    map.on("resize", resizeCanvas);
    map.on("move", () => {});

    // Animation Loop
    const render = () => {
      if (!isRunning) return;

      // Semi-transparent fade for motion trail
      ctx.fillStyle = "rgba(11, 13, 16, 0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Calculate screen coordinates of West Kalimantan Bounding Box
      const nw = map.latLngToContainerPoint([bbox.north, bbox.west]);
      const se = map.latLngToContainerPoint([bbox.south, bbox.east]);
      const boxWidth = se.x - nw.x;
      const boxHeight = se.y - nw.y;
      const centerX = nw.x + boxWidth / 2;
      const centerY = nw.y + boxHeight / 2;
      const radius = Math.max(boxWidth, boxHeight) * 0.65;

      // 2. Render Radial Atmospheric Column Density Plume
      if (radius > 10 && rawValue > 0) {
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY,
          radius * 0.1,
          centerX,
          centerY,
          radius
        );

        if (rawValue < 4.0e14) {
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.38)");
          gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.22)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
        } else if (rawValue < 7.5e14) {
          gradient.addColorStop(0, "rgba(245, 158, 11, 0.48)");
          gradient.addColorStop(0.6, "rgba(234, 88, 12, 0.25)");
          gradient.addColorStop(1, "rgba(245, 158, 11, 0.0)");
        } else {
          // Intense Fire Season Peak: Deep Crimson Smoke
          gradient.addColorStop(0, "rgba(228, 0, 43, 0.65)");
          gradient.addColorStop(0.4, "rgba(220, 38, 38, 0.45)");
          gradient.addColorStop(0.75, "rgba(185, 28, 28, 0.25)");
          gradient.addColorStop(1, "rgba(153, 27, 27, 0.0)");
        }

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Render Drifting Atmospheric Particles (East to West Equatorial Drift)
      particles.forEach((p) => {
        p.life += 1;
        p.x -= p.speed * 1.2; // Move westward
        p.y += Math.sin(p.x * 0.015) * 0.4; // Subtle sinusoidal drift

        // Re-spawn if particle expires or exits canvas
        if (p.life > p.maxLife || p.x < 0 || p.y < 0 || p.y > canvas.height) {
          Object.assign(p, resetParticle({ x: canvas.width + Math.random() * 20 }));
        }

        // Particle opacity fades in and out gracefully
        const progress = p.life / p.maxLife;
        const opacity = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;

        // Particle color responds to pollution intensity
        ctx.fillStyle =
          rawValue > 7.5e14
            ? `rgba(254, 202, 202, ${opacity * 0.85})`
            : rawValue > 4.0e14
            ? `rgba(254, 240, 138, ${opacity * 0.75})`
            : `rgba(224, 242, 254, ${opacity * 0.65})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      map.off("resize", resizeCanvas);
    };
  }, [rawValue]);

  // Automated Timeline Player logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onSelectIndex((activeIndex + 1) % series.length);
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, activeIndex, series.length, playbackSpeed, onSelectIndex]);

  // Keyboard navigation for timeline scrubber
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onSelectIndex(Math.max(0, activeIndex - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onSelectIndex(Math.min(series.length - 1, activeIndex + 1));
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    },
    [activeIndex, series.length, onSelectIndex]
  );

  return (
    <div className="relative w-full rounded-sm overflow-hidden border border-[rgba(255,255,255,0.15)] bg-[#000000] shadow-2xl">
      {/* Top Glassmorphic Scientific Integrity Badge */}
      <div className="absolute top-3 left-3 z-[1000] max-w-sm sm:max-w-md p-2.5 rounded-sm bg-[rgba(11,13,16,0.85)] backdrop-blur-md border border-[rgba(255,255,255,0.15)] text-white shadow-xl pointer-events-auto">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#E4002B] animate-pulse" aria-hidden="true" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">
            SATELLITE TELEMETRY : BORNEO AIRSPACE
          </span>
        </div>
        <p className="text-[11px] leading-snug text-[#E4E4E7]">
          <strong>West Kalimantan Bounding Box (108°E-114°E, 3.5°S-2.5°N):</strong> Color intensity reflects
          uniform area-averaged monthly column density from NASA Giovanni OMNO2d_004, not pixel-resolved local hotspots.
        </p>
      </div>

      {/* Map Viewport Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[420px] sm:h-[480px] lg:h-[540px] relative z-0 bg-[#0B0D10]"
        aria-label="Interactive Satellite Pollution Map for West Kalimantan"
      />

      {/* Atmospheric Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[400] pointer-events-none"
      />

      {/* Windy.com-Style Bottom Floating HUD (Player + Scrubber + Legend) */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] p-3 sm:p-4 bg-[rgba(0,0,0,0.92)] backdrop-blur-lg border-t border-[rgba(255,255,255,0.15)] text-white space-y-3">
        {/* Row 1: Player Controls & Live Callout Metric */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Controls: Play/Pause, Reset, Speed */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-sm bg-[#E4002B] hover:bg-[#B80022] text-white transition-all shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#E4002B]"
              aria-label={isPlaying ? "Pause timeline animation" : "Play timeline animation"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" aria-hidden="true" />
              ) : (
                <Play className="w-4 h-4 fill-white translate-x-0.5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onSelectIndex(0)}
              className="p-2 rounded-sm bg-[#18181B] hover:bg-[#27272A] border border-[rgba(255,255,255,0.12)] text-[#A1A1AA] hover:text-white transition-colors"
              title="Reset to November 2010"
              aria-label="Reset timeline"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-1 bg-[#18181B] p-0.5 rounded-sm border border-[rgba(255,255,255,0.12)] text-[10px] font-mono">
              <span className="text-[#71717A] px-1.5">SPEED:</span>
              <button
                type="button"
                onClick={() => setPlaybackSpeed(500)}
                className={`px-2 py-0.5 rounded-sm transition-colors ${
                  playbackSpeed === 500 ? "bg-[#27272A] text-white font-bold" : "text-[#A1A1AA]"
                }`}
              >
                1x
              </button>
              <button
                type="button"
                onClick={() => setPlaybackSpeed(250)}
                className={`px-2 py-0.5 rounded-sm transition-colors ${
                  playbackSpeed === 250 ? "bg-[#27272A] text-white font-bold" : "text-[#A1A1AA]"
                }`}
              >
                2x
              </button>
            </div>
          </div>

          {/* Live Month & Telemetry Callout Pill */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#12151B] border border-[rgba(255,255,255,0.15)] font-mono text-xs">
              <span className="text-[#A1A1AA]">DATE:</span>
              <span className="text-white font-bold tracking-wider">{currentPoint.date}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#12151B] border border-[rgba(255,255,255,0.15)] font-mono text-xs">
              <span className="text-[#A1A1AA]">{variableName}:</span>
              <span className="text-white font-bold">
                {rawValue !== null ? formatScientificValue(rawValue) : "Missing"} {unit}
              </span>
            </div>

            {/* Severity Pill */}
            <div
              className="px-2.5 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider border"
              style={{
                backgroundColor: severity.glowRgba,
                borderColor: severity.color,
                color: "#FFFFFF",
              }}
            >
              {severity.label}
            </div>
          </div>
        </div>

        {/* Row 2: Interactive Timeline Scrubber Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#A1A1AA]">
            <span>NOV 2010 (START)</span>
            <span className="text-white font-bold">
              FRAME {activeIndex + 1} OF {series.length} MONTHS
            </span>
            <span>OCT 2026 (END)</span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={series.length - 1}
              value={activeIndex}
              onChange={(e) => onSelectIndex(parseInt(e.target.value, 10))}
              onKeyDown={handleKeyDown}
              className="w-full h-2 bg-[#27272A] rounded-sm appearance-none cursor-pointer accent-[#E4002B] focus:outline-none focus:ring-1 focus:ring-[#E4002B]"
              aria-label="Scrub through satellite observation months (2010 to 2026)"
            />
          </div>
        </div>

        {/* Row 3: Continuous Windy.com-Style Color Scale Gradient Bar */}
        <div className="pt-1 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
            <span>3.0e+14 (CLEAN)</span>
            <span>5.0e+14</span>
            <span>7.5e+14 (ELEVATED)</span>
            <span>1.0e+15</span>
            <span className="text-[#E4002B] font-bold">1.35e+15 (SEVERE PEAK)</span>
          </div>

          <div
            className="w-full h-2 rounded-sm shadow-inner"
            style={{
              background:
                "linear-gradient(to right, #3B82F6 0%, #06B6D4 25%, #10B981 40%, #F59E0B 65%, #EA580C 85%, #E4002B 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
