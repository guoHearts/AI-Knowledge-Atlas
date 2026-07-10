# Local development launcher for AI Knowledge Atlas.
# Starts Docker dependency services, then runs FastAPI and Next.js locally.

param(
    [switch]$SkipNeo4j,
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$InstallOnly
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

$script:StartedDocker = $false
$script:StartedBackend = $false
$script:StartedFrontend = $false

function Invoke-Cleanup {
    Write-Host ""
    Write-Host "==> Shutting down" -ForegroundColor Cyan

    if ($script:StartedBackend) {
        $backendPidFile = Join-Path $RUNTIME_DIR "backend.pid"
        Stop-RecordedProcess $backendPidFile
    }
    if ($script:StartedFrontend) {
        $frontendPidFile = Join-Path $RUNTIME_DIR "frontend.pid"
        Stop-RecordedProcess $frontendPidFile
    }
    if ($script:StartedDocker) {
        Write-Warn "Stopping Docker services (Neo4j + PostgreSQL)"
        Push-Location $ROOT
        try {
            Invoke-DockerCompose down
        }
        catch {
            Write-Warn "docker compose down failed, containers may still be running"
        }
        finally {
            Pop-Location
        }
    }
    Write-OK "All services stopped"
}

trap {
    Write-Host ""
    Write-Warn "Script stopped due to error: $_"
    Invoke-Cleanup
    break
}

function Assert-Command($Name, $InstallHint) {
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $cmd) {
        throw "$Name was not found. $InstallHint"
    }
}

function Ensure-FrontendDeps {
    Push-Location $FRONTEND_DIR
    try {
        if (-not (Test-Path "node_modules\.modules.yaml")) {
            Write-Step "Installing frontend dependencies"
            Invoke-Pnpm install
        }
        else {
            Write-OK "Frontend dependencies already installed"
        }
    }
    finally {
        Pop-Location
    }
}

function Wait-ForHttp($Url, $Name) {
    for ($i = 1; $i -le 60; $i++) {
        try {
            $null = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
            Write-OK "$Name is ready"
            return
        }
        catch {
            Start-Sleep -Seconds 2
        }
    }

    throw "$Name did not become ready: $Url"
}

function Escape-ForSingleQuotedPowerShellString {
    param([string]$Value)
    return $Value.Replace("'", "''")
}

function Assert-StartedProcess {
    param(
        [System.Diagnostics.Process]$Process,
        [string]$Name,
        [string]$LogPath
    )

    Start-Sleep -Seconds 1
    $runningProcess = Get-Process -Id $Process.Id -ErrorAction SilentlyContinue
    if (-not $runningProcess) {
        throw "$Name exited immediately. Check log: $LogPath"
    }
}

Write-Step "Checking prerequisites"
Assert-Command "node" "Install Node.js 20+ and make sure it is on PATH."
Assert-PnpmVersion
Assert-Command "docker" "Install Docker Desktop and start it."

New-Item -ItemType Directory -Force -Path $RUNTIME_DIR, $LOG_DIR | Out-Null

if (-not $SkipNeo4j) {
    Write-Step "Starting Docker dependency services"
    Push-Location $ROOT
    try {
        Invoke-DockerCompose up -d neo4j postgres
        $script:StartedDocker = $true
    }
    finally {
        Pop-Location
    }
    Write-OK "Neo4j and PostgreSQL are running in Docker"
}

if (-not $SkipBackend) {
    Write-Step "Checking Neo4j connectivity"
    Wait-ForTcp "127.0.0.1" 7687 "Neo4j"
    Write-Step "Checking PostgreSQL connectivity"
    Wait-ForTcp "127.0.0.1" 5432 "PostgreSQL"
}

if (-not $SkipBackend) {
    Ensure-BackendVenv
}

if (-not $SkipFrontend) {
    Ensure-FrontendDeps
}

if ($InstallOnly) {
    Write-OK "Dependencies installed. Services were not started because -InstallOnly was set."
    exit 0
}

