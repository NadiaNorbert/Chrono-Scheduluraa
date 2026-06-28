# Requirements Document

## Introduction

Chrono Schedulura is a production-ready AI-powered scheduling platform built as a monorepo with a Next.js 15 frontend and a FastAPI backend. This requirements document covers the **Foundation Milestone** only: project scaffolding, authentication via Clerk, responsive navigation shell, dashboard layout, theme toggling, public-facing pages, protected routes, database configuration, and the base FastAPI API structure. Future milestones (Calendar, AI Scheduling, Analytics, Collaboration) are architecturally prepared for but not implemented here.

---

## Glossary

- **Platform**: The Chrono Schedulura application as a whole, comprising the Frontend and the Backend.
- **Frontend**: The Next.js 15 / React / TypeScript application located at `/frontend`.
- **Backend**: The FastAPI / Python application located at `/backend`.
- **Auth Service**: Clerk, the third-party authentication provider used by the Platform.
- **JWT**: JSON Web Token issued by the Auth Service and validated by the Backend.
- **JWKS Endpoint**: The Clerk JSON Web Key Set endpoint used by the Backend to verify JWT signatures.
- **Database**: The PostgreSQL 16 relational database managed by Alembic migrations.
- **ORM**: SQLAlchemy, the Python object-relational mapper used by the Backend.
- **Migration Tool**: Alembic, used to manage Database schema versions.
- **Sidebar**: The collapsible vertical navigation component rendered on authenticated pages.
- **Navbar**: The top horizontal navigation bar rendered on all authenticated pages.
- **Dashboard**: The main authenticated landing page displaying a welcome summary.
- **Landing Page**: The public marketing page at the root URL (`/`).
- **Theme**: The active colour scheme — either `light` or `dark`.
- **Protected Route**: A Frontend route that requires an authenticated session to access.
- **Public Route**: A Frontend route accessible without an authenticated session.
- **Docker Compose**: The local development orchestration file that starts PostgreSQL, the Backend, and the Frontend services.
- **Environment Variable**: A runtime configuration value stored outside source code (`.env` files).
- **Reusable Component**: A typed, accessible React component intended for use across multiple pages.
- **Loading State**: A visual indicator shown while asynchronous data or navigation is in progress.
- **Error Boundary**: A React component that catches rendering errors and displays a fallback UI.

---

## Requirements

### Requirement 1 — Monorepo Project Structure

**User Story:** As a developer, I want a well-organised monorepo layout with clear separation between frontend and backend, so that the codebase scales cleanly across future milestones without major refactoring.

#### Acceptance Criteria

1. THE Platform SHALL provide a root-level directory structure containing `/frontend`, `/backend`, `/docker-compose.yml`, and a root `README.md`.
2. THE Frontend SHALL use a `src/` directory organised by `app/` (Next.js App Router pages), `components/` (shared UI), `lib/` (utilities and API clients), `hooks/` (custom React hooks), `store/` (Zustand state), `types/` (TypeScript interfaces), and `styles/` (global CSS).
3. THE Backend SHALL use a `src/` directory organised by `api/` (route handlers), `core/` (config, security, dependencies), `db/` (SQLAlchemy models, session), `schemas/` (Pydantic models), `services/` (business logic), and `alembic/` (migration scripts).
4. THE Platform SHALL include a root-level `.gitignore` that excludes `node_modules/`, Python virtual environment directories, `.env` files, and compiled build artefacts.
5. THE Platform SHALL include `tsconfig.json` in the Frontend with strict mode enabled and path aliases configured so that `@/` resolves to `src/`.

---

### Requirement 2 — Docker Compose Local Development Environment

**User Story:** As a developer, I want a single `docker-compose up` command to start all local services, so that onboarding is fast and consistent across machines.

#### Acceptance Criteria

1. THE Docker Compose SHALL define three services: `db` (PostgreSQL 16), `backend` (FastAPI), and `frontend` (Next.js).
2. WHEN the `db` service starts, THE Docker Compose SHALL expose PostgreSQL on host port `5432` and persist data using a named Docker volume.
3. WHEN the `backend` service starts, THE Docker Compose SHALL wait for the `db` service to be healthy before accepting connections.
4. WHEN the `frontend` service starts, THE Docker Compose SHALL expose the Next.js development server on host port `3000`.
5. THE Docker Compose SHALL load environment variables from a root `.env` file for all three services.
6. THE Backend Docker image SHALL install Python dependencies from `requirements.txt` and run Alembic migrations automatically on container start before launching the FastAPI server.

---

### Requirement 3 — Environment Variable Management

**User Story:** As a developer, I want all secrets and environment-specific values managed through `.env` files, so that no credentials are committed to source control.

