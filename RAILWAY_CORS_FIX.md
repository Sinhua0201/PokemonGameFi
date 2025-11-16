# 🔧 修复 CORS 错误 - Railway 配置

## 问题
```
Access to fetch at 'https://pokemongamefi-production.up.railway.app/api/pokemon/starters/all' 
from origin 'https://pokemon-game-fi.vercel.app' has been blocked by CORS policy
```

## 解决方案

### 步骤 1: 更新 Railway 环境变量

1. 打开 Railway Dashboard: https://railway.app/
2. 选择你的项目 `pokemongamefi-production`
3. 点击 **Variables** 标签
4. 找到 `CORS_ORIGINS` 变量（如果没有就新建）
5. 更新为：

```
CORS_ORIGINS=https://pokemon-game-fi.vercel.app,http://localhost:3000
```

### 步骤 2: 保存并等待重新部署

- 保存后 Railway 会自动重新部署
- 等待 30-60 秒部署完成
- 查看 Logs 确认没有错误

### 步骤 3: 测试

访问你的前端：https://pokemon-game-fi.vercel.app/starter

应该能正常加载初始宝可梦了！

---

## 完整的 Railway 环境变量配置

如果你想一次性配置所有变量，使用 **Raw Editor** 模式：

```env
GEMINI_API_KEY=AIzaSyDAL621Fd02tvoKCJ9apijDp0h6BRuJ_cE
FIREBASE_SERVICE_ACCOUNT_PATH=serviceAccountKey.json
CORS_ORIGINS=https://pokemon-game-fi.vercel.app,http://localhost:3000
DEBUG=false
```

---

## 其他错误说明

### 1. 404 trainer-dialogue
这个路由不存在，可以忽略或者创建对应页面。

### 2. Dialog controlled/uncontrolled warning
React 组件状态管理问题，不影响功能，可以后续优化。

### 3. CSS preload warning
性能优化警告，不影响功能。

---

## 验证 CORS 是否生效

在浏览器控制台运行：

```javascript
fetch('https://pokemongamefi-production.up.railway.app/api/pokemon/starters/all')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

如果返回数据而不是 CORS 错误，说明配置成功！
