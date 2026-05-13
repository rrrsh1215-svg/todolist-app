# TodoListApp 프로젝트 구조 설계 원칙

## 1. 최상위 원칙

TodoListApp은 인증된 개인 사용자가 본인 소유의 할일과 카테고리만 관리하는 개인용 Todo 관리 서비스이다. 프로젝트 구조는 사용자별 데이터 격리, 인증 기반 접근 제어, 도메인 중심 모듈 분리를 최우선 원칙으로 한다.

핵심 도메인은 다음 네 가지로 구분한다.

- `auth`: 회원가입, 로그인, 로그아웃, JWT 인증
- `users`: 내 정보 조회/수정, 회원 탈퇴
- `todos`: 할일 등록, 조회, 수정, 삭제, 완료 여부 변경, 필터링
- `categories`: 기본 카테고리 조회, 사용자 추가 카테고리 생성

프론트엔드와 백엔드는 동일한 도메인 용어를 사용한다. API 경로, 타입, 테스트 이름, 디렉토리 이름은 도메인 정의서와 PRD의 용어를 기준으로 맞춘다.

MVP 범위에 포함되지 않는 OAuth Social 인증, 다크 모드, 다국어, 협업 기능, 반복 일정, 알림, 파일 첨부, 외부 캘린더, 관리자 기능은 초기 디렉토리 구조에 별도 모듈로 만들지 않는다.

## 2. 기술 기준

프로젝트 구현 기술은 `docs/2-prd.md`의 기술 스택을 기준으로 고정한다.

- 프론트엔드: React 19 + TypeScript + Zustand + TanStack Query
- 백엔드: Node.js + Express 기반 REST API
- 데이터베이스: PostgreSQL 17
- DB 연동: `pg` 라이브러리
- 인증: MVP는 JWT 기반 인증
- JWT 저장: Zustand `authStore`의 메모리 상태
- 향후 인증 확장: OAuth Social 인증
- UI: 데스크톱과 모바일 브라우저를 지원하는 반응형 웹 UI

구현 문서, 아키텍처 문서, 테스트 문서에서 기술 스택을 언급할 때는 위 기준과 다른 버전 또는 대체 라이브러리를 임의로 도입하지 않는다.

## 3. 의존성 및 레이어 원칙

### 3.1 공통 원칙

- 상위 레이어는 하위 레이어를 사용할 수 있지만, 하위 레이어가 상위 레이어를 참조하지 않는다.
- 도메인 규칙은 화면 컴포넌트나 라우터가 아니라 서비스/도메인 처리 계층에 둔다.
- 인증 사용자 ID는 모든 보호 기능의 기본 입력으로 취급한다.
- 본인 소유 데이터 접근 제한은 프론트엔드 표시 로직이 아니라 백엔드에서 강제한다.

### 3.2 백엔드 레이어

백엔드는 다음 방향으로만 의존한다.

```txt
routes -> controllers -> services -> repositories -> database
```

- `routes`: URL, HTTP method, 인증/검증 미들웨어 연결
- `controllers`: HTTP 요청 파싱, 응답 변환, 에러 전달
- `services`: 유스케이스, 업무 규칙, 트랜잭션 흐름
- `repositories`: `pg` 기반 SQL 실행, DB row 매핑
- `database`: PostgreSQL 연결 풀, 마이그레이션, seed

JWT 검증은 인증 미들웨어에서 수행한다. Todo, Category, User 데이터 접근은 서비스 또는 리포지토리에서 `user_id` 조건으로 제한한다.

회원 탈퇴처럼 여러 테이블 변경이 필요한 유스케이스는 서비스 레이어에서 트랜잭션으로 처리한다.

### 3.3 프론트엔드 레이어

프론트엔드는 서버 상태와 클라이언트 상태를 분리한다.

- TanStack Query: 사용자 정보, 할일 목록, 카테고리 목록 등 서버 상태
- Zustand: JWT 메모리 저장 상태, 인증 UI 상태, 필터 선택값, 모달 상태 등 클라이언트 상태

컴포넌트는 직접 `fetch`를 호출하지 않는다. API 호출은 `features/*/api` 또는 `shared/api`에 두고, 화면은 Query/Mutation 훅을 통해 데이터를 사용한다.

## 4. 코드 및 네이밍 원칙

### 4.1 도메인 네이밍

- 엔티티 타입: `User`, `Todo`, `Category`
- API 리소스: `/auth`, `/users/me`, `/todos`, `/categories`
- DB 테이블: `users`, `todos`, `categories`
- 프론트엔드 기능 폴더: `auth`, `users`, `todos`, `categories`

### 4.2 TypeScript 네이밍

- 요청 DTO: `CreateTodoRequest`, `UpdateTodoRequest`, `LoginRequest`
- 응답 DTO: `TodoResponse`, `CategoryResponse`, `UserResponse`
- 필터 타입: `TodoFilters`
- API 훅: `useTodos`, `useCreateTodo`, `useUpdateTodo`, `useDeleteTodo`
- Zustand store: `authStore`, `todoFilterStore`

### 4.3 데이터 필드 네이밍

