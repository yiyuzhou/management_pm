# Mock 数据清理计划

> 全站页面 Mock 数据替换为数据库真实数据
>
> 创建日期：2026-07-07

---

## 一、现状总览

全站共有 **4 个页面** 仍在使用硬编码 Mock 数据，另有 **3 个 API** 仍未去除 `{code, data}` 信封（违反 ADR-0001）。

| 页面 | Mock 数据内容 | 对应 API | API 状态 |
|------|-------------|---------|---------|
| `pages/index.vue` (仪表盘) | `todos`、`activities`、`milestones` 硬编码；统计数字（12任务/3Bug/68%）硬编码 | `/api/dashboard/stats` | ⚠️ 有信封 |
| `pages/prototype.vue` (原型中心) | `prototypes` 8条硬编码假数据 | `/api/prototypes` | ⚠️ 有信封 |
| `pages/weekly.vue` (我的周报) | `stats`、`completedWork`、`nextWeekPlan`、`summary`、`problems` 全部硬编码 | `/api/weekly-reports` | ⚠️ 有信封 |
| `pages/weekly/team.vue` (团队周报) | `teamStats`、`teamReports`（5人假数据）全部硬编码 | `/api/weekly-reports` | 同上（复用） |

**数据库表均已存在**：`prototypes`、`weekly_reports`、`tasks`、`bugs`、`requirements` 均有完整表结构和种子数据。

---

## 二、执行计划

### 第 1 步：API 去信封 + 格式标准化（约 1h）

> 3 个 API 仍返回 `{ code, data, message }`，需按 ADR-0001 去除信封，直接返回数据数组/对象。

#### 1.1 `server/api/prototypes/index.get.ts`

**当前问题**：
- 返回 `{ code: 200, data: [...], message: '获取成功' }`
- 字段名是数据库原始列名，需映射为前端期望的格式

**修改内容**：
- 去除信封，直接返回数组
- 字段映射：`creator_name` → `author`，`pages`(JSON) → 解析为 `pageCount`
- `status` 枚举映射：`draft`/`in_review`/`approved`/`archived` → 前端标签
- `updated_at` → 格式化为相对时间或原始日期

#### 1.2 `server/api/weekly-reports/index.get.ts`

**当前问题**：
- 返回 `{ code: 200, data: [...], message: '获取成功' }`
- `completed_work` 和 `next_week_plan` 已解析 JSON，但字段名不统一

**修改内容**：
- 去除信封，直接返回数组
- 字段映射：`user_name` → `userName`，`user_role` → `role`，`completed_work` → `completedItems`，`next_week_plan` → `nextWeekItems`，`submitted_at` → 格式化
- 支持 `?userId=当前用户` 查询我的周报，不带 userId 查询全团队周报

#### 1.3 `server/api/dashboard/stats.get.ts`

**当前问题**：
- 返回 `{ code: 200, data: {...}, message: '获取成功' }`
- `recentActivities` 字段是数据库原始格式，需要映射为前端期望的 `{ user, action, target, time }`

**修改内容**：
- 去除信封，直接返回对象
- 统计数据补充：进行中任务数、待处理 Bug 数、当前迭代进度（从 iterations 表计算）
- `recentActivities` 映射：`type` → `action` 文案，`title` → `target`，`user_name` → `user`，`created_at` → 相对时间
- 新增返回：`todos`（当前用户的待办任务，从 tasks 表取 status != done 的前 4 条）

---

### 第 2 步：页面接入真实 API（约 1.5h）

#### 2.1 `pages/index.vue`（仪表盘）

**当前 Mock**：
```js
const todos = [ 4条硬编码 ]
const activities = [ 4条硬编码 ]
const milestones = [ 4条硬编码 ]
// 统计卡片：12任务、3Bug、68% 均硬编码
```

