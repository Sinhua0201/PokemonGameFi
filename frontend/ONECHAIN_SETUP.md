# OneChain 前端配置指南

## 已完成的配置更新

### 1. 环境变量 (`.env.local`)
✅ 已更新所有合约地址和配置：
- Package ID
- GameState ID
- Marketplace ID
- Token Treasury ID
- RPC URL

### 2. Provider 配置 (`app/providers.tsx`)
✅ 已更新为使用 OneChain RPC：
```typescript
const ONECHAIN_RPC_URL = 'https://rpc-testnet.onelabs.cc:443';
```

### 3. Constants 配置 (`config/constants.ts`)
✅ 添加了 OneChain 相关常量：
- RPC_URL
- GAME_STATE_ID
- TOKEN_TREASURY_ID

### 4. Mint Hook (`hooks/useMintPokemon.ts`)
✅ 更新为使用 OneChain RPC URL

## 测试步骤

### 1. 访问测试页面
```
http://localhost:3000/test-onechain
```

这个页面会显示：
- 钱包连接状态
- 配置信息
- RPC 连接测试

### 2. 连接钱包
确保你的钱包配置了 OneChain 测试网：
- Network: OneChain Testnet
- RPC: https://rpc-testnet.onelabs.cc:443

### 3. 测试 Mint 功能
访问开始游戏页面：
```
http://localhost:3000/start-game
```

选择初始宝可梦并尝试 mint。

## 常见问题

### Q: 钱包可以签名但交易失败
**可能原因：**
1. Gas 不足（需要 OCT）
2. RPC 连接问题
3. 合约地址配置错误

**解决方法：**
1. 检查 OCT 余额：`sui client gas`
2. 访问测试页面验证配置
3. 查看浏览器控制台错误信息

### Q: 交易签名后没有反应
**可能原因：**
1. OneChain RPC 响应慢
2. 交易查询失败

**解决方法：**
1. 等待更长时间（OneChain 可能比 Sui 慢）
2. 检查浏览器控制台日志
3. 在 OneChain 浏览器查询交易

### Q: 找不到创建的 Pokemon 对象
**可能原因：**
1. 交易还在处理中
2. 对象查询 API 问题

**解决方法：**
1. 等待几秒后刷新
2. 直接在 OneChain 浏览器查看交易详情

## OneChain vs Sui 的区别

| 特性 | Sui | OneChain |
|------|-----|----------|
| Gas Token | SUI | OCT |
| RPC 响应速度 | 快 | 较慢 |
| API 版本 | 1.61.2 | 1.0.1 |
| 自定义代币 | 可选 | 推荐使用 |

## 调试技巧

### 1. 查看完整日志
打开浏览器控制台（F12），查看：
- 🔧 Transaction building logs
- 📝 Signature request logs
- ✅ Success/error messages

### 2. 使用 OneChain 浏览器
```
https://testnet.onechain.com/
```

搜索：
- 交易 digest
- 钱包地址
- 对象 ID

### 3. 检查合约调用
确保调用的函数名和参数正确：
```typescript
tx.moveCall({
  target: `${PACKAGE_ID}::pokemon::mint_starter`,
  arguments: [
    tx.pure.u64(speciesId),
    tx.pure.vector('u8', nameBytes),
    tx.pure.vector('vector<u8>', typesBytes),
    tx.object('0x6'), // Clock
  ],
});
```

## 下一步

1. ✅ 测试钱包连接
2. ✅ 测试 RPC 连接
3. ⏳ 测试 Mint 功能
4. ⏳ 测试市场功能
5. ⏳ 测试繁殖功能

## 获取帮助

如果遇到问题：
1. 查看浏览器控制台
2. 查看 OneChain 浏览器
3. 检查 `.env.local` 配置
4. 访问 `/test-onechain` 页面诊断
