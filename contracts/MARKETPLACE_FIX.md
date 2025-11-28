# 市场购买功能修复

## 问题描述

用户在市场购买 NFT 时遇到错误，交易尝试从 gas coin (OCT) 分割 POKEMON token，这是不可能的。

### 错误的交易结构
```json
{
  "commands": [
    {
      "SplitCoins": {
        "coin": {"GasCoin": true},  // ❌ 试图从 OCT 分割
        "amounts": [10000000000]
      }
    },
    {
      "MoveCall": {
        "function": "buy_pokemon",
        "arguments": [marketplace, listingId, coin]  // ❌ 这个 coin 是 OCT
      }
    }
  ]
}
```

## 根本原因

`useBuyNFT` hook 使用了错误的支付方式：
```typescript
// ❌ 错误：从 gas coin 分割
const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);
```

这会尝试从 OCT (gas coin) 分割出 POKEMON token，但它们是完全不同的代币类型。

## 解决方案

### 1. 查询用户的 POKEMON Token Coins

```typescript
const pokemonCoins = await client.getCoins({
  owner: account.address,
  coinType: `${PACKAGE_ID}::pokemon::POKEMON`,
});
```

### 2. 检查余额是否足够

```typescript
const totalBalance = pokemonCoins.data.reduce(
  (sum, coin) => sum + BigInt(coin.balance),
  BigInt(0)
);

if (totalBalance < BigInt(priceInSmallestUnit)) {
  throw new Error('Insufficient POKEMON tokens');
}
```

### 3. 从 POKEMON Coins 分割支付

```typescript
// 单个 coin
const [coin] = tx.splitCoins(
  tx.object(pokemonCoins.data[0].coinObjectId),
  [tx.pure.u64(priceInSmallestUnit)]
);

// 或合并多个 coins
tx.mergeCoins(
  tx.object(firstCoin.coinObjectId),
  otherCoins.map(coin => tx.object(coin.coinObjectId))
);
```

## 修复的文件

### 1. `frontend/hooks/useMarketplace.ts`
- ✅ 修改 `useBuyNFT` 函数
- ✅ 添加 POKEMON token 查询
- ✅ 添加余额检查
- ✅ 正确处理单个/多个 coins

### 2. `frontend/hooks/usePokemonToken.ts` (新文件)
- ✅ 创建 `usePokemonTokenBalance` hook
- ✅ 实时显示用户的 POKE balance

### 3. `frontend/app/marketplace/page.tsx`
- ✅ 添加 POKE balance 显示
- ✅ 提示用户如何获取 POKE

## 正确的交易结构

```json
{
  "commands": [
    {
      "SplitCoins": {
        "coin": {
          "Object": {
            "objectId": "0x..." // ✅ POKEMON token coin
          }
        },
        "amounts": [10000000000]
      }
    },
    {
      "MoveCall": {
        "function": "buy_pokemon",
        "arguments": [marketplace, listingId, pokemonCoin]  // ✅ POKEMON token
      }
    }
  ]
}
```

## 用户体验改进

### 1. 余额显示
市场页面顶部显示：
```
💰 Your POKE Balance
X.XXX POKE
```

### 2. 错误提示
如果余额不足：
```
Insufficient POKEMON tokens.
You have 0.500 POKE but need 1.000 POKE
```

### 3. 获取指南
创建了 `HOW_TO_GET_POKE_TOKENS.md` 指导用户如何获取 POKE。

## 代币经济

### POKE Token 流通

#### 获取方式
1. **出售 NFT**: 主要方式
   - 卖家收到 97.5% 的售价
   - 2.5% 作为市场手续费

2. **未来功能**:
   - Faucet（测试用）
   - 任务奖励
   - 战斗奖励

#### 使用方式
- 在市场购买 NFT
- 未来可能：升级、特殊功能等

### 经济循环

```
玩家 A 铸造 Pokemon (免费)
    ↓
玩家 A 出售 Pokemon (获得 POKE)
    ↓
玩家 B 购买 Pokemon (花费 POKE)
    ↓
玩家 B 出售其他 NFT (获得 POKE)
    ↓
循环继续...
```

## 测试清单

- [ ] 用户有 POKE tokens 时可以购买
- [ ] 用户没有 POKE tokens 时显示错误
- [ ] 余额不足时显示清晰的错误信息
- [ ] 余额显示正确（3位小数）
- [ ] 购买后余额更新
- [ ] 出售后余额增加
- [ ] 多个 POKE coins 正确合并

## 相关文档

- [如何获取 POKE Tokens](../frontend/HOW_TO_GET_POKE_TOKENS.md)
- [市场代币更新](../frontend/MARKETPLACE_TOKEN_UPDATE.md)
- [OneChain V2 部署](./ONECHAIN_V2_DEPLOYMENT.md)

## 注意事项

### 对于开发者
1. 确保 RPC_URL 正确配置
2. POKEMON token 有 9 位小数
3. 需要处理多个 coins 的情况
4. 余额检查要在交易前进行

### 对于用户
1. 核心游戏功能（铸造、捕获、繁殖）仍然免费
2. 只有市场交易需要 POKE tokens
3. 通过出售 NFT 获取 POKE
4. OCT 只用于 gas 费用

---

**状态**: ✅ 已修复
**测试**: ⏳ 需要测试
**部署**: ✅ 前端更新完成
