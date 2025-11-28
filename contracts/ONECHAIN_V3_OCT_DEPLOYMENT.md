# OneChain V3 部署 - 使用 OCT 支付

## 部署时间
2024-11-29

## 部署摘要
成功部署了使用 OCT (OneChain 原生代币) 进行支付的 marketplace 合约版本。

## 关键变更
1. **移除自定义代币依赖**: 不再使用 POKEMON 自定义代币
2. **使用泛型支付**: Marketplace 使用泛型 `buy_pokemon<T>` 和 `buy_egg<T>` 函数
3. **OCT 原生支付**: 用户可以直接使用 OCT 代币购买 NFT
4. **简化合约结构**: 移除了 Clock 依赖和 AdminCap

## 部署信息

### Package ID
```
0xb87355127acb2b607280836182fc811bea17a3cd7601dba07035975878e696fa
```

### Shared Objects

#### Marketplace
```
0x175c044fe0e0fc401f45e5741e31f35445102c4171266424c3821720390703bd
```

#### GameState
```
0x6b1678d97cfea2b32aa63d7da10f58385cf284c29037b6ae8a22b008294bc5bb
```

#### TokenTreasury
```
0x3dc25d6eddc5873ca8df05874194234389f46e31d53642a9e4e0599f19551f26
```

#### CoinMetadata
```
0x2a18dfd86358bce8c5456d85ff43fefa5fe339280a607306312786a22e06dfcd
```

### UpgradeCap
```
0x5e92296908fa57b233546f7e58b5737ad9ff36357d85c21fb2d1d8ea2d036716
```

## 交易信息
- **Transaction Digest**: `Bzkz9Z4vzHpy8rg1jdQYGwQcbCxYMh52rSiEwZQn9j1s`
- **Gas Used**: 63,056,280 MIST (约 0.063 OCT)
- **Status**: Success ✅

## 合约功能

### Marketplace 模块

#### 上架功能
- `list_pokemon(marketplace, pokemon, price)` - 上架 Pokemon NFT
- `list_egg(marketplace, egg, price)` - 上架 Egg NFT

#### 购买功能
- `buy_pokemon<T>(marketplace, nft_id, payment)` - 购买 Pokemon NFT
- `buy_egg<T>(marketplace, nft_id, payment)` - 购买 Egg NFT

其中 `<T>` 是支付代币类型，使用 OCT 时为 `0x2::oct::OCT`

#### 取消上架
- `cancel_listing_pokemon(marketplace, nft_id)` - 取消 Pokemon 上架
- `cancel_listing_egg(marketplace, nft_id)` - 取消 Egg 上架

## 前端集成

### 环境变量更新
```env
NEXT_PUBLIC_PACKAGE_ID=0xb87355127acb2b607280836182fc811bea17a3cd7601dba07035975878e696fa
NEXT_PUBLIC_MARKETPLACE_ID=0x175c044fe0e0fc401f45e5741e31f35445102c4171266424c3821720390703bd
NEXT_PUBLIC_GAME_STATE_ID=0x6b1678d97cfea2b32aa63d7da10f58385cf284c29037b6ae8a22b008294bc5bb
NEXT_PUBLIC_TOKEN_TREASURY_ID=0x3dc25d6eddc5873ca8df05874194234389f46e31d53642a9e4e0599f19551f26
```

### 代码变更
1. **useMarketplace.ts**: 更新为使用 OCT 代币查询和支付
2. **UI 组件**: 所有价格显示从 "POKE" 改为 "OCT"
3. **购买函数**: 添加 `typeArguments: ['0x2::oct::OCT']` 参数

## 使用说明

### 获取 OCT 代币
用户需要从 OneChain 水龙头获取 OCT：
```bash
curl -X POST https://faucet.onechain.ai/gas \
  -H "Content-Type: application/json" \
  -d '{"FixedAmountRequest":{"recipient":"YOUR_ADDRESS"}}'
```

### 上架 NFT
1. 连接钱包
2. 选择要上架的 Pokemon 或 Egg
3. 设置价格（以 OCT 为单位）
4. 确认交易

### 购买 NFT
1. 确保钱包中有足够的 OCT
2. 浏览 marketplace
3. 选择要购买的 NFT
4. 确认支付（自动使用 OCT）

## 技术优势

### 相比 V2 版本
1. **更简单**: 不需要管理自定义代币
2. **更直观**: 用户直接使用 OCT 支付
3. **更灵活**: 泛型设计允许未来支持其他代币
4. **Gas 更低**: 减少了代币转换步骤

### OneChain 兼容性
- ✅ 使用 OTW (One-Time Witness) 模式
- ✅ 兼容 OneChain API 1.0.1
- ✅ 使用原生 OCT 代币
- ✅ 通过 VMVerification

## 已知问题

### OneChain RPC 限制
- `sui client gas` 命令可能无法正确显示 OCT coins
- 需要使用 `--gas` 参数手动指定 gas coin
- 这是 OneChain RPC 的已知问题，不影响实际功能

### 解决方案
```bash
# 查看所有对象
sui client objects

# 使用特定 gas coin 部署
sui client publish --gas <COIN_ID> --gas-budget 100000000
```

## 下一步

### 建议改进
1. 添加价格历史记录
2. 实现拍卖功能
3. 支持批量购买
4. 添加价格通知功能

### 测试清单
- [ ] 测试上架 Pokemon
- [ ] 测试上架 Egg
- [ ] 测试购买功能
- [ ] 测试取消上架
- [ ] 测试余额不足情况
- [ ] 测试 UI 显示

## 参考资料
- [OneChain 文档](https://docs.onechain.ai)
- [Sui Move 文档](https://docs.sui.io/build/move)
- [部署日志](./DEPLOY_OUTPUT.txt)
