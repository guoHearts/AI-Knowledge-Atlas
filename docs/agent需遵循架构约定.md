# Agent 开发架构约束文档

## 1. 总体原则

本项目采用通用前后端分离架构。

核心原则：

```txt
前端负责展示、交互、客户端状态、接口调用。
后端负责业务规则、权限校验、数据校验、数据持久化。
数据库和中间件通过 Docker Compose 启动。
应用代码通过环境变量连接外部依赖。
不要为了某个具体项目写死架构。
```

禁止：

```txt
页面里堆大量业务逻辑
组件里直接写 fetch
后端 controller 里直接写复杂业务
代码里硬编码数据库地址、账号、密码
业务代码绑定某个中间件启动方式
所有状态都塞全局 store
utils 里塞具体业务规则
接口返回结构不统一
```

---

## 2. 推荐项目结构

```txt
project-root/
├─ frontend/
├─ backend/
├─ docker/
│  ├─ postgres/
│  ├─ mysql/
│  ├─ neo4j/
│  ├─ redis/
│  ├─ minio/
│  └─ init/
├─ docs/
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

如果使用 monorepo，也可以使用：

```txt
project-root/
├─ apps/
│  ├─ web/
│  └─ api/
├─ packages/
│  ├─ shared/
│  ├─ types/
│  └─ config/
├─ docker/
├─ docs/
├─ docker-compose.yml
└─ README.md
```

---

## 3. 前端架构约定

前端默认使用 Next.js App Router。

推荐结构：

```txt
frontend/
├─ public/
├─ src/
│  ├─ app/
│  ├─ features/
│  ├─ components/
│  ├─ lib/
│  ├─ hooks/
│  ├─ stores/
│  ├─ types/
│  ├─ constants/
│  └─ utils/
├─ .env.local
├─ .env.example
├─ next.config.ts
├─ tsconfig.json
└─ package.json
```

### 3.1 `src/app`

`app` 只负责路由和页面入口。

允许：

```txt
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx
route.ts
```

推荐：

```tsx
import { ProjectListView } from "@/features/project/components/ProjectListView";

export default function ProjectsPage() {
  return <ProjectListView />;
}
```

禁止在 `app/page.tsx` 中写大量业务逻辑。

原则：

```txt
app 负责页面在哪里
features 负责页面做什么
```

---

### 3.2 `src/features`

业务模块放在 `features` 下。

示例：

```txt
src/features/
├─ project/
│  ├─ components/
│  ├─ api/
│  ├─ hooks/
│  ├─ types/
│  ├─ schemas/
│  └─ utils/
├─ auth/
├─ user/
└─ document/
```

业务相关组件、接口、hooks、类型、校验规则，都优先放在对应 feature 内部。

不要把所有业务组件都丢到全局 `components`。

---

### 3.3 `src/components`

只放全局通用组件。

适合：

```txt
Button
Input
Dialog
Table
EmptyState
LoadingState
ErrorState
AppHeader
AppSidebar
PageContainer
```

不适合：

```txt
ProjectCard
ProjectForm
DocumentEditor
UserProfilePanel
```

判断标准：

```txt
离开具体业务还能复用 → 放 components
只服务某个业务模块 → 放 features/xxx/components
```

---

### 3.4 `src/lib`

放底层能力封装。

适合：

```txt
request.ts
env.ts
auth.ts
logger.ts
storage.ts
upload.ts
```

请求层示例：

```ts
// src/lib/request.ts
export async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return response.json();
}
```

业务 API 示例：

```ts
// src/features/project/api/projectApi.ts
import { request } from "@/lib/request";
import type { Project } from "../types/project.types";

export function getProjects() {
  return request<Project[]>("/api/projects");
}
```

页面和组件不要直接调用 `fetch`。

---

### 3.5 前端数据流

推荐数据流：

```txt
app/page.tsx
  ↓
features/xxx/components/XxxView.tsx
  ↓
features/xxx/hooks/useXxx.ts
  ↓
features/xxx/api/xxxApi.ts
  ↓
lib/request.ts
  ↓
backend API
```

---

## 4. 后端架构约定

后端采用模块化单体结构，默认不要拆微服务。

推荐结构：

```txt
backend/
├─ src/
│  ├─ main.ts
│  ├─ app.ts
│  ├─ modules/
│  │  ├─ project/
│  │  │  ├─ project.controller.ts
│  │  │  ├─ project.service.ts
│  │  │  ├─ project.repository.ts
│  │  │  ├─ project.dto.ts
│  │  │  ├─ project.schema.ts
│  │  │  └─ project.routes.ts
│  │  ├─ user/
│  │  ├─ auth/
│  │  └─ document/
│  ├─ common/
│  │  ├─ config/
│  │  ├─ database/
│  │  ├─ errors/
│  │  ├─ logger/
│  │  ├─ middleware/
│  │  ├─ response/
│  │  └─ utils/
│  ├─ jobs/
│  └─ tests/
├─ .env
├─ .env.example
├─ Dockerfile
└─ package.json
```

---

## 5. 后端分层职责

后端调用链：

```txt
routes
  ↓
