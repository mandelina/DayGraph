# DayGraph Architecture

## Purpose

DayGraph is a local-first desktop productivity app. It records active-window activity every second, stores the data in local SQLite, and renders the day as timeline-oriented UI in Electron.

The main architectural goal is to keep personal activity data local while making each process boundary explicit enough for AI-assisted changes to stay safe.

## Process Overview

```text
pnpm dev
  -> packages/collector
       active window + input/display backend
       local HTTP API on 127.0.0.1
  -> apps/electron
       BrowserWindow
       IPC handlers
       app icon lookup
  -> apps/renderer
       React UI
       window.api calls through preload
```

The collector and Electron app are separate processes in development. Renderer code must assume data arrives through `window.api`, not by importing DB or collector internals.

## Data Flow

```text
active-win / native backend
  -> collector tick
  -> insertActivity()
  -> data/dev-activity.sqlite
  -> collector GET /logs?date=YYYY-MM-DD
  -> Electron ipcMain daygraph:query-day
  -> preload window.api.queryDay(dateISO)
  -> renderer useActivityData()
  -> Today / Timeline UI
```

Health and runtime status use a separate flow:

```text
collector GET /health
  -> Electron ipcMain daygraph:get-collector-status
  -> preload window.api.getCollectorStatus()
  -> Settings UI
```

## Storage

- SQLite database path is resolved from `DATADIR`, defaulting to `data/dev-activity.sqlite`.
- SQLite uses WAL mode.
- Activity timestamps are stored as UTC ISO strings.
- Day queries are interpreted by local calendar date, then converted to UTC ISO range.
- Data files under `data/` are ignored and must not be committed.

Primary table:

```text
activity_log
  id
  timestamp
  app_name
  app_path
  bundle_id
  window_title
  display_id
  is_active
  clicks
  keypress
  created_at
```

## Package Responsibilities

### packages/shared

- Owns IPC channel names and shared request/response types.
- Must not depend on Electron, React, DB, or collector implementation code.
- Any IPC shape change starts here, then propagates to preload, main, and renderer types.

### packages/db

- Owns SQLite connection, Drizzle schema, and query helpers.
- Must not import Electron or renderer code.
- Date/query changes need unit tests.

### packages/collector

- Owns active-window sampling, input counters, display detection, and collector HTTP API.
- Inserts at most once per second.
- Prevents overlapping ticks.
- Reports backend failure through `/health` instead of crashing the app.
- Optional native dependencies must be loaded defensively.

### apps/electron

- Owns BrowserWindow, preload path, IPC handlers, collector HTTP calls, and OS integration.
- Bridges collector data to renderer through typed IPC.
- Should not import renderer components.

### apps/renderer

- Owns React UI and presentation state.
- Reads activity data only through `window.api`.
- Keeps testable domain calculations in `entities/*/lib`.
- Distinguishes loading, empty, error, and mock states.

## Renderer Layering

Current renderer structure follows a lightweight FSD-style direction:

```text
app -> pages -> widgets -> entities -> shared
```

Rules:

- `app` composes providers, navigation, and top-level pages.
- `pages` own page-level state orchestration.
- `widgets` render reusable screen sections and receive data through props.
- `entities` own domain types and pure activity logic.
- `shared` owns generic utilities and UI primitives.
- Widgets should not import page internals.
- Renderer should not import `packages/db` or `packages/collector`.

## Collector Backends

Input:

- macOS uses the prebuilt event-tap helper.
- Other platforms attempt an optional `iohook` backend.
- If input collection fails, collector runs with `inputBackend = "noop"` and reports the reason through `/health`.

Display:

- Collector attempts `node-window-manager` display/monitor data.
- If unavailable, display id falls back to coordinate-based estimation.
- Display backend status is reported through `/health`.

Tick loop:

- `runTickOnce()` guards against overlapping ticks.
- `skippedTicks`, `lastTickAt`, `lastTickDurationMs`, and `lastTickError` are exposed through health status.

## IPC Contracts

Defined in `packages/shared/src/ipc.ts`.

Current channels:

- `daygraph:query-day`
- `daygraph:get-app-icon`
- `daygraph:get-collector-status`

When adding or changing IPC:

1. Update shared request/response types.
2. Update Electron main handler.
3. Update preload `window.api`.
4. Update renderer `global.d.ts`.
5. Add or update tests when logic changes.

## Local-First Boundary

- Activity data must stay on the local machine.
- No external analytics or telemetry is allowed for activity records.
- Collector HTTP API binds to local host by default.
- Any future export/sync feature must make data movement explicit in UI and docs.

## Change Checkpoints

DB/query/date changes:

```bash
pnpm check
pnpm build
```

Collector/native changes:

```bash
pnpm check
pnpm build
pnpm -C packages/collector verify:helper:darwin
```

Renderer-only UI logic:

```bash
pnpm check
pnpm build
```

Document-only changes may skip runtime verification, but the changed links should be checked.

## Known Architecture Debt

- `packages/collector/src/index.ts` still contains several responsibilities and should be split into smaller modules.
- `pnpm lint` is not yet a real architecture gate.
- Weekly, Insights, and parts of Settings still use mock data.
- README may lag behind implementation details and should be kept aligned with this document.
