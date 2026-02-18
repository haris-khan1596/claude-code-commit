# Implementation Plan: Sparkle Commit

**Branch**: `001-sparkle-commit` | **Date**: 2026-02-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-sparkle-commit/spec.md`

## Summary

Add a sparkle (✨) button to the VS Code Source Control view header that
generates a conventional commit message by invoking the Claude Code CLI with
the staged diff and the project's `.claude/commands/git.commit.md` prompt
template. The generated message populates the SCM input box; the user retains
full control over committing.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: VS Code Extension API (`@types/vscode ^1.109.0`), Node.js `child_process` (built-in)
**Storage**: N/A (no persistence required)
**Testing**: `@vscode/test-cli` + `@vscode/test-electron` with Mocha
**Target Platform**: VS Code `^1.109.0` on Windows, macOS, Linux
**Project Type**: Single project (VS Code extension)
**Performance Goals**: Commit message generated within 15s of button click (excluding Claude API latency)
**Constraints**: Zero runtime dependencies; extension bundle via Webpack; no embedded API keys
**Scale/Scope**: Single-user local extension; 1 command, 1 configuration setting, 4 source modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Simplicity First | PASS | 4 focused modules (extension, git, claude, prompt), no abstractions, no runtime deps |
| II. VS Code Extension API Compliance | PASS | Command declared in package.json, scm/title menu contribution, proper disposable registration |
| III. User-Controlled Commits | PASS | Extension only populates inputBox.value; no git write operations |
| IV. Claude Code Integration | PASS | Invokes `claude -p` CLI via child_process; follows git.commit.md workflow |
| V. Conventional Commits Standard | PASS | Prompt template enforces conventional commit format; output used as-is |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-sparkle-commit/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API endpoints)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── extension.ts         # Activation, command registration, SCM integration
├── git.ts               # Git operations: check repo, check staged, get diff
├── claude.ts            # Claude CLI invocation: check installed, run prompt
└── prompt.ts            # Prompt template: load file, assemble prompt string

src/test/
└── extension.test.ts    # Extension integration tests
```

**Structure Decision**: Single flat module structure under `src/`. The user
specification explicitly requires `extension.ts`, `git.ts`, `claude.ts`, and
`prompt.ts`. No subdirectories needed for 4 files. Tests remain in
`src/test/` per the existing scaffold.

## Complexity Tracking

> No violations. All gates pass.

No entries needed.
