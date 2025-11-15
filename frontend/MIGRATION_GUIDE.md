# Migration Guide: Integrating New UI Components

This guide helps you integrate the new UI/UX components into existing pages.

## 🔄 Quick Migration Checklist

- [ ] Replace custom loading spinners with `LoadingSpinner`
- [ ] Add skeleton loaders for data fetching
- [ ] Replace alert/console with `toast` notifications
- [ ] Wrap pages in `ResponsiveContainer`
- [ ] Use `Card` component for content blocks
- [ ] Add `ErrorBoundary` around risky components
- [ ] Test dark mode appearance
- [ ] Verify mobile responsiveness

## 📝 Step-by-Step Migration

### 1. Update Imports

**Before:**
```tsx
import { useState } from 'react';
```

**After:**
```tsx
import { useState } from 'react';
import { 
  LoadingSpinner, 
  Card, 
  Button, 
  ResponsiveContainer,
  PageHeader 
} from '@/components';
import { toast } from '@/lib/toast';
```

### 2. Replace Loading States

**Before:**
```tsx
if (isLoading) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />
    </div>
  );
}
```

**After:**
```tsx
import { LoadingScreen } from '@/components';

if (isLoading) {
  return <LoadingScreen message="Loading your Pokémon..." />;
}
```

### 3. Add Skeleton Loaders

**Before:**
```tsx
{isLoading ? (
  <div>Loading...</div>
) : (
  <PokemonCard pokemon={pokemon} />
)}
```

**After:**
```tsx
import { PokemonCardSkeleton } from '@/components';

{isLoading ? (
  <PokemonCardSkeleton />
) : (
  <PokemonCard pokemon={pokemon} />
)}
```

### 4. Replace Alerts with Toasts

**Before:**
```tsx
try {
  await capturePokemon(id);
  alert('Pokémon captured!');
} catch (error) {
  alert('Capture failed');
}
```

**After:**
```tsx
import { toast } from '@/lib/toast';

try {
  await capturePokemon(id);
  toast.pokemonCaptured(pokemon.name);
} catch (error) {
  toast.error('Capture failed', error.message);
}
```

### 5. Use Responsive Container

**Before:**
```tsx
<div className="container mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold mb-6">My Page</h1>
  {content}
</div>
```

**After:**
```tsx
import { ResponsiveContainer, PageHeader } from '@/components';

<ResponsiveContainer maxWidth="xl" className="py-8">
  <PageHeader 
    title="My Page" 
    description="Page description"
  />
  {content}
</ResponsiveContainer>
```

### 6. Replace Custom Cards

**Before:**
```tsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  {content}
</div>
```

**After:**
```tsx
import { Card } from '@/components';

<Card hover className="p-6">
  {content}
</Card>
```

### 7. Use Grid System

**Before:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>
```

**After:**
```tsx
import { Grid } from '@/components';

<Grid cols={3} gap={4}>
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</Grid>
```

### 8. Replace Custom Buttons

**Before:**
```tsx
<button
  onClick={handleClick}
  disabled={isLoading}
  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

**After:**
```tsx
import { Button } from '@/components';

<Button
  onClick={handleClick}
  loading={isLoading}
  variant="primary"
>
  Submit
</Button>
```

### 9. Add Error Boundaries

**Before:**
```tsx
<MyComponent />
```

**After:**
```tsx
import { ErrorBoundary } from '@/components';

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### 10. Use Async Action Hook

**Before:**
```tsx
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await submitData();
    alert('Success!');
  } catch (err) {
    setError(err);
    alert('Failed!');
  } finally {
    setIsLoading(false);
  }
};
```

**After:**
```tsx
import { useAsyncAction } from '@/hooks/useAsyncAction';

const { execute, isLoading } = useAsyncAction(
  submitData,
  {
    loadingMessage: 'Submitting...',
    successMessage: 'Success!',
    errorMessage: 'Failed to submit'
  }
);

const handleSubmit = () => execute();
```

## 🎨 Dark Mode Support

Add dark mode classes to your components:

**Before:**
```tsx
<div className="bg-white text-gray-900 border-gray-200">
  Content
</div>
```

**After:**
```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
  Content
</div>
```

## 🎬 Adding Animations

### Entrance Animations

```tsx
<div className="animate-fade-in">
  Content fades in
</div>

<div className="animate-slide-in-left">
  Content slides from left
</div>

<div className="animate-scale-in">
  Content scales up
</div>
```

### Staggered Animations

```tsx
{items.map((item, index) => (
  <div 
    key={item.id}
    className="animate-fade-in"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    {item.content}
  </div>
))}
```

### Hover Effects

```tsx
<div className="card-hover">
  Lifts on hover
</div>

