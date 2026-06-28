# Implementation Plan: Chrono Schedulura — Foundation Milestone

## Overview

Build the complete project scaffold for Chrono Schedulura: monorepo structure, Docker Compose
environment, PostgreSQL + Alembic database layer, FastAPI backend with Clerk JWT validation,
Next.js 15 frontend with Clerk authentication, protected routes, landing page, authenticated app
shell, dashboard, settings, theme toggle, reusable component library, error handling, and
developer documentation. The design follows Clean Architecture; all code must be TypeScript-strict
on the frontend and fully typed with Pydantic on the backend.

---

## Tasks

- [ ] 1. Bootstrap monorepo skeleton and shared tooling
  - [ ] 1.1 Create root directory structure and configuration files
    - Create `/frontend`, `/backend` top-level directories
    - Add root `.gitignore` excluding `node_modules/`, venvs, `.env*`, build artefacts
    - Add root `README.md` placeholder and `ARCHITECTURE.md` placeholder
    - _Requirements: 1.1, 1.4, 16.1, 16.2_

  - [ ] 1.2 Initialise Next.js 15 frontend project
    - Run `create-next-app` with App Router, TypeScript strict mode, Tailwind CSS, ESLint
    - Configure `tsconfig.json`: `strict: true`, `@/` → `src/` path alias
    - Set up `src/` subdirectory layout: `app/`, `components/`, `lib/`, `hooks/`, `store/`, `types/`, `styles/`
    - _Requirements: 1.2, 1.5_

  - [ ] 1.3 Initialise FastAPI backend project
    - Create `backend/src/` layout: `api/v1/`, `core/`, `db/models/`, `schemas/`, `services/`
    - Create `requirements.txt` with pinned versions: `fastapi`, `uvicorn[standard]`, `sqlalchemy[asyncio]`, `asyncpg`, `alembic`, `pydantic-settings`, `python-jose[cryptography]`, `httpx`, `psycopg2-binary`
    - Create `backend/Dockerfile`: Python 3.12-slim base, install deps, copy src
    - _Requirements: 1.3_

  - [ ] 1.4 Create all future-module placeholder directories and `__init__.py` / `index.ts` files
    - Backend: create empty `src/ai/`, `src/workers/` directories with `__init__.py`
    - Backend: create placeholder route files `api/v1/calendar.py`, `api/v1/scheduler.py`, `api/v1/analytics.py`, `api/v1/collaboration.py`, `api/v1/habits.py`, `api/v1/notifications.py` — each containing a commented-out `router = APIRouter()` and a docstring stating which milestone implements it
    - Backend: create placeholder service files `services/calendar_service.py`, `services/scheduler_service.py`, `services/analytics_service.py`, `services/collaboration_service.py`, `services/habits_service.py`, `services/notification_service.py` — each with a `NotImplementedError` stub and milestone docstring
    - Backend: create placeholder model files `db/models/event.py`, `db/models/task.py`, `db/models/habit.py`, `db/models/notification.py`, `db/models/collaboration.py` — each importing `Base` and containing a commented-out class scaffold
    - Backend: create placeholder schema files `schemas/calendar.py`, `schemas/scheduler.py`, `schemas/analytics.py`, `schemas/collaboration.py`, `schemas/habits.py`, `schemas/notifications.py` — each with a `# TODO: Milestone N` header and empty Pydantic class stubs
    - Frontend: create empty component directories `components/calendar/`, `components/analytics/`, `components/collaboration/`, `components/habits/`, `components/notifications/`, `components/ai/` — each with an `index.ts` barrel file and a `# TODO` comment
    - Frontend: create placeholder app routes `app/(auth)/calendar/`, `app/(auth)/analytics/`, `app/(auth)/collaboration/`, `app/(auth)/habits/`, `app/(auth)/notifications/` — each with a `page.tsx` returning a "Coming Soon" placeholder UI
    - Frontend: create placeholder hook files `hooks/useNotifications.ts`, `hooks/useAI.ts`, `hooks/useAnalytics.ts` — each exporting a typed stub that returns empty/null data
    - Frontend: create placeholder lib files `lib/ai.ts`, `lib/analytics.ts` — each exporting a typed stub

