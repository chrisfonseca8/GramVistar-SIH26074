# Chas Block Agro-Meteorological Advisory Platform
## `tasks.md` — Claude Code Implementation Plan

> **Purpose:** This file is the implementation contract for Claude Code. Work through the tasks in order. Do not redesign the architecture unless a task explicitly requires it or the existing repository makes the stated approach impossible.

---

# 1. Project Scope

Build a **frontend-only Chas Block Agro-Meteorological Advisory Platform**.

The application has three main portals:

1. **Scientist / KVK Portal**
2. **Farmer Portal**
3. **Government Portal**

The application is a browser-side simulation/demo using seeded local data.

## 1.1 Hard constraints

- No backend.
- No database.
- No application server.
- No runtime CRUD API for application data.
- All application data must originate from the repository's local `/data` directory or deterministic mock/seed generators.
- Load and normalize data into browser memory.
- Use Zustand for shared client-side state.
- Use `localStorage` only where simulated persistence is required.
- RBAC is simulated client-side.
- Authentication is simulated.
- External communication such as SMS, IVR, WhatsApp and push notifications is preview/simulation only.
- Claude is optional and must have a mock/stub mode.
- Charts and maps render client-side.
- Do not introduce a backend merely to make a frontend feature easier.

## 1.2 Existing data

The original data specification identifies:

```text
/data/historical/*.csv
/data/forecast/*.csv
/data/static/*.geojson
/data/panchayats.json
```

Historical variables include:

- `Temp_Max_C`
- `Temp_Min_C`
- `Temp_Avg_C`
- `Precipitation_Total_mm`
- `Soil_Moisture_Avg`
- daily observations

Forecast data covers the next five days.

Static spatial data includes:

- Panchayat boundaries
- Elevation
- Soil
- DEM
- Land use

Panchayats:

- Alkusha
- Babudih
- West Ghatiyali
- Kura
- Kumhari

**Important:** Inspect the actual repository data before implementing assumptions about fields, units, dates, geometry or dimensions.

---

# 2. Claude Code Rules

These rules apply to every task.

## 2.1 Inspect before changing

Before implementing a task:

1. Inspect the existing repository.
2. Inspect existing files related to the task.
3. Reuse working code where possible.
4. Do not overwrite existing functionality unnecessarily.
5. Do not create duplicate utilities/components when an equivalent already exists.

## 2.2 Stay within scope

If a task says UI-only, implement UI-only.

If a feature normally requires a backend, simulate it with seeded data/state.

Do not silently add:

- Express
- FastAPI
- database drivers
- server routes
- authentication servers
- cloud databases
- unnecessary API endpoints

## 2.3 Preserve data provenance

Do not fabricate scientific observations and present them as real observations.

When a value is derived or simulated, make that distinction clear in the code/data model/UI where appropriate.

For example:

```text
Observed
Forecast
Derived
Simulated
Scenario
```

## 2.4 Scientific formulas

Do not silently change formulas specified in this document.

If an existing implementation conflicts with the task specification:

1. identify the conflict,
2. preserve the task specification,
3. document the issue,
4. ask for clarification only if implementation cannot safely continue.

## 2.5 UI behavior

Every visible interactive control must work.

A button must:

- perform an action,
- change state,
- navigate,
- open a modal,
- export/download something,
- or explicitly indicate that the action is simulated.

Do not leave dead buttons.

## 2.6 Task completion

A task is complete only when:

- implementation exists,
- relevant data is connected,
- UI works,
- loading/error/empty states are handled where relevant,
- TypeScript/build checks pass,
- no unintended backend dependency was introduced,
- the task's acceptance criteria are satisfied.

## 2.7 Commits

Use task IDs in commit messages.

Examples:

```text
feat(1.1): initialize frontend architecture
feat(2.2): implement client-side downscaling
feat(5.4): add advisory approval workflow
fix(7.5): correct irrigation decision rule
```

---

# 3. Target Architecture

