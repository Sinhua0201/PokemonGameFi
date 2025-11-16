# 🚨 Railway 部署错误快速修复

## 你看到的错误：
```
✖ Railpack could not determine how to build the app.
```

## 🎯 快速解决方案（2分钟）

### 选项 A: 在 Railway Dashboard 设置（最简单）

```
1. 打开 Railway Dashboard
2. 选择你的项目/服务
3. 点击 "Settings" 标签
4. 找到 "Root Directory"
5. 输入: backend
6. 点击 "Save"
7. 点击 "Redeploy"
```

✅ **完成！** Railway 现在会从 `backend/` 目录构建。

---

### 选项 B: 使用 Railway CLI（推荐）

```bash
# 1. 安装 Railway CLI
# Windows PowerShell:
iwr https://railway.app/install.ps1 | iex

# Mac/Linux:
curl -fsSL https://railway.app/install.sh | sh

# 2. 登录
railway login

# 3. 进入 backend 目录
cd backend

# 4. 部署
railway up
```

✅ **完成！** 应用会从 backend 目录部署。

---

## 📋 必需的环境变量

在 Railway Dashboard → Variables 添加：

```bash
GEMINI_API_KEY=your_key_here
FIREBASE_CREDENTIALS={"type":"service_account",...}
CORS_ORIGINS=https://your-frontend.vercel.app
```

---

## 🧪 验证部署

```bash
# 测试健康检查（替换为你的 Railway URL）
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

## ❓ 还是不行？

### 检查清单：

- [ ] Root Directory 设置为 `backend`
- [ ] `backend/requirements.txt` 文件存在
- [ ] `backend/main.py` 文件存在
- [ ] 环境变量已添加
- [ ] 已触发重新部署

### 查看日志：

```
Railway Dashboard → Deployments → 点击最新部署 → 查看 Logs
```

### 常见错误：

| 错误 | 解决方案 |
|------|---------|
| "No module named 'fastapi'" | 检查 Root Directory 设置 |
| "Application failed to respond" | 检查 PORT 环境变量 |
| "Build failed" | 查看 Build Logs 找具体错误 |

---

## 📞 获取帮助

1. 查看完整指南: `RAILWAY_SETUP_STEPS.md`
2. Railway 文档: https://docs.railway.app
3. Railway Discord: https://discord.gg/railway

---

## 🎉 成功后的下一步

1. ✅ 记录你的 Railway URL
2. ✅ 在 Vercel 部署 Frontend
3. ✅ 更新 Frontend 的 `NEXT_PUBLIC_API_URL`
4. ✅ 测试完整应用

祝好运！🚀
