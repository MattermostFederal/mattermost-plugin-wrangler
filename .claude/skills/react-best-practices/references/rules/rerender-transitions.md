# Use Transitions for Non-Urgent Updates

**Impact:** MEDIUM (maintains UI responsiveness)
**Tags:** rerender, startTransition, useTransition, performance

## Problem

Frequent state updates can block the UI:

```typescript
// BAD: Every scroll event blocks UI
const handleScroll = () => {
  setScrollY(window.scrollY);
};

// BAD: Every keystroke re-renders list
const handleSearch = (query: string) => {
  setSearchQuery(query);
  setFilteredChannels(filterChannels(channels, query));
};
```

## Solution

Wrap non-urgent updates in `startTransition`:

```typescript
import { startTransition, useTransition } from 'react';

// GOOD: UI stays responsive
const handleScroll = () => {
  startTransition(() => {
    setScrollY(window.scrollY);
  });
};

// GOOD: With pending state
const [isPending, startTransition] = useTransition();
const handleSearch = (query: string) => {
  setSearchQuery(query);  // Urgent - update input immediately
  startTransition(() => {
    setFilteredChannels(filterChannels(channels, query));  // Non-urgent
  });
};
```

## When to Use

- Scroll event handlers
- Search/filter operations
- Expanding/collapsing tree nodes
- Opening modals with complex content
- Any update that doesn't need immediate visual feedback