Use a structure compatible with the existing project. Do not force an unnecessary migration if the repository already has a working structure.

Recommended organization:

```text
data/
  historical/
  forecast/
  static/
  panchayats.json

src/
  components/
    ui/
    charts/
    maps/
    layout/
    advisory/
    common/

  data/
    loaders/
    normalizers/
    selectors/
    schemas/

  hooks/

  i18n/

  lib/
    calculations/
    downscaling/
    export/
    prompts/
    validation/

  mocks/

  portals/
    scientist/
    farmer/
    government/

  store/

  types/

tests/
  unit/
  components/
  e2e/

CLAUDE.md
README.md
tasks.md
progress.md
```

The exact framework remains the repository's chosen React/Next.js setup.

---

# 4. Shared Data Flow

The application should follow this conceptual flow:

```text
Local /data
    ↓
Data loader
    ↓
Validation + normalization
    ↓
Zustand in-memory store
    ↓
Derived variables
    ↓
Downscaling
    ↓
Uncertainty / temporal frames
    ↓
Portal selectors
    ↓
Charts / maps / decision cards / advisory UI
```

Do not perform scientific calculations independently inside individual UI components.

---

# 5. Session 1 — Project Bootstrap, Routing, Mock Auth & RBAC

## 1.1 Initialize frontend architecture

### Work

- Initialize/clean the React/Next.js + TypeScript frontend according to the existing repository.
- Configure strict TypeScript.
- Configure linting/formatting if not already present.
- Establish the base source structure.
- Create routes for:
  - Login
  - Scientist
  - Farmer
  - Government
- Install only dependencies actually required by the application.

Required/approved libraries from the original plan include:

- Plotly / `react-plotly.js`
- Deck.gl
- Kepler.gl
- Leaflet / `react-leaflet`
- Recharts where useful
- Framer Motion where useful
- Zustand
- `react-i18next`
- PapaParse
- D3 where required

### Acceptance criteria

- Application starts successfully.
- Routes resolve.
- TypeScript/build passes.
- No backend is required.

---

## 1.2 Load and normalize local data

### Work

- Inspect every available file under `/data`.
- Build a data-loading layer.
- Parse historical CSV files.
- Parse forecast CSV files.
- Load GeoJSON/static spatial data.
- Load `panchayats.json`.
- Normalize dates, variable names and units based on actual files.
- Validate expected structures.
- Store normalized data in Zustand.
- Expose selectors for:
  - block
  - panchayat
  - variable
  - date/time
  - historical/forecast source

### Required behavior

No application data should depend on a backend request.

### Acceptance criteria

- All available seed data can be accessed through the store.
- Loading/error states exist.
- Components do not need to parse raw CSV themselves.

---

## 1.3 Mock authentication and RBAC

### Roles

Support the roles specified by the original plan:

- Super Admin
- Scientist / KVK
- District Officer
- Block / Panchayat Officer
- Disaster Management Cell
- Farmer
- Field Worker

### Work

- Create mock login.
- Add role selector.
- Persist selected role locally.
- Implement route guards.
- Implement reusable `RoleGate`.
- Define portal permissions.
- Prevent unauthorized portal navigation.
- Create local audit logging.

Audit events include:

- advisory edited
- advisory reviewed
- advisory approved
- advisory published
- threshold changed
- scenario executed
- report generated

### Acceptance criteria

- Role selection changes accessible routes.
- Unauthorized pages are blocked.
- Audit events are persisted in localStorage.
- No real authentication exists.

---

## 1.4 Shared application shell

### Work

Create reusable:

- Header
- Sidebar
- Mobile navigation
- Role badge
- Language switch
- Panchayat selector
- Breadcrumbs
- Loading skeletons
- Empty states
- Error states

Panchayat selector must support:

- Chas Block
- Alkusha
- Babudih
- West Ghatiyali
- Kura
- Kumhari

### Acceptance criteria

- All portals can reuse the shared foundation.
- Responsive navigation works.
- Selected panchayat is available globally.

