# Feature Specification: Sparkle Commit

**Feature Branch**: `001-sparkle-commit`
**Created**: 2026-02-18
**Status**: Draft
**Input**: User description: "Add a sparkle button in the VS Code Source Control view header that generates a conventional commit message via Claude Code CLI and populates the SCM commit message input box. The user commits themselves."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Commit Message (Priority: P1)

A developer has staged changes in their Git repository and wants a well-crafted conventional commit message without writing it manually. They click the sparkle button in the Source Control view header. The extension reads the staged diff, sends it to Claude Code CLI along with the project's commit message guidelines, and populates the commit message input box with the generated result. The developer reviews the message, optionally edits it, and commits at their own discretion.

**Why this priority**: This is the entire core value proposition of the extension. Without this, the extension has no purpose.

**Independent Test**: Can be fully tested by staging files in a Git repo, clicking the sparkle button, and verifying the commit message box is populated with a conventional commit message. Delivers immediate value by eliminating manual commit message writing.

**Acceptance Scenarios**:

1. **Given** a workspace with a Git repository and staged changes, **When** the user clicks the sparkle button, **Then** a progress indicator appears, Claude Code CLI is invoked, and the SCM commit message input box is populated with the generated conventional commit message.
2. **Given** a workspace with a Git repository and staged changes, **When** the user clicks the sparkle button and the commit message is generated, **Then** the user can review, edit, or discard the message before committing manually.
3. **Given** a workspace with a Git repository and staged changes, **When** the user clicks the sparkle button while a message is already in the input box, **Then** the existing message is replaced with the newly generated one.

---

### User Story 2 - Error Feedback (Priority: P2)

A developer clicks the sparkle button but something is wrong: no staged changes, no Git repository, Claude Code CLI is not installed, or the prompt template file is missing. The extension detects the issue and displays a clear, actionable error notification so the developer knows exactly what to fix.

**Why this priority**: Without clear error handling, users would see cryptic failures or silent no-ops, destroying trust in the extension. This is essential for a usable product.

**Independent Test**: Can be tested by triggering the button in each error condition (no repo, no staged files, no Claude CLI, missing prompt file) and verifying the correct error notification appears.

**Acceptance Scenarios**:

1. **Given** a workspace without a Git repository, **When** the user clicks the sparkle button, **Then** an error notification states that no Git repository was found.
2. **Given** a Git repository with no staged changes, **When** the user clicks the sparkle button, **Then** an error notification instructs the user to stage changes first.
3. **Given** Claude Code CLI is not installed on the system, **When** the user clicks the sparkle button, **Then** an error notification states that Claude CLI is required and suggests installation.
4. **Given** the prompt template file is missing from the workspace, **When** the user clicks the sparkle button, **Then** an error notification identifies the missing file path.
5. **Given** Claude Code CLI returns an error or empty response, **When** the user clicks the sparkle button, **Then** an error notification describes the failure.

---

### User Story 3 - Configure Claude Model (Priority: P3)

A developer wants to use a different Claude model for commit message generation. They update the extension setting to specify their preferred model. The next time they click the sparkle button, the extension uses the configured model.

**Why this priority**: Model configurability is a nice-to-have that adds flexibility but is not required for the core workflow. A sensible default model works for most users.

**Independent Test**: Can be tested by changing the model setting, clicking the sparkle button, and verifying the CLI invocation uses the configured model name.

**Acceptance Scenarios**:

1. **Given** the user has not configured a model preference, **When** the user clicks the sparkle button, **Then** the extension uses the default model.
2. **Given** the user has set a custom model in extension settings, **When** the user clicks the sparkle button, **Then** the extension invokes Claude CLI with the user-specified model.

---

### Edge Cases

