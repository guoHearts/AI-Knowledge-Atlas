import uuid
import json
import time
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from enum import Enum
import redis
from .config import settings


class TaskStatus(Enum):
    PENDING = "pending"
    APPROVAL_REQUIRED = "approval_required"
    APPROVED = "approved" 
    REJECTED = "rejected"
    RUNNING = "running"
    CHECKPOINT = "checkpoint"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskPriority(Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class Task:
    """Represents a task that can be executed by the agent."""
    
    def __init__(
        self,
        task_type: str,
        action: str,
        parameters: Dict[str, Any],
        requires_approval: bool = False,
        priority: str = "normal",
        description: str = ""
    ):
        self.id = str(uuid.uuid4())
        self.task_type = task_type
        self.action = action
        self.parameters = parameters
        self.requires_approval = requires_approval
        self.priority = priority
        self.description = description
        
        self.status = TaskStatus.PENDING
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None
        
        self.checkpoints: List[Dict[str, Any]] = []
        self.history: List[Dict[str, Any]] = []
        self.error_message: Optional[str] = None
        self.result: Optional[Dict[str, Any]] = None
        
        # Approval tracking
        self.approval_requested_at: Optional[datetime] = None
        self.approved_by: Optional[str] = None
        self.approved_at: Optional[datetime] = None
        
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "task_type": self.task_type,
            "action": self.action,
            "parameters": self.parameters,
            "requires_approval": self.requires_approval,
            "priority": self.priority,
            "description": self.description,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "checkpoints": self.checkpoints,
            "history": self.history,
            "error_message": self.error_message,
            "result": self.result,
            "approval_requested_at": self.approval_requested_at.isoformat() if self.approval_requested_at else None,
            "approved_by": self.approved_by,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None
        }


