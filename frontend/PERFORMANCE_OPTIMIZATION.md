# Performance Optimization Guide

This document outlines the performance optimizations implemented in PokéChain Battles.

## Image Optimization

### Next.js Image Component
All Pokémon sprites and images use the Next.js `Image` component for automatic optimization:

```tsx
import Image from 'next/image';

<Image
  src={pokemon.sprite}
  alt={pokemon.name}
  width={256}
  height={256}
  priority // For above-the-fold images
  sizes="(max-width: 768px) 100vw, 256px"
/>
```

**Benefits:**
- Automatic WebP/AVIF conversion
- Lazy loading by default
- Responsive image sizing
- Blur placeholder support

### Remote Image Patterns
Configured in `next.config.ts` to allow Pokémon API sprites:
- `raw.githubusercontent.com/PokeAPI/sprites/**`
- `pokeapi.co/**`

## Incremental Static Regeneration (ISR)

### Static Pokémon Pages
The `/pokemon/[id]` route uses ISR for optimal performance:

```tsx
export async function generateStaticParams() {
  // Pre-generate 151 Pokémon pages at build time
  return Array.from({ length: 151 }, (_, i) => ({
    id: String(i + 1),
  }));
}

async function getPokemonData(id: string) {
  const response = await fetch(`${backendUrl}/api/pokemon/${id}`, {
    next: { revalidate: 86400 }, // Revalidate every 24 hours
  });
  return response.json();
}
```

**Benefits:**
- Pages served as static HTML
- No client-side data fetching delay
- Automatic background revalidation
- Reduced backend load

## Firestore Query Optimization

### Composite Indexes
Created `firestore.indexes.json` with optimized indexes:

1. **Battle History Query**
   - Fields: `playerId` (ASC), `createdAt` (DESC)
   - Use case: Fetch player's recent battles

2. **Marketplace Listings**
   - Fields: `status` (ASC), `nftType` (ASC), `price` (ASC/DESC)
   - Use case: Filter and sort marketplace

3. **Seller Listings**
   - Fields: `sellerAddress` (ASC), `status` (ASC)
   - Use case: View user's active listings

### Query Best Practices

```typescript
// ✅ Good: Uses composite index
const battles = await db
  .collection('battleHistory')
  .where('playerId', '==', walletAddress)
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();

// ❌ Bad: No index, slow query
const battles = await db
  .collection('battleHistory')
  .where('playerId', '==', walletAddress)
  .where('winner', '==', 'player')
  .orderBy('createdAt', 'desc')
  .get();
```

## Code Splitting and Bundle Optimization

### Package Import Optimization
Configured in `next.config.ts`:

```typescript
experimental: {
  optimizePackageImports: ['lucide-react', '@mysten/dapp-kit'],
}
```

### Dynamic Imports
Use for heavy components:

```tsx
import dynamic from 'next/dynamic';

const BattleField = dynamic(() => import('@/components/BattleField'), {
  loading: () => <SkeletonLoader />,
  ssr: false, // Disable SSR for client-only components
});
```

## Caching Strategy

### Backend Redis Cache
Pokémon data cached for 24 hours:

```python
@app.get("/api/pokemon/{pokemon_id}")
async def get_pokemon(pokemon_id: int):
    # Check Redis cache first
    cached = await redis_client.get(f"pokemon:{pokemon_id}")
    if cached:
        return json.loads(cached)
    
    # Fetch from PokéAPI and cache
    data = await fetch_from_pokeapi(pokemon_id)
    await redis_client.setex(f"pokemon:{pokemon_id}", 86400, json.dumps(data))
    return data
```

### Frontend Cache
React Query for client-side caching:

```typescript
const { data: pokemon } = useQuery({
  queryKey: ['pokemon', id],
  queryFn: () => fetchPokemon(id),
  staleTime: 1000 * 60 * 60, // 1 hour
  cacheTime: 1000 * 60 * 60 * 24, // 24 hours
});
```

## Performance Monitoring

### Lighthouse Audit
Run performance audit:

```bash
npm run build
npm run start
# In another terminal
npx lighthouse http://localhost:3000 --view
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Key Metrics to Monitor

1. **First Contentful Paint (FCP)**: < 1.8s
2. **Largest Contentful Paint (LCP)**: < 2.5s
3. **Time to Interactive (TTI)**: < 3.8s
4. **Cumulative Layout Shift (CLS)**: < 0.1
5. **First Input Delay (FID)**: < 100ms

## Production Optimizations

### Environment Variables
Set in production:

```env
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=https://api.pokechain.com
```

### Compiler Optimizations
Configured in `next.config.ts`:

```typescript
compiler: {
  removeConsole: process.env.NODE_ENV === 'production',
}
```

### Security Headers
Added security and caching headers:

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
  ];
}
```

## Testing Performance

### Load Testing
Use Artillery or k6 for load testing:

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 http://localhost:3000
```

### Bundle Analysis
Analyze bundle size:

```bash
npm install -D @next/bundle-analyzer

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

# Run analysis
ANALYZE=true npm run build
```

## Deployment Checklist

- [ ] Run Lighthouse audit (all scores > 90)
- [ ] Deploy Firestore indexes
- [ ] Configure Redis cache
- [ ] Enable production optimizations
- [ ] Set up CDN for static assets
- [ ] Configure monitoring (Sentry, LogRocket)
- [ ] Test on real OneChain testnet
- [ ] Verify image optimization
- [ ] Check bundle size (< 500KB initial load)
- [ ] Test on mobile devices

## Continuous Optimization

1. **Monitor Core Web Vitals** in production
2. **Review bundle size** with each deployment
3. **Optimize images** regularly
4. **Update dependencies** for performance improvements
5. **Profile slow queries** in Firestore
6. **Cache frequently accessed data**
7. **Use CDN** for static assets
