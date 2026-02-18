# Research: Sparkle Commit

**Branch**: `001-sparkle-commit`
**Date**: 2026-02-18

## R1: VS Code SCM Title Bar Button

**Decision**: Use the `scm/title` menu contribution point with `navigation` group
to place an inline button in the Source Control view header.

**Rationale**: The VS Code SCM API documentation states that menu items in the
`navigation` group of `scm/title` appear as inline buttons. This is the official
way to add action buttons to the Source Control header bar.

**Implementation detail**:
```json
{
  "menus": {
    "scm/title": [{
      "command": "claude-code-commits.generateCommit",
      "group": "navigation",
      "when": "scmProvider == git"
    }]
  }
}
```

The command needs an icon declaration using codicon syntax `$(sparkle)` in the
command's `icon` property.

**Alternatives considered**:
- Custom webview panel: Rejected (constitution prohibits webviews; over-engineered)
- Status bar item: Rejected (not discoverable in the SCM workflow context)
- Command palette only: Rejected (user expects a visible button)

## R2: Setting the SCM Commit Message

**Decision**: Use the VS Code Git extension API to access the repository and set
`repository.inputBox.value`.

**Rationale**: The VS Code Git extension (`vscode.git`) exposes an API via
`vscode.extensions.getExtension('vscode.git')`. The `GitExtension` provides
access to repositories, each with an `inputBox.value` property that maps to the
Source Control commit message input field.

**Implementation detail**:
```typescript
const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git');
const git = gitExtension?.exports.getAPI(1);
const repo = git?.repositories[0];
repo.inputBox.value = generatedMessage;
```

**Alternatives considered**:
- `vscode.commands.executeCommand('type', {text})`: Rejected (unreliable, targets active editor)
- Direct SCM API (`vscode.scm`): Only for SCM providers, not consumers

## R3: Claude Code CLI Non-Interactive Invocation

**Decision**: Use `claude -p` (print mode) with prompt piped via stdin, `--model`
flag for model selection, and `--output-format text` for plain text output.
Disable tools with `--tools ""` to prevent agentic behavior.

**Rationale**: The Claude Code CLI documentation shows that `-p` (print mode)
runs a single query and exits without interactive UI. Piping content via stdin
with `cat file | claude -p "query"` is a supported pattern. The `--model` flag
accepts aliases like `sonnet` or full model names. Disabling tools ensures Claude
returns only text, not tool invocations.

**Implementation detail**:
```typescript
const model = vscode.workspace.getConfiguration('sparkleCommit').get<string>('claudeModel', 'sonnet');
const child = exec(
  `claude -p --model ${model} --output-format text --tools "" --max-turns 1`,
  { cwd: workspaceRoot }
);
child.stdin.write(promptWithDiff);
child.stdin.end();
```

**Alternatives considered**:
- Anthropic SDK directly: Rejected (constitution prohibits bundled AI SDK/API keys)
- `claude "query"` interactive mode: Rejected (starts REPL, not suitable for programmatic use)
- `--output-format json`: Rejected (text is simpler; we need the raw message string)

## R4: Git Operations via child_process

**Decision**: Use `child_process.exec` to run `git diff --staged` and
`git status --porcelain` for checking staged changes. Use `claude --version`
to verify CLI availability.

**Rationale**: The extension already depends on Git being available (it's a
VS Code Git extension integration). Using `child_process.exec` for simple
read-only git commands is simpler than importing the VS Code Git extension API
for diff retrieval. The Git extension API is used only for setting
`inputBox.value` (R2) since there's no simpler alternative for that.

**Implementation detail**:
- `git rev-parse --git-dir`: Check if workspace is a git repo
- `git diff --staged --stat`: Check if there are staged changes (non-empty = staged)
- `git diff --staged`: Get full staged diff for the prompt
- `claude --version`: Verify Claude CLI is installed

**Alternatives considered**:
- VS Code Git extension API for diff: More complex setup, requires typed API import
- `simple-git` npm package: Adds runtime dependency (violates zero-dep constraint)

## R5: Prompt Assembly

**Decision**: Read `.claude/commands/git.commit.md` from workspace root, append
the staged diff with a separator, and add an instruction suffix requesting only
the final commit message.

**Rationale**: The spec requires following the git.commit.md workflow. The prompt
must include the template content plus the actual diff. An explicit instruction
to return "ONLY the final commit message" prevents Claude from returning
explanations, options, or markdown formatting.

**Prompt format**:
```text
{content of .claude/commands/git.commit.md}

--- STAGED GIT DIFF BELOW ---

{staged diff output}

Return ONLY the recommended commit message (Option 1).
No explanations. No markdown formatting. No code blocks.
Just the raw commit message text.
```

**Alternatives considered**:
- Embedding the prompt in the extension code: Rejected (spec requires reading the file)
- Sending diff as a separate file: Rejected (unnecessary complexity)

## R6: Progress Indicator

**Decision**: Use `vscode.window.withProgress` with `ProgressLocation.SourceControl`
to show a spinner in the Source Control view while Claude generates the message.

**Rationale**: The VS Code API provides `withProgress` as the standard way to
show progress indicators. `ProgressLocation.SourceControl` places the indicator
directly in the SCM view where the user initiated the action.

**Alternatives considered**:
- `ProgressLocation.Notification`: Shows a notification toast instead of inline spinner
- Status bar message: Less visible, not associated with the SCM view