- DB 컬럼은 `snake_case`를 사용한다.
- TypeScript 객체 필드는 `camelCase`를 사용한다.
- 완료 여부는 MVP에서 완료/미완료만 존재하므로 boolean으로 표현한다.
- DB 컬럼명은 `is_completed`, API/프론트엔드 필드는 `isCompleted`를 사용한다.
- 종료예정일은 날짜 단위로 관리하며 DB 컬럼명은 `due_date`, API/프론트엔드 필드는 `dueDate`를 사용한다.

### 4.4 카테고리 모델 원칙

기본 카테고리와 사용자 추가 카테고리는 하나의 `categories` 모델로 관리한다.

- 기본 카테고리: `user_id = null`, `is_default = true`
- 사용자 추가 카테고리: `user_id = current_user.id`, `is_default = false`
- MVP 기본 카테고리: `일반`, `업무`, `개인`, `학습`

## 5. 테스트 및 품질 원칙

테스트는 PRD의 수용 기준 `AC-001`부터 `AC-009`와 사용자 시나리오의 오류 흐름을 기준으로 작성한다.

### 5.1 백엔드 필수 테스트

- JWT 없이 보호 API 접근 시 실패한다.
- 유효하지 않은 JWT로 보호 API 접근 시 실패한다.
- 다른 사용자의 할일 조회, 수정, 삭제 요청은 실패한다.
- 다른 사용자의 사용자 추가 카테고리 접근은 실패한다.
- 할일 등록 시 할일명과 카테고리는 필수로 검증한다.
- 카테고리, 종료예정일 기간, 완료 여부 복합 필터가 정상 동작한다.
- 회원 탈퇴 시 사용자 계정, 본인 소유 할일, 사용자 추가 카테고리가 즉시 삭제된다.
- 기본 카테고리는 모든 인증 사용자에게 조회된다.

### 5.2 프론트엔드 필수 테스트

- 로그인 성공 후 할일 목록 화면으로 진입한다.
- 로그아웃 시 Zustand `authStore`의 메모리 JWT가 삭제되고 비인증 상태가 된다.
- 할일 생성, 수정, 삭제, 완료 여부 변경 후 목록 캐시가 갱신된다.
- 필터 변경 시 할일 목록 요청 조건이 갱신된다.
- 필터 결과가 없으면 빈 상태 UI를 표시한다.
- 인증 실패 또는 만료 시 로그인 화면으로 이동한다.

### 5.3 공통 품질 기준

- TypeScript `strict` 모드를 사용한다.
- API 요청/응답 타입을 명시한다.
- 입력값 검증은 프론트엔드와 백엔드 양쪽에서 수행한다.
- 에러 응답 형식은 표준화한다.
- 주요 유스케이스는 자동화 테스트로 보호한다.
- 반응형 UI는 데스크톱과 모바일 브라우저 모두에서 확인한다.

## 6. 설정, 보안, 운영 원칙

### 6.1 설정

- 환경 설정은 코드와 분리한다.
- 백엔드는 `.env`로 DB 접속 정보, JWT secret, 서버 포트, 실행 환경을 주입받는다.
- 프론트엔드는 API base URL처럼 공개 가능한 설정만 환경 변수로 관리한다.
- 저장소에는 `.env`를 커밋하지 않고 `.env.example`만 제공한다.

### 6.2 보안

- 비밀번호는 평문 저장을 금지하고 해시로 저장한다.
- 로그인 실패 응답은 사용자 존재 여부가 과도하게 드러나지 않도록 일반화한다.
- 모든 보호 API는 JWT 인증 미들웨어를 통과해야 한다.
- JWT는 Zustand `authStore`의 메모리 상태에만 저장한다.
- JWT는 `localStorage` 또는 `sessionStorage`에 저장하지 않는다.
- 로그아웃은 MVP 기준으로 Zustand `authStore`의 JWT 삭제 방식으로 처리한다.
- 서버 측 JWT 블랙리스트는 MVP 범위에서 제외한다.
- 회원 탈퇴 후 기존 JWT로 보호 API에 접근하면 사용자 조회 실패로 거부한다.
- SQL은 `pg`의 파라미터 바인딩을 사용하고 문자열 결합 SQL을 금지한다.

### 6.3 운영

- 공통 에러 핸들러를 둔다.
- 요청 로깅을 제공한다.
- 헬스 체크 엔드포인트를 제공한다.
- DB 마이그레이션 또는 스키마 초기화 스크립트를 둔다.
- 기본 카테고리 seed 스크립트를 둔다.
- 테스트용 DB 설정은 개발/운영 설정과 분리한다.

## 7. 프론트엔드 디렉토리 구조