class TaskManager:
    """Manages task lifecycle, approval workflow, and checkpoints."""
    
    def __init__(self):
        self.redis_client = redis.from_url(settings.redis_url)
        
    def submit_task(self, task: Task) -> str:
        """Submit a new task for processing."""
        # Add task to Redis
        task_key = f"task:{task.id}"
        task_data = json.dumps(task.to_dict())
        self.redis_client.setex(
            task_key,
            60 * 60 * 24 * 7,  # 7 days TTL
            task_data
        )
        
        # Add to appropriate queue
        if task.requires_approval:
            self.redis_client.rpush("approval_queue", task.id)
            task.status = TaskStatus.APPROVAL_REQUIRED
            task.approval_requested_at = datetime.utcnow()
        else:
            self.redis_client.rpush("execution_queue", task.id)
            task.status = TaskStatus.PENDING
        
        # Update task status
        self._update_task(task)
        
        # Log task creation
        self._log_task_event(task.id, "task_created", {
            "task_type": task.task_type,
            "requires_approval": task.requires_approval
        })
        
        return task.id
    
    def approve_task(self, task_id: str, approver: str) -> bool:
        """Approve a task for execution."""
        task = self.get_task(task_id)
        if not task or task.status != TaskStatus.APPROVAL_REQUIRED:
            return False
        
        task.status = TaskStatus.APPROVED
        task.approved_by = approver
        task.approved_at = datetime.utcnow()
        task.updated_at = datetime.utcnow()
        
        # Move to execution queue
        self.redis_client.lrem("approval_queue", 0, task_id)
        self.redis_client.rpush("execution_queue", task_id)
        
        # Update task
        self._update_task(task)
        
        # Log approval
        self._log_task_event(task_id, "task_approved", {
            "approver": approver,
            "approved_at": task.approved_at.isoformat()
        })
        
        return True
    
    def reject_task(self, task_id: str, approver: str, reason: str = "") -> bool:
        """Reject a task."""
        task = self.get_task(task_id)
        if not task or task.status != TaskStatus.APPROVAL_REQUIRED:
            return False
        
        task.status = TaskStatus.REJECTED
        task.error_message = f"Rejected by {approver}: {reason}"
        task.updated_at = datetime.utcnow()
        
        # Remove from approval queue
        self.redis_client.lrem("approval_queue", 0, task_id)
        
        # Update task
        self._update_task(task)
        
        # Log rejection
        self._log_task_event(task_id, "task_rejected", {
            "approver": approver,
            "reason": reason
        })
        
        return True
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """Retrieve a task by ID."""
        task_key = f"task:{task_id}"
        task_data = self.redis_client.get(task_key)
        
        if not task_data:
            return None
        
        task_dict = json.loads(task_data)
        return self._dict_to_task(task_dict)
    
    def get_pending_approvals(self) -> List[Task]:
        """Get list of tasks pending approval."""
        task_ids = self.redis_client.lrange("approval_queue", 0, -1)
        tasks = []
        
        for task_id in task_ids:
            task = self.get_task(task_id.decode())
            if task:
                tasks.append(task)
        
        return tasks
    
    def create_checkpoint(self, task_id: str, name: str, data: Dict[str, Any]) -> str:
        """Create a checkpoint for a task."""
        checkpoint_id = str(uuid.uuid4())
        checkpoint = {
            "id": checkpoint_id,
            "name": name,
            "data": data,
            "created_at": datetime.utcnow().isoformat(),
            "task_state": self.get_task(task_id).to_dict() if self.get_task(task_id) else None
        }
        
        task = self.get_task(task_id)
        if task:
            task.checkpoints.append(checkpoint)
            task.status = TaskStatus.CHECKPOINT
            task.updated_at = datetime.utcnow()
            self._update_task(task)
            
            # Log checkpoint creation
            self._log_task_event(task_id, "checkpoint_created", {
                "checkpoint_id": checkpoint_id,
                "checkpoint_name": name
            })
        
        return checkpoint_id
    
    def rollback_to_checkpoint(self, task_id: str, checkpoint_id: str) -> bool:
        """Rollback task to a specific checkpoint."""
        task = self.get_task(task_id)
        if not task:
            return False
        
        # Find checkpoint
        checkpoint = None
        for cp in task.checkpoints:
            if cp["id"] == checkpoint_id:
                checkpoint = cp
                break
        
        if not checkpoint:
            return False
        
        # Restore task state from checkpoint
        if checkpoint["task_state"]:
            task = self._dict_to_task(checkpoint["task_state"])
            task.id = task_id  # Ensure ID doesn't change
            
        # Log rollback
        self._log_task_event(task_id, "task_rollback", {
            "checkpoint_id": checkpoint_id,
            "checkpoint_name": checkpoint["name"]
        })
        
        return True
    
    def _update_task(self, task: Task):
        """Update task in Redis."""
        task_key = f"task:{task.id}"
        task_data = json.dumps(task.to_dict())
        self.redis_client.setex(
            task_key,
            60 * 60 * 24 * 7,  # 7 days TTL
            task_data
        )
    
    def _log_task_event(self, task_id: str, event_type: str, data: Dict[str, Any]):
        """Log a task event."""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "task_id": task_id,
            "event_type": event_type,
            "data": data
        }
        
        log_key = f"task_log:{task_id}"
        self.redis_client.rpush(log_key, json.dumps(log_entry))
        self.redis_client.expire(log_key, 60 * 60 * 24 * 30)  # 30 days TTL
    
    def _dict_to_task(self, task_dict: Dict[str, Any]) -> Task:
        """Convert dictionary to Task object."""
        task = Task(
            task_type=task_dict["task_type"],
            action=task_dict["action"],
            parameters=task_dict["parameters"],
            requires_approval=task_dict["requires_approval"],
            priority=task_dict["priority"],
            description=task_dict["description"]
        )
        
        task.id = task_dict["id"]
        task.status = TaskStatus(task_dict["status"])
        task.created_at = datetime.fromisoformat(task_dict["created_at"])
        task.updated_at = datetime.fromisoformat(task_dict["updated_at"])
        
        if task_dict["started_at"]:
            task.started_at = datetime.fromisoformat(task_dict["started_at"])
        if task_dict["completed_at"]:
            task.completed_at = datetime.fromisoformat(task_dict["completed_at"])
        
        task.checkpoints = task_dict["checkpoints"]
        task.history = task_dict["history"]
        task.error_message = task_dict["error_message"]
        task.result = task_dict["result"]
        
        if task_dict["approval_requested_at"]:
            task.approval_requested_at = datetime.fromisoformat(task_dict["approval_requested_at"])
        if task_dict["approved_at"]:
            task.approved_at = datetime.fromisoformat(task_dict["approved_at"])
        
        task.approved_by = task_dict["approved_by"]
        
        return task