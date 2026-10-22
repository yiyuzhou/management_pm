# Lychee Voice Manager

面向产品研发团队的需求管理平台（RDM），覆盖项目、需求、原型、任务、缺陷、迭代与周报。代码包名及 Docker 服务名沿用 `manage-ai`。

## 功能

| 模块 | 主要能力 |
| --- | --- |
| 工作台 | 项目统计、迭代进度与图表 |
| 项目与成员 | 项目信息维护、成员管理、项目切换与访问控制 |
| 需求池 | 列表与看板、筛选、批量状态更新、附件、变更历史、关联原型与 Bug |
| 原型管理 | 原型编辑、版本快照、历史查看与恢复 |
| 任务管理 | 多负责人、需求与迭代关联、预估及实际工时、开始与截止日期 |
| Bug 管理 | 严重程度、优先级、状态流转与需求关联 |
| 周报 | 个人周报、团队周报、本周工作及下周计划 |
| 团队与权限 | 账号管理、角色、菜单及操作权限配置 |
| 消息通知 | 分配提醒、需求到期提醒、已读管理 |

## 技术栈

- Nuxt 3、Vue 3、TypeScript，前后端同仓，服务端使用 Nitro API。
- Tailwind CSS、wangEditor 富文本编辑器。
- MySQL（`mysql2` 连接池），SQL 脚本维护表结构。
- bcrypt 密码哈希、HMAC 签名的 HttpOnly Cookie 登录态。
- 火山引擎 TOS 文件存储、Vitest 单元测试、Docker 多阶段构建。

## 本地开发

### 1. 安装依赖

准备 Node.js、npm 和可访问的 MySQL 数据库。Dockerfile 使用 Node.js 20；本地开发建议使用 Node.js 22.12+ 或 24，并根据锁文件安装依赖。数据库建议使用 MySQL 8.0。

```sh
git clone git@gitlab.lycheeai.com.cn:aigc-web-business/lychee-voice-manager.git
cd lychee-voice-manager
npm ci
```

### 2. 配置环境变量

将 `.env.example` 复制为 `.env`，填写自己的配置。PowerShell 使用 `Copy-Item .env.example .env`，Linux/macOS 使用 `cp .env.example .env`。

| 变量 | 用途 |
| --- | --- |
| `DB_HOST`、`DB_PORT` | MySQL 地址和端口 |
| `DB_USER`、`DB_PASSWORD`、`DB_NAME` | 数据库账号、密码和库名 |
| `AUTH_SECRET` | 登录 Cookie 签名密钥；各应用实例使用相同的随机密钥 |
| `NUXT_TOS_ENDPOINT`、`NUXT_TOS_REGION` | TOS 服务地址（不含协议）和地域 |
| `NUXT_TOS_BUCKET`、`NUXT_TOS_DOMAIN` | 存储桶和访问域名（域名含 `https://`） |
| `NUXT_TOS_ACCESS_KEY`、`NUXT_TOS_ACCESS_SECRET` | TOS 服务端访问凭据 |

`NUXT_TOS_*` 对应私有 `runtimeConfig.tos`，支持构建后的运行时覆盖。代码也读取 `TOS_*` 作为构建/开发配置来源，部署时推荐统一使用 `NUXT_TOS_*`。未配置可用 TOS 凭据时，文件上传不可用。

Nuxt 开发命令会加载 `.env`；直接运行生产入口或迁移脚本时，需显式加载环境变量。`.env` 已被 Git 和 Docker 构建上下文忽略。

### 3. 初始化数据库

使用 MySQL 客户端连接自己的实例：

```sh
mysql -h <数据库地址> -P <端口> -u <用户名> -p
```

在 MySQL 客户端执行，`SOURCE` 路径相对于客户端启动目录：

```sql
CREATE DATABASE IF NOT EXISTS voice_rdm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE voice_rdm;
SOURCE database/schema.sql;
```

`database/schema.sql` 包含建表语句和演示数据，应首次导入空数据库。数据插入并非幂等，重复导入可能出现唯一键冲突。库名应与 `DB_NAME` 一致。

演示账号包括 `admin`、`pm1`、`pm2`、`manager1`、`dev1`、`test1`。首次使用可先在本地生成自己的管理员密码哈希：

