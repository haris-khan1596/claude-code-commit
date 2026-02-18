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

- What happens when the staged diff is extremely large (e.g., thousands of lines)? The extension sends the full diff; Claude CLI handles its own input limits. If the CLI fails, the error is surfaced to the user.
- What happens when the user clicks the sparkle button while a generation is already in progress? The button action is ignored while the progress indicator is active (no duplicate invocations).
- What happens when the workspace has multiple Git repositories (multi-root workspace)? The extension uses the repository associated with the active Source Control provider.
- What happens when Claude CLI returns a response that is not a valid commit message (e.g., contains markdown or explanation text)? The prompt explicitly instructs "Return ONLY the final commit message." The raw trimmed output is used as-is.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST display a sparkle button in the Source Control view header bar.
- **FR-002**: Clicking the sparkle button MUST invoke the commit message generation workflow.
- **FR-003**: The extension MUST verify that the current workspace contains a Git repository before proceeding.
- **FR-004**: The extension MUST verify that staged changes exist before invoking Claude CLI.
- **FR-005**: The extension MUST verify that Claude Code CLI is installed and accessible on the system PATH.
- **FR-006**: The extension MUST read the prompt template from `.claude/commands/git.commit.md` in the workspace root.
- **FR-007**: The extension MUST retrieve the staged diff and include it in the prompt sent to Claude CLI.
- **FR-008**: The extension MUST populate the Source Control commit message input box with the generated message.
- **FR-009**: The extension MUST NOT perform any git commit, push, or other write operations.
- **FR-010**: The extension MUST show a progress indicator while the generation is in progress.
- **FR-011**: The extension MUST display actionable error notifications for each failure condition (no repo, no staged changes, no CLI, missing prompt, CLI failure, empty response).
- **FR-012**: The extension MUST support a user-configurable setting for the Claude model name, with a sensible default.
- **FR-013**: The extension MUST send the prompt to Claude CLI via standard input and read the commit message from standard output.
- **FR-014**: The extension MUST trim whitespace from the CLI output before populating the commit message box.

### Key Entities

- **Prompt Template**: The file at `.claude/commands/git.commit.md` containing commit message generation guidelines. Attributes: file path, content (markdown text).
- **Staged Diff**: The output of `git diff --staged` representing the changes the user intends to commit. Attributes: diff text, repository path.
- **Generated Commit Message**: The single-line or multi-line conventional commit message produced by Claude CLI. Attributes: message text, type, scope, description.

## Assumptions

- Claude Code CLI (`claude`) is a locally installed command-line tool available on the user's PATH. The extension does not install or manage it.
- The prompt template file (`.claude/commands/git.commit.md`) exists in the workspace root. If it does not, the extension reports an error rather than using a fallback.
- The default Claude model is `sonnet` (Claude CLI alias). Users can override via the `sparkleCommit.claudeModel` setting.
- The extension targets single-repository workspaces as the primary use case. Multi-root workspace behavior relies on the active SCM provider.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can generate a conventional commit message with a single button click within 15 seconds of clicking the sparkle button (excluding network latency to Claude's service).
- **SC-002**: The generated commit message follows the Conventional Commits format (`type(scope): description`) in 100% of successful generations.
- **SC-003**: Users receive a clear, actionable error notification within 2 seconds for every failure condition (no repo, no staged changes, no CLI, missing prompt, CLI failure, empty response).
- **SC-004**: The extension never performs a git commit or any other git write operation on behalf of the user.
- **SC-005**: 90% of users can successfully generate their first commit message without reading documentation, relying solely on the visible sparkle button and error messages.
