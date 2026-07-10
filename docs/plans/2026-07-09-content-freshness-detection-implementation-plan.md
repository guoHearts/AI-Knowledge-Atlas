# Content Freshness Detection Implementation Plan

**Goal:** Implement §17.4 / content-standards content-freshness detection: a single validation script that scans every trust-bearing content surface (Radar items, Labs `metadata.yaml`, tech-comparison Markdown frontmatter), applies the state-flow rules, and reports/fails on stale or non-compliant content. This closes roadmap task #4 ("统一内容元数据与校验脚本") and advances batch E (CI/CD + 校验脚本).

**Scope decision (from user):** Direction = 内容过期检测 (content freshness detection), NOT the Compare feature.

## Source-of-truth rules (docs/content-standards.md, 改造方案 §17.2 & §17.4)

State-flow rules to encode:

```
90 天未验证        → 标记 Needs Review   (needs-review)
Lab CI 失败         → 移除 Verified       (ci-failed → cannot stay Verified)
```

Required-metadata checks (§17.2), per content item:
- has `status` in {Verified, Stale, Draft, Deprecated} (case-insensitive)
- has a valid `lastVerifiedAt` / `last_verified_at` date
- has at least one `sources` entry (Verified items must have an `official` source)
- Labs: `path` on disk exists

Freshness/severity model:
- `days_since_verified > 90` AND status == Verified → **needs-review** finding
- status == Verified but missing required evidence (no sources / no official source / no date) → **error**
- `ciStatus` in {failing, ci-failed, failed} but status == Verified → **error** (Verified must be removed)
- status missing or invalid → **error**
- Draft/Deprecated items are exempt from the 90-day needs-review rule but still get metadata validation

> **Note on "today":** the script accepts an injectable `today` (default `date.today()`) so tests are deterministic. Production/CI call uses real today. The 90-day threshold is a module constant `STALE_AFTER_DAYS = 90`.

## Global Constraints

- No new runtime dependencies. `pyyaml` (6.0.3) and stdlib only. The script lives in the backend package so it reuses the existing interpreter and `modules.radar.repository` as the radar data source.
- Do NOT mutate content files. This batch only **detects and reports**; it does not auto-rewrite `status`. (Auto-rewrite is a later batch.)
- Tests run from `backend/` (`cd backend && python -m pytest ...`) — imports are top-level (`common.*`, `modules.*`). The new checker module lives under `backend/` so the same import root applies.
- Follow TDD: write the failing test, run it, implement the minimum, rerun.
- Chinese Conventional Commit messages.
- Do not touch Compare / freshness auto-fix / frontend in this batch.

## Tech Stack

Python 3.12, stdlib + pyyaml, pytest 9.1.1 (run from `backend/`).

---

## File Structure

- `backend/content_check/__init__.py` (new): package marker.
- `backend/content_check/models.py` (new): `ContentItem`, `Finding`, `Severity` dataclasses; shared date-parsing helper.
- `backend/content_check/collectors.py` (new): pure functions that turn each source into `list[ContentItem]`:
  - `collect_radar_items()` — reads `modules.radar.repository.RADAR_ITEMS`.
  - `collect_lab_items(labs_dir)` — parses every `labs/*/metadata.yaml`.
  - `collect_compare_items(compare_dir)` — parses frontmatter of `docs/tech-comparisons/*.md` (excluding `README.md`? see below).
- `backend/content_check/checker.py` (new): `evaluate(items, today) -> list[Finding]` applying the rules; `STALE_AFTER_DAYS = 90`.
- `backend/content_check/cli.py` (new): `main(argv)` — collects all sources, evaluates, prints a human report, exits non-zero when any `error`-severity finding exists (needs-review alone does NOT fail CI by default; `--strict` makes needs-review also fail).
- `backend/tests/test_content_check.py` (new): unit tests for date parsing, each collector (with tmp fixtures), rule evaluation, and CLI exit codes.
- `scripts/check-content.ps1` (new): thin Windows wrapper (matches existing `scripts/common.ps1` / `Make.ps1` convention) that runs `python -m content_check.cli` from `backend/`.
- `Makefile` + `Make.ps1` (modify): add a `content-check` target.
- `docs/content-standards.md` (modify): add a short "自动过期检测" section documenting the script, rules, and exit-code semantics.
- `memory/roadmap-progress.md` + `memory/reform-progress.md` (modify): mark task #4 校验脚本 done, record batch E start + validation.

Design note — **README.md in tech-comparisons**: it carries frontmatter (`status: verified`, `lastVerifiedAt`) but is an index, not an article. The collector will still include it (it is trust-bearing and has a date), so the 90-day rule applies to it too. This is intentional: the index date going stale is a real signal.

---

### Task 1: Data model + date parsing (TDD)

**Files:** create `backend/content_check/__init__.py`, `backend/content_check/models.py`; create `backend/tests/test_content_check.py`.

