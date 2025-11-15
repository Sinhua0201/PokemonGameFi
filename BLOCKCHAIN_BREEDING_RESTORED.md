# 区块链繁殖系统已恢复 🥚

## 更改内容

### 1. 智能合约更新 ✅
**文件：** `contracts/pokemon_nft/sources/egg.move`

```move
// 之前
const REQUIRED_INCUBATION_STEPS: u64 = 1000;

// 现在
const REQUIRED_INCUBATION_STEPS: u64 = 10;
```

**影响：**
- 孵化步数从 1000 降低到 10
- 只需赢 **1 场战斗**即可孵化蛋！
- 每场战斗胜利 +10 步

### 2. 前端配置更新 ✅
**文件：** `frontend/config/constants.ts`

```typescript
export const REQUIRED_INCUBATION_STEPS = 10;
export const BATTLE_WIN_INCUBATION_STEPS = 10;
```

### 3. 繁殖页面恢复 ✅
**文件：** `frontend/app/breeding/page.tsx`

- ✅ 恢复使用 `useBreedPokemon` 和 `usePlayerEggs`
- ✅ 蛋作为 NFT 存储在区块链上
- ✅ 使用 `EggIncubationDashboard` 组件
- ❌ 移除了 Firebase 简化版本

## 系统特性

### 区块链版本（当前）

#### 优点
- ✅ **真正的 NFT** - 蛋是区块链上的资产
- ✅ **可交易** - 可以在市场上买卖蛋
- ✅ **去中心化** - 完全链上存储
- ✅ **超简单孵化** - 只需 1 场战斗！

#### 流程
1. **繁殖** → 创建蛋 NFT（区块链交易）
2. **孵化进度** → 0/10 步
3. **赢 1 场战斗** → +10 步 → 10/10 步
4. **孵化** → 销毁蛋 NFT，铸造宝可梦 NFT

#### 成本
- 繁殖：需要 gas 费
- 孵化：需要 gas 费
- 总计：约 2 次区块链交易

## 部署步骤

### 1. 更新智能合约

```powershell
cd contracts/pokemon_nft
.\更新蛋系统.ps1
```

或手动部署：

```powershell
sui move build
sui client publish --gas-budget 100000000
```

### 2. 更新环境变量

复制新的 Package ID 到 `frontend/.env.local`:

```env
NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=0x新的PackageID
```

### 3. 重启前端

```powershell
cd frontend
npm run dev
```

## 使用指南

### 繁殖宝可梦

1. 访问 `/breeding` 页面
2. 选择两只宝可梦作为父母
3. 点击"Breed Pokémon"
4. 确认区块链交易
5. 等待交易确认
6. 蛋 NFT 创建成功！

### 孵化蛋

1. 切换到"Incubating Eggs"标签
2. 查看蛋的孵化进度（0/10）
3. 去战斗并赢得 1 场胜利
4. 返回查看进度（10/10）
5. 点击"Hatch Egg"
6. 确认区块链交易
7. 新宝可梦孵化成功！

## 对比

| 特性 | 简化版（Firebase） | 区块链版（当前） |
|------|-------------------|-----------------|
| 存储位置 | Firebase | 区块链 |
| 蛋类型 | 普通数据 | NFT |
| 可交易 | ❌ | ✅ |
| 孵化时间 | 立即 | 1 场战斗 |
| Gas 费用 | 无 | 有 |
| 去中心化 | ❌ | ✅ |
| 真实资产 | ❌ | ✅ |

## 技术细节

### 智能合约函数

#### breed_pokemon
```move
public entry fun breed_pokemon(
    parent1_species: u64,
    parent2_species: u64,
    genetics_data: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext
)
```

创建蛋 NFT，初始孵化步数为 0。

#### add_battle_steps
```move
public entry fun add_battle_steps(egg: &mut Egg)
```

战斗胜利后调用，增加 10 步孵化进度。

#### hatch_egg
```move
public entry fun hatch_egg(
    egg: Egg,
    offspring_species: u64,
    offspring_name: vector<u8>,
    offspring_types: vector<vector<u8>>,
    clock: &Clock,
    ctx: &mut TxContext
)
```

孵化蛋，销毁蛋 NFT，铸造新的宝可梦 NFT。

### 前端 Hooks

#### useBreedPokemon
```typescript
const { breedPokemon, isLoading } = useBreedPokemon();

await breedPokemon(
  parent1Id,
  parent2Id,
  parent1Species,
  parent2Species
);
```

#### usePlayerEggs
```typescript
const { eggs, isLoading, refetch } = usePlayerEggs();
```

#### useHatchEgg
```typescript
const { hatchEgg, isLoading } = useHatchEgg();

await hatchEgg(
  eggId,
  offspringSpecies,
  offspringName,
  offspringTypes
);
```

## 常见问题

### Q: 为什么需要 gas 费？
A: 因为蛋是真正的 NFT，存储在区块链上，需要支付交易费用。

### Q: 可以跳过战斗直接孵化吗？
A: 不可以，智能合约会检查孵化步数是否达到要求（10 步）。

### Q: 蛋可以交易吗？
A: 可以！蛋是 NFT，可以在市场上买卖。

### Q: 如果我有多个蛋怎么办？
A: 最多可以同时孵化 3 个蛋。每个蛋独立计算孵化进度。

### Q: 战斗失败会怎样？
A: 战斗失败不会增加孵化步数，只有胜利才会增加。

## 未来改进

- [ ] 添加蛋的市场交易功能
- [ ] 显示蛋的遗传信息预览
- [ ] 添加特殊孵化加速道具
- [ ] 支持批量孵化
- [ ] 添加孵化动画效果

## 总结

现在的繁殖系统：
- ✅ 蛋是真正的区块链 NFT
- ✅ 只需 1 场战斗即可孵化
- ✅ 完全去中心化
- ✅ 可以交易蛋 NFT
- ✅ 简单易用

享受繁殖你的宝可梦吧！🎮