<button className="btn-hover-lift">
  Button lifts on hover
</button>
```

## 📱 Mobile Responsiveness

### Responsive Text

```tsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

### Responsive Spacing

```tsx
<div className="p-4 sm:p-6 lg:p-8">
  Responsive padding
</div>
```

### Responsive Layout

```tsx
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Column 1</div>
  <div className="w-full md:w-1/2">Column 2</div>
</div>
```

## 🎮 Battle Page Example

**Before:**
```tsx
export default function BattlePage() {
  const [isLoading, setIsLoading] = useState(true);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1>Battle</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>Player</div>
        <div>Opponent</div>
      </div>
    </div>
  );
}
```

**After:**
```tsx
import { 
  ResponsiveContainer, 
  PageHeader, 
  LoadingScreen,
  BattleFieldSkeleton 
} from '@/components';

export default function BattlePage() {
  const [isLoading, setIsLoading] = useState(true);
  
  if (isLoading) {
    return <LoadingScreen message="Preparing battle..." />;
  }
  
  return (
    <ResponsiveContainer maxWidth="2xl" className="py-8">
      <PageHeader 
        title="Battle Arena" 
        description="Challenge your opponent!"
      />
      <div className="animate-fade-in">
        <BattleField />
      </div>
    </ResponsiveContainer>
  );
}
```

## 🛒 Marketplace Page Example

**Before:**
```tsx
export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  return (
    <div className="container mx-auto p-4">
      <h1>Marketplace</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {listings.map(listing => (
            <div key={listing.id}>{listing.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**After:**
```tsx
import { 
  ResponsiveContainer, 
  PageHeader, 
  Grid,
  MarketplaceGridSkeleton 
} from '@/components';

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  return (
    <ResponsiveContainer maxWidth="2xl" className="py-8">
      <PageHeader 
        title="NFT Marketplace" 
        description="Trade Pokémon and Eggs"
      />
      {loading ? (
        <MarketplaceGridSkeleton />
      ) : (
        <Grid cols={4} gap={4} className="animate-fade-in">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </Grid>
      )}
    </ResponsiveContainer>
  );
}
```

## 🎯 Profile Page Example

**Before:**
```tsx
export default function ProfilePage() {
  const { pokemon, loading } = usePlayerPokemon();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="container mx-auto p-4">
      <h1>Profile</h1>
      <div className="grid grid-cols-3 gap-4">
        {pokemon.map(p => (
          <div key={p.id}>{p.name}</div>
        ))}
      </div>
    </div>
  );
}
```

**After:**
```tsx
import { 
  ResponsiveContainer, 
  PageHeader, 
  Grid,
  Card,
  ProfileSkeleton 
} from '@/components';

export default function ProfilePage() {
  const { pokemon, loading } = usePlayerPokemon();
  
  if (loading) return <ProfileSkeleton />;
  
  return (
    <ResponsiveContainer maxWidth="2xl" className="py-8">
      <PageHeader 
        title="Your Collection" 
        description={`${pokemon.length} Pokémon`}
      />
      <Grid cols={3} gap={4} className="animate-fade-in">
        {pokemon.map(p => (
          <Card key={p.id} hover>
            <PokemonCard pokemon={p} />
          </Card>
        ))}
      </Grid>
    </ResponsiveContainer>
  );
}
```

## ✅ Testing Checklist

After migration, test:

- [ ] Page loads without errors
- [ ] Loading states display correctly
- [ ] Skeleton loaders appear during data fetch
- [ ] Toast notifications work
- [ ] Dark mode looks good
- [ ] Mobile layout is responsive
- [ ] Animations are smooth
- [ ] Buttons are accessible
- [ ] Error boundaries catch errors
- [ ] Navigation works on mobile

## 🚨 Common Issues

### Issue: Hydration Mismatch
**Solution:** Use `suppressHydrationWarning` on html tag (already done in layout)

### Issue: Dark Mode Flicker
**Solution:** DarkModeToggle component handles this with mounted state

### Issue: Animation Performance
**Solution:** Use CSS animations (GPU-accelerated) instead of JS

### Issue: Toast Not Showing
**Solution:** Ensure ToastProvider is in layout (already done)

### Issue: Mobile Menu Not Closing
**Solution:** Navigation component handles this automatically

## 📚 Additional Resources

- Component documentation: `UI_UX_GUIDE.md`
- Component overview: `UI_COMPONENTS_OVERVIEW.md`
- Task completion: `TASK_15_COMPLETION_SUMMARY.md`

## 🎉 You're Done!

Your page is now using the new UI components with:
- ✅ Better loading states
- ✅ Smooth animations
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Error handling
- ✅ Accessibility features

Happy coding! 🚀
