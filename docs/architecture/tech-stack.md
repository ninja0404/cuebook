# CueBook 技术栈与架构定稿

> **定位**：交易前认知网络。`/bet` 发现叙事 → 进入 Narrative Room → `/frame` 表达观点、`/trade` 模拟验证 → 结算沉淀为可累积的认知记忆。
>
> **本文档是技术选型的唯一事实来源（source of truth）。** 它不仅记录"选了什么"，更记录"为什么"和"何时该重新评估"。
>
> - 版本：v1（定稿）
> - 日期：2026-06-09
> - 适用阶段：长期大项目 / 面向高并发用户量
> - 状态：技术栈已定稿；少数**业务相关**项（结算规则、`/trade` 记分内核）见 §10 待确认

---

## 0. 最高选型标准

> **起步要快，但任何一个选择都不能在 10x / 100x 用户时被迫推倒重来。**

这条标准区分了"MVP 怎么快怎么来"和本项目的"长期大项目"定位。下面每一个选型都经得起它的检验：默认值优先选**可演进**而非**一次性到位**，所有规模化瓶颈点**先抽象接口、后实现**。

---

## 1. 架构哲学（4 条灵魂，决定下面所有选型）

1. **单一 TypeScript 全栈 + Modular Monolith 起步。**
   不是微服务——高并发长期项目最大的坑是过早分布式。但模块边界按"将来能干净拆成服务"来划，预留缝，不预先拆。

2. **Postgres 为脊椎，结算走 append-only event log。**
   金融结算 / 信誉必须可审计、可回放，这是产品核心 IP 的物理载体。

3. **领域核心（结算引擎 / 信誉计算 / Narrative Room 聚合）独立于框架。**
   放在 `packages/core`，纯逻辑、零框架依赖、可测可移植。护城河逻辑绝不和 Next.js 耦合死。

4. **所有规模化瓶颈点先抽象接口、不预先实现。**
   向量库、工作流引擎、事件流、OLAP——全部先用 repository / 接口包一层，给出明确的"何时该迁移"触发点。这是"长远"与"不过度设计"的平衡点。

---

## 2. 核心架构形态

### 2.1 传输层全栈，逻辑层分离

不在"全栈 vs 前后端分离"里二选一——那是伪命题。真正的形态是：

- **传输层用全栈**：Next.js 同时承担 web 前端与 BFF（Backend for Frontend）。
- **逻辑层做分离**：业务逻辑下沉到 `packages/core`，零框架依赖，可被任何客户端复用。

由此得到三个运行时角色，分工清晰：

```
Next.js  → 面向用户的同步请求（页面渲染、读写 Room/Frame/Trade、单次 AI 调用）
Worker   → 后台长时任务（AI 叙事供给管道、行情订阅、结算与失效点监控）
core     → 两端 / 两个运行时共享的领域逻辑，不属于任何一块
```

> **为什么必须有独立 Worker**：Next 是请求-响应、无状态、有执行时长限制的（serverless function 几十秒超时）。AI 供给管道、行情 WebSocket 长连接、结算到期监控这类"常驻 / 长时"任务它物理上做不了。Worker 是必需，不是装饰。

### 2.2 逻辑共享，UI 分离（移动端加入后的命门）

已确认将来要做移动端。同时满足"体验最好"与"易维护 / 易迭代"的关键架构主张是：

> **共享该共享的（业务逻辑、类型、API client），不强行共享不该共享的（UI）。**

- **共享**：`packages/core`（业务逻辑）、`packages/api`（tRPC router + 类型）、`packages/db`。改一处，两端编译期同步。
- **分离**：`apps/web` 用 React DOM 组件，`apps/mobile` 用 RN 原生组件，各自做到平台最优。

底层逻辑一份 → 易维护、易迭代；UI 各平台原生最优 → 体验最好。不矛盾，是分层拿好处。
（很多人做 RN 做砸，正是因为想连 UI 一起跨端共享，结果两边体验都半残。）

