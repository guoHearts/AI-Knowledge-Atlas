# ============================================================
# AI 知识图谱 — 一键启动脚本 (Windows PowerShell)
# 启动 Neo4j + FastAPI 后端 + Next.js 前端
# ============================================================

param(
    [switch]$SkipNeo4j,
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$InstallOnly
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# ---------- 颜色输出 ----------
function Write-Step($msg) {
    Write-Host "`n>>> " -NoNewline -ForegroundColor Cyan
    Write-Host $msg -ForegroundColor White
}

function Write-OK($msg) {
    Write-Host "  ✔ " -NoNewline -ForegroundColor Green
    Write-Host $msg
}

function Write-Warn($msg) {
    Write-Host "  ⚠ " -NoNewline -ForegroundColor Yellow
    Write-Host $msg
}

function Write-Err($msg) {
    Write-Host "  ✘ " -NoNewline -ForegroundColor Red
    Write-Host $msg
}

# ---------- 检查前置条件 ----------
Write-Step "检查前置条件..."

$allOk = $true

try { python --version 2>&1 | Out-Null; Write-OK "Python 已安装" } catch { Write-Err "未找到 Python"; $allOk = $false }
try { node --version 2>&1 | Out-Null; Write-OK "Node.js 已安装" } catch { Write-Err "未找到 Node.js"; $allOk = $false }
try { docker --version 2>&1 | Out-Null; Write-OK "Docker 已安装" } catch { Write-Err "未找到 Docker"; $allOk = $false }

if (-not $allOk) {
    Write-Err "请先安装缺失的前置依赖"
    exit 1
}

# ---------- 1. 启动 Neo4j ----------
if (-not $SkipNeo4j) {
    Write-Step "1/3 启动 Neo4j 数据库..."

    $neo4jName = "ai-kg-neo4j"
    $neo4jExists = docker ps -a --filter "name=$neo4jName" --format "{{.Names}}" 2>&1

    if ($neo4jExists -eq $neo4jName) {
        $neo4jRunning = docker ps --filter "name=$neo4jName" --format "{{.Names}}" 2>&1
        if ($neo4jRunning -eq $neo4jName) {
            Write-OK "Neo4j 容器已在运行"
        } else {
            Write-Step "启动已有 Neo4j 容器..."
            docker start $neo4jName 2>&1 | Out-Null
            Write-OK "Neo4j 容器已启动"
        }
    } else {
        Write-Step "创建 Neo4j 容器 (neo4j:5-community)..."
        docker run -d `
            --name $neo4jName `
            -p 7474:7474 `
            -p 7687:7687 `
            -e NEO4J_AUTH="neo4j/ai-knowledge-graph" `
            -e NEO4J_PLUGINS='["apoc"]' `
            neo4j:5-community 2>&1 | Out-Null
        Write-OK "Neo4j 容器已创建并启动"
    }

    # 等待 Neo4j 就绪
    Write-Step "等待 Neo4j 就绪..."
    $retries = 0
    do {
        Start-Sleep -Seconds 2
        $retries++
        $ready = docker exec $neo4jName neo4j status 2>&1
    } while ($LASTEXITCODE -ne 0 -and $retries -lt 30)

    if ($retries -ge 30) {
        Write-Err "Neo4j 启动超时，请检查 Docker 容器状态"
        exit 1
    }
    Write-OK "Neo4j 已就绪 (bolt://localhost:7687)"
}

# ---------- 2. 启动后端 ----------
if (-not $SkipBackend) {
    Write-Step "2/3 启动 FastAPI 后端..."

    Set-Location "$ROOT\backend"

    # 创建虚拟环境
    if (-not (Test-Path ".venv\Scripts\python.exe")) {
        Write-Step "创建 Python 虚拟环境..."
        python -m venv .venv
        Write-OK "虚拟环境已创建"
    } else {
        Write-OK "虚拟环境已存在"
    }

    # 激活并安装依赖
    Write-Step "安装 Python 依赖..."
    & .\.venv\Scripts\python.exe -m pip install -q -r requirements.txt 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Python 依赖安装失败"
        exit 1
    }
    Write-OK "Python 依赖已安装"

    # 检查 .env
    if (-not (Test-Path ".env")) {
        Copy-Item "$ROOT\.env" ".env" -ErrorAction SilentlyContinue
        if (Test-Path ".env") {
            Write-OK "已复制 .env 配置文件"
        } else {
            Write-Warn "未找到 .env 文件，使用默认配置"
        }
    }

    if ($InstallOnly) {
        Write-OK "依赖安装完成 (--InstallOnly)"
    } else {
        Write-Step "启动后端 (http://localhost:8000)..."
        $backendJob = Start-Job -Name "ai-kg-backend" -ScriptBlock {
            Set-Location $using:ROOT\backend
            & .\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload 2>&1
        }
        Write-OK "后端已在后台启动 (Job: ai-kg-backend)"
    }
}

# ---------- 3. 启动前端 ----------
if (-not $SkipFrontend) {
    Write-Step "3/3 启动 Next.js 前端..."

    Set-Location "$ROOT\nextjs-frontend"

    # 安装依赖
    if (-not (Test-Path "node_modules\.package-lock.json")) {
        Write-Step "安装 npm 依赖 (可能需要几分钟)..."
        npm install 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Err "npm 依赖安装失败"
            exit 1
        }
    } else {
        Write-OK "npm 依赖已安装"
    }

    if ($InstallOnly) {
        Write-OK "依赖安装完成 (--InstallOnly)"
    } else {
        Write-Step "启动前端 (http://localhost:3000)..."
        $frontendJob = Start-Job -Name "ai-kg-frontend" -ScriptBlock {
            Set-Location $using:ROOT\nextjs-frontend
            npm run dev 2>&1
        }
        Write-OK "前端已在后台启动 (Job: ai-kg-frontend)"
    }
}

# ---------- 完成 ----------
if (-not $InstallOnly) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  项目已启动!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  前端:     http://localhost:3000" -ForegroundColor White
    Write-Host "  后端 API: http://localhost:8000" -ForegroundColor White
    Write-Host "  API 文档: http://localhost:8000/docs" -ForegroundColor White
    Write-Host "  Neo4j:    http://localhost:7474" -ForegroundColor White
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "管理命令:" -ForegroundColor Yellow
    Write-Host "  查看后端日志:  Receive-Job -Name ai-kg-backend" -ForegroundColor Gray
    Write-Host "  查看前端日志:  Receive-Job -Name ai-kg-frontend" -ForegroundColor Gray
    Write-Host "  停止后端:      Stop-Job -Name ai-kg-backend" -ForegroundColor Gray
    Write-Host "  停止前端:      Stop-Job -Name ai-kg-frontend" -ForegroundColor Gray
    Write-Host "  停止 Neo4j:    docker stop ai-kg-neo4j" -ForegroundColor Gray
    Write-Host ""
}

Set-Location $ROOT
