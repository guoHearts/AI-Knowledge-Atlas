<#
.SYNOPSIS
    AI 开发者实训平台 — Windows 一键管理脚本
.DESCRIPTION
    PowerShell 版 Makefile，支持 start/stop/test/build/seed/status 等操作
.EXAMPLE
    .\Make.ps1 start        # 启动全栈
    .\Make.ps1 test         # 运行测试
    .\Make.ps1 status       # 查看状态
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet("help", "install", "start", "stop", "restart", "dev", "docker-up",
                 "seed", "reseed", "build", "test", "status", "logs", "clean", "clean-all")]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$NEXTJS_DIR = Join-Path $ROOT "frontend"

# 颜色
function Write-Step($msg) { Write-Host "▶ $msg" -ForegroundColor Cyan }
function Write-OK($msg) { Write-Host "✓ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "⚠ $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "✗ $msg" -ForegroundColor Red }

# PATH 修复 (nvm 切换 Node 版本后需要)
function Fix-Path {
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [Environment]::GetEnvironmentVariable("Path", "User")
}

# ═══════════════════════════════════════════════════════════════
switch ($Command) {
    "help" {
        Write-Host @"

AI 开发者实训平台 — PowerShell 管理命令
══════════════════════════════════════════════

  .\Make.ps1 start        启动全栈服务
  .\Make.ps1 stop         停止所有服务
  .\Make.ps1 restart      重启所有服务
  .\Make.ps1 install      安装所有依赖
  .\Make.ps1 build        生产构建前端
  .\Make.ps1 test         运行全栈测试
  .\Make.ps1 seed         注入 Neo4j 种子数据
  .\Make.ps1 reseed       重建所有种子数据
  .\Make.ps1 status       查看服务状态
  .\Make.ps1 logs         查看后端日志
  .\Make.ps1 dev          仅启动前端 dev 模式
  .\Make.ps1 docker-up    仅启动 Docker (Neo4j + Backend)
  .\Make.ps1 clean        清理构建产物
  .\Make.ps1 clean-all    深度清理
  .\Make.ps1 help         显示此帮助

快速开始: .\Make.ps1 start

"@
    }

    "install" {
        Fix-Path
        Write-Step "安装前端依赖..."
        Push-Location $NEXTJS_DIR
        npm install
        Pop-Location
        Write-OK "前端依赖安装完成"

        Write-Step "安装后端依赖..."
        Push-Location (Join-Path $ROOT "backend")
        pip install -r requirements.txt
        Pop-Location
        Write-OK "后端依赖安装完成"
        Write-OK "所有依赖安装完毕!"
    }

    "start" {
        Fix-Path
        Write-Step "启动 Neo4j + FastAPI 后端..."
        Push-Location $ROOT
        docker compose up -d neo4j backend
        Pop-Location
        Write-OK "后端容器已启动"

        Start-Sleep -Seconds 6
        Write-Step "启动 Next.js 前端 (dev 模式)..."
        Push-Location $NEXTJS_DIR
        Start-Process -NoNewWindow npm -ArgumentList "run","dev"
        Pop-Location

        Start-Sleep -Seconds 5
        Write-Host ""
        Write-Host "═══════════════════════════════════════" -F Green
        Write-Host "  全栈服务已启动" -F Green
        Write-Host "  前端: http://localhost:3000" -F Green
        Write-Host "  后端: http://localhost:8000" -F Green
        Write-Host "  Neo4j: bolt://localhost:7687" -F Green
        Write-Host "═══════════════════════════════════════" -F Green
    }

    "stop" {
        Write-Warn "停止 Next.js 前端..."
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 2

        Write-Warn "停止 Docker 容器..."
        Push-Location $ROOT
        docker compose down
        Pop-Location
        Write-OK "所有服务已停止"
    }

    "restart" {
        & $MyInvocation.MyCommand.Path "stop"
        & $MyInvocation.MyCommand.Path "start"
    }

    "dev" {
        Fix-Path
        Write-Step "启动前端开发服务器..."
        Push-Location $NEXTJS_DIR
        npm run dev
        Pop-Location
    }

    "docker-up" {
        Write-Step "启动 Neo4j + Backend..."
        Push-Location $ROOT
        docker compose up -d neo4j backend
        Pop-Location
        Write-OK "Docker 服务已启动"
    }

    "seed" {
        Write-Step "向 Neo4j 注入种子数据..."
        docker exec ai-knowledge-graph-backend-1 python scripts/seed_data.py
        Write-OK "Neo4j 种子数据注入完成"
    }

    "reseed" {
        Write-Warn "删除旧 SQLite 数据库..."
        Remove-Item -Force (Join-Path $NEXTJS_DIR "data\learning.db") -ErrorAction SilentlyContinue

        Write-Step "运行 Neo4j 种子..."
        docker exec ai-knowledge-graph-backend-1 python scripts/seed_data.py

        Write-Step "触发前端重建 SQLite..."
        $null = Invoke-WebRequest "http://localhost:3000/" -UseBasicParsing -TimeoutSec 30 -ErrorAction SilentlyContinue

        Write-OK "种子数据全部重建完成"
    }

    "build" {
        Fix-Path
        Write-Step "构建 Next.js 前端..."
        Push-Location $NEXTJS_DIR
        npm run build
        Pop-Location
        Write-OK "构建完成"
    }

    "test" {
        Write-Step "运行全栈自动化测试..."
        Write-Host ""

        $pass = 0; $fail = 0

        function Test($name, $script) {
            try {
                $result = & $script
                if ($result) {
                    Write-Host "  ✅ $name" -F Green
                    $global:pass++
                } else {
                    Write-Host "  ❌ $name" -F Red
                    $global:fail++
                }
            } catch {
                Write-Host "  ❌ $name" -F Red
                $global:fail++
            }
        }

        Write-Host "--- 前端页面 ---" -F Cyan
        Test "首页 200" { (iwr "http://localhost:3000/" -UseBasic -TimeoutSec 10).StatusCode -eq 200 }
        Test "路线详情 200" { (iwr "http://localhost:3000/learn/agent-engineer" -UseBasic -TimeoutSec 10).StatusCode -eq 200 }
        Test "图谱页 200" { (iwr "http://localhost:3000/graph" -UseBasic -TimeoutSec 10).StatusCode -eq 200 }
        Test "CMS 200" { (iwr "http://localhost:3000/cms" -UseBasic -TimeoutSec 10).StatusCode -eq 200 }

        Write-Host "--- API 路由 ---" -F Cyan
        Test "tracks" { (irm "http://localhost:3000/api/tracks" -TimeoutSec 10).Count -ge 1 }
        Test "modules (10个)" { (irm "http://localhost:3000/api/tracks/agent-engineer" -TimeoutSec 10).modules.Count -eq 10 }
        Test "design-patterns (9个)" { (irm "http://localhost:3000/api/design-patterns" -TimeoutSec 10).Count -eq 9 }

        Write-Host "--- 后端 ---" -F Cyan
        Test "health" { (irm "http://localhost:8000/health" -TimeoutSec 5).status -eq "ok" }
        Test "graph/nodes" { (irm "http://localhost:8000/graph/nodes?limit=10" -TimeoutSec 10).Count -eq 10 }
        Test "graph/edges" { (irm "http://localhost:8000/graph/edges?limit=10" -TimeoutSec 10).Count -eq 10 }

        Write-Host "--- 种子数据 ---" -F Cyan
        $track = irm "http://localhost:3000/api/tracks/agent-engineer" -TimeoutSec 10
        Test "10模块" { $track.modules.Count -eq 10 }
        Test "RAG模块存在" { ($track.modules | ForEach-Object title) -like "*RAG*" }

        $total = $pass + $fail
        Write-Host ""
        Write-Host "═══════════════════════════════════════" -F Green
        Write-Host "  通过: $pass / 失败: $fail (共 $total)" -F Green
        Write-Host "═══════════════════════════════════════" -F Green
    }

    "status" {
        Write-Host "--- Docker 容器 ---" -F Cyan
        docker ps --filter "name=ai-knowledge-graph" --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"

        Write-Host ""
        Write-Host "--- HTTP 健康 ---" -F Cyan
        try {
            $r = iwr "http://localhost:3000/" -UseBasic -TimeoutSec 5
            Write-Host "  前端: $($r.StatusCode)" -F Green
        } catch { Write-Host "  前端: 未运行" -F Red }

        try {
            $r = irm "http://localhost:8000/health" -TimeoutSec 5
            Write-Host "  后端: $($r.status)" -F Green
        } catch { Write-Host "  后端: 未运行" -F Red }

        Write-Host ""
        Write-Host "--- 数据库 ---" -F Cyan
        $dbPath = Join-Path $NEXTJS_DIR "data\learning.db"
        if (Test-Path $dbPath) {
            $size = [math]::Round((Get-Item $dbPath).Length / 1KB, 1)
            Fix-Path
            $modCount = node -e "const D=require('better-sqlite3');const d=new D('$($dbPath -replace '\\','\\')');console.log(d.prepare('SELECT count(*) as c FROM modules').get().c)" 2>$null
            Write-Host "  SQLite: ${size}KB, $($modCount.Trim()) 模块" -F Green
        } else {
            Write-Host "  SQLite: 未创建" -F Yellow
        }
    }

    "logs" {
        docker logs -f ai-knowledge-graph-backend-1
    }

    "clean" {
        Write-Warn "清理 .next 构建产物..."
        Remove-Item -Recurse -Force (Join-Path $NEXTJS_DIR ".next") -ErrorAction SilentlyContinue
        Write-Warn "清理 SQLite 数据库..."
        Remove-Item -Force (Join-Path $NEXTJS_DIR "data\learning.db") -ErrorAction SilentlyContinue
        Write-OK "清理完成"
    }

    "clean-all" {
        & $MyInvocation.MyCommand.Path "clean"
        Write-Warn "清理 Docker volumes..."
        Push-Location $ROOT
        docker compose down -v
        Pop-Location
        Write-Warn "清理 node_modules..."
        Remove-Item -Recurse -Force (Join-Path $NEXTJS_DIR "node_modules") -ErrorAction SilentlyContinue
        Write-OK "深度清理完成"
    }
}