### 2.3 AI 边界：只综合，不抓取

数据接入与 AI 综合是两件不同性质的事，必须分离：

- **找数据 = 确定性工程**：受控数据源（新闻 API / RSS / 交易所 WS / 链上 / 官方公告）→ Worker 抓取、去重、入库、标注来源。
- **综合判断 = AI**：LLM 只对**已入库的受控事件**做综合，产出叙事。

> AI 不联网找事件；它要"查资料"时，检索的是我们自己入库的受控事件库（pgvector），不是公网。

理由：来源可溯（信任原则）、可复现可审计、成本可控可规模化。

---

## 3. Monorepo 结构

```
cuebook/
├── apps/
│   ├── web/          Next.js (App Router) —— web 前端 + BFF
│   ├── mobile/       Expo / React Native —— 移动端
│   └── worker/       后台长时任务运行时
├── packages/
│   ├── core/         领域逻辑：结算引擎 / 信誉计算 / Room 聚合（零框架依赖）
│   ├── api/          tRPC router 定义 + 端到端类型
│   ├── db/           Drizzle schema + migration + repository 抽象
│   ├── ai/           Claude 调用薄封装 / RAG / 输出校验
│   ├── market-data/  统一 MarketDataProvider 接口（多源行情可插拔）
│   └── config/       共享配置 / 环境变量 schema
└── docs/
    └── architecture/ 本文档所在
```

工具：**pnpm + Turborepo**，TypeScript strict 全程开启。

---

## 4. 技术栈分层定义

| 层 | 选型（定稿） | 为什么经得起长期 / 规模化 |
|---|---|---|
| **仓库** | pnpm + Turborepo monorepo，TS strict | 类型端到端贯通；模块化组织，将来按边界拆服务不动业务码 |
| **Web 前端** | Next.js (App Router) + Tailwind + TanStack Query | 生态最稳、招人最容易；RSC + 边缘渲染 + CDN，前端层规模化无忧；SSR/SEO 对 Frame/Room 分享传播是刚需 |
| **移动端** | Expo / React Native（新架构 Fabric + Hermes） | 见 §5 专节。一套 TS 延续到移动端，逻辑 / 类型共享 |
| **API 主干** | tRPC（web + RN 端到端类型） | 一套类型贯穿前后端与两个客户端，迭代最快 |
| **API 对外边界** | 预留 REST / OpenAPI（Hono + zod-openapi） | 将来开放给第三方 / Agent 时再实现，边界先留好 |
| **校验** | Zod（API 边界 + AI 输出 + DB schema 推断） | 同一套 schema 贯穿；AI 输出强约束在规模化时尤其关键 |
| **领域核心** | `packages/core` 纯 TS（DDD aggregate + 结算 / 信誉引擎） | 核心 IP 与框架解耦，可独立测试 / 部署 / 被任意客户端复用 |
| **主库** | PostgreSQL（Neon 起步，云中立可迁 Aurora / 自建） | 关系完整性 + 审计；能扛到极大；不锁死单一云 |
| **ORM** | Drizzle | SQL-first、类型安全、迁移可控；规模化复杂查询调优比 Prisma 更贴近 SQL |
| **向量检索** | pgvector（同库起步） | 省运维；瓶颈后迁 Turbopuffer / Qdrant，接口已抽象 |
| **时序 / 行情** | Postgres 分区（或 TimescaleDB）起步 | 量级上来后迁 ClickHouse 做 OLAP，事务仍留 Postgres |
| **缓存** | Redis（Upstash 起步） | 热点叙事卡、行情快照、排序结果、会话、限流 |
| **后台工作流** | **Inngest 起步 → Temporal 终态** | AI 供给 + 结算都是"长时、多步、必须幂等可审计"的 durable workflow；job 接口自抽象保证可迁移 |
| **事件** | Postgres outbox + Redis Stream 起步 | 真需要事件流 / 多消费者 / 回放时再上 Kafka / Redpanda |
| **AI 模型** | Claude 分级（Haiku 抽取分类 / Sonnet 叙事生成 / Opus 研究核验） | 成本分级是高并发的必需，不是优化项 |
| **AI 调用** | Anthropic SDK + 自建薄封装（重试 / 缓存 / 可观测） | 不用 LangChain——长期项目避开黑盒抽象，自控 prompt / 检索 / 校验 |
| **Embedding** | Voyage（金融语义强） | 写入 pgvector |
| **LLM 可观测** | Langfuse | prompt 版本、追踪、评估、成本监控——长期 AI 产品刚需 |
| **行情数据** | 统一 `MarketDataProvider` 接口；Crypto: 交易所 WS + CoinGecko；股票: Alpaca / Polygon | 多源可插拔；Alpaca paper API 还能直接复用到 `/trade` 模拟盘 |
| **认证** | Clerk 起步 | 高用户量无忧、组织 / MFA / 社交登录开箱；权限模型（RBAC）自建在 core |
| **Web 部署** | Vercel 起步，**守住可迁移性**（不滥用专有特性） | 成本 / 规模触发时容器化迁 Fly / AWS |
| **Worker / 移动构建** | Worker: Docker → Fly / Railway → ECS/K8s；Mobile: EAS Build | 沿 core 模块边界演进 |
| **对象存储** | S3 / R2 | 图表、截图、Frame 附件 |
| **可观测** | OpenTelemetry（第一天就上）+ Sentry + pino 结构化日志 | OTel 不锁死后端，将来接 Grafana / Datadog 不返工 |
| **产品分析** | PostHog（分析 + feature flag + 实验，可自托管） | |
| **测试** | Vitest + Testing Library + Playwright；结算 / 信誉逻辑重点覆盖 | 纯函数领域核心好测，是质量命门 |
| **工具链** | Biome（lint + format）+ GitHub Actions | 大 monorepo 下 Biome 比 ESLint + Prettier 快一个量级 |

