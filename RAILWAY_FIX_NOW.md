# 🚨 立即修复 Railway 部署错误

## 你看到的错误：
```
pip: command not found
```

## 🎯 原因
Railway 正在从**项目根目录**构建，而不是 `backend/` 目录。

## ✅ 立即修复（3个步骤）

### 步骤 1: 在 Railway Dashboard 设置 Root Directory

1. 打开 Railway Dashboard: https://railway.app/dashboard
2. 选择你的项目
3. 点击你的服务（service）
4. 点击 **"Settings"** 标签
5. 向下滚动找到 **"Root Directory"**
6. 在输入框中输入: `backend`
7. 点击 **"Save"** 或 **"Update"**

### 步骤 2: 重新部署

1. 点击 **"Deployments"** 标签
2. 点击右上角的 **"Redeploy"** 按钮
3. 或者推送新代码触发自动部署

### 步骤 3: 等待构建完成

现在 Railway 会：
- ✅ 从 `backend/` 目录开始
- ✅ 找到 `requirements.txt`
- ✅ 安装 Python 依赖
- ✅ 启动应用

---

## 📸 截图参考

### 找到 Root Directory 设置：

```
Railway Dashboard
  └── Your Project
      └── Your Service
          └── Settings (标签)
              └── Service Settings
                  └── Root Directory: [backend] ← 在这里输入
                      └── [Save] ← 点击保存
```

---

## 🧪 验证部署成功

部署完成后（大约 2-3 分钟），测试：

```bash
# 替换为你的 Railway URL
curl https://your-app.railway.app/health
```

应该返回：
```json
{
  "status": "healthy",
  "redis": "connected"
}
```

---

## ❌ 如果还是失败

### 检查清单：

1. **Root Directory 是否设置？**
   - Settings → Root Directory → 应该显示 `backend`

2. **是否保存了设置？**
   - 点击 Save 后应该看到确认消息

3. **是否重新部署？**
   - Deployments → Redeploy

4. **查看构建日志**
   - Deployments → 点击最新部署 → 查看 Logs
   - 应该看到: `Installing dependencies from requirements.txt`

---

## 🔄 替代方案：使用 Railway CLI

如果 Dashboard 方法不行，试试 CLI：

```bash
# 1. 安装 Railway CLI (Windows PowerShell)
iwr https://railway.app/install.ps1 | iex

# 2. 登录
railway login

# 3. 进入 backend 目录
cd backend

# 4. 链接项目（如果已创建）
railway link

# 5. 部署
railway up
```

---

## 📋 必需的环境变量

别忘了在 Railway Variables 中添加：

```bash
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_CREDENTIALS={"type":"service_account",...}
CORS_ORIGINS=https://your-frontend.vercel.app
```

---

## 🆘 还是不行？

### 最后的方法：创建独立的 Backend 仓库

```bash
# 1. 创建新目录
mkdir pokechain-backend
cd pokechain-backend

# 2. 复制 backend 内容
cp -r ../your-project/backend/* .

# 3. 初始化 Git
git init
git add .
git commit -m "Backend only"

# 4. 推送到 GitHub
# 创建新仓库: https://github.com/new
git remote add origin https://github.com/your-username/pokechain-backend.git
git push -u origin main

# 5. 在 Railway 部署新仓库
# Railway 会自动检测 Python 项目
```

---

## ✅ 成功标志

当部署成功时，你会看到：

**Build Logs:**
```
✅ Detected Python project
✅ Installing dependencies from requirements.txt
✅ Build complete
```

**Deploy Logs:**
```
✅ Application startup complete
✅ Uvicorn running on http://0.0.0.0:$PORT
```

**Health Check:**
```bash
curl https://your-app.railway.app/health
# 返回 200 OK
```

---

## 📞 需要帮助？

1. 查看详细指南: `backend/RAILWAY_SETUP_STEPS.md`
2. Railway 文档: https://docs.railway.app
3. Railway Discord: https://discord.gg/railway

---

## 🎉 成功后

1. ✅ 记录你的 Railway URL
2. ✅ 部署 Frontend 到 Vercel
3. ✅ 更新 `NEXT_PUBLIC_API_URL`
4. ✅ 测试完整应用

祝好运！🚀
