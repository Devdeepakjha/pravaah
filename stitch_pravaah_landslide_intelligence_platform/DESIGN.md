---
name: Scientific Geohazard Intelligence
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0d1c2e'
  on-tertiary-container: '#77859a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#d5e3fc'
  tertiary-fixed-dim: '#b9c7df'
  on-tertiary-fixed: '#0d1c2e'
  on-tertiary-fixed-variant: '#3a485b'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  metric-stat:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  gutter-desktop: 1rem
  panel-padding: 0.875rem
---

## Brand & Style

The design system establishes a high-integrity, authoritative, and scientifically grounded interface tailored for emergency managers, GIS hydrologists, district collectors, and field responders operating across vulnerable topographies.

The visual direction rejects superficial tech clichés—foregoing dystopian dark modes, artificial neon halos, and cybernetic ornamentation. Instead, it embodies the disciplined clarity of premier earth-observation systems (Copernicus, USGS, NDMA). 

- **Core Aesthetic:** Scientific Minimalism married with Modern GIS utility. Crisp micro-metrics, tabular density, spatial clarity, and structural restraint.
- **Personality:** Decisive, vigilant, calm under crisis, unassailable, and institutional.
- **Emotional Response:** Inspires rapid situational comprehension, cognitive calm during high-stress disaster response, and immediate operational trust.

## Colors

The foundation is built upon an unyielding, high-clarity slate and zinc palette. Pure white surface containers float subtly over neutral slate wash foundations to preserve spatial context without visual fatigue over long monitoring shifts.

### Severity & Risk Matrix Tokens
Color in this system is strictly semantic and functional—never decorative. Risk colors adhere to international civil defense standards:
- **Low Risk (Normal / Monitored):** `#10B981` (Emerald). Signals baseline geological stability and routine telemetry.
- **Moderate Risk (Advisory / Watch):** `#F59E0B` (Amber). Signals accelerated soil moisture, seismic micro-tremors, or prolonged precipitation.
- **High Risk (Warning / Action):** `#F97316` (Orange). Indicates high probability of slope failure within 6–12 hours; triggers emergency alert drafts.
- **Critical Risk (Imminent Threat / Evacuate):** `#EF4444` (Crimson). Indicates active deformation or breach threshold; demands immediate field evacuation and real-time incident commands.

### Functional Roles
- **Primary (`#0F172A`):** Deep Slate. Commands primary structural elements, high-order typography, high-priority icons, and critical boundaries.
- **Secondary (`#0284C7`):** Hydro Blue. Designates sensor telemetry, active satellite passes, water flow vectors, and spatial interaction states.
- **Tertiary (`#475569`):** Slate Neutral. For tertiary actions, metadata indicators, secondary labels, and coordinate displays.
- **Neutral Surface Tier:**
  - Base canvas: `#F8FAFC`
  - Map overlay container: `#FFFFFF`
  - Subtle divider / border line: `#E2E8F0`
  - Selected row / interactive hover: `#F1F5F9`

## Typography

The typographical structure utilizes `Inter` for interface prose and operational headings due to its neutral optical geometry and superior legibility at small scale. To reinforce institutional scientific rigor, `JetBrains Mono` is enforced across all tabular figures, GPS coordinates, elevation figures, timestamp strings, telemetry readings, and sensor identifiers.

- **Tabular Figures:** Always apply `font-variant-numeric: tabular-nums` to `Inter` when handling numbers outside of `JetBrains Mono` to prevent layout reflow during real-time updates.
- **Hierarchy Rules:** Large visual headlines are strictly capped at 32px on desktop to ensure optimal vertical space for multi-panel GIS dashboards. On mobile viewports, metric titles scale down proportionally while maintaining strict baseline alignment.

## Layout & Spacing

The layout is built for high information density, prioritizing uninhibited cartographic viewing and immediate access to analytical sidebars.

