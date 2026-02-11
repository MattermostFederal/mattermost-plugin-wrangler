# Build Index Maps for Repeated Lookups

**Impact:** HIGH (O(n) to O(1) per lookup)
**Tags:** javascript, performance, maps, lookups

## Problem

Repeated `.find()` calls on arrays are O(n) each:

```typescript
// BAD: O(n) per lookup, O(n^2) total for n items
posts.forEach(post => {
  const author = users.find(u => u.id === post.userId);
  const channel = channels.find(c => c.id === post.channelId);
});
```

## Solution

Build a Map once (O(n)), then all lookups are O(1):

```typescript
// GOOD: O(n) setup, O(1) per lookup
const userMap = new Map(users.map(u => [u.id, u]));
const channelMap = new Map(channels.map(c => [c.id, c]));

posts.forEach(post => {
  const author = userMap.get(post.userId);
  const channel = channelMap.get(post.channelId);
});
```

## When to Use

- Multiple lookups against the same dataset
- Processing lists where items reference other lists
- Any hot path with repeated `.find()` calls
