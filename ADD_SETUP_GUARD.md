# 🛡️ 添加 SetupGuard 到所有页面

## 已创建的组件

1. **`useRequireSetup` Hook** (`frontend/hooks/useRequireSetup.ts`)
   - 检查用户是否完成初始设置
   - 检查 `trainers` collection 中的数据
   - 验证 `characterId`, `name`, `starterPokemonId` 都存在
   - 如果不完整，自动跳转到 `/start-game`

2. **`SetupGuard` Component** (`frontend/components/SetupGuard.tsx`)
   - 包裹需要保护的页面内容
   - 显示加载状态
   - 自动重定向未完成设置的用户

## 已更新的页面

✅ **首页** (`frontend/app/page.tsx`)
```tsx
<WalletGuard>
  <SetupGuard>
    {/* 页面内容 */}
  </SetupGuard>
</WalletGuard>
```

## 需要手动添加 SetupGuard 的页面

以下页面需要添加 `SetupGuard`：

### 1. `/encounter` - 野外遭遇
```tsx
import { SetupGuard } from '@/components/SetupGuard';

<WalletGuard>
  <SetupGuard>
    {/* 现有内容 */}
  </SetupGuard>
</WalletGuard>
```

### 2. `/battle` - 战斗
```tsx
import { SetupGuard } from '@/components/SetupGuard';

<WalletGuard>
  <SetupGuard>
    {/* 现有内容 */}
  </SetupGuard>
</WalletGuard>
```

### 3. `/breeding` - 繁殖
```tsx
import { SetupGuard } from '@/components/SetupGuard';

<WalletGuard>
  <SetupGuard>
    {/* 现有内容 */}
  </SetupGuard>
</WalletGuard>
```

### 4. `/marketplace` - 市场
```tsx
import { SetupGuard } from '@/components/SetupGuard';

<WalletGuard>
  <SetupGuard>
    {/* 现有内容 */}
  </SetupGuard>
</WalletGuard>
```

### 5. `/profile` - 个人资料
```tsx
import { SetupGuard } from '@/components/SetupGuard';

<WalletGuard>
  <SetupGuard>
    {/* 现有内容 */}
  </SetupGuard>
</WalletGuard>
```

### 6. `/quests` - 任务
```tsx
import { SetupGuard } from '@/components/SetupGuard';

<WalletGuard>
  <SetupGuard>
    {/* 现有内容 */}
  </SetupGuard>
</WalletGuard>
```

### 7. `/explore` - 探索（如果有）
```tsx
import { SetupGuard } from '@/components/SetupGuard';

<WalletGuard>
  <SetupGuard>
    {/* 现有内容 */}
  </SetupGuard>
</WalletGuard>
```

## 不需要 SetupGuard 的页面

- ❌ `/start-game` - 这是设置页面本身
- ❌ `/debug` - 调试页面
- ❌ `/deploy` - 部署页面

## 使用方法

1. 在页面顶部导入：
```tsx
import { SetupGuard } from '@/components/SetupGuard';
```

2. 在 `WalletGuard` 内部包裹内容：
```tsx
<WalletGuard>
  <SetupGuard>
    {/* 你的页面内容 */}
  </SetupGuard>
</WalletGuard>
```

## 工作原理

```
用户访问任何页面
  ↓
WalletGuard 检查钱包连接
  ↓
SetupGuard 检查初始设置
  ↓
检查 Firestore trainers/{address}
  ↓
验证: characterId + name + starterPokemonId
  ↓
如果缺失任何一项 → 跳转到 /start-game
  ↓
如果全部存在 → 显示页面内容
```

## 测试

1. 清除浏览器数据
2. 连接钱包
3. 尝试访问任何受保护的页面
4. 应该自动跳转到 `/start-game`
5. 完成设置后
6. 可以正常访问所有页面
