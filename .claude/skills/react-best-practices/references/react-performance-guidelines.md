# React Performance Guidelines for Mattermost

Comprehensive performance optimization guide for React/TypeScript code.
Adapted from Vercel Engineering guidelines for Mattermost plugin development.

## Priority Order

Optimizations are ranked by impact:

1. **CRITICAL**: Async waterfalls, barrel imports
2. **HIGH**: Dynamic imports, Map/Set lookups
3. **MEDIUM**: Re-render optimization, effect dependencies
4. **LOW**: Combined iterations, early returns

## 1. CRITICAL: Eliminate Async Waterfalls

The #1 performance killer is sequential await operations.

### Pattern: Promise.all for Independent Operations

```typescript
// Impact: 2-10x faster

// BAD
const channels = await getChannels();
const threads = await getThreads(channelId);
const posts = await getPosts(channelId);

// GOOD
const [channels, threads, posts] = await Promise.all([
  getChannels(),
  getThreads(channelId),
  getPosts(channelId),
]);
```

See: `rules/async-parallel.md`

## 2. CRITICAL: Bundle Size Optimization

### Pattern: Avoid Barrel Imports

```typescript
// Impact: 200-800ms faster imports

// BAD - loads entire library
import { Icon } from '@mattermost/compass-icons/components';

// GOOD - loads single icon
import { Icon } from '@mattermost/compass-icons/components/icon-name';
```

Common offenders in Mattermost:
- `@mattermost/compass-icons/components`
- `lodash`
- `date-fns`

See: `rules/bundle-barrel-imports.md`

## 3. HIGH: Data Structure Optimization

### Pattern: Map for O(1) Lookups

```typescript
// Impact: O(n) to O(1) per lookup

// BAD - O(n) per find
const post = posts.find(p => p.id === postId);

// GOOD - O(1) lookup
const postMap = new Map(posts.map(p => [p.id, p]));
const post = postMap.get(postId);
```

### Pattern: Set for Membership Checks

```typescript
// BAD - O(n) per includes
if (selectedIds.includes(id)) { ... }

// GOOD - O(1) per has
const selectedSet = new Set(selectedIds);
if (selectedSet.has(id)) { ... }
```

See: `rules/js-index-maps.md`, `rules/js-set-map-lookups.md`

## 4. MEDIUM: Re-render Prevention

### Pattern: Narrow Effect Dependencies

```typescript
// BAD - runs on any post change
useEffect(() => { ... }, [post]);

// GOOD - runs only when id changes
useEffect(() => { ... }, [post.id]);
```

### Pattern: Use Transitions

```typescript
// BAD - blocks UI
setSearchQuery(query);
setFilteredChannels(filter(channels, query));

// GOOD - non-blocking
setSearchQuery(query);
startTransition(() => {
  setFilteredChannels(filter(channels, query));
});
```

See: `rules/rerender-dependencies.md`, `rules/rerender-transitions.md`

## 5. LOW-MEDIUM: Iteration Optimization

### Pattern: Single-Pass Processing

```typescript
// BAD - 3 passes
const a = items.filter(x => x.a);
const b = items.filter(x => x.b);
const c = items.filter(x => x.c);

// GOOD - 1 pass
const a = [], b = [], c = [];
for (const item of items) {
  if (item.a) a.push(item);
  if (item.b) b.push(item);
  if (item.c) c.push(item);
}
```

See: `rules/js-combine-iterations.md`

## Mattermost-Specific Guidelines

### Redux Selectors

- Use `createSelector` for derived data
- Return stable references (avoid creating new objects)
- Use Maps for ID-based lookups in selectors

## Quick Reference

| Pattern | Impact | When to Use |
|---------|--------|-------------|
| Promise.all | CRITICAL | Independent async ops |
| Direct imports | CRITICAL | Any icon/utility import |
| Map lookups | HIGH | Multiple .find() calls |
| Set membership | HIGH | Multiple .includes() |
| Primitive deps | MEDIUM | useEffect/useCallback |
| startTransition | MEDIUM | Non-urgent updates |
| Single-pass | LOW | Multiple filters |
