# 🚂 Railway 快速部署（5分钟）

## 第一步：创建项目

1. 访问 https://railway.app
2. 点击 "Start a New Project"
3. 选择 "Deploy from GitHub repo"
4. 授权并选择你的仓库

## 第二步：配置项目

### 设置根目录
```
Settings → Root Directory → backend
```

### 设置启动命令（自动检测，无需手动设置）
Railway 会自动使用 `Procfile` 或 `nixpacks.toml`

## 第三步：添加环境变量

点击 "Variables" 标签，添加以下变量：

### 必需变量
```bash
GEMINI_API_KEY=你的Gemini API密钥
```

### Firebase 配置（两种方式选一种）

**方式 1: 使用 JSON 字符串（推荐）**
```bash
FIREBASE_CREDENTIALS={"type":"service_account","project_id":"..."}
```

**方式 2: 使用文件路径**
```bash
FIREBASE_SERVICE_ACCOUNT_PATH=serviceAccountKey.json
```
然后上传 `serviceAccountKey.json` 文件到项目

### 可选变量
```bash
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
DEBUG=false
```

## 第四步：添加 Redis（推荐）

1. 点击 "New" → "Database" → "Add Redis"
2. Railway 自动设置 `REDIS_URL`
3. 无需额外配置

## 第五步：部署

点击 "Deploy" 或推送代码到 Git，Railway 会自动部署。

## 第六步：获取 URL

部署成功后：
1. 点击 "Settings" → "Domains"
2. 点击 "Generate Domain"
3. 获得类似 `https://your-app.railway.app` 的 URL

## 第七步：测试

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

## 🎉 完成！

你的 Backend 现在已经在 Railway 上运行了！

---

## 常见错误及解决方案

### ❌ "Application failed to respond"

**原因**: 应用没有监听正确的端口

**解决**: 已修复，应用会自动使用 `$PORT` 环境变量

### ❌ "Build failed"

**原因**: 依赖安装失败

**解决**: 
1. 检查 `requirements.txt` 是否存在
2. 查看 Build Logs 找到具体错误
3. 确保 Python 版本兼容（3.11+）

### ❌ "Redis connection failed"

**原因**: Redis 未配置

**解决**: 
1. 添加 Railway Redis 插件
2. 或者应用会自动降级运行（无缓存）

### ❌ "CORS error"

**原因**: Frontend 域名未在白名单

**解决**: 
在环境变量中添加：
```bash
CORS_ORIGINS=https://your-frontend.vercel.app
```

---

## 下一步

1. ✅ Backend 部署完成
2. 📝 记录你的 Railway URL
3. 🚀 部署 Frontend 到 Vercel
4. 🔗 在 Frontend 中配置 `NEXT_PUBLIC_API_URL`
5. 🧪 测试完整应用

---

## 需要帮助？

- 📖 查看完整指南: `RAILWAY_DEPLOYMENT.md`
- 🧪 运行测试脚本: `python test_deployment.py <your-url>`
- 💬 Railway Discord: https://discord.gg/railway
