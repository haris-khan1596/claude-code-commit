# CLI Integration Requirements Quality Checklist: Sparkle Commit

**Purpose**: Deep-dive validation of requirements quality for Claude CLI and Git process integration boundaries - stdin/stdout contracts, error semantics, timeout/buffer limits, cross-platform behavior
**Created**: 2026-02-18
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [research.md](../research.md) | [contracts/README.md](../contracts/README.md)
**Depth**: Standard
**Audience**: Reviewer (pre-implementation gate)

**Note**: This checklist tests whether CLI integration requirements are written correctly, not whether the implementation works.

## Process Invocation Requirements

- [ ] CHK001 - Is the exact CLI command string fully specified as a requirement, or only documented in plan/research artifacts? [Gap - spec §FR-013 says "send via stdin" but exact flags like `--tools ""`, `--max-turns 1` are only in plan R3]
- [ ] CHK002 - Are requirements defined for how the `--model` flag value is sanitized before being interpolated into the shell command? [Gap - plan R3 shows string interpolation `--model ${model}` but no input validation requirement exists]
- [ ] CHK003 - Is the working directory (`cwd`) for CLI invocations explicitly specified as a requirement? [Gap - plan R3 mentions `cwd: workspaceRoot` but spec has no requirement for it]
- [ ] CHK004 - Are requirements defined for the shell environment in which CLI processes are spawned (PATH inheritance, locale, encoding)? [Gap]
- [ ] CHK005 - Is the requirement for `--tools ""` (disabling agentic tool use) documented in the spec, or only as a plan-level decision? [Gap - this is critical for FR-009 compliance but only in research R3]

## Stdin/Stdout Contract Requirements

- [ ] CHK006 - Is the stdin encoding requirement specified (UTF-8, system default, or configurable)? [Gap - spec §FR-013 says "send via stdin" but no encoding specified]
- [ ] CHK007 - Is the maximum stdin payload size addressed in requirements (large diffs may exceed `child_process.exec` default 1MB maxBuffer)? [Gap - edge case mentions "large diff" but no buffer limit requirement, Assumption in full-scope CHK037]
- [ ] CHK008 - Are requirements defined for stdout parsing beyond "trim whitespace"? [Clarity, Spec §FR-014 - is trimming sufficient when Claude might prefix with newlines or trailing metadata?]
- [ ] CHK009 - Are requirements specified for handling stderr output from the Claude CLI (log it, display it, ignore it)? [Gap - contracts doc lists stderr but spec has no requirement for it]
- [ ] CHK010 - Is the expected stdout format documented as a requirement (single line, multi-line with body, multi-line with footer sections)? [Gap - spec §FR-014 only mentions trimming]

## Error Code & Failure Mode Requirements

