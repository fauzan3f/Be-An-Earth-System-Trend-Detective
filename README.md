# Earth System Trend Detective

> **2026 NASA Space Apps Challenge Project**  
> *Explore. Detect. Understand Earth System Trends.*

An interactive, data-driven scientific web application designed to investigate multi-decadal atmospheric trends across **West Kalimantan, Indonesia (108°E–114°E, 3.5°S–2.5°N)** from **2010 to 2026**.

The platform couples real Level-3 satellite records from **NASA Aura/OMI** and **NASA Terra/Aqua MODIS** with non-parametric statistical testing (**Seasonal Mann-Kendall and Sen's slope**) to differentiate genuine multi-year environmental shifts from seasonal oscillations and episodic wildfire surges.

---

## Key Features

1. **6-Section Guided Journey:**
   - **1. Welcome Hero:** Project scope, core scientific pillars, and quick start.
   - **2. Study Overview:** Geographic bounding box, interactive analysis period slider (2010–2026 default), and data quality filters (excluding partial edge months where `valid_days < 5`).
   - **3. NO₂ Explorer:** Tropospheric nitrogen dioxide (`molecules/cm²`) time series, Sen's slope trendline, and an interactive toggle between monthly means and 5,817 daily observations.
   - **4. AOD Explorer:** Aerosol Optical Depth (550 nm) time series capturing seasonal peaks and the historic 2015/2019 El Niño peat wildfire crises.
   - **5. Trend Comparison:** Side-by-side scientific comparison matrix, synthesis insight, and the critical scientific guardrail notice.
   - **6. Insights & Interpretation:** Answers to the 4 core NASA Detective questions, educational guide to statistical metrics, scientific limitations, and NASA Giovanni export utilities.
2. **Sticky Stepper Navigation:** Top-mounted progress header tracking user scroll position with direct anchor jumps.
3. **Dynamic Statistical Engine:** Computes Sen's slope, Mann-Kendall test statistic $S$, variance $\text{Var}(S)$, $Z$-score, 2-tailed $p$-value, and 95% Confidence Intervals live on every date slice or user data upload.
4. **Role 1 Ingestion Modal:** Allows researchers to upload or drop custom CSV/JSON datasets to instantly test new models without code edits.

---

## Atmospheric Datasets & Methodology

| Parameter | Variable 1: NO₂ | Variable 2: AOD |
|---|---|---|
| **Instrument** | NASA Aura / Ozone Monitoring Instrument (OMI) | NASA Terra & Aqua / MODIS |
| **Product** | `OMNO2d v004` Daily Level-3 0.25° Gridded | `MYD08_M3 / MOD08_M3` Monthly Level-3 1.0° |
| **Measurement** | Tropospheric Column Density | Aerosol Optical Depth at 550 nm |
| **Physical Unit** | $\text{molecules/cm}^2$ | Dimensionless (Optical Thickness) |
| **Statistical Method** | Seasonal Mann-Kendall + Sen's Slope | Seasonal Mann-Kendall + Sen's Slope |
| **Primary Drivers** | Fossil fuel combustion, diesel machinery, transport, and clearing fires | Peatland wildfire smoke, regional haze transport, El Niño droughts |

---

## Scientific Guardrail Notice

> **Important Methodological Note:** NO₂ and AOD are analyzed separately. Their raw values are never directly compared on the same numerical scale because they measure different physical atmospheric properties and use different units ($\text{molecules/cm}^2$ vs. dimensionless optical thickness). Similar trend directions do not imply direct causation.

---

## Tech Stack

- **Framework:** React 19 (Vite + TypeScript)
- **Styling:** Tailwind CSS (NASA Earth Observatory Dark/Slate Theme)
- **Charts:** Chart.js (`react-chartjs-2`) with custom scientific notation tooltips and missing-data gap handling
- **Data Parsing:** `papaparse` for real-time CSV ingestion and export
- **Icons:** `lucide-react`

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Local Development

```bash
# Clone the repository
git clone https://github.com/fauzan3f/Be-An-Earth-System-Trend-Detective.git
cd Be-An-Earth-System-Trend-Detective

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
├── public/
│   └── data/
│       ├── no2_monthly_clean.csv      # Real NASA OMI monthly cleaned dataset
│       ├── no2_daily_clean.csv        # Real NASA OMI daily observations (5,817 rows)
│       └── aod_west_kalimantan_2010_2025.csv
├── src/
│   ├── components/
│   │   ├── sections/                  # 6 Guided Journey Sections
│   │   │   ├── WelcomeSection.tsx
│   │   │   ├── StudyOverviewSection.tsx
│   │   │   ├── No2ExplorerSection.tsx
│   │   │   ├── AodExplorerSection.tsx
│   │   │   ├── TrendComparisonSectionRefactored.tsx
│   │   │   └── InterpretationSection.tsx
│   │   ├── StickyStepperNav.tsx       # Sticky top stepper navigation
│   │   ├── TimeSeriesChart.tsx        # High-performance Chart.js component
│   │   ├── VariableSummaryCard.tsx    # Statistical metrics card
│   │   ├── GlossaryModal.tsx          # Interactive scientific glossary
│   │   └── UploadModal.tsx            # Role 1 data upload & validation modal
│   ├── data/                          # Bundled offline fallback datasets
│   ├── services/
│   │   └── dataLoader.ts              # Fetch, parsing, and export module
│   ├── utils/
│   │   ├── statistics.ts              # Sen's slope & Mann-Kendall engine
│   │   └── formatters.ts              # Scientific notation formatting
│   ├── types/
│   │   └── index.ts                   # Role 1 <-> Role 2 Data Contracts
│   ├── App.tsx
│   └── main.tsx
└── tailwind.config.js
```

---

## License & Attribution

Developed for the **2026 NASA Space Apps Challenge**. Satellite data provided courtesy of NASA Goddard Earth Sciences Data and Information Services Center (GES DISC) and the NASA Giovanni system.
