# ✅ 初始流程整合完成

## 🎯 更新内容

### 1. 统一为 `/start-game` 流程

现在只有一个入口：`/start-game`

**完整流程：**
1. **连接钱包** - 用户连接 Sui 钱包
2. **选择角色** - 从 6 个角色中选择一个
3. **输入名字** - 设置训练师名字（至少 2 个字符）
4. **选择初始宝可梦** - 从 9 只宝可梦中选择一只：
   - Bulbasaur (妙蛙种子) - Grass/Poison
   - Charmander (小火龙) - Fire
   - Squirtle (杰尼龟) - Water
   - Pikachu (皮卡丘) - Electric
   - Eevee (伊布) - Normal
   - Chikorita (菊草叶) - Grass
   - Cyndaquil (火球鼠) - Fire
   - Totodile (小锯鳄) - Water
   - Togepi (波克比) - Fairy

5. **自动铸造 NFT** - 在区块链上铸造选中的宝可梦
6. **保存数据** - 保存到 Firestore：
   - `trainers/{address}` - 训练师信息
   - `players/{address}` - 玩家统计数据
   - `pokemon/{objectId}` - 宝可梦 NFT 数据

7. **跳转首页** - 完成后自动跳转到 `/`

### 2. 删除的内容

- ❌ `/starter` 页面（已删除）
- ❌ `StarterSelection` 组件（不再使用）
- ❌ 首页的 "Get Starter" 卡片（已移除）

### 3. 首页逻辑

- 新用户（没有训练师档案）→ 自动跳转到 `/start-game`
- 老用户（已有宝可梦）→ 显示游戏主界面

## 🔄 用户体验流程

```
新用户访问 / 
  ↓
检测到没有训练师档案
  ↓
自动跳转到 /start-game
  ↓
完成 4 步设置
  ↓
铸造 NFT + 保存数据
  ↓
跳转回 / (首页)
  ↓
开始游戏！
```

## 📝 技术细节

### 数据保存位置

1. **Firestore Collections:**
   - `trainers/{walletAddress}` - 训练师基本信息
   - `players/{walletAddress}` - 玩家游戏统计
   - `pokemon/{objectId}` - 宝可梦 NFT 详情

2. **Blockchain:**
   - OneChain 上的 Pokemon NFT
   - 使用 `pokemon::mint_starter` 函数

### 依赖的 Hooks

- `useMintPokemon` - 铸造宝可梦 NFT
- `usePlayerPokemon` - 获取玩家的宝可梦列表
- `useCurrentAccount` - 获取当前连接的钱包

## 🚀 部署注意事项

1. 确保 Railway 的 `CORS_ORIGINS` 包含 Vercel 域名
2. 确保 `.env.local` 中的 `NEXT_PUBLIC_ONECHAIN_PACKAGE_ID` 已设置
3. 确保 Firebase 配置正确

## 🧪 测试流程

1. 清除浏览器缓存和 localStorage
2. 访问首页 `/`
3. 应该自动跳转到 `/start-game`
4. 完成所有步骤
5. 确认 NFT 铸造成功
6. 确认跳转回首页
7. 刷新页面，确认不会再次跳转到 `/start-game`

## ✨ 优势

- **统一体验** - 只有一个入口，不会混淆
- **完整流程** - 角色选择 + 命名 + 宝可梦选择一气呵成
- **更多选择** - 9 只初始宝可梦而不是 3 只
- **自动化** - 铸造和数据保存全自动完成
- **防重复** - 已有宝可梦的用户不会再次进入设置流程
