# 프론트엔드 통합 가이드

## 1. 목적

이 문서는 TodoListApp 프론트엔드가 개발된 백엔드 API와 연동할 때 지켜야 할 기준을 정리한다.

프론트엔드는 React 19, TypeScript, Zustand, TanStack Query를 기준으로 구현한다. 백엔드 API는 Express REST API이며 기본 개발 주소는 다음과 같다.

```txt
http://localhost:3000/api
```

Swagger UI는 백엔드 서버 실행 후 다음 주소에서 확인한다.

```txt
http://localhost:3000/api-docs
```

OpenAPI 원본 JSON은 다음 주소에서 확인한다.

```txt
http://localhost:3000/api-docs/swagger.json
```

## 2. 백엔드 실행 전 확인

백엔드는 `backend/.env`를 사용한다.

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todolist_app
JWT_SECRET=local-development-secret
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
NODE_ENV=development
```

프론트엔드 개발 서버가 `http://localhost:5173`이 아닌 다른 주소에서 실행되면 `CORS_ORIGIN`을 해당 주소로 변경해야 한다.

복수 Origin이 필요하면 쉼표로 구분한다.

```env
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

## 3. 프론트엔드 환경 변수

프론트엔드는 API base URL만 공개 환경 변수로 관리한다.

Vite 기준 예시는 다음과 같다.

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

프론트엔드 환경 변수에는 JWT secret, DB 접속 정보, 서버 내부 설정을 넣지 않는다.

## 4. 인증 정책

JWT는 로그인 성공 시 백엔드에서 발급한다.

프론트엔드는 JWT를 Zustand `authStore`의 메모리 상태에만 저장한다.

금지 사항:

- `localStorage`에 JWT 저장 금지
- `sessionStorage`에 JWT 저장 금지
- 쿠키에 JWT 저장 금지
- URL query string에 JWT 포함 금지
- 콘솔 로그에 JWT 원문 출력 금지

새로고침하면 메모리 상태가 초기화되므로 JWT는 복원되지 않는다. 이 경우 사용자는 다시 로그인해야 한다.

로그아웃은 MVP 기준으로 클라이언트 메모리 상태의 JWT를 삭제하는 방식이다. 서버 측 JWT 블랙리스트는 사용하지 않는다.

## 5. HTTP Client 기준

모든 API 호출은 공통 HTTP client를 통해 수행한다. 컴포넌트에서 직접 `fetch`를 호출하지 않는다.

요청 기준:

- `Content-Type: application/json` 사용
- 보호 API는 `Authorization: Bearer <token>` 헤더 사용
- JWT는 요청 시점에 Zustand `authStore`에서 읽는다.
- `204 No Content` 응답은 JSON 파싱하지 않는다.

예시:

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

type ApiError = {
  code: string;
  message: string;
  details?: unknown[];
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();

  if (!response.ok) {
    throw body as ApiError;
  }

  return body as T;
}
```

## 6. 공통 응답 형태

대부분의 성공 응답은 `data` 필드를 감싼 형태이다.

단건 응답:

```json
{
  "data": {
    "id": "uuid"
  }
}
```

목록 응답:

```json
{
  "data": []
}
```

`DELETE`, `logout` 같은 일부 API는 `204 No Content`를 반환한다.

에러 응답은 다음 형태이다.

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "details": []
}
```

프론트엔드는 `message`를 기본 사용자 안내 문구로 사용하고, `details`가 있으면 필드별 검증 메시지에 활용한다.

## 7. 주요 타입

프론트엔드 타입은 API 응답 필드명을 그대로 사용한다.

```ts
type User = {
  id: string;
  email: string;
  displayName: string;
  darkModeEnabled: boolean;
  language: "ko" | "en" | "ja";
  createdAt: string;
  updatedAt: string;
};

