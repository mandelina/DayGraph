# Task Template

작업을 시작하기 전에 이 템플릿으로 범위를 먼저 줄인다. 한 task가 여러 의도를 포함하면 task를 나누고, 커밋도 같은 기준으로 나눈다.

## Goal

- 목표:
- 하지 않을 것:

## Minimum Commit Units

- [ ] 1. 작업 단위:
- [ ] 2. 작업 단위:
- [ ] 3. 작업 단위:

각 항목은 단독으로 되돌릴 수 있어야 한다. 레이어, 검증 방법, 리뷰 관점이 다르면 별도 커밋으로 분리한다.

## Impacted Areas

- [ ] `apps/electron`
- [ ] `apps/renderer`
- [ ] `packages/shared`
- [ ] `packages/db`
- [ ] `packages/collector`
- [ ] `docs`
- [ ] tooling/config

## Boundary Questions

- Renderer가 `window.api` 대신 DB/collector를 직접 읽는가?
- Shared가 Electron, React, DB, collector 구현에 의존하는가?
- Collector 실패가 `/health` 또는 serializable status로 드러나는가?
- DB/query/date 변경에 테스트가 필요한가?

## Verification Plan

- 기본:
  - [ ] `pnpm verify`
- 추가:
  - [ ] 추가 검증:
- 생략 사유:
  - 사유:

## Done

- [ ] 변경 범위가 목표와 일치한다.
- [ ] 사용자 변경을 되돌리지 않았다.
- [ ] `git diff --stat`으로 범위를 확인했다.
- [ ] 검증 결과를 기록했다.
- [ ] 커밋 메시지가 `docs/commit-convention.md`를 따른다.
