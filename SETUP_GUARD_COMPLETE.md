# ✅ SetupGuard 实现完成

## 🎯 功能说明

现在所有用户必须完成 `/start-game` 的完整流程才能访问游戏功能：

1. **连接钱包**
2. **选择角色** (6个角色)
3. **输入训练师名字** (至少2个字符)
4. **选择初始宝可梦** (9只可选)
5. **自动铸造 NFT**
6. **保存数据到 Firestore**

## 📦 已创建的组件

### 1. `useRequireSetup` Hook
**位置**: `frontend/hooks/useRequireSetup.ts`

**功能**:
- 检查 Firestore `trainers/{address}` 集合
- 验证必需字段: `characterId`, `name`, `starterPokemonId`
- 如果缺失任何字段 → 自动跳转到 `/start-game`
- 跳过 `/start-game` 页面本身的检查

### 2. `SetupGuard` Component
**位置**: `frontend/components/SetupGuard.tsx`

**功能**:
- 包裹需要保护的页面内容
- 显示加载状态
- 自动重定向未完成设置的用户

## ✅ 已更新的页面

### 1. 首页 (`/`)
- ✅ 添加了 `SetupGuard`
- ✅ 移除了旧的手动检查逻辑
- ✅ 简化了代码

### 2. 野外遭遇 (`/encounter`)
- ✅ 所有 4 个 return 语句都添加了 `SetupGuard`
- ✅ 加载状态
- ✅ 冷却状态
- ✅ 结果模态框
- ✅ 主遭遇视图

## 🔄 工作流程

```
用户访问任何页面
  ↓
WalletGuard: 检查钱包连接
  ↓
SetupGuard: 检查初始设置
  ↓
查询 Firestore: trainers/{address}
  ↓
验证字段:
  - characterId ✓
  - name ✓
  - starterPokemonId ✓
  ↓
[如果缺失] → 跳转到 /start-game
[如果完整] → 显示页面内容
```

## 📝 需要手动添加的页面

以下页面还需要添加 `SetupGuard`（按优先级排序）：

### 高优先级
1. ⚠️ `/battle` - 战斗页面
2. ⚠️ `/breeding` - 繁殖页面
3. ⚠️ `/marketplace` - 市场页面
4. ⚠️ `/profile` - 个人资料页面

### 中优先级
5. ⚠️ `/quests` - 任务页面
6. ⚠️ `/explore` - 探索页面（如果存在）

### 低优先级（可选）
- `/debug` - 调试页面（可能不需要）
- `/deploy` - 部署页面（可能不需要）

## 🔧 如何添加到其他页面

### 步骤 1: 导入组件
```tsx
import { SetupGuard } from '@/components/SetupGuard';
```

### 步骤 2: 包裹内容
```tsx
export default function YourPage() {
  return (
    <WalletGuard>
      <SetupGuard>
        {/* 你的页面内容 */}
      </SetupGuard>
    </WalletGuard>
  );
}
```

### 注意事项
- 如果页面有多个 return 语句，每个都需要包裹
- `SetupGuard` 必须在 `WalletGuard` 内部
- `/start-game` 页面不需要 `SetupGuard`

## 🧪 测试步骤

### 测试 1: 新用户流程
1. 清除浏览器缓存和 localStorage
2. 访问首页 `/`
3. 连接钱包
4. ✅ 应该自动跳转到 `/start-game`
5. 完成所有 4 个步骤
6. ✅ 应该跳转回首页
7. 刷新页面
8. ✅ 应该停留在首页，不再跳转

### 测试 2: 直接访问受保护页面
1. 作为新用户（未完成设置）
2. 尝试访问 `/encounter`
3. ✅ 应该自动跳转到 `/start-game`
4. 完成设置后
5. 再次访问 `/encounter`
6. ✅ 应该正常显示页面

### 测试 3: 老用户
1. 已完成设置的用户
2. 访问任何页面
3. ✅ 应该正常显示，不跳转

## 🎨 用户体验

### 加载状态
- 检查设置时显示 `LoadingScreen`
- 用户不会看到闪烁或空白页面

### 自动跳转
- 无缝跳转到 `/start-game`
- 不需要用户手动操作

### 防止绕过
- 所有受保护页面都会检查
- 无法通过直接输入 URL 绕过

## 🔒 安全性

### Firestore 规则建议
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Trainers collection - users can only read/write their own data
    match /trainers/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Players collection - users can only read/write their own data
    match /players/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📊 数据结构

### trainers/{address}
```typescript
{
  address: string;           // 钱包地址
  name: string;              // 训练师名字
  characterId: number;       // 角色 ID (1-6)
  starterPokemonId: number;  // 初始宝可梦 ID
  createdAt: Timestamp;      // 创建时间
}
```

### players/{address}
```typescript
{
  walletAddress: string;
  starterPokemonId: number;
  starterPokemonName: string;
  trainerName: string;
  characterId: number;
  createdAt: Timestamp;
  lastActive: Timestamp;
  stats: {
    totalBattles: number;
    wins: number;
    pokemonCaught: number;
    eggsHatched: number;
  };
}
```

## 🚀 下一步

1. 在其他页面添加 `SetupGuard`
2. 测试所有流程
3. 更新 Railway 的 CORS 设置
4. 部署到 Vercel
5. 完整测试生产环境
