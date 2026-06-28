# Design Document — Chrono Schedulura (Foundation Milestone)

## Overview

Chrono Schedulura is a production-ready AI-powered scheduling platform delivered as a monorepo. The Foundation Milestone establishes the full project scaffold: authentication, navigation shell, dashboard, settings, theme toggling, public pages, database configuration, and the FastAPI base structure. Future milestones (Calendar, AI Scheduling, Analytics, Collaboration) are architecturally prepared for but not implemented here.

The system follows **Clean Architecture** principles — each layer depends only on layers inward, never outward — combined with SOLID, DRY, full type safety, accessibility (WCAG 2.1 AA), and responsive design.

> **Extensibility-first:** Every future module (AI scheduling, background jobs, monitoring, collaboration, analytics) has placeholder folders, typed interfaces, and registration hooks wired into the main application factory **now**. Adding a new module in a future milestone requires filling in the implementation, not restructuring the project.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Monorepo Root                                   │
│                                                                              │
│   /frontend (Next.js 15)                /backend (FastAPI)                   │
│  ┌──────────────────────────┐          ┌────────────────────────────────┐    │
│  │  Pages / App Router      │          │  API Routes (v1)               │    │
│  │  Components (UI)         │   HTTP   │  Services (Business Logic)     │    │
│  │  Hooks / Store (Zustand) │ ──────►  │  Workers (Background Jobs)     │    │
│  │  Lib (API + AI clients)  │          │  AI Services (Gemini)          │    │
│  │  Feature modules:        │          │  Schemas (Pydantic)            │    │
│  │   calendar/ analytics/   │          │  DB (SQLAlchemy + PG)          │    │
│  │   collaboration/ habits/ │          │  Monitoring / Logging          │    │
│  │   notifications/ ai/     │          │  Feature modules:              │    │
│  └──────────────────────────┘          │   calendar/ analytics/         │    │
│                                        │   collaboration/ habits/        │    │
│                                        │   notifications/ ai/            │    │
│                                        └────────────────────────────────┘    │
│                                                                              │
│  External: Clerk (Auth) · PostgreSQL 16 · Redis (future) · Gemini (future)  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Guiding Principles

- **Separation of Concerns**: Pages own routing; components own rendering; hooks/store own state; lib owns I/O.
- **Type Safety End-to-End**: TypeScript strict mode on the frontend; Pydantic schemas on the backend.
- **Authentication at the Edge**: Next.js middleware enforces route protection before pages render; FastAPI dependency enforces JWT validation before handlers execute.
- **Progressive Enhancement**: Landing page is a pure server component; authenticated pages use client components only where interactivity is required.
- **Module Registration Pattern**: Every domain module (AI, calendar, collaboration, etc.) exposes a single `router` and optional `lifespan` hook. The main `create_app()` factory registers them — so adding a new module is one line, not a refactor.
- **Shared Contract Layer**: All cross-module types live in `src/types/` (frontend) and `src/schemas/` (backend). No module imports types from another module directly.
- **Observability by Default**: Structured logging and a metrics stub are wired in from day one. Swap the stub for Prometheus/Datadog/Sentry without touching business logic.

---

## Frontend Architecture

### Directory Structure

