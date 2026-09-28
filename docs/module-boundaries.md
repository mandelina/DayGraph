# Module Boundaries

## Goal

DayGraph는 Electron, Renderer, Collector, DB가 함께 동작하는 모노레포다. AI가 변경할 때 가장 위험한 실수는 편의를 위해 내부 구현을 직접 import해서 프로세스 경계를 흐리는 것이다.

이 문서는 각 모듈의 책임과 허용되는 의존 방향을 고정한다.

## Workspace Boundaries

```text
apps/electron
  -> packages/shared
  -> packages/collector (runtime lifecycle only)

apps/renderer
  -> packages/shared
  -> renderer 내부 app/pages/widgets/entities/shared

packages/collector
  -> packages/db

packages/db
  -> no app dependency

packages/shared
  -> no app/package implementation dependency
```

## Hard Rules

- Renderer는 `packages/db`를 import하지 않는다.
- Renderer는 `packages/collector`를 import하지 않는다.
- Electron main은 renderer component를 import하지 않는다.
- `packages/shared`는 타입과 IPC 계약만 가진다.
- `packages/db`는 SQLite schema/query만 가진다.
- Collector backend 실패는 UI에 직접 접근하지 않고 `/health`로 보고한다.
- Electron main은 `packages/collector`의 시작/종료 함수만 호출할 수 있다. 활동 조회는 Collector의 local HTTP API를 거쳐야 한다.

일부 핵심 규칙은 root ESLint flat config에서 강제한다. 새 경계 규칙을 추가할 때는 `eslint.config.mjs`와 이 문서를 함께 갱신한다.

## packages/shared

Allowed:

- IPC channel constants
- request/response types
- serializable shared contracts

Forbidden:

- Electron API import
- React import
- DB connection import
- Collector runtime import

Change checklist:

- IPC channel을 추가하면 preload, Electron main, renderer global type을 함께 갱신한다.
- 응답 shape이 바뀌면 관련 UI 상태와 테스트를 확인한다.

## packages/db

Allowed:

- Drizzle schema
- SQLite connection setup
- query helpers
- date range utilities used by query helpers

Forbidden:

- React component import
- Electron BrowserWindow or IPC import
- Collector loop state import

Change checklist:

- schema/query/date 변경은 unit test를 추가하거나 갱신한다.
- timestamp query는 local calendar date 기준을 유지한다.
- SQLite WAL 설정을 제거하지 않는다.

## packages/collector

Allowed:

- active-window sampling
- input backend
- display backend
- tick loop
- local HTTP API
- DB insert/query helper usage

Forbidden:

- Renderer UI import
- Electron BrowserWindow import
- direct DOM/browser API usage

Change checklist:

- tick은 overlap guard를 유지한다.
- native dependency는 optional failure path를 둔다.
- backend 상태는 `/health`에 노출한다.
- macOS helper source 변경 시 prebuilt binary 검증을 실행한다.

## apps/electron

Allowed:

- BrowserWindow lifecycle
- preload path setup
- IPC handlers
- collector HTTP API calls
- app icon lookup and OS integration
- collector runtime lifecycle (`startCollector` / `stopCollector`)

Forbidden:

- Renderer component import
- direct DB query from main when collector API should own the flow

Change checklist:

- IPC handler 추가 시 shared type과 preload API를 함께 갱신한다.
- collector 연결 실패는 renderer가 표현할 수 있는 serializable status로 반환한다.

## apps/renderer

Allowed:

- React UI
- page-level state orchestration
- domain calculation utilities under `entities/*/lib`
- `window.api` calls exposed by preload

Forbidden:

- `@daygraph/db` import
- `@daygraph/collector` import
- Node-only API usage in component code
- page internals imported from widgets/entities/shared

Layer direction:

```text
app -> pages -> widgets -> entities -> shared
```

Rules:

- `pages` compose widgets and own tab/page state.
- `widgets` receive props and should not import `pages`.
- `entities` contain domain types and pure logic.
- `shared` contains reusable UI/utilities that do not know DayGraph domain details.

## Import Examples

Good:

```ts
import type { QueryDayResponse } from "@daygraph/shared/ipc";
import { summarizeByApp } from "../../entities/activity/lib/calculateScore";
```

Bad:

```ts
import { queryDay } from "@daygraph/db/queries";
import { tick } from "@daygraph/collector";
```

## When Unsure

If a change needs to cross a boundary:

1. Add or update a shared contract.
2. Keep process-specific work in the owning process.
3. Expose only serializable data across IPC/HTTP.
4. Add tests around pure logic or query behavior.
5. Document the new boundary in this file or `docs/architecture.md`.