type Category = {
  id: string;
  userId?: string | null;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type Todo = {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: "registered" | "in_progress" | "completed" | "canceled";
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};
```

## 8. API 목록

### 8.1 System

```txt
GET /health
```

응답:

```json
{
  "status": "ok"
}
```

### 8.2 Auth

회원가입:

```txt
POST /auth/signup
```

요청:

```json
{
  "email": "user@example.com",
  "password": "password123!",
  "displayName": "김민준"
}
```

응답:

```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "김민준",
    "darkModeEnabled": false,
    "language": "ko",
    "createdAt": "2026-05-14T00:00:00.000Z",
    "updatedAt": "2026-05-14T00:00:00.000Z"
  }
}
```

로그인:

```txt
POST /auth/login
```

요청:

```json
{
  "email": "user@example.com",
  "password": "password123!"
}
```

응답:

```json
{
  "data": {
    "token": "jwt",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "김민준",
      "darkModeEnabled": false,
      "language": "ko",
      "createdAt": "2026-05-14T00:00:00.000Z",
      "updatedAt": "2026-05-14T00:00:00.000Z"
    }
  }
}
```

로그아웃:

```txt
POST /auth/logout
```

응답:

```txt
204 No Content
```

프론트엔드는 성공 여부와 관계없이 로컬 메모리 인증 상태를 제거한다.

### 8.3 Users

내 정보 조회:

```txt
GET /users/me
Authorization: Bearer <token>
```

내 정보 수정:

```txt
PATCH /users/me
Authorization: Bearer <token>
```

요청:

```json
{
  "displayName": "새 이름",
  "darkModeEnabled": true,
  "language": "ko"
}
```

`language`는 `ko`, `en`, `ja`만 허용하며, 로그인/내 정보 조회 응답의 값을 기준으로 화면 언어를 적용한다.

프론트엔드는 기본 카테고리 `일반`, `업무`, `개인`, `학습`을 현재 사용자 언어에 맞게 표시한다. 사용자 추가 카테고리는 사용자가 입력한 이름을 그대로 표시한다.

회원 탈퇴:

```txt
DELETE /users/me
Authorization: Bearer <token>
```

응답:

```txt
204 No Content
```

회원 탈퇴 성공 후 프론트엔드는 JWT와 인증 관련 메모리 상태를 제거하고 로그인 화면으로 이동한다.

### 8.4 Categories

카테고리 목록 조회:

```txt
GET /categories
Authorization: Bearer <token>
```

응답에는 기본 카테고리와 현재 사용자가 만든 사용자 추가 카테고리가 포함된다.

카테고리 생성:

```txt
POST /categories
Authorization: Bearer <token>
```

요청:

```json
{
  "name": "프로젝트"
}
```

### 8.5 Todos

Todo 상태 값:

| API 값 | 한국어 표시 | 영어 표시 | 일본어 표시 |
| --- | --- | --- | --- |
| `registered` | 등록 | Registered | 登録 |
| `in_progress` | 진행중 | In progress | 進行中 |
| `completed` | 완료 | Completed | 完了 |
| `canceled` | 취소 | Canceled | キャンセル |

목록 화면에서는 상태를 직접 토글하지 않는다. 상태 변경은 할 일 편집 화면에서 수행한다.

할일 목록 조회:

```txt
GET /todos
Authorization: Bearer <token>
```

지원 query parameter:

```txt
categoryId=uuid
dueDateFrom=YYYY-MM-DD
dueDateTo=YYYY-MM-DD
status=registered|in_progress|completed|canceled
```

예시:

```txt
GET /todos?categoryId=<categoryId>&dueDateFrom=2026-05-01&dueDateTo=2026-05-31&status=registered
```

할일 생성:

```txt
POST /todos
Authorization: Bearer <token>
```

요청:

```json
{
  "title": "주간 보고서 작성",
  "description": "금요일 회의 전까지 초안 작성",
  "dueDate": "2026-05-15",
  "categoryId": "uuid"
}
```

할일 상세 조회:

```txt
GET /todos/{todoId}
Authorization: Bearer <token>
```

할일 수정:

```txt
PATCH /todos/{todoId}
Authorization: Bearer <token>
```

요청 가능한 필드:

```json
{
  "title": "수정된 제목",
  "description": "수정된 설명",
  "dueDate": "2026-05-20",
  "categoryId": "uuid",
  "status": "completed"
}
```

할일 상태 변경은 별도 API가 아니라 `PATCH /todos/{todoId}`의 `status`로 처리한다.
상태 값은 `registered`, `in_progress`, `completed`, `canceled`만 허용한다.

할일 삭제:

```txt
DELETE /todos/{todoId}
Authorization: Bearer <token>
```

응답:

```txt
204 No Content
```

## 9. Zustand 상태 기준

`authStore`는 최소한 다음 상태와 액션을 가진다.

```ts
type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
};
```

`login` 또는 `setAuth`는 로그인 성공 시 호출한다.

`logout` 또는 `clearAuth`는 다음 상황에서 호출한다.

- 로그아웃
- 회원 탈퇴 성공
- 보호 API에서 401 응답 수신
- 앱 초기화 시 인증 상태를 명시적으로 비우는 경우

`todoFilterStore`는 다음 필터를 관리한다.

```ts
type TodoFilters = {
  categoryId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  status?: "registered" | "in_progress" | "completed" | "canceled";
};
```

필터 값이 비어 있으면 query parameter에 포함하지 않는다.

## 10. TanStack Query 기준

권장 query key:

```ts
["me"]
["categories"]
["todos", filters]
["todo", todoId]
```

권장 mutation 후 처리:

- 로그인 성공: `authStore.login(token, user)` 또는 `authStore.setAuth(token, user)` 호출
- 로그아웃 성공: `authStore.clearAuth()` 호출 후 query cache 정리
- 카테고리 생성 성공: `["categories"]` invalidate
- 할일 생성/수정/삭제 성공: `["todos"]` 관련 query invalidate
- 회원 정보 수정 성공: `["me"]` invalidate 또는 cache 갱신
- 회원 탈퇴 성공: `authStore.clearAuth()` 호출 후 전체 query cache clear

보호 API에서 401이 발생하면 인증 상태를 제거하고 로그인 화면으로 이동한다.

## 11. 화면 연동 흐름

초기 진입:

1. `authStore.token`이 없으면 로그인/회원가입 화면을 표시한다.
2. `authStore.token`이 있으면 `GET /users/me`로 현재 사용자를 확인한다.
3. `GET /users/me`가 401이면 인증 상태를 제거하고 로그인 화면으로 이동한다.

로그인:

1. `POST /auth/login` 호출
2. 응답의 `token`, `user`를 `authStore` 메모리 상태에 저장
3. 카테고리 목록과 할일 목록 조회
4. 할일 목록 화면으로 이동

할일 목록:

1. `GET /categories`로 카테고리 목록 조회
2. `GET /todos`로 할일 목록 조회
3. 필터 변경 시 query parameter를 갱신하여 `GET /todos` 재호출

로그아웃:

1. `POST /auth/logout` 호출
2. `authStore.clearAuth()` 호출
3. query cache 정리
4. 로그인 화면으로 이동

회원 탈퇴:

1. 사용자 확인 UI 표시
2. `DELETE /users/me` 호출
3. `authStore.clearAuth()` 호출
4. query cache 정리
5. 로그인 화면으로 이동

## 12. 에러 처리 기준

상태 코드별 권장 처리:

| Status | 의미 | 프론트엔드 처리 |
| --- | --- | --- |
| 400 | 요청 값 오류 | 필드 또는 폼 에러 표시 |
| 401 | 인증 실패 | 인증 상태 제거 후 로그인 화면 이동 |
| 403 | 권한 없음 | 접근 불가 안내 |
| 404 | 리소스 없음 | 빈 상태 또는 찾을 수 없음 안내 |
| 409 | 중복 충돌 | 이메일/카테고리 중복 안내 |
| 500 | 서버 오류 | 일반 서버 오류 안내 |

프론트엔드는 백엔드 에러의 `message`를 우선 사용하되, 사용자에게 너무 기술적인 문구가 노출되면 화면별 문구로 치환한다.

## 13. 날짜 처리

`dueDate`, `dueDateFrom`, `dueDateTo`는 `YYYY-MM-DD` 형식으로 전달한다.

예:

```txt
2026-05-14
```

프론트엔드에서 날짜 선택 컴포넌트를 사용할 때 시간 정보는 제거하고 날짜 문자열만 API에 전달한다.

`createdAt`, `updatedAt`은 ISO date-time 문자열이다. 화면 표시는 프론트엔드에서 지역 시간 기준으로 포맷한다.

## 14. 통합 체크리스트

- [x] `VITE_API_BASE_URL`이 `http://localhost:3000/api`를 가리킨다.
- [x] 백엔드 `backend/.env`의 `CORS_ORIGIN`이 프론트엔드 개발 서버 Origin과 일치한다.
- [x] 로그인 성공 시 JWT가 Zustand 메모리 상태에만 저장된다.
- [x] `localStorage`, `sessionStorage`, 쿠키에 JWT가 저장되지 않는다.
- [x] 보호 API 요청에 `Authorization: Bearer <token>`이 포함된다.
- [x] `204 No Content` 응답을 JSON 파싱하지 않는다.
- [x] 401 응답 시 인증 상태를 제거하고 로그인 화면으로 이동한다.
- [x] 할일 상태 변경은 `PATCH /todos/{todoId}`의 `status`로 처리한다.
- [x] 할일 필터는 `categoryId`, `dueDateFrom`, `dueDateTo`, `status` query parameter로 전달한다.
- [x] 할일 목록에서는 상태 변경 체크박스를 제공하지 않고, 편집 화면의 상태 선택으로 변경한다.
- [x] 기본 카테고리는 현재 사용자 언어에 맞게 표시하고, 사용자 추가 카테고리는 입력한 이름 그대로 표시한다.
- [x] 회원 탈퇴 성공 후 인증 상태와 query cache를 정리한다.

