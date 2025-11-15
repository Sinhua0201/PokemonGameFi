# 完全区块链系统 - 不使用 Firebase

## ✅ 已完成的更改

### 1. **捕捉系统** - 完全上链
**文件：** `frontend/hooks/useCapture.ts`

**之前：**
- ❌ 捕捉后保存到 Firebase
- ❌ 宝可梦数据存储在 Firestore

**现在：**
- ✅ 捕捉后直接铸造 NFT
- ✅ 宝可梦完全存储在区块链上
- ✅ 不再保存到 Firebase

### 2. **Island Explorer 捕捉** - 使用区块链
**文件：** `frontend/components/scenes/IslandExplore.tsx`

**之前：**
- ❌ 使用 Firebase `setDoc` 保存捕捉的宝可梦

**现在：**
- ✅ 使用 `useCapture` hook
- ✅ 调用智能合约铸造 NFT
- ✅ 完全上链

### 3. **Encounter 页面** - 已经是区块链
**文件：** `frontend/app/encounter/page.tsx`

- ✅ 已经使用 `useCapture` hook
- ✅ 已经是区块链版本

### 4. **繁殖系统** - 完全上链
**文件：** `frontend/app/breeding/page.tsx`

- ✅ 使用 `useBreedPokemon` 创建蛋 NFT
- ✅ 使用 `usePlayerEggs` 查询区块链上的蛋
- ✅ 使用 `useHatchEgg` 孵化蛋并铸造宝可梦 NFT

## 📊 系统架构

### 数据流

```
捕捉宝可梦
    ↓
调用智能合约
    ↓
铸造 Pokemon NFT
    ↓
存储在区块链上
    ↓
前端查询区块链
    ↓
显示宝可梦列表
```

### 不再使用 Firebase 的功能

- ❌ 不再保存捕捉的宝可梦到 Firestore
- ❌ 不再从 Firestore 查询宝可梦
- ✅ 所有宝可梦数据来自区块链

### 仍然使用 Firebase 的功能

- ✅ 用户认证（可选）
- ✅ 玩家统计数据
- ✅ 在线玩家列表（Island Explorer）
- ✅ 任务系统

## 🔧 智能合约函数

### mint_captured
```move
public entry fun mint_captured(
    species_id: u64,
    name: vector<u8>,
    level: u64,
    types: vector<vector<u8>>,
    clock: &Clock,
    ctx: &mut TxContext
)
```

**功能：** 捕捉宝可梦后铸造 NFT

**调用位置：**
- `useCapture.ts` - Encounter 页面
- `IslandExplore.tsx` - Island Explorer

### breed_pokemon
```move
public entry fun breed_pokemon(
    parent1_species: u64,
    parent2_species: u64,
    genetics_data: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext
)
```

**功能：** 繁殖两只宝可梦，创建蛋 NFT

### hatch_egg
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

**功能：** 孵化蛋，销毁蛋 NFT，铸造宝可梦 NFT

## 📱 前端 Hooks

### useCapture
```typescript
const { attemptCapture } = useCapture();

await attemptCapture(
  {
    speciesId: 1,
    name: "Bulbasaur",
    level: 5,
    types: ["grass", "poison"]
  },
  0.5 // 50% capture rate
);
```

**功能：**
1. 检查捕捉成功率
2. 如果成功，调用智能合约铸造 NFT
3. 返回结果

### usePlayerPokemon
```typescript
const { pokemon, loading } = usePlayerPokemon(walletAddress);
```

**功能：**
- 从区块链查询玩家的宝可梦 NFT
- 不再从 Firebase 查询

### useBreedPokemon
```typescript
const { breedPokemon } = useBreedPokemon();

await breedPokemon(
  parent1Id,
  parent2Id,
  parent1Species,
  parent2Species
);
```

**功能：**
- 调用智能合约创建蛋 NFT

### usePlayerEggs
```typescript
const { eggs, refetch } = usePlayerEggs();
```

**功能：**
- 从区块链查询玩家的蛋 NFT

### useHatchEgg
```typescript
const { hatchEgg } = useHatchEgg();

await hatchEgg(
  eggId,
  offspringSpecies,
  offspringName,
  offspringTypes
);
```

**功能：**
- 孵化蛋，铸造宝可梦 NFT

## 🎮 用户体验

### Encounter 页面
1. 遇到野生宝可梦
2. 点击"Attempt Capture"
3. 系统计算捕捉率
4. 如果成功：
   - 调用智能合约
   - 铸造 Pokemon NFT
   - 显示成功消息
5. 如果失败：
   - 显示失败消息
   - 可以再次尝试或逃跑

### Island Explorer
1. 移动角色靠近野生宝可梦
2. 按 E 键触发遭遇
3. 选择战斗或直接捕捉
4. 如果捕捉：
   - 调用智能合约
   - 铸造 Pokemon NFT
   - 宝可梦从地图消失

### 繁殖系统
1. 选择两只宝可梦
2. 点击"Breed Pokémon"
3. 确认区块链交易
4. 蛋 NFT 创建成功
5. 赢 1 场战斗增加孵化进度
6. 孵化蛋铸造新的宝可梦 NFT

## 🔍 查询宝可梦

### 从区块链查询
```typescript
// 使用 Sui SDK
const { data } = useSuiClientQuery(
  'getOwnedObjects',
  {
    owner: walletAddress,
    filter: {
      StructType: `${PACKAGE_ID}::pokemon::Pokemon`,
    },
    options: {
      showContent: true,
      showType: true,
    },
  }
);
```

### 不再从 Firebase 查询
```typescript
// ❌ 旧方法 - 不再使用
const q = query(
  collection(db, 'pokemon'),
  where('owner', '==', walletAddress)
);
```

## ⚠️ 注意事项

### Gas 费用
- 每次捕捉需要支付 gas 费
- 每次繁殖需要支付 gas 费
- 每次孵化需要支付 gas 费

### 交易确认
- 区块链交易需要时间确认
- 用户需要等待交易完成
- 显示加载状态

### 错误处理
- 用户拒绝交易
- Gas 不足
- 网络错误
- 智能合约错误

## 🚀 优势

### 完全去中心化
- ✅ 所有宝可梦数据在区块链上
- ✅ 不依赖中心化服务器
- ✅ 用户完全拥有资产

### 真正的 NFT
- ✅ 可以交易
- ✅ 可以转移
- ✅ 永久存储

### 透明性
- ✅ 所有交易公开可查
- ✅ 智能合约代码开源
- ✅ 无法作弊

## 📝 总结

现在整个系统：
- ✅ **捕捉** - 完全上链
- ✅ **繁殖** - 完全上链
- ✅ **孵化** - 完全上链
- ✅ **宝可梦数据** - 存储在区块链
- ✅ **查询** - 从区块链读取

不再使用 Firebase 存储宝可梦数据！🎉
