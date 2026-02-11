---
name: review-branch
description: Full branch review - review all commits since diverging from main branch
allowed-tools: Bash, Read, Grep, Glob, Task
---

# Branch Review

Comprehensive review of all changes on the current branch since it diverged from the main branch. Use this before creating a PR or when you want a full audit of everything on the branch.

## Workflow

### Phase 0: Squash Gate (Required)

Before doing any review, check if the branch has been squashed:

```bash
git log --oneline master..HEAD | wc -l
```

**If the commit count is greater than 1**, STOP and do the following:

1. Tell the user the branch has N commits and needs to be squashed first
2. Show them the commit list (`git log --oneline master..HEAD`)
3. Explain the squash command that will be run:
   ```
   git reset --soft master && git commit -m "<message>"
   ```
4. Use AskUserQuestion to ask for confirmation before running the squash
5. Only proceed with the review after squashing is complete

**If the commit count is exactly 1**, proceed to Phase 1.

### Phase 1: Branch Context (Direct)

1. **Identify the base branch and gather context**:
   ```bash
   git log --oneline master..HEAD
   git diff master...HEAD --stat
   git diff master...HEAD --name-only
   ```

2. **Categorize changed files**:
   - New files vs modified files
   - Server (Go) vs webapp (TypeScript) vs config/docs
   - Test files vs production code

3. **Run full linters**:
   - `make check-style` (runs all linters)
   - `make test` (runs all tests)

### Phase 2: Code Quality Checks (Via Agents)

Spawn specialized agents in parallel based on what files changed across the entire branch:

| Changed Files | Agent | Check |
|---------------|-------|-------|
| Any new functions/utilities | duplication-reviewer | Existing utilities, duplication across all branch changes |
| Any new functions/utilities | hardcoded-values-reviewer | Magic numbers, missing constants |
| Any code changes | error-handling-reviewer | Ignored errors, missing wrapping |
| `webapp/src/components/**/*.tsx` | react-best-practices | React component patterns |
| `server/**/*.go` | go-pro | Go patterns and idioms |
| Significant new features | simplicity-reviewer | Over-engineering check |

**Important**: Provide each agent with the full diff (`git diff master...HEAD`) or the complete changed files, not just the latest commit. The review covers the entire branch.

### Phase 3: Commit Hygiene

Since the branch is squashed to a single commit, check:

- Commit message is clear, descriptive, and summarizes the full scope of changes
- No accidental files committed (`.env`, large binaries, `node_modules`)

### Phase 4: Consolidate Results

Wait for all agents, then combine findings into the output format below.

## Output Format

```markdown
## Branch Review: [branch-name] ([N] commits, [N] files changed)

### Branch Summary
- Base: master
- Commits: [N]
- Files changed: [N] ([N] added, [N] modified, [N] deleted)

### Build Status
- Lint: PASS/FAIL
- Tests: PASS/FAIL ([N] tests)

### Files Changed
- path/to/file1.go (modified)
- path/to/file2.tsx (new)
- path/to/file3.go (deleted)

### Pattern Checks
- Duplication/Reuse: PASS/FAIL ([N] issues)
- Hardcoded values: PASS/FAIL ([N] issues)
- Error handling: PASS/FAIL ([N] issues)
- React patterns: PASS/FAIL/SKIP ([N] issues)
- Go patterns: PASS/FAIL/SKIP ([N] issues)
- Simplicity: PASS/FAIL/SKIP ([N] issues)

### Commit Hygiene
- Message quality: GOOD/NEEDS IMPROVEMENT
- Accidental files: NONE/[list]

### Issues Found

#### Critical (Block PR)
1. [file:line] Issue description

#### Warnings (Should fix)
1. [file:line] Issue description

#### Suggestions (Nice to have)
1. [file:line] Issue description

### Verdict
[READY FOR PR | FIX ISSUES FIRST]
```

## When to Use

- Before creating a pull request
- After completing a feature branch
- Periodic check on long-running branches
- When handing off a branch to another developer
