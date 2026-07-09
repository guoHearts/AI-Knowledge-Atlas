# Secure MCP Server

Status: Verified  
Last verified: 2026-07-09  
Estimated setup time: 15min  
Estimated cost: < $1

## Goal

This lab demonstrates a local MCP-style tool server with explicit security boundaries: tool allowlist, Pydantic parameter validation, audit logging, and basic malicious-input checks.

## Verified Environment

- Python 3.12+
- fastapi 0.115.0
- uvicorn 0.30.0
- pydantic 2.9.0
- pydantic-settings 2.5.0
- python-dotenv 1.2.2
- structlog 24.1.0
- slowapi 0.1.9
- pyyaml 6.0.1
- requests 2.31.0

## Run Locally

```bash
cd labs/secure-mcp-server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m pytest tests -q
python main.py
```

On macOS or Linux, use `source .venv/bin/activate` instead of `.venv\Scripts\activate`.

## Environment

```bash
copy .env.example .env
```

Set `API_KEY` before starting the server. Keep `ALLOWED_TOOLS` narrow; the verified default is `calculator,weather,search`.

## Expected Outputs

- `python -m pytest tests -q` reports all tests passing.
- `GET /mcp/health` returns `status=healthy` while the server is running.
- Unknown tools are rejected before execution.
- Invalid calculator, weather, or search parameters return validation errors.

## Common Failure Modes

| Failure | Fix |
|---|---|
| Missing API key | Copy `.env.example` to `.env` and set `API_KEY`. |
| Port 8000 already in use | Stop the existing process or change the local port. |
| Tool rejected by allowlist | Check `ALLOWED_TOOLS` and keep only intended tools. |

## Security Notes

- The allowlist rejects unknown tool names before parameter handling.
- Pydantic validation rejects malformed tool parameters before execution.
- Audit logs create a local review trail, but they are not centralized production logging.
- Prompt injection checks are a defense layer, not a complete security boundary.

## Known Limitations

- This lab uses a simple API key and does not include production identity management.
- Rate limiting is documented but not implemented in the runnable sample.
- Audit logs are local files and are not connected to SIEM or tracing.

## Related Paths

- Radar: `mcp-security-boundary-2026-07`
- Graph: `MCP`, `Tool Allowlist`, `Prompt Injection`
- Learn: `/learn/agent-engineer/module-03-mcp/01-mcp-protocol-principles`
- Learn: `/learn/agent-engineer/module-03-mcp/02-build-mcp-server`

## Official Sources

- [Model Context Protocol specification](https://modelcontextprotocol.io/specification)
- [FastAPI documentation](https://fastapi.tiangolo.com/)
- [Pydantic documentation](https://docs.pydantic.dev/)
