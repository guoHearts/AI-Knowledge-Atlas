param(
    [Parameter(Position = 0)]
    [ValidateSet("help", "install", "start", "stop", "restart", "dev", "backend", "docker-up",
                 "docker-app", "seed", "reseed", "build", "test", "status", "logs", "clean", "clean-all")]
    [string]$Command = "help",

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Remaining
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $ROOT "backend"
$FRONTEND_DIR = Join-Path $ROOT "frontend"
$RUNTIME_DIR = Join-Path $ROOT ".runtime"
$LOG_DIR = Join-Path $RUNTIME_DIR "logs"
$REQUIRED_PNPM_VERSION = "10.33.4"

. (Join-Path $ROOT "scripts\common.ps1")
Normalize-ProcessPathEnvironment

function Show-RecordedProcess {
    param(
        [string]$Name,
        [string]$PidFile
    )

    if (-not (Test-Path $PidFile)) {
        Write-Warn "${Name}: no pid file"
        return
    }

    $processId = Get-Content -Path $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1
    $process = if ($processId) { Get-Process -Id ([int]$processId) -ErrorAction SilentlyContinue } else { $null }
    if ($process) {
        Write-OK "${Name}: running (PID $processId)"
    }
    else {
        Write-Warn "${Name}: pid file exists, process is not running"
    }
}

switch ($Command) {
    "help" {
        Write-Host @"
AI Knowledge Atlas — 两种启动方式

  方式1: 混合模式 (前端+后端本地, Neo4j Docker)
    .\Make.ps1 start       一键启动 (Neo4j Docker + 本地后端 + 本地前端)
    .\Make.ps1 stop        停止所有服务
    .\Make.ps1 restart     重启整栈

  方式2: 全 Docker 模式
    .\Make.ps1 docker-app  构建并启动全部服务 (Neo4j + 后端 + 前端)

  单独启动/管理:
    .\Make.ps1 install     安装前后端依赖
    .\Make.ps1 docker-up   仅启动 Docker 依赖服务 (Neo4j)
    .\Make.ps1 backend     单独启动本地后端 (前景)
    .\Make.ps1 dev         单独启动本地前端 (前景)
    .\Make.ps1 seed        向 Neo4j 写入种子数据
    .\Make.ps1 build       构建前端
    .\Make.ps1 test        检查 HTTP 端点
    .\Make.ps1 status      显示 Docker 和 HTTP 状态
    .\Make.ps1 logs        查看本地后端/前端日志
    .\Make.ps1 clean       移除前端构建产物和数据库文件
    .\Make.ps1 clean-all   移除产物 + Docker volumes
"@
    }

    "install" {
        Assert-PnpmVersion
        & (Join-Path $ROOT "start.ps1") -InstallOnly
    }

    "start" {
        & (Join-Path $ROOT "start.ps1") @Remaining
    }

    "stop" {
        Write-Warn "Stopping local frontend/backend processes"
        Stop-RecordedProcess (Join-Path $RUNTIME_DIR "backend.pid")
        Stop-RecordedProcess (Join-Path $RUNTIME_DIR "frontend.pid")

        Write-Warn "Stopping Docker services"
        Push-Location $ROOT
        try {
            Invoke-DockerCompose down
        }
        finally {
            Pop-Location
        }
        Write-OK "Stopped"
    }

    "restart" {
        & $MyInvocation.MyCommand.Path "stop"
        & $MyInvocation.MyCommand.Path "start"
    }

    "docker-up" {
        Push-Location $ROOT
        try {
            Invoke-DockerCompose up -d neo4j postgres
        }
        finally {
            Pop-Location
        }
        Write-OK "Docker dependency services are running"
    }

    "docker-app" {
        Write-Step "构建并启动全 Docker 栈 (Neo4j + Backend + Frontend)"
        Push-Location $ROOT
        try {
            Invoke-DockerCompose --profile app up -d --build neo4j backend frontend
        }
        finally {
            Pop-Location
        }
        Write-OK "全 Docker 栈已启动"
        Write-Host ""
        Write-Host "  前端:       http://localhost:3000"
        Write-Host "  后端 API:   http://localhost:8000"
        Write-Host "  API 文档:   http://localhost:8000/docs"
        Write-Host "  Neo4j:      http://localhost:7474"
        Write-Host ""
        Write-Host "停止: .\Make.ps1 stop"
    }

    "backend" {
        Wait-ForTcp "127.0.0.1" 7687 "Neo4j"
        Ensure-BackendVenv
        Use-BackendEnv
        Push-Location $BACKEND_DIR
        try {
            & (Get-BackendPython) -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
        }
        finally {
            Pop-Location
        }
    }

    "dev" {
        Assert-PnpmVersion
        Push-Location $FRONTEND_DIR
        try {
            $env:NEXT_PUBLIC_API_URL = if ($env:NEXT_PUBLIC_API_URL) { $env:NEXT_PUBLIC_API_URL } else { "http://localhost:8000" }
            Invoke-Pnpm dev
        }
        finally {
            Pop-Location
        }
    }

    "seed" {
        Ensure-BackendVenv
        Use-BackendEnv
        Push-Location $BACKEND_DIR
        try {
            & (Get-BackendPython) scripts\seed_data.py
        }
        finally {
            Pop-Location
        }
    }

    "reseed" {
        Push-Location $BACKEND_DIR
        try {
            if (-not $env:DATABASE_URL) {
                $env:DATABASE_URL = "postgresql://app:app_password@localhost:5432/ai_knowledge_atlas"
            }
            & ".\.venv\Scripts\python.exe" "scripts\migrate_sqlite_learning_to_postgres.py"
        }
        finally {
            Pop-Location
        }
    }

    "build" {
        Assert-PnpmVersion
        Push-Location $FRONTEND_DIR
        try {
            Invoke-Pnpm build
        }
        finally {
            Pop-Location
        }
    }

    "test" {
        Write-Step "Checking local HTTP endpoints"
        $checks = @(
            @("Frontend", "http://localhost:3000/"),
            @("Graph page", "http://localhost:3000/graph"),
            @("Backend health", "http://localhost:8000/health"),
            @("API docs", "http://localhost:8000/docs")
        )

        foreach ($check in $checks) {
            try {
                $response = Invoke-WebRequest -Uri $check[1] -UseBasicParsing -TimeoutSec 10
                Write-OK "$($check[0]): HTTP $($response.StatusCode)"
            }
            catch {
                Write-Warn "$($check[0]): unavailable"
            }
        }
    }

    "status" {
        Write-Host "--- Docker services ---" -ForegroundColor Cyan
        Invoke-DockerCompose ps

        Write-Host ""
        Write-Host "--- Local jobs ---" -ForegroundColor Cyan
        Show-RecordedProcess "Backend" (Join-Path $RUNTIME_DIR "backend.pid")
        Show-RecordedProcess "Frontend" (Join-Path $RUNTIME_DIR "frontend.pid")

        Write-Host ""
        & $MyInvocation.MyCommand.Path "test"
    }

    "logs" {
        Get-ChildItem -Path $LOG_DIR -Filter "*.log" -ErrorAction SilentlyContinue | ForEach-Object {
            Write-Host "--- $($_.Name) ---" -ForegroundColor Cyan
            Get-Content -Path $_.FullName -Tail 80 -ErrorAction SilentlyContinue
        }
    }

    "clean" {
        Remove-Item -Recurse -Force (Join-Path $FRONTEND_DIR ".next") -ErrorAction SilentlyContinue
        Write-OK "Local frontend build artifacts removed"
    }

    "clean-all" {
        & $MyInvocation.MyCommand.Path "clean"
        Push-Location $ROOT
        try {
            Invoke-DockerCompose down -v
        }
        finally {
            Pop-Location
        }
        Remove-Item -Recurse -Force (Join-Path $FRONTEND_DIR "node_modules") -ErrorAction SilentlyContinue
        Write-OK "Local artifacts and Docker volumes removed"
    }
}
