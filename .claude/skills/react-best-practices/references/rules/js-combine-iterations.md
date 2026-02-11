# Combine Multiple Array Iterations

**Impact:** LOW-MEDIUM (reduces iterations)
**Tags:** javascript, performance, arrays, iteration

## Problem

Multiple `.filter()` or `.map()` calls iterate the array multiple times:

```typescript
// BAD: 3 passes through array
const moved = messages.filter(m => m.status === 'moved');
const copied = messages.filter(m => m.status === 'copied');
const pending = messages.filter(m => m.status === 'pending');

// BAD: 2 passes
const validPosts = posts.filter(p => p.isValid).map(p => p.id);
```

## Solution

Combine into single iteration:

```typescript
// GOOD: 1 pass
const moved: Message[] = [];
const copied: Message[] = [];
const pending: Message[] = [];

for (const msg of messages) {
  if (msg.status === 'moved') moved.push(msg);
  if (msg.status === 'copied') copied.push(msg);
  if (msg.status === 'pending') pending.push(msg);
}

// GOOD: Single pass with reduce
const validPostIds = posts.reduce<string[]>((acc, post) => {
  if (post.isValid) {
    acc.push(post.id);
  }
  return acc;
}, []);
```

## When to Use

- Hot paths (selectors, frequently-called functions)
- Large arrays (100+ items)
- Multiple categorization operations
- Chained `.filter().map()` calls