**修改内容**：
- 新增 `useFetch('/api/dashboard/stats')` 获取统计数据
- `todos` → 从 API 返回的 `todos` 字段取
- `activities` → 从 API 返回的 `recentActivities` 字段取
- 统计卡片：需求数、进行中任务、待处理Bug → 从 API `stats` 取
- 迭代进度条 → 从 API 返回的 `iterationProgress` 取
- `milestones` → 暂保留硬编码（无对应数据库表），或从当前迭代的 `start_date`/`end_date` 推导
- 加 `default()` 防护

#### 2.2 `pages/prototype.vue`（原型中心）

**当前 Mock**：
```js
const prototypes = [ 8条硬编码假数据 ]
```

**修改内容**：
- 删除硬编码数组
- 新增 `useFetch('/api/prototypes')` 获取真实数据
- `proto.pageCount` → `proto.pages?.length || 0`
- `proto.author` → `proto.creator_name || proto.creator?.name`
- `proto.updatedAt` → `formatDate(proto.updated_at)`
- `proto.status` → 映射枚举标签
- 搜索功能：`searchKeyword` 传参或前端过滤
- 类型筛选：`activeType` 前端过滤（数据库无 type 字段，保留前端过滤）
- 加 `default()` 防护

#### 2.3 `pages/weekly.vue`（我的周报）

**当前 Mock**：
```js
const stats = { completed: 5, inProgress: 3, bugs: 2, hours: 42 }
const completedWork = [ 5条硬编码 ]
const nextWeekPlan = [ 3条硬编码 ]
const summary = ref('硬编码文字')
const problems = ref('硬编码文字')
```

**修改内容**：
- 新增 `useFetch('/api/weekly-reports?userId=当前用户ID')` 获取当前用户本周周报
- `stats` → 从 tasks/bugs 表实时统计（已完成任务数、进行中任务数、修复Bug数、工作时长）
- `completedWork` → API 返回的 `completed_work` JSON 数组
- `nextWeekPlan` → API 返回的 `next_week_plan` JSON 数组
- `summary` / `problems` → API 返回的 `summary` 字段
- 周日期选择器 → 传 `weekStart` 参数查询对应周
- 保存周报 → 调用 `POST /api/weekly-reports`
- 加 `default()` 防护

#### 2.4 `pages/weekly/team.vue`（团队周报）

**当前 Mock**：
```js
const teamStats = { completed: 23, inProgress: 8, bugs: 5, hours: 186 }
const teamReports = [ 5人硬编码详细周报 ]
```

**修改内容**：
- 新增 `useFetch('/api/weekly-reports')` （不带 userId，获取全团队）
- `teamStats` → 从所有周报汇总计算
- `teamReports` → 映射 API 返回数据
- `report.userName` → `report.user_name`
- `report.role` → `report.user_role`（需加角色中文映射）
- `report.completedItems` → `report.completed_work`
- `report.nextWeekItems` → `report.next_week_plan`
- `report.submittedAt` → 格式化 `report.submitted_at`
- 加 `default()` 防护

---

### 第 3 步：验证（约 0.5h）

- 逐页浏览器验证：仪表盘、原型中心、我的周报、团队周报
- 确认无控制台报错
- 确认空数据状态正确显示
- 确认搜索/筛选功能正常

---

## 三、工时估算

| 步骤 | 内容 | 预计工时 |
|------|------|---------|
| 第 1 步 | API 去信封 + 格式标准化（3 个 API） | ~1h |
| 第 2 步 | 页面接入真实 API（4 个页面） | ~1.5h |
| 第 3 步 | 浏览器验证 | ~0.5h |
| **合计** | | **~3h** |

---

## 四、执行顺序

```
第 1 步（API 去信封）  ██░░░  ~1h   ← 先改 API，前端才能接入
第 2 步（页面接入）    ███░░  ~1.5h ← 逐页替换 Mock
第 3 步（验证）        █░░░░  ~0.5h ← 端到端验证
```

**执行策略**：
1. 先批量改 3 个 API（去信封 + 字段映射）
2. 再逐个改 4 个页面（删 Mock、接 API、加防护）
3. 最后浏览器逐页验证
