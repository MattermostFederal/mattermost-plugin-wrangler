# Use Set/Map for O(1) Lookups

**Impact:** LOW-MEDIUM (O(n) to O(1) per check)
**Tags:** javascript, performance, set, map, membership

## Problem

`Array.includes()` is O(n) per check:

```typescript
// BAD: O(n) per includes check
const allowedIds = ['a', 'b', 'c', ...];
items.filter(item => allowedIds.includes(item.id));

// In a loop, this becomes O(n^2)
selectedPostIds.forEach(id => {
  if (existingIds.includes(id)) { ... }
});
```

## Solution

Convert arrays to Set for O(1) membership checks:

```typescript
// GOOD: O(1) per has check
const allowedIds = new Set(['a', 'b', 'c', ...]);
items.filter(item => allowedIds.has(item.id));
```

## When to Use

- Checking membership in a list
- Filtering items against an allow/block list
- Deduplication checks
- Any repeated `.includes()` calls