```txt
frontend/
  src/
    app/
      App.tsx
      router.tsx
      providers.tsx
    pages/
      LoginPage.tsx
      SignupPage.tsx
      TodoListPage.tsx
      TodoFormPage.tsx
      ProfilePage.tsx
    features/
      auth/
        api/
          authApi.ts
        hooks/
          useLogin.ts
          useSignup.ts
          useLogout.ts
        store/
          authStore.ts
        components/
          LoginForm.tsx
          SignupForm.tsx
        types.ts
      users/
        api/
          userApi.ts
        hooks/
          useMe.ts
          useUpdateMe.ts
          useDeleteAccount.ts
        components/
          ProfileForm.tsx
          DeleteAccountDialog.tsx
        types.ts
      todos/
        api/
          todoApi.ts
        hooks/
          useTodos.ts
          useCreateTodo.ts
          useUpdateTodo.ts
          useDeleteTodo.ts
          useToggleTodo.ts
        store/
          todoFilterStore.ts
        components/
          TodoList.tsx
          TodoItem.tsx
          TodoForm.tsx
          TodoFilters.tsx
          EmptyTodoState.tsx
        types.ts
      categories/
        api/
          categoryApi.ts
        hooks/
          useCategories.ts
          useCreateCategory.ts
        components/
          CategorySelect.tsx
          CategoryCreateForm.tsx
        types.ts
    shared/
      api/
        httpClient.ts
        apiError.ts
      components/
        Button.tsx
        Input.tsx
        Select.tsx
        Modal.tsx
        Loading.tsx
        ErrorMessage.tsx
      constants/
        routes.ts
        queryKeys.ts
      types/
        api.ts
      utils/
        date.ts
        validation.ts
    styles/
      global.css
    main.tsx
```

프론트엔드 구조 규칙은 다음과 같다.

- `pages`는 라우팅 단위 화면만 가진다.
- `features`는 도메인별 API, 훅, 상태, 컴포넌트를 가진다.
- `shared`는 특정 도메인에 종속되지 않는 공통 코드만 가진다.
- Query key는 `shared/constants/queryKeys.ts`에서 관리한다.
- 인증 토큰은 `authStore`의 메모리 상태에 저장하고, `httpClient`는 요청 시 해당 값을 읽어 Authorization header에 설정한다.
- Todo 필터 상태는 `todoFilterStore`에서 관리하고 API 요청 시 query parameter로 변환한다.

## 8. 백엔드 디렉토리 구조

```txt
backend/
  src/
    app.ts
    server.ts
    config/
      env.ts
      database.ts
    db/
      pool.ts
      migrations/
        001_create_users.sql
        002_create_categories.sql
        003_create_todos.sql
      seeds/
        defaultCategories.ts
    modules/
      auth/
        auth.routes.ts
        auth.controller.ts
        auth.service.ts
        auth.repository.ts
        auth.types.ts
        auth.validation.ts
      users/
        users.routes.ts
        users.controller.ts
        users.service.ts
        users.repository.ts
        users.types.ts
        users.validation.ts
      todos/
        todos.routes.ts
        todos.controller.ts
        todos.service.ts
        todos.repository.ts
        todos.types.ts
        todos.validation.ts
      categories/
        categories.routes.ts
        categories.controller.ts
        categories.service.ts
        categories.repository.ts
        categories.types.ts
        categories.validation.ts
    middlewares/
      authenticate.ts
      errorHandler.ts
      validateRequest.ts
      notFound.ts
    shared/
      errors/
        AppError.ts
        errorCodes.ts
      types/
        express.d.ts
        api.ts
      utils/
        password.ts
        jwt.ts
        date.ts
    tests/
      auth.test.ts
      users.test.ts
      todos.test.ts
      categories.test.ts
```

백엔드 구조 규칙은 다음과 같다.

- `modules`는 도메인 API 단위로 분리한다.
- `auth`는 회원가입, 로그인, 로그아웃, JWT 발급 보조 로직을 담당한다.
- `users`는 내 정보 조회/수정, 회원 탈퇴를 담당한다.
- `todos`는 할일 CRUD, 완료 상태 변경, 필터링을 담당한다.
- `categories`는 기본 카테고리 조회와 사용자 추가 카테고리 생성을 담당한다.
- 공통 미들웨어와 에러 처리는 `middlewares`에 둔다.
- 공통 유틸과 공통 타입은 `shared`에 둔다.
- SQL 접근은 각 repository 내부로 제한한다.
- PostgreSQL 연동은 반드시 `pg` 라이브러리를 사용한다.

## 9. 데이터 구조 설계 원칙

핵심 테이블은 `users`, `categories`, `todos` 세 개로 시작한다.

### users

- 이메일
- 비밀번호 해시
- 이름 또는 닉네임
- 생성일시
- 수정일시

### categories

- 카테고리명
- 기본 카테고리 여부
- 사용자 ID
- 생성일시
- 수정일시

기본 카테고리는 모든 사용자에게 조회되며 `user_id`가 없다. 사용자 추가 카테고리는 생성 사용자에게만 조회된다.

### todos

- 사용자 ID
- 카테고리 ID
- 할일명
- 설명
- 종료예정일
- 완료 여부
- 생성일시
- 수정일시

모든 Todo 조회, 수정, 삭제 쿼리는 반드시 `user_id` 조건을 포함한다.

기본 카테고리는 seed 데이터로 관리한다. 할일 완료 상태는 `is_completed = false`를 기본값으로 한다.