---

## 1.5 i18n and shared UI primitives

### Work

Implement English + Hindi using `react-i18next`.

Create reusable primitives:

- Button
- Card
- Badge
- Modal
- Tabs
- Table
- Slider
- Date range picker
- Tooltip
- Legend
- Select
- Alert
- Metric tile
- Empty state
- Loading skeleton

Define shared design tokens.

Risk levels:

```text
Green
Yellow
Orange
Red
```

### Acceptance criteria

- Language switching updates shared UI.
- Components are reused across portals.
- No page-specific copies of basic UI primitives are created.

---

# 6. Session 2 — Data Layer, Derived Variables & Downscaling

## 2.1 Derived-variable engine

Create pure TypeScript calculation functions.

Implement, where required inputs exist:

- Humidity
- Cloud cover
- Wind speed
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

### Rules

- Functions must be deterministic.
- Inputs and outputs must be typed.
- Units must be documented.
- Formula assumptions must be documented.
- Missing required inputs must produce a controlled result rather than silently inventing values.

### Acceptance criteria

- Calculations are unit-testable without React.
- Components consume calculation results rather than duplicating formulas.

---

## 2.2 Client-side downscaling engine

Implement pure TypeScript downscaling utilities.

### Temperature elevation correction

Use the specified relationship:

```text
T_p = T_block - 6.5 * (Elev_p - Elev_block) / 1000
```

### Spatial interpolation

Implement IDW interpolation across panchayat centroids.

### Soil-moisture adjustment

Use available:

- soil
- slope
- ET

inputs.

### Rainfall orographic adjustment

Use available:

- elevation
- slope
- aspect

inputs.

### Acceptance criteria

- Downscaling is deterministic.
- Inputs/outputs are documented.
- Calculations can run entirely in the browser.
- Downscaled results are available through selectors/store.

---

## 2.3 Ensemble uncertainty and temporal frames

### Work

Create 5–10 deterministic variants using controlled changes to:

- lapse rate
- IDW power
- soil adjustment factor
- rainfall/orographic factor where applicable

Compute:

```text
uncertainty = standard deviation across ensemble members
```

Precompute temporal frames for available day/hour timestamps.

### Acceptance criteria

- Each ensemble member is identifiable.
- Ensemble mean and standard deviation are available.
- Animation-ready frames are generated.
- The implementation does not claim the surrogate ensemble is an observed physical ensemble.

---

## 2.4 Scientist Data QA

### Work

Implement QA utilities for:

- missing values
- invalid values
- outliers
- date continuity
- station/data coverage
- spatial coverage

Create a scientist-only Data QA dashboard.

Where observed and predicted data are both available, compute:

- R²
- RMSE

Do not compute or display a metric if the required paired data do not exist.

### Acceptance criteria

- QA results are reproducible.
- Missing data is visibly distinguished from zero.
- Scientist can identify problematic variables/data ranges.

---

## 2.5 Formatting, schemas and documentation

Create:

```text
formatters.ts
data dictionaries
TypeScript schemas/types
formula documentation
```

Include:

- number formatters
- date/time formatters
- unit formatters
- risk-label mappings
- variable metadata

Add JSDoc to scientific calculation functions.

### Acceptance criteria

- Variables and units are documented in one place.
- UI formatting is consistent.

---

# 7. Session 3 — Scientist Portal: Shell & Diagnostic Plots

## 3.1 Scientist portal

Create the Scientist portal shell and navigation.

Pages:

1. Block Overview
2. Panchayat Deep Dive
3. Model Diagnostics
4. Forecast Verification
5. Advisory Studio
6. Scenario Lab
7. Data QA
8. Crop Threshold Editor
9. API & Export

The pages may initially be functional shells, but navigation must work.

---

## 3.2 Diagnostic plots 1–3

### Plot 1 — Elevation & Topography

Use Deck.gl / Leaflet.

Display spatial elevation/topography information.

### Plot 2 — Correlation Heatmap