- [ ] 2. Environment variable management
  - [ ] 2.1 Create frontend `.env.example`
    - List all `NEXT_PUBLIC_CLERK_*` keys, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_API_URL` with placeholder values and inline comments
    - Include all `[FUTURE]` placeholder keys for AI, notifications, collaboration, Cloudinary, monitoring with `# [FUTURE MN]` comments so they are discoverable but not required
    - _Requirements: 3.1, 3.4_

  - [ ] 2.2 Create backend `.env.example` and Pydantic Settings
    - List `DATABASE_URL`, `POSTGRES_*`, `CLERK_JWKS_URL`, `FRONTEND_URL`, `ENVIRONMENT` with comments
    - Include all `[FUTURE]` placeholder keys: `GEMINI_API_KEY`, `REDIS_URL`, `SENDGRID_API_KEY`, `SENTRY_DSN`, `ABLY_API_KEY`, `CLOUDINARY_URL` — commented out with `# [FUTURE MN]` labels
    - Implement `src/core/config.py` using `pydantic-settings` `BaseSettings`; raise `ValidationError` on missing **required** keys only; future keys use `Optional` defaults of `None`
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Docker Compose local development environment
  - [ ] 3.1 Write `docker-compose.yml`
    - Define `db` (postgres:16-alpine), `backend`, `frontend` services
    - Add healthcheck on `db`; make `backend` depend on healthy `db`
    - Expose ports 5432, 8000, 3000; mount named volume `postgres_data`
    - Load root `.env` via `env_file`
    - Backend `command` runs `alembic upgrade head && uvicorn ...`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 4. Database layer — SQLAlchemy + Alembic
  - [ ] 4.1 Set up SQLAlchemy async engine and session factory
    - Implement `backend/src/db/base.py`: async engine, `async_sessionmaker`, `Base` declarative class, `get_db` async generator with commit/rollback/close
    - _Requirements: 4.1, 4.2, 4.5_

  - [ ] 4.2 Define User ORM model
    - Implement `backend/src/db/models/user.py` with columns: `id` (UUID PK), `clerk_user_id` (unique, indexed), `email` (unique, indexed), `display_name` (nullable, max 80), `timezone` (nullable, max 64), `created_at`, `updated_at` (both timezone-aware, auto-set/updated)
    - Add inline docstring on the class
    - _Requirements: 4.6_

  - [ ] 4.3 Configure Alembic and create initial migration
    - Configure `alembic.ini` and `alembic/env.py` to use async engine and import `Base.metadata`
    - Generate migration `001_create_users.py` that creates the `users` table
    - _Requirements: 4.3, 4.4, 4.6_

  - [ ]* 4.4 Write unit tests for database session lifecycle
    - Verify `get_db` commits on success, rolls back on exception, and closes session in all paths
    - _Requirements: 4.2_

