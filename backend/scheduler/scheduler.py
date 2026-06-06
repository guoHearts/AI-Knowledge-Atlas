"""APScheduler setup — periodic data pipeline runs."""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from scheduler.pipeline import DataPipeline

scheduler = AsyncIOScheduler()


def start_scheduler(pipeline: DataPipeline):
    """Start the periodic scheduler. Call once on app startup."""
    scheduler.add_job(
        lambda: pipeline.run(),
        trigger=IntervalTrigger(hours=6),
        id="knowledge_pipeline",
        name="AI Knowledge Graph Pipeline",
        replace_existing=True,
    )
    scheduler.start()


def stop_scheduler():
    try:
        if scheduler.running:
            scheduler.shutdown(wait=False)
    except Exception:
        pass  # Scheduler may not have been started
