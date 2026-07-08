.PHONY: help install start stop restart seed reseed test build clean clean-all status dev backend docker-up logs docker-app

.DEFAULT_GOAL := help

FRONTEND_DIR := frontend
BACKEND_DIR := backend
COMPOSE := $(shell docker compose version >/dev/null 2>&1 && echo "docker compose" || echo "docker-compose")
PNPM_VERSION := 10.33.4
IS_WIN := $(shell uname -s 2>/dev/null | grep -qi mingw && echo 1 || echo 0)
PYTHON := $(shell if [ "$(IS_WIN)" = "1" ]; then echo python; else echo python3; fi)
VENV_PYTHON := $(shell if [ "$(IS_WIN)" = "1" ]; then echo .venv/Scripts/python; else echo .venv/bin/python; fi)

check-pnpm:
	@test "$$(pnpm --version)" = "$(PNPM_VERSION)" || (echo "pnpm $(PNPM_VERSION) is required. Run: corepack prepare pnpm@$(PNPM_VERSION) --activate" && exit 1)

help:
	@echo "AI Knowledge Atlas — 两种启动方式"
	@echo ""
	@echo "  方式1: 混合模式 (前端+后端本地, Neo4j + PostgreSQL Docker)"
	@echo "    make start       一键启动 (Neo4j + PostgreSQL Docker + 本地后端 + 本地前端)"
	@echo "    make stop        停止所有服务"
	@echo "    make restart     重启整栈"
	@echo ""
	@echo "  方式2: 全 Docker 模式"
	@echo "    make docker-app  构建并启动全部服务 (Neo4j + PostgreSQL + 后端 + 前端)"
	@echo ""
	@echo "  单独启动/管理:"
	@echo "    make install     安装前后端依赖"
	@echo "    make docker-up   仅启动 Docker 依赖服务 (Neo4j + PostgreSQL)"
	@echo "    make backend     单独启动本地后端 (前景)"
	@echo "    make dev         单独启动本地前端 (前景)"
	@echo "    make seed        向 Neo4j 写入种子数据"
	@echo "    make build       构建前端"
	@echo "    make test        检查 HTTP 端点"
	@echo "    make status      显示 Docker 状态"
	@echo "    make logs        查看 Docker 日志"
	@echo "    make clean       移除前端构建产物和数据库文件"
	@echo "    make clean-all   移除产物 + Docker volumes"

install: check-pnpm
	cd $(BACKEND_DIR) && $(PYTHON) -m venv .venv && $(VENV_PYTHON) -m pip install -q -r requirements.txt
	cd $(FRONTEND_DIR) && pnpm install

start:
	powershell.exe -NoProfile -ExecutionPolicy Bypass -File start.ps1

stop:
	$(COMPOSE) down

restart: stop start

docker-up:
	$(COMPOSE) up -d neo4j postgres

docker-app:
	$(COMPOSE) --profile app up -d --build neo4j backend frontend

backend:
	cd $(BACKEND_DIR) && \
	NEO4J_URI=$${NEO4J_URI:-bolt://localhost:7687} \
	NEO4J_USER=$${NEO4J_USER:-neo4j} \
	NEO4J_PASSWORD=$${NEO4J_PASSWORD:-ai-knowledge-graph} \
	DATABASE_URL=$${DATABASE_URL:-postgresql://app:app_password@localhost:5432/ai_knowledge_atlas} \
	ENABLE_SCHEDULER=$${ENABLE_SCHEDULER:-false} \
	$(VENV_PYTHON) -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

dev: check-pnpm
	cd $(FRONTEND_DIR) && \
	NEXT_PUBLIC_API_URL=$${NEXT_PUBLIC_API_URL:-http://localhost:8000} \
	pnpm dev

seed:
	cd $(BACKEND_DIR) && \
	NEO4J_URI=$${NEO4J_URI:-bolt://localhost:7687} \
	NEO4J_USER=$${NEO4J_USER:-neo4j} \
	NEO4J_PASSWORD=$${NEO4J_PASSWORD:-ai-knowledge-graph} \
	$(VENV_PYTHON) scripts/seed_data.py

reseed:
	cd $(BACKEND_DIR) && DATABASE_URL=$${DATABASE_URL:-postgresql://app:app_password@localhost:5432/ai_knowledge_atlas} $(VENV_PYTHON) scripts/migrate_sqlite_learning_to_postgres.py

build: check-pnpm
	cd $(FRONTEND_DIR) && pnpm build

test:
	@curl -fsS http://localhost:8000/health >/dev/null && echo "[OK] Backend health"
	@curl -fsS http://localhost:3000/ >/dev/null && echo "[OK] Frontend home"
	@curl -fsS http://localhost:3000/graph >/dev/null && echo "[OK] Graph page"

status:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f neo4j postgres

clean:
	rm -rf $(FRONTEND_DIR)/.next

clean-all: clean
	$(COMPOSE) down -v
	rm -rf $(FRONTEND_DIR)/node_modules
