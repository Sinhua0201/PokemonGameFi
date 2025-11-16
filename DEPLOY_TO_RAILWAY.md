# 🚀 立即部署到 Railway

## ✅ 你已经完成的步骤
- [x] 设置 Root Directory 为 `backend`
- [x] 修复了 nixpacks.toml 配置

## 📝 现在需要做的

### 步骤 1: 推送代码到 Git

```bash
git add .
git commit -m "Fix Railway nixpacks configuration"
git push
```

Railway 会自动检测到新的提交并重新部署。

### 步骤 2: 添加环境变量

在 Railway Dashboard 的 **Variables** 标签中添加：

#### 必需变量：
```bash
GEMINI_API_KEY=你的Gemini API密钥
```

#### Firebase 配置（选择一种方式）：

**方式 A: 使用 JSON 字符串（推荐）**
```bash
FIREBASE_CREDENTIALS={"type":"service_account","project_id":"your-project-id",...完整的JSON...}
```

**方式 B: 使用文件路径**
```bash
FIREBASE_SERVICE_ACCOUNT_PATH=serviceAccountKey.json
```
然后需要上传 serviceAccountKey.json 文件

#### 可选变量：
```bash
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
DEBUG=false
```

### 步骤 3: 等待部署完成

部署大约需要 2-3 分钟。你可以在 **Deployments** 标签查看进度。

### 步骤 4: 测试部署

部署成功后，获取你的 Railway URL（在 Settings → Domains），然后测试：

```bash
# 替换为你的实际 URL
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

## 🔍 如果还是失败

### 查看构建日志

1. 点击 **Deployments** 标签
2. 点击最新的部署
3. 查看 **Build Logs**

### 应该看到的成功日志：

```
✅ Detected Python project
✅ Installing Python 3.11
✅ Installing pip
✅ Installing dependencies from requirements.txt
✅ Build complete
```

### 常见错误和解决方案：

| 错误 | 解决方案 |
|------|---------|
| `pip: command not found` | 已修复 - 推送新代码 |
| `No module named 'fastapi'` | 检查 requirements.txt |
| `Application failed to respond` | 检查环境变量 PORT |
| `Redis connection failed` | 添加 Railway Redis 插件或忽略 |

---

## 🎯 下一步

部署成功后：

1. ✅ 记录你的 Railway URL
2. ✅ 部署 Frontend 到 Vercel
3. ✅ 在 Frontend 环境变量中设置：
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
4. ✅ 测试完整应用

---

## 📞 需要帮助？

如果遇到问题，提供以下信息：
- Railway 构建日志截图
- 错误信息
- 环境变量配置（隐藏敏感信息）

祝部署顺利！🎉
