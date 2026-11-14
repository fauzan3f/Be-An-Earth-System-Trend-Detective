import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

  // Coordinates across West Kalimantan for geographically anchored plume rendering
  const plumeCenters = [
    { lat: -0.02, lon: 109.34 }, // Pontianak & Kapuas estuary
    { lat: -1.85, lon: 109.97 }, // Ketapang & Southern Peatlands
    { lat: 0.06, lon: 111.50 },  // Sintang & Central River Basin
    { lat: 0.91, lon: 108.99 },  // Singkawang / Bengkayang coastal zone
    { lat: -0.80, lon: 110.80 }, // Central West Kalimantan interior
    { lat: -2.30, lon: 110.60 }, // Kendawangan peat dome
    { lat: 0.50, lon: 112.50 },  // Upper Kapuas / Putussibau transition
    { lat: -1.20, lon: 112.20 }, // Schwaner range foothills
  ];

  const currentPoint = series[activeIndex] || series[0] || { date: "2010-11", value: null };
  const rawValue = currentPoint?.value ?? 0;

  // Exact color mapping requested:
  // Low (< 4.5e14): Cyan/Teal (rgba(56, 189, 248) to rgba(16, 185, 129))
  // Moderate (4.5e14 - 6.5e14): Warm Yellow/Amber (rgba(250, 204, 21) to rgba(245, 158, 11))
  // High / Severe (> 6.5e14): Intense Orange to Deep Red (rgba(234, 88, 12) to rgba(220, 38, 38))
  const getEpisodeSeverity = (val: number | null) => {
    if (val === null || val === 0) {
      return {
        label: "Missing / Fill Value",
        color: "#71717A",
        glowRgba: "rgba(113, 113, 122, 0.2)",
      };
    }
    if (val < 4.5e14) {
      return {
        label: "Baseline / Clean Atmosphere",
        color: "#38BDF8",
        glowRgba: "rgba(56, 189, 248, 0.35)",
      };
    }
    if (val <= 6.5e14) {
      return {
        label: "Moderate Column Loading",
        color: "#F59E0B",
        glowRgba: "rgba(245, 158, 11, 0.55)",
      };
    }
    return {
      label: "Severe Smoke & Combustion Episode",
      color: "#DC2626",
      glowRgba: "rgba(220, 38, 38, 0.75)",
    };
  };

  const severity = getEpisodeSeverity(rawValue);

  // Initialize Leaflet Map (Bright Satellite Imagery + High-Contrast Labels)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center directly on West Kalimantan, Indonesia
    const map = L.map(mapContainerRef.current, {
      center: [-0.5, 111.0],
      zoom: 6,
      minZoom: 5,
      maxZoom: 9,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom control to top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // 1. Esri World Imagery (Bright, high-contrast satellite base layer)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 17,
        attribution: "Esri, Maxar, Earthstar Geographics",
      }
    ).addTo(map);

    // 2. Esri Boundaries and Places (Crisp white city labels and borders on satellite tiles)
    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 17,
        opacity: 0.95,
      }
    ).addTo(map);

    // City markers for immediate spatial orientation
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
          <div style="width:6px;height:6px;border-radius:50%;background:#FFFFFF;border:1.5px solid #000000;box-shadow:0 0 3px rgba(0,0,0,0.8);"></div>
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

  // Geographically Anchored Heatmap Plume & Non-Clustering Wind Streamlines
  useEffect(() => {
    const canvas = canvasRef.current;
    const map = mapInstanceRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    // Particle streamlines setup (uniformly distributed across entire map viewport)
    const numParticles = 95;
    interface Streamline {
      x: number;
      y: number;
      speed: number;
      length: number;
      age: number;
      maxAge: number;
    }

    const streamlines: Streamline[] = [];

    const createRandomStreamline = (): Streamline => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.9 + Math.random() * 1.4,
      length: 12 + Math.random() * 18,
      age: Math.floor(Math.random() * 40),
      maxAge: 45 + Math.random() * 55,
    });

    const resizeCanvas = () => {
      if (!canvas || !mapContainerRef.current) return;
      canvas.width = mapContainerRef.current.clientWidth;
      canvas.height = mapContainerRef.current.clientHeight;

      streamlines.length = 0;
      for (let i = 0; i < numParticles; i++) {
        streamlines.push(createRandomStreamline());
      }
    };

    resizeCanvas();
    map.on("resize", resizeCanvas);

    // Animation Loop
    const render = () => {
      if (!isRunning) return;

      // CRITICAL: Fully clear canvas on every frame so underlying satellite map is 100% bright and visible!
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Calculate screen coordinates of West Kalimantan Bounding Box
      const nw = map.latLngToContainerPoint([bbox.north, bbox.west]);
      const se = map.latLngToContainerPoint([bbox.south, bbox.east]);
      const boxWidth = se.x - nw.x;
      const boxHeight = se.y - nw.y;

      // 2. Geographically Anchored Pollution Plume (Clipped inside study box)
      if (boxWidth > 20 && boxHeight > 20 && rawValue > 0) {
        ctx.save();

        // Clip strictly to the West Kalimantan study bounding box
        ctx.beginPath();
        ctx.rect(nw.x, nw.y, boxWidth, boxHeight);
        ctx.clip();

        const plumeRadius = Math.max(boxWidth, boxHeight) * 0.38;

        // Render multi-point soft atmospheric heat plumes anchored to real coordinates
        plumeCenters.forEach((center) => {
          const pt = map.latLngToContainerPoint([center.lat, center.lon]);

          const gradient = ctx.createRadialGradient(
            pt.x,
            pt.y,
            plumeRadius * 0.1,
            pt.x,
            pt.y,
            plumeRadius
          );

          if (rawValue < 4.5e14) {
            // Low / Clean Atmosphere: Soft translucent Cyan/Teal
            gradient.addColorStop(0, "rgba(56, 189, 248, 0.32)");
            gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.22)");
            gradient.addColorStop(1, "rgba(56, 189, 248, 0.0)");
          } else if (rawValue <= 6.5e14) {
            // Moderate Column Loading: Warm Yellow/Amber
            gradient.addColorStop(0, "rgba(250, 204, 21, 0.50)");
            gradient.addColorStop(0.5, "rgba(245, 158, 11, 0.32)");
            gradient.addColorStop(1, "rgba(250, 204, 21, 0.0)");
          } else {
            // High / Severe Fire Peak Episode: Intense Orange to Deep Red
            gradient.addColorStop(0, "rgba(234, 88, 12, 0.68)");
            gradient.addColorStop(0.45, "rgba(220, 38, 38, 0.50)");
            gradient.addColorStop(0.8, "rgba(153, 27, 27, 0.25)");
            gradient.addColorStop(1, "rgba(220, 38, 38, 0.0)");
          }

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, plumeRadius, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();

        // Draw crisp dashed bounding-box border
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(nw.x, nw.y, boxWidth, boxHeight);
        ctx.restore();
      }

      // 3. Render Subtle Wind Streamlines (No Right-Edge Clustering)
      ctx.save();
      ctx.lineWidth = 1.4;

      streamlines.forEach((p) => {
        p.age += 1;
        p.x -= p.speed * 1.4; // Drift westward (equatorial trade wind vector)
        p.y += Math.sin(p.x * 0.02) * 0.35;

        // If streamline expires or moves out of canvas, respawn at a RANDOM point anywhere on the map!
        if (p.age >= p.maxAge || p.x < -30 || p.y < -30 || p.y > canvas.height + 30) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.age = 0;
          p.maxAge = 45 + Math.random() * 55;
        }

        // Opacity smoothly fades in and out with age
        const progress = p.age / p.maxAge;
        const opacity =
          progress < 0.25
            ? (progress / 0.25) * 0.45
            : (1 - (progress - 0.25) / 0.75) * 0.45;

        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, opacity)})`;

        ctx.beginPath();
        ctx.moveTo(p.x + p.length, p.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });

      ctx.restore();

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
    <div className="relative z-10 isolate w-full rounded-sm overflow-hidden border border-[rgba(255,255,255,0.15)] bg-[#000000] shadow-2xl">
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
        className="w-full h-[440px] sm:h-[500px] lg:h-[560px] relative z-0 bg-[#0B0D10]"
        aria-label="Interactive Satellite Pollution Map for West Kalimantan"
      />

      {/* Atmospheric Canvas Layer (100% Transparent, Never Obscures Map) */}
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

        {/* Row 3: Continuous Color Scale Gradient Bar */}
        <div className="pt-1 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
            <span>3.0e+14 (CLEAN CYAN)</span>
            <span>4.5e+14 (THRESHOLD)</span>
            <span>6.5e+14 (AMBER HAZE)</span>
            <span>1.0e+15</span>
            <span className="text-[#E4002B] font-bold">1.35e+15 (SEVERE RED)</span>
          </div>

          <div
            className="w-full h-2 rounded-sm shadow-inner"
            style={{
              background:
                "linear-gradient(to right, #38BDF8 0%, #10B981 25%, #FACC15 50%, #F59E0B 65%, #EA580C 80%, #DC2626 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};
