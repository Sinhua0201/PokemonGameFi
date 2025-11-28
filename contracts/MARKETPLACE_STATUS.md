# Marketplace 当前状态

## ✅ 系统状态：正常运行

**检查时间**: 2024-11-29

## 📊 Marketplace 信息

### 基本信息
- **Marketplace ID**: `0x175c044fe0e0fc401f45e5741e31f35445102c4171266424c3821720390703bd`
- **Package ID**: `0xb87355127acb2b607280836182fc811bea17a3cd7601dba07035975878e696fa`
- **Fee**: 2.5% (250 basis points)
- **Active Listings**: 1

### 当前上架的 NFT

#### Egg #1
- **NFT ID**: `0x4dedd2e170e11782fa9eb176299978997f4cf7f25c201a017c0ed77abf49ee5c`
- **Type**: Egg
- **Price**: **0.01 OCT**
- **Seller**: `0x30def35cc304d21ce9c79bd468c2482733476c5d0662d1e44a18f2e583054436`
- **Parents**: 
  - Parent 1: Species #1 (Bulbasaur)
  - Parent 2: Species #44 (Gloom)
- **Incubation**: 0/10 steps
- **Listing Object**: `0xdb130479e97cbb3ebaf2fd2ef3105be4526afac03d259a72ff4d9a5b448859c1`

## 💰 你的账户状态

- **Address**: `0xc10af7cf809a4092f5d0bba7f2e85d6c9d2d7eb0510a6220cae966a2a591e4d4`
- **OCT Balance**: **17.17 OCT** ✅
- **Status**: 余额充足，可以购买

## 🛒 如何购买

### 方法 1: 使用前端 (推荐)

1. 访问 Marketplace 页面
2. 找到这个 Egg listing
3. 点击 "Buy" 按钮
4. 确认交易

### 方法 2: 使用 CLI

```bash
# 运行测试脚本
cd contracts/pokemon_nft
./test_buy_egg.ps1
```

或者手动执行：

```bash
sui client call \
  --package 0xb87355127acb2b607280836182fc811bea17a3cd7601dba07035975878e696fa \
  --module marketplace \
  --function buy_egg \
  --type-args "0x2::oct::OCT" \
  --args 0x175c044fe0e0fc401f45e5741e31f35445102c4171266424c3821720390703bd \
         0x4dedd2e170e11782fa9eb176299978997f4cf7f25c201a017c0ed77abf49ee5c \
         <YOUR_OCT_COIN_ID> \
  --gas-budget 10000000
```

## 🔧 前端集成检查清单

### 需要确认的点

- [ ] 前端是否正确查询 marketplace 的 dynamic fields
- [ ] 前端是否正确解析 ListingInfo (从 table 中)
- [ ] 前端是否正确构建购买交易
- [ ] 前端是否正确传递 NFT ID
- [ ] 前端是否正确处理 OCT coins

### 可能的问题

1. **NFT ID 不匹配**
   - 前端可能使用了错误的 NFT ID
   - 应该使用: `0x4dedd2e170e11782fa9eb176299978997f4cf7f25c201a017c0ed77abf49ee5c`

2. **价格查询失败**
   - 需要从 listings table 的 dynamic field 中查询
   - Table ID: `0x6074482cf2186cf43a92c9e3f2f4b017996fbf0fc2f521168415834270cc25f8`

3. **Coin 处理问题**
   - 确保正确 split coins
   - 确保传递正确的 coin 对象

## 📝 交易结构

正确的购买交易应该包含：

```typescript
{
  "commands": [
    {
      "SplitCoins": {
        "coin": { "Input": 0 },  // OCT coin
        "amounts": [{ "Input": 1 }]  // 10000000 MIST
      }
    },
    {
      "MoveCall": {
        "package": "0xb87355127acb2b607280836182fc811bea17a3cd7601dba07035975878e696fa",
        "module": "marketplace",
        "function": "buy_egg",
        "typeArguments": ["0x2::oct::OCT"],
        "arguments": [
          { "Input": 2 },  // Marketplace ID
          { "Input": 3 },  // NFT ID
          { "NestedResult": [0, 0] }  // Split coin result
        ]
      }
    }
  ]
}
```

## 🐛 调试步骤

如果购买失败，按以下步骤调试：

1. **检查 Marketplace 状态**
   ```bash
   node frontend/diagnose-marketplace.js
   ```

2. **检查 Listing 详情**
   ```bash
   node frontend/get-listing-details.js
   ```

3. **检查你的 OCT 余额**
   ```bash
   sui client gas
   ```

4. **查看前端控制台日志**
   - 打开浏览器开发者工具
   - 查看 Console 标签
   - 寻找错误信息

5. **检查交易构建**
   - 前端应该输出交易预览
   - 确认所有参数正确

## ✅ 下一步

1. 在前端测试购买功能
2. 如果失败，查看具体错误信息
3. 根据错误信息调整代码
4. 重新测试

## 📞 需要帮助？

如果遇到问题，提供以下信息：
- 错误消息
- 浏览器控制台日志
- 交易 JSON (如果有)
- 你的钱包地址
