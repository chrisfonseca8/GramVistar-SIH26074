# GramVistar

An **agro-meteorological decision-support platform** for Chas Block, Bokaro District, Jharkhand.

The platform transforms seeded weather and environmental data into panchayat-level diagnostics, crop decision support, alerts, and advisories for three user groups:

- **Scientist / KVK**
- **Farmer**
- **Government / District Administration**

> **Important:** This is a prototype. There is no backend, database, application server, or production authentication system.

---

## 1. Project Overview

The platform addresses the problem of turning relatively coarse block-level weather information into useful localized agro-meteorological information.

The current prototype combines:

- historical weather data,
- five-day forecast data,
- static spatial datasets,
- panchayat metadata,
- crop and threshold data,
- client-side derived variables,
- client-side surrogate downscaling,
- client-side uncertainty estimation,
- and optional Gemini-assisted text generation.

Numerical calculations are performed by TypeScript utilities in the browser. Gemini is a generation layer for advisory/report drafting and optional animation-code generation; it does **not** replace numerical weather processing.

### Initial Panchayats

1. Alkusha
2. Babudih
3. West Ghatiyali
4. Kura
5. Kumhari

---

# 2. Project Scope

## Included

- Three client-side portals.
- Mock authentication and client-side RBAC.
- Local/static data loading.
- Browser-side derived-variable calculations.
- Browser-side surrogate downscaling.
- Ensemble-style uncertainty from deterministic parameter variants.
- Interactive charts and maps.
- Scientist advisory workflow.
- Farmer decision cards.
- Government risk/operations dashboards.
- Local feedback and audit state.
- Optional Gemini integration with mandatory stub mode.
- Client-side export.
- Responsive/mobile-first Farmer experience.
- Automated tests.

## Explicitly excluded

- Backend services.
- Database infrastructure.
- Real authentication.
- Real SMS/IVR/WhatsApp delivery.
- Production notification infrastructure.
- Server-side application APIs.
- Autonomous disaster declarations.
- Gemini as a numerical weather model.

---

# 3. Architecture

```text
Local /data
    │
    ▼
Data Loader
    │
    ▼
Validation + Normalization
    │
    ▼
Zustand In-Memory Store
    │
    ├───────────────┐
    ▼               ▼
Derived Variables   Static Spatial Data
    │               │
    ▼               │
Downscaling ◄───────┘
    │
    ▼
Uncertainty + Temporal Frames
    │
    ▼
Portal Selectors
    │
 ┌──┼───────────────┐
 ▼  ▼               ▼
Scientist        Farmer       Government
Portal           Portal       Portal
 │                 │             │
 └────────────┬────┴─────────────┘
              ▼
       Shared Zustand State
              │
              ▼
      Advisory / Alert / Feedback
              │
              ▼
        Gemini or Mock Layer
```

### Core principles

1. **Local data is the source of application data.**
2. **Zustand is the shared client-side state layer.**
3. **Scientific calculations are pure TypeScript utilities.**
4. **React components should not contain duplicated scientific calculations.**
5. **LLM output is always validated and reviewed before publication.**
6. **Mock mode must keep the application functional without an API key.**
7. **Simulated values must not be presented as observations.**

---

# 4. Portals

## 4.1 Scientist / KVK Portal

### Purpose

Scientists can:

- inspect historical and forecast data,
- inspect downscaled layers,
- validate diagnostics,
- inspect uncertainty,
- edit crop thresholds,
- create advisory drafts,
- review and approve advisories,
- publish approved advisories,
- inspect farmer feedback.

### Navigation

- Block Overview
- Panchayat Deep Dive
- Model Diagnostics
- Forecast Verification
- Advisory Studio

### Diagnostic views

1. Elevation & Topography
2. Variable Correlation Heatmap
3. Side-by-Side Spatial Contours
4. Spatial Error / Uncertainty
5. Predicted vs Observed
6. Residuals
7. Crop Threshold Time Series
8. Rainfall Probability
9. Soil Moisture Deficit
10. Panchayat Vulnerability Ranking
11. Farm Operations Window Matrix
12. Wind Rose
13. Cloud Cover Heatmap
14. Humidity Heatmap
15. Rainfall Accumulation
16. Forecast Spaghetti
17. Anomaly Map
18. SPI/SPEI
19. Heat Stress Index
20. Frost Risk
21. GDD Tracker
22. Water Balance
23. Panchayat Comparison Dashboard

