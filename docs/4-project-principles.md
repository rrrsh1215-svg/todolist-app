# TodoListApp 프로젝트 원칙

## 1. 공통 원칙

- MVP 범위에 필요한 기능만 구현한다.
- 사용자별 데이터 분리를 최우선으로 유지한다.
- 백엔드 API 계약은 `swagger/swagger.json`과 실제 Express validation을 일치시킨다.
- 문서는 구현된 backend, frontend, database 기준으로 유지한다.

## 2. 인증 및 보안

- 인증은 JWT 기반으로 처리한다.
- 프론트엔드는 JWT를 Zustand 메모리 상태에만 저장한다.
- JWT를 `localStorage`, `sessionStorage`, 쿠키, URL query string에 저장하지 않는다.
- 비밀번호와 JWT 원문은 로그에 남기지 않는다.
- 모든 보호 API는 인증 미들웨어를 통과해야 한다.

## 3. 백엔드 원칙

- 백엔드는 Node.js, Express, JavaScript로 구현한다.
- 백엔드 소스에는 TypeScript 파일을 만들지 않는다.
- PostgreSQL 연결은 `pg` 라이브러리를 사용한다.
- 계층 흐름은 `routes -> controllers -> services -> repositories -> db`를 따른다.
- SQL은 parameter binding을 사용한다.
- 주요 API 처리 지점과 오류 응답은 서버 콘솔 로그로 확인할 수 있어야 한다.

## 4. 프론트엔드 원칙

- 프론트엔드는 React 19와 TypeScript를 사용한다.
- 서버 상태는 TanStack Query로 관리한다.
- 인증 상태는 Zustand 메모리 상태로 관리한다.
- API 호출은 공통 HTTP client를 사용한다.
- 사용자 언어에 따라 주요 UI 문구를 한국어, 영어, 일본어로 표시한다.
- 기본 카테고리는 사용자 언어에 맞게 표시하고, 사용자 추가 카테고리는 입력 이름 그대로 표시한다.

## 5. 데이터 모델 원칙

### User

- `email`은 유일해야 한다.
- `password_hash`는 필수이다.
- `dark_mode_enabled`는 사용자별 다크모드 저장값이다.
- `language`는 `ko`, `en`, `ja`만 허용한다.

### Category

- 기본 카테고리와 사용자 추가 카테고리는 하나의 `categories` 테이블에서 관리한다.
- 기본 카테고리는 `user_id = null`, `is_default = true`이다.
- 사용자 추가 카테고리는 `user_id = current_user.id`, `is_default = false`이다.
- 기본 카테고리는 `일반`, `업무`, `개인`, `학습`이다.

### Todo

- 할일은 특정 사용자와 하나의 카테고리에 속한다.
- 할일 상태는 `registered`, `in_progress`, `completed`, `canceled`만 허용한다.
- 기존 호환을 위해 `is_completed`를 유지하며, `status = completed`이면 `is_completed = true`로 동기화한다.
- API와 프론트엔드는 신규 기능에서 `status`를 기준으로 상태를 처리한다.

## 6. 테스트 원칙

- 백엔드는 `node --test`로 API 계약과 주요 소유권 흐름을 검증한다.
- 프론트엔드는 Vitest와 Testing Library로 화면, Hook, API client 흐름을 검증한다.
- Todo 생성, 수정, 삭제, 상태 변경 후 관련 TanStack Query cache를 갱신한다.
- 필터 변경 시 Todo 목록 요청 조건이 갱신되어야 한다.

## 7. 운영 및 환경

- 백엔드는 `backend/.env`를 사용한다.
- 프론트엔드는 `frontend/.env` 또는 `VITE_API_BASE_URL`을 사용한다.
- 개발 CORS origin은 `http://localhost:5173`, `http://127.0.0.1:5173`을 허용한다.
- Swagger UI는 `GET /api-docs`에서 제공한다.