- **Grid Architecture:** A dense, fluid-dock layout. The central viewport is dedicated to the map canvasing engine, flanked by collapsible analytic docks (280px to 380px fixed width).
- **Rhythm:** An ultra-disciplined 4px sub-grid with an 8px primary step. Densely packed data widgets use `space-xs` and `space-sm` for metric-label groupings to maximize data density per screen inch.
- **Responsive Adaptations:**
  - **Desktop (>1280px):** Multi-pane split screen. Full telemetry dock on the right, hierarchical region-tree on the left, floating HUD status bar along the top.
  - **Tablet (768px – 1279px):** Auto-collapsing lateral drawers. Telemetry converts to slide-over bottom sheets.
  - **Mobile (<767px):** Single-column stacked mode. Map maintains priority with a bottom-anchored, swipeable incident queue and priority emergency action banner.

## Elevation & Depth

This system avoids expressive blur or dramatic theatrical drop-shadows. Elevation is achieved through **low-contrast outlines** paired with **micro-ambient containment**.

- **Surface Layers:**
  - **Layer 0 (Canvas):** Base background `#F8FAFC` and active raster/vector GIS canvas.
  - **Layer 1 (Panels & Docks):** Solid `#FFFFFF` surfaces with a 1px structural border of `#E2E8F0`.
  - **Layer 2 (Floating Map Controls & Popovers):** Solid `#FFFFFF` with a 1px `#CBD5E1` border and an ultra-subtle ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)`.
  - **Layer 3 (Modal Alerts & Emergency Dialogs):** `#FFFFFF` anchored over a backdrop tint of `#0F172A` at 40% opacity. Border: 1px solid `#94A3B8`. Shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.12)`.

## Shapes

The design system implements a **Soft (Level 1)** geometric standard. Sharp technical precision is balanced by restrained corner softening, conveying technical precision rather than playfulness.

- **Controls & Micro-elements:** 4px (`0.25rem`) radius across buttons, chips, tags, inputs, and segmented controls.
- **Cards & Surface Modules:** 6px to 8px (`0.375rem` to `0.5rem`) radius for containment panels and floating GIS HUD cards.
- **Strict Prohibition:** Full pill buttons (`rounded-full`) are strictly forbidden except for circular map-zoom action triggers and status ping dots.

## Components

### Buttons
- **Primary:** Solid `#0F172A` background, white text, 1px `#0F172A` border. Focus rings use `#0284C7` with a 2px offset.
- **Destructive/Emergency:** Solid `#EF4444` background with crisp white text. Reserved exclusively for alert broadcasts and emergency evacuation triggers.
- **GIS Floating Buttons:** 32x32px or 36x36px square units, `#FFFFFF` background, 1px `#E2E8F0` border, `#0F172A` icon color. Active states turn `#F1F5F9` with a `#0284C7` icon tone.

### Chips & Micro-Badges
- Compact indicators formatted in uppercase `JetBrains Mono` (`label-sm`).
- **Low Risk:** `#ECFDF5` background, `#065F46` text, `#A7F3D0` border.
- **Moderate Risk:** `#FFFBEB` background, `#92400E` text, `#FDE68A` border.
- **High Risk:** `#FFF7ED` background, `#9A3412` text, `#FED7AA` border.
- **Critical Risk:** `#FEF2F2` background, `#991B1B` text, `#FECACA` border, accompanied by a solid 6px `#EF4444` pulse dot.

### Tables & Sensor Feeds
- Compact row height (36px–40px), crisp 1px `#F1F5F9` row dividers.
- Numeric columns are strictly right-aligned using `JetBrains Mono`.
- Hover row state: `#F8FAFC`. Selected row: `#F1F5F9` with a 2px left border in `#0284C7`.

### Input Fields & Selectors
- Background: `#FFFFFF`, border: 1px `#CBD5E1`, text: `#0F172A`.
- Height: 32px (dense desktop standard) or 36px.
- Focus state: Border `#0284C7`, no heavy glow; 1px outer ring in `#BAE6FD`.

### Specialized Domain Components
- **GIS Layer Switcher:** Compact vertical stack with checkbox list, opacity slider (4px track with micro-thumb), and an active colored swatch indicating the visual dataset (e.g., InSAR displacement, slope saturation, rainfall radar).
- **Incident Summary Strip:** Fixed high-contrast status banner docked at the map header displaying aggregate counts: `CRITICAL: 2 | HIGH: 5 | MONITORING: 14 | SENSORS ONLINE: 98.4%`.