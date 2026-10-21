# AI 文本摘要工具

一个全栈 Web 应用：在页面粘贴长文本，调用大模型接口生成精简摘要。前端提供加载状态、空文本校验和 API 失败提示，适配手机和电脑。

## 项目介绍
基于Vite + React + Node.js 的全栈AI文本摘要工具。
用户粘贴长文本，调用智谱大模型API一键生成精简摘要；所有历史数据保存在浏览器LocalStorage，无需数据库。
支持：明暗主题切换、历史记录保存与回填、摘要文本标红高亮、单条摘要备注、前端输入校验。

## 技术栈

- 前端：React + Vite，JSX，useState / useEffect，LocalStorage本地持久化
- 后端：Node.js + Express
- 大模型：OpenAI 兼容 Chat Completions API（可通过环境变量切换官方或第三方兼容服务）

## 项目结构

```text
ai-text-summarizer/
├── frontend/          # React + Vite 前端
├── backend/           # Express 后端
├── package.json       # 根目录一键启动脚本
└── README.md
```

## 环境变量配置

密钥只放在环境变量中，不要写进代码。

### 后端 `backend/.env`

先复制示例文件：

```bash
copy backend\.env.example backend\.env
```

macOS / Linux：

```bash
cp backend/.env.example backend/.env
```

| 变量 | 说明 |
| --- | --- |
| `OPENAI_API_KEY` | 大模型 API 密钥（必填） |
| `OPENAI_BASE_URL` | 接口地址，默认 `https://api.openai.com/v1`。兼容服务填其 `/v1` 地址 |
| `OPENAI_MODEL` | 模型名，默认 `gpt-4o-mini` |
| `PORT` | 后端端口，默认 `3001` |
| `FRONTEND_ORIGIN` | 允许跨域的前端地址，本地可用 `http://localhost:5173` |

### 前端 `frontend/.env`

本地开发可留空。Vite 已把 `/api` 代理到 `http://localhost:3001`。

部署到 Vercel 时设置：

```env
VITE_API_BASE_URL=https://your-backend.vercel.app
```

## 本地启动

需要 Node.js 18+（内置 `fetch`）。
需前后端同时启动
### 1. 前端启动
```bash
cd frontend
# 安装依赖（首次运行执行一次）
npm install
# 启动前端开发服务
npm run dev
2. 后端启动
新开一个终端窗口
bash
# 进入后端目录
cd backend
# 安装依赖（首次运行执行一次）
npm install
# 启动后端服务
node server.js
```
然后打开 [http://localhost:5173](http://localhost:5173)。

前端：`http://localhost:5173`  
后端：`http://127.0.0.1:3001`  
总结接口：`POST /api/summarize`，请求体 `{ "text": "需要总结的长文本" }`。

## 部署到 Vercel

建议前后端分成两个 Vercel 项目。

### 1. 部署后端

1. 把仓库推送到 GitHub / GitLab / Bitbucket。
2. 在 [Vercel](https://vercel.com) 导入该仓库。
3. Root Directory 选择 `backend`。
4. 框架预设可保持 Other。
5. 添加环境变量：`OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`、`FRONTEND_ORIGIN`。
   - `FRONTEND_ORIGIN` 填前端上线域名，例如 `https://your-frontend.vercel.app`。
6. 部署完成后记下后端地址，例如 `https://ai-text-summarizer-backend.vercel.app`。

### 2. 部署前端

1. 再导入一次同一仓库，Root Directory 选择 `frontend`。
2. 构建命令：`npm run build`，输出目录：`dist`。
3. 添加环境变量 `VITE_API_BASE_URL`，值为上一步的后端地址（不要末尾斜杠）。
4. 部署完成后，把该前端域名补进后端的 `FRONTEND_ORIGIN`，再重新部署后端。

### 3. 验证

打开前端站点，粘贴一段文本，点击「生成总结」。如果接口失败，页面会显示后端返回的错误信息。
