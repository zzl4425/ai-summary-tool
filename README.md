# AI文本总结工具
> 全栈Web应用，调用大模型API，对输入长文本自动生成精简总结，支持后续文本标记功能。

## 项目功能
1. 文本AI总结：输入长段落，调用AI接口生成逻辑通顺的摘要
2. 前端页面支持亮色/暗色主题切换
3. 预留扩展：账号登录、历史记录、文本高亮标记（加粗/标红/下划线）

## 技术栈
前端：Vue3 + Vite
后端：Node.js + Express
AI接口：智谱大模型API

## 项目运行
### 1. 后端启动
```bash
cd backend
npm install
# 在backend新建.env，填入API_KEY
node src/server.js

