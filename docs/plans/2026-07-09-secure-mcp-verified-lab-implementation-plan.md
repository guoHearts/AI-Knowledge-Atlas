# Secure MCP Server Verified Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `labs/secure-mcp-server` into the first content-complete Verified Lab with visible verification evidence and Radar / Graph / Learn links.

**Architecture:** Keep Labs metadata owned by `backend/modules/learning/catalog.py` and keep Next.js Labs pages as route/rendering layers. Extend the existing `LabDefinition` contract rather than introducing a new content system.

**Tech Stack:** Python 3.12, FastAPI backend catalog, Next.js 16, React 19, TypeScript strict, node:test, pytest.

## Global Constraints

- Do not extend MCP Server runtime behavior in this batch.
- Do not add new runtime dependencies.
- Do not move Labs data out of the backend learning catalog.
- Secure MCP Server can be marked `Verified` only when it exposes last verification date, official sources, dependency versions, expected outputs, failure modes, security notes, known limitations, and related Radar / Graph / Learn paths.
- Draft Labs may omit the full Verified evidence fields, but the frontend type must support them.
- Use Chinese Conventional Commit messages for commits.
- Follow TDD: write the failing test, run it, implement the minimum code, then rerun tests.

---

## File Structure

- `backend/tests/test_learning_service.py`: adds backend contract tests for Verified Lab evidence.
- `backend/modules/learning/catalog.py`: extends Secure MCP Server metadata and marks it Verified.
- `frontend/src/features/labs/utils/labs.ts`: extends the Lab TypeScript contract.
- `frontend/src/test/features/labs/utils/labs.test.mts`: verifies frontend API preserves extended metadata.
- `frontend/src/app/labs/[id]/page.tsx`: renders verification evidence, sources, failure modes, security notes, known limitations, and related links.
- `labs/secure-mcp-server/metadata.yaml`: aligns lab source metadata with Verified status.
- `labs/secure-mcp-server/README.md`: replaces the current README with a clean, verification-focused version.
- `memory/roadmap-progress.md`: marks the first Verified Lab task complete and records validation.
- `memory/reform-progress.md`: updates the reform progress summary if its next-step section still says the Lab is pending.

---

### Task 1: Backend Verified Lab Contract

**Files:**
- Modify: `backend/tests/test_learning_service.py`
- Modify: `backend/modules/learning/catalog.py`

**Interfaces:**
- Consumes: `LearningService.list_labs() -> list[dict[str, Any]]`
- Consumes: `LearningService.get_lab(lab_id: str) -> dict[str, Any]`
- Produces: Lab dictionaries with optional evidence fields:
  - `lastVerifiedAt: str`
  - `packages: list[dict[str, str]]`
  - `sources: list[dict[str, str]]`
  - `expectedOutputs: list[str]`
  - `failureModes: list[dict[str, str]]`
  - `securityNotes: list[str]`
  - `knownLimitations: list[str]`
  - `relatedRadarItemIds: list[str]`
  - `relatedNodeIds: list[str]`
  - `relatedLearningPaths: list[dict[str, str]]`

- [ ] **Step 1: Write the failing backend test**

Add this test to `backend/tests/test_learning_service.py` after `test_learning_service_delegates_read_models`:

```python
def test_verified_secure_mcp_lab_exposes_trust_evidence():
    service = LearningService(FakeLearningRepository())

    lab = service.get_lab("secure-mcp-server")

    assert lab["status"] == "Verified"
    assert lab["lastVerifiedAt"] == "2026-07-09"
    assert lab["packages"] == [
        {"name": "fastapi", "version": "0.104.1"},
        {"name": "uvicorn", "version": "0.24.0"},
        {"name": "pydantic", "version": "2.5.0"},
        {"name": "pytest", "version": "7.4.3"},
        {"name": "httpx", "version": "0.25.2"},
    ]
    assert any(source["type"] == "official" for source in lab["sources"])
    assert any("pytest" in output for output in lab["expectedOutputs"])
    assert any(mode["title"] == "Missing API key" for mode in lab["failureModes"])
    assert any("allowlist" in note.lower() for note in lab["securityNotes"])
    assert any("rate limiting" in limitation.lower() for limitation in lab["knownLimitations"])
    assert lab["relatedRadarItemIds"] == ["mcp-security-boundary-2026-07"]
    assert "MCP" in lab["relatedNodeIds"]
    assert lab["relatedLearningPaths"][0]["href"].startswith("/learn/")
```

