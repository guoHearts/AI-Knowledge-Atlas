# Radar 架构样板改造设计

## 背景

项目新增了 `docs/agent需遵循架构约定.md` 和 `docs/通用前后端架构文档.md`，明确要求：

- 前端 `app` 只负责路由入口，业务代码进入 `features`。
- 前端组件不直接 `fetch`，统一经过 feature API 和底层 request 封装。
- 后端采用模块化单体，按 router/controller、service、repository、schema 分层。
- API 响应结构统一，包含 `success`、`data` 或 `error`、`requestId`。
- 应用代码通过环境变量连接外部服务，不硬编码中间件地址。

当前项目已有 Radar 前后端骨架，但仍处于 sample/demo 状态。Radar 同时涉及前端页面、Next.js Route Handler、FastAPI 路由和后续可信内容数据模型，适合作为第一阶段架构样板。

## 目标

第一阶段只做 Radar 架构样板改造，目标是形成后续模块可复制的工程模板：

1. 前端建立 `features/radar` 分层，减少 `app` 和组件中的业务逻辑。
2. 后端建立 `modules/radar` 分层，避免 router 直接承载业务规则和数据来源。
3. 建立统一 API 响应结构和前端 request 解包方式。
4. 区分浏览器访问后端地址与服务端/容器内部访问后端地址。
5. 保持现有 Radar 页面行为基本不变，为后续持久化数据源预留接口。
6. 增加最小测试保护，确保重构不靠手工检查。

## 非目标

本阶段不做以下事情：

- 不引入 PostgreSQL、MySQL 或其他新数据库。
- 不把 Graph、Learn、Labs、CMS 一次性迁移到新结构。
- 不新增 Radar 业务内容，不把 sample data 扩写成正式内容库。
- 不实现认证、权限、后台审核流。
- 不重写 UI 视觉设计。
- 不回退或覆盖用户已有的 `Make.ps1`、`start.ps1` 和新增架构文档改动。

## 前端设计

### 目录结构

新增 Radar feature：

```txt
frontend/src/features/radar/
├─ api/
│  └─ radarApi.ts
├─ components/
│  ├─ RadarListView.tsx
│  ├─ RadarItemCard.tsx
│  ├─ RadarCategoryFilter.tsx
│  └─ RadarItemDetailView.tsx
├─ hooks/
│  └─ useRadar.ts
├─ types/
│  └─ radar.types.ts
└─ index.ts
```

新增底层能力：

```txt
frontend/src/lib/
├─ env.ts
└─ request.ts
```

`frontend/src/app/radar/page.tsx` 只保留路由入口，渲染 `RadarListView`。

`frontend/src/app/radar/[id]/page.tsx` 只负责读取 `params.id`，渲染 `RadarItemDetailView` 或调用 feature 层服务端 API。

### 数据流

Radar 列表数据流：

```txt
app/radar/page.tsx
  ↓
features/radar/components/RadarListView.tsx
  ↓
features/radar/hooks/useRadar.ts
  ↓
features/radar/api/radarApi.ts
  ↓
lib/request.ts
  ↓
Next.js Route Handler 或 FastAPI
```

Radar 详情数据流：

```txt
app/radar/[id]/page.tsx
  ↓
features/radar/components/RadarItemDetailView.tsx
  ↓
features/radar/api/radarApi.ts
  ↓
lib/request.ts
```

### 请求约定

组件和页面不直接调用 `fetch`。

`lib/request.ts` 负责：

- 设置 JSON header。
- 解析统一响应结构。
- 对失败响应抛出标准错误。
- 保留 `requestId`，方便 UI 或日志展示。

`features/radar/api/radarApi.ts` 只暴露业务语义函数：

- `listRadarItems(params?: { category?: string })`
- `getRadarItem(id: string)`
- `listRadarCategories()`
- `getWeeklyRadar(week: string)`

### 环境变量

保留浏览器可见变量：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

新增服务端内部变量：

```env
BACKEND_INTERNAL_URL=http://localhost:8000
```

全 Docker 模式下，`BACKEND_INTERNAL_URL` 应设置为：

```env
BACKEND_INTERNAL_URL=http://backend:8000
```

Next.js Route Handler 和 Server Component 优先使用 `BACKEND_INTERNAL_URL`；浏览器侧代码只使用相对 `/api/...` 或 `NEXT_PUBLIC_` 变量。

## 后端设计

### 目录结构

新增通用层：

```txt
backend/common/
├─ errors.py
├─ response.py
└─ request_context.py
```

新增 Radar 模块：

```txt
backend/modules/radar/
├─ router.py
├─ service.py
├─ repository.py
└─ schemas.py
```

`backend/api/radar_routes.py` 可以作为兼容层临时保留，但应逐步变薄，只导入并暴露 `modules/radar/router.py` 的 router。最终目标是路由注册来自模块目录。

### 分层职责

`router.py`：