- [ ] 5. Backend API structure and health endpoint
  - [ ] 5.1 Implement FastAPI app factory and middleware
    - Implement `src/main.py`: `create_app()` factory with `asynccontextmanager` lifespan, CORS middleware (origin from `FRONTEND_URL`), mount `api_v1_router` at `/api/v1`, global unhandled-exception handler (log traceback → HTTP 500 `INTERNAL_ERROR`)
    - Call `configure_logging()` in lifespan startup; call `instrument_app(app)` before router registration
    - Disable `/docs` when `is_production=True`
    - _Requirements: 5.1, 5.3, 5.6, 5.7_

  - [ ] 5.2 Implement central router and health endpoint
    - Implement `src/api/v1/router.py` that mounts `health`, `auth`, `users` sub-routers; include commented-out lines for all future module routers (calendar, scheduler, analytics, collaboration, habits, notifications)
    - Implement `GET /api/v1/health` returning `{"status": "ok"}`
    - Add inline docstrings to route handler
    - _Requirements: 5.2, 5.4_

  - [ ] 5.3 Implement Pydantic schemas
    - Implement `src/schemas/user.py`: `UserRead`, `UserUpdate` (display_name 2–80 chars, timezone ≤ 64 chars)
    - Implement `src/schemas/common.py`: `ErrorResponse`, `HealthResponse`, `PaginatedResponse[T]` generic
    - Add docstrings on all schema classes
    - _Requirements: 5.5_

  - [ ] 5.4 Implement structured logging and metrics stub
    - Implement `src/core/logging.py`: `JSONFormatter`, `configure_logging()`, `get_logger()` — all modules use `get_logger(__name__)`, never `print()`
    - Implement `src/core/monitoring.py`: `MetricsMiddleware` (no-op), `instrument_app()` — swap `_record_request()` stub for real Prometheus/Datadog in a future milestone with no other changes required
    - _Design: Extensibility Architecture — Structured Logging, Metrics Stub_

  - [ ]* 5.5 Write property test for consistent error response format
    - **Property 1: Consistent error response format**
    - For any 4xx/5xx response, body MUST contain both `detail: str` and `code: str`
    - **Validates: Requirements 5.5, 5.6**

- [ ] 6. Backend JWT validation (Clerk JWKS)
  - [ ] 6.1 Implement JWKS cache and JWT decoder
    - Implement `src/core/security.py`: `get_jwks()` with 300-second in-memory TTL cache, `decode_clerk_jwt()` decoding with RS256 + `iss`/`exp` verification
    - Use `get_logger(__name__)` for all log output
    - Raise HTTP 401 `INVALID_TOKEN` on any `JWTError`
    - _Requirements: 6.1, 6.4, 6.5, 6.7_

  - [ ] 6.2 Implement `get_current_user` FastAPI dependency
    - Implement `src/core/dependencies.py`: `HTTPBearer` extraction, call `decode_clerk_jwt`, raise HTTP 401 `MISSING_TOKEN` if header absent/malformed, return `payload["sub"]`
    - _Requirements: 6.2, 6.3, 6.6_

  - [ ]* 6.3 Write property test for missing/malformed token → MISSING_TOKEN 401
    - **Property 2: Missing or malformed token returns MISSING_TOKEN 401**
    - For any request to a protected endpoint without a valid `Authorization: Bearer …` header, response must be 401 `MISSING_TOKEN`
    - **Validates: Requirements 6.3**

  - [ ]* 6.4 Write property test for invalid/expired JWT → INVALID_TOKEN 401
    - **Property 3: Invalid or expired JWT returns INVALID_TOKEN 401**
    - For any Bearer token with invalid signature, wrong `iss`, or expired `exp`, response must be 401 `INVALID_TOKEN`
    - **Validates: Requirements 6.4, 6.5**

  - [ ]* 6.5 Write property test for valid JWT sub extraction
    - **Property 4: Valid JWT yields correct Clerk user ID**
    - For any well-formed unexpired JWT with `sub` claim, `get_current_user` MUST return exactly that `sub` value
    - **Validates: Requirements 6.6**

- [ ] 7. Backend users API and Clerk webhook
  - [ ] 7.1 Implement user service and users router
    - Implement `src/services/user_service.py`: `get_or_create_user`, `update_user` business logic with docstrings; use `get_logger(__name__)` for all logging
    - Implement `src/api/v1/users.py`: `GET /api/v1/users/me`, `PATCH /api/v1/users/me` (protected via `get_current_user`), returning `UserRead`
    - _Requirements: 6.6, 12.4_

  - [ ] 7.2 Implement Clerk webhook endpoint
    - Implement `src/api/v1/auth.py`: `POST /api/v1/auth/webhook/clerk` handles `user.created` event, upserts local `users` row
    - Add docstring on route handler
    - _Requirements: 8.4_

  - [ ] 7.3 Implement AI module interfaces and worker base class
    - Implement `src/ai/interfaces.py`: `AIPriority`, `AIScheduleRequest`, `AIScheduleResult`, `AISuggestion`, `AIServiceProtocol` — fully typed, no business logic
    - Implement `src/workers/base.py`: `BaseWorker` abstract class with `start()`, `stop()`, `_run()` — used by all future workers; wires into lifespan shutdown via `stop()`
    - These files are **live now** — they validate the architecture contract without requiring Gemini or Redis
    - _Design: Extensibility Architecture — AI Module Interfaces, Background Worker Base_

