# 🚀 快速修复：看不到 Pokemon

## 问题
在 `/profile`、`/breeding`、`/battle`、`/explore` 页面看不到我的 Pokemon。

## 原因
你的 Pokemon 是用**旧合约** (V1) 铸造的，但前端现在使用**新合约** (V2)。

### 旧合约 (V1)
```
0x2d0c2ebdbefaa6b7c39b534439b7364c60477706bf2395423351bc36da0d9a63
```

### 新合约 (V2) ✅
```
0xf2912bdcd0ce0d68b18e7574cab1cbecd289c450cc71071760106a443cd6dcb9
```

## 解决方案

### 方案 1: 用新合约重新铸造 Pokemon（推荐）

#### 步骤 1: 重启开发服务器
```bash
# 停止当前服务器 (Ctrl+C)
npm run dev
```

#### 步骤 2: 硬刷新浏览器
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

#### 步骤 3: 铸造新的 Pokemon
访问以下任一页面：

**选项 A: 铸造初始 Pokemon**
```
http://localhost:3000/start-game
```
- 选择一个初始 Pokemon
- 点击"开始冒险"
- 签名交易

**选项 B: 捕获野生 Pokemon**
```
http://localhost:3000/encounter
```
- 遇到野生 Pokemon
- 战斗并捕获
- 签名交易

#### 步骤 4: 验证
访问测试页面：
```
http://localhost:3000/test-onechain
```

应该看到：
- ✅ Package ID: `0xf2912b...`
- ✅ 找到 X 个 Pokemon

### 方案 2: 临时使用旧合约（不推荐）

如果你想查看旧的 Pokemon，可以临时切换回 V1：

#### 1. 编辑 `.env.local`
```bash
# 改为旧的 Package ID
NEXT_PUBLIC_PACKAGE_ID=0x2d0c2ebdbefaa6b7c39b534439b7364c60477706bf2395423351bc36da0d9a63
```

#### 2. 重启服务器
```bash
npm run dev
```

⚠️ **注意**: V1 合约的 `mint_captured` 需要 POKEMON token 支付，可能无法正常工作。

## 验证修复

### 1. 检查 Package ID
```bash
node check-env.js
```

应该显示：
```
NEXT_PUBLIC_PACKAGE_ID: 0xf2912bdcd0ce0d68b18e7574cab1cbecd289c450cc71071760106a443cd6dcb9
```

### 2. 访问测试页面
```
http://localhost:3000/test-onechain
```

应该看到：
- ✅ 钱包已连接
- ✅ Package ID 正确
- ✅ RPC 连接成功
- ✅ 找到 Pokemon（如果已铸造）

### 3. 访问 Profile 页面
```
http://localhost:3000/profile
```

应该看到你的 Pokemon 集合。

## 为什么会这样？

### V1 vs V2 的区别

| 特性 | V1 | V2 |
|------|----|----|
| mint_starter | 免费 ✅ | 免费 ✅ |
| mint_captured | 需要 POKEMON token ❌ | 免费 ✅ |
| 参数 | 需要 payment + game_state | 只需要基本参数 |

V2 简化了捕获流程，不再需要 POKEMON token，提供更好的用户体验。

## 常见问题

### Q: 我的旧 Pokemon 会丢失吗？
A: 不会！它们仍然在区块链上，只是前端现在查询新合约。你可以：
- 在 OneChain 浏览器查看旧 Pokemon
- 临时切换回 V1 查看
- 但建议用 V2 重新铸造

### Q: 为什么不能同时显示两个版本的 Pokemon？
A: 技术上可以，但会增加复杂度。建议统一使用 V2。

### Q: 如何在 OneChain 浏览器查看我的旧 Pokemon？
A: 访问：
```
https://testnet.onechain.com/address/YOUR_WALLET_ADDRESS
```

查找类型为 `0x2d0c2e...::pokemon::Pokemon` 的对象。

## 需要帮助？

如果仍然有问题：

1. 查看完整的故障排除指南：`TROUBLESHOOTING.md`
2. 检查浏览器控制台错误 (F12)
3. 访问 `/test-onechain` 页面获取诊断信息

## 总结

**最简单的解决方案：**
1. 重启开发服务器
2. 硬刷新浏览器
3. 用新合约重新铸造 Pokemon
4. 享受免费捕获的新功能！🎉
