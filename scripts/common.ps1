# AI Knowledge Atlas — 共享函数模块
# 由 Make.ps1 和 start.ps1 dot-source 引入。
# 依赖调用方预先定义: $ROOT, $BACKEND_DIR, $FRONTEND_DIR, $RUNTIME_DIR, $LOG_DIR, $REQUIRED_PNPM_VERSION

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

# ---------------------------------------------------------------------------
# 环境修复：部分 Windows Shell 同时暴露 Path 和 PATH，导致 Start-Process
# 在 .NET 构建大小写不敏感环境字典时失败。
# ---------------------------------------------------------------------------
function Normalize-ProcessPathEnvironment {
    $pathValue = [System.Environment]::GetEnvironmentVariable("Path", "Process")
    if (-not $pathValue) {
        $pathValue = [System.Environment]::GetEnvironmentVariable("PATH", "Process")
    }

    if ($pathValue) {
        [System.Environment]::SetEnvironmentVariable("PATH", $null, "Process")
        [System.Environment]::SetEnvironmentVariable("Path", $pathValue, "Process")
    }
}

# ---------------------------------------------------------------------------
# pnpm 管理
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# Python / venv
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# Docker Compose（懒检测，缓存结果）
# ---------------------------------------------------------------------------
function Invoke-DockerCompose {
    # 不用 param() 块 —— PowerShell 会把 -d / --profile 等误解析为函数参数名。
    # 直接用 $args 透传所有参数给 docker compose / docker-compose。

    if ($null -eq $script:_DockerComposeCmd) {
        $previousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        try {
            if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
                $script:_DockerComposeCmd = "docker-compose"
            }
            else {
                cmd /c "docker compose version >NUL 2>NUL"
                if ($LASTEXITCODE -eq 0) {
                    $script:_DockerComposeCmd = "docker compose"
                }
                else {
                    throw "Docker Compose was not found. Install Docker Compose v2 or docker-compose."
                }
            }
        }
        finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        if ($script:_DockerComposeCmd -eq "docker compose") {
            & docker compose @args
        }
        else {
            & docker-compose @args
        }
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    if ($exitCode -ne 0) {
        throw "Docker Compose failed with exit code $exitCode."
    }
}

# ---------------------------------------------------------------------------
# 环境变量
# ---------------------------------------------------------------------------
function Use-BackendEnv {
    $env:NEO4J_URI = if ($env:NEO4J_URI) { $env:NEO4J_URI } else { "bolt://127.0.0.1:7687" }
    $env:NEO4J_USER = if ($env:NEO4J_USER) { $env:NEO4J_USER } else { "neo4j" }
    $env:NEO4J_PASSWORD = if ($env:NEO4J_PASSWORD) { $env:NEO4J_PASSWORD } else { "ai-knowledge-graph" }
    $env:ENABLE_SCHEDULER = if ($env:ENABLE_SCHEDULER) { $env:ENABLE_SCHEDULER } else { "false" }
}

# ---------------------------------------------------------------------------
# 网络等待
# ---------------------------------------------------------------------------
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

        if (($i -eq 1) -or ($i % 5 -eq 0)) {
            Write-Warn "Waiting for $Name at ${HostName}:${Port} ($i/60)"
        }
        Start-Sleep -Seconds 2
    }

    throw "$Name is not reachable at ${HostName}:${Port}. Start Neo4j first."
}

# ---------------------------------------------------------------------------
# 进程管理
# ---------------------------------------------------------------------------
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