- [ ] 8. Checkpoint — backend green
  - Ensure all tests pass and `GET /api/v1/health` returns 200. Ask the user if questions arise.

- [ ] 9. Frontend — root layout and theme
  - [ ] 9.1 Configure Tailwind CSS with brand colour tokens
    - Extend `tailwind.config.ts` with `primary`, `secondary`, `accent`, `background`, `surface`, `text` colour tokens for both light and dark modes as specified in the design
    - Create `src/styles/themes.css` with CSS custom properties
    - _Requirements: 13.4, 13.5_

  - [ ] 9.2 Implement root layout with ClerkProvider and ThemeProvider
    - Implement `src/app/layout.tsx`: wrap app in `<ClerkProvider>` (publishable key from env) and `next-themes` `<ThemeProvider>` with `defaultTheme="system"` and `storageKey="theme"`
    - _Requirements: 7.1, 13.1, 13.3_

  - [ ] 9.3 Implement `useTheme` hook and `ThemeToggle` component
    - Implement `src/hooks/useTheme.ts` wrapping `next-themes` `useTheme`
    - Implement `src/components/shared/ThemeToggle.tsx`: button with `aria-label="Toggle theme"`, `aria-live` region, sun/moon icons; calls toggle on click
    - _Requirements: 13.2, 13.3_

  - [ ]* 9.4 Write property test for theme toggle round-trip
    - **Property 5: Theme toggle round-trip**
    - Two consecutive toggles from any initial state must restore the original theme and update `localStorage` key `theme` correctly after each toggle
    - **Validates: Requirements 13.2, 13.3**

- [ ] 10. Frontend — authentication and route protection
  - [ ] 10.1 Implement Clerk middleware for route protection
    - Implement `src/middleware.ts`: `clerkMiddleware` with `createRouteMatcher` for public routes (`/`, `/login`, `/register`, `/api/webhook/clerk`); call `auth().protect()` for all other routes
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 10.2 Implement `useAuth` hook and auth type definitions
    - Implement `src/hooks/useAuth.ts` abstracting Clerk SDK; expose `user`, `token`, `isLoaded`, `isSignedIn`, `signOut`
    - Add `src/types/user.ts` (`User` interface) and `src/types/api.ts` (`ApiError`, `PaginatedResponse<T>`)
    - Add JSDoc on hook and types
    - _Requirements: 7.6_

  - [ ] 10.3 Implement `/login` and `/register` pages
    - Implement `src/app/(public)/login/page.tsx` with Clerk `<SignIn>` component; redirect to `/dashboard` after sign-in
    - Implement `src/app/(public)/register/page.tsx` with Clerk `<SignUp>` component; redirect to `/dashboard` after sign-up
    - _Requirements: 7.2, 7.3, 7.4_

  - [ ] 10.4 Create all shared frontend type contract files
    - Create `src/types/calendar.ts` with `CalendarEvent`, `RecurrenceRule`, `CalendarViewMode` — marked `[FUTURE M2]`
    - Create `src/types/scheduler.ts` with `Task`, `AIScheduleResult`, `AISuggestion` — marked `[FUTURE M3]`
    - Create `src/types/analytics.ts` with `AnalyticsEvent`, `ProductivityReport` — marked `[FUTURE M4]`
    - Create `src/types/collaboration.ts` with `Workspace`, `WorkspaceMember` — marked `[FUTURE M5]`
    - Create `src/types/notifications.ts` with `Notification` — marked `[FUTURE M3]`
    - Create `src/types/ai.ts` with `AIRequest`, `AIResponse` — marked `[FUTURE M3]`
    - All types are exported but no component imports them until the relevant milestone
    - _Design: Extensibility Architecture — Shared Frontend Type Contracts_

