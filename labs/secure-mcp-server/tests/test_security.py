import pytest
from src.security import SecurityManager
from src.config import MCPSettings


def test_tool_allowlist():
    """Test tool allowlist functionality."""
    security = SecurityManager()
    
    # Test allowed tools
    assert security.is_tool_allowed("calculator") is True
    assert security.is_tool_allowed("weather") is True
    assert security.is_tool_allowed("search") is True
    
    # Test disallowed tools
    assert security.is_tool_allowed("malicious_tool") is False
    assert security.is_tool_allowed("system") is False


def test_input_length_validation():
    """Test input length validation."""
    security = SecurityManager()
    
    # Valid input
    valid_input = "a" * 100
    assert security.validate_input_length(valid_input) is True
    
    # Invalid input (too long)
    long_input = "a" * 2000  # Exceeds default max of 1000
    assert security.validate_input_length(long_input) is False


def test_prompt_injection_detection():
    """Test prompt injection detection."""
    security = SecurityManager()
    
    # Clean input
    clean_input = "What is the weather in San Francisco?"
    assert security.detect_prompt_injection(clean_input) is None
    
    # SQL injection patterns
    sql_injection = "SELECT * FROM users; DROP TABLE users;"
    result = security.detect_prompt_injection(sql_injection)
    assert "SQL injection" in result
    
    # Command injection patterns
    cmd_injection = "rm -rf /"
    result = security.detect_prompt_injection(cmd_injection)
    assert "command injection" in result
    
    # Blocked patterns
    blocked = "delete from table"
    result = security.detect_prompt_injection(blocked)
    assert "prompt injection" in result


def test_parameter_sanitization():
    """Test parameter sanitization."""
    security = SecurityManager()
    
    # Valid parameters
    valid_params = {
        "operation": " add ",
        "a": 10,
        "b": 5
    }
    
    sanitized = security.sanitize_parameters(valid_params)
    assert sanitized["operation"] == "add"  # Stripped whitespace
    assert sanitized["a"] == 10
    assert sanitized["b"] == 5
    
    # Invalid parameters (security violation)
    malicious_params = {
        "operation": "add; rm -rf /",
        "a": 10,
        "b": 5
    }
    
    with pytest.raises(ValueError, match="Security violation"):
        security.sanitize_parameters(malicious_params)
    
    # Invalid parameters (too long)
    long_params = {
        "operation": "add",
        "a": "a" * 2000,  # Exceeds max length
        "b": 5
    }
    
    with pytest.raises(ValueError, match="exceeds maximum length"):
        security.sanitize_parameters(long_params)


def test_audit_logging():
    """Test audit logging functionality."""
    from src.security import AuditLogger
    
    audit_logger = AuditLogger()
    
    # Test successful execution log
    audit_logger.log_execution(
        tool_name="calculator",
        parameters={"operation": "add", "a": 10, "b": 5},
        execution_id="test-123",
        user_id="test-user",
        success=True,
        execution_time=0.1
    )
    
    # Test failed execution log
    audit_logger.log_execution(
        tool_name="calculator",
        parameters={"operation": "divide", "a": 10, "b": 0},
        execution_id="test-456",
        user_id="test-user",
        success=False,
        error_message="Division by zero",
        execution_time=0.05
    )


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])