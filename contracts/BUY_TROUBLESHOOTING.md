# 购买功能故障排除

## 🔍 问题：Confirm Purchase 按钮不工作

### 可能的原因

1. **JavaScript 错误**
   - 检查浏览器控制台是否有错误
   - 按 F12 打开开发者工具

2. **交易构建失败**
   - OCT 余额不足
   - NFT 已被购买
   - 网络连接问题

3. **钱包问题**
   - 钱包未连接
   - 钱包拒绝签名
   - 钱包版本不兼容

4. **合约问题**
   - NFT ID 不匹配
   - Listing 不存在
   - 价格不匹配

## 🧪 测试步骤

### 步骤 1: 检查基本配置
```bash
# 访问测试页面
http://localhost:3000/test-marketplace

# 检查输出
- Marketplace ID 正确
- Package ID 正确
- 有活跃的 listings
- OCT 余额充足
```

### 步骤 2: 测试购买功能
```bash
# 访问隔离测试页面
http://localhost:3000/test-buy

# 点击 "Test Buy" 按钮
# 查看控制台输出
```

### 步骤 3: 检查浏览器控制台

打开控制台 (F12)，查找以下日志：

**成功的日志应该包含：**
```
🔧 Building buy NFT transaction...
Listing: {...}
NFT ID: 0x4dedd2e170e11782fa9eb176299978997f4cf7f25c201a017c0ed77abf49ee5c
Price: 0.01
NFT Type: egg
💰 Payment details:
  - Price in MIST: 10000000
  - Total OCT balance: 17.xxx
  - Buy function: buy_egg
📝 Transaction built, requesting signature...
✅ NFT purchased successfully: {...}
```

**如果失败，查找：**
```
❌ Failed to purchase NFT: ...
Error type: ...
Error details: ...
```

## 🔧 常见错误及解决方案

### 错误 1: "Insufficient OCT"
**原因**: OCT 余额不足
**解决**: 从水龙头获取更多 OCT
```bash
curl -X POST https://faucet.onechain.ai/gas \
  -H "Content-Type: application/json" \
  -d '{"FixedAmountRequest":{"recipient":"YOUR_ADDRESS"}}'
```

### 错误 2: "Listing not found"
**原因**: NFT 已被购买或取消
**解决**: 刷新页面，选择其他 NFT

### 错误 3: "Wallet not connected"
**原因**: 钱包未连接
**解决**: 点击 "Connect Wallet" 按钮

### 错误 4: "User rejected"
**原因**: 用户在钱包中拒绝了交易
**解决**: 重新尝试并在钱包中确认

### 错误 5: "Transaction failed"
**原因**: 链上执行失败
**解决**: 
1. 检查 NFT 是否还在上架
2. 检查价格是否正确
3. 检查 gas 是否足够

## 📊 调试信息收集

如果问题持续，收集以下信息：

1. **浏览器控制台日志**
   - 完整的错误消息
   - 所有相关日志

2. **交易详情**
   - Transaction digest (如果有)
   - 错误代码

3. **环境信息**
   - 浏览器版本
   - 钱包版本
   - 网络状态

4. **账户信息**
   - 钱包地址
   - OCT 余额
   - 是否是卖家本人

## 🎯 快速检查清单

- [ ] 钱包已连接
- [ ] OCT 余额充足 (> 0.01)
- [ ] NFT 还在上架中
- [ ] 不是自己的 listing
- [ ] 浏览器控制台无错误
- [ ] 网络连接正常
- [ ] Package ID 正确
- [ ] Marketplace ID 正确

## 🔄 重置步骤

如果一切都失败了：

1. **刷新页面** (Ctrl+F5)
2. **断开并重新连接钱包**
3. **清除浏览器缓存**
4. **重启浏览器**
5. **检查 RPC 节点状态**

## 📞 获取帮助

如果问题仍然存在，提供：
1. 完整的控制台日志
2. 你的钱包地址
3. 尝试购买的 NFT ID
4. 错误截图

## 🧪 测试命令

### 使用 CLI 测试购买
```bash
cd contracts/pokemon_nft
./test_buy_egg.ps1
```

这将直接通过 CLI 测试购买功能，绕过前端。

### 检查 Marketplace 状态
```bash
cd frontend
node diagnose-marketplace.js
```

### 获取 Listing 详情
```bash
cd frontend
node get-listing-details.js
```