- [ ] 11. Frontend — API client and query infrastructure
  - [ ] 11.1 Implement Axios API client with JWT interceptor
    - Implement `src/lib/api.ts`: Axios instance with `baseURL` from `NEXT_PUBLIC_API_URL`, request interceptor injecting Bearer token via `useAuth`, response interceptor dispatching `auth:unauthorized` event on 401 and toast on `ERR_NETWORK`
    - Add JSDoc on the module
    - _Requirements: 15.3, 15.5_

  - [ ] 11.2 Configure TanStack Query client
    - Implement `src/lib/queryClient.ts`: `QueryClient` with sensible defaults (retry, staleTime)
    - Wrap `AuthLayout` with `<QueryClientProvider>`
    - _Requirements: 15.4_

- [ ] 12. Frontend — reusable component library
  - [ ] 12.1 Install and configure shadcn/ui base components
    - Add shadcn/ui components: `Button`, `Input`, `Select`, `Card`, `Badge`, `Skeleton`, `Toast`/Sonner, `Dialog`, `Tooltip`, `Avatar`
    - Create barrel export `src/components/ui/index.ts` re-exporting all components
    - Ensure each component accepts `className` prop and forwards refs
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ] 12.2 Implement `PageLoader` and `ErrorBoundary` shared components
    - Implement `src/components/shared/PageLoader.tsx`: full-screen centred spinner
    - Implement `src/components/shared/ErrorBoundary.tsx`: catches render errors, shows fallback card with error message and "Reload page" button
    - Add JSDoc on both components
    - _Requirements: 14.4, 14.5_

  - [ ] 12.3 Add `loading.tsx` route-level loaders
    - Add `src/app/(auth)/loading.tsx` rendering `<PageLoader>` for authenticated route transitions
    - Add `src/app/(public)/loading.tsx` for public routes
    - _Requirements: 15.1_

- [ ] 13. Frontend — authenticated app shell
  - [ ] 13.1 Implement `useSidebar` hook and Zustand `uiStore`
    - Implement `src/store/uiStore.ts` with Zustand: `collapsed`, `mobileDrawerOpen` state
    - Implement `src/hooks/useSidebar.ts`: reads/writes `localStorage` key `sidebar_collapsed`, exposes `collapsed` and `toggle`
    - Add JSDoc on hook and store
    - _Requirements: 10.4_

  - [ ] 13.2 Create future-module Zustand store stubs
    - Implement `src/store/calendarStore.ts`: typed stub with `viewMode`, `selectedDate`, `events`, `setViewMode`, `setSelectedDate` — no-op setters, empty events array — marked `[FUTURE M2]`
    - Implement `src/store/notificationStore.ts`: typed stub with `notifications`, `unreadCount`, `markAsRead` — marked `[FUTURE M3]`
    - Implement `src/store/collaborationStore.ts`: typed stub with `activeWorkspaceId`, `onlineMembers` — marked `[FUTURE M5]`
    - All stubs import from the canonical `src/types/` files, validating the type contracts compile correctly
    - _Design: Extensibility Architecture — Frontend Feature Store Stubs_

  - [ ]* 13.3 Write property test for sidebar state persistence round-trip
    - **Property 6: Sidebar state persistence round-trip**
    - Storing any sidebar state to `localStorage` and restoring it must yield the identical state value
    - **Validates: Requirements 10.4**

  - [ ] 13.4 Implement Sidebar component
    - Implement `src/components/layout/Sidebar.tsx`: Framer Motion `motion.aside` animated between 240 px (expanded) and 64 px (collapsed) with 200 ms `easeInOut` transition
    - Render `NAV_ITEMS` (Dashboard, Settings active; Calendar, Analytics, Collaboration, Habits, Notifications greyed, `aria-disabled="true"`, `tabIndex={-1}`)
    - `aria-label="Main navigation"`, `aria-current="page"` on active link
    - Respects `prefers-reduced-motion` via `useReducedMotion`
    - _Requirements: 10.2, 10.3_

  - [ ] 13.5 Implement Navbar component
    - Implement `src/components/layout/Navbar.tsx`: logo left, `<ThemeToggle>` centre-right, Clerk `<UserButton>` far right, hamburger button (< 768 px) that sets `mobileDrawerOpen`
    - _Requirements: 10.5, 10.6_

  - [ ] 13.6 Implement mobile drawer and authenticated layout
    - Implement `src/components/layout/MobileDrawer.tsx`: overlay drawer for Sidebar on mobile
    - Implement `src/app/(auth)/layout.tsx`: renders Sidebar + Navbar + `{children}`; hides Sidebar on mobile, shows `MobileDrawer` instead; wraps with `<QueryClientProvider>` and `<ErrorBoundary>`
    - Handle `auth:unauthorized` event: call `signOut` + redirect to `/login`
    - _Requirements: 10.1, 10.6, 15.5_

