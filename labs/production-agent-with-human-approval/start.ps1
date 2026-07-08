# Production Agent with Human Approval
param(
    [switch]$Force
)

Write-Host "ProdQA Agent with Human Approval - Setup and Start Script" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

$AGENT_PORT = 8002
$DASHBOARD_PORT = 8003
$REDIS_PORT = 6379

# Check if ports are available
Write-Host "Checking port availability..." -ForegroundColor Yellow
$conflicts = @()

if (Get-NetTCPConnection -LocalPort $AGENT_PORT -ErrorAction SilentlyContinue) {
    $conflicts += "Port $AGENT_PORT (Agent) is in use"
}

if (Get-NetTCPConnection -LocalPort $DASHBOARD_PORT -ErrorAction SilentlyContinue) {
    $conflicts += "Port $DASHBOARD_PORT (Dashboard) is in use"
}

if (Get-NetTCPConnection -LocalPort $REDIS_PORT -ErrorAction SilentlyContinue) {
    $conflicts += "Port $REDIS_PORT (Redis) is in use"
}

if ($conflicts.Count -gt 0) {
    Write-Host "Port conflicts detected:" -ForegroundColor Red
    foreach ($conflict in $conflicts) {
        Write-Host "  - $conflict" -ForegroundColor Red
    }
    Write-Host "Please stop the conflicting services or use different ports." -ForegroundColor Red
    exit 1
}

# Check Redis installation
Write-Host "Checking Redis installation..." -ForegroundColor Yellow
$redisInstalled = $false
try {
    $redisVersion = & redis-cli --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        $redisInstalled = $true
        Write-Host "Redis is installed: $redisVersion" -ForegroundColor Green
    }
} catch {
    # Redis not available
}

if (-not $redisInstalled) {
    Write-Host "Redis is not installed. Please install Redis first." -ForegroundColor Red
    Write-Host "You can download Redis for Windows from: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Yellow
    exit 1
}

# Check Python dependencies
Write-Host "Checking Python dependencies..." -ForegroundColor Yellow
try {
    python -c "import fastapi; import redis; print('Dependencies OK')" 2>$null
} catch {
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Configuration
Write-Host "Setting up configuration..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Write-Host "Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "Please edit .env file with your specific configuration if needed." -ForegroundColor Yellow
} else {
    Write-Host ".env file already exists, skipping..." -ForegroundColor Green
}

# Start services
Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

# Function to stop all background jobs
function Cleanup {
    Write-Host "\nStopping all services..." -ForegroundColor Yellow
    Get-Job | Stop-Job -PassThru | Remove-Job
    exit 0
}

# Set up Ctrl+C handler
$global:jobsToClean = @()
$originalPrompt = $function:prompt

function global:prompt {
    if ([Console]::KeyAvailable) {
        $key = [Console]::ReadKey($true)
        if ($key.Key -eq "C" -and ($key.Modifiers -band [ConsoleModifiers]::Control)) {
            Cleanup
        }
    }
    return (& $originalPrompt)
}

