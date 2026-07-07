from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import asyncio

from .config import settings
from .task_manager import TaskManager, Task, TaskStatus, TaskPriority
from .tasks.data_export import DataExportAgent


# API key security
api_key_header = APIKeyHeader(name="X-API-Key")

app = FastAPI(
    title="Production Agent with Human Approval",
    description="An agent framework with human-in-the-loop approval mechanisms",
    version="1.0.0"
)

# Initialize components
task_manager = TaskManager()
data_export_agent = DataExportAgent(task_manager)

# Background task processor
async def process_tasks():
    """Background task to process queued tasks."""
    while True:
        try:
            # Get next task from execution queue
            task_id = task_manager.redis_client.lpop("execution_queue")
            
            if task_id:
                task_id = task_id.decode()
                task = task_manager.get_task(task_id)
                
                if task and task.status == TaskStatus.PENDING:
                    # Execute the task
                    await execute_task(task)
            
            # Sleep briefly before checking again
            await asyncio.sleep(1)
            
        except Exception as e:
            print(f"Error in task processor: {e}")
            await asyncio.sleep(5)


async def execute_task(task: Task):
    """Execute a specific task."""
    try:
        task.status = TaskStatus.RUNNING
        task.started_at = datetime.utcnow()
        task_manager._update_task(task)
        
        # Execute based on task type
        if task.task_type == "data_export":
            result = await data_export_agent.execute(task)
        else:
            result = {"status": "failed", "error": "Unknown task type"}
        
        # Handle result
        if result["status"] == "completed":
            task.status = TaskStatus.COMPLETED
            task.result = result["result"]
        elif result["status"] == "awaiting_approval":
            task.status = TaskStatus.APPROVAL_REQUIRED
        else:
            task.status = TaskStatus.FAILED
            task.error_message = result.get("error", "Unknown error")
        
        task.completed_at = datetime.utcnow()
        task_manager._update_task(task)
        
    except Exception as e:
        task.status = TaskStatus.FAILED
        task.error_message = str(e)
        task.completed_at = datetime.utcnow()
        task_manager._update_task(task)


async def verify_api_key(api_key: str = Depends(api_key_header)) -> str:
    """Verify the API key."""
    if not settings.api_key_required:
        return "anonymous"
    
    if api_key != settings.agent_api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return api_key


class TaskSubmissionRequest(BaseModel):
    task_type: str
    action: str
    parameters: Dict[str, Any]
    requires_approval: bool = False
    priority: str = "normal"
    description: str = ""


class TaskResponse(BaseModel):
    task_id: str
    status: str
    message: str


class TaskStatusResponse(BaseModel):
    task: Dict[str, Any]


class ApprovalRequest(BaseModel):
    approver: str
    reason: str = ""


@app.on_event("startup")
async def startup_event():
    """Start background task processor."""
    asyncio.create_task(process_tasks())


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }


@app.post("/agent/tasks", response_model=TaskResponse)
async def submit_task(
    request: TaskSubmissionRequest,
    api_key: str = Depends(verify_api_key)
):
    """Submit a new task for processing."""
    try:
        # Validate priority
        if request.priority not in settings.priority_levels:
            raise HTTPException(status_code=400, detail=f"Invalid priority. Must be one of: {settings.priority_levels}")
        
        # Create task
        task = Task(
            task_type=request.task_type,
            action=request.action,
            parameters=request.parameters,
            requires_approval=request.requires_approval,
            priority=request.priority,
            description=request.description
        )
        
        # Submit task
        task_id = task_manager.submit_task(task)
        
        return TaskResponse(
            task_id=task_id,
            status="submitted",
            message="Task submitted successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to submit task: {str(e)}")


@app.get("/agent/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: str,
    api_key: str = Depends(verify_api_key)
):
    """Get the status of a specific task."""
    task = task_manager.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return TaskStatusResponse(task=task.to_dict())


@app.get("/agent/tasks", response_model=List[Dict[str, Any]])
async def list_tasks(
    status: Optional[str] = None,
    api_key: str = Depends(verify_api_key)
):
    """List tasks, optionally filtered by status."""
    # This is a simplified implementation
    # In production, you'd want to scan Redis for tasks with specific status
    
    # For demo purposes, return pending approvals
    if status == "approval_required":
        tasks = task_manager.get_pending_approvals()
        return [task.to_dict() for task in tasks]
    
    # Return empty list for other status filters (would need proper implementation)
    return []


@app.post("/agent/tasks/{task_id}/approve", response_model=TaskResponse)
async def approve_task(
    task_id: str,
    request: ApprovalRequest,
    api_key: str = Depends(verify_api_key)
):
    """Approve a task for execution."""
    success = task_manager.approve_task(task_id, request.approver)
    
    if not success:
        raise HTTPException(status_code=404, detail="Task not found or not in approval state")
    
    return TaskResponse(
        task_id=task_id,
        status="approved",
        message="Task approved successfully"
    )


@app.post("/agent/tasks/{task_id}/reject", response_model=TaskResponse)
async def reject_task(
    task_id: str,
    request: ApprovalRequest,
    api_key: str = Depends(verify_api_key)
):
    """Reject a task."""
    success = task_manager.reject_task(task_id, request.approver, request.reason)
    
    if not success:
        raise HTTPException(status_code=404, detail="Task not found or not in approval state")
    
    return TaskResponse(
        task_id=task_id,
        status="rejected",
        message="Task rejected successfully"
    )


@app.post("/agent/tasks/{task_id}/rollback/{checkpoint_id}", response_model=TaskResponse)
async def rollback_task(
    task_id: str,
    checkpoint_id: str,
    api_key: str = Depends(verify_api_key)
):
    """Rollback a task to a specific checkpoint."""
    task = task_manager.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    success = task_manager.rollback_to_checkpoint(task_id, checkpoint_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Checkpoint not found")
    
    return TaskResponse(
        task_id=task_id,
        status="rolled_back",
        message="Task rolled back to checkpoint successfully"
    )


@app.get("/approval/pending", response_model=List[Dict[str, Any]])
async def get_pending_approvals(
    api_key: str = Depends(verify_api_key)
):
    """Get list of tasks pending approval."""
    tasks = task_manager.get_pending_approvals()
    return [task.to_dict() for task in tasks]


# Import datetime here to avoid issues
from datetime import datetime

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.agent_port)