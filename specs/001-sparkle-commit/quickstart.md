# Quickstart: Sparkle Commit

**Branch**: `001-sparkle-commit`
**Date**: 2026-02-18

## Prerequisites

1. **VS Code** `1.109.0` or later
2. **Claude Code CLI** installed and available on PATH
   - Verify: `claude --version`
   - Install: https://docs.anthropic.com/en/docs/claude-code/getting-started
3. **Git** installed and available on PATH
4. **Node.js** 22.x (for development only)

## Development Setup

```bash
# Clone and install
git clone <repo-url>
cd claude-code-commits
npm install

# Compile
npm run compile

# Launch Extension Development Host
# Press F5 in VS Code (uses .vscode/launch.json)
```

## Usage

1. Open a Git repository in VS Code
2. Stage changes (`git add` or use the VS Code Source Control UI)
3. Ensure `.claude/commands/git.commit.md` exists in the workspace root
4. Click the ✨ button in the Source Control view header
5. Wait for the progress indicator to complete
6. Review the generated commit message in the input box
7. Edit if desired, then commit (Ctrl+Enter / Cmd+Enter)

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `sparkleCommit.claudeModel` | `"sonnet"` | Claude model for generation |

Change via: File > Preferences > Settings > search "sparkleCommit"

## Verify It Works

1. Open a project with staged changes
2. Click the ✨ button in Source Control
3. Expected: A progress spinner appears, then a conventional commit message
   (e.g., `feat(auth): add login validation`) fills the commit message box
4. The commit is NOT executed automatically - you control when to commit

## Error Scenarios

| Symptom | Cause | Fix |
|---------|-------|-----|
| "No Git repository found" | Workspace is not a git repo | Run `git init` or open a git project |
| "No staged changes" | Nothing staged | Run `git add <files>` first |
| "Claude Code CLI not found" | `claude` not on PATH | Install Claude Code CLI |
| "Prompt template not found" | Missing `.claude/commands/git.commit.md` | Create the file with commit message guidelines |
| "Failed to generate" | Claude CLI error | Check CLI auth, network, and model availability |

## Build & Package

```bash
# Lint
npm run lint

# Compile for development
npm run compile

# Package for production
npm run package

# Create VSIX for distribution
npx @vscode/vsce package
```
