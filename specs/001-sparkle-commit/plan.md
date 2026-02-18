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
**Performance Goals**: Commit message generated within 15s of Claude CLI starting to process (wall-clock time from CLI invocation to response, excluding Claude API network latency)
**Process Timeout**: 30 seconds (hard timeout on `child_process.exec`); if exceeded, user error: "Claude Code CLI timed out. Please try again."
**Buffer Limits**: 10MB maxBuffer for `child_process.exec` (handles large diffs up to 10MB; larger diffs error with "Staged diff is too large to process")
**Constraints**: Zero runtime dependencies; extension bundle via Webpack; no embedded API keys; no CLI version management
**Scale/Scope**: Single-user local extension; 1 command, 1 configuration setting (`sparkleCommit.claudeModel`), 4 source modules
**Cross-Platform Support**: Windows (.cmd/.exe resolution), macOS (Git/Xcode git), Linux (system git); Path handling for `.claude/commands/git.commit.md` on all platforms

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

## Implementation Specifications (from Research & Spec)

### R1: VS Code SCM Title Bar Button

**Button Implementation**:
- Menu contribution point: `scm/title` with `navigation` group
- Command ID: `claude-code-commits.generateCommit`
- Icon: Codicon `$(sparkle)`
- Visibility condition: `when: scmProvider == git`
- Tooltip: "Generate commit message with Claude Code CLI"
- ARIA label: "Generate commit message"

**Button State Management**:
- Idle state: Button enabled, visible
- In-progress state: Button disabled/dimmed (prevent duplicate invocations)
- Error state: Button enabled after error notification dismissal
- Success state: Button enabled immediately after message population

### R2: SCM Commit Message Population

**API Used**: VS Code Git Extension API via `vscode.extensions.getExtension<GitExtension>('vscode.git')`

**Code Pattern**:
```typescript
const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git');
const git = gitExtension?.exports.getAPI(1);
const repo = git?.repositories[0]; // or find by activeTextEditor path
repo.inputBox.value = generatedMessage;
repo.inputBox.focus(); // Focus input box after population
```

### R3: Claude Code CLI Non-Interactive Invocation

**Command Structure**:
```bash
claude -p --model <model> --output-format text --tools "" --max-turns 1
```

**Model Configuration**:
- Setting key: `sparkleCommit.claudeModel`
- Type: string
- Default: `sonnet`
- Example values: `sonnet`, `opus`, `haiku`, or full model names like `claude-3-5-sonnet-20241022`

**Input Validation (before interpolation)**:
- Model name must not be empty
- Model name must not contain shell metacharacters: `;`, `|`, `&`, `$`, `` ` ``, `'`, `"`, `\`
- Reject pattern: `/[;&|$`'"\\\n\r]/`

**Child Process Options**:
```typescript
{
  cwd: workspaceRoot,
  maxBuffer: 10485760, // 10MB
  timeout: 30000,      // 30 seconds
  encoding: 'utf-8'
}
```

### R4: Git Operations via child_process

**Commands Used**:
- `git rev-parse --git-dir`: Verify workspace is a Git repository
- `git diff --staged --stat`: Check if staged changes exist (non-empty output = staged)
- `git diff --staged`: Retrieve full staged diff for the prompt
- `git config --get user.name`: Optional context (not required by spec)
- `git config --get user.email`: Optional context (not required by spec)

**Execution Pattern**:
```typescript
import { exec } from 'child_process';
exec(cmd, { cwd, maxBuffer, timeout, encoding }, (error, stdout, stderr) => {
  if (error) { /* handle error */ }
  return stdout.trim();
});
```

### R5: Prompt Assembly

**Prompt Format (assembled in extension code)**:
```text
{content of .claude/commands/git.commit.md}

--- STAGED GIT DIFF BELOW ---

{output of git diff --staged}

Return ONLY the recommended commit message.
No explanations. No markdown formatting. No code blocks.
Just the raw commit message text.
```

**Path Resolution**:
- Read from: `path.join(workspaceRoot, '.claude', 'commands', 'git.commit.md')`
- Cross-platform safe: Use `path.join()` for correct separators on Windows/macOS/Linux
- Encoding: UTF-8

**Template File Handling**:
- If file does not exist: Error "Prompt template not found at .claude/commands/git.commit.md"
- If file is empty: Proceed (template may intentionally be empty, deferring to suffix instructions)
- If file cannot be read: Error "Failed to read prompt template: [system error]"

### R6: Progress Indicator

**API Used**: `vscode.window.withProgress`

**Progress Configuration**:
```typescript
vscode.window.withProgress(
  {
    location: vscode.ProgressLocation.SourceControl,
    title: 'Generating commit message with Claude...'
  },
  async () => { /* await claude invocation */ }
);
```

**Progress Behavior**:
- Shows spinner in Source Control view while CLI runs
- No cancellation support (progress persists until completion or timeout)
- Message displayed: "Generating commit message with Claude..."
- Covers the CLI invocation, not file I/O or validation

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