- **Large Diffs (>1MB)**: The extension must handle large diffs that exceed the default `child_process.exec` maxBuffer (1MB). The requirement specifies a 10MB buffer (FR-013b). If a diff exceeds 10MB, the error "Staged diff is too large to process" is displayed.
- **Duplicate Invocations**: If the user clicks the sparkle button while a generation is already in progress, the button action is ignored (FR-010b). No duplicate Claude CLI invocations are created.
- **Multi-Root Workspaces**: The extension uses the repository associated with the active SCM provider (set by the user in the Source Control view). If no SCM provider is active, the button is not visible.
- **Non-Conventional Response**: If Claude CLI returns a response that is not a valid commit message (e.g., contains markdown, explanations, or code blocks), the raw trimmed output is used as-is. The prompt template enforces "Return ONLY the commit message"; any deviation is the user's responsibility to fix before committing.
- **Empty/Whitespace-Only Response**: If Claude returns only whitespace, the error "Claude returned an empty message. Please try again." is displayed (FR-011).
- **Binary File Diffs**: When staged changes include binary files, `git diff --staged` represents them as "Binary files ... differ". The extension sends this as-is to Claude; Claude decides whether to include it in the analysis.
- **Non-UTF-8 Diff Output**: If file paths or content in the diff contain non-UTF-8 characters, the extension must handle this gracefully without crashing (FR-007c). Encoding errors are logged but not surfaced to the user.
- **Concurrent Staging Changes**: If the user modifies staged files while generation is in progress, the populated message reflects the diff that was captured at invocation time. No re-querying occurs.
- **Very Long Commit Messages**: If Claude generates a commit message with multiple paragraphs or footer sections (per Conventional Commits spec), the entire output is preserved in the input box (FR-014a).
- **Special Characters in Message**: If the generated message contains special characters (quotes, newlines, emoji, unicode), the raw output is used as-is.
- **Prompt Template Conflicts**: If the prompt template contains instructions that conflict with the instruction suffix (e.g., "provide 3 options"), the instruction suffix takes precedence ("Return ONLY the recommended commit message"). This is a prompt engineering concern; the extension enforces the suffix.
- **Detached HEAD State**: If the repository is in a detached HEAD state or mid-rebase, `git diff --staged` still works. The extension proceeds normally without checking the HEAD state.
- **No Workspace**: If the user invokes Claude Code CLI with no workspace folder open, the button is not available (activated only when a `.git` directory is present, FR-001c).
- **VS Code Shutdown During Generation**: If VS Code is closed while Claude CLI is running, the process is forcibly terminated by the OS. No cleanup or graceful shutdown is performed by the extension.
- **Network Latency**: The 15-second timeout in SC-001 excludes network latency to Claude's servers. The 30-second process timeout (FR-013c) is wall-clock time and includes all latency.
- **Large Prompt Template File**: If `.claude/commands/git.commit.md` is extremely large (e.g., 1MB), the file is read and sent to Claude as-is. No truncation occurs.
- **Model Not Found**: If the user specifies a model name that does not exist in Claude CLI, the CLI returns an error, which is surfaced as "Claude Code CLI failed: [error details]" (FR-011).

## Requirements *(mandatory)*

### Functional Requirements

#### Button & Activation
- **FR-001**: The extension MUST display a sparkle button (codicon `$(sparkle)`) in the Source Control view header bar within the `navigation` group, visible only when the active SCM provider is Git.
- **FR-001a**: The button MUST have a tooltip with text: "Generate commit message with Claude Code CLI".
- **FR-001b**: The button MUST have an accessible ARIA label: "Generate commit message".
- **FR-001c**: The extension MUST activate (load) when a `.git` directory is present in the workspace, or when any Git repository is opened in a multi-root workspace.
- **FR-001d**: When multiple SCM providers are active (e.g., Git + SVN), the button MUST be visible only for Git repositories.

#### Workflow & Validation
- **FR-002**: Clicking the sparkle button MUST invoke the commit message generation workflow.
- **FR-003**: The extension MUST verify that the current workspace contains a Git repository before proceeding. If no Git repository is found, the error "No Git repository found in the current workspace" MUST be displayed.
- **FR-004**: The extension MUST verify that staged changes exist before invoking Claude CLI. If no staged changes are found, the error "Please stage your changes before generating a commit message" MUST be displayed.
- **FR-005**: The extension MUST verify that Claude Code CLI is installed and accessible on the system PATH. If Claude CLI is not found, the error "Claude Code CLI is not installed. Please install it first: https://docs.anthropic.com/claude-code" MUST be displayed.
- **FR-005a**: The extension MUST check Claude CLI version to ensure compatibility with required flags (`-p`, `--model`, `--tools`, `--max-turns`, `--output-format`). If version is incompatible, an error MUST be displayed.

