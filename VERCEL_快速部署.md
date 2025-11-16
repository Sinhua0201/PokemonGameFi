# 🚀 Vercel 快速部署（5分钟）

## 第一步：访问 Vercel

1. 打开 https://vercel.com
2. 登录（用 GitHub 账号）

## 第二步：导入项目

1. 点击 **"Add New..."** → **"Project"**
2. 选择你的 GitHub 仓库
3. 点击 **"Import"**

## 第三步：配置项目

### Root Directory
- 点击 **"Edit"**
- 输入: `frontend`
- 点击 **"Continue"**

### 其他设置保持默认
- Framework: Next.js ✅
- Build Command: `npm run build` ✅
- Output Directory: `.next` ✅

## 第四步：添加环境变量

点击 **"Environment Variables"**，然后粘贴：

```
NEXT_PUBLIC_API_URL=https://pokemongamefi-production.up.railway.app
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAlfxJFjEyoEwaS7ZPfdsgDzTgITDd5Bp0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pokemongamefi.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pokemongamefi
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pokemongamefi.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=151043781731
NEXT_PUBLIC_FIREBASE_APP_ID=1:151043781731:web:4a8eb27df2a6721e7c7456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-1Q40TKZNJX
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0x3f9cf7d826d3842aa35cac951ad5c7aeb79cf357016bd2945a35a367a80cb844
NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=0x3f9cf7d826d3842aa35cac951ad5c7aeb79cf357016bd2945a35a367a80cb844
NEXT_PUBLIC_MARKETPLACE_ID=0x676d0ecb1de39d62de2a267ac2a0f454d47ab19084b2d0a66c2f1e75476c8f7f
```

## 第五步：部署

1. 点击 **"Deploy"**
2. 等待 2-3 分钟
3. 完成！🎉

## 第六步：更新 Railway CORS

1. 复制你的 Vercel URL（例如 `https://your-app.vercel.app`）
2. 打开 Railway Dashboard
3. 进入 Variables
4. 更新 `CORS_ORIGINS`:
```
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

## ✅ 完成！

现在访问你的 Vercel URL，游戏应该可以运行了！

---

## 📞 需要帮助？

查看详细指南: `VERCEL_FRONTEND_DEPLOY.md`
