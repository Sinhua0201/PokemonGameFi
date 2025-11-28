# OneChain V2 部署成功 - 免费捕获版本

## 🎉 部署信息

**部署时间**: 2024-11-29  
**版本**: V2 (免费捕获)  
**Transaction Digest**: `EWYwL2T4TVuAGg2LKUhmERr6pwuaqT8khgFxVrUcWbia`  
**浏览器**: https://testnet.onechain.com/tx/EWYwL2T4TVuAGg2LKUhmERr6pwuaqT8khgFxVrUcWbia

## 📦 核心对象 ID

### Package (合约包)
```
0xf2912bdcd0ce0d68b18e7574cab1cbecd289c450cc71071760106a443cd6dcb9
```

### Shared Objects

#### GameState
```
0x361f7ecde66b58a36a7818212f2e6b31a0b53c0c452232b6cd3121ac7860cb7e
```

#### Marketplace
```
0x223a10cfea5396cea17b509fb6eff2ddb28223e394a53b1c7e79ec26de5f867a
```

#### TokenTreasury
```
0xcc10a3975c177883a893b9db0f77249a2b1e2d2b49e631c700247bc20b559fb3
```

#### Token Metadata (Immutable)
```
0x9c27dfb8ba0c9969f4b777b4e5fbba644f8947c41bfbcfb315025139e328a32d
```

### Admin Capabilities

#### MarketplaceAdminCap
```
0x765193a6ac252024fd02384fa3b038c9ae624c9558a45f0111532fb1c59a9ca0
```

#### UpgradeCap
```
0xd7530de3aa011e16ffd7567cb5c63f83433ba2a9cea75439012e962a7b767288
```

## 🔄 V2 更新内容

### 主要变更
1. **免费捕获**: `mint_captured` 函数不再需要 POKEMON token 支付
2. **简化参数**: 移除了 `payment` 和 `game_state` 参数
3. **更好的用户体验**: 用户只需要 OCT 作为 gas，无需额外代币

### 函数签名变更

#### V1 (旧版本)
```move
public entry fun mint_captured(
    species_id: u64,
    name: vector<u8>,
    level: u64,
    types: vector<vector<u8>>,
    payment: Coin<POKEMON>,      // ❌ 需要支付
    game_state: &mut GameState,  // ❌ 需要 GameState
    clock: &Clock,
    ctx: &mut TxContext
)
```

#### V2 (新版本)
```move
public entry fun mint_captured(
    species_id: u64,
    name: vector<u8>,
    level: u64,
    types: vector<vector<u8>>,
    clock: &Clock,               // ✅ 只需要 Clock
    ctx: &mut TxContext
)
```

## 💰 Gas 消耗

- **Storage Cost**: 68.7 OCT
- **Computation Cost**: 1.0 OCT
- **Total**: ~69.7 OCT

## 🎮 功能说明

### 免费功能
- ✅ `mint_starter`: 铸造初始宝可梦（免费）
- ✅ `mint_captured`: 捕获宝可梦（免费）
- ✅ `breed_pokemon`: 繁殖宝可梦（免费）
- ✅ `hatch_egg`: 孵化蛋（免费）
- ✅ `evolve_pokemon`: 进化宝可梦（免费）

### 市场功能（使用 POKEMON token）
- 💰 `buy_pokemon`: 购买宝可梦（需要 POKEMON）
- 💰 `buy_egg`: 购买蛋（需要 POKEMON）

## 🚀 前端集成

环境变量已更新到 `frontend/.env.local`。

### 使用示例

#### 捕获宝可梦
```typescript
const tx = new Transaction();

tx.moveCall({
  target: `${PACKAGE_ID}::pokemon::mint_captured`,
  arguments: [
    tx.pure.u64(speciesId),
    tx.pure.vector('u8', nameBytes),
    tx.pure.u64(level),
    tx.pure.vector('vector<u8>', typesBytes),
    tx.object('0x6'), // Clock
  ],
});
```

## ✅ 测试清单

- [ ] 连接 OneChain 钱包
- [ ] 铸造初始宝可梦
- [ ] 捕获野生宝可梦
- [ ] 繁殖宝可梦
- [ ] 孵化蛋
- [ ] 进化宝可梦
- [ ] 市场交易

## 📝 注意事项

1. **只需要 OCT**: 用户只需要 OCT 作为 gas，无需其他代币
2. **POKEMON token**: 仅用于市场交易，游戏核心功能都是免费的
3. **RPC 配置**: 确保使用 OneChain RPC (`https://rpc-testnet.onelabs.cc:443`)

## 🔗 相关链接

- [OneChain 浏览器](https://testnet.onechain.com/)
- [前端设置指南](../frontend/ONECHAIN_SETUP.md)
- [V1 部署信息](./ONECHAIN_DEPLOYMENT_INFO.txt)

---

**部署者**: 0xc10af7cf809a4092f5d0bba7f2e85d6c9d2d7eb0510a6220cae966a2a591e4d4  
**状态**: ✅ 成功  
**版本**: V2 - 免费捕获