- 读取 path/query 参数。
- 调用 service。
- 返回统一响应。
- 不保存 sample data，不写筛选和排序业务。

`service.py`：

- 处理 Radar 查询、详情查找、分类列表、周报查询。
- 负责业务错误，如 item 不存在、week 格式不合法。
- 返回 schema 定义的业务对象。

`repository.py`：

- 暂时承载现有 sample data。
- 对外提供数据访问函数。
- 后续可替换为 SQLite/PostgreSQL/Neo4j，不影响 router 和前端契约。

`schemas.py`：

- 定义 `RadarItem`、`RadarSource`、`RadarCategory`、`WeeklyRadar`。
- 明确字段类型，不再使用 `Dict[str, Any]` 作为公开响应模型。

## API 契约

成功响应：

```json
{
  "success": true,
  "data": {},
  "message": "ok",
  "requestId": "req_xxx"
}
```

失败响应：

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Radar item not found",
    "details": {}
  },
  "requestId": "req_xxx"
}
```

列表接口：

```txt
GET /radar/items?category=mcp
```

返回：

```json
{
  "success": true,
  "data": {
    "items": []
  },
  "message": "ok",
  "requestId": "req_xxx"
}
```

详情接口：

```txt
GET /radar/items/{itemId}
```

分类接口：

```txt
GET /radar/categories
```

周报接口：

```txt
GET /radar/weekly/{week}
```

错误码第一阶段使用：

- `VALIDATION_ERROR`
- `RADAR_ITEM_NOT_FOUND`
- `RADAR_WEEK_INVALID`
- `INTERNAL_SERVER_ERROR`
- `BACKEND_UNAVAILABLE`

## 兼容策略

为了降低风险，第一阶段允许前端 request 层同时兼容两种返回：

1. 新统一响应：`{ success, data, requestId }`
2. 旧直接业务对象：`RadarItem[]` 或 `RadarItem`

但新后端 Radar 模块只输出统一响应。兼容逻辑仅用于迁移期，后续模块不再新增旧格式。

## 测试策略

### 后端

增加 Radar service 单元测试：

- 列出全部 item 时按创建时间倒序。
- 按 category 过滤时只返回对应类别。
- 查询不存在 item 时抛出业务错误。
- week 格式非法时抛出业务错误。

增加统一响应测试：

- 成功响应包含 `success: true`、`data`、`requestId`。
- 失败响应包含 `success: false`、`error.code`、`requestId`。

### 前端

如果当前没有前端测试框架，先补最小可运行测试配置，再覆盖：

- `request` 能解包统一响应。
- `request` 能处理统一错误响应。
- `radarApi` 调用正确路径并返回业务数据。

### 验证命令

后端：

```powershell
python -m pytest
```

前端：

```powershell
pnpm lint
pnpm tsc --noEmit
pnpm test
```

如果项目暂时没有 `test` 或 `tsc` 脚本，实施阶段需要先补最小脚本或明确记录无法运行的原因。

## 迁移步骤

1. 写后端 Radar service 和 schema 的失败测试。
2. 新增 `backend/common` 与 `backend/modules/radar`。
3. 将现有 sample data 移入 repository。
4. 将 `backend/api/radar_routes.py` 改为薄兼容层或在 `main.py` 注册新 router。
5. 写前端 request 层测试。
6. 新增 `frontend/src/lib/request.ts` 和 `frontend/src/lib/env.ts`。
7. 建立 `frontend/src/features/radar`。
8. 将 Radar 列表与详情页面迁移到 feature 组件。
9. 统一 Next.js Radar Route Handler 的后端地址读取逻辑。
10. 更新 README 或架构文档中的环境变量说明。
11. 运行目标测试、lint 和类型检查。

## 风险与缓解

### 风险：统一响应会影响现有前端

缓解：前端 request 层迁移期兼容旧响应；Radar 页面统一走新 request 后再切后端响应。

### 风险：全 Docker 与本地开发 URL 不一致

缓解：引入 `BACKEND_INTERNAL_URL`，服务端请求用内部地址，浏览器请求用相对 API 或 `NEXT_PUBLIC_API_URL`。

### 风险：重构面扩大到 Graph/Learn

缓解：第一阶段只迁 Radar；其他模块只在 shared request/env 必须兼容时做最小适配。

### 风险：没有测试框架导致重构不可验证

缓解：先补最小测试配置和关键行为测试，再迁移实现。

## 完成标准

本阶段完成后应满足：

- Radar 前端业务代码集中在 `features/radar`。
- Radar 页面入口足够薄，不直接写请求和业务筛选逻辑。
- Radar 组件不直接 `fetch`。
- 后端 Radar 业务分为 router/service/repository/schema。
- Radar API 不再公开 `Dict[str, Any]` 响应模型。
- Radar 成功和失败响应符合统一结构。
- 服务端后端地址不再依赖写死的 `localhost:8000`。
- 有最小测试覆盖核心迁移行为。
- README 或 docs 记录新增环境变量和架构样板约定。
