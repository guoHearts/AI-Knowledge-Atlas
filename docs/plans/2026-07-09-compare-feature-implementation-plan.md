# Compare 栏目 + 首篇选型文章 Implementation Plan

**Goal:** Build the Compare (技术选型) section as a first-class product feature — backend module + frontend feature + routes — and publish the first article **"MCP vs Function Calling vs REST tools"**, cross-linked to the Secure MCP Lab, the MCP Radar item, and graph nodes. Closes §19 task #7 and advances task #9 (module cross-links). Also fixes the dead `/docs/tech-comparisons` link on the Radar page.

**Scope decision (from user):** Direction = Compare 栏目 + 首篇文章. First topic = MCP vs Function Calling vs REST tools.

## Architecture decision

The app renders **structured data through React components** (the radar/labs pattern), not raw markdown — the mdx deps in package.json are unused for radar/labs, and strategy doc §6.2's required Compare fields (核心设计差异 / 功能矩阵 / 适用+不适用场景 / 成本 / 决策树 / 对应实验) map cleanly onto a typed structure. So Compare mirrors the **radar module** exactly:

- Backend: `backend/modules/compare/` with `schemas.py` / `repository.py` / `service.py` / `router.py`, registered in `main.py`. Data lives behind the repository boundary (seed dict now, DB later) — same as radar.
- Frontend: `frontend/src/features/compare/` (`api/` `components/` `hooks/` `types/` `index.ts`) + `frontend/src/app/compare/` (`page.tsx`, `[id]/page.tsx`, `[id]/loading.tsx`, `[id]/not-found.tsx`) + `frontend/src/app/api/compare/` proxy routes.

The existing `docs/tech-comparisons/*.md` stays as-is (author-facing source docs); the product Compare content is the structured backend seed. The content-check tool already covers the `.md` frontmatter; this batch does not change that.

## §6.2 → data model mapping

A `CompareArticle` carries:
- `id`, `title`, `status`, `summary` (一句话结论), `category`
- `contenders: list[CompareContender]` — `{name, vendor, latest_version, one_liner}`
- `dimensions: list[CompareDimension]` — `{name, values: {contender_name: cell}}` (功能/工程能力矩阵)
- `use_when: list[CompareScenario]` — `{contender, scenario}` (典型适用)
- `avoid_when: list[CompareScenario]` (不适用)
- `decision_tree: list[CompareDecision]` — `{condition, recommendation}` (决策树)
- `cost_notes: list[str]` (学习/迁移/部署成本)
- `sources: list[CompareSource]` — `{type, title, url}` (official required for Verified)
- `related_lab_ids`, `related_radar_item_ids`, `related_node_ids`, `related_learning_paths`
- `published_at`, `created_at`, `updated_at`, `last_verified_at`

Trust validation (mirrors `RadarService._validate_item`): a Verified article must have a valid status, `last_verified_at`, at least one `sources` entry with an `official` type, and at least one related downstream path.

## Global Constraints

- No new runtime dependencies (backend stdlib+pydantic; frontend existing stack).
- Mirror radar conventions exactly (unified `success_response`/`error_response`, `AppError`, feature dir layout, proxy pattern).
- Backend tests run from `backend/` (`cd backend && python -m pytest ...`).
- Frontend tests: node:test `.mts` under `src/test/`, run with `pnpm --dir frontend test`.
- TDD: failing test → minimal impl → green. Chinese Conventional Commits.
- First article status = **Verified** and must pass the trust validation and `content_check` (its `.md` companion is optional; the product data is the source of truth here).
- Do NOT touch learn/graph internals beyond adding a related-node link target. Do NOT change radar behavior.

## Tech Stack

Python 3.12, FastAPI, pydantic 2, pytest (from `backend/`). Next.js 16, React 19, TypeScript strict, next-intl, node:test.

---

## File Structure

Backend (new): `backend/modules/compare/__init__.py`, `schemas.py`, `repository.py`, `service.py`, `router.py`; `backend/tests/test_compare_service.py`. Modify: `backend/main.py` (register router).

Frontend (new): `frontend/src/features/compare/{index.ts,types/compare.types.ts,api/compareApi.ts,hooks/useCompare.ts,components/CompareListView.tsx,components/CompareArticleCard.tsx,components/CompareArticleDetailView.tsx}`; `frontend/src/app/compare/{page.tsx,[id]/page.tsx,[id]/loading.tsx,[id]/not-found.tsx}`; `frontend/src/app/api/compare/{_proxy.ts,articles/route.ts,articles/[id]/route.ts}`; `frontend/src/test/features/compare/api/compareApi.test.mts`. Modify: `frontend/src/app/radar/page.tsx` (fix dead link → `/compare`), `frontend/src/components/layout/NavBar.tsx` (+ Compare nav link), `frontend/messages/zh-CN.json` + `frontend/messages/en-US.json` (nav.compare + compare page strings).

