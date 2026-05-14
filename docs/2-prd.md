# TodoListApp PRD

## 1. 문서 개요

TodoListApp은 개인 사용자가 본인 계정으로 로그인하여 할일을 등록하고, 카테고리, 종료예정일, 상태 기준으로 관리하는 반응형 웹 애플리케이션이다.

이 문서는 2026-05-14 기준 구현된 backend, frontend, database, Swagger 계약을 반영한다.

## 2. 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
| --- | --- | --- | --- |
| v0.1 | 2026-05-13 | MVP PRD 최초 작성 | Codex |
| v0.2 | 2026-05-14 | 백엔드/프론트엔드 구현 상태, Swagger UI, 로그, 테스트 검증 반영 | Codex |
| v0.3 | 2026-05-14 | 사용자별 다크모드 저장 및 자동 적용 반영 | Codex |
| v0.4 | 2026-05-14 | 한국어, 영어, 일본어 다국어 모드 반영 | Codex |
| v0.5 | 2026-05-14 | 할일 상태 4단계, 카테고리 다국어 표시, CORS 설정 반영 | Codex |

## 3. 제품 목표

- 사용자는 본인 계정의 할일만 안전하게 관리할 수 있다.
- 사용자는 할일을 카테고리와 종료예정일, 상태로 구분해 조회할 수 있다.
- 사용자는 기본 카테고리와 직접 만든 사용자 추가 카테고리를 사용할 수 있다.
- 사용자는 다크모드와 표시 언어를 저장하고 다음 접속 시 자동 적용받을 수 있다.

## 4. 기술 스택

### Frontend

- React 19
- TypeScript
- Zustand
- TanStack Query
- Vite

### Backend

- Node.js
- Express
- JavaScript
- PostgreSQL 연동은 `pg` 사용
- Swagger UI 제공

### Database

- PostgreSQL 17

## 5. MVP 포함 기능

- 회원가입
- 로그인
- 로그아웃
- JWT 기반 인증
- 내 정보 조회/수정
- 회원 탈퇴
- 할일 등록
- 할일 목록 조회
- 할일 상세 조회
- 할일 수정
- 할일 삭제
- 할일 상태 변경
- 기본 카테고리 조회
- 사용자 추가 카테고리 생성
- 카테고리, 종료예정일 기간, 상태 기준 필터링
- 사용자별 다크모드 저장 및 자동 적용
- 사용자별 표시 언어 저장 및 자동 적용
- 기본 카테고리 다국어 표시

## 6. 핵심 요구사항

| ID | 요구사항 | 우선순위 |
| --- | --- | --- |
| FR-001 | 사용자는 이메일, 비밀번호, 이름 또는 닉네임으로 회원가입할 수 있다. | Must |
| FR-002 | 사용자는 이메일과 비밀번호로 로그인할 수 있다. | Must |
| FR-003 | 로그인 성공 시 JWT와 사용자 정보를 반환한다. | Must |
| FR-004 | JWT는 Zustand 메모리 상태에만 저장한다. | Must |
| FR-005 | 인증 사용자는 본인의 개인정보를 조회할 수 있다. | Must |
| FR-006 | 인증 사용자는 이름 또는 닉네임, 다크모드 사용 여부, 표시 언어를 수정할 수 있다. | Must |
| FR-007 | 인증 사용자는 회원 탈퇴할 수 있다. | Must |
| FR-008 | 회원 탈퇴 시 사용자 계정, 본인 소유 할일, 사용자 추가 카테고리는 즉시 삭제한다. | Must |
| FR-009 | 인증 사용자는 할일을 등록, 조회, 수정, 삭제할 수 있다. | Must |
| FR-010 | 할일은 할일명, 설명, 종료예정일, 카테고리, 상태를 가진다. | Must |
| FR-011 | 할일 상태는 `등록`, `진행중`, `완료`, `취소` 4단계로 관리한다. | Must |
| FR-012 | 할일 목록에서는 상태를 직접 변경하지 않고, 편집 화면에서 상태를 변경한다. | Must |
| FR-013 | 사용자는 카테고리, 종료예정일 기간, 상태로 할일 목록을 필터링할 수 있다. | Must |
| FR-014 | 인증 사용자는 사용자 추가 카테고리를 생성할 수 있다. | Must |
| FR-015 | 기본 카테고리는 `일반`, `업무`, `개인`, `학습`을 제공한다. | Must |
| FR-016 | 기본 카테고리는 현재 사용자 언어에 맞게 표시한다. | Must |
| FR-017 | 사용자 추가 카테고리는 사용자가 입력한 이름 그대로 표시한다. | Must |
| FR-018 | 사용자는 다른 사용자의 할일과 사용자 추가 카테고리에 접근할 수 없다. | Must |

## 7. 데이터 요구사항

### User

- `id`
- `email`
- `password_hash`
- `display_name`
- `dark_mode_enabled`
- `language`
- `created_at`
- `updated_at`

`language`는 `ko`, `en`, `ja`만 허용한다.

### Todo

- `id`
- `user_id`
- `category_id`
- `title`
- `description`
- `due_date`
- `status`
- `is_completed`
- `created_at`
- `updated_at`

`status`는 `registered`, `in_progress`, `completed`, `canceled`만 허용한다. `is_completed`는 기존 호환 필드이며 `status = completed`일 때 `true`로 동기화한다.

### Category

- `id`
- `user_id`
- `name`
- `is_default`
- `created_at`
- `updated_at`

기본 카테고리는 `user_id = null`, `is_default = true`로 관리한다. 사용자 추가 카테고리는 생성 사용자 ID를 가진다.

## 8. API 범위

- Auth API: 회원가입, 로그인, 로그아웃
- Users API: 내 정보 조회, 내 정보 수정, 회원 탈퇴
- Categories API: 카테고리 목록 조회, 사용자 추가 카테고리 생성
- Todos API: 할일 등록, 목록 조회, 상세 조회, 수정, 삭제
- System API: Health check, Swagger UI

Swagger UI:

```txt
GET /api-docs
GET /api-docs/swagger.json
```

## 9. 프론트엔드 통합 기준

- API base URL 기본값은 `http://localhost:3000/api`이다.
- 개발 CORS origin은 `http://localhost:5173`, `http://127.0.0.1:5173`을 허용한다.
- Todo 필터는 `categoryId`, `dueDateFrom`, `dueDateTo`, `status` query parameter를 사용한다.
- Todo 상태 변경은 `PATCH /todos/{todoId}`의 `status` 필드로 처리한다.
- 기본 카테고리명은 사용자 언어에 맞게 표시한다.
- 다크모드와 표시 언어는 로그인 응답 및 내 정보 조회 응답의 값을 기준으로 자동 적용한다.

## 10. 검증 상태

2026-05-14 기준:

- Backend `npm test`: 15개 테스트 통과
- Frontend `npm run build`: 통과
- Frontend `npm test -- --run`: 18개 테스트 파일, 61개 테스트 통과
- Swagger JSON 파싱 검증 통과

## 11. MVP 제외 기능

- OAuth Social 인증
- 조직 단위 공동 할일 관리
- 할일 공유 및 담당자 배정
- 반복 일정
- 알림 및 리마인더
- 파일 첨부
- 활동 이력
- 외부 캘린더 연동
- 관리자 기능
