# CueBook

> **Before the trade, get the Cue.**
>
> 交易前认知网络——在交易之前发现并快速理解金融叙事，表达观点、模拟验证，并把结果沉淀为可结算的认知记忆。

## 产品闭环

`/bet` 发现叙事 → 进入 **Narrative Room** → `/frame` 表达观点 · `/trade` 模拟验证 → **结算** 沉淀为可累积的认知记忆。

- **/bet** — AI 持续供给有来源的叙事卡，发现最新、可解释、值得追的市场故事
- **Narrative Room** — 可分享 / 可理解 / 可追踪 / 可验证的市场认知对象，是所有动作的中枢
- **/frame** — 把观点、图表、交易想法、资产线索做成可传播的叙事卡
- **/trade** — 低压力模拟验证（看多 / 看空 / 失效点），把"看懂了"推进到"愿意验证"
- **结算记忆** — 价格 / 事件 / 时间窗回流信誉与排序

## 技术栈速览

单一 **TypeScript** 全栈 · **Modular Monolith** 起步 · **Next.js** (web) + **Expo / React Native** (mobile) 共享逻辑 / 分离 UI · **PostgreSQL** 为脊椎 · 领域核心与框架解耦。

> 完整定稿、选型理由（ADR）与演进路线见 **[`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md)**。

## 仓库结构

```
apps/
  web/          Next.js (App Router) — web 前端 + BFF
  mobile/       Expo / React Native — 移动端
  worker/       后台长时任务（AI 供给管道 / 行情订阅 / 结算监控）
packages/
  core/         领域逻辑：结算 / 信誉 / Room 聚合（零框架依赖）
  api/          tRPC router + 端到端类型
  db/           Drizzle schema + migration
  ai/           Claude 调用封装 / RAG
  market-data/  统一行情接口（多源可插拔）
  config/       共享配置 / 环境变量 schema
docs/           架构与设计文档
```

## 开发

> **当前状态**：技术栈已定稿，monorepo 脚手架尚未搭建。以下命令将在骨架就绪后可用。

前置要求：Node 20+（LTS）、pnpm 9+

```bash
pnpm install      # 安装依赖
pnpm dev          # 启动 web + worker（Turborepo）
```

环境变量见 `.env.example`（待补充）。

## 文档

- [技术栈与架构定稿](docs/architecture/tech-stack.md) — 选型、理由、ADR、演进路线

---

本仓库为私有项目。
