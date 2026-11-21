# Earth System Trend Detective

> **2026 NASA Space Apps Challenge - Bandung**  
> **Team:** Taras, Fauzan, Fauzil  
> **Presentation Deck:** [`Earth System Trend Detective - NASA Space Apps Bandung 2026 - Pengen Menang.pdf`](./Earth%20System%20Trend%20Detective%20-%20NASA%20Space%20Apps%20Bandung%202026%20-%20Pengen%20Menang.pdf)  
> *Explore. Detect. Understand Multi-Decadal Earth System Trends.*

An interactive, data-driven Earth Observation web platform designed to investigate multi-decadal atmospheric trends across **West Kalimantan, Indonesia (108.5°E–113.5°E, 3.5°S–2.5°N)** across **16 years (193 months: October 2010 to October 2026)**.

The platform integrates multi-mission Level-3 satellite records from **NASA Aura OMI** and **NASA Terra MODIS** with rigorous econometric and non-parametric statistical modeling (**OLS with Month Fixed Effects & Newey-West HAC 12-lag standard errors, Seasonal Mann-Kendall, and Sen's slope**). It separates secular multi-year environmental shifts from seasonal oscillations and episodic wildfire surges, adhering strictly to the **NASA Web Design System (Horizon / Earthdata)**.

---

## Live Demo & Guided Journey

The application is structured as a 6-step guided scientific workflow:

1. **Step 01 / Welcome Hero & Telemetry Strip:** Project scope, mission goals, satellite data provenance, and quick navigation.
2. **Step 02 / Study Area & Atmospheric Map:** Interactive geospatial domain overview featuring a Windy-style satellite particle visualizer, range slicers (2010–2026), and spatial coverage screening.
3. **Step 03 / NO₂ Explorer:** Tropospheric nitrogen dioxide vertical column density ($0.25^\circ \times 0.25^\circ$ gridded, $\text{molecules/cm}^2$), monthly/daily view toggle (5,817 daily records), QC area coverage audit, and Sen's slope regression.
4. **Step 04 / AOD Explorer:** Aerosol Optical Depth at 550 nm from NASA Giovanni, documenting seasonal burning cycles and catastrophic El Niño events (2015 Super El Niño and 2019 IOD).
5. **Step 05 / Trend Comparison:** Normalized multi-sensor matrix, cross-variable correlation analysis (Pearson $r = +0.417$, seasonal-anomaly $r = +0.367$), and atmospheric co-occurrence mechanisms.
6. **Step 06 / Scientific Interpretation & Decision Support:**
   - **Core Quantitative Cards:** Explicit $p$-values, confidence intervals, and statistical significance status.
   - **Executive / PM Summary Drawer:** Expandable synthesis tailored for policymakers with direct Markdown download.
   - **Sensitivity Analysis Panel:** Evaluation of spatial coverage criteria ($n = 191$ vs. area $\ge 30\%$ $n = 185$).
   - **Spatial Analysis & Candidate Hotspot Insights:** Validation across all 246 grid cells, candidate elevated $\text{NO}_2$ cluster ($0.375^\circ\text{N}–0.625^\circ\text{N}, 110.125^\circ\text{E}–110.625^\circ\text{E}$), and monthly cross-grid heterogeneity charts.
   - **Interactive Statistical Table:** 17 econometric model specifications with filter tabs (All, Trends, Correlations) and CSV download.

---

## Core Scientific Findings (2010–2026)

| Parameter | Variable 1: Tropospheric NO₂ | Variable 2: Aerosol Optical Depth (AOD) |
|---|---|---|
| **Satellite Mission** | NASA Aura (Ozone Monitoring Instrument - OMI) | NASA Terra (MODIS / GES DISC Giovanni) |
| **Product & Sensor** | `OMNO2d v004` (0.25° Gridded, Area-Weighted Mean) | `MOD08_D3 6.1` (AOD 550 nm, Regional Bounding Box) |
| **Physical Unit** | $\text{molecules/cm}^2$ | Dimensionless Optical Extinction ($0.0 - 5.0$) |
| **Analyzed Months** | 193 total study months (191 paired valid QC months) | 191 paired valid QC months |
| **Decadal Slope** | **$+0.0274 \times 10^{14}\text{ molecules/cm}^2/\text{yr}$** | **$-0.00315/\text{yr}$** |
| **$p$-Value (HAC 12-lag)** | **$p = 0.6630$** (Not Statistically Significant) | **$p = 0.5901$** (Not Statistically Significant) |
| **95% Confidence Interval**| $[-0.096, +0.151] \times 10^{14}\text{ molecules/cm}^2/\text{yr}$ | $[-0.0146, +0.0083]/\text{yr}$ |
| **Sensitivity Shift** | Stable under cloud screening variations | Shifts to **$-0.00511/\text{yr}$ ($p = 0.0134^*$)** on $\ge 30\%$ area |
| **Cross-Correlation** | **Pearson $r = +0.417$** ($p = 1.95 \times 10^{-9}$), **Seasonal Anomaly $r = +0.367$** ($p = 1.71 \times 10^{-7}$) |
| **Primary Drivers** | Biomass burning emissions, transport, clearing | Peat fire smoke, regional haze, El Niño droughts |

### Spatial Grid Validation Highlights:
- **Total Provincial Cells:** 246 cells of $0.25^\circ \times 0.25^\circ$ intersecting West Kalimantan ($147,307\text{ km}^2$).
- **High-Reliability Cells ($\ge 80\%$ Coverage):** **210 of 246 cells (85.4%)** meet the long-term temporal threshold ($\ge 154$ valid months).
- **Candidate Elevated $\text{NO}_2$ Cluster:** Concentrated around **$0.375^\circ\text{N}–0.625^\circ\text{N}$ and $110.125^\circ\text{E}–110.625^\circ\text{E}$** with long-term mean $\text{NO}_2$ reaching **$1.18 - 1.26 \times 10^{15}\text{ molecules/cm}^2$** with persistent $84.4\% - 93.2\%$ observation coverage.

---

## Scientific Guardrails & Data Limitations

1. **Satellite Column Density $\neq$ Ground-Level AQI/ISPU:**  
   Tropospheric vertical column density ($\text{molecules/cm}^2$) and columnar aerosol extinction (AOD) integrate the entire vertical atmospheric layer. They must NOT be interpreted as official ground-level ambient air quality standards (AQI or Indonesian ISPU).
2. **Spatial Support Boundary Separation:**  
   $\text{NO}_2$ is calculated as an area-weighted provincial mean of $0.25^\circ$ grids intersecting West Kalimantan. AOD is a regional bounding-box area average ($108.5^\circ\text{E}–113.5^\circ\text{E}, 3.5^\circ\text{S}–2.5^\circ\text{N}$). Geographic supports are not identical.
3. **Tropical Cloud Screening Dynamics:**  
   Satellite spatial coverage varies significantly due to equatorial convective clouds. Severe dips (e.g., September-October 2026 dropping to 6-9 valid cells, $\approx 2.0\%$ area) reflect optical cloud obscuration.
4. **Strict `null` Data Hygiene:**  
   Missing observations (e.g., October 2010 boundary month and October 2022 exploratory QC fail) are strictly treated as `null` with line breaks on charts, never converted to `0`.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NASA EARTHDATA & HORIZON DESIGN SYSTEM                   │
│         Tailwind CSS • Pure Black #000000 • Editorial Canvas #F6F6F6         │
├─────────────────────────────────────────────────────────────────────────────┤
│                          PRESENTATION LAYER (React 19)                      │
│   StickyStepperNav • WelcomeHero • StudyOverview • NO2Explorer • AODExplorer │
│       TrendComparison • InterpretationSection • SpatialAnalysisInsights     │
├─────────────────────────────────────────────────────────────────────────────┤
│                    COMPUTATION & VISUALIZATION ENGINES                      │
│   • Chart.js & React-Chartjs-2 (Dual-Axis Time Series, Regression Bands)    │
│   • Leaflet & Turf.js (0.25° Grid GeoJSON Heatmap, Windy Plume Animation)   │
│   • Client-Side Statistics Engine (Seasonal Mann-Kendall, Sen's Slope, HAC) │
├─────────────────────────────────────────────────────────────────────────────┤
│                     DATA INGESTION & RESILIENT STORAGE                      │
│   • Primary: Asynchronous HTTP Fetch (/public/data/)                        │
│   • Resilience: Zero-Latency Bundled In-Memory Fallbacks (?raw & JSON)      │
│   • PapaParse Engine (Type Coercion & Strict Null Validation)               │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Framework:** React 19 (SPA) with TypeScript (~7.0.2 strict mode)
- **Bundler:** Vite 8 (ES modules, Rollup code splitting, production minification)
- **Styling:** Tailwind CSS 3.4
- **Charts:** Chart.js 4.6 + React-Chartjs-2 5.3
- **Maps:** Leaflet 1.9 + Turf.js 7.4
- **Parsing:** PapaParse 5.7
- **Icons:** Lucide React 1.72

---

## Project Structure

```
├── AOD.csv                                  # Raw Giovanni MODIS AOD time-series data
├── data_no2.csv                             # Raw OMI NO2 time-series data
├── Earth System Trend Detective - NASA Space Apps Bandung 2026 - Pengen Menang.pdf
├── index.html                               # HTML entry with custom NASA favicon & fonts
├── public/
│   ├── favicon.png                          # Custom high-resolution brand favicon & logo
│   └── data/
│       ├── fullstack/                       # NO2 193-month package & 0.25° GeoJSON grids
│       ├── aod_fullstack/                   # Giovanni MOD08_D3 193-month AOD package
│       ├── comparison/                      # Paired NO2 vs AOD comparison records
│       ├── scientific_analysis/             # Statistical analysis CSV & findings JSON
│       ├── interpretation/                  # Interpretation narrative JSON & summary MD
│       └── spatial_analysis/                # 246-grid summaries, coverage, monthly stats
├── src/
│   ├── components/
│   │   ├── sections/                        # 6 Guided Journey Core Sections
│   │   │   ├── WelcomeSection.tsx
│   │   │   ├── StudyOverviewSection.tsx
│   │   │   ├── No2ExplorerSection.tsx
│   │   │   ├── AodExplorerSection.tsx
│   │   │   ├── TrendComparisonSectionRefactored.tsx
│   │   │   ├── InterpretationSection.tsx
│   │   │   └── SpatialAnalysisInsights.tsx  # 246-grid validation & candidate hotspot table
│   │   ├── StickyStepperNav.tsx             # Fixed NASA Earthdata progress navigation
│   │   ├── TimeSeriesChart.tsx              # Chart.js time-series renderer
│   │   ├── WindyPollutionMap.tsx            # Leaflet + GeoJSON satellite map visualizer
│   │   ├── GlossaryModal.tsx                # Scientific terms modal
│   │   └── UploadModal.tsx                  # Researcher dataset import utility
│   ├── services/
│   │   └── dataLoader.ts                    # Resilient data loader & parser pipeline
│   ├── utils/
│   │   ├── statistics.ts                    # Sen's slope, Mann-Kendall & HAC calculation
│   │   └── formatters.ts                    # Atmospheric scientific notation formatters
│   ├── types/
│   │   └── index.ts                         # Strict TypeScript contracts & schemas
│   ├── App.tsx                              # Main application orchestrator
│   └── main.tsx                             # React 19 bootstrap entry
└── tailwind.config.js
```

---

## Getting Started

### Prerequisites
- **Node.js:** v18.0.0 or higher recommended
- **Package Manager:** npm (v9+) or yarn

### Installation & Execution

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fauzan3f/Be-An-Earth-System-Trend-Detective.git
   cd Be-An-Earth-System-Trend-Detective
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/`.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build locally:**
   ```bash
   npm run preview
   ```
   Preview runs at `http://localhost:4173/` (or the port specified in terminal output).

---

## Team & Presentation

- **Event:** NASA International Space Apps Challenge 2026 - Bandung
- **Team Name:** Pengen Menang
- **Members:**
  - **Taras** (Mission Background, Remote Sensing Domain & Real-World Impact)
  - **Fauzan** (UI/UX Architecture, Live Interactive Demo & Visualization Engineering)
  - **Fauzil** (Econometric Modeling, Spatial Grid Analysis & Atmospheric Chemistry)
- **Slide Deck:** Available in repository root: [`Earth System Trend Detective - NASA Space Apps Bandung 2026 - Pengen Menang.pdf`](./Earth%20System%20Trend%20Detective%20-%20NASA%20Space%20Apps%20Bandung%202026%20-%20Pengen%20Menang.pdf)

---

## Open Science & Data Attribution

- **NASA Aura OMI Team:** Tropospheric $\text{NO}_2$ product (`OMNO2d v004`), NASA Goddard Space Flight Center.
- **NASA Terra MODIS Team:** Aerosol Optical Depth product (`MOD08_D3 Collection 6.1`), NASA GSFC.
- **NASA GES DISC Giovanni:** Goddard Earth Sciences Data and Information Services Center for web-based time-series extraction and spatial data services.
- **License:** Open Source under the MIT License for Open Science and Climate Research.