try {
    # Start Redis (if not already running)
    $redisRunning = $false
    try {
        $pingResult = & redis-cli ping 2>$null
        if ($pingResult -eq "PONG") {
            $redisRunning = $true
            Write-Host "Redis is already running" -ForegroundColor Green
        }
    } catch {
        # Redis not running
    }
    
    if (-not $redisRunning) {
        Write-Host "Starting Redis server..." -ForegroundColor Yellow
        $redisJob = Start-Process -FilePath "redis-server" -ArgumentList "--port $REDIS_PORT" -PassThru
        $global:jobsToClean += $redisJob.Id
        Start-Sleep -Seconds 2
    }
    
    # Wait a moment for Redis to start
    Start-Sleep -Seconds 2
    
    # Test Redis connection
    try {
        $pingResult = & redis-cli ping 2>$null
        if ($pingResult -eq "PONG") {
            Write-Host "Redis connection OK" -ForegroundColor Green
        } else {
            Write-Error "Failed to connect to Redis"
            Cleanup
        }
    } catch {
        Write-Error "Failed to test Redis connection"
        Cleanup
    }
    
    # Start Agent Server
    Write-Host "Starting Agent Server on port $AGENT_PORT..." -ForegroundColor Yellow
    $agentJob = Start-Process -FilePath "python" -ArgumentList "agent_server.py" -PassThru
    $global:jobsToClean += $agentJob.Id
    
    # Wait for agent to start
    Start-Sleep -Seconds 3
    
    # Test agent connectivity
    try {
        $testResult = Invoke-RestMethod -Uri "http://localhost:$AGENT_PORT/health" -TimeoutSec 5
        if ($testResult.status -eq "healthy") {
            Write-Host "Agent Server is running and healthy" -ForegroundColor Green
        }
    } catch {
        Write-Error "Failed to connect to Agent Server"
        Cleanup
    }
    
    # Start Dashboard (create a simple one for now)
    Write-Host "Creating simple dashboard..." -ForegroundColor Yellow
    @"
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import threading
import time

class DashboardHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            html = '''
<!DOCTYPE html>
<html>
<head>
    <title>Production Agent Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 5px; }
        .header { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
        .status { padding: 10px; margin: 5px 0; border-radius: 3px; }
        .healthy { background: #d4edda; color: #155724; }
        .warning { background: #fff3cd; color: #856404; }
        .error { background: #f8d7da; color: #721c24; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
        button { margin: 5px; padding: 5px 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1> Production Agent with Human Approval Dashboard</h1>
            <p>Monitor and manage agent tasks requiring human approval.</p>
        </div>
        
        <div id="agentStatus">
            <h2>Agent Status</h2>
            <div id="status" class="status">Loading...</div>
        </div>
        
        <div id="pendingApprovals">
            <h2>Pending Approvals</h2>
            <div id="approvalsList">Loading...</div>
        </div>
    </div>
    
    <script>
        function checkAgentHealth() {
            fetch('http://localhost:8002/health')
                .then(response => {
                    if (!response.ok) throw new Error();
                    return response.json();
                })
                .then(data => {
                    document.getElementById('status').innerHTML = 
                        '<span class="status healthy">✓ Agent Server: ' + data.status + '</span>';
                })
                .catch(error => {
                    document.getElementById('status').innerHTML = 
                        '<span class="status error">✗ Agent Server: Connection failed</span>';
                });
        }
        
        function loadPendingApprovals() {
            fetch('http://localhost:8002/approval/pending', {
                headers: { 'X-API-Key': 'your-agent-api-key' }
            })
                .then(response => {
                    if (!response.ok) throw new Error();
                    return response.json();
                })
                .then(data => {
                    const container = document.getElementById('approvalsList');
                    if (data.length === 0) {
                        container.innerHTML = '<p>No pending approvals.</p>';
                    } else {
                        let html = '<table>';
                        html += '<tr><th>Task ID</th><th>Type</th><th>Description</th><th>Priority</th><th>Actions</th></tr>';
                        data.forEach(task => {
                            html += `
                                <tr>
                                    <td>${task.id.substring(0, 8)}...</td>
                                    <td>${task.task_type}</td>
                                    <td>${task.description || 'No description'}</td>
                                    <td>${task.priority}</td>
                                    <td>
                                        <button onclick="approveTask('${task.id}')">Approve</button>
                                        <button onclick="rejectTask('${task.id}')">Reject</button>
                                    </td>
                                </tr>
                            `;
                        });
                        html += '</table>';
                        container.innerHTML = html;
                    }
                })
                .catch(error => {
                    document.getElementById('approvalsList').innerHTML = 
                        '<span class="status error">Failed to load approvals</span>';
                });
        }
        
        function approveTask(taskId) {
            fetch(`http://localhost:8002/agent/tasks/${taskId}/approve`, {
                method: 'POST',
                headers: {
                    'X-API-Key': 'your-agent-api-key',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ approver: 'dashboard-user' })
            })
                .then(() => {
                    loadPendingApprovals();
                    alert('Task approved successfully');
                })
                .catch(() => {
                    alert('Failed to approve task');
                });
        }
        
        function rejectTask(taskId) {
            const reason = prompt('Please provide a reason for rejection:');
            if (reason) {
                fetch(`http://localhost:8002/agent/tasks/${taskId}/reject`, {
                    method: 'POST',
                    headers: {
                        'X-API-Key': 'your-agent-api-key',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ approver: 'dashboard-user', reason: reason })
                })
                    .then(() => {
                        loadPendingApprovals();
                        alert('Task rejected successfully');
                    })
                    .catch(() => {
                        alert('Failed to reject task');
                    });
            }
        }
        
        // Initial load
        checkAgentHealth();
        loadPendingApprovals();
        
        // Refresh every 10 seconds
        setInterval(checkAgentHealth, 10000);
        setInterval(loadPendingApprovals, 10000);
    </script>
</body>
</html>'''
            self.wfile.write(html.encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress log messages
        pass

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8003), DashboardHandler)
    print('Dashboard server running on http://localhost:8003')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nDashboard stopped')
        server.server_close()
"@ | Out-File -FilePath "dashboard_server.py" -Encoding ASCII
    
    Write-Host "Starting Dashboard Server on port $DASHBOARD_PORT..." -ForegroundColor Yellow
    $dashboardJob = Start-Process -FilePath "python" -ArgumentList "dashboard_server.py" -PassThru
    $global:jobsToClean += $dashboardJob.Id
    
    # Wait a moment
    Start-Sleep -Seconds 2
    
    # Show running status
    Write-Host "" -ForegroundColor White
    Write-Host "Services started successfully!" -ForegroundColor Green
    Write-Host "" -ForegroundColor White
    Write-Host "Agent Server: http://localhost:$AGENT_PORT" -ForegroundColor Cyan
    Write-Host "Dashboard: http://localhost:$DASHBOARD_PORT" -ForegroundColor Cyan
    Write-Host "" -ForegroundColor White
    Write-Host "Test the system with these commands:" -ForegroundColor Yellow
    Write-Host "  health - Check server status" -ForegroundColor White
    Write-Host "  submit-task --type=data_export --action=export --params='{\"format\":\"csv\"}' --approval --description='Test export'" -ForegroundColor White
    Write-Host "  approvals - List pending tasks" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Yellow
    
    # Keep the script running
    while ($true) {
        Start-Sleep -Seconds 1
    }
} 
catch {
    Write-Error $_
    Cleanup
}