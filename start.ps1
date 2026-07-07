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

function Write-Step($Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-OK($Message) {
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn($Message) {
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Assert-Command($Name, $InstallHint) {
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $cmd) {
        throw "$Name was not found. $InstallHint"
    }
}

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

function Invoke-DockerCompose {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$ComposeArgs
    )

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    if ($script:UseDockerComposePlugin) {
        & docker compose @ComposeArgs
    }
    else {
        & docker-compose @ComposeArgs
    }
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousErrorActionPreference

    if ($exitCode -ne 0) {
        throw "Docker Compose failed with exit code $exitCode."
    }
}

function Ensure-BackendVenv {
    Push-Location $BACKEND_DIR
    try {
        if (-not (Test-BackendPython)) {
            Write-Step "Creating backend virtual environment"
            Set-PythonLauncher
            Invoke-BasePython @("-m", "venv", "--clear", ".venv")
        }

        Write-Step "Installing backend dependencies"
        & (Get-BackendPython) -m pip install -q -r requirements.txt
    }
    finally {
        Pop-Location
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

    throw "$Name is not reachable at ${HostName}:${Port}. Start Neo4j first, or run without -SkipNeo4j."
}

function Use-LocalBackendEnv {
    $env:NEO4J_URI = if ($env:NEO4J_URI) { $env:NEO4J_URI } else { "bolt://localhost:7687" }
    $env:NEO4J_USER = if ($env:NEO4J_USER) { $env:NEO4J_USER } else { "neo4j" }
    $env:NEO4J_PASSWORD = if ($env:NEO4J_PASSWORD) { $env:NEO4J_PASSWORD } else { "ai-knowledge-graph" }
    $env:ENABLE_SCHEDULER = if ($env:ENABLE_SCHEDULER) { $env:ENABLE_SCHEDULER } else { "false" }
}

function Stop-RecordedProcess {
    param([string]$PidFile)

    if (-not (Test-Path $PidFile)) {
        return
    }

    $processId = Get-Content -Path $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $processId) {
        Remove-Item -Force $PidFile -ErrorAction SilentlyContinue
        return
    }

    Stop-ProcessTree ([int]$processId)
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

function Escape-ForSingleQuotedPowerShellString {
    param([string]$Value)
    return $Value.Replace("'", "''")
}

Write-Step "Checking prerequisites"
Assert-Command "node" "Install Node.js 20+ and make sure it is on PATH."
Assert-PnpmVersion
Assert-Command "docker" "Install Docker Desktop and start it."
if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
    $script:UseDockerComposePlugin = $false
}
else {
    cmd /c "docker compose version >NUL 2>NUL"
    if ($LASTEXITCODE -eq 0) {
        $script:UseDockerComposePlugin = $true
    }
    else {
        throw "Docker Compose was not found. Install Docker Compose v2 or docker-compose."
    }
}
Write-OK "Prerequisites found"

New-Item -ItemType Directory -Force -Path $RUNTIME_DIR, $LOG_DIR | Out-Null

if (-not $SkipNeo4j) {
    Write-Step "Starting Docker dependency services"
    Push-Location $ROOT
    try {
        Invoke-DockerCompose up -d neo4j
    }
    finally {
        Pop-Location
    }
    Write-OK "Neo4j is running in Docker"
}

if (-not $SkipBackend) {
    Write-Step "Checking Neo4j connectivity"
    Wait-ForTcp "localhost" 7687 "Neo4j"
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
    $backendPidFile = Join-Path $RUNTIME_DIR "backend.pid"
    Stop-RecordedProcess $backendPidFile

    $escapedBackendDir = Escape-ForSingleQuotedPowerShellString $BACKEND_DIR
    $escapedBackendPython = Escape-ForSingleQuotedPowerShellString (Get-BackendPython)
    $backendCommand = "& { Set-Location -LiteralPath '$escapedBackendDir'; " +
        "`$env:NEO4J_URI = if (`$env:NEO4J_URI) { `$env:NEO4J_URI } else { 'bolt://localhost:7687' }; " +
        "`$env:NEO4J_USER = if (`$env:NEO4J_USER) { `$env:NEO4J_USER } else { 'neo4j' }; " +
        "`$env:NEO4J_PASSWORD = if (`$env:NEO4J_PASSWORD) { `$env:NEO4J_PASSWORD } else { 'ai-knowledge-graph' }; " +
        "`$env:ENABLE_SCHEDULER = if (`$env:ENABLE_SCHEDULER) { `$env:ENABLE_SCHEDULER } else { 'false' }; " +
        "& '$escapedBackendPython' -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload }"

    $backendProcess = Start-Process -FilePath "powershell.exe" `
        -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $backendCommand) `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $LOG_DIR "backend.out.log") `
        -RedirectStandardError (Join-Path $LOG_DIR "backend.err.log") `
        -PassThru
    Set-Content -Path $backendPidFile -Value $backendProcess.Id

    Wait-ForHttp "http://localhost:8000/health" "Backend"

    try {
        $nodes = Invoke-RestMethod -Uri "http://localhost:8000/graph/nodes?limit=1" -TimeoutSec 10
        if (@($nodes).Count -eq 0) {
            Write-Step "Seeding Neo4j graph data"
            Push-Location $BACKEND_DIR
            try {
                Use-LocalBackendEnv
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
    $frontendPidFile = Join-Path $RUNTIME_DIR "frontend.pid"
    Stop-RecordedProcess $frontendPidFile

    $escapedFrontendDir = Escape-ForSingleQuotedPowerShellString $FRONTEND_DIR
    $escapedPnpmCommand = Escape-ForSingleQuotedPowerShellString (Resolve-PnpmCommand)
    $frontendCommand = "& { Set-Location -LiteralPath '$escapedFrontendDir'; " +
        "`$env:NEXT_PUBLIC_API_URL = if (`$env:NEXT_PUBLIC_API_URL) { `$env:NEXT_PUBLIC_API_URL } else { 'http://localhost:8000' }; " +
        "`$env:DATABASE_PATH = if (`$env:DATABASE_PATH) { `$env:DATABASE_PATH } else { '.\data\learning.db' }; " +
        "& '$escapedPnpmCommand' dev }"

    $frontendProcess = Start-Process -FilePath "powershell.exe" `
        -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $frontendCommand) `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $LOG_DIR "frontend.out.log") `
        -RedirectStandardError (Join-Path $LOG_DIR "frontend.err.log") `
        -PassThru
    Set-Content -Path $frontendPidFile -Value $frontendProcess.Id
}

Write-Host ""
Write-Host "Local stack started:" -ForegroundColor Green
Write-Host "  Frontend:      http://localhost:3000"
Write-Host "  Knowledge map: http://localhost:3000/graph"
Write-Host "  Backend API:   http://localhost:8000"
Write-Host "  API docs:      http://localhost:8000/docs"
Write-Host "  Neo4j Browser: http://localhost:7474"
Write-Host ""
Write-Host "Logs:"
Write-Host "  Backend:  Get-Content .runtime\logs\backend.err.log -Wait"
Write-Host "  Frontend: Get-Content .runtime\logs\frontend.out.log -Wait"
Write-Host ""
Write-Host "Stop:"
Write-Host "  .\Make.ps1 stop"
if ($script:UseDockerComposePlugin) {
    Write-Host "  docker compose down"
}
else {
    Write-Host "  docker-compose down"
}
