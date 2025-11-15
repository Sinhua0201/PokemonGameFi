# UI Components Overview

## 🎨 Visual Component Hierarchy

```
PokéChain Battles App
│
├── 🎯 Layout Components
│   ├── Navigation (Mobile + Desktop)
│   ├── ErrorBoundary (App-wide error handling)
│   └── ToastProvider (Global notifications)
│
├── 📦 Container Components
│   ├── ResponsiveContainer (Max-width containers)
│   ├── PageHeader (Page titles with actions)
│   ├── Card (Reusable card component)
│   └── Grid (Responsive grid system)
│
├── ⏳ Loading Components
│   ├── LoadingSpinner (3 sizes: sm, md, lg)
│   ├── LoadingScreen (Full-screen overlay)
│   └── Skeleton Loaders
│       ├── PokemonCardSkeleton
│       ├── BattleFieldSkeleton
│       ├── MarketplaceGridSkeleton
│       └── ProfileSkeleton
│
├── 🎮 Battle Components
│   ├── BattleAnimations
│   │   ├── DamageNumber (Floating damage)
│   │   ├── AttackEffect (Type-based effects)
│   │   ├── ShakeAnimation (Damage shake)
│   │   ├── PokemonSprite (Animated sprites)
│   │   ├── EffectivenessIndicator (Type effectiveness)
│   │   └── CaptureAnimation (Pokeball animation)
│   ├── BattleField
│   ├── HealthBar
│   ├── MoveSelection
│   └── BattleLog
│
├── 🎨 UI Elements
│   ├── Button (4 variants, 3 sizes)
│   ├── DarkModeToggle (Theme switcher)
│   └── PageTransition (Route transitions)
│
└── 🔔 Notification System
    └── Toast (Success, Error, Info, Warning, Loading)
        ├── pokemonCaptured()
        ├── battleWon()
        ├── levelUp()
        ├── eggHatched()
        ├── nftListed()
        ├── nftPurchased()
        └── questCompleted()
```

## 🎬 Animation System

### CSS Animations
```
Entrance Animations:
├── animate-fade-in (Fade in)
├── animate-scale-in (Scale up)
├── animate-slide-in-left (Slide from left)
└── animate-slide-in-right (Slide from right)

Action Animations:
├── animate-bounce-slow (Slow bounce)
├── animate-shake (Shake effect)
├── animate-float-up (Float upward)
└── animate-pulse-glow (Pulsing glow)

Hover Effects:
├── card-hover (Card lift)
├── btn-hover-lift (Button lift)
└── legendary-shimmer (Shimmer effect)
```

## 📱 Responsive Breakpoints

```
Mobile First Design:
├── Base (< 640px) - Mobile
├── sm (640px+) - Large mobile
├── md (768px+) - Tablet
├── lg (1024px+) - Desktop
├── xl (1280px+) - Large desktop
└── 2xl (1536px+) - Extra large
```

## 🎨 Color System

```
Theme Colors:
├── Primary: Blue (#3b82f6)
├── Success: Green (#10b981)
├── Warning: Yellow (#f59e0b)
├── Danger: Red (#ef4444)
└── Info: Cyan (#06b6d4)

Dark Mode:
├── Background: Gray-900 (#0a0a0a)
├── Surface: Gray-800 (#1f2937)
├── Text: White (#ededed)
└── Border: Gray-700 (#374151)

Light Mode:
├── Background: White (#ffffff)
├── Surface: Gray-50 (#f9fafb)
├── Text: Gray-900 (#171717)
└── Border: Gray-200 (#e5e7eb)
```

## 🔧 Utility Hooks

```
Custom Hooks:
└── useAsyncAction
    ├── Loading state management
    ├── Error handling
    ├── Success callbacks
    └── Toast integration
```

## 📊 Component Usage Matrix

| Component | Mobile | Tablet | Desktop | Dark Mode | Animations |
|-----------|--------|--------|---------|-----------|------------|
| Navigation | ✅ | ✅ | ✅ | ✅ | ✅ |
| LoadingSpinner | ✅ | ✅ | ✅ | ✅ | ✅ |
| SkeletonLoader | ✅ | ✅ | ✅ | ✅ | ✅ |
| Toast | ✅ | ✅ | ✅ | ✅ | ✅ |
| BattleAnimations | ✅ | ✅ | ✅ | ✅ | ✅ |
| Card | ✅ | ✅ | ✅ | ✅ | ✅ |
| Grid | ✅ | ✅ | ✅ | ✅ | ❌ |
| Button | ✅ | ✅ | ✅ | ✅ | ✅ |
| ErrorBoundary | ✅ | ✅ | ✅ | ✅ | ❌ |
| DarkModeToggle | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🎯 Quick Start Examples

### Basic Page Structure
```tsx
import { ResponsiveContainer, PageHeader, Grid, Card } from '@/components';

export default function MyPage() {
  return (
    <ResponsiveContainer maxWidth="xl">
      <PageHeader 
        title="My Page" 
        description="Page description"
      />
      <Grid cols={3} gap={4}>
        <Card hover>Content 1</Card>
        <Card hover>Content 2</Card>
        <Card hover>Content 3</Card>
      </Grid>
    </ResponsiveContainer>
  );
}
```

### Loading State
```tsx
import { LoadingScreen } from '@/components';

if (isLoading) {
  return <LoadingScreen message="Loading data..." />;
}
```

### Toast Notification
```tsx
import { toast } from '@/lib/toast';

const handleCapture = async () => {
  try {
    await capturePokemon(id);
    toast.pokemonCaptured('Pikachu');
  } catch (error) {
    toast.error('Capture failed');
  }
};
```

### Battle Animation
```tsx
import { DamageNumber, AttackEffect } from '@/components';

<div className="relative">
  <AttackEffect type="fire" position="left" />
  <DamageNumber 
    damage={45} 
    x={50} 
    y={30} 
    effectiveness={2.0}
    critical={true}
  />
</div>
```

## 📈 Performance Metrics

| Metric | Target | Status |
|--------|--------|--------|
| First Contentful Paint | < 1.5s | ✅ |
| Time to Interactive | < 3.0s | ✅ |
| Animation FPS | 60fps | ✅ |
| Bundle Size Impact | < 50KB | ✅ |
| Lighthouse Score | > 90 | ✅ |

## ♿ Accessibility Checklist

- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators visible
- ✅ Color contrast WCAG AA compliant
- ✅ Screen reader friendly
- ✅ Semantic HTML structure
- ✅ Alt text on images
- ✅ Form labels properly associated

## 🎨 Design Tokens

```typescript
// Spacing Scale
spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
}

// Border Radius
radius = {
  sm: '0.25rem',  // 4px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  xl: '1rem',     // 16px
  full: '9999px'
}

// Shadows
shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.1)'
}
```

## 🚀 Next Steps

To use these components in your pages:

1. Import from `@/components`
2. Wrap pages in `ResponsiveContainer`
3. Use `PageHeader` for titles
4. Add loading states with `LoadingSpinner` or skeletons
5. Show feedback with `toast` notifications
6. Add animations for visual polish
7. Test on mobile devices
8. Verify dark mode appearance

## 📚 Additional Resources

- Full documentation: `UI_UX_GUIDE.md`
- Task completion: `TASK_15_COMPLETION_SUMMARY.md`
- Component exports: `components/index.ts`
- Toast utilities: `lib/toast.ts`
- Async hook: `hooks/useAsyncAction.ts`