controller
  ↓
service
  ↓
repository
  ↓
database
```

### routes

只注册路由。

```txt
GET    /api/projects
POST   /api/projects
GET    /api/projects/:projectId
PATCH  /api/projects/:projectId
DELETE /api/projects/:projectId
```

### controller

只处理 HTTP 层逻辑。

负责：

```txt
读取 params/query/body
读取当前用户
调用 service
返回统一响应
```

不要在 controller 写复杂业务逻辑。

### service

处理业务规则。

负责：

```txt
权限判断
业务校验
流程编排
事务控制
调用 repository
调用第三方服务
```

### repository

只处理数据访问。

负责：

```txt
数据库查询
数据库写入
ORM 调用
SQL 封装
```

不要在 repository 里处理 HTTP、权限、页面逻辑。

---

## 6. API 约定

接口使用资源风格。

推荐：

```txt
GET    /api/projects
POST   /api/projects
GET    /api/projects/:projectId
PATCH  /api/projects/:projectId
DELETE /api/projects/:projectId
```

不推荐：

```txt
GET  /api/getProjectList
POST /api/createProject
POST /api/deleteProject
```

统一成功响应：

```json
{
  "success": true,
  "data": {},
  "message": "ok",
  "requestId": "req_xxx"
}
```

统一失败响应：

```json
{
  "success": false,
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found",
    "details": {}
  },
  "requestId": "req_xxx"
}
```

分页响应：

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

常见错误码：

```txt
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
INTERNAL_SERVER_ERROR
```

---

## 7. 鉴权与权限

前端可以控制页面和按钮显示，但不能作为安全边界。

必须以后端权限校验为准。

原则：

```txt
前端隐藏按钮 = 用户体验
后端校验权限 = 安全边界
```

敏感信息禁止放到前端。

禁止：

```txt
前端保存数据库密码
前端保存私密 API Key
前端直接连接数据库
前端绕过后端访问私密第三方服务
```

---

## 8. 数据库约定

数据库通过环境变量连接。

推荐通用字段：

```txt
id
created_at
updated_at
deleted_at
created_by
updated_by
```

命名约定：

```txt
数据库字段：snake_case
前端字段：camelCase
```

示例：

```txt
created_at → createdAt
updated_at → updatedAt
```

业务数据优先软删除：

```txt
deleted_at IS NULL 表示未删除
deleted_at 有值表示已删除
```

需要索引的字段：

```txt
外键字段
唯一字段
高频筛选字段
高频排序字段
created_at
status
user_id
project_id
```

---

## 9. Docker 与中间件约定

数据库和中间件优先通过 Docker Compose 启动。

适合 Docker 启动的基础设施：

```txt
PostgreSQL
MySQL
Neo4j
Redis
MinIO
RabbitMQ
Kafka
Qdrant
Elasticsearch
OpenSearch
```

应用代码不要关心中间件是 Docker、本机安装，还是云服务。

应用代码只通过环境变量连接。

示例：

```env
DATABASE_URL=postgresql://app:app_password@postgres:5432/app_db
REDIS_URL=redis://redis:6379
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j_password
S3_ENDPOINT=http://minio:9000
RABBITMQ_URL=amqp://app:app_password@rabbitmq:5672
```

不要在代码中硬编码：

```txt
localhost
127.0.0.1
数据库账号
数据库密码
固定端口
固定中间件地址
```

---

## 10. Docker Compose profiles

中间件按需启动，不要强制所有服务一起启动。

推荐 profiles：

```txt
app
postgres
mysql
neo4j
redis
minio
rabbitmq
database
cache
graph
object-storage
message-queue
```

示例命令：

```bash
docker compose --profile app up -d
docker compose --profile postgres up -d
docker compose --profile neo4j up -d
docker compose --profile redis up -d
docker compose --profile app --profile postgres --profile redis up -d
```

---

## 11. 通用 docker-compose 示例

```yaml
services:
  frontend:
    build:
      context: ./frontend
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend
    profiles:
      - app

  backend:
    build:
      context: ./backend
    ports:
      - "${BACKEND_PORT:-3001}:3001"
    env_file:
      - ./backend/.env
    depends_on:
      - postgres
      - redis
    profiles:
      - app

  postgres:
    image: postgres:16
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-app}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-app_password}
      POSTGRES_DB: ${POSTGRES_DB:-app_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    profiles:
      - postgres
      - database

  mysql:
    image: mysql:8
    ports:
      - "${MYSQL_PORT:-3306}:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root_password}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-app_db}
      MYSQL_USER: ${MYSQL_USER:-app}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-app_password}
    volumes:
      - mysql_data:/var/lib/mysql
    profiles:
      - mysql
      - database

  neo4j:
    image: neo4j:5
    ports:
      - "${NEO4J_HTTP_PORT:-7474}:7474"
      - "${NEO4J_BOLT_PORT:-7687}:7687"
    environment:
      NEO4J_AUTH: ${NEO4J_USER:-neo4j}/${NEO4J_PASSWORD:-neo4j_password}
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
    profiles:
      - neo4j
      - graph

  redis:
    image: redis:7
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    profiles:
      - redis
      - cache

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "${MINIO_API_PORT:-9000}:9000"
      - "${MINIO_CONSOLE_PORT:-9001}:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minio}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minio_password}
    volumes:
      - minio_data:/data
    profiles:
      - minio
      - object-storage

