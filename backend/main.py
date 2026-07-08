"""AI Knowledge Graph — FastAPI application entry point."""
import os
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
from neo4j.exceptions import ServiceUnavailable
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect Neo4j and init schema
    app.state.neo4j_driver = GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )
    for attempt in range(1, 31):
        try:
            with app.state.neo4j_driver.session() as session:
                session.run("RETURN 1")
            break
        except ServiceUnavailable:
            if attempt == 30:
                raise
            time.sleep(2)

    from models.schema import init_schema
    init_schema(app.state.neo4j_driver)

    # Start scheduler if not disabled
    if os.getenv("ENABLE_SCHEDULER", "true").lower() != "false":
        from models.repository import GraphRepository
        from scheduler.pipeline import DataPipeline
        from scheduler.scheduler import start_scheduler
        from extractors.arxiv import ArxivExtractor
        from extractors.huggingface import HuggingFaceExtractor
        from extractors.hackernews import HackerNewsExtractor
        from extractors.rss import RSSExtractor
        from extractors.github_trending import GitHubTrendingExtractor
        from knowledge.extractor import KnowledgeExtractor

        repo = GraphRepository(app.state.neo4j_driver)
        k_extractor = KnowledgeExtractor(
            model_name=settings.llm_model,
            api_key=settings.llm_api_key,
            base_url=settings.llm_base_url,
        )
        pipeline = DataPipeline(
            extractors=[
                ArxivExtractor(),
                HuggingFaceExtractor(),
                HackerNewsExtractor(),
                RSSExtractor(),
                GitHubTrendingExtractor(),
            ],
            knowledge_extractor=k_extractor,
            repository=repo,
        )
        app.state.pipeline = pipeline
        start_scheduler(pipeline)

    yield
    # Shutdown: stop scheduler and close Neo4j
    from scheduler.scheduler import stop_scheduler
    stop_scheduler()
    app.state.neo4j_driver.close()


app = FastAPI(title="AI Knowledge Graph API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
from api.graph_routes import router as graph_router
from api.share_routes import router as share_router
from api.chat_routes import router as chat_router
from api.content_routes import router as content_router
from api.progress_routes import router as progress_router
from api.radar_routes import router as radar_router
from modules.learning.router import router as learning_router
app.include_router(graph_router)
app.include_router(share_router)
app.include_router(chat_router)
app.include_router(content_router)
app.include_router(progress_router)
app.include_router(radar_router)
app.include_router(learning_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