## 15. 현재 구현 및 검증 상태

2026-05-14 기준 프론트엔드는 이 문서의 통합 기준에 맞춰 구현되었다.

- API base URL은 `frontend/src/shared/constants/env.ts`에서 `VITE_API_BASE_URL`을 읽고 기본값은 `http://localhost:3000/api`이다.
- 공통 HTTP client는 `Authorization: Bearer <token>` 헤더, JSON body, `204 No Content`, 공통 오류 응답, 401 인증 초기화를 처리한다.
- JWT는 Zustand `authStore` 메모리 상태에만 저장하며 `localStorage`, `sessionStorage`, 쿠키를 사용하지 않는다.
- 화면은 `/login`, `/signup`, `/todos`, `/todos/new`, `/todos/:todoId/edit`, `/profile` 라우트로 구성되어 있다.
- Todo 생성, 수정, 삭제, 상태 변경 후 관련 TanStack Query 캐시를 invalidate 또는 clear한다.
- 회원 탈퇴와 로그아웃 성공 후 인증 상태와 query cache를 정리하고 로그인 화면으로 이동한다.
- 검증 명령: `npm run build`, `npm run test:coverage`
- 검증 결과: 프론트엔드 테스트 18개 파일, 62개 테스트 통과, 전체 statement coverage 95.7%
