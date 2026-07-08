import os
from typing import List, Optional


class AgentSettings:
    """Configuration for the production agent system."""
    
    def __init__(self):
        # Server Configuration
        self.host = os.getenv("HOST", "0.0.0.0")
        self.agent_port = int(os.getenv("AGENT_PORT", "8002"))
        self.dashboard_port = int(os.getenv("DASHBOARD_PORT", "8003"))
        self.debug = os.getenv("DEBUG", "true").lower() == "true"
        
        # Redis Configuration
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", "6379"))
        self.redis_db = int(os.getenv("REDIS_DB", "0"))
        
        # Task Configuration
        self.max_task_retries = int(os.getenv("MAX_TASK_RETRIES", "3"))
        self.approval_timeout_hours = int(os.getenv("APPROVAL_TIMEOUT_HOURS", "24"))
        self.checkpoint_interval = int(os.getenv("CHECKPOINT_INTERVAL", "300"))
        self.max_concurrent_tasks = int(os.getenv("MAX_CONCURRENT_TASKS", "5"))
        
        # Notification Configuration
        self.webhook_base_url = os.getenv("WEBHOOK_BASE_URL", "http://localhost:3000/api")
        self.approval_webhook_path = os.getenv("APPROVAL_WEBHOOK_PATH", "/approval/notify")
        self.rejection_webhook_path = os.getenv("REJECTION_WEBHOOK_PATH", "/approval/reject")
        
        # Logging Configuration
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.audit_log_path = os.getenv("AUDIT_LOG_PATH", "logs/audit.log")
        self.task_log_path = os.getenv("TASK_LOG_PATH", "logs/tasks.log")
        
        # Dashboard Configuration
        self.dashboard_secret_key = os.getenv("DASHBOARD_SECRET_KEY", "your-dashboard-secret-key")
        self.session_timeout_minutes = int(os.getenv("SESSION_TIMEOUT_MINUTES", "60"))
        
        # Security Configuration
        self.api_key_required = os.getenv("API_KEY_REQUIRED", "true").lower() == "true"
        self.agent_api_key = os.getenv("AGENT_API_KEY", "your-agent-api-key")
        self.dashboard_api_key = os.getenv("DASHBOARD_API_KEY", "your-dashboard-api-key")
        
        # Checkpoint Configuration
        self.checkpoint_storage = os.getenv("CHECKPOINT_STORAGE", "redis")
        self.max_checkpoints_per_task = int(os.getenv("MAX_CHECKPOINTS_PER_TASK", "10"))
        self.checkpoint_ttl_hours = int(os.getenv("CHECKPOINT_TTL_HOURS", "168"))
        
        # Priority Configuration
        priority_levels_str = os.getenv("PRIORITY_LEVELS", "low,normal,high,critical")
        self.priority_levels = [level.strip() for level in priority_levels_str.split(",")]
        self.default_priority = os.getenv("DEFAULT_PRIORITY", "normal")
        self.high_priority_escalation_hours = int(os.getenv("HIGH_PRIORITY_ESCALATION_HOURS", "2"))


# Global settings instance
settings = AgentSettings()