if (-not $SkipBackend) {
    Write-Step "Starting local FastAPI backend"
    $script:StartedBackend = $true
    $backendPidFile = Join-Path $RUNTIME_DIR "backend.pid"
    $backendOutLog = Join-Path $LOG_DIR "backend.out.log"
    $backendErrLog = Join-Path $LOG_DIR "backend.err.log"
    Stop-RecordedProcess $backendPidFile

    $escapedBackendDir = Escape-ForSingleQuotedPowerShellString $BACKEND_DIR
    $escapedBackendPython = Escape-ForSingleQuotedPowerShellString (Get-BackendPython)
    $backendCommand = "& { Set-Location -LiteralPath '$escapedBackendDir'; " +
        "`$env:NEO4J_URI = if (`$env:NEO4J_URI) { `$env:NEO4J_URI } else { 'bolt://127.0.0.1:7687' }; " +
        "`$env:NEO4J_USER = if (`$env:NEO4J_USER) { `$env:NEO4J_USER } else { 'neo4j' }; " +
        "`$env:NEO4J_PASSWORD = if (`$env:NEO4J_PASSWORD) { `$env:NEO4J_PASSWORD } else { 'ai-knowledge-graph' }; " +
        "`$env:DATABASE_URL = if (`$env:DATABASE_URL) { `$env:DATABASE_URL } else { 'postgresql://app:app_password@127.0.0.1:5432/ai_knowledge_atlas' }; " +
        "`$env:ENABLE_SCHEDULER = if (`$env:ENABLE_SCHEDULER) { `$env:ENABLE_SCHEDULER } else { 'false' }; " +
        "& '$escapedBackendPython' -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload }"

    $backendProcess = Start-Process -FilePath "powershell.exe" `
        -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $backendCommand) `
        -WindowStyle Hidden `
        -RedirectStandardOutput $backendOutLog `
        -RedirectStandardError $backendErrLog `
        -PassThru
    Set-Content -Path $backendPidFile -Value $backendProcess.Id
    Assert-StartedProcess $backendProcess "Backend" $backendErrLog

    Wait-ForHttp "http://127.0.0.1:8000/health" "Backend"

    try {
        $nodes = Invoke-RestMethod -Uri "http://127.0.0.1:8000/graph/nodes?limit=1" -TimeoutSec 10
        if (@($nodes).Count -eq 0) {
            Write-Step "Seeding Neo4j graph data"
            Push-Location $BACKEND_DIR
            try {
                Use-BackendEnv
                & (Get-BackendPython) scripts\seed_data.py
            }
            finally {
                Pop-Location
            }
        }
    }
    catch {
        Write-Warn "Skipping automatic seed check: $($_.Exception.Message)"
    }
}

if (-not $SkipFrontend) {
    Write-Step "Starting local Next.js frontend"
    $script:StartedFrontend = $true
    $frontendPidFile = Join-Path $RUNTIME_DIR "frontend.pid"
    $frontendOutLog = Join-Path $LOG_DIR "frontend.out.log"
    $frontendErrLog = Join-Path $LOG_DIR "frontend.err.log"
    Stop-RecordedProcess $frontendPidFile

    $escapedFrontendDir = Escape-ForSingleQuotedPowerShellString $FRONTEND_DIR
    $escapedPnpmCommand = Escape-ForSingleQuotedPowerShellString (Resolve-PnpmCommand)
    $frontendCommand = "& { Set-Location -LiteralPath '$escapedFrontendDir'; " +
        "`$env:NEXT_PUBLIC_API_URL = if (`$env:NEXT_PUBLIC_API_URL) { `$env:NEXT_PUBLIC_API_URL } else { 'http://localhost:8000' }; " +
        "& '$escapedPnpmCommand' dev }"

    $frontendProcess = Start-Process -FilePath "powershell.exe" `
        -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $frontendCommand) `
        -WindowStyle Hidden `
        -RedirectStandardOutput $frontendOutLog `
        -RedirectStandardError $frontendErrLog `
        -PassThru
    Set-Content -Path $frontendPidFile -Value $frontendProcess.Id
    Assert-StartedProcess $frontendProcess "Frontend" $frontendErrLog

    Wait-ForHttp "http://127.0.0.1:3000/" "Frontend"
}

Write-Host ""
Write-Host "Local stack started:" -ForegroundColor Green
if (-not $SkipFrontend) {
    Write-Host "  Frontend:      http://localhost:3000"
    Write-Host "  Knowledge map: http://localhost:3000/graph"
}
if (-not $SkipBackend) {
    Write-Host "  Backend API:   http://localhost:8000"
    Write-Host "  API docs:      http://localhost:8000/docs"
}
if (-not $SkipNeo4j) {
    Write-Host "  Neo4j Browser: http://localhost:7474"
    Write-Host "  PostgreSQL:    localhost:5432"
}
Write-Host ""
Write-Host "Logs:"
if (-not $SkipBackend) {
    Write-Host "  Backend:  Get-Content .runtime\logs\backend.err.log -Wait"
}
if (-not $SkipFrontend) {
    Write-Host "  Frontend: Get-Content .runtime\logs\frontend.out.log -Wait"
}
Write-Host ""
Write-Host "Stop:"
Write-Host "  Ctrl+C or .\Make.ps1 stop"
