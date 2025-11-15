# 升级合约指南

## 快速升级命令

在 `contracts/pokemon_nft` 目录下运行：

```bash
# 1. 清理并构建
sui move build

# 2. 升级合约（会保持相同的Package ID）
sui client upgrade --gas-budget 100000000
```

就这么简单！

## 本次更新内容

### 1. Pokemon XP系统
- 添加了 `add_experience()` 函数
- 战斗胜利后XP直接记录到blockchain
- 自动升级系统（每100 XP升1级）

### 2. 蛋孵化难度调整
- `STEPS_PER_BATTLE_WIN` 从 10 改为 1
- 现在需要 10 场战斗才能孵化（之前是1场）

## 注意事项

- `sui client upgrade` 会保持相同的 Package ID
- 不需要更新 `.env.local` 文件
- 升级后立即生效
- 现有的NFT不受影响

## 如果升级失败

如果遇到错误，可能需要：

1. 检查钱包余额是否足够
2. 确认你是合约的owner
3. 查看具体错误信息

## 验证升级

升级成功后，可以通过以下方式验证：

```bash
# 查看合约信息
sui client object <PACKAGE_ID>
```
