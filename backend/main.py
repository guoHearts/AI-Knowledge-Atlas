"""AI Knowledge Graph — FastAPI application entry point."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect Neo4j and init schema
    app.state.neo4j_driver = GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )
    with app.state.neo4j_driver.session() as session:
        session.run("RETURN 1")

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


app = FastAPI(title="AI Knowledge Graph API", version="0.1.0", lifespan=lifespan)

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
app.include_router(graph_router)
app.include_router(share_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

