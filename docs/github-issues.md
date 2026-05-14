# TodoListApp GitHub Issue Status

본 문서는 `docs/7-execution-plan.md`의 처리 단계를 기준으로 등록된 GitHub Issue와 로컬 구현 상태를 요약한다.

2026-05-14 기준 DB 이슈 `#1`~`#8`, 백엔드 이슈 `#9`~`#20`, 프론트엔드 이슈 `#21`~`#32`는 로컬 구현 및 테스트 결과 기준으로 완료 상태이다.

## 공통 작성 기준

- Title: `[Stage: <단계번호>] <작업명>` 형식을 사용한다.
- Label: `종류`, `영역`, `복잡도`를 포함한다.
- Todo: `해야할 일`, `완료 조건`, `기술적 고려사항`, `의존성`을 포함한다.
- 선행 작업과 후행 작업은 `docs/7-execution-plan.md`의 의존성 흐름을 따른다.

## DB Issues

| Issue | Stage | Title | Label | Status |
| --- | --- | --- | --- | --- |
| #1 | DB-01 | PostgreSQL 17 실행 환경 준비 | 종류: task, 영역: database, 복잡도: medium | 완료 |
| #2 | DB-02 | 스키마 적용 방식 확정 | 종류: task, 영역: database, 복잡도: medium | 완료 |
| #3 | DB-03 | `pgcrypto`와 UUID 기본값 검증 | 종류: task, 영역: database, 복잡도: low | 완료 |
| #4 | DB-04 | 핵심 테이블 및 제약 조건 검증 | 종류: task, 영역: database, 복잡도: medium | 완료 |
| #5 | DB-05 | 기본 카테고리 seed 검증 | 종류: task, 영역: database, 복잡도: low | 완료 |
| #6 | DB-06 | 삭제 정책 및 무결성 검증 | 종류: task, 영역: database, 복잡도: medium | 완료 |
| #7 | DB-07 | 인덱스 및 조회 성능 검증 | 종류: task, 영역: database, 복잡도: medium | 완료 |
| #8 | DB-08 | DB 수용 검증 | 종류: task, 영역: database, 복잡도: high | 완료 |

## Backend Issues

| Issue | Stage | Title | Label | Status |
| --- | --- | --- | --- | --- |
| #9 | BE-01 | 백엔드 기본 구조 및 공통 설정 | 종류: task, 영역: backend, 복잡도: medium | 완료 |
| #10 | BE-02 | 공통 API 규격 및 에러 처리 | 종류: task, 영역: backend, 복잡도: medium | 완료 |
| #11 | BE-03 | DB 스키마 연동 및 Repository 기반 | 종류: task, 영역: backend, 복잡도: medium | 완료 |
| #12 | BE-04 | 비밀번호 해시 및 JWT 유틸 | 종류: task, 영역: backend, 복잡도: medium | 완료 |
| #13 | BE-05 | JWT 인증 미들웨어 | 종류: task, 영역: backend, 복잡도: medium | 완료 |
| #14 | BE-06 | Auth API 구현 | 종류: task, 영역: backend, 복잡도: medium | 완료 |
| #15 | BE-07 | Users API 구현 | 종류: task, 영역: backend, 복잡도: medium | 완료 |
| #16 | BE-08 | Categories API 구현 | 종류: task, 영역: backend, 복잡도: medium | 완료 |
| #17 | BE-09 | Todo 소유권 및 카테고리 검증 | 종류: task, 영역: backend, 복잡도: medium | 완료 |
| #18 | BE-10 | Todos API CRUD 구현 | 종류: task, 영역: backend, 복잡도: high | 완료 |
| #19 | BE-11 | Todo 복합 필터링 구현 | 종류: task, 영역: backend, 복잡도: medium | 완료 |
| #20 | BE-12 | 백엔드 API 수용 테스트 및 문서화 | 종류: task, 영역: backend, 복잡도: high | 완료 |

## Frontend Issues

| Issue | Stage | Title | Label | Status |
| --- | --- | --- | --- | --- |
| #21 | FE-01 | 프론트엔드 기본 구조 및 공통 설정 | 종류: task, 영역: frontend, 복잡도: medium | 완료 |
| #22 | FE-02 | 공통 HTTP Client 및 API 에러 처리 | 종류: task, 영역: frontend, 복잡도: medium | 완료 |
| #23 | FE-03 | 인증 Store 및 인증 라우팅 | 종류: task, 영역: frontend, 복잡도: medium | 완료 |
| #24 | FE-04 | Auth API 연동 및 로그인/회원가입 화면 | 종류: task, 영역: frontend, 복잡도: medium | 완료 |
| #25 | FE-05 | Categories API 연동 및 카테고리 UI | 종류: task, 영역: frontend, 복잡도: medium | 완료 |
| #26 | FE-06 | Todos API Hook 및 필터 Store | 종류: task, 영역: frontend, 복잡도: medium | 완료 |
| #27 | FE-07 | Todo 목록 화면 및 복합 필터링 | 종류: task, 영역: frontend, 복잡도: high | 완료 |
| #28 | FE-08 | Todo 등록/수정 폼 | 종류: task, 영역: frontend, 복잡도: medium | 완료 |
| #29 | FE-09 | Todo 항목 액션 | 종류: task, 영역: frontend, 복잡도: medium | 완료 |
| #30 | FE-10 | 내 정보 및 회원 탈퇴 UI | 종류: task, 영역: frontend, 복잡도: medium | 완료 |
| #31 | FE-11 | 반응형 레이아웃 및 접근성 정리 | 종류: task, 영역: frontend, 복잡도: medium | 완료 |
| #32 | FE-12 | 프론트엔드 테스트 및 통합 QA | 종류: task, 영역: frontend, 복잡도: high | 완료 |

## 완료 근거

- 실행 계획 체크리스트: `docs/7-execution-plan.md`
- 백엔드 검증: `backend`에서 `npm test` 통과, 15개 테스트 통과
- 프론트엔드 검증: `frontend`에서 `npm run build` 통과
- 프론트엔드 검증: `frontend`에서 `npm run test:coverage` 통과, 18개 테스트 파일과 62개 테스트 통과
- 프론트엔드 coverage: 전체 statement coverage 95.7%

## 선행 및 후행 작업 요약

- DB-01~DB-08은 백엔드 API 구현의 선행 작업이다.
- BE-01~BE-12는 프론트엔드 API 통합의 선행 작업이다.
- FE-01~FE-12는 MVP 통합 QA의 후행 작업이며 현재 로컬 구현 기준 완료되었다.
- 후속으로 GitHub 원격 Issue 상태를 실제로 동기화해야 하는 경우 `gh issue close` 또는 상태 라벨 갱신을 별도로 수행한다.
