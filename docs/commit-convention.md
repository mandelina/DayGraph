# Commit Convention

## Core Rule

- 커밋은 반드시 최소 단위로 쪼갠다.
- 한 커밋에는 하나의 의도만 담는다.
- 기능, 리팩터링, 스타일, 문서, 설정 변경을 한 커밋에 섞지 않는다.
- 커밋 메시지만 보고 변경 범위와 이유를 바로 알 수 있어야 한다.

## Message Format

```text
<emoji> <Type> : <한국어 요약>
```

예시:

```text
✨ Feat : collector API 로그 조회 엔드포인트 추가
🩹 Fix : 오늘 날짜 조회가 UTC 기준으로 밀리는 문제 수정
♻️ Refactor : Electron main의 아이콘 캐시 로직 분리
📝 Docs : macOS 접근성 권한 안내 추가
```

## Types

- `🎉 Init` : 초기 스캐폴딩, 프로젝트 최초 구성
- `✨ Feat` : 사용자 기능, API, IPC, Collector 동작 추가
- `🩹 Fix` : 버그 수정, 런타임 오류 수정, 잘못된 동작 보정
- `♻️ Refactor` : 동작 변경 없이 구조 개선
- `💄 Style` : UI, 레이아웃, 디자인 토큰, 표시 방식 변경
- `📝 Docs` : README, TODO, 주석, 문서 수정
- `🏷️ Type` : 타입 오류 수정, 타입 정의 보강
- `✅ Test` : 테스트 추가 또는 테스트 환경 구성
- `🔧 Chore` : 빌드, 패키지, 설정, 도구 체인 변경

## Minimum Commit Unit

좋은 최소 단위:

- DB 스키마 컬럼 추가만 커밋
- 해당 컬럼을 쓰는 query 함수 추가만 커밋
- Renderer에서 query 결과를 표시하는 UI 변경만 커밋
- README에 새 동작 설명 추가만 커밋

나쁜 단위:

- DB 스키마, Collector 로직, UI, README를 한 번에 커밋
- 버그 수정과 리팩터링을 한 번에 커밋
- 타입 오류 수정과 디자인 변경을 한 번에 커밋
- "작업 중", "수정", "업데이트"처럼 범위를 알 수 없는 커밋

## Split Criteria

다음 중 하나라도 다르면 커밋을 나눈다.

- 변경 목적이 다르다.
- 영향을 받는 레이어가 다르다. (`apps/electron`, `apps/renderer`, `packages/db`, `packages/collector`, `packages/shared`)
- 검증 방법이 다르다.
- 되돌리고 싶은 시점이 다르다.
- 리뷰받을 담당 영역이 다르다.

## DayGraph Examples

```text
🔧 Chore : pnpm lockfile 추적 설정 추가
🩹 Fix : queryDay 날짜 범위를 로컬 날짜 기준으로 변경
✨ Feat : collector health check IPC 추가
💄 Style : Timeline 빈 상태 UI 추가
✅ Test : queryDay 로컬 날짜 범위 테스트 추가
📝 Docs : 커밋 최소 단위 원칙 추가
```

## Before Commit Checklist

- `git diff --stat`으로 변경 범위가 한 의도에 묶이는지 확인한다.
- `git diff`에서 문서, UI, 로직, 설정이 불필요하게 섞였는지 확인한다.
- 관련 검증 명령을 실행한다.
- 실패한 검증이 있으면 커밋 메시지나 PR 설명에 남긴다.
- 메시지 형식을 `<emoji> <Type> : <한국어 요약>`으로 통일한다.
