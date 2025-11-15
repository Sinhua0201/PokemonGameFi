# UI/UX Polish and Animations Guide

This guide documents all the UI/UX improvements implemented in Task 15.

## 🎨 Components Overview

### Loading States

#### LoadingSpinner
A versatile spinner component with three sizes:
```tsx
import { LoadingSpinner, LoadingScreen } from '@/components/LoadingSpinner';

// Small spinner
<LoadingSpinner size="sm" />

// Medium spinner (default)
<LoadingSpinner size="md" />

// Large spinner
<LoadingSpinner size="lg" />

// Full-screen loading overlay
<LoadingScreen message="Loading your adventure..." />
```

#### SkeletonLoader
Skeleton loaders for different content types:
```tsx
import { 
  Skeleton, 
  PokemonCardSkeleton, 
  BattleFieldSkeleton,
  MarketplaceGridSkeleton,
  ProfileSkeleton 
} from '@/components/SkeletonLoader';

// Generic skeleton
<Skeleton className="h-8 w-32" />

// Pre-built skeletons
<PokemonCardSkeleton />
<BattleFieldSkeleton />
<MarketplaceGridSkeleton />
<ProfileSkeleton />
```

### Toast Notifications

Comprehensive toast system using Sonner:
```tsx
import { toast } from '@/lib/toast';

// Basic toasts
toast.success('Success message');
toast.error('Error message');
toast.info('Info message');
toast.warning('Warning message');

// Loading toast
const toastId = toast.loading('Processing...');

// Promise-based toast
toast.promise(
  fetchData(),
  {
    loading: 'Loading...',
    success: 'Data loaded!',
    error: 'Failed to load data'
  }
);

// Game-specific toasts
toast.pokemonCaptured('Pikachu');
toast.battleWon(150);
toast.levelUp('Charizard', 36);
toast.eggHatched('Togepi');
toast.nftListed('5.0');
toast.nftPurchased('Mewtwo');
toast.questCompleted('Catch 5 Pokémon');
```

### Page Transitions

Smooth fade transitions between pages:
```tsx
import { PageTransition } from '@/components/PageTransition';

<PageTransition>
  {children}
</PageTransition>
```

### Error Boundary

Catch and display errors gracefully:
```tsx
import { ErrorBoundary, ErrorFallback } from '@/components/ErrorBoundary';

// Wrap your app or components
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

### Dark Mode Toggle

Theme switcher with localStorage persistence:
```tsx
import { DarkModeToggle } from '@/components/DarkModeToggle';

<DarkModeToggle />
```

### Navigation

Responsive navigation with mobile menu:
```tsx
import { Navigation } from '@/components/Navigation';

// Already included in root layout
<Navigation />
```

### Battle Animations

Rich battle effects and animations:
```tsx
import { 
  DamageNumber,
  AttackEffect,
  ShakeAnimation,
  PokemonSprite,
  EffectivenessIndicator,
  CaptureAnimation
} from '@/components/BattleAnimations';

// Damage numbers
<DamageNumber 
  damage={45} 
  x={50} 
  y={30} 
  effectiveness={2.0} 
  critical={true} 
/>

// Attack effects
<AttackEffect type="fire" position="left" />

// Shake animation
<ShakeAnimation trigger={isHit}>
  <BattlePokemonSprite src={sprite} alt="Pokemon" />
</ShakeAnimation>

// Battle Pokemon sprite with states
<BattlePokemonSprite 
  src={sprite}
  alt="Pikachu"
  isPlayer={true}
  isAttacking={isAttacking}
  isFainted={hp === 0}
/>

// Effectiveness indicator
<EffectivenessIndicator effectiveness={2.0} />

// Capture animation
<CaptureAnimation 
  success={captured} 
  onComplete={() => console.log('Done')} 
/>
```

### Responsive Components

Pre-built responsive utilities:
```tsx
import { 
  ResponsiveContainer,
  PageHeader,
  Card,
  Grid,
  Button
} from '@/components/ResponsiveContainer';

// Container with max-width
<ResponsiveContainer maxWidth="xl">
  {children}
</ResponsiveContainer>

// Page header
<PageHeader 
  title="My Page"
  description="Page description"
  action={<Button>Action</Button>}
/>

// Card component
<Card hover onClick={() => {}}>
  Content
</Card>

// Responsive grid
<Grid cols={3} gap={4}>
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</Grid>

// Button with variants
<Button 
  variant="primary" 
  size="md" 
  loading={isLoading}
  fullWidth
>
  Submit
