"""
AI module typed contracts for Chrono Schedulura.

These interfaces are LIVE NOW — they define the shape every AI service
implementation must satisfy. The Milestone 3 GeminiAIService must
implement AIServiceProtocol; Python's structural typing will catch
any mismatch at import time.

No business logic lives here. No external dependencies are imported.
"""

from pydantic import BaseModel, Field
from typing import Protocol, Sequence, runtime_checkable
from datetime import datetime
from enum import Enum


class AIPriority(str, Enum):
    """Priority level assigned to a task by the AI scheduling engine."""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AIScheduleRequest(BaseModel):
    """
    Input payload to the AI scheduling engine.

    Attributes:
        user_id: Clerk user ID of the requesting user.
        task_titles: List of task titles to schedule.
        available_slots: List of (start, end) UTC datetime tuples representing
                         free time blocks in the user's calendar.
        preferences: Flexible dict for user scheduling preferences
                     (timezone, working_hours, focus_mode, break_duration, etc.).
    """

    user_id: str
    task_titles: list[str] = Field(min_length=1)
    available_slots: list[tuple[datetime, datetime]]
    preferences: dict = Field(default_factory=dict)


class ScheduledTask(BaseModel):
    """A single task that has been assigned a time slot by the AI."""

    task_id: str
    title: str
    start: datetime
    end: datetime
    confidence: float = Field(ge=0.0, le=1.0, description="Scheduling confidence 0–1")
    priority: AIPriority = AIPriority.MEDIUM


class AIScheduleResult(BaseModel):
    """
    Output from the AI scheduling engine.

    Attributes:
        scheduled_tasks: Tasks with assigned time slots and confidence scores.
        explanation: Human-readable summary of the scheduling decisions.
        model_version: The AI model version that produced this result.
    """

    scheduled_tasks: list[ScheduledTask]
    explanation: str
    model_version: str


class AISuggestion(BaseModel):
    """
    A single proactive suggestion surfaced in the user's dashboard.

    Attributes:
        suggestion_id: Unique identifier for deduplication.
        type: Category of suggestion.
        message: Human-readable suggestion text.
        confidence: Model confidence score (0–1).
        action_url: Optional deep link to take action on the suggestion.
    """

    suggestion_id: str
    type: str = Field(
        description="reschedule | focus_block | habit_reminder | deadline_warning"
    )
    message: str
    confidence: float = Field(ge=0.0, le=1.0)
    action_url: str | None = None


class AIRequest(BaseModel):
    """
    Low-level raw AI request for direct Gemini API calls.

    Attributes:
        prompt: The full prompt string to send.
        context: Structured context data serialised into the prompt.
        model_version: Optional model override (defaults to latest Gemini).
    """

    prompt: str
    context: dict = Field(default_factory=dict)
    model_version: str | None = None


class AIResponse(BaseModel):
    """
    Low-level raw AI response from the Gemini API.

    Attributes:
        content: The generated text response.
        model_version: The model version that generated this response.
        tokens_used: Total token count for billing/monitoring.
        latency_ms: Round-trip latency in milliseconds.
    """

    content: str
    model_version: str
    tokens_used: int
    latency_ms: float


@runtime_checkable
class AIServiceProtocol(Protocol):
    """
    Structural interface every AI service implementation must satisfy.

    Milestone 3 provides the concrete GeminiAIService. Any class that
    implements these three methods is automatically compatible — no
    inheritance required (structural/duck typing).
    """

    async def schedule(self, request: AIScheduleRequest) -> AIScheduleResult:
        """Generate an AI-optimised schedule from a list of tasks and free slots."""
        ...

    async def suggest(self, user_id: str) -> Sequence[AISuggestion]:
        """Return proactive suggestions for the given user."""
        ...

    async def health_check(self) -> bool:
        """Return True if the AI backend is reachable and responding."""
        ...
