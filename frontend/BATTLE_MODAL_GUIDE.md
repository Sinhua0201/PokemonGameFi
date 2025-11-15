# 战斗 Modal 组件指南

## 概述

为 Island Explorer 创建了全新的战斗和捕捉 UI 系统，使用纯 CSS（无 Tailwind），提供更专业和清晰的用户体验。

## 新组件

### 1. BattleModal (`components/BattleModal.tsx`)

专业的战斗界面 Modal，包含：

**特性：**
- 上下分屏设计（野生宝可梦在上方蓝天背景，玩家宝可梦在下方草地背景）
- 实时 HP 条显示，带颜色变化（绿色 > 黄色 > 红色）
- 战斗日志显示最近 4 条消息
- 技能选择面板，显示技能名称、类型和威力
- 攻击、捕捉、逃跑按钮
- 响应式设计，支持移动端
- 流畅的动画效果

**使用方法：**
```tsx
<BattleModal
  wildPokemon={wildPokemon}
  playerPokemon={playerPokemon}
  wildHP={wildHP}
  wildMaxHP={wildMaxHP}
  playerHP={playerHP}
  playerMaxHP={playerMaxHP}
  battleLog={battleLog}
  moves={moves}
  isAttacking={isAttacking}
  onAttack={(move) => handleAttack(move)}
  onCatch={handleCatch}
  onFlee={handleFlee}
/>
```

### 2. PokemonSelectionModal (`components/PokemonSelectionModal.tsx`)

宝可梦选择界面 Modal，包含：

**特性：**
- 显示野生宝可梦信息（带抖动动画）
- 网格布局展示玩家的宝可梦（最多 6 只）
- 悬停效果和点击反馈
- 直接捕捉和逃跑选项
- 空状态提示（当玩家没有宝可梦时）
- 响应式设计

**使用方法：**
```tsx
<PokemonSelectionModal
  wildPokemon={wildPokemon}
  playerPokemonList={playerPokemonList}
  onSelectPokemon={(pokemon) => handleBattle(pokemon)}
  onCatch={handleCatch}
  onFlee={handleFlee}
/>
```

## 更新的组件

### IslandExplore (`components/scenes/IslandExplore.tsx`)

**改进：**
1. 移除了所有 Tailwind 类名
2. 使用新的 BattleModal 和 PokemonSelectionModal 组件
3. 简化了代码结构
4. 改进了 UI 信息面板的样式（使用纯 CSS）

## 测试页面

访问 `/test-battle-modal` 查看新 Modal 的演示：

**功能：**
- 测试战斗界面
- 测试选择界面
- 重置状态按钮
- 模拟战斗逻辑

## 设计特点

### 1. 无 Tailwind 依赖
- 所有样式使用 CSS-in-JS（styled-jsx）
- 更好的性能和可维护性
- 完全自定义的样式控制

### 2. 专业的 UI 设计
- 清晰的视觉层次
- 符合宝可梦游戏风格
- 流畅的动画和过渡效果

### 3. 响应式布局
- 桌面端优化
- 移动端适配
- 灵活的网格系统

### 4. 用户体验
- 清晰的操作反馈
- 禁用状态处理
- 加载状态显示
- 错误处理

## 样式系统

### 颜色方案
- **野生宝可梦区域：** 蓝色渐变（天空）
- **玩家宝可梦区域：** 绿色渐变（草地）
- **HP 条：** 绿色（>50%）、黄色（20-50%）、红色（<20%）
- **按钮：** 红色（攻击）、蓝色（捕捉）、灰色（逃跑/返回）

### 动画效果
- **淡入：** Modal 出现时
- **弹跳：** 宝可梦精灵图
- **抖动：** 野生宝可梦（选择界面）
- **悬停：** 按钮和卡片
- **HP 条：** 平滑过渡

## 浏览器兼容性

- Chrome/Edge: ✅ 完全支持
- Firefox: ✅ 完全支持
- Safari: ✅ 完全支持
- 移动浏览器: ✅ 完全支持

## 性能优化

1. **CSS-in-JS：** 使用 styled-jsx，样式作用域隔离
2. **条件渲染：** 只在需要时渲染 Modal
3. **图片优化：** 使用 pixelated 渲染保持像素风格
4. **动画优化：** 使用 transform 和 opacity 实现流畅动画

## 未来改进

- [ ] 添加音效支持
- [ ] 添加更多战斗动画
- [ ] 支持多种捕捉球类型
- [ ] 添加战斗统计信息
- [ ] 支持状态效果显示（中毒、麻痹等）

## 相关文件

- `frontend/components/BattleModal.tsx` - 战斗界面组件
- `frontend/components/PokemonSelectionModal.tsx` - 选择界面组件
- `frontend/components/scenes/IslandExplore.tsx` - 岛屿探索场景
- `frontend/app/test-battle-modal/page.tsx` - 测试页面