#### Acceptance Criteria

1. THE Frontend SHALL read environment variables exclusively through `process.env` with `NEXT_PUBLIC_` prefix for client-side variables and unprefixed variables for server-side use.
2. THE Backend SHALL read environment variables through a Pydantic `BaseSettings` class that validates required keys on application startup.
3. IF a required Backend environment variable is missing at startup, THEN THE Backend SHALL raise a `ValueError` with a descriptive message and exit with a non-zero status code.
4. THE Platform SHALL include `.env.example` files in both `/frontend` and `/backend` listing all required variable names with placeholder values and inline comments describing each variable's purpose.
5. THE Platform SHALL list `.env`, `.env.local`, and `.env.*.local` in `.gitignore` to prevent accidental secret exposure.

---

### Requirement 4 — Database Configuration

**User Story:** As a developer, I want a PostgreSQL database wired to SQLAlchemy with Alembic migrations, so that the schema evolves safely and the Backend can persist data reliably.

#### Acceptance Criteria

1. THE Backend SHALL establish a SQLAlchemy async engine connected to the PostgreSQL Database using the `DATABASE_URL` environment variable.
2. THE Backend SHALL provide a FastAPI dependency, `get_db`, that yields an async database session and closes the session after the request completes.
3. THE Migration Tool SHALL manage all schema changes through versioned migration scripts stored in `backend/alembic/versions/`.
4. WHEN a new migration is applied, THE Migration Tool SHALL record the applied revision in the `alembic_version` table of the Database.
5. THE Backend SHALL define a `Base` declarative base class that all ORM models inherit from, enabling Alembic autogenerate to detect schema changes.
6. THE Backend SHALL include an initial Alembic migration that creates a `users` table with columns: `id` (UUID primary key), `clerk_user_id` (unique string), `email` (unique string), `created_at` (timestamp with timezone, defaulting to now), and `updated_at` (timestamp with timezone, auto-updated on change).

---

### Requirement 5 — Backend API Structure and Health Endpoint

**User Story:** As a developer, I want a structured FastAPI application with versioned routing and a health-check endpoint, so that the API is maintainable and deployable from the start.

#### Acceptance Criteria

1. THE Backend SHALL mount all API routes under the prefix `/api/v1`.
2. THE Backend SHALL expose a `GET /api/v1/health` endpoint that returns `{"status": "ok"}` with HTTP status 200 when the application is running.
3. THE Backend SHALL configure CORS middleware to allow requests from the origin specified in the `FRONTEND_URL` environment variable.
4. THE Backend SHALL use FastAPI's `APIRouter` to group routes by domain (e.g., `auth`, `users`), with each router registered in a central `api/v1/router.py` file.
5. THE Backend SHALL return all errors in a consistent JSON format: `{"detail": "<message>", "code": "<error_code>"}`.
6. IF an unhandled exception occurs during request processing, THEN THE Backend SHALL log the full traceback to stdout and return HTTP 500 with the standard error format.
7. THE Backend SHALL include OpenAPI documentation auto-generated by FastAPI, accessible at `/docs` in non-production environments.

---

### Requirement 6 — Authentication via Clerk (Backend JWT Validation)

**User Story:** As a backend developer, I want the FastAPI backend to validate Clerk-issued JWTs on every protected endpoint, so that only authenticated users can access private resources.

#### Acceptance Criteria

1. THE Backend SHALL retrieve Clerk's public signing keys by fetching the JWKS Endpoint URL specified in the `CLERK_JWKS_URL` environment variable.
2. WHEN a request arrives at a protected endpoint, THE Backend SHALL extract the Bearer token from the `Authorization` header.
3. IF the `Authorization` header is absent or malformed on a protected endpoint, THEN THE Backend SHALL return HTTP 401 with error code `MISSING_TOKEN`.
4. WHEN the token is extracted, THE Backend SHALL validate the JWT signature against the fetched JWKS keys and verify the `iss` and `exp` claims.
5. IF the JWT signature is invalid or the token is expired, THEN THE Backend SHALL return HTTP 401 with error code `INVALID_TOKEN`.
6. WHEN the JWT is valid, THE Backend SHALL extract the `sub` claim as the Clerk user ID and make it available to route handlers via a FastAPI dependency `get_current_user`.
7. THE Backend SHALL cache fetched JWKS keys in memory for a minimum of 300 seconds to avoid excessive requests to the JWKS Endpoint.

---

### Requirement 7 — Authentication via Clerk (Frontend)

**User Story:** As a user, I want to sign up and sign in using Clerk's hosted UI components, so that account management is secure and the app does not store raw credentials.