Docs/memory (modify): `memory/roadmap-progress.md`, `memory/reform-progress.md`.

---

### Task 1: Backend Compare module (TDD)

**Files:** create `backend/modules/compare/{__init__,schemas,repository,service,router}.py`, `backend/tests/test_compare_service.py`; modify `backend/main.py`.

**Interfaces:**
- `CompareService.list_articles(category: str | None) -> list[CompareArticle]` — validates each, sorts by `published_at` desc, optional category filter.
- `CompareService.get_article(article_id) -> CompareArticle` — raises `AppError(code="COMPARE_ARTICLE_NOT_FOUND", 404)` when missing.
- `CompareService.list_categories() -> list[CompareCategory]`.
- Router: `GET /compare/articles`, `GET /compare/articles/{id}`, `GET /compare/categories` — all via `success_response` / `error_response`.

- [ ] **Step 1: Write failing service tests** in `test_compare_service.py`:
  - `test_list_articles_returns_seed_and_sorted` — ≥1 article; MCP article present.
  - `test_get_article_raises_for_missing` — `AppError` 404.
  - `test_mcp_article_has_trust_metadata_and_downstream_paths` — the seed MCP article: `status=="Verified"`, has official source, `last_verified_at`, `related_lab_ids == ["secure-mcp-server"]`, `"mcp-security-boundary-2026-07" in related_radar_item_ids`, `"MCP" in related_node_ids`.
  - `test_verified_article_missing_official_source_is_rejected` — build a service over a fake repo whose article lacks an official source → `list_articles()` raises `AppError` (code `COMPARE_ARTICLE_INVALID`).
  - Use a `FakeCompareRepository` pattern like the radar/learning tests where needed, plus the real repository for the seed-content assertions.

- [ ] **Step 2:** `cd backend && python -m pytest tests/test_compare_service.py -q` → FAIL (module missing).

- [ ] **Step 3: Implement the module** mirroring `modules/radar/*`:
  - `schemas.py`: pydantic models listed in the data-model mapping above.
  - `repository.py`: `COMPARE_ARTICLES` seed with the one MCP article (full §6.2 content), `CATEGORY_DETAILS`, `CompareRepository.list_articles/get_article/list_categories`.
  - `service.py`: `CompareService` with `_validate_article` (status/date/official-source/downstream-path), mirroring `RadarService._validate_item`.
  - `router.py`: `APIRouter(prefix="/compare", tags=["compare"])` with the three GET routes.

- [ ] **Step 4:** Register in `backend/main.py` (`from modules.compare.router import router as compare_router` + `app.include_router(compare_router)`).

- [ ] **Step 5:** Rerun `tests/test_compare_service.py` → PASS. Then full `python -m pytest tests -q` → PASS (no regressions).

- [ ] **Step 6:** Run `python -m content_check.cli` → still exit 0 (Compare product data is not a `.md`, so no new findings; confirm nothing broke).

- [ ] **Step 7: Commit** — `feat(compare): 新增 Compare 后端模块与首篇 MCP 选型`

---

### Task 2: Frontend Compare feature + API (TDD)

**Files:** create the `frontend/src/features/compare/**` files, `frontend/src/app/api/compare/**` proxy routes, `frontend/src/test/features/compare/api/compareApi.test.mts`.

**Interfaces:**
- `compareApi.ts`: `listCompareArticlesFromBackend()`, `getCompareArticleFromBackend(id)` (server, `getBackendInternalUrl()`), and `listCompareArticles()` (client, `/api/compare/...`) — mirror `radarApi.ts`.
- Proxy `_proxy.ts` mirrors radar's `proxyRadarRequest`.
- `types/compare.types.ts`: TS mirror of backend schemas (snake_case fields, like radar types).

- [ ] **Step 1: Write failing API test** `compareApi.test.mts` — mock `fetch` (radar/labs test style), assert `listCompareArticles()` returns the mocked `{articles}` and `getCompareArticleFromBackend('mcp-vs-function-calling-vs-rest')` returns the article, and 404 → handled.

- [ ] **Step 2:** `pnpm --dir frontend test -- src/test/features/compare/api/compareApi.test.mts` → FAIL (module missing).

- [ ] **Step 3: Implement** `types/`, `api/`, `app/api/compare/_proxy.ts` + `articles/route.ts` + `articles/[id]/route.ts`, and `index.ts` barrel.

- [ ] **Step 4:** Rerun the test → PASS. `pnpm --dir frontend typecheck` → PASS.

- [ ] **Step 5: Commit** — `feat(compare): 前端 Compare API 与代理路由`

---

### Task 3: Compare pages + components + cross-links