---

## 5. 移动端策略：React Native + Expo

### 5.1 为什么 RN 是"体验最好 × 易维护"的唯一交点

- **体验最好** 单看会指向原生双栈（Swift + Kotlin），但原生双栈**违反**"易维护 / 易拓展 / 易迭代"：两套代码库、双倍迭代、与 web 完全割裂、改一个逻辑要在三处各写一遍。
- RN 新架构（Fabric + TurboModules + Hermes，2026 已成熟）对**信息 / 社交 / 轻金融工具型**产品能做到用户无感的原生级。实证：**Coinbase（交易 + 钱包）、Discord、Shopify、Bloomberg**。
- CueBook 是叙事卡 / Room / Frame / 价格线 / 模拟盘——**不在 RN 的短板区**（非游戏 / 非重 3D / 非 AR）。

### 5.2 体验投入清单（愿付的复杂度成本，花在刀刃上）

1. **强制新架构**（Fabric / Hermes），不碰老 Bridge 架构。
2. **动画 / 手势用 Reanimated + Gesture Handler**——跑在 UI 线程，60/120fps 原生级。
3. **深度平台能力写原生模块**（Expo Modules API）：推送、深链、生物识别、widget、分享扩展。
4. **认真做设计系统**——"体验最好"七成来自设计与打磨，而非框架选择。

### 5.3 迭代红利

- **Expo OTA 热更新**：JS 层改动不走应用商店审核直接推送。
- monorepo 一个 PR 改通两端，逻辑共享改一处两端生效。

### 5.4 唯一该改用原生双栈的触发条件

仅当体验标杆是**重度原生物理动效**（Apple 级手感）或**深度系统底层集成**。**CueBook 不在此档。** 若触发，则 API 层须从 tRPC 切到 REST + OpenAPI，且 web 端同步统一为 REST（不搞 tRPC + REST 双轨）。

