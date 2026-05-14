# TodoListApp 실행 계획 및 완료 상태

## 1. 실행 원칙

- MVP 범위는 회원가입, 로그인, 로그아웃, 내 정보 조회/수정, 회원 탈퇴, 할일 CRUD, 카테고리 조회/생성, 복합 필터링, 다크모드, 다국어 모드로 제한한다.
- 백엔드는 Node.js, Express, JavaScript, PostgreSQL 17, `pg`, JWT를 사용한다.
- 프론트엔드는 React 19, TypeScript, Zustand, TanStack Query를 사용한다.
- JWT는 Zustand 메모리 상태에만 저장한다.
- API 계약은 `swagger/swagger.json`과 일치해야 한다.

## 2. 완료 상태 요약

| 영역 | 상태 |
| --- | --- |
| DB 스키마 | 완료 |
| 백엔드 API | 완료 |
| Swagger UI | 완료 |
| 프론트엔드 화면 | 완료 |
| 다크모드 저장/자동 적용 | 완료 |
| 다국어 모드 저장/자동 적용 | 완료 |
| 기본 카테고리 다국어 표시 | 완료 |
| Todo 상태 4단계 | 완료 |
| 자동화 테스트 | 완료 |

## 3. 데이터베이스

### DB-01. 사용자 테이블

완료 조건:

- [x] `users.email`은 `UNIQUE NOT NULL`이다.
- [x] `users.password_hash`, `users.display_name`은 `NOT NULL`이다.
- [x] `users.dark_mode_enabled`는 `NOT NULL DEFAULT false`이다.
- [x] `users.language`는 `NOT NULL DEFAULT 'ko'`이며 `ko`, `en`, `ja`만 허용한다.

### DB-02. 카테고리 테이블

완료 조건:

- [x] 기본 카테고리와 사용자 추가 카테고리를 하나의 `categories` 테이블에서 관리한다.
- [x] 기본 카테고리는 `user_id IS NULL`, `is_default = true`이다.
- [x] 사용자 추가 카테고리는 `user_id IS NOT NULL`, `is_default = false`이다.
- [x] 기본 카테고리 `일반`, `업무`, `개인`, `학습`이 seed 된다.

### DB-03. Todo 테이블

완료 조건:

- [x] `todos.user_id`, `todos.category_id`, `todos.title`은 `NOT NULL`이다.
- [x] `todos.status`는 `NOT NULL DEFAULT 'registered'`이다.
- [x] `todos.status`는 `registered`, `in_progress`, `completed`, `canceled`만 허용한다.
- [x] 기존 호환을 위해 `todos.is_completed`를 유지한다.
- [x] `todos(user_id, status)` 인덱스가 존재한다.

## 4. 백엔드

### BE-01. 공통 구조

- [x] `routes -> controllers -> services -> repositories -> db` 구조를 사용한다.
- [x] `.env`에서 `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`을 읽는다.
- [x] CORS, JSON body parser, 요청 로깅, not found, error handler가 연결된다.
- [x] Swagger UI를 `GET /api-docs`에서 제공한다.

### BE-02. Auth API

- [x] `POST /auth/signup` 구현
- [x] `POST /auth/login` 구현
- [x] `POST /auth/logout` 구현
- [x] 비밀번호는 hash로 저장한다.

### BE-03. Users API

- [x] `GET /users/me` 구현
- [x] `PATCH /users/me`에서 `displayName`, `darkModeEnabled`, `language` 수정 지원
- [x] `DELETE /users/me` 구현
- [x] 회원 탈퇴 시 사용자, 본인 소유 todos, 사용자 추가 categories를 삭제한다.

### BE-04. Categories API

- [x] `GET /categories` 구현
- [x] `POST /categories` 구현
- [x] 기본 카테고리와 본인 사용자 추가 카테고리만 반환한다.

### BE-05. Todos API

- [x] `POST /todos` 구현
- [x] `GET /todos` 구현
- [x] `GET /todos/{todoId}` 구현
- [x] `PATCH /todos/{todoId}` 구현
- [x] `DELETE /todos/{todoId}` 구현
- [x] `status=registered|in_progress|completed|canceled` 필터 지원
- [x] `PATCH /todos/{todoId}`에서 `status` 수정 지원
- [x] 기존 `isCompleted` 요청은 호환 처리한다.

## 5. 프론트엔드

### FE-01. 인증

- [x] 로그인/회원가입 화면 구현
- [x] JWT를 Zustand 메모리 상태에만 저장
- [x] 보호 라우트와 공개 전용 라우트 구현
- [x] 로그아웃 시 인증 상태와 query cache 정리

### FE-02. Todo

- [x] Todo 목록, 등록, 수정, 삭제 화면 구현
- [x] 목록에서 상태 라벨 표시
- [x] 목록에서 상태 변경 체크박스 제거
- [x] 편집 화면에서 상태 선택 제공
- [x] 카테고리, 종료예정일 기간, 상태 필터 제공

### FE-03. 카테고리

- [x] 기본 카테고리와 사용자 추가 카테고리 조회
- [x] 사용자 추가 카테고리 생성
- [x] 기본 카테고리 다국어 표시
- [x] 사용자 추가 카테고리는 입력 이름 그대로 표시

### FE-04. 사용자 설정

- [x] 내 정보 조회/수정
- [x] 다크모드 사용 여부 저장
- [x] 표시 언어 저장
- [x] 저장된 다크모드와 표시 언어 자동 적용
- [x] 회원 탈퇴 UI 구현

## 6. 검증

2026-05-14 기준 검증 결과:

- [x] Backend `npm test`: 15개 테스트 통과
- [x] Frontend `npm run build`: 통과
- [x] Frontend `npm test -- --run`: 18개 테스트 파일, 61개 테스트 통과
- [x] Swagger JSON 파싱 검증 통과

## 7. 최종 수용 체크리스트

- [x] 사용자는 회원가입할 수 있다.
- [x] 사용자는 로그인할 수 있고 JWT를 발급받는다.
- [x] JWT는 브라우저 저장소에 저장되지 않는다.
- [x] 인증 사용자는 내 정보를 조회하고 설정을 수정할 수 있다.
- [x] 인증 사용자는 회원 탈퇴할 수 있다.
- [x] 인증 사용자는 할일을 등록, 조회, 수정, 삭제할 수 있다.
- [x] 인증 사용자는 할일 상태를 등록, 진행중, 완료, 취소로 저장할 수 있다.
- [x] 할일 목록은 카테고리, 종료예정일 기간, 상태로 필터링할 수 있다.
- [x] 인증 사용자는 사용자 추가 카테고리를 생성할 수 있다.
- [x] 기본 카테고리는 다국어로 표시된다.
- [x] 사용자는 다른 사용자의 할일과 사용자 추가 카테고리에 접근할 수 없다.