- [ ] **Step 2: Run the backend test and verify it fails**

Run: `python -m pytest backend/tests/test_learning_service.py::test_verified_secure_mcp_lab_exposes_trust_evidence -q`

Expected: FAIL with `AssertionError` or `KeyError` because the Lab is still `Draft` and evidence fields are missing.

- [ ] **Step 3: Implement minimal backend metadata**

In `backend/modules/learning/catalog.py`, replace the `secure-mcp-server` Lab dictionary with:

```python
    {
        "id": "secure-mcp-server",
        "title": "Secure MCP Server",
        "status": "Verified",
        "difficulty": "Intermediate",
        "estimatedSetupTime": "15min",
        "estimatedCost": "< $1",
        "requiresApiKey": True,
        "path": "labs/secure-mcp-server",
        "lastVerifiedAt": "2026-07-09",
        "packages": [
            {"name": "fastapi", "version": "0.104.1"},
            {"name": "uvicorn", "version": "0.24.0"},
            {"name": "pydantic", "version": "2.5.0"},
            {"name": "pytest", "version": "7.4.3"},
            {"name": "httpx", "version": "0.25.2"},
        ],
        "commands": [
            "cd labs/secure-mcp-server",
            "python -m venv .venv",
            "pip install -r requirements.txt",
            "python -m pytest tests -q",
            "python main.py",
        ],
        "expectedOutputs": [
            "pytest reports all Secure MCP Server tests passing.",
            "GET /mcp/health returns status=healthy when the server is running.",
            "Unauthorized tools are rejected before execution.",
            "Invalid parameters return validation errors instead of reaching tool logic.",
        ],
        "sources": [
            {
                "type": "official",
                "title": "Model Context Protocol specification",
                "url": "https://modelcontextprotocol.io/specification",
            },
            {
                "type": "official",
                "title": "FastAPI documentation",
                "url": "https://fastapi.tiangolo.com/",
            },
            {
                "type": "official",
                "title": "Pydantic documentation",
                "url": "https://docs.pydantic.dev/",
            },
        ],
        "failureModes": [
            {
                "title": "Missing API key",
                "resolution": "Copy .env.example to .env and set API_KEY before starting the server.",
            },
            {
                "title": "Port 8000 already in use",
                "resolution": "Stop the existing process or change the local port before running python main.py.",
            },
            {
                "title": "Tool rejected by allowlist",
                "resolution": "Confirm ALLOWED_TOOLS contains only the intended tool names.",
            },
        ],
        "securityNotes": [
            "The tool allowlist blocks unknown tool names before parameter handling.",
            "Pydantic validation rejects invalid tool parameters before execution.",
            "Audit logs record tool calls for review, but they are not a substitute for centralized production logging.",
            "Prompt injection checks are a defense layer, not a complete security boundary.",
        ],
        "knownLimitations": [
            "The lab uses a simple API key for local verification and does not include production identity management.",
            "Rate limiting is documented but not implemented in the runnable sample.",
            "The audit log is local file output and is not wired to a SIEM or tracing platform.",
        ],
        "relatedRadarItemIds": ["mcp-security-boundary-2026-07"],
        "relatedNodeIds": ["MCP", "Tool Allowlist", "Prompt Injection"],
        "relatedLearningPaths": [
            {
                "title": "MCP protocol principles",
                "href": "/learn/agent-engineer/module-03-mcp/01-mcp-protocol-principles",
            },
            {
                "title": "Build MCP Server",
                "href": "/learn/agent-engineer/module-03-mcp/02-build-mcp-server",
            },
        ],
        "summary": "Verified MCP Server baseline lab with tool allowlist, parameter validation, audit logs, and documented security boundaries.",
    },
```

- [ ] **Step 4: Run the backend test and verify it passes**

Run: `python -m pytest backend/tests/test_learning_service.py::test_verified_secure_mcp_lab_exposes_trust_evidence -q`

Expected: PASS.

- [ ] **Step 5: Run the full learning service tests**