```sh
node --input-type=module -e "import bcrypt from 'bcryptjs'; console.log(bcrypt.hashSync('replace-with-your-password', 10))"
```

将命令中的密码替换为自己的密码，把输出哈希写入数据库：

```sql
UPDATE users SET password_hash = '<上一步生成的哈希>' WHERE username = 'admin';
```

`scripts/db-init.mjs` 是历史初始化工具，连接配置写在脚本内，且可能忽略部分 SQL 错误；新环境优先按上述方式导入 SQL。

### 4. 启动

```sh
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)，使用初始化后的账号登录。开发服务监听 `0.0.0.0:3000`。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm ci` | 根据锁文件安装依赖，同时执行 Nuxt prepare |
| `npm run dev` | 启动开发服务 |
| `npm test` | 运行 Vitest 测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run build` | 构建生产应用到 `.output/` |
| `npm run preview` | 本地预览生产构建 |

生产环境可显式加载配置并启动（Node.js 需支持 `--env-file`）：

```sh
npm run build
node --env-file=.env .output/server/index.mjs
```

应用依赖服务端 API 和数据库，部署时使用 Node 服务。`npm run generate` 仅执行 Nuxt 静态生成，不能替代完整应用部署。

## Docker 部署

Compose 只启动 Web 服务，MySQL 与 TOS 需单独准备。

1. 准备 `.env` 并初始化数据库。数据库运行在宿主机时，`DB_HOST` 可设为 `host.docker.internal`；容器内的 `localhost` 指向容器自身。
2. 按部署机器调整 `docker-compose.yml` 的日志挂载路径，当前为 `/home/ubuntu/workspace/logs/manage-ai`。
3. 执行以下命令：

```sh
docker compose up -d --build
docker compose ps
docker compose logs -f web
```

默认访问 [http://localhost:5100](http://localhost:5100)，映射容器端口 `3000`。日志同时输出到容器标准输出和 `/var/log/manage-ai/app.log`，文件映射到宿主机日志目录。健康检查请求 `/login`，确认 HTTP 服务响应，不代表数据库或 TOS 已连通。

更新代码后重新执行 `docker compose up -d --build`，停止服务使用 `docker compose down`。数据库升级需单独执行迁移，不会在容器启动时自动运行。

## 数据库迁移

新库使用 `database/schema.sql`。已有数据库按实际缺少的字段和表选择 `scripts/migrate_*.sql` 或 `.mjs`，先备份并核对内容。仓库尚无统一迁移版本管理器，不应不加区分地执行全部脚本。

Node 迁移脚本可显式加载 `.env`，例如：

```sh
node --env-file=.env scripts/migrate_task_start_date.mjs
```

迁移覆盖角色与菜单权限、原型扩展及版本、任务多人负责人、任务开始日期、在线状态及通知等。`scripts/cleanup_data.sql` 用于数据清理，执行前需确认目标库和清理范围。

## 目录结构

```text
assets/css/        全局样式
components/        通用组件、业务弹窗与看板
composables/       登录和项目状态
database/          数据库结构及初始化数据
docs/              业务计划和架构决策记录（ADR）
middleware/        前端路由鉴权
pages/             页面与文件路由
plugins/           客户端插件
public/            静态资源
scripts/           初始化、迁移与清理脚本
server/api/        服务端接口
server/utils/      数据库、鉴权、权限、存储等服务端工具
test/              Vitest 测试与测试环境配置
types/             TypeScript 类型
utils/             前后端共用或前端工具
```

## 开发约定

- 修改业务状态、角色和接口字段前，先查阅 [领域说明](CONTEXT.md) 和 [架构决策记录](docs/adr/)。
- 需求、任务、Bug 有业务编号和数据库数字主键，接口关联时需区分两者。
- 写接口需进行服务端权限校验，前端按钮与菜单权限用于界面展示。
- 提交前运行 `npm test` 和 `npm run build`；涉及数据库变化时，同步维护初始化结构及对应迁移。
- 测试主要通过 mock 验证接口和业务逻辑，部署环境仍需验证登录、数据库连接和上传流程。
