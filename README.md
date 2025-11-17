# Wish Wall 前端服务 (25-HACK-2-xueluocangyuan_wish_wall-FE) 🚀

2025 Hackweek 第2组「代码别和我作队」——雪落藏愿许愿墙 前端仓库

---

## 目录
- [Wish Wall 前端服务 (25-HACK-2-xueluocangyuan\_wish\_wall-FE) 🚀](#wish-wall-前端服务-25-hack-2-xueluocangyuan_wish_wall-fe-)
  - [目录](#目录)
  - [📝 项目简介](#-项目简介)
    - [✨ 核心功能](#-核心功能)
  - [📁 文件目录说明](#-文件目录说明)
  - [🧭 上手指南](#-上手指南)
    - [开发前的配置要求](#开发前的配置要求)
    - [安装与启动](#安装与启动)
    - [开发的架构](#开发的架构)
    - [部署](#部署)
  - [🔑 环境变量配置 (.env)](#-环境变量配置-env)
  - [🧪 运行测试](#-运行测试)
  - [📚 与后端交互说明](#-与后端交互说明)
  - [🛠️ 使用到的框架](#️-使用到的框架)
  - [📦 版本控制](#-版本控制)
  - [🎉 鸣谢](#-鸣谢)

---

## 📝 项目简介
本项目是雪落藏愿 (Wish Wall) 的前端 SPA（Vite + React + TypeScript）。负责呈现登录注册、愿望发布/浏览、点赞评论、个人资料等交互，并通过 Axios 与后端 API 通信。

### ✨ 核心功能
- 登录/注册（基于后端 JWT 鉴权流程）。
- 发布愿望（公开/私密）、查看公共流/个人愿望列表、删除自己的愿望。
- 点赞/取消点赞与评论。
- 个人资料与头像管理页面。
- 路由守卫（未登录跳转登录页）。

---

## 📁 文件目录说明
```
.
├── frontend/
│   ├── index.html                # 应用 HTML 入口
│   ├── package.json              # 前端脚本与依赖
│   ├── pnpm-lock.yaml
│   ├── tsconfig*.json
│   ├── vite.config.ts            # Vite 配置（含 /api 代理）
│   ├── .env                      # 前端环境变量（VITE_API_BASE_URL=/api）
│   └── src/
│       ├── main.tsx              # 应用入口（绑定 RouterProvider）
│       ├── App.tsx               # 根布局（Outlet 容器）
│       ├── router/index.tsx      # 路由定义与 ProtectedRoutes 守卫
│       ├── services/             # API 客户端与业务服务
│       │   ├── apiClient.ts      # 统一 axios 实例与拦截器
│       │   ├── authService.ts    # 登录/注册 API
│       │   └── wishService.ts    # 愿望/评论/点赞等 API（含规范化）
│       ├── store/userStore.ts    # Zustand 用户状态，持久化 token/user
│       ├── views/                # 页面组件（Login/Register/PublicFeed 等）
│       ├── components/           # 通用组件（Modal/Button/Sidebar 等）
│       └── styles/               # 全局与模块化样式
└── README.md                     # 本文件
```

---

## 🧭 上手指南
前后端分离。推荐使用后端提供的 Docker Compose 在本地启动后端，通过 Nginx 暴露 `http://localhost:80`，前端在开发环境通过 Vite 代理将 `/api` 请求转发至后端，避免浏览器 CORS 限制。

### 开发前的配置要求
- Node.js：建议 LTS（≥ 18）。
- 包管理器：pnpm（仓库包含 pnpm-lock.yaml），亦可使用 npm/yarn。
- 后端服务：可通过后端仓库的 `docker-compose up --build` 启动，默认 `http://localhost:80`。

### 安装与启动
```bash
cd frontend
pnpm install
pnpm dev
```
- 开发服务器默认运行在 `http://localhost:5175`。
- 代理：`/api` 将被代理到 `http://localhost:80`（详见 `vite.config.ts`）。

### 开发的架构
- 框架：React + React Router + TypeScript + Vite。
- 路由守卫：`router/index.tsx` 中的 `ProtectedRoutes` 基于 `useUserStore().token` 判断，未登录跳转 `/login`。
- 状态管理：`zustand`（`store/userStore.ts`），使用 `persist` 中间件将 `token` 与 `user` 存至 localStorage（键名 `auth`）。
- 网络层：统一使用 `services/apiClient.ts` 的 axios 实例：
	- 请求拦截器自动注入 `Authorization: Bearer <token>`（优先从 store 读取）。
	- 响应拦截器约定业务包装体 `{ code, msg, data }`，`code !== 200` 将以结构化错误 reject；`401` 自动跳转 `/login`。
- 字段规范化：后端字段名可能不稳定，`wishService.ts` 通过 `normalizeWish`、`extractWishArray`、评论规范化等方式统一为前端类型。

### 部署
```bash
cd frontend
pnpm build
```
- 构建产物位于 `frontend/dist`，可通过任意静态资源服务器（如 Nginx）部署。
- 生产环境请将前端 `.env` 的 `VITE_API_BASE_URL` 指向你的后端公开地址（例如 `https://your.domain/api`）。

---

## 🔑 环境变量配置 (.env)
`frontend/.env`

```env
VITE_API_BASE_URL=/api
```
- 开发：保持 `/api`，由 Vite 代理到 `http://localhost:80`（在 `vite.config.ts` 中配置）。
- 生产：可改为后端真实地址（例如 `https://your.domain/api`），并重新构建。
- 修改 `.env` 后需重启开发服务器。

---

## 🧪 运行测试
当前仓库未内置前端测试用例。可使用以下辅助命令保证质量：
```bash
pnpm run typecheck   # TypeScript 类型检查
pnpm run lint        # ESLint
```

---

## 📚 与后端交互说明
- 统一使用 `apiClient` 调用，返回值约定：

成功：
```json
{ "code": 200, "msg": "成功", "data": { /* 业务数据 */ } }
```

失败（示例）：
```json
{ "code": 4, "msg": "参数验证失败", "data": { "error": "详细错误" } }
```

- 主要接口（前端调用示例，具体以后端文档为准）：
	- POST `/api/login`、`/api/register`
	- GET `/api/wishes/public`、GET `/api/wishes/me`
	- POST `/api/wishes`、DELETE `/api/wishes/:id`
	- POST `/api/wishes/:id/like`
	- GET `/api/wishes/:id/interactions`、GET `/api/wishes/:id/comments`

---

## 🛠️ 使用到的框架
- React 19、React Router 7、TypeScript 5、Vite 7
- Axios（网络请求）
- Zustand（状态管理 + 持久化）
- Framer Motion / Motion utils（部分动效能力）

---

## 📦 版本控制
该项目使用 Git 管理代码，推荐通过分支提交流程进行协作（如 `feature/*`、`fix/*`）。

---

## 🎉 鸣谢
2025 Hackweek 第2组所有成员  
以及所有依赖库与工具的作者
