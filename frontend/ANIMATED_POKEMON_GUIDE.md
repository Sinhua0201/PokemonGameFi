# 🎮 动态宝可梦精灵图指南

## ✨ 功能特性

### 1. 动态 GIF 精灵图
- ✅ 使用 PokéAPI Generation V (Black/White) 的动态 GIF
- ✅ 像素化渲染保持复古风格
- ✅ 前视图和后视图（用于战斗）
- ✅ 自动回退到静态图片

### 2. 宝可梦卡片组件
- ✅ 稀有度颜色和光效
- ✅ 类型徽章
- ✅ 属性显示
- ✅ 悬停动画
- ✅ 选中状态

### 3. 精灵图尺寸
- **Small (sm):** 16x16 - 用于列表
- **Medium (md):** 24x24 - 默认尺寸
- **Large (lg):** 32x32 - 卡片展示
- **Extra Large (xl):** 48x48 - 战斗场景

---

## 🎨 使用方法

### 1. 宝可梦卡片

```tsx
import { PokemonCard } from '@/components/PokemonCard';

<PokemonCard
  pokemon={pokemonData}
  onClick={() => console.log('Selected!')}
  selected={isSelected}
  showStats={true}
/>
```

### 2. 单独的精灵图

```tsx
import { PokemonSprite } from '@/components/PokemonCard';

<PokemonSprite
  sprite={pokemon.sprite}
  name={pokemon.name}
  size="lg"
  animate={true}
/>
```

### 3. 战斗场景

```tsx
// 你的宝可梦（背面）
<PokemonSprite
  sprite={pokemon.back_sprite}
  name={pokemon.name}
  size="xl"
/>

// 对手宝可梦（正面）
<PokemonSprite
  sprite={opponent.sprite}
  name={opponent.name}
  size="xl"
/>
```

---

## 🎯 测试页面

访问测试页面查看效果：

```
http://localhost:3000/test-pokemon
```

功能：
- 🎲 随机宝可梦生成器
- 📋 所有初始宝可梦展示
- 📏 不同尺寸对比
- ⚔️ 战斗视图预览

---

## 🎨 稀有度样式

### Common（普通）
- 颜色：灰色
- 边框：`border-gray-400`
- 背景：`bg-gray-50`

### Uncommon（不常见）
- 颜色：绿色
- 边框：`border-green-400`
- 背景：`bg-green-50`
- 光效：绿色阴影

### Rare（稀有）
- 颜色：蓝色
- 边框：`border-blue-400`
- 背景：`bg-blue-50`
- 光效：蓝色阴影

### Legendary（传说）
- 颜色：紫色
- 边框：`border-purple-400`
- 背景：`bg-purple-50`
- 光效：紫色阴影 + 脉冲动画

---

## 🎮 类型颜色

| 类型 | 颜色 | Tailwind Class |
|------|------|----------------|
| Normal | 灰色 | `bg-gray-400` |
| Fire | 红色 | `bg-red-500` |
| Water | 蓝色 | `bg-blue-500` |
| Electric | 黄色 | `bg-yellow-400` |
| Grass | 绿色 | `bg-green-500` |
| Ice | 青色 | `bg-cyan-400` |
| Fighting | 深红 | `bg-red-700` |
| Poison | 紫色 | `bg-purple-500` |
| Ground | 棕色 | `bg-yellow-700` |
| Flying | 靛蓝 | `bg-indigo-400` |
| Psychic | 粉色 | `bg-pink-500` |
| Bug | 黄绿 | `bg-lime-500` |
| Rock | 深棕 | `bg-yellow-800` |
| Ghost | 深紫 | `bg-purple-700` |
| Dragon | 深靛 | `bg-indigo-700` |
| Dark | 黑色 | `bg-gray-800` |
| Steel | 灰色 | `bg-gray-500` |
| Fairy | 浅粉 | `bg-pink-300` |

---

## 🔧 技术细节

### 精灵图来源

```typescript
// 优先级顺序：
1. Generation V 动态 GIF (推荐)
2. 默认前视图
3. 官方艺术图（回退）
```

### 像素化渲染

```css
.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

### 动画效果

```css
/* 缓慢弹跳 */
.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

/* 传说级闪光 */
.legendary-shimmer {
  background: linear-gradient(...);
  animation: shimmer 3s infinite;
}
```

---

## 📊 性能优化

### 1. 图片加载
- ✅ 使用原生 `<img>` 标签（GIF 支持）
- ✅ 懒加载（浏览器原生）
- ✅ 缓存优化

### 2. 动画性能
- ✅ CSS 动画（GPU 加速）
- ✅ 条件渲染
- ✅ 防抖处理

---

## 🎯 使用场景

### 1. 初始宝可梦选择
```tsx
<div className="grid grid-cols-3 gap-4">
  {starters.map(pokemon => (
    <PokemonCard
      key={pokemon.id}
      pokemon={pokemon}
      onClick={() => selectStarter(pokemon)}
      selected={selectedId === pokemon.id}
    />
  ))}
</div>
```

### 2. 野外遭遇
```tsx
<div className="encounter-screen">
  <PokemonSprite
    sprite={wildPokemon.sprite}
    name={wildPokemon.name}
    size="xl"
    animate={true}
  />
  <p>A wild {wildPokemon.name} appeared!</p>
</div>
```

### 3. 战斗场景
```tsx
<div className="battle-field">
  {/* 对手 */}
  <div className="opponent">
    <PokemonSprite sprite={opponent.sprite} size="xl" />
  </div>
  
  {/* 玩家 */}
  <div className="player">
    <PokemonSprite sprite={player.back_sprite} size="xl" />
  </div>
</div>
```

### 4. 收藏展示
```tsx
<div className="collection-grid">
  {collection.map(pokemon => (
    <PokemonCard
      key={pokemon.id}
      pokemon={pokemon}
      showStats={false}
    />
  ))}
</div>
```

---

## 🐛 故障排除

### 问题 1：图片不显示
**原因：** CORS 或网络问题

**解决：**
```tsx
// 检查图片 URL
console.log(pokemon.sprite);

// 确保 PokéAPI 可访问
fetch('https://pokeapi.co/api/v2/pokemon/1')
  .then(r => r.json())
  .then(console.log);
```

### 问题 2：动画不流畅
**原因：** GIF 文件较大

**解决：**
- 使用 loading="lazy"
- 预加载关键精灵图
- 考虑使用 WebP 格式

### 问题 3：像素化效果不明显
**原因：** CSS 未应用

**解决：**
```tsx
// 确保添加 pixelated 类
<img className="pixelated" ... />

// 检查 globals.css 是否导入
```

---

## 🎉 示例效果

### 普通宝可梦
- 灰色边框
- 静态或轻微动画
- 基础属性显示

### 稀有宝可梦
- 蓝色边框 + 光效
- 动态 GIF
- 完整属性显示

### 传说宝可梦
- 紫色边框 + 强光效
- 动态 GIF + 脉冲动画
- 闪光背景效果
- 完整属性 + 特殊标记

---

## 📚 相关文件

- **组件：** `frontend/components/PokemonCard.tsx`
- **样式：** `frontend/app/globals.css`
- **测试页面：** `frontend/app/test-pokemon/page.tsx`
- **Hooks：** `frontend/hooks/usePokemon.ts`
- **API：** `frontend/lib/api.ts`
- **后端服务：** `backend/services/pokemon_service.py`

---

## 🚀 下一步

1. ✅ 测试动态精灵图
2. ✅ 调整动画效果
3. ✅ 优化性能
4. ✅ 集成到游戏页面

**访问测试页面开始体验：** http://localhost:3000/test-pokemon

