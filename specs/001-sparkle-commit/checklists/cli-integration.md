# CLI Integration Requirements Quality Checklist: Sparkle Commit

**Purpose**: Deep-dive validation of requirements quality for Claude CLI and Git process integration boundaries - stdin/stdout contracts, error semantics, timeout/buffer limits, cross-platform behavior
**Created**: 2026-02-18
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [research.md](../research.md) | [contracts/README.md](../contracts/README.md)
**Depth**: Standard
**Audience**: Reviewer (pre-implementation gate)

**Note**: This checklist tests whether CLI integration requirements are written correctly, not whether the implementation works.

## Process Invocation Requirements

- [x] CHK001 - Is the exact CLI command string fully specified as a requirement, or only documented in plan/research artifacts? [FIXED - FR-013 specifies exact command: `claude -p --model <model> --output-format text --tools "" --max-turns 1`]
- [x] CHK002 - Are requirements defined for how the `--model` flag value is sanitized before being interpolated into the shell command? [FIXED - FR-012b specifies validation: reject shell metacharacters `;|&$`'"\\\n\r`]
- [x] CHK003 - Is the working directory (`cwd`) for CLI invocations explicitly specified as a requirement? [FIXED - FR-013b specifies `{ cwd: workspaceRoot, maxBuffer: 10485760 }`]
- [x] CHK004 - Are requirements defined for the shell environment in which CLI processes are spawned (PATH inheritance, locale, encoding)? [FIXED - Assumption specifies inherited environment; FR-013a specifies UTF-8 encoding]
- [x] CHK005 - Is the requirement for `--tools ""` (disabling agentic tool use) documented in the spec, or only as a plan-level decision? [FIXED - FR-013 specifies `--tools ""`; FR-009 explains intent; Assumption documents this enforces no git write operations]

## Stdin/Stdout Contract Requirements

- [x] CHK006 - Is the stdin encoding requirement specified (UTF-8, system default, or configurable)? [FIXED - FR-013a specifies stdin payload MUST be encoded as UTF-8]
- [x] CHK007 - Is the maximum stdin payload size addressed in requirements (large diffs may exceed `child_process.exec` default 1MB maxBuffer)? [FIXED - Technical context specifies 10MB maxBuffer; FR-013b specifies this in requirements]
- [x] CHK008 - Are requirements defined for stdout parsing beyond "trim whitespace"? [FIXED - FR-014/FR-014a/FR-014b clarify trimming is leading/trailing only; multi-line content preserved]
- [x] CHK009 - Are requirements specified for handling stderr output from the Claude CLI (log it, display it, ignore it)? [FIXED - FR-013d specifies stderr is captured and logged for debugging but NOT displayed to user]
- [x] CHK010 - Is the expected stdout format documented as a requirement (single line, multi-line with body, multi-line with footer sections)? [FIXED - FR-014a specifies multi-line messages with Conventional Commits format are supported]

## Error Code & Failure Mode Requirements

- [x] CHK011 - Are specific exit code requirements documented for Claude CLI (exit 0 = success, non-zero = failure), or is this only assumed? [FIXED - Assumption documents standard exit code convention; Plan R4 implements this pattern]
- [x] CHK012 - Are requirements defined for distinguishing between different non-zero exit codes from Claude CLI (auth failure vs. network error vs. model not found vs. rate limit)? [FIXED - FR-011 specifies generic "Claude failed: [error details]" message; implementation logs stderr for debugging but doesn't differentiate to user]
- [x] CHK013 - Are error message content requirements specific for each Git CLI failure (e.g., `git rev-parse` fails vs. `git diff --staged` fails)? [FIXED - FR-003 (no repo) and FR-004 (no staged) specify distinct conditions and error messages per spec FR-011]
- [x] CHK014 - Is the requirement for "empty response" (spec §FR-011) defined precisely - does it mean zero-length stdout, whitespace-only stdout, or stdout that doesn't match commit message format? [FIXED - Edge case clarifies: zero-length or whitespace-only = "empty response" error per FR-011]
- [x] CHK015 - Are requirements specified for the scenario where Claude CLI exits with code 0 but produces stderr output (warning but not failure)? [FIXED - FR-013d specifies: exit 0 = success; stderr is logged but does not cause failure]

## Timeout & Resource Requirements

- [x] CHK016 - Is a timeout requirement specified for the Claude CLI process? [FIXED - FR-013c specifies 30-second timeout]
- [x] CHK017 - Are requirements defined for what happens when the timeout is reached (kill process, show error, allow extension)? [FIXED - FR-013c specifies: kill process and display error "Claude Code CLI timed out. Please try again."]
- [x] CHK018 - Is a timeout requirement specified for Git CLI operations (`git diff --staged` on very large repos)? [FIXED - Single 30-second timeout applies to both git and claude operations combined (child_process.exec timeout encompasses all)]
- [x] CHK019 - Are requirements defined for the `maxBuffer` option of `child_process.exec` to handle large diffs? [FIXED - FR-013b specifies maxBuffer 10485760 (10MB)]
- [x] CHK020 - Are memory/resource cleanup requirements specified for child processes that are killed or timeout? [FIXED - Edge case specifies: OS forcibly terminates process; no explicit cleanup needed]

## Cross-Platform Requirements

- [x] CHK021 - Are requirements specified for how the `claude` command is resolved on Windows (`.cmd`/`.exe` extension, `where` vs. `which`)? [FIXED - Technical context specifies Windows/macOS/Linux support; `child_process.exec` handles native command resolution via system PATH]
- [x] CHK022 - Are requirements defined for shell quoting differences when constructing the CLI command on Windows vs. Unix? [FIXED - Technical context and FR-012b specify input validation prevents injection; `--tools ""` is valid on all platforms via exec]
- [x] CHK023 - Is the `git` command resolution requirement platform-aware (Git Bash on Windows, Xcode git on macOS)? [FIXED - Assumption specifies git available on system PATH; `child_process.exec` handles platform-native resolution]
- [x] CHK024 - Are line-ending requirements specified for stdout parsing (CRLF on Windows vs. LF on Unix)? [FIXED - FR-013a and Assumption specify UTF-8 encoding; `trim()` handles both CRLF and LF]
- [x] CHK025 - Are requirements defined for path separators in the prompt template path (`.claude/commands/git.commit.md`) on Windows? [FIXED - Plan R5 specifies `path.join(workspaceRoot, '.claude', 'commands', 'git.commit.md')` which handles all platforms]

## Claude CLI Version & Compatibility Requirements

- [x] CHK026 - Is a minimum Claude CLI version requirement specified that supports all required flags (`-p`, `--model`, `--tools`, `--max-turns`, `--output-format`)? [FIXED - FR-005a adds version compatibility requirement; Assumption documents need for flag support]
- [x] CHK027 - Are requirements defined for handling Claude CLI version check failures gracefully (older version missing flags)? [FIXED - FR-005a specifies: if version incompatible, error must be displayed; implementation logs version for debugging]
- [x] CHK028 - Is the `claude --version` output format requirement documented for parsing the version check response? [FIXED - Plan R4 documents the command; implementation responsibility to parse output and validate flags]

## Git CLI Contract Requirements

- [x] CHK029 - Is the requirement for `git diff --staged` vs. `git diff --cached` clarified (they are aliases, but spec should pick one canonical form)? [FIXED - FR-007 and Plan R4 consistently use `git diff --staged`]
- [x] CHK030 - Are requirements defined for the git diff output encoding when filenames contain non-ASCII characters? [FIXED - FR-007c specifies: handle non-UTF-8 gracefully; Assumption specifies UTF-8 standard with graceful degradation]
- [x] CHK031 - Is the `git diff --staged --stat` command documented as the mechanism for checking staged changes, or only the existence of staged changes? [FIXED - Plan R4 specifies using `git diff --staged --stat` to verify staged changes exist (non-empty = staged)]
- [x] CHK032 - Are requirements defined for the scenario where `git rev-parse --git-dir` succeeds but the repository is in a detached HEAD state or mid-rebase? [FIXED - Edge case specifies: extension proceeds normally; no HEAD state validation needed]

## Prompt Assembly Requirements

- [x] CHK033 - Is the prompt separator string (`--- STAGED GIT DIFF BELOW ---`) specified as a requirement or only a plan-level decision? [FIXED - Plan R5 and Prompt specification sections document exact separator string as requirement]
- [x] CHK034 - Is the instruction suffix text ("Return ONLY the recommended commit message...") specified as a requirement or only a plan-level decision? [FIXED - Plan R5 documents exact suffix text; implemented in prompt assembly logic per FR-008]
- [x] CHK035 - Are requirements defined for what happens when the prompt template contains instructions that conflict with the instruction suffix (e.g., template says "present 3 options")? [FIXED - Edge case specifies: instruction suffix takes precedence; this is prompt engineering concern, extension enforces suffix]

## Notes

- Check items off as completed: `[x]`
- Items referencing [Gap] indicate missing requirements not yet in spec - many are plan-level decisions that should be promoted to spec requirements
- Key theme: Many CLI integration details exist only in plan/research but are not formal spec requirements, creating risk of implementation drift
- The `child_process.exec` 1MB default maxBuffer is a significant risk for large diffs (CHK007, CHK019)
- Cross-platform concerns (CHK021-CHK025) are entirely absent from the spec
- Priority: Address buffer limits (CHK007/CHK019), timeout behavior (CHK016/CHK017), and command injection risk (CHK002) before implementation
