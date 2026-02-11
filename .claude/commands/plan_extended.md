---
name: plan_extended
description: Create a structured implementation plan for a feature before coding
allowed-tools: Read, Grep, Glob, Task, Bash, Write
---

# Feature Planning Command

Create a detailed, layer-by-layer implementation plan before writing any code. Make sure to save plans to `implementation-plans/` for reference and tracking.

## Input

`$ARGUMENTS` - Feature description or task to plan

Examples:
- `/plan_extended Add new slash command for bulk message operations`
- `/plan_extended Add merge thread UI to webapp`
- `/plan_extended Implement cross-team thread copy with permissions`

## Workflow

### Phase 1: Understand the Request

1. **Parse the input**: Determine if this is a new feature, bug fix, or enhancement
2. **Clarify if needed**: If the request is ambiguous, ask targeted questions:
   - What problem are we solving?
   - Who benefits from this?
   - What's the scope (MVP vs full feature)?

### Phase 2: Research the Codebase

**Spawn exploration agents in parallel** to understand existing patterns:

```
Task({
    subagent_type: "Explore",
    prompt: "Find existing patterns for [relevant area]. Look for similar implementations.",
    description: "Research existing patterns"
})
```

Research checklist:
- [ ] Find similar existing features in the codebase
- [ ] Check existing command handlers in `server/command*.go`
- [ ] Review plugin hooks and API routes in `server/plugin.go` and `server/api.go`
- [ ] Check utility functions in `server/utils.go` and `server/message_helpers.go`
- [ ] Examine frontend components in `webapp/src/components/`
- [ ] Check TypeScript types in `webapp/src/types/`
- [ ] Look at Redux actions/reducers/selectors in `webapp/src/`
- [ ] Check for existing tests to understand expected behavior
- [ ] Review existing `/wrangler` slash commands in `server/command.go`
- [ ] Review plugin configuration in `server/configuration.go`

### Phase 3: Create Layer-by-Layer Plan

Structure the plan following the Wrangler plugin architecture:

```markdown
# Implementation Plan: [Feature Name]

## Summary
[1-2 sentence description of what we're building]

## Problem Statement
[What problem does this solve? Who benefits?]

## Proposed Solution
[High-level approach]

---

## Layer 1: Server Core (`server/`)

### Plugin Hooks
- [ ] `server/plugin.go` - Hook changes if needed

### API Endpoints
- [ ] `server/api.go` - New/modified REST endpoints

### Configuration
- [ ] `server/configuration.go` - New settings if needed
- [ ] `plugin.json` - Settings schema updates

### Files to modify:
- `server/api.go`
- `server/plugin.go`
- `server/configuration.go`

---

## Layer 2: Commands (`server/command*.go`)

### Slash Commands (`/wrangler`)
- [ ] `server/command.go` - New subcommands if needed
- [ ] Autocomplete data for new subcommands
- [ ] Handler method implementation

### New Command Files
- [ ] `server/command_<action>.go` - New command handler
- [ ] `server/command_<action>_test.go` - Tests

### Files to modify:
- `server/command.go`
- `server/command_<action>.go`

---

## Layer 3: Server Utilities

### Message Helpers
- [ ] `server/message_helpers.go` - New/modified message manipulation
- [ ] `server/wrangler_postlist.go` - Post list changes
- [ ] `server/utils.go` - New utility functions
- [ ] `server/bot.go` - Bot message changes

### Files to modify:
- `server/message_helpers.go`
- `server/utils.go`

---

## Layer 4: Frontend Types (`webapp/src/types/`)

### TypeScript Interfaces
- [ ] New/modified type definitions
- [ ] API response types

### Files to modify:
- `webapp/src/types/<type>.ts`

---

## Layer 5: Frontend Components (`webapp/src/components/`)

### Dropdowns & Modals
- [ ] Dropdown components for post menu actions
- [ ] Modal components for complex interactions
- [ ] Sidebar elements for channel-level features

### Files to modify:
- `webapp/src/components/<component>/`

---

## Layer 6: Frontend State (`webapp/src/`)

### Redux
- [ ] Actions in `webapp/src/actions/`
- [ ] Reducers in `webapp/src/reducers/`
- [ ] Selectors in `webapp/src/selectors/`
- [ ] API client methods in `webapp/src/client/`

### Files to modify:
- `webapp/src/actions/index.ts`
- `webapp/src/reducers/index.ts`
- `webapp/src/selectors/index.ts`

---

## Testing Strategy

### Go Tests (testify, table-driven)
- [ ] Command tests: `server/command_*_test.go`
- [ ] Utility tests: `server/utils_test.go`
- [ ] Configuration tests: `server/configuration_test.go`

### Webapp Tests
- [ ] Component tests in `webapp/tests/`

---

## Implementation Order

1. **Server configuration** - Define settings and defaults
2. **Server commands** - Slash command handlers
3. **Server utilities** - Message helpers and post list operations
4. **Server API** - REST endpoints for webapp
5. **Frontend types** - TypeScript interfaces
6. **Frontend components** - UI components
7. **Frontend state** - Redux actions/reducers/selectors
8. **Tests** - Go table-driven tests, Jest tests

---

## Risks & Dependencies

- [List potential issues]
- [External dependencies]
- [Performance considerations]

---

## Non-Goals (Out of Scope)

- [What we're NOT doing in this iteration]
```

### Phase 4: Validate the Plan

After generating the plan:
- [ ] Verify file paths are accurate
- [ ] Confirm scope is reasonable for one PR
- [ ] Check that tests cover key logic paths
- [ ] Ensure plugin configuration is updated if adding new settings
- [ ] Evaluate whether `/wrangler` slash commands would benefit the feature

### Phase 5: Save the Plan

Save to `implementation-plans/` with a date-prefixed descriptive filename using the format `YY-MM-DD-<simple-name>.md`:

```bash
# Create filename: YY-MM-DD-<simple-name>.md
# Derive a short, lowercase, hyphenated name from the feature description
FILENAME="implementation-plans/$(date +%y-%m-%d)-$(echo "$SIMPLE_NAME" | tr ' ' '-' | tr '[:upper:]' '[:lower:]').md"
```

Examples:
- `implementation-plans/26-02-10-bulk-move.md`
- `implementation-plans/26-02-10-merge-thread-ui.md`
- `implementation-plans/26-02-10-cross-team-copy.md`

Write the plan:
```
Write({
    file_path: "$FILENAME",
    content: "[generated plan content]"
})
```

## Output Format

```
## Plan Created: [Feature Name]

Saved to: implementation-plans/YY-MM-DD-[simple-name].md

### Summary
[Brief description]

### Scope
- Server Core: [X] changes
- Commands: [X] changes
- Utilities: [X] changes
- Frontend Types: [X] changes
- Frontend Components: [X] changes
- Frontend State: [X] changes
- Tests: [X] test files
- Slash Commands: [YES/NO - new `/wrangler` subcommands]

### Key Files
[List main files that will be modified]

### Ready to Implement?
[YES - Plan is complete | NEEDS REVIEW - Discuss these points first]
```

## When to Use

- Before implementing any feature that touches multiple layers
- When adding new slash commands
- For complex bug fixes requiring investigation
- When adding new API endpoints
- Before significant frontend component work

## When NOT to Use

- Simple one-file fixes
- Documentation-only changes
- Typo corrections
- Single component styling changes

## Related Commands

- `/review` - Run after implementation to check patterns