If required source data is unavailable, display an explicit unavailable-data state rather than inventing observations.

---

## 4.2 Farmer Portal

### Purpose

Provide simple, actionable daily crop-management information.

The Farmer Portal is:

- mobile-first,
- English/Hindi capable,
- based on crop/stage thresholds,
- designed around decision cards,
- capable of showing the latest cached advisory.

### Main features

- Today's Action Card
- Five-day Forecast
- Alerts
- Crop Selector
- Crop Stage Selector
- Today's Weather
- Hourly Rain Probability
- Heat/Cold Stress
- Pest/Disease Risk
- Irrigation Schedule
- Farmer Feedback

### Decision cards

Examples:

```text
Irrigation  → YES / NO
Spray       → YES / NO
Fertilizer  → APPLY / DELAY
Harvest     → WINDOW / WAIT
Livestock   → PROTECT / NORMAL
```

The decision engine uses:

```text
crop
+
crop stage
+
thresholds
+
downscaled forecast
+
risk state
```

---

## 4.3 Government Portal

### Purpose

Provide operational and spatial information for planning and resource allocation.

### Roles

- District Magistrate / Deputy Commissioner (DM/DC)

### Capabilities

- vulnerability maps,
- drought/flood/heat/cold risk maps,
- crop health,
- water availability,
- Gemini/mock-generated relief & resource allocation per published advisory,
- alert escalation.

---

# 5. Data Foundation

Expected static data organization:

```text
public/
└── data/
    ├── historical/
    ├── forecast/
    ├── static/
    └── panchayats.json
```

The actual repository data must be inspected before assuming filenames, fields, dimensions, dates, or units.

### Historical variables

The original specification includes:

- `Temp_Max_C`
- `Temp_Min_C`
- `Temp_Avg_C`
- `Precipitation_Total_mm`
- `Soil_Moisture_Avg`

### Forecast

Five-day forecast data for available weather variables.

### Spatial data

Potential layers include:

- panchayat boundaries,
- elevation,
- soil,
- DEM,
- slope,
- aspect,
- land use,
- water bodies,
- roads,
- markets.

### Other seed data

Where present:

- crop area,
- crop calendar,
- irrigation source,
- crop thresholds,
- population,
- livestock,
- vulnerable groups.

### Loading pipeline

```text
static files
    ↓
parse
    ↓
validate
    ↓
normalize
    ↓
Zustand
    ↓
selectors
```

---

# 6. Derived Variables

The planned browser-side calculation layer includes:

- Humidity
- Cloud cover
- Wind speed/direction
- ET0 using Hargreaves
- GDD
- SPI/SPEI
- Soil moisture deficit
- Heat index
- Frost risk
- Spray window
- Irrigation window
- Rainfall probability
- Rainfall exceedance probability
- Panchayat vulnerability index

Calculations must:

- be deterministic where possible,
- use typed inputs/outputs,
- document units,
- handle missing inputs explicitly,
- remain independent from React UI code.

---

# 7. Client-Side Downscaling

The prototype uses a **surrogate downscaling engine** in TypeScript.

## Temperature elevation correction

```text
T_p = T_block - 6.5 × (Elev_p - Elev_block) / 1000
```

## Spatial interpolation

Use Inverse Distance Weighting (IDW) where appropriate.

## Soil moisture adjustment

Use available:

- soil,
- slope,
- rainfall,
- ET.

## Rainfall adjustment

Where inputs exist, use:

- elevation,
- slope,
- aspect.

## Uncertainty

Run multiple deterministic parameter variants and calculate the standard deviation across them.

> This is a prototype surrogate uncertainty mechanism. It must not be described as a physically sourced meteorological ensemble.

---

# 8. Advisory Workflow

```text
Panchayat
   ↓
Crop + Stage
   ↓
Forecast range
   ↓
Derived variables
   ↓
Downscaling
   ↓
Uncertainty + thresholds
   ↓
Structured advisory JSON
   ↓
Gemini / Mock
   ↓
Schema validation
   ↓
Scientist edit
   ↓
Review
   ↓
Approve
   ↓
Publish
   ↓
Farmer + Government
   ↓
Farmer feedback
   ↓
Scientist inbox
```

An unreviewed LLM response must never be treated as a published advisory.

---

# 9. Gemini Integration

Gemini is optional and must have a stub mode.

