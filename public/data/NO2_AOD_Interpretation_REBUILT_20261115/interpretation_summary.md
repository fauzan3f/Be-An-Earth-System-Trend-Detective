# Scientific Findings Summary: West Kalimantan (NO2 and AOD)

**Analysis Period:** November 2010 to October 2026; 191 paired months with both parameters passing exploratory QC screening.

## Core Findings

**NO2 Trajectory:** Linear trend point estimate of +0.0274 × 10¹⁴ molecules/cm² per year (p = 0.663). There is insufficient statistical evidence to conclude a statistically significant long-term decadal linear trend.

**AOD Trajectory:** Linear trend estimate of -0.00315 per year (p = 0.590). Not statistically significant across the full 191-month period. On the subset with NO2 area coverage >= 30% (n = 185), the AOD slope shifts to -0.00511/year (p = 0.0134), demonstrating that long-term conclusions are sensitive to spatial observation coverage criteria.

**Atmospheric Association:** NO2 and AOD exhibit a moderate positive correlation (Pearson r = 0.417; seasonal-anomaly correlation r = 0.367). This positive co-occurrence reflects shared dry-season biomass burning emissions but does not establish direct causation. Significance tests are not adjusted for serial temporal autocorrelation.

## Methodology

Linear trend analysis uses ordinary least squares (OLS) regression with calendar-month fixed effects and 12-lag Newey-West heteroskedasticity and autocorrelation consistent (HAC) standard errors.

## Mandatory Limitations

- NO2 is computed as an area-weighted provincial mean across QC-passing grids in West Kalimantan; AOD from Giovanni is a regional bounding-box area average. Geographic averaging supports are not identical.
- NO2 spatial coverage varies substantially across months; September and October 2026 fall below 2% valid provincial area due to cloud screening.
- Quality control flags are exploratory and designed for interactive dashboard exploration rather than final Level-2 scientific validation.
- AOD does not feature per-grid spatial data in this Giovanni package. Hotspot interpretations represent exploratory screening.

## Implementation Guidelines

Display the three core finding cards, limitation caveats, and exploratory validation status in the Interpretation section. Avoid attributing ground-level AQI/ISPU classifications to tropospheric vertical column observations.
