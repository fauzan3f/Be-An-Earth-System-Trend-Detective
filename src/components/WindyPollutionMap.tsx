import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Play, Pause, RotateCcw, AlertTriangle } from "lucide-react";
import type { MonthlyDataPoint, GridCellProperties } from "../types";
import { formatScientificValue } from "../utils/formatters";
import boundaryFallback from "../data/west_kalimantan_boundary.json";

interface WindyPollutionMapProps {
  series: MonthlyDataPoint[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  variableName?: string;
  unit?: string;
}

interface HoveredCellInfo {
  centerLat: number;
  centerLon: number;
  props: GridCellProperties;
}

/**
 * Linear color interpolation helper
 */
function interpolateHex(hex1: string, hex2: string, t: number): string {
  const clampedT = Math.max(0, Math.min(1, t));
  const c1 = parseInt(hex1.replace("#", ""), 16);
  const c2 = parseInt(hex2.replace("#", ""), 16);

  const r1 = (c1 >> 16) & 255;
  const g1 = (c1 >> 8) & 255;
  const b1 = c1 & 255;

  const r2 = (c2 >> 16) & 255;
  const g2 = (c2 >> 8) & 255;
  const b2 = c2 & 255;

  const r = Math.round(r1 + (r2 - r1) * clampedT);
  const g = Math.round(g1 + (g2 - g1) * clampedT);
  const b = Math.round(b1 + (b2 - b1) * clampedT);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Rule B1: Fixed Cross-Month Physical Color Scale (1.0e14 to 1.8e15 molecules/cm²)
 * Clamped strictly so cross-month visual comparison is 100% consistent across all 193 months.
 */
export function getNo2Color(
  val: number | null,
  qcPass: boolean = true
): { fill: string; fillOpacity: number; stroke: string } {
  // Cells where no2 === null or !qc_pass render as transparent, NEVER colored as 0
  if (val === null || !qcPass || isNaN(val)) {
    return {
      fill: "transparent",
      fillOpacity: 0,
      stroke: "rgba(255, 255, 255, 0.12)",
    };
  }

  // Physical stops per specification
  if (val < 2.5e14) {
    // Deep Blue (#1D4ED8) -> Cyan (#06B6D4)
    const t = Math.max(0, (val - 1.0e14) / (2.5e14 - 1.0e14));
    return {
      fill: interpolateHex("#1D4ED8", "#06B6D4", t),
      fillOpacity: 0.72,
      stroke: "rgba(6, 182, 212, 0.4)",
    };
  } else if (val < 5.5e14) {
    // Cyan (#06B6D4) -> Teal / Emerald Green (#10B981)
    const t = (val - 2.5e14) / (5.5e14 - 2.5e14);
    return {
      fill: interpolateHex("#06B6D4", "#10B981", t),
      fillOpacity: 0.75,
      stroke: "rgba(16, 185, 129, 0.4)",
    };
  } else if (val < 9.0e14) {
    // Yellow (#FACC15) -> Amber (#F59E0B)
    const t = (val - 5.5e14) / (9.0e14 - 5.5e14);
    return {
      fill: interpolateHex("#FACC15", "#F59E0B", t),
      fillOpacity: 0.78,
      stroke: "rgba(245, 158, 11, 0.45)",
    };
  } else if (val <= 1.4e15) {
    // Deep Orange (#EA580C) -> Red (#DC2626)
    const t = (val - 9.0e14) / (1.4e15 - 9.0e14);
    return {
      fill: interpolateHex("#EA580C", "#DC2626", t),
      fillOpacity: 0.82,
      stroke: "rgba(220, 38, 38, 0.5)",
    };
  } else {
    // > 1.4e15: Dark Crimson (#991B1B)
    return {
      fill: "#991B1B",
      fillOpacity: 0.86,
      stroke: "rgba(153, 27, 27, 0.6)",
    };
  }
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
  const gridPaneRef = useRef<HTMLElement | null>(null);
  const gridLayerRef = useRef<L.GeoJSON | null>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const clipPathElementRef = useRef<SVGPathElement | null>(null);

  // In-memory cache for GeoJSON files (instant 60 FPS timeline playback)
  const geojsonCacheRef = useRef<Map<string, any>>(new Map());

  // Interactive controls state
  const [clipToBoundary, setClipToBoundary] = useState<boolean>(true);
  const [smoothInterpolation, setSmoothInterpolation] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(350); // ms per frame
  const [hoveredCell, setHoveredCell] = useState<HoveredCellInfo | null>(null);
  const [boundaryGeoJson, setBoundaryGeoJson] = useState<any | null>(null);
  const [currentGeoJson, setCurrentGeoJson] = useState<any | null>(null);
  const [isLoadingGeoJson, setIsLoadingGeoJson] = useState<boolean>(false);

  const animFrameIdRef = useRef<number | null>(null);

  const currentPoint = series[activeIndex] || series[0] || { date: "2010-11", value: null };
  const isBoundaryMonth = currentPoint?.boundaryMonth || currentPoint?.date === "2010-10";

  // Load West Kalimantan provincial boundary GeoJSON
  useEffect(() => {
    let isMounted = true;
    fetch("/data/west_kalimantan_boundary.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => {
        if (isMounted) setBoundaryGeoJson(data);
      })
      .catch(() => {
        if (isMounted) setBoundaryGeoJson(boundaryFallback);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch / Cache GeoJSON for the active month
  const fetchMonthGeoJson = useCallback(async (dateStr: string): Promise<any> => {
    if (geojsonCacheRef.current.has(dateStr)) {
      return geojsonCacheRef.current.get(dateStr);
    }

    try {
      const res = await fetch(`/data/fullstack/grid_geojson/no2_grid_${dateStr}.geojson`);
      if (res.ok) {
        const data = await res.json();
        geojsonCacheRef.current.set(dateStr, data);
        return data;
      }
    } catch (err) {
      console.warn(`Could not load GeoJSON for ${dateStr}:`, err);
    }
    return null;
  }, []);

  // Active month GeoJSON loader + adjacent frame prefetching
  useEffect(() => {
    let isMounted = true;
    const dateStr = currentPoint.date;
    if (!dateStr) return;

    if (geojsonCacheRef.current.has(dateStr)) {
      setCurrentGeoJson(geojsonCacheRef.current.get(dateStr));
    } else {
      setIsLoadingGeoJson(true);
      fetchMonthGeoJson(dateStr).then((data) => {
        if (isMounted && data) {
          setCurrentGeoJson(data);
          setIsLoadingGeoJson(false);
        }
      });
    }

    // Prefetch next 3 months in background for silky timeline scrub
    for (let offset = 1; offset <= 3; offset++) {
      const nextIdx = (activeIndex + offset) % series.length;
      const nextDate = series[nextIdx]?.date;
      if (nextDate && !geojsonCacheRef.current.has(nextDate)) {
        fetchMonthGeoJson(nextDate);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [currentPoint.date, activeIndex, series, fetchMonthGeoJson]);

  // Update SVG clipPath projection coordinates on map move / zoom
  const updateClipPathCoordinates = useCallback(() => {
    const map = mapInstanceRef.current;
    const clipPathEl = clipPathElementRef.current;
    if (!map || !clipPathEl || !boundaryGeoJson) return;

    const feature = boundaryGeoJson.features?.[0];
    if (!feature || !feature.geometry) return;

    let pathString = "";
    const geomType = feature.geometry.type;
    const coords = feature.geometry.coordinates;

    const processPolygon = (rings: number[][][]) => {
      rings.forEach((ring) => {
        ring.forEach(([lon, lat], i) => {
          const pt = map.latLngToLayerPoint([lat, lon]);
          if (i === 0) pathString += ` M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
          else pathString += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
        });
        pathString += " Z";
      });
    };

    if (geomType === "Polygon") {
      processPolygon(coords);
    } else if (geomType === "MultiPolygon") {
      coords.forEach((poly: number[][][]) => processPolygon(poly));
    }

    clipPathEl.setAttribute("d", pathString);
  }, [boundaryGeoJson]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center directly on West Kalimantan, Indonesia
    const map = L.map(mapContainerRef.current, {
      center: [-0.15, 111.0],
      zoom: 6,
      minZoom: 5,
      maxZoom: 9,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom control to top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // 1. Esri World Imagery (Bright high-contrast satellite base layer)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 17,
        attribution: "Esri, Maxar, Earthstar Geographics",
      }
    ).addTo(map);

    // 2. Esri Boundaries and Places
    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 17,
        opacity: 0.95,
      }
    ).addTo(map);

    // Create a dedicated Leaflet pane for the NO2 grid cells
    const gridPane = map.createPane("no2GridPane");
    gridPane.style.zIndex = "420";
    gridPaneRef.current = gridPane;

    // Create SVG clipPath element in the grid pane
    const svgEl = gridPane.querySelector("svg");
    if (svgEl) {
      let defs = svgEl.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svgEl.insertBefore(defs, svgEl.firstChild);
      }
      let clip = defs.querySelector("#kalbar-svg-clip") as SVGClipPathElement | null;
      if (!clip) {
        clip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clip.setAttribute("id", "kalbar-svg-clip");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("id", "kalbar-clip-path");
        path.setAttribute("fill-rule", "evenodd");
        clip.appendChild(path);
        defs.appendChild(clip);
        clipPathElementRef.current = path;
      }
    }

    // City markers for spatial orientation
    const cities = [
      { name: "Pontianak", lat: -0.0263, lon: 109.3425 },
      { name: "Ketapang", lat: -1.8488, lon: 109.9722 },
      { name: "Sintang", lat: 0.0617, lon: 111.4984 },
      { name: "Singkawang", lat: 0.9071, lon: 108.9868 },
      { name: "Putussibau", lat: 0.8524, lon: 112.9298 },
    ];

    cities.forEach((c) => {
      const icon = L.divIcon({
        className: "custom-city-marker",
        html: `<div style="display:flex;align-items:center;gap:4px;">
          <div style="width:6px;height:6px;border-radius:50%;background:#FFFFFF;border:1.5px solid #000000;box-shadow:0 0 3px rgba(0,0,0,0.8);"></div>
          <span style="font-family:'DM Mono',monospace;font-size:10px;font-weight:700;color:#FFFFFF;text-shadow:0 1px 3px rgba(0,0,0,0.9);letter-spacing:0.05em;">${c.name.toUpperCase()}</span>
        </div>`,
        iconSize: [85, 20],
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

  // Update SVG clipPath when map moves or zooms
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.on("move", updateClipPathCoordinates);
    map.on("zoom", updateClipPathCoordinates);
    updateClipPathCoordinates();

    return () => {
      map.off("move", updateClipPathCoordinates);
      map.off("zoom", updateClipPathCoordinates);
    };
  }, [updateClipPathCoordinates]);

  // Apply or remove SVG clip-path style on the grid pane
  useEffect(() => {
    const gridPane = gridPaneRef.current;
    if (!gridPane) return;

    const svgG = gridPane.querySelector("svg > g") as HTMLElement | null;
    if (svgG) {
      if (clipToBoundary) {
        svgG.style.clipPath = "url(#kalbar-svg-clip)";
      } else {
        svgG.style.clipPath = "none";
      }
    }
  }, [clipToBoundary, currentGeoJson]);

  // Draw crisp cyan outer provincial boundary stroke (Rule B2)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !boundaryGeoJson) return;

    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }

    const bLayer = L.geoJSON(boundaryGeoJson, {
      style: {
        color: "#06B6D4",
        weight: 1.6,
        fill: false,
        opacity: 0.95,
        dashArray: undefined,
      },
      interactive: false,
    }).addTo(map);

    boundaryLayerRef.current = bLayer;

    return () => {
      if (boundaryLayerRef.current && map) {
        map.removeLayer(boundaryLayerRef.current);
        boundaryLayerRef.current = null;
      }
    };
  }, [boundaryGeoJson]);

  // Render 0.25° GeoJSON Grid Layer (Rule B)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !currentGeoJson) return;

    if (gridLayerRef.current) {
      map.removeLayer(gridLayerRef.current);
      gridLayerRef.current = null;
    }

    const gLayer = L.geoJSON(currentGeoJson, {
      pane: "no2GridPane",
      style: (feature) => {
        const props = (feature?.properties || {}) as GridCellProperties;
        const { fill, fillOpacity, stroke } = getNo2Color(props.no2, props.qc_pass);

        if (props.no2 === null || !props.qc_pass) {
          return {
            fillColor: "transparent",
            fillOpacity: 0,
            color: "rgba(255, 255, 255, 0.12)",
            weight: 0.7,
            dashArray: "3, 3",
          };
        }

        return {
          fillColor: fill,
          fillOpacity: smoothInterpolation ? 0.05 : fillOpacity,
          color: smoothInterpolation ? "rgba(255, 255, 255, 0.05)" : stroke,
          weight: 0.8,
        };
      },
      onEachFeature: (feature, layer) => {
        layer.on({
          mouseover: (e: L.LeafletMouseEvent) => {
            const target = e.target;
            target.setStyle({
              weight: 2.2,
              color: "#FFFFFF",
              fillOpacity: smoothInterpolation ? 0.35 : 0.95,
            });
            target.bringToFront();

            // Extract polygon center coordinates
            const coords = (feature.geometry as any).coordinates[0];
            const lons = coords.map((c: any) => c[0]);
            const lats = coords.map((c: any) => c[1]);
            const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
            const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;

            setHoveredCell({
              centerLat,
              centerLon,
              props: feature.properties as GridCellProperties,
            });
          },
          mouseout: (e: L.LeafletMouseEvent) => {
            gridLayerRef.current?.resetStyle(e.target);
            setHoveredCell(null);
          },
        });
      },
    }).addTo(map);

    gridLayerRef.current = gLayer;

    // Re-apply SVG clipPath to newly added grid pane elements
    const gridPane = gridPaneRef.current;
    if (gridPane) {
      const svgG = gridPane.querySelector("svg > g") as HTMLElement | null;
      if (svgG) {
        svgG.style.clipPath = clipToBoundary ? "url(#kalbar-svg-clip)" : "none";
      }
    }

    return () => {
      if (gridLayerRef.current && map) {
        map.removeLayer(gridLayerRef.current);
        gridLayerRef.current = null;
      }
    };
  }, [currentGeoJson, clipToBoundary, smoothInterpolation]);

  // Atmospheric Canvas Layer: Smooth Heatmap Splats & Wind Streamlines
  useEffect(() => {
    const canvas = canvasRef.current;
    const map = mapInstanceRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    // Particle streamlines setup
    const numParticles = 85;
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
      speed: 0.9 + Math.random() * 1.3,
      length: 12 + Math.random() * 16,
      age: Math.floor(Math.random() * 40),
      maxAge: 45 + Math.random() * 50,
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

    // Canvas Render Loop
    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Smooth Heatmap Splat Interpolation (when enabled)
      if (smoothInterpolation && currentGeoJson?.features) {
        ctx.save();

        // Optional boundary clipping on Canvas
        if (clipToBoundary && boundaryGeoJson?.features?.[0]) {
          const feature = boundaryGeoJson.features[0];
          ctx.beginPath();
          const processCanvasRings = (rings: number[][][]) => {
            rings.forEach((ring) => {
              ring.forEach(([lon, lat], i) => {
                const pt = map.latLngToContainerPoint([lat, lon]);
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
              });
              ctx.closePath();
            });
          };

          if (feature.geometry.type === "Polygon") {
            processCanvasRings(feature.geometry.coordinates);
          } else if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach((p: number[][][]) => processCanvasRings(p));
          }
          ctx.clip();
        }

        // Render soft Gaussian radial splat for each valid 0.25° grid cell
        const splatRadius = Math.max(28, (map.getZoom() - 4) * 16);

        currentGeoJson.features.forEach((feat: any) => {
          const props = feat.properties as GridCellProperties;
          if (props.no2 === null || !props.qc_pass) return;

          const coords = feat.geometry.coordinates[0];
          const lons = coords.map((c: any) => c[0]);
          const lats = coords.map((c: any) => c[1]);
          const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
          const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;

          const pt = map.latLngToContainerPoint([centerLat, centerLon]);
          const { fill } = getNo2Color(props.no2, props.qc_pass);

          const grad = ctx.createRadialGradient(pt.x, pt.y, splatRadius * 0.1, pt.x, pt.y, splatRadius);
          grad.addColorStop(0, fill.replace("rgb", "rgba").replace(")", ", 0.70)"));
          grad.addColorStop(0.5, fill.replace("rgb", "rgba").replace(")", ", 0.35)"));
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, splatRadius, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }

      // 2. Render Subtle Equatorial Trade Wind Streamlines
      ctx.save();
      ctx.lineWidth = 1.3;

      streamlines.forEach((p) => {
        p.age += 1;
        p.x -= p.speed * 1.3; // Drift westward
        p.y += Math.sin(p.x * 0.02) * 0.35;

        if (p.age >= p.maxAge || p.x < -30 || p.y < -30 || p.y > canvas.height + 30) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.age = 0;
          p.maxAge = 45 + Math.random() * 50;
        }

        const progress = p.age / p.maxAge;
        const opacity =
          progress < 0.25
            ? (progress / 0.25) * 0.4
            : (1 - (progress - 0.25) / 0.75) * 0.4;

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
  }, [smoothInterpolation, clipToBoundary, currentGeoJson, boundaryGeoJson]);

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
      {/* Top Glassmorphic HUD Bar: Satellite Telemetry & QC Metrics */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-[1000] max-w-xl p-3 rounded-sm bg-[rgba(11,13,16,0.90)] backdrop-blur-md border border-[rgba(255,255,255,0.15)] text-white shadow-xl pointer-events-auto space-y-2">
        <div className="flex items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.12)] pb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E4002B] animate-pulse" aria-hidden="true" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#A1A1AA]">
              WEST KALIMANTAN SATELLITE GRID (0.25° RES)
            </span>
          </div>
          {isLoadingGeoJson && (
            <span className="text-[10px] font-mono text-[#06B6D4] animate-pulse">Loading Grid...</span>
          )}
        </div>

        {/* Dynamic Monthly Telemetry Readout (Rule C) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-[#18181B] p-1.5 rounded-sm border border-[rgba(255,255,255,0.08)]">
            <div className="text-[9px] uppercase text-[#A1A1AA]">ACTIVE MONTH</div>
            <div className="font-bold text-white tracking-wider">{currentPoint.date}</div>
          </div>
          <div className="bg-[#18181B] p-1.5 rounded-sm border border-[rgba(255,255,255,0.08)]">
            <div className="text-[9px] uppercase text-[#A1A1AA]">QC AREA COVERAGE</div>
            <div className="font-bold text-white">
              {currentPoint.qcAreaPct !== undefined ? `${currentPoint.qcAreaPct.toFixed(1)}%` : "N/A"}
            </div>
          </div>
          <div className="bg-[#18181B] p-1.5 rounded-sm border border-[rgba(255,255,255,0.08)]">
            <div className="text-[9px] uppercase text-[#A1A1AA]">VALID CELLS</div>
            <div className="font-bold text-white">
              {currentPoint.validGridCount !== undefined ? `${currentPoint.validGridCount} / 246` : "246"}
            </div>
          </div>
          <div className="bg-[#18181B] p-1.5 rounded-sm border border-[rgba(255,255,255,0.08)]">
            <div className="text-[9px] uppercase text-[#A1A1AA]">MISSING DAYS</div>
            <div className="font-bold text-white">
              {currentPoint.missingUrlDays !== undefined ? `${currentPoint.missingUrlDays} days` : "0 days"}
            </div>
          </div>
        </div>

        {/* October 2010 Boundary Month Notification (Rule A) */}
        {isBoundaryMonth && (
          <div className="p-2 rounded-sm bg-[#3B1214] border border-[#DC2626] text-white flex items-start gap-2 text-[11px] leading-snug">
            <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Study Boundary Month Notice:</strong> October 2010 is a study boundary month (contains only 2010-10-31);
              no monthly QC average or spatial grid values are exported.
            </span>
          </div>
        )}

        {/* Layer & Clipping Toggles (Rule B2) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[rgba(255,255,255,0.1)] text-[11px]">
          <button
            type="button"
            onClick={() => setClipToBoundary(!clipToBoundary)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono transition-colors ${
              clipToBoundary
                ? "bg-[#15418C] border-[#06B6D4] text-white font-semibold"
                : "bg-[#18181B] border-[rgba(255,255,255,0.15)] text-[#A1A1AA] hover:text-white"
            }`}
            title="Clip edge cells to West Kalimantan administrative boundary"
          >
            <span>{clipToBoundary ? "[✓] Clip to West Kalimantan" : "[ ] Show Raw 0.25° Cells"}</span>
          </button>

          <button
            type="button"
            onClick={() => setSmoothInterpolation(!smoothInterpolation)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono transition-colors ${
              smoothInterpolation
                ? "bg-[#15418C] border-[#06B6D4] text-white font-semibold"
                : "bg-[#18181B] border-[rgba(255,255,255,0.15)] text-[#A1A1AA] hover:text-white"
            }`}
            title="Toggle between discrete vector grid cells and smooth continuous atmospheric heatmap"
          >
            <span>{smoothInterpolation ? "[✓] Smooth Heatmap" : "[ ] Discrete 0.25° Grid"}</span>
          </button>
        </div>
      </div>

      {/* Interactive Cell Inspector Floating Tooltip (Rule B3) */}
      {hoveredCell && (
        <div className="absolute top-3 right-3 z-[1000] max-w-xs p-3 rounded-sm bg-[rgba(11,13,16,0.94)] backdrop-blur-md border border-[#06B6D4] text-white shadow-2xl pointer-events-none space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.15)] pb-1">
            <span className="text-[10px] font-bold uppercase text-[#06B6D4]">CELL INSPECTOR</span>
            <span className="text-[10px] text-[#A1A1AA]">{hoveredCell.props.date}</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Center Lat/Lon:</span>
              <span className="font-bold text-white">
                {Math.abs(hoveredCell.centerLat).toFixed(3)}°{hoveredCell.centerLat >= 0 ? "N" : "S"},{" "}
                {Math.abs(hoveredCell.centerLon).toFixed(3)}°{hoveredCell.centerLon >= 0 ? "E" : "W"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">NO2 Column:</span>
              <span className="font-bold text-white">
                {hoveredCell.props.no2 !== null
                  ? `${formatScientificValue(hoveredCell.props.no2)} molecules/cm²`
                  : "No QC Data (null)"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Valid Days:</span>
              <span className="text-white">
                {hoveredCell.props.valid_days} days ({hoveredCell.props.temporal_coverage_pct.toFixed(1)}%)
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Clipped Cell Area:</span>
              <span className="text-white">{hoveredCell.props.area_km2.toFixed(1)} km²</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">QC Status:</span>
              <span className={hoveredCell.props.qc_pass ? "text-[#10B981] font-bold" : "text-[#EF4444]"}>
                {hoveredCell.props.qc_pass ? "Passed (>=20% cov)" : "Failed QC"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Map Viewport Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[450px] sm:h-[520px] lg:h-[580px] relative z-0 bg-[#0B0D10]"
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
              title="Reset to October 2010"
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
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto font-mono text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#12151B] border border-[rgba(255,255,255,0.15)]">
              <span className="text-[#A1A1AA]">DATE:</span>
              <span className="text-white font-bold tracking-wider">{currentPoint.date}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#12151B] border border-[rgba(255,255,255,0.15)]">
              <span className="text-[#A1A1AA]">{variableName} MEAN:</span>
              <span className="text-white font-bold">
                {currentPoint.value !== null
                  ? `${formatScientificValue(currentPoint.value)} ${unit}`
                  : "Boundary Month (null)"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#12151B] border border-[rgba(255,255,255,0.15)]">
              <span className="text-[#A1A1AA]">RESOLUTION:</span>
              <span className="text-white font-bold">0.25° Grid (246 cells)</span>
            </div>
          </div>
        </div>

        {/* Row 2: Interactive Timeline Scrubber Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#A1A1AA]">
            <span>OCT 2010 (START)</span>
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

        {/* Row 3: Fixed Cross-Month Physical Color Scale Legend (Rule B1) & Mandatory Disclaimer (Rule C) */}
        <div className="pt-1 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#A1A1AA]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#1D4ED8]" /> &lt; 2.5e14 (Clean Blue)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#10B981]" /> 2.5 - 5.5e14 (Teal)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#FACC15]" /> 5.5 - 9.0e14 (Amber)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#DC2626]" /> 9.0e14 - 1.4e15 (Red)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#991B1B]" /> &gt; 1.4e15 (Crimson)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs border border-dashed border-white/40" /> Null (No Data)
            </span>
          </div>

          <div
            className="w-full h-2 rounded-sm shadow-inner"
            style={{
              background:
                "linear-gradient(to right, #1D4ED8 0%, #06B6D4 18%, #10B981 38%, #FACC15 58%, #EA580C 78%, #DC2626 90%, #991B1B 100%)",
            }}
          />

          {/* Mandatory QC & Color Scale Disclaimer (Rule C) */}
          <div className="text-[10px] text-[#A1A1AA] leading-tight pt-0.5">
            <strong>Mandatory QC &amp; Color Scale Disclaimer:</strong> Exploratory QC (not final). Color scale (blue to red) represents relative tropospheric NO₂ vertical column density (molecules/cm²), NOT official ground-level air quality index (AQI) or health risk categories.
          </div>
        </div>
      </div>
    </div>
  );
};