Use Plotly.

Display correlations between available variables.

### Plot 3 — Side-by-Side Contour

Use Plotly + GeoJSON.

Compare relevant spatial fields side-by-side.

### Acceptance criteria

- Charts use real seeded/derived data.
- Tooltips identify variable, location and units.
- Empty data is handled.

---

## 3.3 Diagnostic plots 4, 5, 6, 10

### Plot 4 — Spatial Error / Uncertainty

Show spatial uncertainty/error.

### Plot 5 — Predicted vs Observed

Show paired predicted/observed values where available.

Display:

- R²
- RMSE

### Plot 6 — Residuals

Display residual distribution/spatial residuals as appropriate.

### Plot 10 — Feature Importance

Display available feature-importance data.

If actual feature-importance data does not exist in `/data`, use clearly labeled seeded/demo values rather than pretending they are model-derived.

---

## 3.4 Diagnostic plots 7–9

### Plot 7 — Crop Threshold

Display crop-stage thresholds.

### Plot 8 — Rainfall Probability

Display rainfall probability and uncertainty/bands where available.

### Plot 9 — Soil Moisture Deficit Gauge

Create a clear gauge visualization.

---

## 3.5 Diagnostic plots 11–12

### Plot 11 — Vulnerability Ranking

Horizontal bar visualization by panchayat.

### Plot 12 — Farm Operations Window Matrix

Heatmap-style matrix using:

- Green
- Yellow
- Orange
- Red

for operational suitability/risk states.

---

# 8. Session 4 — Scientist Portal: Historical/Forecast Explorer

## 4.1 Plots 13–18

Implement:

13. Wind Rose  
14. Cloud Cover Heatmap  
15. Humidity Heatmap  
16. Rainfall Accumulation  
17. Forecast Spaghetti  
18. Anomaly Map

Use actual available variables.

If a variable is unavailable, show a clear unavailable-data state instead of fabricating observations.

---

## 4.2 Plots 19–24

Implement:

19. SPI/SPEI  
20. Heat Stress Index  
21. Frost Risk  
22. GDD Tracker  
23. Water Balance  
24. Panchayat Comparison Dashboard

All charts must respect the shared date/panchayat selectors.

---

## 4.3 Historical + Forecast Explorer

Create:

- variable selector
- panchayat selector
- date/time slider
- play/pause
- animation speed
- historical/forecast distinction

Variables:

- Temp Max
- Temp Min
- Temp Avg
- Rain
- Soil Moisture
- Humidity
- Cloud
- Wind

Include side-by-side historical vs five-day forecast views.

---

## 4.4 Panchayat Deep Dive

Create one reusable page implementation for all five panchayats.

Tabs:

- Overview
- Diagnostics
- Forecast
- Advisory

The selected panchayat changes the data, not the page implementation.

---

## 4.5 Block Overview

Create the main Chas Block dashboard.

Display:

- Chas Block map
- five panchayat boundaries
- temperature summary
- rainfall summary
- soil moisture summary
- alert summary
- vulnerability summary

---

# 9. Session 5 — Scientist Advisory Studio

## 5.1 Advisory input builder

Build a structured advisory input object from:

- panchayat
- crop
- crop stage
- selected date/range
- forecast
- downscaled values
- thresholds
- uncertainty
- relevant alerts

Show the generated JSON in a preview modal.

---

## 5.2 Claude integration with mock mode

Create a single abstraction such as:

```text
generateAdvisory(input)
```

It must support:

```text
MOCK_CLAUDE=true
```

Mock mode returns deterministic structured advisory data.

Claude mode:

- uses the configured prompt,
- supports streaming where available,
- handles errors,
- handles timeout/failure,
- never breaks the rest of the application.

Store prompt templates in:

```text
src/lib/prompts/
```

---

## 5.3 Parse and edit advisory

Validate Claude/mock output with a typed schema, preferably Zod.

Editable fields include:

- language
- thresholds
- actions
- reasons
- confidence

Add:

- regenerate
- validation errors
- reset
- preview

Do not allow malformed generated output to enter the approval workflow.

---

## 5.4 Approval and version history

Implement:

```text
Draft
  ↓
Review
  ↓
Approve
  ↓
Publish
```

Persist versions in localStorage.

Display:

- version number
- timestamp
- author/role
- status
- change summary
- diff view

Write approval/publish actions to the audit log.

---

## 5.5 Publish to other portals

When an advisory is published:

- update shared Zustand state,
- make the advisory available to Farmer portal,
- make the advisory available to Government portal,
- record publication event.

Create preview-only interfaces for:

- SMS
- IVR
- WhatsApp
- bulletin

These are simulations, not real messaging integrations.

---

# 10. Session 6 — Scientist Animation, Scenario Lab & Thresholds

## 6.1 Model animation

Create client-side temporal visualization.

Display downscaled:

- temperature
- rainfall
- soil moisture

Use a time slider and play button.

Include:

- animation speed
- panchayat hover
- timestamp
- legend

If Claude-generated animation code is supported, render it only inside a controlled sandbox/iframe and treat it as optional.

---

## 6.2 Scenario Lab

Support scenarios:

- drought
- flood
- heatwave
- cold wave

Controls include:

- rainfall deficit
- temperature anomaly
- wind adjustment where relevant

Recompute scenario layers client-side.

Show:

- affected panchayats
- changed risk state
- changed operational windows
- resulting advisory implications

Clearly label scenario results as simulated.

---

## 6.3 Crop Threshold Editor

Create editable:

```text
crop × crop stage × threshold
```

table.

Support:

- edit
- validate
- save
- reset
- view defaults

Persist changes in localStorage.

Ensure Farmer decision cards consume the same threshold state.

---

## 6.4 Data QA refinement and export

Add export functionality for:

- CSV
- PNG
- PDF through browser-compatible client-side mechanism
- JSON

Plot exports should use the chart library's supported client-side export functionality.

Do not create a server export endpoint.

---

## 6.5 Scientist portal polish

Add:

- skeleton loaders
- empty states
- error states
- keyboard-friendly interactions
- responsive layouts
- dark/light theme if compatible with the existing design
- consistent spacing and typography

---

# 11. Session 7 — Farmer Portal

## 7.1 Farmer shell

Create mobile-first Farmer portal.

Include:

- mock OTP login
- English/Hindi switch
- selected panchayat/crop state
- last-advisory cache

The OTP is simulated. Any valid six-digit input may be accepted.

Offline support should cache the latest advisory where technically appropriate.

---

## 7.2 Farmer home

Display:

- Today's Action Card
- five-day forecast
- alerts
- crop selector
- crop-stage selector

Primary actions should be immediately understandable.

Examples:

```text
Irrigate: YES / NO
Spray: YES / NO
```

Do not expose scientist-level complexity on the primary farmer screen.

---

## 7.3 Farmer plots

Implement mobile versions of:

- Plot 7
- Plot 8
- Plot 9
- Plot 12

Use simplified charts.

Prioritize:

- readable labels
- touch targets
- short explanations
- clear units

---

## 7.4 Farmer information cards

Implement:

- Today's Weather
- Hourly Rain Probability
- Heat/Cold Stress
- Pest/Disease
- Irrigation Schedule
- Market Advisory

Use plain-language explanations.

---

## 7.5 Decision-card engine

Create a reusable rule engine:

```text
thresholds + forecast + crop stage
              ↓
        decision rule
              ↓
          YES / NO
```

Support:

- Irrigation
- Spray
- Fertilizer
- Harvest
- Livestock

The rule engine must be pure TypeScript and unit-testable.

---

# 12. Session 8 — Farmer Feedback & Government Portal Foundation

## 8.1 Farmer feedback

Create forms for:

- crop stage
- irrigation
- pest
- damage
- yield

Support optional voice note recording using MediaRecorder where supported.

Create simulated:

- SMS
- IVR