```
/frontend
├── public/
│   └── assets/                    # Static images, icons, favicons
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (public)/              # Route group — no auth required
│   │   │   ├── page.tsx           # Landing page (/)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (auth)/                # Route group — auth required
│   │   │   ├── layout.tsx         # Authenticated shell (Sidebar + Navbar)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── calendar/          # [FUTURE M2] placeholder route
│   │   │   ├── analytics/         # [FUTURE M4] placeholder route
│   │   │   ├── collaboration/     # [FUTURE M5] placeholder route
│   │   │   ├── habits/            # [FUTURE M3] placeholder route
│   │   │   └── notifications/     # [FUTURE M3] placeholder route
│   │   ├── layout.tsx             # Root layout (ClerkProvider, ThemeProvider)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    # shadcn/ui base components + barrel export
│   │   ├── layout/                # Sidebar, Navbar, MobileDrawer
│   │   ├── landing/               # Hero, Features, LandingNav
│   │   ├── dashboard/             # StatCard, SkeletonCard
│   │   ├── settings/              # ProfileForm, TimezoneSelect
│   │   ├── shared/                # PageLoader, ErrorBoundary, ThemeToggle
│   │   ├── calendar/              # [FUTURE M2] CalendarView, EventCard, etc.
│   │   ├── analytics/             # [FUTURE M4] Charts, ReportCard, etc.
│   │   ├── collaboration/         # [FUTURE M5] MemberList, PresenceIndicator, etc.
│   │   ├── habits/                # [FUTURE M3] HabitTracker, StreakCard, etc.
│   │   ├── notifications/         # [FUTURE M3] NotificationPanel, NotificationBell
│   │   └── ai/                    # [FUTURE M3] AISuggestionCard, AIChatPanel, etc.
│   ├── hooks/
│   │   ├── useAuth.ts             # Clerk abstraction
│   │   ├── useSidebar.ts          # Collapse state + localStorage
│   │   ├── useTheme.ts            # next-themes wrapper
│   │   ├── useNotifications.ts    # [FUTURE M3] notification polling/SSE
│   │   ├── useAI.ts               # [FUTURE M3] AI suggestion hook
│   │   └── useAnalytics.ts        # [FUTURE M4] analytics data hook
│   ├── lib/
│   │   ├── api.ts                 # Axios client with JWT injection
│   │   ├── queryClient.ts         # TanStack Query client config
│   │   ├── utils.ts               # cn(), formatters, constants
│   │   ├── ai.ts                  # [FUTURE M3] Gemini API client wrapper
│   │   └── analytics.ts           # [FUTURE M4] analytics event emitter stub
│   ├── store/
│   │   ├── uiStore.ts             # Zustand: sidebar state, mobile drawer
│   │   ├── calendarStore.ts       # [FUTURE M2] selected date, view mode
│   │   ├── notificationStore.ts   # [FUTURE M3] unread count, notification list
│   │   └── collaborationStore.ts  # [FUTURE M5] presence, active collaborators
│   ├── types/
│   │   ├── api.ts                 # Shared API response types (ErrorResponse, Paginated)
│   │   ├── user.ts                # User, Session types
│   │   ├── calendar.ts            # [FUTURE M2] Event, CalendarView, Recurrence types
│   │   ├── scheduler.ts           # [FUTURE M3] Task, Priority, AIScheduleResult types
│   │   ├── analytics.ts           # [FUTURE M4] AnalyticsEvent, Report types
│   │   ├── collaboration.ts       # [FUTURE M5] Member, Presence, Permission types
│   │   ├── notifications.ts       # [FUTURE M3] Notification, NotificationType types
│   │   └── ai.ts                  # [FUTURE M3] AIRequest, AIResponse, AISuggestion types
│   └── styles/
│       └── themes.css             # CSS custom properties for color tokens
├── middleware.ts                  # clerkMiddleware — route protection
├── tailwind.config.ts
└── tsconfig.json                  # strict: true, @/ → src/
```

### Component Hierarchy

```
RootLayout (layout.tsx)
└── ClerkProvider
    └── ThemeProvider (next-themes)
        ├── (public) Route Group
        │   ├── LandingPage — server component
        │   ├── LoginPage   — client (Clerk <SignIn>)
        │   └── RegisterPage — client (Clerk <SignUp>)
        └── (auth) Route Group
            └── AuthLayout
                ├── Sidebar (Framer Motion, useSidebar hook)
                └── main
                    ├── Navbar
                    │   ├── Logo
                    │   ├── ThemeToggle
                    │   └── <UserButton> (Clerk)
                    └── {page outlet}
                        ├── DashboardPage
                        └── SettingsPage
```

### State Management

| Concern | Solution |
|---------|----------|
| Server state (API data) | TanStack Query v5 |
| Global UI state (sidebar, drawer) | Zustand `uiStore` |
| Form state | React Hook Form + Zod |
| Auth state | Clerk SDK (via `useAuth` hook) |
| Theme | `next-themes` (localStorage-backed) |

### Route Protection — Middleware

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/api/webhook/clerk(.*)',
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
};
```

### API Client

```typescript
// src/lib/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getClerkToken(); // from useAuth hook context
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // trigger sign-out + redirect /login via event bus
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
```

### Theme Configuration

```typescript
// tailwind.config.ts (excerpt)
theme: {
  extend: {
    colors: {
      primary:    { DEFAULT: '#6F9C93' },
      secondary:  { DEFAULT: '#8DBBA6' },
      accent:     { DEFAULT: '#A9C9AC' },
      background: { DEFAULT: '#F7FAF5', dark: '#1A2420' },
      surface:    { DEFAULT: '#FFFFFF',  dark: '#243028' },
      text:       { DEFAULT: '#24352D',  dark: '#E8F0EC' },
    },
  },
}
```

### Sidebar Component

```typescript
// src/components/layout/Sidebar.tsx (structure)
const EXPANDED_WIDTH  = 240;
const COLLAPSED_WIDTH = 64;
const ANIMATION_DURATION = 0.18; // seconds (< 200 ms)

