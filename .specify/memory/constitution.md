<!--
=== Sync Impact Report ===
Version change: 0.0.0 → 1.0.0 (initial ratification)
Modified principles: N/A (first version)
Added sections:
  - Core Principles (5 principles)
  - Technology Constraints
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md ✅ compatible (user stories and requirements align)
  - .specify/templates/tasks-template.md ✅ compatible (phase structure supports principles)
  - .specify/templates/constitution-template.md ✅ source template (no update needed)
Follow-up TODOs: none
===========================
-->

# Claude Code Commits Constitution

## Core Principles

### I. Simplicity First

All code MUST be clean, readable, and minimal. Every function, module, and file
MUST serve a clear, singular purpose. No abstractions MUST be introduced until
at least two concrete use cases justify them. Premature optimization and
over-engineering are prohibited. If a solution can be expressed in fewer lines
without sacrificing clarity, the shorter form MUST be preferred.

**Rationale**: The user explicitly requires "clean simple code." A VS Code
extension with a focused feature set (sparkle button for commit generation)
MUST remain lean and maintainable by a single developer.

### II. VS Code Extension API Compliance

The extension MUST follow the official VS Code Extension API guidelines as
documented at https://code.visualstudio.com/api/get-started/your-first-extension.
All contribution points MUST be declared in `package.json`. Activation events
MUST be scoped to minimize resource usage. The extension MUST use the standard
lifecycle hooks (`activate`, `deactivate`) and register all disposables properly.

**Rationale**: Compliance with the VS Code API ensures the extension works
reliably across VS Code versions and passes marketplace review requirements.

### III. User-Controlled Commits

The extension MUST NOT commit on behalf of the user. Its sole responsibility is
to generate a recommended conventional commit message and populate the Source
Control input box. The user MUST retain full control to review, edit, and
execute the commit themselves. No git write operations (commit, push, reset)
MUST be performed by the extension.

**Rationale**: The user explicitly stated "the extension should mention the
commit in commit message box and user commit himself." Automated commits risk
data loss and erode user trust.

### IV. Claude Code Integration

The extension MUST invoke Claude Code CLI (`claude`) as an external process to
generate commit messages. The commit generation logic MUST follow the
Conventional Commits workflow defined in `.claude/commands/git.commit.md`:
analyze staged changes, categorize the change type and scope, and produce a
recommended message. The extension MUST only suggest the single recommended
option (not multiple), keeping the UX simple.

**Rationale**: Leveraging Claude Code as the AI backend avoids bundling an API
key or SDK into the extension. The git.commit.md command defines the proven
workflow for structured commit messages.

### V. Conventional Commits Standard

All generated commit messages MUST follow the Conventional Commits specification:
`<type>(<scope>): <description>`. Types MUST be one of: feat, fix, docs, style,
refactor, perf, test, build, ci, chore. Descriptions MUST use imperative mood,
no trailing period, and fit within 72 characters on the first line.

**Rationale**: Consistent commit messages enable automated changelogs, semantic
versioning, and clear project history. The git.commit.md command already
enforces this standard.

## Technology Constraints

- **Runtime**: VS Code Extension Host (Node.js)
- **Language**: TypeScript (strict mode)
- **Build**: Webpack (already configured in project)
- **VS Code API**: `^1.109.0` minimum engine version
- **External dependency**: Claude Code CLI (`claude`) MUST be installed and
  available on the user's PATH
- **No bundled AI SDK**: The extension MUST NOT embed Anthropic API keys or
  SDK libraries; it MUST delegate to the Claude Code CLI
- **Package size**: The extension MUST remain lightweight; no unnecessary
  runtime dependencies MUST be added

## Development Workflow

- **Source of truth**: `package.json` declares all commands, menus, and
  contribution points; `src/extension.ts` is the main entry point
- **UX pattern**: A sparkle (✨) icon button in the Source Control title bar
  triggers commit message generation; the result populates the SCM input box
- **Error handling**: If Claude Code CLI is not installed or staged changes
  are empty, the extension MUST show a clear, actionable VS Code notification
- **Testing**: Use `@vscode/test-cli` and `@vscode/test-electron` for
  extension integration tests
- **Linting**: ESLint with typescript-eslint MUST pass before any commit
- **Commit messages**: MUST follow Conventional Commits as defined in
  `.claude/commands/git.commit.md`

## Governance

This constitution is the authoritative reference for all design and
implementation decisions in the claude-code-commits project. All code
changes MUST comply with these principles. Amendments require:

1. A documented rationale for the change
2. Version bump following semantic versioning (MAJOR for principle
   removals/redefinitions, MINOR for additions, PATCH for clarifications)
3. Updated `LAST_AMENDED_DATE`

Complexity beyond what these principles allow MUST be justified in writing
before implementation. Use `.claude/commands/git.commit.md` for runtime
commit generation guidance.

**Version**: 1.0.0 | **Ratified**: 2026-02-18 | **Last Amended**: 2026-02-18