preview.

Store feedback in Zustand + localStorage.

---

## 8.2 Scientist feedback inbox

Create:

- feedback list
- filters
- panchayat filter
- category filter
- date filter
- feedback detail view
- trend summaries

Make feedback visible to scientists without requiring a backend.

---

## 8.3 Government portal shell

Government roles:

- DM/DC
- BDO
- Agriculture Officer
- Disaster Cell
- Panchayat Secretary
- RD Officer

Build Government navigation and RBAC.

Initially include:

- Plot 1
- Plot 3
- Plot 11

using reusable chart/map components.

---

## 8.4 Government risk maps

Implement map layers for:

- Drought
- Flood
- Heatwave
- Cold Wave
- Pest/Disease
- Crop Health
- Water
- Roads
- Population Vulnerability

Use Deck.gl/map components.

Include:

- layer toggles
- legend
- hover details
- selected panchayat
- timestamp/source where applicable

---

## 8.5 Government operations dashboard

Implement:

### Relief Allocation Optimizer

Simple browser-side demand vs supply calculator.

### Warning Dissemination Status

Show simulated delivery status.

### Action Tracker

Kanban-style:

```text
New
In Progress
Escalated
Completed
```

Persist demo state locally where useful.

---

# 13. Session 9 — Government Operations, Reports & Cross-Portal Workflow

## 9.1 Disaster management modules

Create UI modules for:

### Drought

- grains
- water tankers
- fodder
- MGNREGA works
- insurance
- delay-sowing advisories

### Flood

- shelters
- evacuation
- embankments
- pumps
- relief

### Heatwave

- cooling centers
- water tankers
- work hours
- livestock

### Cold Wave / Frost

- warnings
- smoke/fog
- crop covers
- livestock

### Pest / Disease

- quarantine
- pesticide
- mass advisories

All modules are UI/simulation only.

---

## 9.2 Rural development modules

Create UI for:

- watershed
- check dams
- farm ponds
- afforestation
- solar pumps
- crop diversification
- soil health cards
- canal repair
- market linkage
- scheme convergence

Use seeded/demo values only.

---

## 9.3 Government LLM reports

Create Claude/mock report generation for:

- situation reports
- disaster bulletins
- resource plans
- vulnerability summaries
- action checklists

Reuse the same Claude abstraction and mock mode from Session 5.

Do not duplicate API logic.

---

## 9.4 Alert escalation

Implement:

```text
Green
Yellow
Orange
Red
```

Create escalation UI and preview panels for:

- SMS
- IVR
- WhatsApp
- push

All delivery remains simulated.

---

## 9.5 Cross-portal workflow

Implement the complete client-side workflow:

```text
Block forecast
      ↓
Downscale
      ↓
Scientist validation
      ↓
LLM/mock advisory draft
      ↓
Review
      ↓
Approve
      ↓
Publish
      ↓
Farmer + Government views
      ↓
Farmer feedback
      ↓
Scientist feedback inbox
```

Use Zustand/in-memory events rather than a backend.

This task is complete only when the full demo workflow can be executed end-to-end.

---

# 14. Session 10 — Testing, QA, Deployment & Extras

## 10.1 Automated tests

Use the repository's chosen test stack.

Recommended:

- Vitest
- React Testing Library
- Playwright

Test:

- derived-variable calculations
- downscaling
- uncertainty
- RBAC
- route protection
- decision cards
- threshold changes
- advisory validation
- approval workflow
- publication
- feedback flow

---

## 10.2 Accessibility, performance and responsive QA

Check:

- keyboard navigation
- visible focus
- semantic labels
- screen-reader labels
- contrast
- responsive layouts
- touch targets
- loading states

Performance:

- lazy-load heavy charts/maps
- avoid unnecessary recalculation
- memoize expensive derived data where appropriate
- avoid rendering every chart simultaneously when not needed

Check:

- mobile
- tablet
- desktop

---

## 10.3 Static deployment and documentation