export function Sidebar() {
  const { collapsed, toggle } = useSidebar();

  return (
    <motion.aside
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ duration: ANIMATION_DURATION, ease: 'easeInOut' }}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => <NavItem key={item.href} {...item} collapsed={collapsed} />)}
      <CollapseToggle onClick={toggle} collapsed={collapsed} />
    </motion.aside>
  );
}
```

---

## Backend Architecture

### Directory Structure

```
/backend
├── src/
│   ├── api/
│   │   └── v1/
│   │       ├── router.py              # Central router — mounts all sub-routers
│   │       ├── health.py              # GET /api/v1/health
│   │       ├── auth.py                # Auth-related endpoints (webhooks)
│   │       ├── users.py               # GET/PATCH /api/v1/users/me
│   │       ├── calendar.py            # [FUTURE M2] Calendar event endpoints
│   │       ├── scheduler.py           # [FUTURE M3] AI scheduling endpoints
│   │       ├── analytics.py           # [FUTURE M4] Analytics endpoints
│   │       ├── collaboration.py       # [FUTURE M5] Collaboration endpoints
│   │       ├── habits.py              # [FUTURE M3] Habits endpoints
│   │       └── notifications.py       # [FUTURE M3] Notifications endpoints
│   ├── core/
│   │   ├── config.py                  # Pydantic BaseSettings
│   │   ├── security.py                # JWT validation, JWKS cache
│   │   ├── dependencies.py            # get_db, get_current_user
│   │   ├── logging.py                 # Structured logger factory (JSON output)
│   │   └── monitoring.py              # Metrics stub — swap for Prometheus/Datadog
│   ├── db/
│   │   ├── base.py                    # SQLAlchemy Base, async engine, session
│   │   └── models/
│   │       ├── user.py                # User ORM model
│   │       ├── event.py               # [FUTURE M2] CalendarEvent ORM model
│   │       ├── task.py                # [FUTURE M3] Task ORM model
│   │       ├── habit.py               # [FUTURE M3] Habit ORM model
│   │       ├── notification.py        # [FUTURE M3] Notification ORM model
│   │       └── collaboration.py       # [FUTURE M5] Workspace, Member ORM models
│   ├── schemas/
│   │   ├── common.py                  # ErrorResponse, HealthResponse, Paginated
│   │   ├── user.py                    # UserRead, UserUpdate
│   │   ├── calendar.py                # [FUTURE M2] EventRead, EventCreate, EventUpdate
│   │   ├── scheduler.py               # [FUTURE M3] TaskRead, AIScheduleRequest/Response
│   │   ├── analytics.py               # [FUTURE M4] AnalyticsEvent, ReportRead
│   │   ├── collaboration.py           # [FUTURE M5] WorkspaceRead, MemberRead
│   │   ├── habits.py                  # [FUTURE M3] HabitRead, HabitCreate
│   │   └── notifications.py           # [FUTURE M3] NotificationRead
│   ├── services/
│   │   ├── user_service.py            # User CRUD business logic
│   │   ├── calendar_service.py        # [FUTURE M2] Calendar business logic
│   │   ├── scheduler_service.py       # [FUTURE M3] Scheduling business logic
│   │   ├── analytics_service.py       # [FUTURE M4] Analytics aggregation
│   │   ├── collaboration_service.py   # [FUTURE M5] Workspace/member management
│   │   ├── habits_service.py          # [FUTURE M3] Habit tracking logic
│   │   └── notification_service.py    # [FUTURE M3] Notification dispatch
│   ├── ai/
│   │   ├── __init__.py                # AI module public interface
│   │   ├── client.py                  # [FUTURE M3] Google Gemini API client
│   │   ├── scheduler.py               # [FUTURE M3] AI scheduling prompts + parsing
│   │   ├── prioritizer.py             # [FUTURE M3] AI task prioritization
│   │   └── interfaces.py              # AIRequest, AIResponse typed interfaces (live now)
│   ├── workers/
│   │   ├── __init__.py                # Worker module public interface
│   │   ├── base.py                    # BaseWorker abstract class (live now)
│   │   ├── scheduler_worker.py        # [FUTURE M3] Background AI scheduling worker
│   │   ├── notification_worker.py     # [FUTURE M3] Notification dispatch worker
│   │   └── analytics_worker.py        # [FUTURE M4] Analytics aggregation worker
│   └── main.py                        # FastAPI app factory
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 001_create_users.py        # Initial migration
├── alembic.ini
├── requirements.txt
└── Dockerfile
```

### FastAPI Application Factory

The factory uses a **module registration pattern**. Every future domain module registers its router and optional lifespan in one place. Adding Calendar in Milestone 2 is a single `include_router()` call.

```python
# src/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.core.logging import configure_logging
from src.core.monitoring import instrument_app
from src.api.v1.router import api_v1_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialise shared resources (DB pool warm-up, JWKS prefetch, etc.)
    # Future workers register their startup/shutdown hooks here
    configure_logging()
    yield
    # Shutdown: close connections, flush buffers

def create_app() -> FastAPI:
    app = FastAPI(
        title="Chrono Schedulura API",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url=None,
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_url],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    instrument_app(app)   # wires metrics middleware stub
    app.include_router(api_v1_router, prefix="/api/v1")
    app.add_exception_handler(Exception, unhandled_exception_handler)
    return app