Run: `python -m pytest backend/tests/test_learning_service.py -q`

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add backend/tests/test_learning_service.py backend/modules/learning/catalog.py
git commit -m "feat(labs): 补齐 Secure MCP Lab 后端验证元数据"
```

---

### Task 2: Frontend Lab Contract and Detail Rendering

**Files:**
- Modify: `frontend/src/features/labs/utils/labs.ts`
- Modify: `frontend/src/test/features/labs/utils/labs.test.mts`
- Modify: `frontend/src/app/labs/[id]/page.tsx`

**Interfaces:**
- Consumes: Backend Lab evidence fields from Task 1.
- Produces: `LabDefinition` with optional evidence fields and a Labs detail page that renders them when present.

- [ ] **Step 1: Write the failing frontend API test**

In `frontend/src/test/features/labs/utils/labs.test.mts`, update the first `labs` fixture item so it includes:

```typescript
    lastVerifiedAt: '2026-07-09',
    packages: [{ name: 'fastapi', version: '0.104.1' }],
    expectedOutputs: ['pytest reports all Secure MCP Server tests passing.'],
    sources: [
      {
        type: 'official',
        title: 'Model Context Protocol specification',
        url: 'https://modelcontextprotocol.io/specification',
      },
    ],
    failureModes: [{ title: 'Missing API key', resolution: 'Set API_KEY in .env.' }],
    securityNotes: ['The tool allowlist blocks unknown tool names before parameter handling.'],
    knownLimitations: ['Rate limiting is documented but not implemented in the runnable sample.'],
    relatedRadarItemIds: ['mcp-security-boundary-2026-07'],
    relatedNodeIds: ['MCP'],
    relatedLearningPaths: [{ title: 'MCP protocol principles', href: '/learn/agent-engineer/module-03-mcp/01-mcp-protocol-principles' }],
```

Then add these assertions to `test('listLabs exposes list page metadata', ...)`:

```typescript
    assert.equal(result[0].status, 'Verified');
    assert.equal(result[0].lastVerifiedAt, '2026-07-09');
    assert.equal(result[0].sources?.[0].type, 'official');
    assert.equal(result[0].expectedOutputs?.[0].includes('pytest'), true);
    assert.equal(result[0].relatedRadarItemIds?.[0], 'mcp-security-boundary-2026-07');
```

- [ ] **Step 2: Run the frontend test and verify it fails**

Run: `pnpm --dir frontend test -- src/test/features/labs/utils/labs.test.mts`

Expected: FAIL from TypeScript compilation because `LabDefinition` does not include the new fields.

- [ ] **Step 3: Extend the TypeScript Lab contract**

Replace `frontend/src/features/labs/utils/labs.ts` with:

```typescript
export type LabStatus = 'Draft' | 'Verified';
export type LabDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LabPackage {
  name: string;
  version: string;
}

export interface LabSource {
  type: 'official' | 'paper' | 'community' | string;
  title: string;
  url: string;
}

export interface LabFailureMode {
  title: string;
  resolution: string;
}

export interface LabRelatedPath {
  title: string;
  href: string;
}

export interface LabDefinition {
  id: string;
  title: string;
  status: LabStatus;
  difficulty: LabDifficulty;
  estimatedSetupTime: string;
  estimatedCost: string;
  requiresApiKey: boolean;
  path: string;
  commands: string[];
  summary: string;
  lastVerifiedAt?: string;
  packages?: LabPackage[];
  sources?: LabSource[];
  expectedOutputs?: string[];
  failureModes?: LabFailureMode[];
  securityNotes?: string[];
  knownLimitations?: string[];
  relatedRadarItemIds?: string[];
  relatedNodeIds?: string[];
  relatedLearningPaths?: LabRelatedPath[];
}
```

- [ ] **Step 4: Update Labs detail page rendering**

In `frontend/src/app/labs/[id]/page.tsx`, keep the existing route logic and replace the card body after `<p className="mt-4 leading-7 text-cosmos-dim">{lab.summary}</p>` with sections that render optional fields only when present:

```tsx
        <dl className="mt-8 grid gap-4 text-sm md:grid-cols-4">
          <div>
            <dt className="text-cosmos-dim">{t('repositoryPath')}</dt>
            <dd className="mt-1 font-mono text-cosmos-text">{lab.path}</dd>
          </div>
          <div>
            <dt className="text-cosmos-dim">{t('estimatedCost')}</dt>
            <dd className="mt-1 text-cosmos-text">{lab.estimatedCost}</dd>
          </div>
          <div>
            <dt className="text-cosmos-dim">{t('apiKey')}</dt>
            <dd className="mt-1 text-cosmos-text">
              {lab.requiresApiKey ? t('apiKeyRequired') : t('apiKeyNotRequired')}
            </dd>
          </div>
          {lab.lastVerifiedAt && (
            <div>
              <dt className="text-cosmos-dim">Last verified</dt>
              <dd className="mt-1 text-cosmos-text">{lab.lastVerifiedAt}</dd>
            </div>
          )}
        </dl>
