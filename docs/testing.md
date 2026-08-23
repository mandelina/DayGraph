# Testing and Done Criteria

## Goal

DayGraph에서 "완료"는 구현이 끝났다는 뜻이 아니라, 변경 유형에 맞는 자동 검증과 수동 확인 기준을 통과했다는 뜻이다.

AI 작업은 이 문서를 기준으로 검증 범위를 먼저 정하고, 작업 후 결과를 요약해야 한다.

## Default Verification

모든 코드 변경 후 기본으로 실행한다.

```bash
pnpm verify
```

현재 의미:

- `pnpm lint`: ESLint boundary rules
- `pnpm check`: ESLint + TypeScript typecheck + Vitest unit test
- `pnpm build`: renderer build + Electron build
- `pnpm verify`: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`

문서만 변경한 경우에는 런타임 검증을 생략할 수 있다. 단, 링크와 파일 경로는 직접 확인한다.

## Done Criteria

기본 Done:

- 변경 범위가 요청한 작업과 일치한다.
- 기존 사용자 변경을 되돌리지 않았다.
- `git diff --stat`으로 최소 단위 변경임을 확인했다.
- 관련 테스트 또는 검증 명령을 실행했다.
- 검증 실패가 있으면 원인과 남은 리스크를 기록했다.
- 커밋 메시지는 `docs/commit-convention.md` 형식을 따른다.

코드 변경 Done:

- `pnpm verify` 통과
- 변경된 pure logic에 테스트가 있거나 기존 테스트가 갱신됨
- IPC/API shape 변경 시 shared type과 consumer가 함께 갱신됨

문서 변경 Done:

- 링크 대상 파일 존재 확인
- 문서가 현재 코드와 모순되지 않는지 확인
- 필요하면 `AGENTS.md`의 문서 링크 갱신

## Change-Type Matrix

| Change type | Required verification |
| --- | --- |
| Renderer UI only | `pnpm verify` |
| Renderer pure logic | `pnpm verify`, unit test 추가/갱신 |
| DB schema/query/date | `pnpm verify`, query/date unit test 추가/갱신 |
| Electron IPC | `pnpm verify`, shared/preload/global type 확인 |
| Collector loop/backend | `pnpm verify`, `/health` status 영향 확인 |
| macOS helper source/binary | `pnpm verify`, `pnpm -C packages/collector verify:helper:darwin`, `pnpm -C packages/collector verify:helper:darwin-display` |
| Package/dependency | `pnpm install --lockfile-only` 또는 의존성 명령 후 `pnpm verify` |
| Docs only | 링크 확인, 필요 시 `pnpm check` |

## Unit Test Targets

우선 테스트해야 하는 영역:

- 날짜 범위 계산
- activity score 계산
- timeline slice/bucket/filter 계산
- DB query helper
- IPC payload를 만들기 전의 pure transformation

가능하면 React component보다 pure function을 먼저 테스트한다.

## Manual Checks

자동화가 아직 부족한 영역:

- Electron 창 실제 실행
- macOS Accessibility/Input Monitoring 권한 상태
- Windows input backend 동작
- app icon 렌더링 품질
- Timeline/Today 실제 데이터 UX

이 영역을 변경했다면 최종 응답에 수동 확인 필요 여부를 남긴다.

## Native Helper Checks

macOS input helper source를 변경한 경우:

```bash
pnpm -C packages/collector build:helper:darwin
pnpm -C packages/collector verify:helper:darwin
```

`verify:helper:darwin`이 실패하면 source와 prebuilt binary가 어긋난 상태다. binary까지 갱신해서 같은 커밋에 포함한다.

## Electron Smoke E2E

collector와 Electron 개발 앱을 먼저 실행한 뒤, Electron 원격 디버깅 포트를 통해 화면·IPC·주요 탭을 읽기 전용으로 점검한다.

```bash
ELECTRON_REMOTE_DEBUGGING_PORT=9222 pnpm test:e2e
```

이 smoke test는 전역 키보드/마우스 입력을 주입하지 않는다.

## Before Commit

```bash
git diff --stat
git diff --cached --stat
git status --short
```

확인할 것:

- 미추적 사용자 파일이 커밋에 섞이지 않았는가?
- build output, SQLite, `node_modules`가 포함되지 않았는가?
- 커밋 하나가 하나의 의도만 담는가?
