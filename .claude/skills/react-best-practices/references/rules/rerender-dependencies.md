# Narrow Effect Dependencies

**Impact:** MEDIUM (minimizes effect re-runs)
**Tags:** rerender, useEffect, dependencies, optimization

## Problem

Using objects as dependencies causes unnecessary re-runs:

```typescript
// BAD: Effect runs when ANY post property changes
useEffect(() => {
  loadThread(post.id);
}, [post]);  // Object dependency

// BAD: Effect runs on location object changes
useEffect(() => {
  trackPageView(location.pathname);
}, [location]);  // Object dependency
```

## Solution

Use primitive dependencies instead:

```typescript
// GOOD: Effect only runs when ID changes
useEffect(() => {
  loadThread(postId);
}, [postId]);

// GOOD: Only depend on what you use
useEffect(() => {
  trackPageView(pathname);
}, [pathname]);
```

## Derived State Pattern

```typescript
// BAD: Effect runs on every pixel change
useEffect(() => {
  setLayout(width < 768 ? 'mobile' : 'desktop');
}, [width]);

// GOOD: Effect runs only on breakpoint change
const isMobile = width < 768;
useEffect(() => {
  setLayout(isMobile ? 'mobile' : 'desktop');
}, [isMobile]);
```
