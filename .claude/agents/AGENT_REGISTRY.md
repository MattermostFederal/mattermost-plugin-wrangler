# Agent Registry - Global Agents

**Location**: `.claude/agents/`

This registry lists all general-purpose agents available across all projects. For project-specific agents, check the project's `.claude/agents/AGENT_REGISTRY.md`.

---

## General Purpose Agents

### Core (`core/`)
| Agent | File | Description |
|-------|------|-------------|
| `code-reviewer` | `core/code-reviewer.md` | General code review |

### Review (`review/`)
| Agent | File | Description |
|-------|------|-------------|
| `duplication-reviewer` | `review/duplication-reviewer.md` | Duplication detection, reuse opportunities |
| `error-handling-reviewer` | `review/error-handling-reviewer.md` | Error handling patterns |
| `hardcoded-values-reviewer` | `review/hardcoded-values-reviewer.md` | Magic numbers, repeated strings, config values |
| `simplicity-reviewer` | `review/simplicity-reviewer.md` | Complexity analysis, YAGNI checks |
| `pr-reviewer` | `review/pr-reviewer.md` | Pull request review orchestrator |

### Security (`security/`)
| Agent | File | Description |
|-------|------|-------------|
| `owasp-security` | `security/owasp-security.md` | OWASP Top 10 vulnerability checks |

### Tech Experts (`tech/`)
| Agent | File | Description |
|-------|------|-------------|
| `go-pro` | `tech/go-pro.md` | Advanced Go patterns, concurrency, performance |

### Shared (`_shared/`)
| File | Description |
|------|-------------|
| `grounding-rules.md` | Evidence-based review rules (referenced by all agents) |

---

## How to Use

When looking for agents:
1. Check project `.claude/agents/AGENT_REGISTRY.md` for project-specific agents
2. Check this file (`.claude/agents/AGENT_REGISTRY.md`) for general agents

To invoke a custom agent:
```
Task(subagent_type="general-purpose", prompt="<contents of agent.md> + <files to review>")
```

## Adding New Agents

1. Create a `.md` file in the appropriate category directory
2. Include frontmatter: `name`, `description`, `category`, `model`, `tools`
3. Reference grounding rules: `> **Grounding Rules**: See grounding-rules.md`
4. Add the agent to this registry
