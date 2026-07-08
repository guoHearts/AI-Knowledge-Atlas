# Production Agent with Human Approval

A production-ready Agent framework with human-in-the-loop approval mechanisms, checkpoint/rollback capabilities, and audit trails for complex workflows.

## Features

- ✅ **Human Approval Workflow** - Critical operations require manual approval
- ✅ **Checkpoint & Rollback** - Automatic state snapshots and rollback capability
- ✅ **Task Queues** - Priority-based task queuing system
- ✅ **Execution History** - Complete audit trail of agent decisions
- ✅ **Interrupt & Resume** - Safe interruption and resumption of complex tasks
- ✅ **Approval Dashboard** - Web interface for human approvers

## Quick Start

### Prerequisites

- Python 3.12+
- Redis (for task queuing)
- Virtual environment (recommended)

### Installation

```bash
# Clone or navigate to this directory  
cd labs/production-agent-with-human-approval

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux: 
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

```bash
cp .env.example .env
```

Configure your settings:

```bash
# Required
REDIS_URL=redis://localhost:6379
APPROVAL_WEBHOOK_URL=http://localhost:3000/api/approval

# Optional 
MAX_TASK_RETRIES=3
APPROVAL_TIMEOUT_HOURS=24
CHECKPOINT_INTERVAL=300
```

### Running the Agent System

```bash
# Start the agent server
python agent_server.py

# Start the approval dashboard  
python approval_dashboard.py

# Or use the CLI client
python agent_client.py submit-task --type=data-export --description="Export user data"
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Agent Core    │    │  Approval Queue │    │ Human Approver  │
│                 │───▶│                 │───▶│                 │
│ • Task Planning │    │ • Priority Queue│    │ • Web Dashboard │
│ • Auto Execute  │    │ • Timeout Mgmt  │    │ • API Endpoints │
│ • Checkpoints   │    │ • Retry Logic   │    │ • Email Notifs  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Audit Trail   │
│                 │
│ • Decision Log  │
│ • Action History│
│ • Rollback Points│
└─────────────────┘
```

## Usage Examples

### Submit a Task for Approval

```python
from agent_client import AgentClient

client = AgentClient("http://localhost:8002")

# Submit a task that requires approval
task_id = client.submit_task({
    "type": "data_operation",
    "action": "export_user_data",
    "parameters": {
        "user_id": "user123",
        "format": "csv"
    },
    "requires_approval": True,
    "priority": "high",
    "description": "Export user data for compliance audit"
})

print(f"Task submitted: {task_id}")
```

### Approve/Reject via Dashboard

1. Human approver receives notification
2. Reviews task details in web dashboard: `http://localhost:8003`  
3. Clicks "Approve" or "Reject"
4. Agent automatically resumes or cancels

### Checkpoint & Rollback

```python
# View execution history
history = client.get_execution_history(task_id)
for step in history:
    print(f"{step['timestamp']}: {step['action']} - {step['status']}")

# Rollback to specific checkpoint
client.rollback_to_checkpoint(task_id, checkpoint_id="checkpoint_123")
```

## API Reference

### Agent Server Endpoints

**POST /agent/tasks**
Submit a new task for execution.

**GET /agent/tasks/{task_id}/status**  
Get current task status and progress.

**GET /agent/tasks/{task_id}/history**
Get complete execution history.

**POST /agent/tasks/{task_id}/rollback**
Rollback to a previous checkpoint.

### Approval Endpoints

**GET /approval/pending**
Get list of pending approval requests.

**POST /approval/{task_id}/approve**
Approve a pending task.

**POST /approval/{task_id}/reject** 
Reject a pending task.

**GET /approval/dashboard**
Web interface for human approvers.

## Safety Features

### Automatic Checkpoints

The agent automatically creates checkpoints at key decision points:

```python
class DataExportAgent:
    def execute(self, task):
        # Checkpoint 1: Validation complete
        self.create_checkpoint("validation_complete", validated_data)
        
        if task.requires_approval:
            # Wait for human approval
            self.request_approval("Data export", task.details)
            
        # Checkpoint 2: Export started
        self.create_checkpoint("export_started", export_config)
        
        # Perform export
        result = self.export_data()
        
        # Checkpoint 3: Export complete
        self.create_checkpoint("export_complete", result)
```

### Interrupt Mechanisms

Multiple levels of interruption:

1. **Soft Interrupt** - Finish current operation, stop planning new ones
2. **Hard Interrupt** - Stop immediately, rollback to last checkpoint  
3. **Emergency Stop** - Complete halt with audit trail preservation

### Approval Timeout Handling

- Configurable timeout periods (default: 24 hours)
- Automatic escalation for high-priority tasks
- Email/SMS notifications for approvers
- Graceful degradation: auto-approve safe operations

## Development

### Adding New Task Types

1. Create task handler in `tasks/` directory
2. Define approval requirements
3. Add checkpoint logic
4. Register with the agent core

### Testing

```bash
# Run unit tests
python -m pytest tests/ -v

# Test approval workflow
python tests/test_approval_workflow.py

# Integration tests
python tests/test_end_to_end.py
```

## Production Considerations

### Scaling

- Redis cluster for high-availability queuing
- Agent workers as separate microservices
- Database replication for audit trails
- Load balancing for approval dashboards

### Monitoring

- Task queue depth metrics
- Approval response times
- Agent execution success rates
- Rollback frequency analysis

### Security

- Role-based access control for approvers
- Audit trail encryption
- API key management and rotation
- Webhook signature verification

## Troubleshooting

### Common Issues

**Task stuck in approval queue:**
```bash
# Check task status
python agent_client.py status {task_id}

# View approval queue
python agent_client.py queue list
```

**Checkpoint restore failure:**
```bash
# View available checkpoints
python agent_client.py checkpoints {task_id}

# Check audit log for errors
tail -f logs/audit.log
```

**Agent not responding:**
```bash
# Check agent health
curl http://localhost:8002/health

# Restart agent services
python agent_server.py --restart
```

## License

MIT License - see LICENSE file for details.
