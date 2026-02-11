---
name: react-best-practices
description: React/TypeScript performance optimization guidelines for the Wrangler plugin
version: 1.0.0
triggers:
  - review react performance
  - optimize component
  - audit react code
  - check re-renders
  - bundle optimization
---

# React Best Practices for Wrangler Plugin

Performance optimization guidelines for React/TypeScript code in the Mattermost plugin webapp.

## When to Use This Skill

Activate when:
- Reviewing or writing React components
- Optimizing slow components or pages
- Auditing for performance issues
- Refactoring webapp components
- Code review for frontend changes

## Priority-Ordered Guidelines

### 1. CRITICAL: Eliminate Async Waterfalls

**Impact: 2-10x performance improvement**

```typescript
// BAD: Sequential fetches
const channels = await getChannels();
const messages = await getMessages(channelId);
const threads = await getThreads(channelId);

// GOOD: Parallel fetches
const [channels, messages, threads] = await Promise.all([
  getChannels(),
  getMessages(channelId),
  getThreads(channelId),
]);
```

### 2. CRITICAL: Avoid Barrel Imports

**Impact: 200-800ms import cost, slow builds**

```typescript
// BAD: Barrel imports
import { CheckIcon, XIcon } from 'lucide-react';

// GOOD: Direct imports
import CheckIcon from 'lucide-react/dist/esm/icons/check';
import XIcon from 'lucide-react/dist/esm/icons/x';
```

**Common offenders:**
- `lucide-react` - Use direct icon imports
- `@mattermost/compass-icons` - Check import patterns
- `lodash` - Use `lodash/functionName` not `lodash`
- `date-fns` - Use direct function imports

### 3. HIGH: Dynamic Imports for Heavy Components

**Impact: Reduces initial bundle, improves TTI**

```typescript
// BAD: Static import of heavy component
import { HeavyEditor } from './heavy_editor';

// GOOD: Dynamic import
const HeavyEditor = React.lazy(() => import('./heavy_editor'));
```

### 4. MEDIUM: Re-render Optimization

#### 4a. Extract Memoized Components

```typescript
// BAD: useMemo inside component still runs
function ThreadList({ threads, isLoading }) {
  const sorted = useMemo(() => expensiveSort(threads), [threads]);
  if (isLoading) return <Loading />;
  return <List items={sorted} />;
}

// GOOD: Separate component enables early return
function ThreadList({ threads, isLoading }) {
  if (isLoading) return <Loading />;
  return <SortedThreadList threads={threads} />;
}

const SortedThreadList = memo(({ threads }) => {
  const sorted = useMemo(() => expensiveSort(threads), [threads]);
  return <List items={sorted} />;
});
```

#### 4b. Narrow Effect Dependencies

```typescript
// BAD: Effect runs on any post change
useEffect(() => {
  loadThread(post.id);
}, [post]);

// GOOD: Effect only runs when ID changes
useEffect(() => {
  loadThread(postId);
}, [postId]);
```

#### 4c. Use Transitions for Non-Urgent Updates

```typescript
// BAD: Immediate state update blocks UI
const handleScroll = () => setScrollPosition(window.scrollY);

// GOOD: Transition allows React to prioritize
const handleScroll = () => {
  startTransition(() => setScrollPosition(window.scrollY));
};
```

### 5. MEDIUM: JavaScript Performance

#### 5a. Build Index Maps for Repeated Lookups

```typescript
// BAD: O(n) lookup for each item
messages.forEach(msg => {
  const author = users.find(u => u.id === msg.authorId);
});

// GOOD: O(1) lookup after O(n) map creation
const userMap = new Map(users.map(u => [u.id, u]));
messages.forEach(msg => {
  const author = userMap.get(msg.authorId);
});
```

#### 5b. Use Set for Membership Checks

```typescript
// BAD: O(n) per check
const isSelected = selectedIds.includes(id);

// GOOD: O(1) per check
const selectedSet = new Set(selectedIds);
const isSelected = selectedSet.has(id);
```

#### 5c. Combine Array Iterations

```typescript
// BAD: 3 passes through array
const moved = messages.filter(m => m.status === 'moved');
const copied = messages.filter(m => m.status === 'copied');
const pending = messages.filter(m => m.status === 'pending');

// GOOD: Single pass
const moved: Message[] = [];
const copied: Message[] = [];
const pending: Message[] = [];
for (const msg of messages) {
  if (msg.status === 'moved') moved.push(msg);
  else if (msg.status === 'copied') copied.push(msg);
  else if (msg.status === 'pending') pending.push(msg);
}
```

### 6. LOW-MEDIUM: Rendering Optimization

#### 6a. Hoist Static JSX

```typescript
// BAD: Recreated every render
function MoveThreadModal() {
  const loadingSkeleton = <ModalSkeleton lines={10} />;
  // ...
}

// GOOD: Created once
const LOADING_SKELETON = <ModalSkeleton lines={10} />;
function MoveThreadModal() {
  // Use LOADING_SKELETON
}
```

## Redux Selector Optimization

```typescript
// BAD: Creates new object every call
const getThreadWithDetails = (state, id) => ({
  thread: state.threads[id],
  posts: Object.values(state.posts).filter(p => p.rootId === id),
});

// GOOD: Use reselect with proper memoization
const getThreadWithDetails = createSelector(
  [getThread, getThreadPosts],
  (thread, posts) => ({ thread, posts })
);
```

## Audit Checklist

When reviewing React code in this plugin:

- [ ] **Barrel imports**: Check lucide-react, lodash, date-fns imports
- [ ] **Async waterfalls**: Look for sequential await statements
- [ ] **Effect dependencies**: Ensure primitives, not objects
- [ ] **Repeated lookups**: Convert arrays to Maps for O(1) access
- [ ] **Multiple filters**: Combine into single iteration
- [ ] **Static JSX**: Hoist unchanging elements
- [ ] **Heavy components**: Consider lazy loading
