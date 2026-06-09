# @cuebook/mobile （占位 — 阶段二初始化）

移动端在结构上已规划，但**暂不初始化**——近期不开发，避免引入大量暂用不上的 Expo 依赖。
选型已定（见 [tech-stack §5](../../docs/architecture/tech-stack.md)），位置已预留。

## 选型（已定）

- **Expo + React Native**（新架构 Fabric + Hermes）
- **Expo Router**（file-based，与 Next App Router 心智一致）
- 复用 `@cuebook/api`（tRPC client）、`@cuebook/core`、`@cuebook/config`
- 动画：Reanimated + Gesture Handler
- 构建：EAS Build；热更新：EAS Update（OTA）

## 原则：逻辑共享 / UI 分离

只共享 `core` / `api` / `config`，**不与 web 共享 UI**——各平台 UI 各自做到原生最优。

## 阶段二初始化

```bash
# 在 apps/ 下
pnpm create expo-app mobile
# 接入 workspace 包，配置 tRPC client 指向 web 的 /api/trpc
```