- [ ] 14. Frontend — Dashboard page
  - [ ] 14.1 Implement StatCard and SkeletonCard components
    - Implement `src/components/dashboard/StatCard.tsx`: card with title and value
    - Implement `src/components/dashboard/SkeletonCard.tsx`: skeleton variant with `aria-busy="true"` and `aria-label="Loading content"`
    - _Requirements: 11.3, 11.4_

  - [ ] 14.2 Implement Dashboard page
    - Implement `src/app/(auth)/dashboard/page.tsx`
    - Read user first name from Clerk session; render personalised greeting containing the first name
    - Render three `StatCard` placeholders ("Upcoming Events", "Tasks Pending", "Collaborators") with `SkeletonCard` while loading
    - Single-column on mobile, 3-column grid at ≥ 1024 px
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 14.3 Write property test for dashboard greeting contains user's first name
    - **Property 8: Dashboard greeting contains user's first name**
    - For any authenticated user with a non-empty first name, the rendered greeting string must contain that exact first name
    - **Validates: Requirements 11.2**

- [ ] 15. Frontend — Settings page
  - [ ] 15.1 Implement `TimezoneSelect` and `ProfileForm` components
    - Implement `src/components/settings/TimezoneSelect.tsx`: `<Select>` populated with IANA timezone list
    - Implement `src/components/settings/ProfileForm.tsx`: React Hook Form + Zod schema (display_name: required, 2–80 trimmed chars; timezone: required IANA value); shows inline field errors; submit button disables + shows spinner while request in flight
    - _Requirements: 12.3, 12.5, 15.2_

  - [ ]* 15.2 Write property test for profile form display name validation
    - **Property 7: Profile form display name validation**
    - Zod schema MUST accept strings whose trimmed length is 2–80 chars and reject all others with a validation error
    - **Validates: Requirements 12.3**

  - [ ]* 15.3 Write property test for in-flight request disables trigger button
    - **Property 9: In-flight API request disables trigger button**
    - While any API request is in flight the triggering button MUST be disabled and display a spinner
    - **Validates: Requirements 15.2**

  - [ ] 15.4 Implement Settings page
    - Implement `src/app/(auth)/settings/page.tsx`
    - Display user email and display name from Clerk session
    - Render `<ProfileForm>` wired to `PATCH /api/v1/users/me`; show success toast on 200; show inline error on failure without clearing form data
    - _Requirements: 12.1, 12.2, 12.4, 12.5_