**Interfaces:**
- `Severity = Literal["error", "needs-review", "ok"]` (use a str Enum or plain constants).
- `@dataclass ContentItem`: `id: str`, `kind: str` ("radar"|"lab"|"compare"), `status: str`, `last_verified: date | None`, `has_official_source: bool`, `source_count: int`, `ci_status: str | None`, `path_exists: bool | None`, `origin: str` (file path or repo id for reporting).
- `parse_content_date(raw: str | None) -> date | None`: accepts `"2026-07-09"` and `"2026-07-08T09:00:00Z"`; returns `None` for empty/unparseable.

- [ ] **Step 1: Failing test for `parse_content_date`**

Add to `backend/tests/test_content_check.py`:

```python
from datetime import date
from content_check.models import parse_content_date


def test_parse_content_date_handles_date_and_iso_datetime():
    assert parse_content_date("2026-07-09") == date(2026, 7, 9)
    assert parse_content_date("2026-07-08T09:00:00Z") == date(2026, 7, 8)
    assert parse_content_date("") is None
    assert parse_content_date(None) is None
    assert parse_content_date("not-a-date") is None
```

- [ ] **Step 2:** Run `cd backend && python -m pytest tests/test_content_check.py -q` → FAIL (module missing).

- [ ] **Step 3:** Implement `models.py` (`ContentItem`, severity constants, `parse_content_date` — try `date.fromisoformat` on the first 10 chars, fall back to `None`).

- [ ] **Step 4:** Rerun the single test → PASS.

- [ ] **Step 5: Commit** — `feat(content-check): 新增内容元数据模型与日期解析`

---

### Task 2: Rule evaluation (TDD)

**Files:** create `backend/content_check/checker.py`; extend `backend/tests/test_content_check.py`.

**Interfaces:**
- `STALE_AFTER_DAYS = 90`
- `@dataclass Finding`: `item_id: str`, `kind: str`, `severity: str`, `rule: str`, `message: str`, `origin: str`.
- `evaluate(items: list[ContentItem], today: date) -> list[Finding]`.

Rules (return one Finding per violated rule; an "ok" item yields no findings):
- `missing-status`: status not in the 4 valid values → error.
- `missing-verification-date`: Verified item with `last_verified is None` → error.
- `missing-official-source`: Verified item with `not has_official_source` → error.
- `ci-failed-but-verified`: Verified item with `ci_status in {"failing","failed","ci-failed"}` → error.
- `missing-lab-path`: lab item with `path_exists is False` → error.
- `stale-needs-review`: Verified item with `last_verified` and `(today - last_verified).days > 90` → needs-review.

- [ ] **Step 1: Failing tests** — build `ContentItem`s in-memory covering: a clean Verified item (no findings), a >90-day Verified item (needs-review), a Verified item missing official source (error), a Verified+ci_status=failing (error), an invalid-status item (error), a Draft 200-day-old item (NO stale finding — exempt). Assert `rule` and `severity` of each.

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3:** Implement `evaluate`.

- [ ] **Step 4:** Rerun → PASS. Also run full file: `python -m pytest tests/test_content_check.py -q`.

- [ ] **Step 5: Commit** — `feat(content-check): 实现内容过期与元数据校验规则`

---

### Task 3: Collectors (TDD)

**Files:** create `backend/content_check/collectors.py`; extend `backend/tests/test_content_check.py`.

**Interfaces:**
- `collect_radar_items() -> list[ContentItem]` — maps `RADAR_ITEMS`: `kind="radar"`, `status` from item, `last_verified=parse_content_date(item["last_verified_at"])`, `has_official_source = any(s["type"]=="official")`, `source_count=len(sources)`, `ci_status=None`, `path_exists=None`.
- `collect_lab_items(labs_dir: Path) -> list[ContentItem]` — glob `*/metadata.yaml`; `kind="lab"`; read `status`, `lastVerifiedAt`, `sources` (list of `{type,...}`), `ciStatus`; `path_exists = (repo_root / meta["path"]).is_dir()` when `path` present else derive from the metadata folder; `origin` = yaml path.
- `collect_compare_items(compare_dir: Path) -> list[ContentItem]` — glob `*.md`; extract the leading `---\n...\n---` frontmatter block, `yaml.safe_load` it; `kind="compare"`; map `status`/`lastVerifiedAt`/`sources`. Files without frontmatter are skipped (return nothing for them).

Frontmatter parsing helper: split on the first two `---` fences; if fewer than two, return `{}`.

