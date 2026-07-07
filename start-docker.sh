#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
REQUIRED_PNPM_VERSION="10.33.4"

echo "==> Starting AI Knowledge Atlas locally with Docker services"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "$1 was not found. $2"
    exit 1
  fi
}

require_cmd docker "Install Docker Desktop and start it first."
require_cmd python3 "Install Python 3.11+ first."
require_cmd node "Install Node.js 20+ first."
require_cmd pnpm "Install pnpm or enable it with Corepack first."

actual_pnpm_version="$(pnpm --version)"
if [ "$actual_pnpm_version" != "$REQUIRED_PNPM_VERSION" ]; then
  echo "pnpm version mismatch. Required $REQUIRED_PNPM_VERSION, found $actual_pnpm_version."
  echo "Run: corepack prepare pnpm@$REQUIRED_PNPM_VERSION --activate"
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose was not found. Install Docker Compose v2 or docker-compose."
  exit 1
fi

if ! docker version >/dev/null 2>&1; then
  echo "Docker is not running. Please start Docker Desktop first."
  exit 1
fi

cd "$ROOT_DIR"
"${COMPOSE[@]}" up -d neo4j

echo "==> Preparing backend"
cd "$BACKEND_DIR"
if [ ! -x ".venv/bin/python" ]; then
  python3 -m venv .venv
fi
.venv/bin/python -m pip install -q -r requirements.txt

echo "==> Preparing frontend"
cd "$FRONTEND_DIR"
if [ ! -f "node_modules/.modules.yaml" ]; then
  pnpm install
fi

cleanup() {
  if [ -n "${BACKEND_PID:-}" ]; then kill "$BACKEND_PID" 2>/dev/null || true; fi
  if [ -n "${FRONTEND_PID:-}" ]; then kill "$FRONTEND_PID" 2>/dev/null || true; fi
}
trap cleanup INT TERM EXIT

echo "==> Starting local FastAPI backend"
cd "$BACKEND_DIR"
NEO4J_URI="${NEO4J_URI:-bolt://localhost:7687}" \
NEO4J_USER="${NEO4J_USER:-neo4j}" \
NEO4J_PASSWORD="${NEO4J_PASSWORD:-ai-knowledge-graph}" \
ENABLE_SCHEDULER="${ENABLE_SCHEDULER:-false}" \
.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo "==> Waiting for backend health"
for i in $(seq 1 60); do
  if curl -fsS "http://localhost:8000/health" >/dev/null 2>&1; then
    break
  fi
  if [ "$i" = "60" ]; then
    echo "Backend did not become healthy in time."
    exit 1
  fi
  sleep 2
done

node_count="$(curl -fsS "http://localhost:8000/graph/nodes?limit=1" | tr -d '[:space:]')"
if [ "$node_count" = "[]" ]; then
  echo "==> Seeding Neo4j graph data"
  cd "$BACKEND_DIR"
  NEO4J_URI="${NEO4J_URI:-bolt://localhost:7687}" \
  NEO4J_USER="${NEO4J_USER:-neo4j}" \
  NEO4J_PASSWORD="${NEO4J_PASSWORD:-ai-knowledge-graph}" \
  .venv/bin/python scripts/seed_data.py
fi

echo "==> Starting local Next.js frontend"
cd "$FRONTEND_DIR"
NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000}" \
DATABASE_PATH="${DATABASE_PATH:-./data/learning.db}" \
pnpm dev &
FRONTEND_PID=$!

echo ""
echo "Services are starting:"
echo "  Frontend:      http://localhost:3000"
echo "  Knowledge map: http://localhost:3000/graph"
echo "  Backend API:   http://localhost:8000"
echo "  API docs:      http://localhost:8000/docs"
echo "  Neo4j Browser: http://localhost:7474"
echo ""
echo "Press Ctrl+C to stop local frontend/backend. Run '${COMPOSE[*]} down' to stop Neo4j."

wait