- [ ] 16. Frontend — Landing page
  - [ ] 16.1 Implement Landing page components
    - Implement `src/components/landing/LandingNav.tsx`: nav bar with logo, links to `/login` and `/register`
    - Implement `src/components/landing/Hero.tsx`: platform name, tagline, CTA button → `/register`
    - Implement `src/components/landing/Features.tsx`: ≥ 3 feature cards with icons
    - _Requirements: 9.2, 9.3, 9.4_

  - [ ] 16.2 Implement Landing page as server component
    - Implement `src/app/(public)/page.tsx` composing `<LandingNav>`, `<Hero>`, `<Features>` as a pure server component
    - Responsive layout: single column at 320 px, adapts at 768 px and 1280 px
    - Semantic HTML landmarks (`<header>`, `<main>`, `<section>`, `<footer>`), sufficient colour contrast, ARIA labels
    - _Requirements: 9.1, 9.5, 9.6_

- [ ] 17. Checkpoint — full-stack integration
  - Ensure all automated tests pass, the authenticated shell renders correctly, and the landing page is accessible. Ask the user if questions arise.

- [ ] 18. Documentation
  - [ ] 18.1 Write root `README.md`
    - Cover: project overview, prerequisites (Docker, Node, Python), `docker-compose up` setup, env var guide, available npm/Python scripts
    - _Requirements: 16.1_

  - [ ] 18.2 Write `ARCHITECTURE.md`
    - Describe Clean Architecture layers (Frontend and Backend), technology rationale, annotated monorepo folder structure, five-milestone roadmap
    - _Requirements: 16.2_

  - [ ] 18.3 Add inline docstrings and JSDoc
    - Add inline docstrings to all FastAPI route handlers, Pydantic schemas, and SQLAlchemy models not yet covered
    - Add JSDoc to all custom hooks, utility functions, and Reusable Components not yet covered
    - _Requirements: 16.3, 16.4_

- [ ] 19. Final checkpoint — production readiness check
  - Ensure all tests pass, TypeScript compiles with zero errors, and the Docker Compose stack starts cleanly. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements or design sections for full traceability
- Checkpoints (tasks 8, 17, 19) are not implementation tasks — verify all prior tasks pass before proceeding
- Property tests validate universal correctness properties defined in the design document
- The backend uses `python-jose` for JWT decoding; ensure the JWKS keys are fetched asynchronously with the 300-second cache to avoid rate limiting
- All frontend components must apply `dark:` Tailwind variants; test both themes before marking tasks complete
- Framer Motion animations in the Sidebar must check `useReducedMotion()` and skip animation if true
- **Extensibility tasks (1.4, 5.4, 7.3, 10.4, 13.2) are non-negotiable for this milestone** — they create zero coupling to future modules but prevent future restructuring

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0,  "tasks": ["1.1"] },
    { "id": 1,  "tasks": ["1.2", "1.3"] },
    { "id": 2,  "tasks": ["1.4", "2.1", "2.2", "3.1"] },
    { "id": 3,  "tasks": ["4.1", "4.2"] },
    { "id": 4,  "tasks": ["4.3", "5.1", "5.3"] },
    { "id": 5,  "tasks": ["4.4", "5.2", "5.4", "6.1"] },
    { "id": 6,  "tasks": ["5.5", "6.2"] },
    { "id": 7,  "tasks": ["6.3", "6.4", "6.5", "7.1"] },
    { "id": 8,  "tasks": ["7.2", "7.3"] },
    { "id": 9,  "tasks": ["9.1"] },
    { "id": 10, "tasks": ["9.2", "10.1", "10.2", "11.1", "12.1"] },
    { "id": 11, "tasks": ["9.3", "9.4", "10.3", "10.4", "11.2", "12.2", "12.3", "13.1"] },
    { "id": 12, "tasks": ["13.2", "13.3", "13.4"] },
    { "id": 13, "tasks": ["13.5", "13.6"] },
    { "id": 14, "tasks": ["14.1", "15.1", "16.1"] },
    { "id": 15, "tasks": ["14.2", "15.2", "15.3", "16.2"] },
    { "id": 16, "tasks": ["14.3", "15.4"] },
    { "id": 17, "tasks": ["18.1", "18.2", "18.3"] }
  ]
}
```
