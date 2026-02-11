---
name: review
description: Pre-commit review - lint changed files and run pattern checks
allowed-tools: Bash, Read, Grep, Glob, Task
---

# Pre-Commit Review

Fast sanity check of uncommitted changes before committing. Runs linters on changed files and performs pattern checks.

## Workflow

### Phase 1: Quick Checks (Direct)

1. **Get changed files**:
   ```bash
   git diff --name-only
   git diff --staged --name-only
   ```

2. **Run linters on changed files only**:
   - Go files: `gofmt -d <files>` and `go vet <packages>`
   - TypeScript files: `cd webapp && npx eslint <files>`

3. **Quick issue scan**:
   - Check for `console.log` in TypeScript
   - Check for `fmt.Println` debugging in Go
   - Check for `TODO` or `FIXME` comments
   - Check for hardcoded secrets patterns

### Phase 2: Pattern Checks (Via Agents)

Based on file types changed, spawn specialized agents in parallel:

| Changed Files | Agent | Check |
|---------------|-------|-------|
| Any new functions/utilities | duplication-reviewer | Existing utilities, duplication |
| Any new functions/utilities | hardcoded-values-reviewer | Magic numbers, missing constants |
| Any code changes | error-handling-reviewer | Ignored errors, missing wrapping |
| `webapp/src/components/**/*.tsx` | react-best-practices | React component patterns |
| `server/**/*.go` | go-pro | Go patterns and idioms |
| New features (optional) | simplicity-reviewer | Over-engineering check |

**Spawn agents using Task tool** (run in parallel for speed):

Read the agent definition file first, then invoke Task with the agent's instructions as the prompt. Example:

```
# For each agent, use Task tool with:
- subagent_type: "general-purpose"
- prompt: Contents of agent .md file + files to review
- description: Brief description like "Error handling review"
- run_in_background: true (to parallelize)
```

### Phase 3: Consolidate Results

Wait for all agents, then combine findings.

## Output Format

```markdown
## Pre-Commit Review: [X files changed]

### Files Changed
- path/to/file1.go (modified)
- path/to/file2.tsx (new)

### Lint Status
- Go format: PASS/FAIL
- Go vet: PASS/FAIL
- ESLint: PASS/FAIL/SKIP

### Pattern Checks
- Duplication/Reuse: PASS/FAIL ([N] issues)
- Hardcoded values: PASS/FAIL ([N] issues)
- Error handling: PASS/FAIL ([N] issues)
- React patterns: PASS/FAIL/SKIP ([N] issues)
- Go patterns: PASS/FAIL/SKIP ([N] issues)
- Simplicity: PASS/FAIL/SKIP ([N] issues)

### Issues Found

#### Critical (Block commit)
1. [file:line] Issue description

#### Warnings (Should fix)
1. [file:line] Issue description

### Verdict
[OK TO COMMIT | FIX ISSUES FIRST]
```

## When to Use

- Before committing changes
- Quick sanity check during development
- Catch pattern issues early

## When to Use Full Code Review Instead

- Before creating a PR
- After implementing a new feature
- Security-sensitive changes
- Changes touching permissions or authentication