- [ ] **Step 1: Failing tests**
  - `collect_radar_items` returns ≥5 items, all `kind="radar"`, secure-mcp radar item has `has_official_source is True`.
  - `collect_lab_items(tmp)` — write a tmp `metadata.yaml` fixture (Verified, official source, a `path` pointing at an existing tmp dir) → one item parsed with correct fields; a second fixture with a non-existent `path` → `path_exists is False`.
  - `collect_compare_items(tmp)` — write a tmp `.md` with frontmatter → parsed; write a `.md` without frontmatter → skipped.

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3:** Implement `collectors.py` (compute repo root as `Path(__file__).resolve().parents[2]`; the tmp-dir tests inject dirs directly so they don't depend on repo layout).

- [ ] **Step 4:** Rerun → PASS.

- [ ] **Step 5: Commit** — `feat(content-check): 采集 Radar/Labs/Compare 内容元数据`

---

### Task 4: CLI + exit codes (TDD)

**Files:** create `backend/content_check/cli.py`; extend `backend/tests/test_content_check.py`.

**Interfaces:**
- `run(today: date, strict: bool = False) -> tuple[list[Finding], int]` — collect all three sources (real repo), evaluate, compute exit code: `1` if any error-severity finding; if `strict`, also `1` when any needs-review finding; else `0`.
- `format_report(findings) -> str` — grouped, human-readable lines (`[ERROR] radar:<id> stale-needs-review — <message>`), plus a summary count line. Empty findings → an "all content passed" line.
- `main(argv=None) -> int` — parse `--strict` and optional `--today YYYY-MM-DD` (for CI reproducibility/testing), call `run`, print report, return exit code. `python -m content_check.cli`.

- [ ] **Step 1: Failing tests**
  - `run(today=date(2026,7,9))` on the real repo returns findings list + int; assert exit code is an int and that findings for known-stale items (e.g. compare article lastVerifiedAt 2026-07-07 is only 2 days old — NOT stale; instead assert no crash and that every finding has a known `rule`). Use a far-future `today` (e.g. `date(2027,1,1)`) to force stale findings and assert at least one `stale-needs-review` appears and exit code is 0 (needs-review non-strict) but 1 when `strict=True`.
  - `main(["--today","2027-01-01","--strict"])` returns 1; `main(["--today","2026-07-09"])` returns 0 **only if** the real repo currently has no error-severity findings — if it does, that is a real bug to fix in Task 5, so this assertion is written against `run(...)` error-count instead to avoid a brittle snapshot.

- [ ] **Step 2:** Run → FAIL.

- [ ] **Step 3:** Implement `cli.py`.

- [ ] **Step 4:** Rerun → PASS.

- [ ] **Step 5:** Run the checker for real: `cd backend && python -m content_check.cli`. Record output. If it surfaces genuine `error` findings in existing content (e.g. production-agent lab references radar ids that may not exist, or missing official source), note them — Task 5 decides fix vs. accept.

- [ ] **Step 6: Commit** — `feat(content-check): 提供内容校验命令行与退出码`

---

### Task 5: Wire-up, docs, real-content triage, full verification

**Files:** `scripts/check-content.ps1`, `Makefile`, `Make.ps1`, `docs/content-standards.md`, `memory/roadmap-progress.md`, `memory/reform-progress.md`.

- [ ] **Step 1:** Add `scripts/check-content.ps1` wrapper (`Push-Location backend; python -m content_check.cli @args; $code=$LASTEXITCODE; Pop-Location; exit $code`), matching existing script style.

- [ ] **Step 2:** Add `content-check` target to `Makefile` (`cd backend && python -m content_check.cli`) and the PowerShell equivalent in `Make.ps1`.

- [ ] **Step 3: Triage real findings from Task 4 Step 5.**
  - If the checker reports an `error` on existing Verified content (missing official source, ci-failed, broken lab path), FIX the underlying content metadata so the checker passes at real `today`. Any content fix is a small, in-place metadata edit (e.g. add an `official` source, correct a `path`), committed separately with a `fix(content):` message.
  - `needs-review` findings at real today are acceptable (informational) and do not block.

- [ ] **Step 4:** Document in `docs/content-standards.md`: new "自动过期检测" subsection — how to run (`make content-check` / `scripts/check-content.ps1`), the rules, exit-code meaning, and that it does not auto-rewrite content.

- [ ] **Step 5:** Update memory:
  - `roadmap-progress.md`: task #4 校验脚本 `🔧 → ✅` (or note "Radar+Labs+Compare 统一过期/元数据校验脚本已落地"); add batch-E-started note; update 下一优先 to remaining CI wiring (GitHub Actions) or Compare.
  - `reform-progress.md`: 批次E 状态从 "待做" 更新为进行中/部分完成，记录本轮交付。

- [ ] **Step 6: Full verification**
  - `cd backend && python -m pytest tests -q` → PASS (existing 23 + new content-check tests).
  - `cd backend && python -m content_check.cli` → exit 0 at real today (after Task 5 triage).
  - `git status --short` → only Task 1–5 files.
  - `git diff --check` → no whitespace errors.

- [ ] **Step 7: Commit** — `docs(content-check): 接入命令、文档与进度` (and any separate `fix(content):` commits from Step 3).

---

## Self-Review

- Rule coverage: 90-day needs-review, ci-failed-removes-Verified, and §17.2 required-metadata (status/date/sources/lab-path) are each unit-tested. Dependency-major-upgrade→Stale and API-deprecation→Deprecated (§17.4) require external version/API knowledge and are **explicitly out of scope** for this static checker — noted here so the omission is deliberate, not forgotten.
- Determinism: `today` is injectable; no `Date.now()`-style hidden clock in tests.
- Non-destructive: checker only reports; content edits in Task 5 Step 3 are manual, reviewed, separately committed.
- Import root: module under `backend/`, tests run from `backend/`, matching the existing radar/learning test convention.
- No new deps: stdlib + already-installed pyyaml.
