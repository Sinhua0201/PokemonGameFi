# Railway 部署指南

## 🚂 快速部署步骤

### 1. 准备工作

确保你的代码已推送到 Git 仓库（GitHub/GitLab/Bitbucket）

### 2. 创建 Railway 项目

1. 访问 [Railway.app](https://railway.app)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. Railway 会自动检测 Python 项目

### 3. 配置根目录

如果 Railway 没有自动检测到 backend 目录：

1. 在项目设置中找到 "Root Directory"
2. 设置为 `backend`
3. 保存

### 4. 配置环境变量

在 Railway Dashboard 的 "Variables" 标签中添加：

```bash
# 必需的环境变量
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_CREDENTIALS={"type":"service_account",...}

# 可选的环境变量
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
DEBUG=false

# Redis (如果使用 Railway Redis 插件)
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### 5. 添加 Redis（可选但推荐）

1. 在项目中点击 "New"
2. 选择 "Database" → "Redis"
3. Railway 会自动设置 `REDIS_URL` 环境变量
4. 重新部署应用

### 6. 部署

Railway 会自动部署。你可以在 "Deployments" 标签查看进度。

---

## 🔧 常见问题排查

### 问题 1: 部署失败 - "No module named 'xxx'"

**原因**: 依赖安装失败

**解决方案**:
```bash
# 检查 requirements.txt 是否在 backend 目录
ls backend/requirements.txt

# 确保所有依赖都列出
cat backend/requirements.txt
```

### 问题 2: 应用启动失败 - "Port already in use"

**原因**: 没有使用 Railway 的 PORT 环境变量

**解决方案**: 已在 `config/settings.py` 中修复
```python
PORT: int = int(os.getenv("PORT", "8000"))
```

### 问题 3: Redis 连接失败

**原因**: Redis 未配置或连接信息错误

**解决方案**:
1. 添加 Railway Redis 插件
2. 或者在环境变量中设置 `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
3. 或者应用会自动降级运行（无缓存）

### 问题 4: CORS 错误

**原因**: Frontend 域名未添加到 CORS 白名单

**解决方案**:
在 Railway 环境变量中设置：
```bash
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

### 问题 5: Firebase 认证失败

**原因**: Firebase credentials 未正确配置

**解决方案**:
1. 将整个 Firebase service account JSON 作为字符串添加到 `FIREBASE_CREDENTIALS`
2. 或者上传 `serviceAccountKey.json` 文件并设置路径

### 问题 6: 健康检查失败

**原因**: `/health` 端点无法访问

**解决方案**:
测试健康检查端点：
```bash
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

## 📋 部署检查清单

- [ ] 代码已推送到 Git 仓库
- [ ] Railway 项目已创建
- [ ] Root Directory 设置为 `backend`
- [ ] 所有必需的环境变量已添加
- [ ] Redis 插件已添加（可选）
- [ ] 部署成功（绿色勾号）
- [ ] 健康检查通过
- [ ] API 端点可访问

---

## 🧪 测试部署

部署成功后，测试以下端点：

```bash
# 获取你的 Railway URL
RAILWAY_URL="https://your-app.railway.app"

# 测试根端点
curl $RAILWAY_URL/

# 测试健康检查
curl $RAILWAY_URL/health

# 测试 Pokemon API
curl $RAILWAY_URL/api/pokemon/1

# 测试 AI 端点
curl -X POST $RAILWAY_URL/api/ai/generate-dialogue \
  -H "Content-Type: application/json" \
  -d '{"pokemon_species": "pikachu", "context": "greeting"}'
```

---

## 📊 查看日志

在 Railway Dashboard 中：
1. 点击你的服务
2. 选择 "Deployments" 标签
3. 点击最新的部署
4. 查看 "Build Logs" 和 "Deploy Logs"

常见日志信息：
```
✅ Redis connected          # Redis 连接成功
⚠️ Running without Redis    # Redis 未配置，使用降级模式
✅ Application startup complete
```

---

## 🔄 重新部署

如果需要重新部署：

### 方法 1: 推送代码
```bash
git add .
git commit -m "Update backend"
git push
```
Railway 会自动检测并重新部署

### 方法 2: 手动触发
在 Railway Dashboard 中点击 "Deploy" 按钮

### 方法 3: 使用 Railway CLI
```bash
railway up
```

---

## 🌐 自定义域名

1. 在 Railway Dashboard 中选择你的服务
2. 点击 "Settings" 标签
3. 找到 "Domains" 部分
4. 点击 "Generate Domain" 获取免费的 `.railway.app` 域名
5. 或者添加自定义域名

---

## 💰 成本

Railway 定价：
- **Trial**: $5 免费额度
- **Developer**: $5/月起
- **Team**: $20/月起

免费额度包括：
- 500 小时执行时间
- 100 GB 出站流量
- 8 GB RAM
- 8 vCPU

---

## 🔐 环境变量最佳实践

### 不要在代码中硬编码敏感信息

❌ 错误：
```python
GEMINI_API_KEY = "AIzaSy..."
```

✅ 正确：
```python
GEMINI_API_KEY: str  # 从环境变量读取
```

### 使用 .env.example 作为模板

创建 `.env.example` 文件：
```bash
GEMINI_API_KEY=your_key_here
FIREBASE_CREDENTIALS=your_credentials_here
CORS_ORIGINS=https://your-frontend.com
```

### 在 Railway 中设置环境变量

1. 复制 `.env.example` 的内容
2. 在 Railway Dashboard 中逐个添加
3. 填入实际的值

---

## 📞 获取帮助

如果遇到问题：

1. **查看日志**: Railway Dashboard → Deployments → Logs
2. **检查环境变量**: Settings → Variables
3. **测试本地**: 确保本地可以运行
4. **Railway 文档**: https://docs.railway.app
5. **Railway Discord**: https://discord.gg/railway

---

## ✅ 成功部署后

你的 Backend API 现在应该可以通过以下 URL 访问：
```
https://your-app.railway.app
```

记得更新 Frontend 的 `NEXT_PUBLIC_API_URL` 环境变量！

---

## 🎉 下一步

1. 部署 Frontend 到 Vercel
2. 更新 Frontend 的 API URL
3. 测试完整的应用流程
4. 配置自定义域名（可选）
5. 设置监控和告警（可选）

祝部署顺利！🚀
