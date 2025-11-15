# 快速部署指南

## 🚀 一键部署

### Frontend 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. 点击上面的按钮
2. 选择 `frontend` 作为根目录
3. 添加环境变量（见下方）
4. 点击 Deploy

### Backend 部署到 Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. 点击上面的按钮
2. 选择 `backend` 目录
3. 添加环境变量（见下方）
4. 点击 Deploy

---

## 📋 环境变量清单

### Frontend (.env.local)

```bash
# Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=your_package_id_here

# API
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Backend (.env)

```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Firebase Admin
FIREBASE_CREDENTIALS={"type":"service_account",...}

# Redis (可选)
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false
```

---

## 🎯 推荐部署方案

### 方案 A: 全 Vercel（简单但有限制）

```
Frontend: Vercel ✅
Backend: Vercel Serverless ⚠️ (有10秒超时限制)
```

**适合**: 简单 API，快速原型

### 方案 B: Vercel + Railway（推荐）

```
Frontend: Vercel ✅
Backend: Railway ✅
Redis: Railway 内置 ✅
```

**适合**: 生产环境，完整功能

### 方案 C: Vercel + Render

```
Frontend: Vercel ✅
Backend: Render ✅
Redis: 外部服务（Upstash）
```

**适合**: 预算有限，稳定运行

---

## 📝 部署步骤

### Step 1: 准备代码

```bash
# 确保代码已推送到 Git
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: 部署 Frontend

```bash
# 方法 1: Vercel CLI
cd frontend
vercel

# 方法 2: Vercel Dashboard
# 访问 https://vercel.com/new
# 导入仓库，选择 frontend 目录
```

### Step 3: 部署 Backend

#### 使用 Railway:

```bash
# 方法 1: Railway CLI
cd backend
railway login
railway init
railway up

# 方法 2: Railway Dashboard
# 访问 https://railway.app/new
# 导入仓库，选择 backend 目录
```

#### 使用 Render:

```bash
# 访问 https://render.com/new
# 选择 Web Service
# 连接仓库，选择 backend 目录
# 配置构建和启动命令
```

### Step 4: 配置环境变量

在各自的 Dashboard 中添加环境变量

### Step 5: 更新 API URL

在 Frontend 的环境变量中更新 `NEXT_PUBLIC_API_URL` 为 Backend 的实际 URL

### Step 6: 测试

```bash
# 测试 Frontend
curl https://your-app.vercel.app

# 测试 Backend
curl https://your-backend.railway.app/health

# 测试 API 连接
curl https://your-backend.railway.app/api/pokemon/1
```

---

## 🔧 故障排查

### Frontend 构建失败

```bash
# 检查 Node 版本
node --version  # 应该是 18.x 或更高

# 本地测试构建
cd frontend
npm run build
```

### Backend 启动失败

```bash
# 检查 Python 版本
python --version  # 应该是 3.11 或更高

# 本地测试
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### CORS 错误

在 Backend 的 `config/settings.py` 中添加 Frontend 域名：

```python
CORS_ORIGINS = [
    "https://your-app.vercel.app",
    "http://localhost:3000"
]
```

### 环境变量未生效

1. 检查变量名是否正确
2. 重新部署应用
3. 检查日志确认变量已加载

---

## 💰 成本估算

| 服务 | 免费额度 | 付费计划 |
|------|---------|---------|
| Vercel | 100GB 带宽/月 | $20/月起 |
| Railway | $5 试用额度 | $5/月起 |
| Render | 750 小时/月 | $7/月起 |
| Upstash Redis | 10K 命令/天 | $0.2/100K 命令 |

**最低成本**: $0/月（使用所有免费 tier）
**推荐配置**: $5-10/月（稳定生产环境）

---

## 📚 相关文档

- [Vercel 文档](https://vercel.com/docs)
- [Railway 文档](https://docs.railway.app)
- [Render 文档](https://render.com/docs)
- [Next.js 部署](https://nextjs.org/docs/deployment)
- [FastAPI 部署](https://fastapi.tiangolo.com/deployment/)

---

## ✅ 部署检查清单

- [ ] 代码推送到 Git 仓库
- [ ] Frontend 环境变量配置完成
- [ ] Backend 环境变量配置完成
- [ ] Frontend 部署成功
- [ ] Backend 部署成功
- [ ] API 连接测试通过
- [ ] 钱包连接功能正常
- [ ] Firebase 连接正常
- [ ] 所有页面可访问
- [ ] 生产环境测试完成

---

## 🆘 需要帮助？

如果遇到问题：

1. 检查部署日志
2. 查看浏览器控制台
3. 测试 API 端点
4. 验证环境变量
5. 查阅相关文档

祝部署顺利！🎉