</Button>
```

## 🎬 Animations

### CSS Animations

Available animation classes:
- `animate-bounce-slow` - Slow bouncing animation
- `animate-shake` - Shake effect for damage
- `animate-float-up` - Floating damage numbers
- `animate-slide-in-right` - Slide from right
- `animate-slide-in-left` - Slide from left
- `animate-fade-in` - Fade in effect
- `animate-scale-in` - Scale up effect
- `animate-pulse-glow` - Pulsing glow effect

### Hover Effects

Pre-built hover classes:
- `card-hover` - Card lift on hover
- `btn-hover-lift` - Button lift on hover
- `legendary-shimmer` - Shimmer effect for legendary items

### Usage Examples

```tsx
// Animated entrance
<div className="animate-fade-in">
  Content appears smoothly
</div>

// Staggered animations
<div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
  Item 1
</div>
<div className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
  Item 2
</div>

// Hover effects
<div className="card-hover">
  Lifts on hover
</div>
```

## 📱 Responsive Design

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach

All components are built mobile-first with responsive utilities:

```tsx
// Responsive text sizes
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
  Responsive Heading
</h1>

// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items}
</div>

// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">
  Content
</div>
```

## 🎯 Async Action Hook

Simplify async operations with loading states:

```tsx
import { useAsyncAction } from '@/hooks/useAsyncAction';

function MyComponent() {
  const { execute, isLoading, error } = useAsyncAction(
    async (pokemonId: number) => {
      return await capturePokemon(pokemonId);
    },
    {
      loadingMessage: 'Capturing Pokémon...',
      successMessage: 'Pokémon captured!',
      errorMessage: 'Capture failed',
      onSuccess: (data) => {
        console.log('Success:', data);
      }
    }
  );

  return (
    <Button 
      onClick={() => execute(25)} 
      loading={isLoading}
    >
      Capture
    </Button>
  );
}
```

## 🎨 Dark Mode

Dark mode is automatically applied based on:
1. User preference (localStorage)
2. System preference (prefers-color-scheme)

### Using Dark Mode Classes

```tsx
// Background colors
<div className="bg-white dark:bg-gray-800">
  Content
</div>

// Text colors
<p className="text-gray-900 dark:text-white">
  Text
</p>

// Border colors
<div className="border-gray-200 dark:border-gray-700">
  Content
</div>
```

## ♿ Accessibility

### Focus Styles

All interactive elements have visible focus indicators:
```css
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

### ARIA Labels

```tsx
<button aria-label="Toggle dark mode">
  <Moon />
</button>

<div role="status" aria-label="Loading">
  <LoadingSpinner />
</div>
```

### Keyboard Navigation

All interactive components support keyboard navigation.

## 🎮 Best Practices

### Loading States

Always show loading states for async operations:
```tsx
{isLoading ? <LoadingSpinner /> : <Content />}
```

### Error Handling

Wrap components in ErrorBoundary:
```tsx
<ErrorBoundary>
  <RiskyComponent />
</ErrorBoundary>
```

### Toast Notifications

Use appropriate toast types:
- Success: Completed actions
- Error: Failed operations
- Info: General information
- Warning: Cautionary messages
- Loading: Ongoing operations

### Animations

- Keep animations subtle and purposeful
- Use appropriate durations (200-500ms)
- Provide reduced motion support
- Don't overuse animations

### Responsive Design

- Test on multiple screen sizes
- Use responsive utilities
- Ensure touch targets are at least 44x44px
- Optimize images for mobile

## 📦 Component Exports

All components are exported from `@/components/index.ts` for easy imports:

```tsx
import { 
  LoadingSpinner,
  Card,
  Button,
  toast
} from '@/components';
```

## 🚀 Performance Tips

1. **Lazy Load**: Use dynamic imports for heavy components
2. **Memoization**: Use React.memo for expensive renders
3. **Debounce**: Debounce search and filter inputs
4. **Virtual Lists**: Use virtual scrolling for long lists
5. **Image Optimization**: Use Next.js Image component

## 🎨 Customization

### Extending Animations

Add custom animations in `globals.css`:
```css
@keyframes custom-animation {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.animate-custom {
  animation: custom-animation 0.3s ease-out;
}
```

### Custom Toast Styles

Modify toast appearance in `Toast.tsx`:
```tsx
<Toaster
  position="top-right"
  toastOptions={{
    className: 'custom-toast-class',
    duration: 5000,
  }}
/>
```

## 📝 Summary

This implementation provides:
- ✅ Loading states for all async operations
- ✅ Skeleton loaders for data fetching
- ✅ Smooth page transitions
- ✅ Toast notifications system
- ✅ Battle animations (attack effects, damage numbers)
- ✅ Pokémon sprite animations
- ✅ Responsive design for mobile devices
- ✅ Error boundary components
- ✅ Dark mode toggle
- ✅ Comprehensive navigation
- ✅ Reusable UI components
- ✅ Accessibility features
- ✅ Performance optimizations
