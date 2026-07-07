from pydantic import BaseModel, Field
from typing import List, Optional
import os


class SecurityConfig(BaseModel):
    """Security-related configuration."""
    allowed_tools: List[str] = ["calculator", "weather", "search"]
    max_execution_time: int = 30
    max_input_length: int = 1000
    enable_prompt_injection_defense: bool = True
    blocked_patterns: List[str] = [
        "rm -rf", "drop table", "delete from", ";", '"', "'"
    ]


class LoggingConfig(BaseModel):
    """Logging-related configuration."""
    log_level: str = "INFO"
    audit_log_path: str = "logs/audit.log"
    enable_audit_logging: bool = True


class RateLimitConfig(BaseModel):
    """Rate limiting configuration."""
    enabled: bool = False
    requests: int = 100
    window: int = 60


class MCPSettings:
    """Main settings for the MCP server."""
    
    def __init__(self):
        # API Configuration
        self.api_key = os.getenv("API_KEY", "your-secure-api-key-change-this-in-production")
        self.host = os.getenv("HOST", "0.0.0.0")
        self.port = int(os.getenv("PORT", "8001"))
        
        # CORS
        allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000")
        self.allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]
        
        # Security Configuration
        allowed_tools_str = os.getenv("ALLOWED_TOOLS", "calculator,weather,search")
        blocked_patterns_str = os.getenv("BLOCKED_PATTERNS", "rm -rf,drop table,delete from,;,\"\047")
        
        self.security = SecurityConfig(
            allowed_tools=[tool.strip() for tool in allowed_tools_str.split(",") if tool.strip()],
            max_execution_time=int(os.getenv("MAX_EXECUTION_TIME", "30")),
            max_input_length=int(os.getenv("MAX_INPUT_LENGTH", "1000")),
            enable_prompt_injection_defense=os.getenv("ENABLE_PROMPT_INJECTION_DEFENSE", "true").lower() == "true",
            blocked_patterns=[pattern.strip().strip('"\'') for pattern in blocked_patterns_str.split(",") if pattern.strip()]
        )
        
        # Logging Configuration
        self.logging = LoggingConfig(
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            audit_log_path=os.getenv("AUDIT_LOG_PATH", "logs/audit.log"),
            enable_audit_logging=os.getenv("ENABLE_AUDIT_LOGGING", "true").lower() == "true"
        )
        
        # Rate Limiting Configuration
        self.rate_limit = RateLimitConfig(
            enabled=os.getenv("ENABLE_RATE_LIMITING", "false").lower() == "true",
            requests=int(os.getenv("RATE_LIMIT_REQUESTS", "100")),
            window=int(os.getenv("RATE_LIMIT_WINDOW", "60"))
        )
        
        # Tool-specific
        self.calculator_enabled = os.getenv("CALCULATOR_ENABLED", "true").lower() == "true"
        self.weather_api_key = os.getenv("WEATHER_API_KEY")
        self.search_enabled = os.getenv("SEARCH_ENABLED", "true").lower() == "true"


# Global settings instance
settings = MCPSettings()