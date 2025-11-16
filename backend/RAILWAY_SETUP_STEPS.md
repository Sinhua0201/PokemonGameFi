# 🚂 Railway 部署 - 详细步骤（解决 "could not determine how to build" 错误）

## ⚠️ 你遇到的错误

```
✖ Railpack could not determine how to build the app.
```

**原因**: Railway 从项目根目录扫描，没有找到 Python 项目的标识文件。

## ✅ 解决方案（3种方法）

---

## 方法 1: 设置 Root Directory（最简单，推荐）

### 步骤：

1. **在 Railway Dashboard 中创建项目**
   - 访问 https://railway.app
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

2. **设置 Root Directory**
   - 部署后，点击你的服务
   - 进入 "Settings" 标签
   - 找到 "Root Directory" 设置
   - 输入: `backend`
   - 点击 "Save"

3. **重新部署**
   - 点击 "Deployments" 标签
   - 点击 "Redeploy" 或推送新代码

4. **Railway 现在会检测到**:
   ```
   backend/
   ├── main.py          ✅ Python 应用
   ├── requirements.txt ✅ Python 依赖
   ├── Procfile         ✅ 启动命令
   └── nixpacks.toml    ✅ 构建配置
   ```

---

## 方法 2: 使用 Railway CLI（推荐给开发者）

### 安装 Railway CLI

**Windows (PowerShell):**
```powershell
iwr https://railway.app/install.ps1 | iex
```

**Mac/Linux:**
```bash
curl -fsSL https://railway.app/install.sh | sh
```

### 部署步骤

```bash
# 1. 登录 Railway
railway login

# 2. 进入 backend 目录
cd backend

# 3. 初始化项目
railway init

# 4. 链接到现有项目（如果已创建）或创建新项目
railway link

# 5. 部署
railway up

# 6. 查看日志
railway logs

# 7. 获取 URL
railway domain
```

---

## 方法 3: 创建单独的 Backend 仓库

如果你想要完全独立的部署：

### 步骤：

1. **创建新的 Git 仓库（只包含 backend）**
   ```bash
   # 创建新目录
   mkdir pokechain-backend
   cd pokechain-backend
   
   # 复制 backend 内容
   cp -r ../your-project/backend/* .
   
   # 初始化 Git
   git init
   git add .
   git commit -m "Initial backend commit"
   
   # 推送到 GitHub
   git remote add origin https://github.com/your-username/pokechain-backend.git
   git push -u origin main
   ```

2. **在 Railway 部署新仓库**
   - Railway 会自动检测 Python 项目
   - 无需设置 Root Directory

---

## 🔍 验证配置

### 检查 backend 目录是否有这些文件：

```bash
cd backend
ls -la
```

应该看到：
- ✅ `main.py` - FastAPI 应用入口
- ✅ `requirements.txt` - Python 依赖
- ✅ `Procfile` - 启动命令
- ✅ `nixpacks.toml` - 构建配置

### 测试本地构建

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动应用
uvicorn main:app --host 0.0.0.0 --port 8000

# 测试
curl http://localhost:8000/health
```

如果本地可以运行，Railway 也应该可以。

---

## 📋 Railway 环境变量设置

在 Railway Dashboard → Variables 中添加：

### 必需变量
```bash
GEMINI_API_KEY=your_gemini_api_key
```

### Firebase 配置
```bash
FIREBASE_CREDENTIALS={"type":"service_account","project_id":"your-project",...}
```

### 可选变量
```bash
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
DEBUG=false
PORT=8000
```

---

## 🧪 部署后测试

```bash
# 获取你的 Railway URL（在 Settings → Domains）
RAILWAY_URL="https://your-app.railway.app"

# 测试健康检查
curl $RAILWAY_URL/health

# 应该返回
{
  "status": "healthy",
  "redis": "connected"  # 或 "disconnected" 如果没有 Redis
}
```

---

## 🐛 常见问题

### 问题 1: "No module named 'fastapi'"

**原因**: requirements.txt 未正确安装

**解决**:
1. 检查 `requirements.txt` 是否在 backend 目录
2. 查看 Railway Build Logs
3. 确保 Root Directory 设置为 `backend`

### 问题 2: "Application failed to respond"

**原因**: 应用未监听正确的端口

**解决**: 已在 `config/settings.py` 中修复
```python
PORT: int = int(os.getenv("PORT", "8000"))
```

### 问题 3: "Build succeeded but deploy failed"

**原因**: 启动命令错误

**解决**: 检查 `Procfile` 内容
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 问题 4: 仍然显示 "could not determine how to build"

**解决步骤**:
1. 确认 Root Directory 设置为 `backend`
2. 确认 `backend/requirements.txt` 存在
3. 尝试手动触发重新部署
4. 或使用 Railway CLI 从 backend 目录部署

---

## 📸 截图指南

### 设置 Root Directory:

1. Railway Dashboard → 选择你的服务
2. Settings 标签
3. 找到 "Root Directory"
4. 输入: `backend`
5. 点击 "Save"

### 查看构建日志:

1. Deployments 标签
2. 点击最新的部署
3. 查看 "Build Logs" 和 "Deploy Logs"

---

## ✅ 成功标志

部署成功后，你应该看到：

**Build Logs:**
```
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

## 🎯 推荐流程

1. ✅ 使用方法 1（设置 Root Directory）
2. ✅ 添加环境变量
3. ✅ 添加 Redis 插件（可选）
4. ✅ 重新部署
5. ✅ 测试健康检查
6. ✅ 记录 Railway URL
7. ✅ 更新 Frontend 的 API URL

---

## 需要更多帮助？

- 📖 查看 Railway 文档: https://docs.railway.app
- 💬 Railway Discord: https://discord.gg/railway
- 🐛 检查 GitHub Issues: https://github.com/railwayapp/nixpacks/issues

祝部署顺利！🚀