---

## 6. 现在刻意"不做"的（是决策，不是遗漏）

| 不做 | 原因 | 将来做的触发条件 |
|---|---|---|
| 微服务 | 过早分布式 | 沿 core 模块边界，出现独立伸缩 / 异构需求时拆 |
| Kafka / Redpanda | 暂无真事件流需求 | 需要多消费者 / 事件回放 / 跨服务解耦 |
| Kubernetes | Worker 规模未到 | Worker 数量 / 编排复杂度上来后 |
| LangChain 类框架 | 黑盒抽象，长期是负债 | 不计划——自建轻 RAG |
| 独立向量库 | pgvector 能撑到很大 | embedding 量级 / 检索 QPS 成为瓶颈 |
| Prisma | 规模化复杂查询不如 Drizzle 贴近 SQL | 不计划 |

每一条将来要做时，接口都已预留，迁移不动业务逻辑。

---

## 7. 演进路线图（按规模触发，不按时间）

- **0 → 10k 用户**：Modular monolith on Vercel + Neon + pgvector + Inngest + Redis + Clerk。`apps/web` + `apps/worker` + `apps/mobile`。
- **10k → 100k**：加读副本、加厚 Redis 缓存、向量检索独立、行情 / AI 供给拆独立 worker、OTel 全链路铺满。
- **100k → 1M+**：沿 core 边界拆服务、Temporal 接管工作流、Kafka 事件流、ClickHouse OLAP、多区域 + K8s。

---

## 8. 关键决策记录（ADR 摘要）

| # | 决策 | 结论 | 关键理由 | 重新评估触发条件 |
|---|---|---|---|---|
| 1 | 全栈 vs 前后端分离 | 传输层全栈 + 逻辑层分离 | SSR/SEO 是刚需；两套 codebase 是启动期负债；解耦靠 core 而非物理拆分 | 出现第二个重客户端 / 异构后端团队 |
| 2 | 移动端技术 | React Native + Expo | "体验最好 × 易维护"唯一交点；一套 TS 延续 | 需重度原生动效 / 深系统集成 |
| 3 | API 协议 | tRPC 主干 + 预留 REST/OpenAPI | 一套类型贯穿 web + RN + 后端 | 改用原生移动端，或开放第三方 API |
| 4 | ORM | Drizzle | SQL-first，规模化查询调优可控 | 不计划更换 |
| 5 | 工作流引擎 | Inngest → Temporal | durable workflow 是结算 / 供给的正确抽象；起步重 DX，终态重控制 | 工作流复杂度 / 规模要求更强控制 |
| 6 | 主库 | PostgreSQL + event log | 审计 / 关系完整性 / 云中立 | 不计划更换（OLAP 另引 ClickHouse） |
| 7 | 架构形态 | Modular Monolith | 避免过早分布式，边界预留 | 沿模块边界按需拆服务 |

---

## 9. 一句话总纲

> **一套 TypeScript、Postgres 为脊椎、Modular Monolith 起步、领域核心与框架解耦、移动端 RN 共享逻辑 / 分离 UI、所有规模化瓶颈先抽象接口后实现。**

---

## 10. 开放项（依赖业务，非技术栈阻塞）

技术栈本身已可定稿落地。以下项依赖产品决策，待确认后会影响**应用层代码**（而非技术选型）：

- **`/trade` 记分内核**：倾向"模拟盘外壳 + 校准式（calibration）记分内核"——回流信誉的是失效点（invalidation）、时间窗、结算样本质量，而非盈亏金额。待确认。
- **结算规则**：结算的具体触发条件、时间窗定义、信誉计算公式属业务逻辑，待定；其技术形态（durable workflow + append-only event log）已定。
- **首发标的范围**：MVP 可从 Crypto 切入（结算最简单），但 `asset` 模型须抽象为（symbol + 类别 + venue），不写死单一资产类别。
