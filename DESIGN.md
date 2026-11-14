# DESIGN SYSTEM & ARCHITECTURE : NASA EARTH SYSTEM TREND DETECTIVE

## Concept Card
- **Idea:** An authentic, high-impact NASA mission portal combining strict monochrome typography discipline with a real-time Windy.com-inspired atmospheric satellite visualizer for West Kalimantan.
- **Metaphor:** NASA Mission Operations Console meets scientific satellite Earth Observatory telemetry.
- **Signature Moment:** The Windy.com-style West Kalimantan Satellite Atmospheric Visualizer featuring real satellite imagery tiles, animated drifting atmospheric particle currents, dynamic plume heating (cool cyan -> warm amber -> intense crimson smoke) synchronized dynamically with 190 monthly observation records, and a bottom timeline player HUD.

## Color Discipline (Strict NASA.gov Monochrome)
- **Dark Canvas (Nav, Hero, Satellite Map, Footer):**
  - Background: `#000000` (Pure Black) and `#0B0D10` (Deep Space Charcoal)
  - Surface Card: `#12151B` with `border: 1px solid rgba(255, 255, 255, 0.12)`
  - Primary Text: `#FFFFFF` (Pure White)
  - Secondary Text: `#A1A1AA` (Neutral Zinc)
- **Light Editorial Canvas (Sections 2 to 6 Content & Charts):**
  - Background: `#FFFFFF` (Pure White) and `#F6F6F6` (Warm Editorial Gray)
  - Primary Text & Numbers: `#1B1B1B` (NASA Charcoal Black) - NO rainbow text
  - Secondary / Monospace Labels: `#58585B` (Neutral Slate Gray)
  - Borders: `1px solid #E5E7EB`
- **Restrained NASA Accents:**
  - NASA Crimson Red: `#E4002B` (Hover: `#B80022`) for primary CTA, active timeline playhead, and small circular arrow icons (`●`)
  - NASA Deep Blue: `#15418C` for telemetry band and `#1967D2` for chart lines

## Motion Choreography
- Scroll-triggered reveal: Smooth staggered fade-up (`translateY(16px -> 0)` with opacity transition)
- Telemetry count-up simulation on mount
- Interactive Windy.com timeline player (play/pause, timeline scrubber, month callout, synced chart indicator)
- Satellite plume canvas animation with drifting streamline particles across the West Kalimantan coordinates (108°E-114°E, 3.5°S-2.5°N)
