# CLAUDE.md
# Claude Code Instructions — Chas Block Agro-Meteorological Advisory Platform

This file is the **operating contract for Claude Code** in this repository.

The project is a **frontend-only prototype**. `tasks.md` is the authoritative implementation plan and `progress.md` is the authoritative execution tracker.

---

# 1. Read These Files First

Before modifying code, read:

```text
README.md
tasks.md
progress.md
```

Then inspect the existing repository structure and relevant implementation.

Do not assume the repository matches the documentation perfectly. The actual code and data are authoritative for what already exists; `tasks.md` is authoritative for what should be built.

---

# 2. Mission

Build a polished frontend prototype for a Chas Block agro-meteorological advisory platform.

The application has three portals:

```text
Scientist / KVK
Farmer
Government / District Administration
```

The platform uses local seeded data and client-side calculations to produce:

```text
data
→ derived variables
→ downscaling
→ uncertainty
→ visualizations
→ decisions/advisories
→ feedback
```

Claude is a supporting generation layer, not the numerical weather model.

---

# 3. Non-Negotiable Architecture

## 3.1 No backend

Do NOT create:

- Express
- FastAPI
- Django
- Flask
- API routes
- application servers
- backend workers
- server-side CRUD

unless the project scope is explicitly changed by the user.

## 3.2 No database

Do NOT create:

- PostgreSQL
- MySQL
- MongoDB
- SQLite
- Prisma
- Sequelize
- Drizzle
- ORM models
- migrations

The application is a frontend simulation.

## 3.3 No real authentication

Authentication is simulated.

Use:

- role switcher,
- Zustand state,
- localStorage,
- route guards,
- `RoleGate`.

Do not build OAuth, password authentication, JWT authentication, session servers, or identity infrastructure.

## 3.4 No application-data API

Do not create REST/GraphQL endpoints for application data.

Use:

```text
local data
→ loader
→ normalized state
→ Zustand selectors/actions
```

Zustand actions provide the client-side event mechanism.

---

# 4. Data Rules

## 4.1 Inspect real data first

Before writing loaders or calculations:

1. inspect the actual files under the configured data directory,
2. identify actual columns,
3. identify units,
4. identify date formats,
5. identify spatial formats,
6. identify missing values,
7. identify available panchayats.

Do not assume every variable in the README exists.

## 4.2 Local data only

Expected data includes:

```text
historical/*.csv
forecast/*.csv
static/*.geojson
panchayats.json
```

The exact repository path may be `public/data` or another existing project path.

Follow the actual repository structure.

## 4.3 Normalize once

Do not parse raw CSV inside components.

Preferred pipeline:

```text
raw file
↓
loader
↓
validator
↓
normalizer
↓
Zustand
↓
selector
↓
component
```

## 4.4 Preserve provenance

Every important data object should be distinguishable where practical as:

```text
observed
forecast
derived
downscaled
simulated
scenario
mock
```

Never silently present simulated values as observations.

---

# 5. Scientific Calculation Rules

Scientific calculations belong in pure TypeScript utilities.

Do not put formulas directly inside React JSX.

Recommended areas:

```text
src/lib/calculations/
src/lib/downscaling/
```

Functions should have:

- typed inputs,
- typed outputs,
- documented units,
- deterministic behavior where possible,
- explicit handling of missing inputs,
- unit tests.

---

# 6. Derived Variables

The planned calculation layer includes:

- humidity,
- cloud cover,
- wind speed/direction,
- ET0,
- GDD,
- SPI/SPEI,
- soil moisture deficit,
- heat index,
- frost risk,
- spray window,
- irrigation window,
- rainfall probability,
- rainfall exceedance probability,
- panchayat vulnerability index.

Only implement a calculation when its required inputs exist.

If required data is missing:

```text
return a controlled unavailable result
```

Do not invent values.

---

# 7. Downscaling Rules

The prototype uses a surrogate client-side downscaling engine.

## Temperature

Use the specified relationship:

```text
T_p = T_block - 6.5 × (Elev_p - Elev_block) / 1000
```

## Spatial interpolation

Use IDW where appropriate.

