# Secure MCP Server

A production-ready MCP (Model Context Protocol) server with security features including tool allowlist, parameter validation, audit logging, and prompt injection defense.

## Features

- ✅ **Tool Allowlist** - Only pre-approved tools can be executed
- ✅ **Parameter Validation** - All tool parameters are validated using Pydantic
- ✅ **Audit Logging** - Complete audit trail of all tool executions
- ✅ **Permission Boundary** - Configurable security boundaries
- ✅ **Prompt Injection Defense** - Protection against prompt injection attacks
- ✅ **Error Handling** - Graceful error handling and user-friendly messages

## Quick Start

### Prerequisites

- Python 3.11+
- Virtual environment (recommended)

### Installation

```bash
# Clone or navigate to this directory
cd labs/secure-mcp-server

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

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` to configure:

```bash
# Required: API key for authentication
API_KEY=your-secure-api-key-here

# Optional: Security settings
ALLOWED_TOOLS=calculator,weather,search
MAX_EXECUTION_TIME=30
LOG_LEVEL=INFO
AUDIT_LOG_PATH=logs/audit.log
```

### Running the Server

```bash
# Start the MCP server
python main.py

# Or with custom config
python main.py --config custom-config.yaml
```

The server will be available at `http://localhost:8000`

## Usage Examples

### Simple Calculator Tool

```python
from mcp_client import MCPClient

client = MCPClient("http://localhost:8000", api_key="your-api-key")

# Execute calculator tool
result = client.execute_tool("calculator", {
    "operation": "add",
    "a": 10,
    "b": 5
})

print(result)  # {"result": 15}
```

### Weather Tool with Validation

```python
# This will be validated and logged
result = client.execute_tool("weather", {
    "city": "San Francisco",
    "units": "celsius"
})
```

## Security Features

### Tool Allowlist

Only tools listed in `ALLOWED_TOOLS` can be executed. Any attempt to execute an unauthorized tool will be rejected.

### Parameter Validation

All tool parameters are validated using Pydantic models. Invalid parameters will be rejected with clear error messages.

### Audit Logging

All tool executions are logged with:
- Timestamp
- Tool name and parameters
- User/API key (hashed)
- Execution result
- Error details (if any)

### Prompt Injection Defense

Input validation includes:
- SQL injection detection
- Command injection detection
- Suspicious patterns detection
- Maximum input length limits

## API Reference

### POST /mcp/execute

Execute a tool with the specified parameters.

**Request:**
```json
{
  "tool": "calculator",
  "parameters": {
    "operation": "multiply",
    "a": 12,
    "b": 8
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": 96,
  "execution_id": "exec_1234567890",
  "timestamp": "2026-07-07T12:00:00Z"
}
```

### GET /mcp/tools

Get the list of available tools.

**Response:**
```json
{
  "tools": [
    {
      "name": "calculator",
      "description": "Perform basic arithmetic operations",
      "parameters": {
        "operation": {"type": "string", "enum": ["add", "subtract", "multiply", "divide"]},
        "a": {"type": "number"},
        "b": {"type": "number"}
      }
    }
  ]
}
```

### GET /mcp/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-07-07T12:00:00Z",
  "version": "1.0.0"
}
```

## Development

### Adding New Tools

1. Create a new tool class in `tools/` directory
2. Implement the tool logic with Pydantic validation
3. Add the tool to the allowlist in configuration
4. Register the tool in `main.py`

Example tool:

```python
from pydantic import BaseModel
from typing import Literal

class CalculatorParams(BaseModel):
    operation: Literal["add", "subtract", "multiply", "divide"]
    a: float
    b: float

class CalculatorTool:
    def execute(self, params: CalculatorParams) -> dict:
        if params.operation == "add":
            return {"result": params.a + params.b}
        # ... other operations
```

### Testing

Run the test suite:

```bash
# Run all tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=src --cov-report=html
```

## Security Considerations

### Production Deployment

- Use HTTPS in production
- Implement proper authentication (API key rotation)
- Monitor audit logs for suspicious activity
- Regular security updates
- Network segmentation

### Rate Limiting

Consider implementing rate limiting based on your use case:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/mcp/execute")
@limiter.limit("100/minute")
async def execute_tool(request: Request):
    pass
```

## Troubleshooting

### Common Issues

**Tool not allowed:**
```
ERROR: Tool 'unauthorized_tool' is not in the allowlist
```
Solution: Add the tool to `ALLOWED_TOOLS` in your configuration.

**Invalid parameters:**
```
ERROR: Validation failed for tool 'calculator': {'operation': ['value is not a valid enumeration member']}
```
Solution: Check the tool's parameter schema and provide valid values.

**Prompt injection detected:**
```
ERROR: Potential prompt injection detected in input
```
Solution: Review input validation rules and adjust if needed.

### Logs

Check the audit log for detailed execution history:

```bash
tail -f logs/audit.log
```

## License

MIT License - see LICENSE file for details.

## Contributing

Issues and pull requests are welcome! Please ensure all security features remain intact when contributing.
