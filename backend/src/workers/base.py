"""
Abstract base class for all background workers.

Subclass and implement _run(). In Milestone 3, integrate with
Celery or ARQ by overriding start() — the interface stays the same.
"""

import asyncio
from abc import ABC, abstractmethod
from src.core.logging import get_logger


class BaseWorker(ABC):
    """
    Abstract background worker with a resilient run loop.

    Usage:
        class MyWorker(BaseWorker):
            async def _run(self) -> None:
                # your periodic job logic here
                ...

        worker = MyWorker(name="my-worker", interval_seconds=60)
        await worker.start()   # runs until stop() is called

    The loop catches all exceptions so a single failure never kills the worker.
    Register start()/stop() in the FastAPI lifespan to tie lifecycle to the app.
    """

    def __init__(self, name: str, interval_seconds: int = 60) -> None:
        self.name = name
        self.interval_seconds = interval_seconds
        self._logger = get_logger(f"worker.{name}")
        self._running = False

    async def start(self) -> None:
        """
        Start the worker loop.

        Override this method to integrate with an external task queue
        (Celery, ARQ, etc.) in a future milestone.
        """
        self._running = True
        self._logger.info("Worker '%s' started (interval=%ds)", self.name, self.interval_seconds)
        while self._running:
            try:
                await self._run()
            except Exception:
                self._logger.exception("Worker '%s' encountered an error — continuing", self.name)
            await asyncio.sleep(self.interval_seconds)

    async def stop(self) -> None:
        """Signal the worker to stop after the current iteration completes."""
        self._running = False
        self._logger.info("Worker '%s' stopped", self.name)

    @abstractmethod
    async def _run(self) -> None:
        """
        Execute one iteration of the worker's job.

        Implement business logic here. Called every ``interval_seconds``.
        Any exception is caught by start() and logged — the loop continues.
        """
        ...