app = create_app()
```

### Configuration (Pydantic BaseSettings)

```python
# src/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    clerk_jwks_url: str
    frontend_url: str
    environment: str = "development"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()  # raises ValidationError on startup if fields missing
```

### Database Layer

```python
# src/db/base.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from src.core.config import settings

engine = create_async_engine(settings.database_url, echo=False, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

### User ORM Model

```python
# src/db/models/user.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from src.db.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    clerk_user_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    display_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    timezone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
```

### JWT Validation

```python
# src/core/security.py
import time
import httpx
from jose import jwt, JWTError
from fastapi import HTTPException, status
from src.core.config import settings

_jwks_cache: dict = {}
_jwks_fetched_at: float = 0.0
JWKS_CACHE_TTL = 300  # seconds

async def get_jwks() -> dict:
    global _jwks_cache, _jwks_fetched_at
    if time.monotonic() - _jwks_fetched_at < JWKS_CACHE_TTL and _jwks_cache:
        return _jwks_cache
    async with httpx.AsyncClient() as client:
        resp = await client.get(settings.clerk_jwks_url)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        _jwks_fetched_at = time.monotonic()
    return _jwks_cache

async def decode_clerk_jwt(token: str) -> dict:
    jwks = await get_jwks()
    try:
        payload = jwt.decode(token, jwks, algorithms=["RS256"])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"detail": "Token is invalid or expired", "code": "INVALID_TOKEN"},
        )
    return payload
```

### Auth Dependency

```python
# src/core/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.core.security import decode_clerk_jwt

bearer_scheme = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"detail": "Authorization header missing", "code": "MISSING_TOKEN"},
        )
    payload = await decode_clerk_jwt(credentials.credentials)
    return payload["sub"]  # Clerk user ID
```

### Error Handling

```python
# src/main.py — unhandled exception handler
import logging, traceback
from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception:\n%s", traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "code": "INTERNAL_ERROR"},
    )
```

### Central Router

```python
# src/api/v1/router.py
from fastapi import APIRouter
from src.api.v1 import health, users, auth
# Future imports — uncomment when milestone is ready:
# from src.api.v1 import calendar, scheduler, analytics, collaboration, habits, notifications

api_v1_router = APIRouter()
api_v1_router.include_router(health.router, tags=["health"])
api_v1_router.include_router(auth.router,  prefix="/auth",  tags=["auth"])
api_v1_router.include_router(users.router, prefix="/users", tags=["users"])
# api_v1_router.include_router(calendar.router,      prefix="/calendar",      tags=["calendar"])
# api_v1_router.include_router(scheduler.router,     prefix="/scheduler",     tags=["scheduler"])
# api_v1_router.include_router(analytics.router,     prefix="/analytics",     tags=["analytics"])
# api_v1_router.include_router(collaboration.router, prefix="/collaboration", tags=["collaboration"])
# api_v1_router.include_router(habits.router,        prefix="/habits",        tags=["habits"])
# api_v1_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
```

---

## Extensibility Architecture

This section defines the placeholder interfaces that exist **now** but have no business logic until future milestones. Every interface is typed; calling code will get compile-time errors if it uses them incorrectly.

### Structured Logging (`src/core/logging.py`)

A JSON-structured logger is configured at startup. All modules use `get_logger(__name__)` — never `print()`. In production, output streams to stdout for collection by Datadog/Loki/CloudWatch without code changes.

```python
# src/core/logging.py
import logging
import json
from datetime import datetime, timezone

class JSONFormatter(logging.Formatter):
    """Formats log records as single-line JSON for structured log aggregators."""
    def format(self, record: logging.LogRecord) -> str:
        return json.dumps({
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "module": record.module,
        })

def configure_logging(level: str = "INFO") -> None:
    """Call once at application startup."""
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    logging.basicConfig(handlers=[handler], level=level, force=True)

def get_logger(name: str) -> logging.Logger:
    """Use in every module: logger = get_logger(__name__)"""
    return logging.getLogger(name)
```

### Metrics Stub (`src/core/monitoring.py`)

An instrumentation stub is wired into the app factory now. Future milestones swap the no-op implementation for Prometheus counters, Datadog StatsD, or OpenTelemetry without touching any other file.

```python
# src/core/monitoring.py
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
import time

class MetricsMiddleware(BaseHTTPMiddleware):
    """
    No-op metrics middleware. Replace record_request() with real
    Prometheus/Datadog/OTEL calls in the monitoring milestone.
    """
    async def dispatch(self, request: Request, call_next):
        start = time.monotonic()
        response = await call_next(request)
        duration_ms = (time.monotonic() - start) * 1000
        _record_request(request.method, request.url.path, response.status_code, duration_ms)
        return response

def _record_request(method: str, path: str, status: int, duration_ms: float) -> None:
    """Stub — replace with real metric emission in a future milestone."""
    pass  # e.g. statsd.timing("http.request", duration_ms, tags=[...])

def instrument_app(app: FastAPI) -> None:
    """Register all monitoring middleware on the app."""
    app.add_middleware(MetricsMiddleware)
```

### AI Module Interfaces (`src/ai/interfaces.py`)

Typed contracts for every AI operation. The Gemini client in Milestone 3 must satisfy these interfaces — no other changes needed.

```python
# src/ai/interfaces.py
from pydantic import BaseModel
from typing import Protocol, Sequence
from datetime import datetime
from enum import Enum

class AIPriority(str, Enum):
    HIGH   = "high"
    MEDIUM = "medium"
    LOW    = "low"

class AIScheduleRequest(BaseModel):
    """Input to the AI scheduling engine."""
    user_id: str
    task_titles: list[str]
    available_slots: list[tuple[datetime, datetime]]
    preferences: dict  # timezone, working_hours, focus_mode, etc.

class AIScheduleResult(BaseModel):
    """Output from the AI scheduling engine."""
    scheduled_tasks: list[dict]   # {task_id, start, end, confidence}
    explanation: str              # human-readable summary
    model_version: str

class AISuggestion(BaseModel):
    """A single proactive suggestion surfaced in the dashboard."""
    suggestion_id: str
    type: str       # "reschedule" | "focus_block" | "habit_reminder"
    message: str
    confidence: float
    action_url: str | None

class AIServiceProtocol(Protocol):
    """
    Interface every AI service implementation must satisfy.
    Milestone 3 provides the concrete GeminiAIService.
    """
    async def schedule(self, request: AIScheduleRequest) -> AIScheduleResult: ...
    async def suggest(self, user_id: str) -> Sequence[AISuggestion]: ...
    async def health_check(self) -> bool: ...
```

### Background Worker Base (`src/workers/base.py`)

An abstract base class all workers inherit. When Celery or ARQ is added in Milestone 3, only `_run()` needs an implementation.

```python
# src/workers/base.py
import asyncio
import logging
from abc import ABC, abstractmethod
from src.core.logging import get_logger

class BaseWorker(ABC):
    """
    Abstract background worker. Subclass and implement _run().
    In Milestone 3, integrate with Celery/ARQ by overriding start().
    """
    def __init__(self, name: str, interval_seconds: int = 60) -> None:
        self.name = name
        self.interval_seconds = interval_seconds
        self._logger = get_logger(f"worker.{name}")
        self._running = False

    async def start(self) -> None:
        """Start the worker loop. Override to integrate with a task queue."""
        self._running = True
        self._logger.info("Worker %s started", self.name)
        while self._running:
            try:
                await self._run()
            except Exception:
                self._logger.exception("Worker %s encountered an error", self.name)
            await asyncio.sleep(self.interval_seconds)

    async def stop(self) -> None:
        self._running = False
        self._logger.info("Worker %s stopped", self.name)

    @abstractmethod
    async def _run(self) -> None:
        """Business logic — implement in each concrete worker."""
        ...
```

### Shared Frontend Type Contracts

All future modules import from the canonical type files. No module defines its own API types.

```typescript
// src/types/calendar.ts — [FUTURE M2]
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;       // ISO 8601
  end: string;         // ISO 8601
  allDay: boolean;
  recurrence: RecurrenceRule | null;
  userId: string;
  colorTag: string | null;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  until: string | null;
  count: number | null;
}

export type CalendarViewMode = 'day' | 'week' | 'month' | 'agenda';
```

```typescript
// src/types/scheduler.ts — [FUTURE M3]
export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueAt: string | null;
  estimatedMinutes: number | null;
  completedAt: string | null;
  userId: string;
  tags: string[];
}

export interface AIScheduleResult {
  scheduledTasks: Array<{ taskId: string; start: string; end: string; confidence: number }>;
  explanation: string;
  modelVersion: string;
}

export interface AISuggestion {
  suggestionId: string;
  type: 'reschedule' | 'focus_block' | 'habit_reminder';
  message: string;
  confidence: number;
  actionUrl: string | null;
}
```

```typescript
// src/types/analytics.ts — [FUTURE M4]
export interface AnalyticsEvent {
  eventName: string;
  userId: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

export interface ProductivityReport {
  userId: string;
  period: 'day' | 'week' | 'month';
  tasksCompleted: number;
  focusMinutes: number;
  topCategory: string | null;
  generatedAt: string;
}
```

```typescript
// src/types/collaboration.ts — [FUTURE M5]
export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: string;
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
  presenceStatus: 'online' | 'away' | 'offline';
}
```

```typescript
// src/types/notifications.ts — [FUTURE M3]
export interface Notification {
  id: string;
  userId: string;
  type: 'reminder' | 'ai_suggestion' | 'collaboration_invite' | 'system';
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  actionUrl: string | null;
}
```

```typescript
// src/types/ai.ts — [FUTURE M3]
export interface AIRequest {
  prompt: string;
  context: Record<string, unknown>;
  modelVersion?: string;
}

export interface AIResponse {
  content: string;
  modelVersion: string;
  tokensUsed: number;
  latencyMs: number;
}
```

### Frontend Feature Store Stubs

Zustand stores for future modules exist as typed empty shells today.

```typescript
// src/store/calendarStore.ts — [FUTURE M2]
import { create } from 'zustand';
import type { CalendarViewMode, CalendarEvent } from '@/types/calendar';

interface CalendarState {
  viewMode: CalendarViewMode;
  selectedDate: string;      // ISO 8601 date string
  events: CalendarEvent[];
  setViewMode: (mode: CalendarViewMode) => void;
  setSelectedDate: (date: string) => void;
}

// Stub — fully implement in Milestone 2
export const useCalendarStore = create<CalendarState>(() => ({
  viewMode: 'week',
  selectedDate: new Date().toISOString().split('T')[0],
  events: [],
  setViewMode: () => {},
  setSelectedDate: () => {},
}));
```

```typescript
// src/store/notificationStore.ts — [FUTURE M3]
import { create } from 'zustand';
import type { Notification } from '@/types/notifications';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
}

// Stub — connect to API in Milestone 3
export const useNotificationStore = create<NotificationState>(() => ({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
}));
```

```typescript
// src/store/collaborationStore.ts — [FUTURE M5]
import { create } from 'zustand';
import type { WorkspaceMember } from '@/types/collaboration';

interface CollaborationState {
  activeWorkspaceId: string | null;
  onlineMembers: WorkspaceMember[];
}

// Stub — connect to WebSocket in Milestone 5
export const useCollaborationStore = create<CollaborationState>(() => ({
  activeWorkspaceId: null,
  onlineMembers: [],
}));
```

### Environment Variables — Future Modules

Placeholder keys are listed in `.env.example` now with `# [FUTURE]` comments. CI will not fail without them; they are validated lazily when the relevant module is activated.

```bash
# Backend .env.example additions
# [FUTURE M3] Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# [FUTURE M3] Redis for background workers and caching
REDIS_URL=redis://localhost:6379/0

# [FUTURE M3] Notification delivery (email via SendGrid or Resend)
SENDGRID_API_KEY=your_sendgrid_key_here

# [FUTURE M4] Monitoring / observability
SENTRY_DSN=https://your_sentry_dsn_here
DATADOG_API_KEY=your_datadog_key_here

# [FUTURE M5] Real-time collaboration (WebSocket or Ably/Pusher)
ABLY_API_KEY=your_ably_key_here

# [FUTURE M5] Cloudinary media storage
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

```bash
# Frontend .env.example additions
# [FUTURE M3] AI feature flag
NEXT_PUBLIC_AI_ENABLED=false

# [FUTURE M3] Notification polling interval (ms)
NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL=30000

# [FUTURE M5] Real-time collaboration
NEXT_PUBLIC_ABLY_KEY=your_ably_public_key_here

# [FUTURE M5] Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## Development Roadmap

| Milestone | Feature Area | Key Deliverables |
|-----------|-------------|-----------------|
| **M1 — Foundation** *(this doc)* | Scaffold | Monorepo, auth, navigation, dashboard, DB, API structure, all placeholder folders/interfaces |
| **M2 — Calendar** | Time management | FullCalendar integration, event CRUD, recurring events, drag-and-drop scheduling |
| **M3 — AI + Scheduler + Habits + Notifications** | Intelligence | Gemini API client, AI scheduling engine, task prioritisation, habit tracker, background workers, push notifications |
| **M4 — Analytics** | Insights | Recharts dashboards, productivity reports, AI-generated weekly summaries, analytics worker |
| **M5 — Collaboration** | Teamwork | Shared workspaces, real-time presence (WebSocket), permission system, member management, Cloudinary uploads |

---

## Architecture

See "Architecture Overview" above for the full system diagram and guiding principles. This section provides the layer-by-layer breakdown.

### Layer Map

| Layer | Frontend | Backend |
|-------|----------|---------|
| Presentation | Next.js App Router pages, React components | FastAPI route handlers (`api/v1/`) |
| Application | Hooks, Zustand stores, TanStack Query | Services (`services/`), AI module (`ai/`), Workers (`workers/`) |
| Domain | TypeScript types (`types/`) | Pydantic schemas (`schemas/`), ORM models (`db/models/`) |
| Infrastructure | Axios API client, Clerk SDK | SQLAlchemy engine, JWKS cache, logging, monitoring |

---

## Components and Interfaces

### Backend — AI Module Interfaces (`src/ai/interfaces.py`)

| Interface | Type | Description |
|-----------|------|-------------|
| `AIScheduleRequest` | Pydantic model | Input to AI scheduling engine |
| `AIScheduleResult` | Pydantic model | Output from AI scheduling engine |
| `AISuggestion` | Pydantic model | Single proactive dashboard suggestion |
| `AIServiceProtocol` | Protocol (structural typing) | Contract every AI service implementation must satisfy |

### Backend — Worker Base (`src/workers/base.py`)

| Symbol | Type | Description |
|--------|------|-------------|
| `BaseWorker` | Abstract class | Parent of all background workers; `_run()` is the only required override |

### Backend — Logging & Monitoring (`src/core/`)

| Symbol | Module | Description |
|--------|--------|-------------|
| `get_logger(name)` | `logging.py` | JSON-structured logger factory; use in every module |
| `configure_logging()` | `logging.py` | Called once at lifespan startup |
| `instrument_app(app)` | `monitoring.py` | Registers `MetricsMiddleware` no-op; swap implementation for Prometheus/Datadog |

### Frontend — Feature Store Stubs

| Store | File | Future Milestone |
|-------|------|-----------------|
| `useCalendarStore` | `store/calendarStore.ts` | M2 |
| `useNotificationStore` | `store/notificationStore.ts` | M3 |
| `useCollaborationStore` | `store/collaborationStore.ts` | M5 |

### Frontend — Type Contract Files

| File | Types Defined | Future Milestone |
|------|--------------|-----------------|
| `types/calendar.ts` | `CalendarEvent`, `RecurrenceRule`, `CalendarViewMode` | M2 |
| `types/scheduler.ts` | `Task`, `AIScheduleResult`, `AISuggestion` | M3 |
| `types/analytics.ts` | `AnalyticsEvent`, `ProductivityReport` | M4 |
| `types/collaboration.ts` | `Workspace`, `WorkspaceMember` | M5 |
| `types/notifications.ts` | `Notification` | M3 |
| `types/ai.ts` | `AIRequest`, `AIResponse` | M3 |

---

## Data Models

### Pydantic Schemas

```python
# src/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import uuid
from datetime import datetime

class UserRead(BaseModel):
    id: uuid.UUID
    clerk_user_id: str
    email: EmailStr
    display_name: Optional[str]
    timezone: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=80)
    timezone: Optional[str] = Field(None, max_length=64)

class ErrorResponse(BaseModel):
    detail: str
    code: str

class HealthResponse(BaseModel):
    status: str
```

---

## Docker Compose

```yaml
# docker-compose.yml
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build: ./backend
    depends_on:
      db:
        condition: service_healthy
    env_file: .env
    ports:
      - "8000:8000"
    command: >
      sh -c "alembic upgrade head && uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload"

  frontend:
    build: ./frontend
    env_file: .env
    ports:
      - "3000:3000"
    command: npm run dev

volumes:
  postgres_data:
```

---

## Environment Variables

### Frontend `.env.example`

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend `.env.example`

```
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/chrono
POSTGRES_DB=chrono
POSTGRES_USER=user
POSTGRES_PASSWORD=pass

# Clerk
CLERK_JWKS_URL=https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json

# App
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

---

## Interface Contracts

### `GET /api/v1/health`

**Response 200:**
```json
{ "status": "ok" }
```

### `GET /api/v1/users/me`

**Headers:** `Authorization: Bearer <jwt>`  
**Response 200:** `UserRead` schema  
**Response 401:** `{"detail": "...", "code": "MISSING_TOKEN" | "INVALID_TOKEN"}`

### `PATCH /api/v1/users/me`

**Headers:** `Authorization: Bearer <jwt>`  
**Body:** `UserUpdate` schema  
**Response 200:** `UserRead` schema  
**Response 422:** Pydantic validation error  
**Response 401:** Auth error

### `POST /api/v1/auth/webhook/clerk`

Handles Clerk `user.created` events to upsert the local `users` table row.

---

## Component Interfaces (TypeScript)

```typescript
// src/types/user.ts
export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  displayName: string | null;
  timezone: string | null;
  createdAt: string;
  updatedAt: string;
}

