# AI Knowledge Graph — Project Notes

## Project Structure

```
ai-knowledge-graph/
├── docker-compose.yml      # Neo4j 5 + backend + frontend
├── Dockerfile.backend      # Python 3.11 FastAPI backend
├── Dockerfile.frontend     # Node 20 Vite dev server
├── .env.example            # Config template
├── .gitignore
│
├── backend/
│   ├── main.py             # FastAPI app entry (lifespan, CORS, Neo4j driver)
│   ├── config.py           # Pydantic Settings from env
│   ├── requirements.txt    # Python deps
│   ├── api/                # FastAPI route modules
│   ├── models/             # Pydantic models + Neo4j repository
│   ├── extractors/         # Data source adapters (arXiv, HF, HN, RSS, GitHub)
│   ├── knowledge/          # LLM knowledge extraction
│   ├── scheduler/          # APScheduler periodic pipeline
│   └── scripts/            # Seed data, utilities
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main layout
│   │   ├── main.tsx        # Entry point
│   │   ├── index.css       # Tailwind base
│   │   ├── components/     # GraphCanvas, NodeDetail, SearchBar, FilterPanel
│   │   ├── hooks/          # useGraphData
│   │   ├── pages/          # ShareView
│   │   └── types/          # TypeScript types matching backend models
│   ├── vite.config.ts
│   └── package.json
│
└── docs/                   # (in parent: D:\project\knowledge\docs\)
    ├── superpowers/
    │   ├── specs/2026-05-31-ai-knowledge-graph-design.md
    │   └── plans/2026-05-31-ai-knowledge-graph-plan.md
```

## Files to Keep As-Is
- Scaffold files (docker-compose.yml, Dockerfiles, .env.example, config files)

## Files to Build (from scratch)
- All backend modules: api/, models/, extractors/, knowledge/, scheduler/, scripts/
- All frontend components: GraphCanvas, NodeDetail, SearchBar, FilterPanel, ShareView, App, hooks, types

## Gotchas
- GitHub unreachable from dev environment — project scaffolded from scratch instead of forking Scholar Graph-RAG
- Windows 11, PowerShell 5.1 environment
- Docker must be available for Neo4j + backend + frontend
- neo4j import error in Pyright is expected — package only installed in Docker container
