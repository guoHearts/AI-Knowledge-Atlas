#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "==> Starting AI Knowledge Graph with Docker"

if ! docker version >/dev/null 2>&1; then
  echo "Docker is not running. Please start Docker Desktop first."
  exit 1
fi

docker compose up -d --build neo4j backend frontend

echo "==> Waiting for backend health"
for i in $(seq 1 60); do
  if curl -fsS "http://localhost:8000/health" >/dev/null 2>&1; then
    break
  fi
  if [ "$i" = "60" ]; then
    echo "Backend did not become healthy in time."
    docker compose logs --tail=120 backend
    exit 1
  fi
  sleep 2
done

node_count="$(curl -fsS "http://localhost:8000/graph/nodes?limit=1" | tr -d '[:space:]')"
if [ "$node_count" = "[]" ]; then
  echo "==> Seeding Neo4j graph data"
  docker compose exec -T backend python scripts/seed_data.py
else
  echo "==> Graph data already exists"
fi

echo "==> Verifying services"
curl -fsS "http://localhost:8000/health" >/dev/null
curl -fsS "http://localhost:8000/graph/nodes?limit=5" >/dev/null
curl -fsS "http://localhost:3000" >/dev/null

echo ""
echo "Services are ready:"
echo "  Frontend:      http://localhost:3000"
echo "  Knowledge map: http://localhost:3000/graph"
echo "  Backend API:   http://localhost:8000"
echo "  API docs:      http://localhost:8000/docs"
echo "  Neo4j Browser: http://localhost:7474"