#### Acceptance Criteria

1. THE Frontend SHALL wrap the entire application in Clerk's `<ClerkProvider>` using the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` environment variable.
2. THE Frontend SHALL render Clerk's `<SignIn>` component on the `/login` route and Clerk's `<SignUp>` component on the `/register` route.
3. WHEN a user completes sign-in, THE Frontend SHALL redirect the user to `/dashboard`.
4. WHEN a user completes sign-up, THE Frontend SHALL redirect the user to `/dashboard`.
5. WHEN a user signs out, THE Frontend SHALL redirect the user to the Landing Page (`/`).
6. THE Frontend SHALL expose a custom `useAuth` hook that returns the current user object, the active session token, and a `signOut` function, abstracting direct Clerk SDK calls from page components.

---

### Requirement 8 — Protected Routes

**User Story:** As a user, I want unauthenticated access to dashboard routes to be blocked and redirected to login, so that my scheduling data remains private.

#### Acceptance Criteria

1. THE Frontend SHALL use Next.js middleware to intercept requests to all routes under `/dashboard` and `/settings`.
2. WHEN an unauthenticated request reaches a protected route, THE Frontend SHALL redirect the request to `/login`.
3. WHEN an authenticated request reaches `/login` or `/register`, THE Frontend SHALL redirect the request to `/dashboard`.
4. THE Frontend SHALL define a `clerkMiddleware` configuration that explicitly lists public routes (`/`, `/login`, `/register`, `/api/webhook/clerk`) and treats all other routes as protected.

---

### Requirement 9 — Landing Page

**User Story:** As a prospective user, I want a polished, accessible landing page that communicates the platform's value, so that I understand what Chrono Schedulura offers before signing up.

#### Acceptance Criteria

1. THE Frontend SHALL render the Landing Page at the root URL `/` as a server component.
2. THE Landing Page SHALL include a hero section with the platform name, a tagline, and a call-to-action button linking to `/register`.
3. THE Landing Page SHALL include a features section listing at least three planned platform capabilities with accompanying icons.
4. THE Landing Page SHALL include a navigation bar with links to `/login` and `/register`.
5. THE Landing Page SHALL be fully responsive, adapting layout for viewport widths of 320 px, 768 px, and 1280 px or wider.
6. THE Landing Page SHALL achieve a Lighthouse accessibility score of 90 or above, verified by including appropriate ARIA labels, semantic HTML landmarks, and sufficient colour contrast ratios.

---

### Requirement 10 — Authenticated Application Shell (Sidebar and Navbar)

**User Story:** As an authenticated user, I want a consistent navigation shell with a collapsible sidebar and a top navbar, so that I can navigate the platform efficiently on any device.

#### Acceptance Criteria

1. THE Frontend SHALL render the Sidebar and Navbar only within the authenticated layout wrapping `/dashboard` and `/settings` routes.
2. THE Sidebar SHALL display navigation items: Dashboard, Settings, and placeholder items for Calendar, Analytics, and Collaboration (greyed out and non-interactive), with associated icons.
3. WHEN the user clicks the collapse toggle, THE Sidebar SHALL transition between expanded (240 px wide) and collapsed (64 px wide, icons only) states using a Framer Motion animation with a duration of 200 ms or less.
4. THE Sidebar SHALL persist its collapsed/expanded state in `localStorage` under the key `sidebar_collapsed`, restoring the saved state on page reload.
5. THE Navbar SHALL display the platform logo on the left, a theme toggle button in the centre-right area, and the Clerk `<UserButton>` component on the far right.
6. WHILE the viewport width is less than 768 px, THE Frontend SHALL hide the Sidebar and render a hamburger menu button in the Navbar that opens the Sidebar as a mobile drawer overlay.

---

### Requirement 11 — Dashboard Page

**User Story:** As an authenticated user, I want a dashboard overview page that greets me by name and shows placeholder cards for future widgets, so that I have a clear home base in the application.

#### Acceptance Criteria

1. THE Frontend SHALL render the Dashboard at the route `/dashboard` as a protected page.
2. THE Dashboard SHALL display a personalised greeting using the user's first name retrieved from the Clerk session.
3. THE Dashboard SHALL render at least three placeholder stat cards with titles (e.g., "Upcoming Events", "Tasks Pending", "Collaborators") and a loading skeleton animation until real data is available.
4. WHEN the page is loading, THE Dashboard SHALL display accessible skeleton loaders in place of stat cards, using `aria-busy="true"` and `aria-label="Loading content"` on the containing element.
5. THE Dashboard SHALL be responsive, arranging stat cards in a single column on mobile viewports and a three-column grid on viewports 1024 px wide or wider.