## Soil moisture

Use available:

- soil,
- slope,
- rainfall,
- ET.

## Rainfall

Where required inputs exist, use:

- elevation,
- slope,
- aspect.

## Uncertainty

The prototype may run 5–10 deterministic parameter variants.

Potentially vary:

- lapse rate,
- IDW power,
- soil adjustment,
- rainfall/orographic factors.

Compute standard deviation across variants.

Do NOT describe this as a physically sourced meteorological ensemble.

---

# 8. UI Rules

## 8.1 No dead controls

Every visible button must:

- perform an action,
- navigate,
- update state,
- open a working modal,
- download/export,
- or explicitly indicate that it is simulated.

Do not leave fake buttons.

## 8.2 Reuse components

Before creating a component:

1. search existing components,
2. reuse if possible,
3. extend if appropriate,
4. create a new component only when necessary.

Avoid duplicate:

- cards,
- buttons,
- tables,
- modals,
- chart wrappers,
- selectors,
- loading states.

## 8.3 Responsive design

Scientist and Government interfaces may be information-dense.

Farmer interface must be mobile-first.

Prioritize:

- readable typography,
- touch targets,
- clear primary actions,
- minimal unnecessary text,
- visible state/risk,
- simple navigation.

## 8.4 Loading/error/empty states

Every data-dependent feature should handle:

```text
loading
error
empty
ready
```

Do not show blank screens when data is missing.

---

# 9. RBAC Rules

Supported roles:

```text
Super Admin
Scientist / KVK
District Officer
Block / Panchayat Officer
Disaster Management Cell
Farmer
Field Worker
```

Use client-side route guards and permission checks.

Important rules:

- Farmer must not see another farmer's simulated/private data.
- Government views primarily use aggregate information.
- Scientist views use panchayat-level information.
- Sensitive farmer information should be masked before LLM calls.
- Audit important changes.

Use a reusable component such as:

```tsx
<RoleGate role="scientist">
  ...
</RoleGate>
```

Do not scatter raw role checks throughout every component if a shared permission mechanism can handle them.

---

# 10. State Architecture

Prefer separate Zustand responsibilities:

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

Do not put the entire application into one giant store object.

Keep derived state derived where practical rather than duplicating it.

---

# 11. Cross-Portal Workflow

The intended client-side workflow is:

```text
Block forecast
    ↓
Derived variables
    ↓
Downscale
    ↓
Uncertainty
    ↓
Scientist validation
    ↓
Advisory input JSON
    ↓
Claude/mock generation
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
Scientist feedback inbox
```

Use Zustand/in-memory state.

Do not create a backend event system.

---

# 12. Claude / LLM Rules

## 12.1 Claude is optional

The application must work in stub mode.

Default development configuration:

```env
NEXT_PUBLIC_USE_STUB_LLM=true
```

Never make normal development dependent on a live API.

## 12.2 Claude responsibilities

Claude may be used for:

- advisory drafting,
- government reports,
- disaster bulletins,
- action/resource summaries,
- optional animation-code generation.

Claude must NOT:

- perform numerical weather prediction,
- replace downscaling,
- replace scientific calculations,
- autonomously declare disasters,
- publish directly to farmers,
- bypass scientist review.

## 12.3 Structured input

Send structured JSON.

Example:

```json
{
  "location": "Alkusha",
  "crop": "Rice",
  "stage": "Flowering",
  "forecast": [],
  "thresholds": {},
  "uncertainty": "Medium"
}
```

The prompt must explicitly say:

```text
Use only the supplied information.
Do not invent data.
If required information is missing, say insufficient data.
```

## 12.4 Validate output

Never trust raw LLM output.

Pipeline:

```text
Claude response
↓
parse
↓
schema validation
↓
application state
```

Use Zod or the repository's existing validation layer.

Malformed responses must be rejected safely.

## 12.5 Human review

Generated advisories must follow:

```text
Draft
→ Review
→ Approve
→ Publish
```

No direct LLM publication.

---

# 13. Privacy Rules

Do not send unnecessary PII to Claude.

Avoid sending:

- farmer names,
- phone numbers,
- exact private coordinates,
- unnecessary personal information.

Prefer:

- panchayat,
- crop,
- crop stage,
- aggregate weather,
- thresholds,
- derived indicators.

Audit LLM operations where appropriate.

---

# 14. Prompt Rules

Store prompt templates centrally:

```text
src/lib/prompts/
```

Do not duplicate large prompt strings across React components.

Prompts should specify:

- role,
- location,
- crop,
- stage,
- forecast,
- thresholds,
- uncertainty,
- output schema,
- language requirements,
- data limitations.

Prompt versions should be identifiable.

---

# 15. Animation-Code Generation

Animation-code generation is optional.

If implemented:

1. Treat generated code as untrusted.
2. Do not execute it directly in the application context.
3. Use an isolated/sandboxed rendering mechanism where appropriate.
4. Prefer adapting generated logic into the application's existing Plotly/Deck.gl implementation.
5. Do not let generated code access secrets or application internals.

The normal product must work without generated code.

---

# 16. File Organization

Prefer:

```text
src/
├── app/
├── portals/
│   ├── scientist/
│   ├── farmer/
│   └── government/
├── components/
│   ├── ui/
│   ├── charts/
│   ├── maps/
│   ├── layout/
│   └── common/
├── data/
│   ├── loaders/
│   ├── normalizers/
│   ├── selectors/
│   └── schemas/
├── lib/
│   ├── calculations/
│   ├── downscaling/
│   ├── export/
│   ├── prompts/
│   └── validation/
├── store/
├── hooks/
├── i18n/
├── mocks/
└── types/
```

Respect the actual repository if an equivalent structure already exists.

Do not perform a large folder migration merely for cosmetic reasons.

---

# 17. Dependency Rules

Before installing a dependency:

1. Check `package.json`.
2. Check whether the functionality already exists.
3. Check whether a lightweight implementation is sufficient.
4. Add the dependency only if it materially helps the task.

Avoid dependency sprawl.

---

# 18. Implementation Workflow

For every task:

### Step 1 — Read

Read:

```text
README.md
tasks.md
progress.md
```

### Step 2 — Inspect

Inspect the existing code and relevant data.

### Step 3 — Plan internally

Identify:

- files to change,
- existing utilities to reuse,
- state changes,
- tests required.

Do not redesign unrelated parts.

### Step 4 — Implement

Implement only the assigned task and necessary supporting changes.

### Step 5 — Verify

Run relevant:

```text
lint
typecheck
unit tests
component tests
build
```

Use whatever scripts actually exist in `package.json`.

### Step 6 — Manual verification

For UI work:

- run the application,
- inspect the affected page,
- test primary interactions,
- check console errors,
- check responsive behavior where relevant.

### Step 7 — Update progress

Update `progress.md`.

Record:

- status,
- files changed,
- tests/checks,
- blockers,
- important notes.

### Step 8 — Commit

Use the task ID.

Example:

```text
feat(2.2): implement client-side downscaling
```

---

# 19. Session Rules

The implementation is divided into 10 sessions.

Do not skip ahead unnecessarily.

## Session 1

```text
1.1
1.2
1.3
1.4
1.5
```

Foundation, routing, data loading, RBAC, shell, i18n.

## Session 2

```text
2.1
2.2
2.3
2.4
2.5
```

Derived variables, downscaling, uncertainty, QA, documentation.

## Session 3

```text
3.1
3.2
3.3
3.4
3.5
```

Scientist shell and diagnostic plots 1–12.

## Session 4

```text
4.1
4.2
4.3
4.4
4.5
```

Diagnostic plots 13–24, Explorer, Panchayat Deep Dive, Block Overview.

## Session 5

```text
5.1
5.2
5.3
5.4
5.5
```

Advisory Studio and publication workflow.

## Session 6

```text
6.1
6.2
6.3
6.4
6.5
```

Animation, Scenario Lab, thresholds, exports, Scientist polish.

## Session 7

```text
7.1
7.2
7.3
7.4
7.5
```

Farmer portal and decision engine.

## Session 8

