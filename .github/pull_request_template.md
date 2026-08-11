# PR Checklist

## Summary

- 요약:

## Minimum Scope

- [ ] 이 PR은 하나의 의도만 포함한다.
- [ ] 기능, 리팩터링, 문서, 테스트, 설정 변경을 불필요하게 섞지 않았다.
- [ ] 관련 없는 사용자 변경, 빌드 산출물, SQLite 파일, `node_modules`를 포함하지 않았다.

## Changed Areas

- [ ] `apps/electron`
- [ ] `apps/renderer`
- [ ] `packages/shared`
- [ ] `packages/db`
- [ ] `packages/collector`
- [ ] `docs`
- [ ] tooling/config

## Verification

- [ ] `pnpm verify`
- [ ] 추가 검증:
- [ ] 생략한 검증과 사유:

## Boundary Check

- [ ] Renderer가 DB/collector 내부 구현을 직접 import하지 않는다.
- [ ] Shared는 serializable contract만 포함한다.
- [ ] Collector/backend 실패는 crash 대신 상태로 보고한다.
- [ ] IPC/API payload shape 변경 시 타입과 consumer를 함께 갱신했다.

## Notes

- 위험/후속 작업:
- 관련 문서:
