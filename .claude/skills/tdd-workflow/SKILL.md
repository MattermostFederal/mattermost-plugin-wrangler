---
name: tdd-workflow
description: Test-Driven Development workflow for Go and TypeScript. Use when implementing new features or fixing bugs using RED-GREEN-REFACTOR cycle.
---

# Test-Driven Development Workflow

## When to Use This Skill

- Implementing new features
- Fixing bugs with regression tests
- Refactoring with confidence
- Building APIs with clear contracts

## The RED-GREEN-REFACTOR Cycle

### 1. RED: Write a Failing Test First

**Before writing any production code**, write a test that:
- Describes the expected behavior
- Fails because the feature doesn't exist yet
- Provides a clear error message

```go
// Go example - testing a new command handler
func TestMoveThreadCommand_WithValidInput_MovesThread(t *testing.T) {
    p := &Plugin{}
    // setup mock API...

    resp, appErr := p.executeMoveThread([]string{"channel-name"}, &model.CommandArgs{
        UserId:    "user-id",
        ChannelId: "source-channel-id",
    })

    require.Nil(t, appErr)
    require.Contains(t, resp.Text, "Thread moved successfully")
}
```

```typescript
// TypeScript example
describe('MoveThreadModal', () => {
    it('moves thread when confirm button clicked', async () => {
        const onMove = jest.fn();
        render(<MoveThreadModal onMove={onMove} />);

        await userEvent.click(screen.getByRole('button', { name: /move/i }));

        expect(onMove).toHaveBeenCalledWith(
            expect.objectContaining({ channelId: expect.any(String) })
        );
    });
});
```

### 2. GREEN: Write Minimal Code to Pass

Write the **simplest possible code** that makes the test pass:
- Don't optimize yet
- Don't handle edge cases yet
- Just make it work

### 3. REFACTOR: Improve the Code

Now that tests pass, improve the code:
- Remove duplication
- Improve naming
- Extract methods
- **Run tests after each change**

## TDD Anti-Patterns to Avoid

### Writing Tests After Code
Tests written after are biased toward implementation, not behavior.

### Testing Implementation Details
```typescript
// BAD: Tests internal state
expect(component.state.isLoading).toBe(true);

// GOOD: Tests observable behavior
expect(screen.getByRole('progressbar')).toBeInTheDocument();
```

### Skipping the RED Phase
If the test passes immediately, either:
- The feature already exists
- The test is wrong

### Writing Too Much Code in GREEN
Only write enough to pass the current test.

### Skipping Refactor
Technical debt accumulates without refactoring.

## Go Testing Patterns

### Table-Driven Tests
```go
func TestValidateChannelName(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        wantErr bool
    }{
        {"valid channel", "town-square", false},
        {"empty name", "", true},
        {"with team prefix", "team-name~channel-name", false},
        {"invalid chars", "channel name!", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := validateChannelName(tt.input)
            if tt.wantErr {
                require.Error(t, err)
            } else {
                require.NoError(t, err)
            }
        })
    }
}
```

### Subtests for Setup Reuse
```go
func TestCommandHandlers(t *testing.T) {
    p := setupTestPlugin(t)

    t.Run("MoveThread", func(t *testing.T) {
        // test move
    })

    t.Run("CopyThread", func(t *testing.T) {
        // test copy
    })

    t.Run("AttachMessage", func(t *testing.T) {
        // test attach
    })
}
```

## TypeScript Testing Patterns

### Arrange-Act-Assert
```typescript
it('displays error when move fails', async () => {
    // Arrange
    const mockMove = jest.fn().mockRejectedValue(new Error('Network error'));
    render(<MoveThreadModal onMove={mockMove} />);

    // Act
    await userEvent.click(screen.getByRole('button', { name: /move/i }));

    // Assert
    expect(await screen.findByText(/failed to move/i)).toBeInTheDocument();
});
```

### Testing Async Behavior
```typescript
it('loads channels on mount', async () => {
    render(<MoveThreadModal teamId="team-123" />);

    // Wait for loading to complete
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

    expect(screen.getByText('Town Square')).toBeInTheDocument();
});
```

## Workflow Commands

```bash
# Go: Run all tests
make test

# Go: Run specific test
go test -v -run TestMoveThread ./server/...

# Go: Run with race detection
go test -race -run TestMoveThread ./server/...

# TypeScript: Run all tests
cd webapp && npm run test

# TypeScript: Watch mode
cd webapp && npm test -- --watch

# TypeScript: Single test
cd webapp && npm test -- --testNamePattern="MoveThreadModal"
```

## Remember

1. **Test behavior, not implementation**
2. **One assertion per test** (when possible)
3. **Tests are documentation** - make them readable
4. **Fast tests run more often** - keep them quick
5. **Delete tests that don't add value**
