# Tasks: Sparkle Commit

**Input**: Design documents from `/specs/001-sparkle-commit/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No test tasks are included. Tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (flat module structure per plan.md)
- **Tests**: `src/test/` (existing scaffold)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Update project scaffold from hello-world template to sparkle-commit structure

- [ ] T001 Update `package.json` to register `claude-code-commits.generateCommit` command with sparkle icon `$(sparkle)`, add `scm/title` menu contribution with `"when": "scmProvider == git"`, add `sparkleCommit.claudeModel` configuration setting with default `"sonnet"`, and add `activationEvents` for `onCommand:claude-code-commits.generateCommit`
- [ ] T002 Create VS Code Git extension type declarations in `src/git-extension.d.ts` defining `GitExtension`, `API`, `Repository`, and `InputBox` interfaces needed for `vscode.git` API access (per research R2)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core modules that ALL user stories depend on — git operations, Claude CLI invocation, and prompt assembly

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Implement `src/git.ts` with three exported async functions: `isGitRepository(cwd: string): Promise<boolean>` (runs `git rev-parse --git-dir`), `hasStagedChanges(cwd: string): Promise<boolean>` (runs `git diff --staged --stat`), and `getStagedDiff(cwd: string): Promise<string>` (runs `git diff --staged`). All use `child_process.exec` wrapped in promises. Return clear results; do NOT show VS Code UI messages.
- [ ] T004 [P] Implement `src/claude.ts` with two exported async functions: `isClaudeInstalled(): Promise<boolean>` (runs `claude --version`) and `generateCommitMessage(prompt: string, model: string, cwd: string): Promise<string>` (spawns `claude -p --model <model> --output-format text --tools "" --max-turns 1`, writes prompt to stdin, reads stdout, trims whitespace). Reject on non-zero exit or empty output.
- [ ] T005 [P] Implement `src/prompt.ts` with two exported async functions: `loadPromptTemplate(workspaceRoot: string): Promise<string>` (reads `.claude/commands/git.commit.md` via `fs.promises.readFile`) and `assemblePrompt(template: string, diff: string): string` (concatenates template + `"\n\n--- STAGED GIT DIFF BELOW ---\n\n"` + diff + instruction suffix per research R5).

**Checkpoint**: Foundation ready — all three utility modules provide the building blocks for user story implementation

---

## Phase 3: User Story 1 — Generate Commit Message (Priority: P1) 🎯 MVP

**Goal**: Developer clicks sparkle button, staged diff is sent to Claude CLI with prompt template, and the generated conventional commit message populates the SCM input box.

**Independent Test**: Stage files in a Git repo, click the sparkle button, verify the commit message box is populated with a conventional commit message. Progress indicator should appear during generation.

### Implementation for User Story 1

- [ ] T006 [US1] Rewrite `src/extension.ts` `activate` function: remove hello-world command, register `claude-code-commits.generateCommit` command. The command handler should: (0) check a module-level `isGenerating` flag and return early if true; set it to true on entry and false on completion/error (re-entrancy guard per spec edge case), (1) get the workspace root folder, (2) call `isGitRepository`, (3) call `hasStagedChanges`, (4) call `isClaudeInstalled`, (5) call `loadPromptTemplate`, (6) wrap steps 5-10 in `vscode.window.withProgress` with `ProgressLocation.SourceControl` and title "Generating commit message...", (7) call `getStagedDiff`, (8) call `assemblePrompt`, (9) read `sparkleCommit.claudeModel` from `vscode.workspace.getConfiguration`, (10) call `generateCommitMessage`, (11) get the Git extension API via `vscode.extensions.getExtension<GitExtension>('vscode.git')`, get `repositories[0]`, and set `repository.inputBox.value` to the trimmed result. Push the disposable to `context.subscriptions`.
- [ ] T007 [US1] Remove the old `claude-code-commits.helloWorld` command registration from `package.json` (replaced by `generateCommit` in T001) and verify the `deactivate` function in `src/extension.ts` is a clean no-op export

**Checkpoint**: User Story 1 is fully functional — clicking ✨ in SCM header generates and populates a commit message

---

## Phase 4: User Story 2 — Error Feedback (Priority: P2)

**Goal**: Every failure condition produces a clear, actionable VS Code error notification so the developer knows exactly what to fix.

**Independent Test**: Trigger button in each error condition (no repo, no staged files, no Claude CLI, missing prompt file, CLI failure, empty response) and verify each shows the correct error notification.

### Implementation for User Story 2

- [ ] T008 [US2] Add error handling to the command handler in `src/extension.ts`: after each precondition check (steps 2-5 in T006), if the check fails, call `vscode.window.showErrorMessage` with the specific actionable message and return early. Error messages: (1) "No Git repository found in this workspace." for no repo, (2) "No staged changes found. Stage your changes with `git add` first." for no staged changes, (3) "Claude Code CLI not found. Install it from https://docs.anthropic.com/en/docs/claude-code/getting-started" for no CLI, (4) "Prompt template not found at `.claude/commands/git.commit.md`. Create this file with your commit message guidelines." for missing template.
- [ ] T009 [US2] Add error handling for Claude CLI invocation failures in `src/extension.ts`: wrap `generateCommitMessage` call in try/catch, show `vscode.window.showErrorMessage` with "Failed to generate commit message: <error details>" on rejection. Also handle empty trimmed response: show "Claude returned an empty response. Try again or check your prompt template."

**Checkpoint**: User Stories 1 AND 2 both work — happy path generates messages, all error paths show clear notifications

---

## Phase 5: User Story 3 — Configure Claude Model (Priority: P3)

**Goal**: Developer can choose a different Claude model for commit message generation via VS Code settings.

**Independent Test**: Change the `sparkleCommit.claudeModel` setting to a different value, click the sparkle button, verify the CLI invocation uses the configured model name.

### Implementation for User Story 3

- [ ] T010 [US3] Validate and fix model configuration wiring in `src/extension.ts` and `package.json`: ensure `vscode.workspace.getConfiguration('sparkleCommit').get<string>('claudeModel', 'sonnet')` is read before calling `generateCommitMessage` and passed as the `model` argument. Confirm `package.json` contributes `configuration.properties["sparkleCommit.claudeModel"]` with type `string`, default `"sonnet"`, and description. If any wiring is missing or incorrect from T001/T006, fix it in this task.

**Checkpoint**: All user stories are independently functional — message generation, error handling, and model configuration all work

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and build verification

- [ ] T011 [P] Run `npm run compile` to verify the TypeScript project compiles without errors
- [ ] T012 [P] Run `npm run lint` and fix any linting errors across all modified files
- [ ] T013 Verify end-to-end via `quickstart.md` validation: launch Extension Development Host (F5), open a Git repo with staged changes, click ✨ button, confirm commit message appears in SCM input box

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001 for type declarations T002) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion (needs git.ts, claude.ts, prompt.ts)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (adds error handling to existing command handler)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (verifies configuration wiring in existing handler)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Builds on User Story 1's command handler — Must follow US1 but is independently testable
- **User Story 3 (P3)**: Verifies configuration in User Story 1's handler — Must follow US1 but is independently testable

### Within Each Phase

- Phase 2: T003, T004, T005 are all [P] — can be implemented in parallel (separate files, no interdependencies)
- Phase 3: T006 then T007 (sequential — T007 cleans up after T006)
- Phase 4: T008 then T009 (sequential — T008 handles precondition errors, T009 handles runtime errors)
- Phase 6: T011, T012 are [P] — can run in parallel; T013 depends on both passing

### Parallel Opportunities

- **Phase 2 (maximum parallelism)**: All three foundational modules (git.ts, claude.ts, prompt.ts) can be written simultaneously — they have zero interdependencies
- **Phase 6**: Compile and lint checks can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all three foundational modules in parallel:
Task: "Implement git operations module in src/git.ts"
Task: "Implement Claude CLI module in src/claude.ts"
Task: "Implement prompt assembly module in src/prompt.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T005, all parallelizable)
3. Complete Phase 3: User Story 1 (T006-T007)
4. **STOP and VALIDATE**: Test by clicking ✨ with staged changes — message should appear in SCM input box
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test error scenarios → Deploy/Demo
4. Add User Story 3 → Test model config → Deploy/Demo
5. Each story adds robustness without breaking previous stories

### Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- The existing `src/extension.ts` scaffold will be rewritten in T006 (not incrementally patched)
- The existing `src/test/extension.test.ts` is retained but not modified (no test tasks requested)
- Total new files: 4 (git.ts, claude.ts, prompt.ts, git-extension.d.ts)
- Total modified files: 2 (extension.ts, package.json)