volumes:
  postgres_data:
  mysql_data:
  neo4j_data:
  neo4j_logs:
  redis_data:
  minio_data:
```

---

## 12. 环境变量约定

必须提供 `.env.example`。

禁止提交真实 `.env`。

`.env.example` 示例：

```env
# App
NODE_ENV=development
FRONTEND_PORT=3000
BACKEND_PORT=3001

# Database
DATABASE_URL=postgresql://app:app_password@postgres:5432/app_db

# Redis
REDIS_URL=redis://redis:6379

# Neo4j
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j_password

# Object Storage
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio_password
S3_BUCKET=app-bucket

# Auth
JWT_SECRET=change_me
```

前端可暴露变量必须使用：

```txt
NEXT_PUBLIC_
```

例如：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## 13. 中间件选择原则

关系型数据库用于：

```txt
用户
权限
项目
订单
配置
强一致业务数据
```

图数据库用于：

```txt
知识图谱
节点关系
路径查询
依赖网络
世界观/本体关系
```

Redis 用于：

```txt
缓存
验证码
登录态
限流
短期任务状态
分布式锁
```

对象存储用于：

```txt
图片
附件
导入文件
导出文件
生成文件
```

消息队列用于：

```txt
异步任务
任务重试
事件通知
削峰填谷
后台处理
```

不要为了“看起来高级”引入中间件。必须有明确用途。

---

## 14. 开发流程

新增功能时，按这个顺序：

```txt
1. 明确业务目标
2. 设计数据模型
3. 设计 API 契约
4. 设计前端路由和页面
5. 设计前端 feature 模块
6. 实现后端 module
7. 实现前端页面
8. 联调
9. 补充错误处理
10. 补充测试
```

不要直接从页面开始乱写。

---

## 15. 新功能模板

每新增一个业务模块，按下面结构生成。

### 前端

```txt
src/features/<module>/
├─ components/
├─ api/
├─ hooks/
├─ types/
├─ schemas/
└─ utils/
```

### 后端

```txt
src/modules/<module>/
├─ <module>.controller.ts
├─ <module>.service.ts
├─ <module>.repository.ts
├─ <module>.dto.ts
├─ <module>.schema.ts
└─ <module>.routes.ts
```

### API

```txt
GET    /api/<resources>
POST   /api/<resources>
GET    /api/<resources>/:id
PATCH  /api/<resources>/:id
DELETE /api/<resources>/:id
```

---

## 16. Agent 执行规则

当你作为 Agent 修改代码时，必须遵守：

```txt
先判断文件应该属于哪一层
优先复用现有目录结构
业务代码放 features 或 modules
通用能力放 components/lib/common
不要随意新增平级大目录
不要把临时代码写进核心模块
不要破坏统一响应结构
不要绕过 service 直接访问 repository
不要在前端绕过 api 层直接请求接口
不要硬编码环境配置
```

当你不确定放哪里时，优先遵守：

```txt
前端页面入口 → src/app
前端业务代码 → src/features/<module>
前端通用组件 → src/components
前端基础封装 → src/lib
后端业务逻辑 → src/modules/<module>/service
后端数据访问 → src/modules/<module>/repository
后端通用能力 → src/common
中间件配置 → docker/
项目说明 → docs/
```

---

## 17. 最小合格标准

一个功能完成后至少满足：

```txt
目录位置正确
前后端职责清晰
API 响应结构统一
错误处理明确
环境变量不硬编码
数据库访问不写在 controller
前端页面不直接 fetch
业务组件不放全局 components
中间件通过 Docker 或环境变量连接
README 或 docs 有必要说明
```

---

## 18. 核心总结

本项目架构遵循：

```txt
前端轻页面、重 feature
后端轻 controller、重 service
数据库和中间件容器化
应用连接配置环境变量化
模块按业务内聚
通用能力下沉
具体项目按需启用中间件
```