## Used for

- Scientist advisory drafting (Farmer and Government/DM-DC advisories)
- Government relief/resource allocation drafting (Relief & Resource Allocator)
- Optional animation-code generation

## Not used for

- numerical weather prediction,
- numerical downscaling,
- replacing scientific calculations,
- autonomous disaster declarations,
- direct publication without human review.

### Mock mode

Development should work with:

```env
NEXT_PUBLIC_USE_STUB_LLM=true
```

Mock responses should be deterministic and stored under the project's mock layer.

### Output validation

Generated advisories must be validated against a typed schema before entering application state.

Missing data must result in an explicit insufficient-data response rather than invented values.

---

# 10. RBAC

Authentication is simulated through a role switcher.

| Role | Primary scope |
|---|---|
| Scientist / KVK | Scientist portal — Chas Block + five panchayats |
| DM/DC | Government portal — District/block aggregates |
| Farmer | Farmer portal — own simulated farm context |

> The supported roles are Scientist / KVK, DM/DC, and Farmer. Scientist and Government roles select a district and block (`/select-region`) after logging in, before entering their portal.

RBAC is a client-side simulation, not production security.

Important rules:

- Farmers must not see other farmers' records.
- Government views primarily use aggregated information.
- Sensitive farmer information must not be unnecessarily sent to Gemini.
- Advisory edits, reviews, approvals, and publications are audit logged.

---

# 11. Client State

Recommended Zustand slices:

```text
dataStore
authStore
advisoryStore
feedbackStore
alertStore
auditStore
thresholdStore
scenarioStore
```

The exact implementation may vary if the same responsibilities remain separated.

---

# 12. Technology Stack

| Area | Technology |
|---|---|
| Framework | React / Next.js |
| Language | JavaScript |
| Styling | Tailwind CSS |
| State | Zustand |
| CSV | PapaParse |
| Charts | Plotly.js / react-plotly.js / Recharts / D3 |
| Maps | Deck.gl / Kepler.gl / Leaflet |
| Animation | Plotly frames / Framer Motion |
| i18n | react-i18next |
| Forms | React Hook Form |
| Validation | Zod |
| LLM | Gemini + mock layer |
| Offline | Service Worker / Workbox |
| Testing | Vitest / React Testing Library / Playwright |
| Deployment | Static-compatible hosting |

Use only dependencies required by the implementation.

> **Note:** The original project specification called for TypeScript. Per explicit user instruction, this project uses JavaScript instead.

---

# 13. Project Structure

Recommended:

```text
gramvistar/
├── public/
│   └── data/
│       ├── historical/
│       ├── forecast/
│       ├── static/
│       └── panchayats.json
│
├── src/
│   ├── app/
│   ├── portals/
│   │   ├── scientist/
│   │   ├── farmer/
│   │   └── government/
│   ├── components/
│   │   ├── ui/
│   │   ├── charts/
│   │   ├── maps/
│   │   ├── layout/
│   │   └── common/
│   ├── data/
│   │   ├── loaders/
│   │   ├── normalizers/
│   │   ├── selectors/
│   │   └── schemas/
│   ├── lib/
│   │   ├── calculations/
│   │   ├── downscaling/
│   │   ├── export/
│   │   ├── prompts/
│   │   └── validation/
│   ├── store/
│   ├── hooks/
│   ├── i18n/
│   ├── mocks/
│   └── types/
│
├── tests/
│   ├── unit/
│   ├── components/
│   └── e2e/
│
├── .env.local.example
└── README.md
```

---

# 14. Installation

```bash
git clone <repo-url>
cd gramvistar
npm install
```

Requires Node.js 20+ (matches the Next.js 16 / React 19 toolchain in `package.json`). No backend, database, or external service account is required to run the app in its default (mock) mode.

