# Promise.all() for Independent Operations

**Impact:** CRITICAL (2-10x performance improvement)
**Tags:** async, parallelization, promises, waterfalls

## Problem

Sequential await statements that could run in parallel:

```typescript
// BAD: 3 round trips
const channels = await getChannels();
const threads = await getThreads(channelId);
const posts = await getPosts(channelId);
```

## Solution

Use `Promise.all()` for independent async operations:

```typescript
// GOOD: 1 round trip
const [channels, threads, posts] = await Promise.all([
  getChannels(),
  getThreads(channelId),
  getPosts(channelId),
]);
```

## When NOT to Parallelize

- When operations depend on each other's results
- When order matters for side effects
- When error handling requires sequential processing