Prepare the frontend for static/client deployment compatible with the chosen framework.

Possible targets:

- Vercel
- Netlify
- GitHub Pages

Do not introduce a backend solely for deployment.

Update:

- README
- screenshots
- setup instructions
- data instructions
- Claude/mock configuration
- role descriptions
- user manual

Create short user guides for:

- Scientist
- Farmer
- Government

---

## 10.4 Extras — Batch 1

Only start after core functionality is stable.

Implement:

- Panchayat digital twin
  - 3D terrain
  - weather animation
- Participatory sensing
  - farmer rainfall reports
- Insurance linkage UI
- Carbon/water credits UI

All remain frontend simulations.

---

## 10.5 Extras — Batch 2

Implement only if time and stability permit:

- gamified early warning
- voice-first farmer UI
- government drill mode
- inter-department coordination view
- final offline-first pass

Extras must not break the core application.

---

# 15. Final End-to-End Acceptance Checklist

Before declaring the project complete:

## Architecture

- [ ] No backend.
- [ ] No database.
- [ ] No hidden server dependency.
- [ ] Seeded data loads locally.
- [ ] Shared state is centralized.
- [ ] Scientific calculations are separated from UI.

## Scientist

- [ ] Scientist can log in with mock role.
- [ ] Scientist can select panchayat.
- [ ] Scientist can inspect historical/forecast data.
- [ ] Scientist can inspect diagnostic plots.
- [ ] Scientist can inspect QA.
- [ ] Scientist can edit thresholds.
- [ ] Scientist can create/review/approve/publish advisory.
- [ ] Scientist can inspect feedback.
- [ ] Scientist can run scenarios.

## Farmer

- [ ] Farmer can log in with mock OTP.
- [ ] Farmer can select crop/stage.
- [ ] Farmer sees current advisory.
- [ ] Farmer sees five-day forecast.
- [ ] Farmer sees operational decisions.
- [ ] Farmer can submit feedback.
- [ ] Farmer can use Hindi.
- [ ] Latest advisory can be available offline where supported.

## Government

- [ ] Government role access works.
- [ ] Risk maps work.
- [ ] Disaster modules work.
- [ ] Rural-development modules work.
- [ ] Alert escalation UI works.
- [ ] Relief calculator works.
- [ ] Action tracker works.
- [ ] Government report generation works in mock mode.

## Cross-portal

- [ ] Published advisory reaches Farmer portal.
- [ ] Published advisory reaches Government portal.
- [ ] Farmer feedback reaches Scientist inbox.
- [ ] Audit trail records important workflow events.

## Quality

- [ ] Build passes.
- [ ] Tests pass.
- [ ] No critical console errors.
- [ ] No dead primary buttons.
- [ ] Responsive QA complete.
- [ ] Accessibility pass complete.
- [ ] README updated.
- [ ] `progress.md` updated.
- [ ] All completed tasks have task-ID commits.

---

# 16. Execution Order

Claude Code should normally execute sessions in this order:

```text
Session 1
   ↓
Session 2
   ↓
Session 3
   ↓
Session 4
   ↓
Session 5
   ↓
Session 6
   ↓
Session 7
   ↓
Session 8
   ↓
Session 9
   ↓
Session 10
```

Do not begin a later session if its required foundation is missing.

If a task is blocked:

1. mark it `Blocked` in `progress.md`,
2. record the exact reason,
3. do not silently skip it,
4. continue with independent tasks only if they do not depend on the blocked task.

---

# 17. Completion Protocol for Claude Code

After each task:

1. Run relevant tests/checks.
2. Verify the UI manually where applicable.
3. Update `progress.md`.
4. Record important implementation notes.
5. Commit using the task ID.

After each session:

1. Run the application.
2. Run the relevant test suite.
3. Check for console/runtime errors.
4. Update the session status in `progress.md`.
5. Record blockers.
6. Summarize files changed and remaining work.

Do not mark a task `Completed` merely because files were created. The feature must actually work.
