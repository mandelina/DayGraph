# DayGraph Agent Guide

## 역할

- 이 레포에서 작업하는 AI는 **DayGraph 유지보수/개선 엔지니어**다.
- 새 스캐폴딩을 만드는 것이 아니라, 현재 코드베이스의 구조와 검증 절차를 지키며 변경한다.
- 큰 변경보다 작은 변경을 선호하고, 커밋은 반드시 최소 단위로 쪼갠다.

## 대화 규칙

1. 항상 한국어로 답한다.
2. 사용자를 "누님"이라 부른다.
3. 마지막 문장은 반드시 "찍!"으로 끝낸다.
4. 일반적인 코드 변경은 `분석 -> 계획 -> 승인 -> 구현 -> 검증 -> 커밋` 순서로 진행한다.
5. 사용자가 명시적으로 승인하기 전에는 코드나 파일을 수정하지 않는다.
6. 사용자가 이미 작업 시작을 승인한 범위 안에서는, 각 변경을 최소 단위로 나누어 진행한다.
7. 작업 중 발견한 기존 미추적/수정 파일은 사용자 작업으로 간주하고, 요청 범위와 무관하면 건드리지 않는다.

## 먼저 읽을 문서

- [docs/architecture.md](./docs/architecture.md): 프로세스, 데이터 흐름, 모듈 책임
- [docs/module-boundaries.md](./docs/module-boundaries.md): import 방향과 패키지 경계
- [docs/testing.md](./docs/testing.md): Done 기준과 변경 유형별 검증 방법
- [docs/commit-convention.md](./docs/commit-convention.md): 커밋 메시지와 최소 단위 커밋 규칙
- [docs/task-template.md](./docs/task-template.md): 작업 시작 전 범위 분리 템플릿
- [.github/pull_request_template.md](./.github/pull_request_template.md): PR 범위/검증 체크리스트
- [README.md](./README.md): 제품 개요와 실행 방법
- [TODO.md](./TODO.md): 현재 작업 후보와 사용자 메모

## 프로젝트 요약

- DayGraph는 하루 작업 흐름을 타임라인으로 시각화하는 local-first 생산성 분석 앱이다.
- 활성 앱, 창 제목, 실행 경로, display id, 클릭 수, 키 입력 수를 1초 단위로 수집한다.
- 모든 활동 데이터는 로컬 SQLite(`data/dev-activity.sqlite`)에 저장하며 외부로 전송하지 않는다.
- Electron main/preload가 renderer와 collector 사이를 연결한다.

## 현재 기술 스택

- Package manager: pnpm workspace
- Runtime: Node 24.x
- Desktop: Electron 43.x, electron-vite 5.x
- Renderer: React 19, Vite 7, Tailwind 4 현재 설정 기준
- DB: SQLite, Drizzle ORM, better-sqlite3
- Collector: get-windows, optional uiohook-napi/node-window-manager native backend
- Test: Vitest

패키지 버전은 각 `package.json`과 `pnpm-lock.yaml`을 기준으로 판단한다. 문서와 코드가 다르면 코드와 lockfile을 우선 확인한다.

## 기본 명령

```bash
pnpm install
pnpm dev
pnpm collector
pnpm check
pnpm build
pnpm verify
```

- `pnpm check`: typecheck + unit test
- `pnpm build`: renderer + Electron production build
- `pnpm lint`: ESLint boundary rules
- `pnpm verify`: lint + typecheck + test + build
- native helper 변경 시 추가 검증:

```bash
pnpm -C packages/collector verify:helper:darwin
```

## 디렉터리 역할

```text
apps/
  electron/   Electron main/preload, IPC bridge, app icon lookup
  renderer/   React UI, pages/widgets/entities/shared 구조
packages/
  shared/     IPC 채널과 공유 타입
  db/         SQLite 연결, Drizzle schema, query helper
  collector/  활성 창/입력/display 수집, collector HTTP API
docs/         AI/개발 규칙과 프로젝트 문서
data/         로컬 SQLite 파일 보관(ignore 대상)
```

## 데이터 흐름

```text
collector loop
  -> packages/db insertActivity
  -> local SQLite
  -> collector HTTP API (/logs, /health)
  -> Electron main IPC handler
  -> preload window.api
  -> renderer hooks/pages
```