```

Add the optional sections below the existing local verification command block:

```tsx
        {lab.expectedOutputs?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Expected outputs</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-cosmos-dim">
              {lab.expectedOutputs.map((output) => (
                <li key={output}>- {output}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {lab.packages?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Pinned packages</h2>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              {lab.packages.map((pkg) => (
                <div key={pkg.name} className="rounded border border-cosmos-border px-3 py-2 font-mono text-cosmos-text">
                  {pkg.name}@{pkg.version}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {lab.sources?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Official sources</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {lab.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} className="text-stellar-green hover:text-stellar-green/80">
                    {source.title}
                  </a>
                  <span className="ml-2 text-cosmos-dim">({source.type})</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
```

Add these optional sections after the sources section:

```tsx
        {lab.failureModes?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Common failure modes</h2>
            <div className="mt-3 space-y-3">
              {lab.failureModes.map((mode) => (
                <div key={mode.title} className="rounded border border-cosmos-border p-3">
                  <p className="font-medium text-cosmos-text">{mode.title}</p>
                  <p className="mt-1 text-sm leading-6 text-cosmos-dim">{mode.resolution}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {lab.securityNotes?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Security notes</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-cosmos-dim">
              {lab.securityNotes.map((note) => (
                <li key={note}>- {note}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {lab.knownLimitations?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Known limitations</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-cosmos-dim">
              {lab.knownLimitations.map((limitation) => (
                <li key={limitation}>- {limitation}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {(lab.relatedRadarItemIds?.length || lab.relatedNodeIds?.length || lab.relatedLearningPaths?.length) ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-cosmos-text">Related paths</h2>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
              {lab.relatedRadarItemIds?.map((radarId) => (
                <Link
                  key={radarId}
                  href={`/radar/${radarId}`}
                  className="rounded border border-cosmos-border px-3 py-2 text-stellar-green hover:text-stellar-green/80"
                >
                  Radar: {radarId}
                </Link>
              ))}
              {lab.relatedNodeIds?.map((nodeId) => (
                <Link
                  key={nodeId}
                  href={`/graph?node=${encodeURIComponent(nodeId)}`}
                  className="rounded border border-cosmos-border px-3 py-2 text-stellar-green hover:text-stellar-green/80"
                >
                  Graph: {nodeId}
                </Link>
              ))}
              {lab.relatedLearningPaths?.map((path) => (
                <Link
                  key={path.href}
                  href={path.href}
                  className="rounded border border-cosmos-border px-3 py-2 text-stellar-green hover:text-stellar-green/80"
                >
                  Learn: {path.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
```

- [ ] **Step 5: Run the frontend test and typecheck**

Run: `pnpm --dir frontend test -- src/test/features/labs/utils/labs.test.mts`

Expected: PASS.

Run: `pnpm --dir frontend typecheck`

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add frontend/src/features/labs/utils/labs.ts frontend/src/test/features/labs/utils/labs.test.mts frontend/src/app/labs/[id]/page.tsx
git commit -m "feat(labs): 展示 Verified Lab 验证证据"
```

---

### Task 3: Lab Source Documents

**Files:**
- Modify: `labs/secure-mcp-server/metadata.yaml`
- Modify: `labs/secure-mcp-server/README.md`

**Interfaces:**
- Consumes: Verified Lab evidence model from Task 1.
- Produces: Source lab documentation aligned with backend metadata.

- [ ] **Step 1: Update metadata.yaml**

Replace the top metadata fields in `labs/secure-mcp-server/metadata.yaml` with:

```yaml
id: secure-mcp-server
title: Secure MCP Server
status: verified
difficulty: intermediate
createdAt: 2026-07-07
updatedAt: 2026-07-09
lastVerifiedAt: 2026-07-09

estimatedSetupTime: 15min
estimatedCost: "< $1"
requiresApiKey: true
ciStatus: local-passing
```

Replace the `commands` block with:

```yaml
commands:
  install: pip install -r requirements.txt
  test: python -m pytest tests -q
  run: python main.py
```

Add these blocks after `sources`:

```yaml
expectedOutputs:
  - pytest reports all Secure MCP Server tests passing.
  - GET /mcp/health returns status=healthy when the server is running.
  - Unauthorized tools are rejected before execution.
  - Invalid parameters return validation errors instead of reaching tool logic.

knownLimitations:
  - The lab uses a simple API key for local verification and does not include production identity management.
  - Rate limiting is documented but not implemented in the runnable sample.
  - The audit log is local file output and is not wired to a SIEM or tracing platform.

relatedRadarItems:
  - mcp-security-boundary-2026-07

relatedGraphNodes:
  - MCP
  - Tool Allowlist
  - Prompt Injection

relatedLearningPaths:
  - /learn/agent-engineer/module-03-mcp/01-mcp-protocol-principles
  - /learn/agent-engineer/module-03-mcp/02-build-mcp-server
```

- [ ] **Step 2: Replace README with clean Verified Lab documentation**

Replace `labs/secure-mcp-server/README.md` with a concise README containing these exact sections:

```markdown
# Secure MCP Server

Status: Verified  
Last verified: 2026-07-09  
Estimated setup time: 15min  
Estimated cost: < $1

## Goal

This lab demonstrates a local MCP-style tool server with explicit security boundaries: tool allowlist, Pydantic parameter validation, audit logging, and basic malicious-input checks.

## Verified Environment

- Python 3.12+
- fastapi 0.104.1
- uvicorn 0.24.0
- pydantic 2.5.0
- pytest 7.4.3
- httpx 0.25.2

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

## Official Sources

- [Model Context Protocol specification](https://modelcontextprotocol.io/specification)
- [FastAPI documentation](https://fastapi.tiangolo.com/)
- [Pydantic documentation](https://docs.pydantic.dev/)
```

- [ ] **Step 3: Check README and metadata for stale Draft wording**

Run: `rg -n "Draft|draft|鉁|�|production-ready" labs/secure-mcp-server/README.md labs/secure-mcp-server/metadata.yaml`

Expected: no output for `Draft`, mojibake, or broad `production-ready` wording. `status: verified` in metadata is acceptable.

- [ ] **Step 4: Commit Task 3**

```bash
git add labs/secure-mcp-server/metadata.yaml labs/secure-mcp-server/README.md
git commit -m "docs(labs): 完善 Secure MCP Lab 验证文档"
```

---

### Task 4: Progress Docs and Full Verification

**Files:**
- Modify: `memory/roadmap-progress.md`
- Modify: `memory/reform-progress.md`

**Interfaces:**
- Consumes: completed Tasks 1-3.
- Produces: project progress docs that no longer identify Secure MCP Server as pending.

- [ ] **Step 1: Update roadmap progress**

In `memory/roadmap-progress.md`:

- Change task 5 status from `🔧` to `✅`.
- Change the next priority from `批次C 第一个高质量 Verified Lab（Secure MCP Server）` to `技术选型（Compare）栏目或内容过期检测`.
- Add a completed note under the latest verification section:

```markdown
- Secure MCP Server 已完成首个 Verified Lab 内容闭环：后端元数据、详情页验证证据、README、metadata.yaml、Radar/Graph/Learn 关联。
```

- [ ] **Step 2: Update reform progress**

In `memory/reform-progress.md`, replace the pending next-step line:

```markdown
1. **批次C**：第一个标杆 Lab（Secure MCP Server，可运行命令 + 测试 + 预期输出 + Radar/Graph/Learn 关联）
```

with:

```markdown
1. **批次C**：第一个标杆 Lab（Secure MCP Server）已完成内容闭环，下一步进入 Compare 栏目或内容过期检测。
```

- [ ] **Step 3: Run backend tests**

Run: `python -m pytest backend/tests -q`

Expected: PASS.

- [ ] **Step 4: Run lab tests**

Run: `python -m pytest labs/secure-mcp-server/tests -q`

Expected: PASS.

- [ ] **Step 5: Run frontend tests**

Run: `pnpm --dir frontend test`

Expected: PASS.

- [ ] **Step 6: Run frontend typecheck**

Run: `pnpm --dir frontend typecheck`

Expected: PASS.

- [ ] **Step 7: Check final diff**

Run: `git status --short`

Expected: only files from Tasks 1-4 are modified.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 8: Commit Task 4**

```bash
git add memory/roadmap-progress.md memory/reform-progress.md
git commit -m "docs(memory): 更新 Secure MCP Lab 进度"
```

---

## Self-Review

- Spec coverage: Task 1 covers backend metadata and Verified evidence. Task 2 covers frontend types and detail rendering. Task 3 covers lab metadata and README. Task 4 covers progress docs and verification.
- Placeholder scan: no red-flag placeholder text or empty implementation steps are intentionally present.
- Type consistency: backend camelCase field names match frontend `LabDefinition`; Draft Labs can omit optional evidence fields.