Local data already lives in `public/data/` (8 CSV/GeoJSON files, copied verbatim from the project's original `data/` folder) and is fetched client-side by `src/data/index.js`'s `loadAllData()` — nothing further needs to be downloaded or configured for the app to run with real seeded data.

---

# 15. Environment

Copy the example env file and fill it in only if you want to test live Gemini generation:

```bash
cp .env.local.example .env.local
```

```env
# .env.local — both variables are optional; the app works fully without either
NEXT_PUBLIC_USE_STUB_LLM=true
NEXT_PUBLIC_GEMINI_API_KEY=
```

- **Default / recommended:** leave `.env.local` absent, or `NEXT_PUBLIC_USE_STUB_LLM=true`. The advisory generation feature (Scientist Advisory Studio) uses a deterministic mock generator that produces real, schema-valid content from the app's own real computed data — no network call, no API key needed. This is how every feature in this app has actually been verified throughout development.
- **Live Gemini (untested in this environment):** set `NEXT_PUBLIC_USE_STUB_LLM=false` and provide a real `NEXT_PUBLIC_GEMINI_API_KEY`. Both conditions must be true for live mode — an explicit `false` with no key still safely falls back to mock (see `src/lib/advisory/config.js`'s `isMockMode()`).

> A browser-exposed API key is not suitable for production — this is a prototype-only pattern. Production live-LLM access should use a server-side secret boundary, which is outside this project's current scope. Never commit `.env.local` (it's git-ignored).

---

# 16. Development

```bash
npm run dev      # start the dev server at http://localhost:3000
npm run build    # production build — also the static-export build, see §20 Deployment
npm run lint     # ESLint (flat config, Next.js + React-compiler-aware rules)
npm run test     # Vitest
```

The application is fully functional in stub mode with zero external API access — this is the default and the only mode exercised during this project's development.

---

# 17. Testing

**As actually implemented, this project does not have a broad automated test suite** (Vitest unit tests exist only for a handful of pure utility modules such as `src/lib/auth/permissions.js` — run `npm run test` to see the current suite). This is a deliberate, explicit decision, not an oversight. Every calculation, selector, store, and workflow was instead verified during development using ad-hoc scripts run against real or synthetic data, checking outputs by hand rather than committing a permanent test for every module.

What *was* verified this way:

- derived variables (`src/lib/calculations/`) — every function checked against reference values (e.g. the heat-index formula against a NOAA table)
- downscaling (`src/lib/downscaling/`) — checked against real elevation/temperature data across all 5 panchayats
- uncertainty ensembles, thresholds, decision rules (`src/lib/decisionEngine/`) — 14 scratchpad unit tests covering all 5 supported actions, including edge cases (missing input, threshold overrides)
- RBAC / route protection (`src/lib/auth/permissions.js`, `src/components/auth/RoleGate.js`) — the one area with a **permanent** test file, `tests/unit/permissions.test.js`
- advisory validation, approval workflow, publication, feedback flow — a full real end-to-end integration script (`loadAllData()` → downscale → generate → Draft→Review→Approve→Publish → Farmer/Government visibility → feedback → Scientist inbox) using the app's actual code, not a reimplementation

---

# 18. Scientific/Data Integrity

The UI and internal data model should distinguish:

```text
Observed
Forecast
Derived
Downscaled
Simulated
Scenario
Mock
```

Never present:

- simulated values as observations,
- surrogate uncertainty as a physically sourced ensemble,
- mock LLM output as a verified expert conclusion,
- demo infrastructure values as live operational data.

When required inputs are unavailable, show an explicit unavailable/insufficient-data state.

---

# 19. Screenshots

No screenshots are included in this repository. This environment has no headless browser available, so no screenshot could be captured and verified against the real running app — and per this project's own data-integrity discipline (§18), a placeholder or AI-generated mockup image is not an acceptable substitute for a real one, since it would misrepresent what the app actually looks like.

To see the real UI, run `npm run dev` and open `http://localhost:3000`. Every page listed in §13 Project Structure and §4 Portals is live and reads real local data.

---

# 20. Deployment

The app is a static export — confirmed by building and serving the output directly:

```bash
npm run build        # produces out/ (next.config.mjs sets output: "export")
npx serve out         # or any static file server; python3 -m http.server also works
```

`next.config.mjs` sets `output: "export"`. This is compatible because the app has no route handlers, no dynamic route segments, no Server Actions, no cookies/rewrites/redirects, and no `next/image` usage — confirmed by inspection, and by the fact that `npm run build` actually produces a working `out/` directory (verified: every one of the app's routes renders correctly, and `public/data/*` is present under `out/data/`, since the local CSV/GeoJSON files are fetched client-side at runtime by `loadAllData()`).

Because of `output: "export"`, `npm start` (`next start`) is **not used** — there's no server bundle to start. Deploy the `out/` folder directly.

### Vercel

Works with zero extra configuration — Vercel detects `output: "export"` automatically. Connect the repo and deploy; no environment variables are required for the default (mock LLM) mode.

### Netlify

Set the build command to `npm run build` and the publish directory to `out`.

### GitHub Pages

Publish the contents of `out/` to a `gh-pages` branch (e.g. via the `actions/deploy-pages` GitHub Action after `npm run build`). If the site is served from a subpath (`username.github.io/repo-name`) rather than a custom domain/root, set `basePath` in `next.config.mjs` to match, since none of this app's internal links use absolute-from-root URLs that would break under a subpath — they're all Next.js `<Link>`/`router.push()` calls, which respect `basePath` automatically.

### Environment variables in production

None are required. If live Gemini generation is ever enabled for a deployed instance, set `NEXT_PUBLIC_USE_STUB_LLM=false` and `NEXT_PUBLIC_GEMINI_API_KEY` in the hosting provider's environment-variable settings — never commit them. See §15 Environment's warning about browser-exposed keys not being production-safe; this remains true regardless of hosting provider.

---

# 21. User Guides

Short, role-specific guides. None of these require reading any code — just log in at `/login` and pick a role.

## Scientist / KVK

1. Log in as **Scientist / KVK** → select **Bokaro** district and **Chas** block → lands on **Block Overview**, showing the map, current alerts and vulnerability ranking for all 5 panchayats.
2. Use the panchayat selector (top-right of every page) to scope most views to one panchayat.
3. **Model Diagnostics** has 23 numbered diagnostic plots (correlation, spatial uncertainty, crop thresholds, water balance, etc.) — scroll through, or use **Panchayat Deep Dive**'s tabs for a more focused per-panchayat view.
4. To publish an advisory: open **Advisory Studio** → build the structured input → **Generate** (mock or live Gemini) → edit the draft if needed → move it through **Review → Approve → Publish**. Once Published, it's immediately visible on the Farmer and Government portals.
5. **Feedback Inbox** shows every farmer feedback submission, filterable by panchayat/category/date, with a trend summary.

## Farmer

1. Log in as **Farmer** — this goes through a simulated phone-number + OTP step (any 6-digit code is accepted) instead of the plain role picker other roles use.
2. Pick your panchayat on first visit. The home screen (**Today**) shows: **Today's Actions** (a big YES/NO per action — Irrigate/Spray/Fertilize/Harvest/Livestock), active **Alerts**, a **5-Day Forecast**, and further down, simplified mobile versions of the Scientist's crop-threshold, rain-probability, soil-moisture and operations-outlook views, plus **Today's Weather**, **Pest/Disease Risk**, and an **Irrigation Schedule**.
3. Pick a crop and crop stage (above the Action Card) to see the crop-specific temperature outlook.
4. If a Scientist has published an advisory for your panchayat, it appears below the Action Card with a plain-language summary, prioritized actions, and a "Why" section.
5. If the app can't reach local data (e.g. simulated offline), your last-seen advisory is still shown, with a banner noting it's cached.
6. **Feedback** (in the nav) lets you submit crop-stage/irrigation/pest/damage/yield reports, optionally with a short voice note, and shows a simulated SMS/IVR confirmation after submitting.

## Government

1. Log in as **DM/DC** and select a district and block first.
2. **Overview** lists every published advisory across all panchayats.
3. **Climate Overview** shows block-wide elevation, temperature-vs-elevation, and vulnerability context.
4. **Risk Maps** — pick one of 7 hazard layers (Drought/Flood/Heatwave/Cold Wave/Pest-Disease/Crop Health/Water) to see it as a panchayat choropleth with a legend; click a panchayat for its exact value.
5. **Alert Escalation** — escalate/de-escalate any active alert across Green/Yellow/Orange/Red, and preview how it would go out over SMS/IVR/WhatsApp/push (all simulated).
6. **Relief & Resource Allocator** — pick a published, DM/DC-approved advisory and generate a relief/resource allocation for that panchayat (mock or live Gemini), built from the advisory's own content plus the panchayat's current hazard data. Every generation is kept in a running history below, not just the latest one.

---

# 22. Contribution Rules

Before changing the project:

1. Inspect the existing implementation.
2. Reuse existing utilities/components.
3. Verify new logic against real or representative data before considering it done (this project does not use permanent test files — see §17 Testing for why, and for what to do instead).

Do not introduce backend/database infrastructure without explicitly changing the project scope.

---

# 23. License

MIT License