- [ ] CHK011 - Are specific exit code requirements documented for Claude CLI (exit 0 = success, non-zero = failure), or is this only assumed? [Assumption - contracts doc states it but spec §FR-011 doesn't reference exit codes]
- [ ] CHK012 - Are requirements defined for distinguishing between different non-zero exit codes from Claude CLI (auth failure vs. network error vs. model not found vs. rate limit)? [Gap - spec §FR-011 lists "CLI failure" as one condition but doesn't differentiate]
- [ ] CHK013 - Are error message content requirements specific for each Git CLI failure (e.g., `git rev-parse` fails vs. `git diff --staged` fails)? [Clarity, Spec §FR-011 - lumps into "no repo" and "no staged"]
- [ ] CHK014 - Is the requirement for "empty response" (spec §FR-011) defined precisely - does it mean zero-length stdout, whitespace-only stdout, or stdout that doesn't match commit message format? [Ambiguity, Spec §FR-011]
- [ ] CHK015 - Are requirements specified for the scenario where Claude CLI exits with code 0 but produces stderr output (warning but not failure)? [Gap, Alternate Flow]

## Timeout & Resource Requirements

- [ ] CHK016 - Is a timeout requirement specified for the Claude CLI process? [Gap - spec §SC-001 mentions 15 seconds but doesn't define timeout behavior when exceeded]
- [ ] CHK017 - Are requirements defined for what happens when the timeout is reached (kill process, show error, allow extension)? [Gap, Recovery Flow]
- [ ] CHK018 - Is a timeout requirement specified for Git CLI operations (`git diff --staged` on very large repos)? [Gap]
- [ ] CHK019 - Are requirements defined for the `maxBuffer` option of `child_process.exec` to handle large diffs? [Gap - plan R4 uses exec but default 1MB buffer is not addressed in requirements]
- [ ] CHK020 - Are memory/resource cleanup requirements specified for child processes that are killed or timeout? [Gap]

## Cross-Platform Requirements

- [ ] CHK021 - Are requirements specified for how the `claude` command is resolved on Windows (`.cmd`/`.exe` extension, `where` vs. `which`)? [Gap - spec §FR-005 says "accessible on system PATH" but Windows PATH resolution differs]
- [ ] CHK022 - Are requirements defined for shell quoting differences when constructing the CLI command on Windows vs. Unix? [Gap - plan R3 shows `--tools ""` which may behave differently in cmd.exe vs. bash]
- [ ] CHK023 - Is the `git` command resolution requirement platform-aware (Git Bash on Windows, Xcode git on macOS)? [Gap - spec §FR-003/FR-004 assume git is available but don't address platform variants]
- [ ] CHK024 - Are line-ending requirements specified for stdout parsing (CRLF on Windows vs. LF on Unix)? [Gap - spec §FR-014 says "trim whitespace" but doesn't address platform-specific line endings]
- [ ] CHK025 - Are requirements defined for path separators in the prompt template path (`.claude/commands/git.commit.md`) on Windows? [Gap, Spec §FR-006]

## Claude CLI Version & Compatibility Requirements

- [ ] CHK026 - Is a minimum Claude CLI version requirement specified that supports all required flags (`-p`, `--model`, `--tools`, `--max-turns`, `--output-format`)? [Gap - spec §FR-005 only checks "installed"]
- [ ] CHK027 - Are requirements defined for handling Claude CLI version check failures gracefully (older version missing flags)? [Gap, Exception Flow]
- [ ] CHK028 - Is the `claude --version` output format requirement documented for parsing the version check response? [Gap - plan R4 mentions the command but spec doesn't define how to interpret the output]

## Git CLI Contract Requirements

- [ ] CHK029 - Is the requirement for `git diff --staged` vs. `git diff --cached` clarified (they are aliases, but spec should pick one canonical form)? [Clarity - spec uses "--staged" in FR-007 description, contracts doc uses "--staged"]
- [ ] CHK030 - Are requirements defined for the git diff output encoding when filenames contain non-ASCII characters? [Gap, Edge Case]
- [ ] CHK031 - Is the `git diff --staged --stat` command documented as the mechanism for checking staged changes, or only the existence of staged changes? [Clarity - contracts doc specifies the command but spec §FR-004 just says "verify staged changes exist"]
- [ ] CHK032 - Are requirements defined for the scenario where `git rev-parse --git-dir` succeeds but the repository is in a detached HEAD state or mid-rebase? [Gap, Edge Case]

## Prompt Assembly Requirements

- [ ] CHK033 - Is the prompt separator string (`--- STAGED GIT DIFF BELOW ---`) specified as a requirement or only a plan-level decision? [Gap - only in research R5]
- [ ] CHK034 - Is the instruction suffix text ("Return ONLY the recommended commit message...") specified as a requirement or only a plan-level decision? [Gap - only in research R5, critical for output quality]
- [ ] CHK035 - Are requirements defined for what happens when the prompt template contains instructions that conflict with the instruction suffix (e.g., template says "present 3 options")? [Gap, Conflict scenario]

## Notes

- Check items off as completed: `[x]`
- Items referencing [Gap] indicate missing requirements not yet in spec - many are plan-level decisions that should be promoted to spec requirements
- Key theme: Many CLI integration details exist only in plan/research but are not formal spec requirements, creating risk of implementation drift
- The `child_process.exec` 1MB default maxBuffer is a significant risk for large diffs (CHK007, CHK019)
- Cross-platform concerns (CHK021-CHK025) are entirely absent from the spec
- Priority: Address buffer limits (CHK007/CHK019), timeout behavior (CHK016/CHK017), and command injection risk (CHK002) before implementation