```text
8.1
8.2
8.3
8.4
8.5
```

Feedback and Government foundation.

## Session 9

```text
9.1
9.2
9.3
9.4
9.5
```

Government operations, reports, escalation, cross-portal workflow.

## Session 10

```text
10.1
10.2
10.3
10.4
10.5
```

Testing, QA, deployment and extras.

---

# 20. Task Discipline

Do not mark a task complete because:

- a file was created,
- a component renders without errors,
- a button exists,
- a mock screen was created.

A task is complete only when its acceptance criteria in `tasks.md` are satisfied.

If blocked:

```text
status = Blocked
```

Record the exact blocker in `progress.md`.

Do not silently work around a blocker by changing the architecture.

---

# 21. Testing Rules

Every new calculation requires unit tests.

Every new important state transition requires tests.

Every important user workflow should have component or E2E coverage.

At minimum test:

- derived variables,
- downscaling,
- uncertainty,
- thresholds,
- decision cards,
- RBAC,
- advisory validation,
- advisory approval,
- publication,
- feedback.

Use the repository's actual configured test tools.

---

# 22. Data Integrity Rules

Never silently:

- replace missing values with arbitrary values,
- treat zero as missing,
- treat missing as zero,
- fabricate observations,
- fabricate model verification metrics,
- fabricate feature importance,
- label mock values as live values.

When data is unavailable:

```text
show unavailable state
```

or, where explicitly required by `tasks.md`, use clearly labeled demo/mock data.

---

# 23. UI Quality Rules

The final application should feel like one product.

Maintain:

- consistent spacing,
- consistent typography,
- consistent risk colors,
- consistent cards,
- consistent chart controls,
- consistent navigation,
- consistent loading/error states.

Risk levels:

```text
Green
Yellow
Orange
Red
```

Do not introduce unrelated visual systems page-by-page.

---

# 24. Performance Rules

Avoid unnecessary browser work.

Use:

- memoization where justified,
- derived selectors,
- lazy-loading for heavy charts/maps,
- pagination/virtualization for large lists,
- precomputed animation frames where appropriate.

Do not optimize prematurely.

First establish correctness.

---

# 25. Completion Checklist

Before declaring the entire project complete:

## Architecture

- [ ] No backend
- [ ] No database
- [ ] No application server dependency
- [ ] Local data loading works
- [ ] Zustand state works
- [ ] Mock auth works
- [ ] RBAC works

## Scientist

- [ ] 24 planned diagnostic views implemented where data permits
- [ ] Data QA works
- [ ] Downscaling works
- [ ] Uncertainty works
- [ ] Scenario Lab works
- [ ] Threshold editor works
- [ ] Advisory workflow works
- [ ] Audit trail works

## Farmer

- [ ] Mock OTP works
- [ ] Mobile layout works
- [ ] Forecast works
- [ ] Alerts work
- [ ] Decision cards work
- [ ] Thresholds affect decisions
- [ ] Feedback works
- [ ] Hindi works
- [ ] Offline/latest-advisory behavior works where supported

## Government

- [ ] RBAC works
- [ ] Risk maps work
- [ ] Disaster modules work
- [ ] Rural development modules work
- [ ] Relief calculator works
- [ ] Action tracker works
- [ ] Reports work in mock mode
- [ ] Alert escalation UI works

## Cross-portal

- [ ] Scientist can publish
- [ ] Farmer can see published advisory
- [ ] Government can see published advisory/bulletin
- [ ] Farmer feedback reaches Scientist
- [ ] Audit trail records important actions

## Quality

- [ ] TypeScript passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Build passes
- [ ] No critical console errors
- [ ] No dead primary buttons
- [ ] Responsive QA complete
- [ ] Accessibility pass complete
- [ ] README updated
- [ ] progress.md updated

---

# 26. Final Rule

When uncertain, prefer:

```text
existing implementation
>
existing project conventions
>
tasks.md
>
README.md
>
new abstraction
```

Do not invent architecture.

Do not add infrastructure.

Do not fabricate data.

Do not silently change scientific assumptions.

Implement the smallest correct change that satisfies the current task.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
