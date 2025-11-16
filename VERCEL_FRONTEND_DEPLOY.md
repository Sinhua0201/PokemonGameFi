# 🚀 Vercel 部署 Frontend - 完整指南

## ✅ Backend 已部署
- Railway URL: `https://pokemongamefi-production.up.railway.app`

## 📋 Vercel 环境变量

### 复制以下内容到 Vercel Environment Variables：

```bash
# Backend API
NEXT_PUBLIC_API_URL=https://pokemongamefi-production.up.railway.app

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAlfxJFjEyoEwaS7ZPfdsgDzTgITDd5Bp0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pokemongamefi.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pokemongamefi
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pokemongamefi.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=151043781731
NEXT_PUBLIC_FIREBASE_APP_ID=1:151043781731:web:4a8eb27df2a6721e7c7456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-1Q40TKZNJX

# Sui Network Configuration
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0x3f9cf7d826d3842aa35cac951ad5c7aeb79cf357016bd2945a35a367a80cb844
NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=0x3f9cf7d826d3842aa35cac951ad5c7aeb79cf357016bd2945a35a367a80cb844
NEXT_PUBLIC_MARKETPLACE_ID=0x676d0ecb1de39d62de2a267ac2a0f454d47ab19084b2d0a66c2f1e75476c8f7f
```

---

## 🚀 部署步骤

### 方法 1: 通过 Vercel Dashboard（推荐）

#### 步骤 1: 访问 Vercel
1. 打开 https://vercel.com
2. 登录你的账号
3. 点击 **"Add New..."** → **"Project"**

#### 步骤 2: 导入仓库
1. 选择 **"Import Git Repository"**
2. 找到你的项目仓库
3. 点击 **"Import"**

#### 步骤 3: 配置项目
1. **Framework Preset**: Next.js（自动检测）
2. **Root Directory**: 点击 **"Edit"** → 输入 `frontend`
3. **Build Command**: `npm run build`（默认）
4. **Output Directory**: `.next`（默认）
5. **Install Command**: `npm install`（默认）

#### 步骤 4: 添加环境变量
1. 展开 **"Environment Variables"** 部分
2. 点击 **"Add"** 或使用批量添加
3. 粘贴上面的环境变量
4. 确保选择 **"Production"**, **"Preview"**, **"Development"** 三个环境

#### 步骤 5: 部署
1. 点击 **"Deploy"**
2. 等待 2-3 分钟
3. 部署完成！

---

### 方法 2: 使用 Vercel CLI

#### 安装 Vercel CLI
```bash
npm i -g vercel
```

#### 部署
```bash
# 进入 frontend 目录
cd frontend

# 登录 Vercel
vercel login

# 部署
vercel

# 生产部署
vercel --prod
```

---

## 🔄 部署后需要做的

### 1. 更新 Railway CORS 设置

获取你的 Vercel URL（例如 `https://your-app.vercel.app`），然后：

1. 打开 Railway Dashboard
2. 进入 Variables
3. 更新 `CORS_ORIGINS`：
```
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

### 2. 测试部署

访问你的 Vercel URL，测试：
- ✅ 首页加载
- ✅ 钱包连接
- ✅ API 调用（查看浏览器控制台）
- ✅ Firebase 认证

---

## 🧪 验证部署

### 检查 API 连接

打开浏览器控制台（F12），访问你的 Vercel 网站，应该看到：
```
API calls to: https://pokemongamefi-production.up.railway.app
```

### 测试 API 端点

```bash
# 测试 Backend
curl https://pokemongamefi-production.up.railway.app/health

# 应该返回
{
  "status": "healthy",
  "redis": "disconnected"
}
```

---

## 📊 预期结果

部署成功后：
- ✅ Frontend URL: `https://your-app.vercel.app`
- ✅ Backend URL: `https://pokemongamefi-production.up.railway.app`
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署（推送代码时）

---

## ❌ 常见问题

### 问题 1: Build 失败

**错误**: `Module not found` 或 `Type error`

**解决**:
```bash
# 本地测试构建
cd frontend
npm run build

# 如果本地成功，检查 Vercel 的 Node 版本
# 在 Vercel 项目设置中设置 Node.js Version 为 18.x 或 20.x
```

### 问题 2: API 调用失败（CORS 错误）

**错误**: `Access-Control-Allow-Origin`

**解决**: 更新 Railway 的 `CORS_ORIGINS` 环境变量

### 问题 3: 环境变量未生效

**解决**:
1. 确认环境变量已添加
2. 重新部署（Vercel Dashboard → Deployments → Redeploy）
3. 清除浏览器缓存

### 问题 4: 钱包连接失败

**解决**: 检查 Sui 配置是否正确，确保使用 testnet

---

## 🎯 完整架构

```
用户浏览器
    ↓
Vercel (Frontend)
https://your-app.vercel.app
    ↓ API 调用
Railway (Backend)
https://pokemongamefi-production.up.railway.app
    ↓
Firebase + Sui Blockchain
```

---

## 📝 部署检查清单

- [ ] Vercel 项目已创建
- [ ] Root Directory 设置为 `frontend`
- [ ] 所有环境变量已添加
- [ ] 部署成功（绿色勾号）
- [ ] 网站可以访问
- [ ] Railway CORS 已更新
- [ ] API 调用正常
- [ ] 钱包连接正常

---

## 🎉 成功！

恭喜！你的 PokemonGameFi 现在已经完全部署了！

- 🎮 Frontend: https://your-app.vercel.app
- 🔧 Backend: https://pokemongamefi-production.up.railway.app

享受你的游戏吧！🚀
