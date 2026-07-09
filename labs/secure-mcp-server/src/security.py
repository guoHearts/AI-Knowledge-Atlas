import re
import logging
from typing import List, Optional
from datetime import datetime
from .config import settings


class SecurityManager:
    """Handles all security-related functionality."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def is_tool_allowed(self, tool_name: str) -> bool:
        """Check if a tool is in the allowlist."""
        return tool_name in settings.security.allowed_tools
    
    def validate_input_length(self, input_data: str) -> bool:
        """Check if input length is within limits."""
        return len(input_data) <= settings.security.max_input_length
    
    def detect_prompt_injection(self, input_data: str) -> Optional[str]:
        """Detect obvious malicious input patterns."""
        input_lower = input_data.lower()

        sql_patterns = ["drop table"]
        for pattern in sql_patterns:
            if pattern in input_lower:
                return f"Potential SQL injection detected: {pattern.upper()}"

        command_patterns = ["rm -rf", "sudo rm", "sudo"]
        for pattern in command_patterns:
            if pattern in input_lower:
                return f"Potential command injection detected: {pattern}"

        prompt_patterns = ["delete from"]
        for pattern in prompt_patterns:
            if pattern in input_lower:
                return f"Potential prompt injection detected: {pattern}"
        
        return None
    
    def sanitize_parameters(self, parameters: dict) -> dict:
        """Sanitize tool parameters."""
        sanitized = {}
        
        for key, value in parameters.items():
            if isinstance(value, str):
                # Check input length
                if not self.validate_input_length(value):
                    raise ValueError(f"Parameter '{key}' exceeds maximum length")
                
                # Check for prompt injection
                injection_result = self.detect_prompt_injection(value)
                if injection_result:
                    raise ValueError(f"Security violation in parameter '{key}': {injection_result}")
                
                sanitized[key] = value.strip()
            else:
                sanitized[key] = value
        
        return sanitized


class AuditLogger:
    """Handles audit logging for all tool executions."""
    
    def __init__(self):
        try:
            import structlog
        except ModuleNotFoundError:
            self.logger = logging.getLogger("secure_mcp.audit")
            self.structured_logging = False
        else:
            self.logger = structlog.get_logger()
            self.structured_logging = True
        
        # Ensure log directory exists
        import os
        log_dir = os.path.dirname(settings.logging.audit_log_path)
        if log_dir:
            os.makedirs(log_dir, exist_ok=True)
    
    def log_execution(
        self,
        tool_name: str,
        parameters: dict,
        execution_id: str,
        user_id: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        execution_time: float = 0.0
    ):
        """Log a tool execution."""
        if not settings.logging.enable_audit_logging:
            return
        
        # Hash the API key for privacy
        hashed_user = "anonymous"
        if user_id:
            import hashlib
            hashed_user = hashlib.sha256(user_id.encode()).hexdigest()[:8]
        
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "tool": tool_name,
            "execution_id": execution_id,
            "user_hash": hashed_user,
            "parameters": parameters,
            "success": success,
            "execution_time": execution_time,
            "event_type": "tool_execution"
        }
        
        if error_message:
            log_data["error_message"] = error_message
        
        if self.structured_logging:
            self.logger.info(
                "Tool execution",
                **log_data
            )
        else:
            self.logger.info("Tool execution %s", log_data)
