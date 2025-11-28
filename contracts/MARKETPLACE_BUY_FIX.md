# Marketplace 购买功能修复

## 🐛 问题

购买功能失败，错误信息：
```
Mutable object cannot appear more than one in one transaction
```

## 🔍 根本原因

在 Sui/OneChain 中，**同一个可变对象不能在一个交易中被使用多次**。

之前的代码问题：
```typescript
// ❌ 错误的做法
const firstCoin = octCoins.data[0].coinObjectId;
const [coin] = tx.splitCoins(tx.object(firstCoin), [tx.pure.u64(price)]);
// 问题：firstCoin 可能就是 gas coin，导致同一个 coin 既用于 gas 又用于 payment
```

## ✅ 解决方案

使用 `tx.gas` 来自动处理 gas coin：

```typescript
// ✅ 正确的做法
const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);
```

### 为什么这样可以工作？

1. `tx.gas` 是一个特殊的引用，指向交易的 gas coin
2. Sui SDK 会自动处理 gas coin 的 split 操作
3. 不会导致同一个对象被使用两次

## 📝 修改的代码

### frontend/hooks/useMarketplace.ts

**之前（❌ 错误）：**
```typescript
let paymentCoin;
if (octCoins.data.length === 1) {
  paymentCoin = octCoins.data[0].coinObjectId;
  const [coin] = tx.splitCoins(tx.object(paymentCoin), [tx.pure.u64(priceInMist)]);
  paymentCoin = coin;
} else {
  const [firstCoin, ...otherCoins] = octCoins.data;
  if (otherCoins.length > 0) {
    tx.mergeCoins(
      tx.object(firstCoin.coinObjectId),
      otherCoins.map(coin => tx.object(coin.coinObjectId))
    );
  }
  const [coin] = tx.splitCoins(tx.object(firstCoin.coinObjectId), [tx.pure.u64(priceInMist)]);
  paymentCoin = coin;
}
```

**现在（✅ 正确）：**
```typescript
// Use tx.gas to avoid using the same coin for both payment and gas
const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);
```

## 🎯 优势

1. **更简单** - 只需一行代码
2. **更可靠** - 不会出现 coin 冲突
3. **自动处理** - SDK 自动管理 gas coin
4. **标准做法** - 这是 Sui 推荐的方式

## 🧪 测试

### 测试步骤

1. 确保钱包有足够的 OCT
2. 访问 marketplace
3. 尝试购买一个 NFT
4. 应该成功完成交易

### 预期结果

```
✅ NFT purchased successfully
```

## 📚 相关文档

- [Sui Transaction Building](https://docs.sui.io/build/prog-trans-ts-sdk)
- [Programmable Transaction Blocks](https://docs.sui.io/concepts/transactions/prog-txn-blocks)

## 🔄 其他需要类似修复的地方

检查所有使用 `splitCoins` 的地方，确保不会出现同样的问题：

- ✅ `buy_pokemon` - 已修复
- ✅ `buy_egg` - 已修复
- ✅ `list_pokemon` - 不需要（不涉及 payment）
- ✅ `list_egg` - 不需要（不涉及 payment）
- ✅ `cancel_listing` - 不需要（不涉及 payment）

## 💡 经验教训

在 Sui/OneChain 开发中：

1. **永远不要手动指定 gas coin** - 让 SDK 自动处理
2. **使用 `tx.gas` 进行 split** - 这是标准做法
3. **避免重复使用可变对象** - 一个交易中每个对象只能被修改一次
4. **测试时注意错误信息** - "cannot appear more than one" 是常见错误

## 🎉 结果

修复后，marketplace 的购买功能应该完全正常工作！
