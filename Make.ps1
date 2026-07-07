param(
    [Parameter(Position = 0)]
    [ValidateSet("help", "install", "start", "stop", "restart", "dev", "backend", "docker-up",
                 "docker-app", "seed", "reseed", "build", "test", "status", "logs", "clean", "clean-all")]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $ROOT "backend"
$FRONTEND_DIR = Join-Path $ROOT "frontend"
$RUNTIME_DIR = Join-Path $ROOT ".runtime"
$LOG_DIR = Join-Path $RUNTIME_DIR "logs"
$REQUIRED_PNPM_VERSION = "10.33.4"

function Write-Step($Message) { Write-Host "==> $Message" -ForegroundColor Cyan }
function Write-OK($Message) { Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Warn($Message) { Write-Host "[WARN] $Message" -ForegroundColor Yellow }

function Resolve-PnpmCommand {
    if ($script:PnpmCommand) {
        return $script:PnpmCommand
    }

    $commands = @(Get-Command "pnpm.cmd" -All -ErrorAction SilentlyContinue)
    if ($commands.Count -eq 0) {
        $commands = @(Get-Command "pnpm" -All -ErrorAction SilentlyContinue)
    }

    if ($commands.Count -eq 0) {
        throw "pnpm was not found. Install pnpm $REQUIRED_PNPM_VERSION or enable it with Corepack."
    }

    $foundVersions = @()
    foreach ($cmd in $commands) {
        try {
            $version = (& $cmd.Source --version).Trim()
            $foundVersions += "$($cmd.Source) => $version"
            if ($version -eq $REQUIRED_PNPM_VERSION) {
                $script:PnpmCommand = $cmd.Source
                return $script:PnpmCommand
            }
        }
        catch {
            $foundVersions += "$($cmd.Source) => unavailable"
        }
    }

    throw "pnpm version mismatch. Required $REQUIRED_PNPM_VERSION. Found: $($foundVersions -join '; ')"
}

function Assert-PnpmVersion {
    $pnpmCommand = Resolve-PnpmCommand
    $actualVersion = (& $pnpmCommand --version).Trim()
    if ($actualVersion -ne $REQUIRED_PNPM_VERSION) {
        throw "pnpm version mismatch. Required $REQUIRED_PNPM_VERSION, found $actualVersion at $pnpmCommand."
    }
}

function Invoke-Pnpm {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$PnpmArgs
    )

    & (Resolve-PnpmCommand) @PnpmArgs
}

function Set-PythonLauncher {
    if ($env:PYTHON -and (Test-Path $env:PYTHON)) {
        $script:PythonExe = $env:PYTHON
        $script:PythonPrefixArgs = @()
        return
    }

    if (Get-Command "python" -ErrorAction SilentlyContinue) {
        $script:PythonExe = "python"
        $script:PythonPrefixArgs = @()
        return
    }

    if (Get-Command "py" -ErrorAction SilentlyContinue) {
        $script:PythonExe = "py"
        $script:PythonPrefixArgs = @("-3")
        return
    }

    throw "Python was not found. Install Python 3.12+, set PYTHON to a Python executable, or recreate backend/.venv manually."
}

function Invoke-BasePython {
    param([string[]]$PythonArgs)
    & $script:PythonExe @script:PythonPrefixArgs @PythonArgs
}

function Get-BackendPython {
    $backendPython = Join-Path $BACKEND_DIR ".venv\Scripts\python.exe"
    if (-not (Test-Path $backendPython)) {
        throw "Backend virtual environment was not found: $backendPython. Run .\Make.ps1 install first."
    }
    return $backendPython
}

function Test-BackendPython {
    $backendPython = Join-Path $BACKEND_DIR ".venv\Scripts\python.exe"
    if (-not (Test-Path $backendPython)) {
        return $false
    }

    & $backendPython --version *> $null
    return $LASTEXITCODE -eq 0
}

function Use-DockerComposePlugin {
    if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
        return $false
    }

    cmd /c "docker compose version >NUL 2>NUL"
    return $LASTEXITCODE -eq 0
}

function Invoke-DockerCompose {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$ComposeArgs
    )

    if (Use-DockerComposePlugin) {
        $previousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        & docker compose @ComposeArgs
    }
    else {
        $previousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        & docker-compose @ComposeArgs
    }
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousErrorActionPreference

    if ($exitCode -ne 0) {
        throw "Docker Compose failed with exit code $exitCode."
    }
}

function Use-BackendEnv {
    $env:NEO4J_URI = if ($env:NEO4J_URI) { $env:NEO4J_URI } else { "bolt://localhost:7687" }
    $env:NEO4J_USER = if ($env:NEO4J_USER) { $env:NEO4J_USER } else { "neo4j" }
    $env:NEO4J_PASSWORD = if ($env:NEO4J_PASSWORD) { $env:NEO4J_PASSWORD } else { "ai-knowledge-graph" }
    $env:ENABLE_SCHEDULER = if ($env:ENABLE_SCHEDULER) { $env:ENABLE_SCHEDULER } else { "false" }
}

function Wait-ForTcp($HostName, $Port, $Name) {
    for ($i = 1; $i -le 60; $i++) {
        $client = New-Object System.Net.Sockets.TcpClient
        try {
            $connectTask = $client.ConnectAsync($HostName, $Port)
            if ($connectTask.Wait(1000) -and $client.Connected) {
                Write-OK "$Name is reachable at ${HostName}:${Port}"
                return
            }
        }
        catch {
        }
        finally {
            $client.Close()
        }

        Start-Sleep -Seconds 2
    }

    throw "$Name is not reachable at ${HostName}:${Port}. Start Neo4j with .\Make.ps1 docker-up first."
}

function Ensure-BackendVenv {
    Push-Location $BACKEND_DIR
    try {
        if (-not (Test-BackendPython)) {
            Set-PythonLauncher
            Invoke-BasePython @("-m", "venv", "--clear", ".venv")
        }
        & (Get-BackendPython) -m pip install -q -r requirements.txt
    }
    finally {
        Pop-Location
    }
}

function Stop-RecordedProcess {
    param([string]$PidFile)

    if (-not (Test-Path $PidFile)) {
        return
    }

    $processId = Get-Content -Path $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($processId) {
        Stop-ProcessTree ([int]$processId)
    }

    Remove-Item -Force $PidFile -ErrorAction SilentlyContinue
}

function Stop-ProcessTree {
    param([int]$ProcessId)

    $children = Get-CimInstance Win32_Process -Filter "ParentProcessId=$ProcessId" -ErrorAction SilentlyContinue
    foreach ($child in $children) {
        Stop-ProcessTree ([int]$child.ProcessId)
    }

    $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $ProcessId -Force
    }
}

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
        & (Join-Path $ROOT "start.ps1")
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
            Invoke-DockerCompose up -d neo4j
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
        Wait-ForTcp "localhost" 7687 "Neo4j"
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
            $env:DATABASE_PATH = if ($env:DATABASE_PATH) { $env:DATABASE_PATH } else { ".\data\learning.db" }
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
        Remove-Item -Force (Join-Path $FRONTEND_DIR "data\learning.db") -ErrorAction SilentlyContinue
        & $MyInvocation.MyCommand.Path "seed"
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
        Remove-Item -Force (Join-Path $FRONTEND_DIR "data\learning.db") -ErrorAction SilentlyContinue
        Write-OK "Local frontend build/database artifacts removed"
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
