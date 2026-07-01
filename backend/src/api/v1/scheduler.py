"""
Tasks API — /api/v1/tasks

Endpoints:
  GET    /tasks              List tasks (with filter, priority, search, pagination)
  POST   /tasks              Create a task
  GET    /tasks/{id}         Get a single task
  PATCH  /tasks/{id}         Update a task (partial)
  DELETE /tasks/{id}         Delete a task
  POST   /tasks/{id}/toggle  Toggle complete / incomplete
"""

from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, get_current_user
from src.schemas.scheduler import TaskCreate, TaskUpdate, TaskRead, TaskListResponse
from src.services.scheduler_service import (
    create_task,
    get_task,
    list_tasks,
    update_task,
    delete_task,
    toggle_task_complete,
)
from src.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


def _not_found(task_id: UUID) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"detail": f"Task {task_id} not found", "code": "TASK_NOT_FOUND"},
    )


@router.get("", response_model=TaskListResponse, summary="List tasks")
async def list_tasks_endpoint(
    filter_by: Optional[str] = Query(None, description="all | today | upcoming | completed | overdue"),
    priority:  Optional[str] = Query(None, description="high | medium | low"),
    search:    Optional[str] = Query(None, max_length=200),
    page:      int           = Query(1,    ge=1),
    page_size: int           = Query(50,   ge=1, le=200),
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskListResponse:
    """Return a paginated, filtered list of the authenticated user's tasks."""
    try:
        items, total = await list_tasks(
            db=db,
            clerk_user_id=clerk_user_id,
            filter_by=filter_by,
            priority=priority,
            search=search,
            page=page,
            page_size=page_size,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail={"detail": str(e), "code": "USER_NOT_FOUND"})

    return TaskListResponse(
        items=[TaskRead.model_validate(t) for t in items],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED, summary="Create task")
async def create_task_endpoint(
    payload: TaskCreate,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskRead:
    """Create a new task for the authenticated user."""
    try:
        task = await create_task(db=db, clerk_user_id=clerk_user_id, payload=payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail={"detail": str(e), "code": "USER_NOT_FOUND"})
    return TaskRead.model_validate(task)


@router.get("/{task_id}", response_model=TaskRead, summary="Get task")
async def get_task_endpoint(
    task_id: UUID,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskRead:
    """Retrieve a single task by ID."""
    task = await get_task(db=db, task_id=task_id, clerk_user_id=clerk_user_id)
    if task is None:
        raise _not_found(task_id)
    return TaskRead.model_validate(task)


@router.patch("/{task_id}", response_model=TaskRead, summary="Update task")
async def update_task_endpoint(
    task_id: UUID,
    payload: TaskUpdate,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskRead:
    """Partially update a task. Only provided fields are modified."""
    task = await get_task(db=db, task_id=task_id, clerk_user_id=clerk_user_id)
    if task is None:
        raise _not_found(task_id)
    updated = await update_task(db=db, task=task, payload=payload)
    return TaskRead.model_validate(updated)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete task")
async def delete_task_endpoint(
    task_id: UUID,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Permanently delete a task."""
    task = await get_task(db=db, task_id=task_id, clerk_user_id=clerk_user_id)
    if task is None:
        raise _not_found(task_id)
    await delete_task(db=db, task=task)


@router.post("/{task_id}/toggle", response_model=TaskRead, summary="Toggle complete")
async def toggle_task_endpoint(
    task_id: UUID,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskRead:
    """Toggle a task between complete and incomplete."""
    task = await get_task(db=db, task_id=task_id, clerk_user_id=clerk_user_id)
    if task is None:
        raise _not_found(task_id)
    toggled = await toggle_task_complete(db=db, task=task)
    return TaskRead.model_validate(toggled)
