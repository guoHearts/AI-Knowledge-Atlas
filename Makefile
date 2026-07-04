# ============================================================================
# AI Developer Training Platform — One-Click Management
# Usage:
#   Windows:  .\make.bat [target]
#   Unix/Mac: make [target]
# ============================================================================

.PHONY: help install start stop restart seed test build clean status dev docker-up

.DEFAULT_GOAL := help

NEXTJS_DIR  := frontend
BACKEND_DIR := backend

# ═══════════════════════════════════════════════════════════════════════════
help: ## Show help
	@echo "============================================"
	@echo "  AI Developer Training Platform"
	@echo "============================================"
	@echo ""
	@echo "  make start        Start all services"
	@echo "  make stop         Stop all services"
	@echo "  make restart      Restart all services"
	@echo "  make install      Install dependencies"
	@echo "  make build        Production build"
	@echo "  make test         Run full-stack tests"
	@echo "  make seed         Seed Neo4j data"
	@echo "  make reseed       Rebuild all seed data"
	@echo "  make status       Check service status"
	@echo "  make logs         View backend logs"
	@echo "  make dev          Frontend dev server only"
	@echo "  make docker-up    Docker services only"
	@echo "  make clean        Clean build + DB"
	@echo "  make clean-all    Deep clean"
	@echo ""
	@echo "  Quick start:  make start"

# ═══════════════════════════════════════════════════════════════════════════
install: ## Install all dependencies
	@echo "==> Installing frontend dependencies..."
	cd $(NEXTJS_DIR) && pnpm install --registry=https://registry.npmmirror.com/
	@echo "[OK] Frontend done"
	@echo "==> Installing backend dependencies..."
	cd $(BACKEND_DIR) && pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
	@echo "[OK] Backend done"

# ═══════════════════════════════════════════════════════════════════════════
start: ## Start all services (Docker + Next.js dev)
	@echo "==> Starting Neo4j + FastAPI backend..."
	docker compose up -d neo4j backend
	@echo "[OK] Docker containers started"
	@sleep 5
	@echo "==> Starting Next.js dev server..."
	cd $(NEXTJS_DIR) && start pnpm dev
	@sleep 4
	@echo ""
	@echo "============================================"
	@echo "  All services running!"
	@echo "  Frontend : http://localhost:3000"
	@echo "  Backend  : http://localhost:8000"
	@echo "  Neo4j    : bolt://localhost:7687"
	@echo "============================================"

stop: ## Stop all services
	@echo "==> Stopping frontend..."
	-taskkill /F /IM node.exe 2>nul
	@echo "==> Stopping Docker containers..."
	docker compose down
	@echo "[OK] All stopped"

restart: stop start ## Restart all services

# ═══════════════════════════════════════════════════════════════════════════
seed: ## Seed Neo4j database
	@echo "==> Seeding Neo4j..."
	docker exec ai-knowledge-graph-backend-1 python scripts/seed_data.py
	@echo "[OK] Neo4j seeded"

reseed: ## Rebuild all seed data
	@echo "==> Removing old SQLite DB..."
	-del /Q $(NEXTJS_DIR)\data\learning.db 2>nul
	@echo "==> Seeding Neo4j..."
	docker exec ai-knowledge-graph-backend-1 python scripts/seed_data.py
	@echo "==> Triggering SQLite rebuild..."
	@curl -s http://localhost:3000/ > nul
	@echo "[OK] All seeds rebuilt"

# ═══════════════════════════════════════════════════════════════════════════
build: ## Production build frontend
	@echo "==> Building Next.js..."
	cd $(NEXTJS_DIR) && pnpm build
	@echo "[OK] Build complete"

# ═══════════════════════════════════════════════════════════════════════════
test: ## Run full-stack tests
	@echo "============================================"
	@echo "  Full-Stack Test Suite"
	@echo "============================================"
	@echo ""
	@echo "--- Frontend Pages ---"
	@curl -s -o nul -w "  Home:       HTTP %%{http_code} (%%{time_total}s)\n" http://localhost:3000/
	@curl -s -o nul -w "  Track:      HTTP %%{http_code} (%%{time_total}s)\n" http://localhost:3000/learn/agent-engineer
	@curl -s -o nul -w "  Graph:      HTTP %%{http_code} (%%{time_total}s)\n" http://localhost:3000/graph
	@curl -s -o nul -w "  CMS:        HTTP %%{http_code} (%%{time_total}s)\n" http://localhost:3000/cms
	@echo "--- Backend ---"
	@curl -s -o nul -w "  Health:     HTTP %%{http_code}\n" http://localhost:8000/health
	@echo "--- Database ---"
	@echo "  Neo4j: $$(curl -s 'http://localhost:8000/graph/nodes?limit=200' 2>nul | python -c "import sys,json;print(len(json.load(sys.stdin)))" 2>nul || echo N/A) nodes"
	@echo "  Patterns: $$(curl -s http://localhost:3000/api/design-patterns 2>nul | python -c "import sys,json;print(len(json.load(sys.stdin)))" 2>nul || echo N/A)"
	@echo ""
	@echo "[OK] Tests complete"

# ═══════════════════════════════════════════════════════════════════════════
status: ## Show service status
	@echo "--- Docker Containers ---"
	@docker ps --filter "name=ai-knowledge-graph" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "--- HTTP Health ---"
	@curl -s -o nul -w "  Frontend: HTTP %%{http_code}\n" http://localhost:3000/ 2>nul || echo "  Frontend: DOWN"
	@curl -s -o nul -w "  Backend:  HTTP %%{http_code}\n" http://localhost:8000/health 2>nul || echo "  Backend: DOWN"

logs: ## Tail backend logs
	docker logs -f ai-knowledge-graph-backend-1

# ═══════════════════════════════════════════════════════════════════════════
dev: ## Frontend only
	cd $(NEXTJS_DIR) && pnpm dev

docker-up: ## Docker services only
	docker compose up -d neo4j backend
	@echo "[OK] Docker services running"

# ═══════════════════════════════════════════════════════════════════════════
clean: ## Clean build artifacts + database
	@echo "==> Cleaning .next..."
	-rmdir /S /Q $(NEXTJS_DIR)\.next 2>nul
	@echo "==> Removing SQLite DB..."
	-del /Q $(NEXTJS_DIR)\data\learning.db 2>nul
	@echo "[OK] Cleaned"

clean-all: clean ## Deep clean (includes Docker volumes + node_modules)
	@echo "==> Cleaning Docker volumes..."
	docker compose down -v
	@echo "==> Removing node_modules..."
	-rmdir /S /Q $(NEXTJS_DIR)\node_modules 2>nul
	@echo "[OK] Deep cleaned"
