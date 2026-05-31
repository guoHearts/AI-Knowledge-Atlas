"""AI Knowledge Graph — FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.neo4j_driver = GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )
    with app.state.neo4j_driver.session() as session:
        session.run("RETURN 1")
    yield
    # Shutdown
    app.state.neo4j_driver.close()


app = FastAPI(title="AI Knowledge Graph API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}