---

### Requirement 12 — Settings Page

**User Story:** As an authenticated user, I want a settings page where I can manage my profile, so that the platform can be personalised before additional features are built.

#### Acceptance Criteria

1. THE Frontend SHALL render the Settings page at the route `/settings` as a protected page.
2. THE Settings page SHALL display the user's current email address and display name sourced from the Clerk session.
3. THE Settings page SHALL include a profile form built with React Hook Form and validated with Zod, containing a display name field (required, 2–80 characters) and a timezone selector field (required, from a predefined IANA timezone list).
4. WHEN the user submits the profile form with valid data, THE Frontend SHALL call `PATCH /api/v1/users/me` on the Backend and display a success toast notification.
5. IF the Backend returns an error on profile update, THEN THE Frontend SHALL display an inline error message below the relevant form field without dismissing form data.

---

### Requirement 13 — Theme Toggle (Light and Dark Mode)

**User Story:** As a user, I want to switch between light and dark themes, so that I can use the platform comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Frontend SHALL implement theme management using `next-themes` with `system` as the default theme strategy.
2. WHEN the user clicks the theme toggle button, THE Frontend SHALL switch the active Theme between `light` and `dark`.
3. THE Frontend SHALL persist the selected Theme in `localStorage` under the key `theme`, restoring the saved Theme on subsequent page loads.
4. THE Frontend SHALL apply Tailwind CSS `dark:` variant classes to all layout and component styles to ensure correct colour rendering in both themes.
5. THE Frontend SHALL use the colour tokens defined in the Platform's visual identity: primary `#6F9C93`, secondary `#8DBBA6`, accent `#A9C9AC`, background `#F7FAF5`, surface `#FFFFFF`, and text `#24352D` in light mode, with appropriate dark-mode counterparts configured in `tailwind.config.ts`.

---

### Requirement 14 — Reusable Component Library

**User Story:** As a developer, I want a set of typed, accessible base components, so that UI is built consistently across all current and future pages.

#### Acceptance Criteria

1. THE Frontend SHALL provide the following Reusable Components sourced from or built on top of shadcn/ui: `Button`, `Input`, `Select`, `Card`, `Badge`, `Skeleton`, `Toast`/`Sonner`, `Dialog`, `Tooltip`, and `Avatar`.
2. THE Frontend SHALL export all Reusable Components from a single barrel file `src/components/ui/index.ts`.
3. EACH Reusable Component SHALL accept a `className` prop for style extension and forward refs where the underlying element requires direct DOM access.
4. THE Frontend SHALL include a `PageLoader` component that renders a full-screen centred spinner, used during route transitions and initial authentication checks.
5. THE Frontend SHALL include an `ErrorBoundary` component wrapping each page layout that catches rendering errors and renders a fallback card with an error message and a "Reload page" button.

---

### Requirement 15 — Error Handling and Loading States

**User Story:** As a user, I want clear visual feedback during loading and when errors occur, so that I always understand the current state of the application.

#### Acceptance Criteria

1. THE Frontend SHALL display the `PageLoader` component during Next.js route transitions using the `loading.tsx` convention in the App Router.
2. WHEN an API call is in flight, THE Frontend SHALL disable the triggering button and replace its label with a spinner icon to prevent duplicate submissions.
3. IF a network request fails due to a connectivity issue, THEN THE Frontend SHALL display a toast notification with the message "Connection error. Please try again." without navigating away from the current page.
4. THE Frontend SHALL use React Query (TanStack Query) for all server-state data fetching, leveraging its built-in loading, error, and success states.
5. IF a Backend API returns HTTP 401, THEN THE Frontend SHALL call the Auth Service sign-out flow and redirect the user to `/login`.

---

### Requirement 16 — Documentation

**User Story:** As a developer joining the project, I want comprehensive documentation covering architecture, folder structure, tech choices, and the development roadmap, so that I can contribute without extensive onboarding sessions.

#### Acceptance Criteria

1. THE Platform SHALL include a root `README.md` that covers: project overview, prerequisite installation steps, local development setup instructions using Docker Compose, environment variable configuration guide, and available npm/Python scripts.
2. THE Platform SHALL include an `ARCHITECTURE.md` document in the root describing the Clean Architecture layers used in both Frontend and Backend, the rationale for each major technology choice, the monorepo folder structure with annotations, and the five-milestone development roadmap.
3. THE Backend SHALL include inline docstrings on all FastAPI route handlers, Pydantic schema classes, and SQLAlchemy model classes.
4. THE Frontend SHALL include JSDoc comments on all custom hooks, utility functions, and Reusable Components describing parameters and return values.