#### Prompt Template & Diff Handling
- **FR-006**: The extension MUST read the prompt template from `.claude/commands/git.commit.md` in the workspace root. If the file does not exist, the error "Prompt template not found at .claude/commands/git.commit.md" MUST be displayed.
- **FR-006a**: The extension MUST handle the prompt template path correctly on all platforms (Windows backslashes, macOS/Linux forward slashes).
- **FR-007**: The extension MUST retrieve the staged diff using `git diff --staged` and include it in the prompt sent to Claude CLI with a clear separator.
- **FR-007a**: The extension MUST handle staged diffs larger than 1MB by using appropriate stream handling (not default `maxBuffer` of child_process.exec).
- **FR-007b**: The extension MUST handle binary file diffs gracefully (Git represents them as binary; extension must not fail).
- **FR-007c**: The extension MUST handle diff output containing non-UTF-8 characters without crashing.

#### Message Population & Control
- **FR-008**: The extension MUST populate the Source Control commit message input box with the generated message by setting `repository.inputBox.value` (replacing any existing text).
- **FR-008a**: The extension MUST focus the commit message input box after successful generation for user visibility.
- **FR-008b**: The extension MUST NOT provide undo functionality within the extension (VS Code's undo system handles reverting the populated message).

#### Git Safety & Operations
- **FR-009**: The extension MUST NOT perform any git commit, push, or other write operations. This includes disabling Claude CLI tool use via `--tools ""` to prevent agentic git commands.

#### Progress & Feedback
- **FR-010**: The extension MUST show a progress indicator while the generation is in progress, displayed in `ProgressLocation.SourceControl`.
- **FR-010a**: The progress indicator message MUST read: "Generating commit message with Claude...".
- **FR-010b**: The sparkle button MUST be visually disabled (dimmed or hidden) while generation is in progress to prevent duplicate invocations.
- **FR-010c**: The extension MUST NOT support cancellation of in-progress generation; the progress indicator MUST remain until completion or timeout.

#### Error Handling & Notifications
- **FR-011**: The extension MUST display actionable error notifications for each failure condition:
  - **No Git repo**: "No Git repository found in the current workspace."
  - **No staged changes**: "Please stage your changes before generating a commit message."
  - **Claude CLI not installed**: "Claude Code CLI is not installed. Please install it first: https://docs.anthropic.com/claude-code"
  - **Missing prompt template**: "Prompt template not found at .claude/commands/git.commit.md"
  - **Claude CLI execution failure**: "Claude Code CLI failed: [error details]. Please check your setup."
  - **Empty response**: "Claude returned an empty message. Please try again."
- **FR-011a**: Each error notification MUST be displayed as a warning severity level and MUST persist until dismissed by the user.
- **FR-011b**: Error notifications for "Claude CLI not installed" and "Missing prompt template" MUST include action buttons (e.g., "View Documentation").
- **FR-011c**: Error conditions MUST be evaluated in the following priority order: (1) no Git repo, (2) no staged changes, (3) no Claude CLI, (4) missing prompt, (5) Claude CLI execution failure, (6) empty response.

#### Configuration
- **FR-012**: The extension MUST support a user-configurable setting `sparkleCommit.claudeModel` (type: string, default: "sonnet") that allows users to specify the Claude model for commit generation.
- **FR-012a**: The setting description MUST state: "Claude model alias or name (e.g., 'sonnet', 'opus'). Run `claude --models` to see available options."
- **FR-012b**: The extension MUST validate that the model name is not empty and contains no shell metacharacters before interpolating into the CLI command (prevent command injection).

#### CLI Invocation & I/O
- **FR-013**: The extension MUST send the prompt to Claude CLI via stdin using the following command: `claude -p --model <model> --output-format text --tools "" --max-turns 1`
- **FR-013a**: The stdin payload MUST be encoded as UTF-8.
- **FR-013b**: The extension MUST use `child_process.exec` with appropriate options: `{ cwd: workspaceRoot, maxBuffer: 10485760 }` (10MB buffer to handle large diffs).
- **FR-013c**: The extension MUST set a timeout of 30 seconds on the Claude CLI process; if exceeded, the error "Claude Code CLI timed out. Please try again." MUST be displayed.
- **FR-013d**: The extension MUST capture stderr from the Claude CLI process and log it for debugging but not display it to the user (unless it indicates a critical error).

#### Output Processing
- **FR-014**: The extension MUST trim leading and trailing whitespace from the CLI output before populating the commit message box.
- **FR-014a**: The extension MUST handle multi-line commit messages (with body and footer sections per Conventional Commits spec) by preserving newlines and internal formatting.
- **FR-014b**: The extension MUST NOT further process or validate the message format; the raw trimmed output is used as-is (the prompt template enforces Conventional Commits format).

### Key Entities

- **Prompt Template**: The file at `.claude/commands/git.commit.md` containing commit message generation guidelines. Attributes: file path, content (markdown text), encoding (UTF-8).
- **Staged Diff**: The output of `git diff --staged` representing the changes the user intends to commit. Attributes: diff text, repository path, size (up to 10MB), encoding (UTF-8 or system default).
- **Generated Commit Message**: The single-line or multi-line conventional commit message produced by Claude CLI. Attributes: message text, type, scope, description, format (raw text, trimmed whitespace).
- **Claude CLI Process**: A child process spawned via `child_process.exec` with stdin/stdout communication. Attributes: command string, working directory (workspace root), environment (inherited), timeout (30 seconds), maxBuffer (10MB).

## Assumptions

- **Claude CLI Availability**: Claude Code CLI (`claude`) is a locally installed command-line tool available on the user's PATH. The extension does not install or manage it. Users must install Claude CLI independently via the official documentation.
- **Prompt Template Requirement**: The prompt template file (`.claude/commands/git.commit.md`) exists in the workspace root. If it does not, the extension reports an error rather than using a fallback. The template is responsibility of the project, not the extension.
- **Default Model**: The default Claude model is `sonnet` (Claude CLI alias, matching the latest production-ready model as of 2026-02-18). Users can override via the `sparkleCommit.claudeModel` setting. Model names must match valid Claude CLI model identifiers.
- **Claude CLI Flags Support**: Claude CLI version in use supports the following flags: `-p` (print mode), `--model`, `--output-format`, `--tools`, `--max-turns`. Minimum version: Claude CLI 1.0 or later (actual version verification deferred to implementation).
- **Single-Prompt Limitation**: Each button click sends exactly one prompt to Claude CLI (`--max-turns 1`). No multi-turn conversation; the result is the final message.
- **No Tool Use**: Claude CLI is invoked with `--tools ""` to disable agentic tool use. The response is always plain text, not tool invocations or structured output.
- **Git Availability**: Git (`git` command) is available on the system PATH. This is a prerequisite for any VS Code Git repository integration.
- **VS Code Git Extension**: The VS Code Git extension (`vscode.git`) is installed and active. This is a built-in extension in standard VS Code distributions.
- **Multi-Root Workspace Behavior**: In multi-root workspaces, the extension uses the repository associated with the active SCM provider. If no SCM provider is active, the button does not appear.
- **No Persistence**: The extension does not persist state between activations (no cache, no history, no undo log).
- **Platform Support**: The extension targets Windows, macOS, and Linux. Cross-platform path handling (forward vs. backslash) is the extension's responsibility.
- **UTF-8 Encoding**: All text input/output (prompt template, staged diff, CLI response) is assumed to be UTF-8. Non-UTF-8 characters in diffs are handled gracefully without crashing.
- **Stdout/Stderr Separation**: Claude CLI uses standard conventions: exit code 0 = success, non-zero = failure. Stdout contains the message; stderr may contain warnings or context (not displayed to user).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can generate a conventional commit message with a single button click within 15 seconds of Claude CLI starting to process the prompt (i.e., wall-clock time from CLI invocation to response, excluding network latency and user workspace delays). Timeout is 30 seconds (FR-013c); messaging indicates success/failure within 2 seconds.
- **SC-002**: The generated commit message follows the Conventional Commits format (`type(scope): description[, optional body][, optional footer]`) in 100% of successful generations. Format is enforced by the prompt template and trimming (FR-014); the extension does not validate format.
- **SC-003**: Users receive a clear, actionable error notification within 2 seconds for every failure condition (no repo, no staged changes, no CLI, missing prompt, CLI failure, empty response). Error messages are non-dismissible until explicitly closed by the user and include specific context (e.g., file path, CLI output).
- **SC-004**: The extension never performs a git commit, push, add, reset, or any other git write operation on behalf of the user. This is enforced by design (no git commands are executed except for read-only queries: `git rev-parse`, `git diff --staged`, `git diff --staged --stat`) and by disabling Claude tool use (FR-009).
- **SC-005**: 90% of users can successfully generate their first commit message without reading documentation, relying solely on the visible sparkle button (FR-001a tooltip), clear error messages (FR-011), and the button's presence in the expected Source Control location. Usability is validated through user testing (not automated); this is an aspirational target.