**Files:** create `components/CompareListView.tsx`, `CompareArticleCard.tsx`, `CompareArticleDetailView.tsx`, `hooks/useCompare.ts`, `app/compare/page.tsx`, `app/compare/[id]/page.tsx` + `loading.tsx` + `not-found.tsx`; modify `app/radar/page.tsx`, `NavBar.tsx`, both message JSONs.

- [ ] **Step 1:** `useCompare.ts` client hook (mirrors `useRadar.ts`) + `CompareListView` (category filter optional; cards list) + `CompareArticleCard` (title, one-liner conclusion, status, last verified).

- [ ] **Step 2:** `CompareArticleDetailView` renders §6.2 sections from structured data: 一句话结论, 对比对象表, 功能矩阵 (dimensions), 适用/不适用场景, 成本, 决策树, 官方来源, and **Related paths** linking to `/labs/secure-mcp-server`, `/radar/mcp-security-boundary-2026-07`, `/graph?node=MCP`, and learning paths — mirroring the labs detail Related-paths block.

- [ ] **Step 3:** `app/compare/page.tsx` (server, `dynamic='force-dynamic'`, Suspense + `CompareListView`) and `app/compare/[id]/page.tsx` (server, fetch via `getCompareArticleFromBackend`, `notFound()` on miss) + `loading.tsx`/`not-found.tsx` mirroring radar's `[id]`.

- [ ] **Step 4: Fix the dead link** in `app/radar/page.tsx`: `href="/docs/tech-comparisons"` → `href="/compare"` (keep the button label / i18n).

- [ ] **Step 5: Nav + i18n**: add `{ href: '/compare', labelKey: 'compare' }` to `NAV_LINKS` (extend the `labelKey` union) and add `nav.compare` + a `compare` message block (badge/title/description) to both `zh-CN.json` and `en-US.json`. Verify JSON stays UTF-8 valid (read via node, not python/gbk).

- [ ] **Step 6: Verify**
  - `pnpm --dir frontend typecheck` → PASS.
  - `pnpm --dir frontend test` → PASS (all suites).
  - `pnpm --dir frontend build` → PASS (routes compile; `/compare` + `/compare/[id]` present).

- [ ] **Step 7: Commit** — `feat(compare): Compare 页面、详情与跨模块关联`

---

### Task 4: Backlink from Lab/Radar + docs/memory + full verification

**Files:** modify `backend/modules/learning/catalog.py` (add compare backlink to secure-mcp lab), `backend/modules/radar/repository.py` (optional: note compare link), `docs/tech-comparisons/README.md` (add the new article to the index table), `memory/roadmap-progress.md`, `memory/reform-progress.md`. Optionally add `backend/tests` assertion for the lab backlink.

- [ ] **Step 1:** Add a `relatedCompareIds: ["mcp-vs-function-calling-vs-rest"]` (or reuse an existing field) to the secure-mcp lab in `catalog.py` **only if** it does not break the existing labs contract/tests — otherwise skip to keep scope tight and note it. If added, extend the frontend `LabDefinition` + a test (TDD) to surface it; if that balloons scope, defer to a follow-up and record it.
- [ ] **Step 2:** Add the new article row to `docs/tech-comparisons/README.md` "最新对比" table (keeps the author-facing index honest). Keep `lastVerifiedAt` current so content-check stays green.
- [ ] **Step 3:** Update `memory/roadmap-progress.md` (task #7 ⬜→✅; task #9 note Compare linked; add validation record) and `memory/reform-progress.md` (批次D Compare 从"待做"→部分完成).
- [ ] **Step 4: Full verification**
  - `cd backend && python -m pytest tests -q` → PASS.
  - `cd backend && python -m content_check.cli` → exit 0.
  - `pnpm --dir frontend typecheck` && `pnpm --dir frontend test` && `pnpm --dir frontend build` → PASS.
  - `git status --short` → only planned files. `git diff --check` → clean.
- [ ] **Step 5: Commit** — `docs(compare): 关联 Lab/Radar、更新索引与进度`

---

## Self-Review

- §6.2 coverage: contenders, dimension matrix, use/avoid scenarios, cost, decision tree, sources, related experiment — all in the data model and detail view.
- Consistency: Compare mirrors radar (schemas/service/repo/router, proxy, feature dir, trust validation) so it inherits the same unified-response and error conventions.
- Trust: first article is Verified and enforced by `_validate_article` + content-check philosophy (official source + downstream path + verification date).
- Dead-link fix: Radar → Compare is corrected as part of the same batch that makes `/compare` exist, so no interim 404.
- Scope guards: lab backlink is conditional (TDD or defer) to avoid silently expanding the labs contract; learn/graph internals untouched beyond link targets.
- i18n: JSON edited and validated as UTF-8 to avoid the gbk-decode pitfall seen earlier.