// src/types/api.ts
export interface ApiError {
  detail: string;
  code: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

```typescript
// useAuth hook interface
interface UseAuthReturn {
  user: ClerkUser | null;
  token: string | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
}
```

---

## Error Handling

| Layer | Strategy |
|-------|----------|
| Backend route | HTTPException with `{"detail": ..., "code": ...}` |
| Backend unhandled | Global exception handler → HTTP 500 + log traceback via `get_logger` |
| Frontend API call | React Query `onError`, toast notification |
| Frontend HTTP 401 | Event bus `auth:unauthorized` → sign out + redirect |
| Frontend network failure | Interceptor catches `ERR_NETWORK` → toast "Connection error." |
| Frontend render error | `<ErrorBoundary>` → fallback card with "Reload page" |
| Frontend route transition | `loading.tsx` → `<PageLoader>` |
| Background worker | `BaseWorker` catches all exceptions in `start()` loop, logs via `get_logger`, continues running |

---

## Accessibility Design

- All interactive elements have visible focus rings (Tailwind `ring-*` utilities).
- Colour contrast ratios meet WCAG 2.1 AA (≥ 4.5:1 for normal text, ≥ 3:1 for large text).
- Sidebar uses `aria-label="Main navigation"` and `aria-current="page"` on active links.
- Skeleton loaders include `aria-busy="true"` and `aria-label="Loading content"`.
- Disabled placeholder nav items include `aria-disabled="true"` and `tabIndex={-1}`.
- Theme toggle uses `aria-label="Toggle theme"` and announces the new state via `aria-live`.
- Framer Motion animations respect `prefers-reduced-motion` via the `useReducedMotion` hook.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Consistent error response format

*For any* request that causes an error response from the Backend (4xx or 5xx), the response body SHALL be a JSON object containing both a `detail` string field and a `code` string field.

**Validates: Requirements 5.5, 5.6**

---

### Property 2: Missing or malformed token returns MISSING_TOKEN 401

*For any* HTTP request to a protected Backend endpoint where the `Authorization` header is absent, empty, or not in `Bearer <token>` format, the response SHALL be HTTP 401 with error code `MISSING_TOKEN`.

**Validates: Requirements 6.3**

---

### Property 3: Invalid or expired JWT returns INVALID_TOKEN 401

*For any* HTTP request to a protected Backend endpoint where the Bearer token has an invalid signature, incorrect `iss` claim, or an `exp` claim in the past, the response SHALL be HTTP 401 with error code `INVALID_TOKEN`.

**Validates: Requirements 6.4, 6.5**

---

### Property 4: Valid JWT yields correct Clerk user ID

*For any* well-formed, unexpired Clerk JWT with a `sub` claim, when used to call a protected Backend endpoint, the extracted Clerk user ID available to the route handler SHALL equal the JWT's `sub` claim value exactly.

**Validates: Requirements 6.6**

---

### Property 5: Theme toggle round-trip

*For any* initial theme state (`light` or `dark`), toggling the theme twice SHALL return the active theme to its original value, and the localStorage key `theme` SHALL reflect the correct state after each toggle.

**Validates: Requirements 13.2, 13.3**

---

### Property 6: Sidebar state persistence round-trip

*For any* sidebar state (collapsed or expanded), storing that state and then restoring it from `localStorage` key `sidebar_collapsed` SHALL produce the same state value.

**Validates: Requirements 10.4**

---

### Property 7: Profile form display name validation

*For any* string submitted as a display name, the Zod validation schema SHALL accept it if and only if its trimmed length is between 2 and 80 characters (inclusive); all other strings SHALL be rejected with a validation error.

**Validates: Requirements 12.3**

---

### Property 8: Dashboard greeting contains user's first name

*For any* authenticated user with a non-empty first name in their Clerk profile, the Dashboard SHALL render a greeting string that contains that exact first name.

**Validates: Requirements 11.2**

---

### Property 9: In-flight API request disables trigger button

*For any* UI action that triggers an API request, while that request is in flight the button or control that triggered it SHALL be disabled (non-interactive) and SHALL display a spinner icon, preventing duplicate submissions.

**Validates: Requirements 15.2**

---

## Testing Strategy

### Backend

| Scope | Tool | Coverage Target |
|-------|------|----------------|
| Unit — services, security, schemas | `pytest` + `pytest-asyncio` | All public functions |
| Integration — API routes | `httpx.AsyncClient` + `pytest` with test DB | All endpoints |
| Property tests — JWT, error format | `hypothesis` | Properties 1–4 |
| DB session lifecycle | `pytest-asyncio` with in-memory SQLite | `get_db` commit/rollback paths |

Key principles:
- Each test file mirrors the source module path (`tests/services/test_user_service.py`)
- No test touches the real Clerk JWKS endpoint — use a test RS256 keypair fixture
- Future modules add their test files in the same structure; no test config changes needed

### Frontend

| Scope | Tool | Coverage Target |
|-------|------|----------------|
| Unit — hooks, store, utils | `vitest` + `@testing-library/react` | All custom hooks |
| Component — UI components | `vitest` + RTL | Shared components, forms |
| Property tests — Zod schemas, theme toggle, sidebar | `fast-check` + `vitest` | Properties 5–9 |
| E2E — auth flows, navigation | `Playwright` | Login, register, protected route redirect |

Key principles:
- Zustand stores use `create` without persistence in tests — no `localStorage` side-effects
- All future module stub stores are tested to confirm they return the correct initial state shape
- Type contract files (`types/*.ts`) are validated by TypeScript strict mode compilation; no runtime tests needed
