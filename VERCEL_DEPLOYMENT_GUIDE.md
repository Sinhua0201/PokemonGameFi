# Vercel 部署指南

## 项目架构

这个项目使用 **Monorepo** 结构，包含：
- **Frontend**: Next.js 应用 (在 `frontend/` 目录)
- **Backend**: FastAPI 应用 (在 `backend/` 目录)

## Vercel 部署限制

### ⚠️ 重要限制

1. **执行时间限制**
   - Hobby Plan: 10 秒
   - Pro Plan: 60 秒
   - 超时的请求会被终止

2. **Redis 不支持**
   - Vercel Serverless Functions 是无状态的
   - 需要使用外部 Redis 服务（如 Upstash Redis）

3. **冷启动**
   - 函数可能有 1-3 秒的冷启动时间
   - 频繁访问可以保持"热"状态

## 部署方案

### 方案 1: Vercel Monorepo（当前配置）

**优点:**
- 单一部署
- 统一域名
- 简单配置

**缺点:**
- Backend 有时间限制
- Redis 需要外部服务
- Python 依赖可能较大

### 方案 2: 分离部署（推荐）

**Frontend → Vercel**
- 完美支持 Next.js
- 全球 CDN
- 自动 HTTPS

**Backend → Railway / Render / Fly.io**
- 无时间限制
- 支持 Redis
- 更好的 Python 环境

## Vercel 部署步骤

### 1. 准备工作

确保你有：
- Vercel 账号
- GitHub/GitLab/Bitbucket 仓库
- 环境变量准备好

### 2. 配置环境变量

在 Vercel Dashboard 中设置以下环境变量：

#### Frontend 环境变量
```
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=your_package_id
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Backend 环境变量
```
GEMINI_API_KEY=your_gemini_key
FIREBASE_CREDENTIALS=your_firebase_credentials_json
REDIS_URL=your_upstash_redis_url (如果使用 Redis)
CORS_ORIGINS=https://your-domain.vercel.app
```

### 3. 部署到 Vercel

#### 方法 A: 通过 Vercel Dashboard

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入你的 Git 仓库
4. Vercel 会自动检测 Next.js 项目
5. 配置：
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. 添加环境变量
7. 点击 "Deploy"

#### 方法 B: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

### 4. 配置自定义域名（可选）

1. 在 Vercel Dashboard 中进入项目设置
2. 点击 "Domains"
3. 添加你的域名
4. 按照指示配置 DNS

## Backend 替代方案

### 使用 Railway（推荐）

Railway 更适合 Python FastAPI 应用：

1. 访问 [Railway.app](https://railway.app)
2. 连接 GitHub 仓库
3. 选择 `backend` 目录
4. Railway 自动检测 Python 项目
5. 添加环境变量
6. 部署

**优点:**
- 支持长时间运行
- 内置 Redis
- 更好的 Python 支持
- 免费 tier: $5/月额度

### 使用 Render

1. 访问 [Render.com](https://render.com)
2. 创建新的 Web Service
3. 连接仓库，选择 `backend` 目录
4. 配置：
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. 添加环境变量
6. 部署

**优点:**
- 免费 tier 可用
- 自动 HTTPS
- 支持 Redis（付费）

## 推荐架构

```
┌─────────────────────────────────────────┐
│         Frontend (Vercel)               │
│  - Next.js                              │
│  - Global CDN                           │
│  - Auto HTTPS                           │
│  - https://your-game.vercel.app         │
└─────────────┬───────────────────────────┘
              │
              │ API Calls
              │
┌─────────────▼───────────────────────────┐
│      Backend (Railway/Render)           │
│  - FastAPI                              │
│  - Redis                                │
│  - Long-running tasks                   │
│  - https://api.your-game.com            │
└─────────────────────────────────────────┘
```

## 测试部署

部署后测试以下端点：

```bash
# Frontend
curl https://your-domain.vercel.app

# Backend Health Check
curl https://your-domain.vercel.app/api/health

# Backend API
curl https://your-domain.vercel.app/api/pokemon/1
```

## 故障排查

### 问题 1: Backend 超时
**解决方案**: 将 Backend 迁移到 Railway 或 Render

### 问题 2: Redis 连接失败
**解决方案**: 使用 Upstash Redis 或移除 Redis 依赖

### 问题 3: 构建失败
**解决方案**: 检查 `vercel.json` 配置和环境变量

### 问题 4: CORS 错误
**解决方案**: 在 Backend 的 CORS 设置中添加 Vercel 域名

## 成本估算

### Vercel (Frontend)
- **Hobby Plan**: 免费
  - 100 GB 带宽/月
  - 无限部署
  - 自动 HTTPS

### Railway (Backend)
- **Free Trial**: $5 额度
- **Developer Plan**: $5/月起
  - 包含 Redis
  - 无时间限制

### 总成本
- **最低**: $0/月（使用免费 tier）
- **推荐**: $5-10/月（稳定运行）

## 下一步

1. ✅ 创建 Vercel 账号
2. ✅ 推送代码到 Git 仓库
3. ✅ 配置环境变量
4. ✅ 部署 Frontend 到 Vercel
5. ✅ 部署 Backend 到 Railway/Render
6. ✅ 更新 Frontend 的 API URL
7. ✅ 测试所有功能

## 需要帮助？

如果遇到问题，检查：
- Vercel 部署日志
- Backend 服务日志
- 浏览器控制台错误
- 网络请求（DevTools Network tab）