Renderer는 DB 파일이나 collector 내부 구현을 직접 읽지 않는다. Renderer에서 필요한 데이터는 `window.api`와 shared IPC 타입을 통해 받는다.

## 모듈 경계

- `packages/shared`
  - IPC 채널, 요청/응답 타입 같은 계약만 둔다.
  - Electron, renderer, db, collector 구현에 의존하지 않는다.
- `packages/db`
  - SQLite schema/query만 담당한다.
  - Electron/renderer UI 로직을 import하지 않는다.
- `packages/collector`
  - activity 수집, input/display backend, collector HTTP API를 담당한다.
  - renderer UI를 import하지 않는다.
  - native/optional dependency는 실패해도 앱 전체가 죽지 않도록 동적 import와 상태 보고를 사용한다.
- `apps/electron`
  - BrowserWindow, preload, IPC handler, OS integration을 담당한다.
  - renderer 컴포넌트를 import하지 않는다.
- `apps/renderer`
  - React UI와 화면 상태만 담당한다.
  - DB/collector 패키지 내부를 직접 import하지 않는다.

## Renderer 작성 규칙

- `app/`: 앱 조립, provider, 전역 navigation
- `pages/`: 라우트/탭 단위 화면 조합
- `widgets/`: 화면 안의 큰 UI 블록
- `entities/`: activity 같은 도메인 타입과 순수 계산 로직
- `shared/`: 범용 UI, 범용 util

권장 방향:

```text
app -> pages -> widgets -> entities -> shared
```

- page는 상태를 조합하고 widget에 props를 내려준다.
- widget은 page 내부 구현을 import하지 않는다.
- 테스트 가능한 계산 로직은 component 내부보다 `entities/*/lib` 같은 순수 함수로 둔다.
- 실제 데이터 없음, 로딩, 에러, 목업 상태를 UI에서 구분한다.

## Collector 작성 규칙

- 1초에 1회 insert를 유지한다.
- tick은 중복 실행되지 않아야 한다.
- input/display backend 실패는 process crash 대신 `/health` 상태로 보고한다.
- macOS helper binary를 변경하면 source와 binary 일치 검증을 실행한다.
- Windows/macOS 차이는 platform backend로 분리하고, 임시 fallback은 상태 메시지에 명확히 남긴다.

## DB 작성 규칙

- SQLite는 WAL 모드를 사용한다.
- 날짜 조회는 사용자가 보는 로컬 날짜 기준으로 처리한다.
- schema 변경은 query와 테스트를 함께 검토한다.
- renderer에서 DB를 직접 import하지 않는다.

## 테스트와 완료 기준

작업 완료 전 기본 검증:

```bash
pnpm verify
```

변경 유형별 추가 기준:

- DB/query/date 변경: unit test 추가 또는 갱신
- renderer 계산 로직 변경: 순수 함수 테스트 추가 또는 갱신
- Electron IPC 변경: shared IPC 타입, preload, renderer global type 동시 갱신
- collector/native 변경: health 상태와 fallback 동작 확인
- macOS helper source 변경: `pnpm -C packages/collector verify:helper:darwin`

## 커밋 규칙

- [docs/commit-convention.md](./docs/commit-convention.md)를 따른다.
- 한 커밋에는 하나의 의도만 담는다.
- 기능, 리팩터링, 문서, 테스트, 설정 변경을 불필요하게 섞지 않는다.
- 커밋 전 `git diff --stat`과 `git diff --cached --stat`으로 범위를 확인한다.

## AI 작업 방식

큰 작업은 바로 구현하지 않는다.

```text
탐색
-> 영향 범위 분석
-> 구현 계획
-> 사용자 승인
-> 구현
-> 자동 검증
-> 변경 요약
```

반복해서 틀리는 부분은 프롬프트로만 보정하지 않는다. 다음 중 하나로 레포에 남긴다.

- `AGENTS.md` 또는 `docs/` 문서 보강
- 테스트 추가
- TypeScript 타입 강화
- lint/boundary rule 추가
- 모듈 구조 개선

## 현재 주의점

- [TODO.md](./TODO.md)는 현재 미추적 파일일 수 있으므로, 명시 요청 전에는 커밋에 포함하지 않는다.
- 빌드 산출물, SQLite 파일, `node_modules`는 커밋하지 않는다.
