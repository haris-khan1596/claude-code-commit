# Data Model: Sparkle Commit

**Branch**: `001-sparkle-commit`
**Date**: 2026-02-18

## Overview

This extension has no persistent data model. All data is transient, flowing
through the generation pipeline in a single request-response cycle. No state
is stored between invocations.

## Entities

### Prompt Template

- **Source**: File at `.claude/commands/git.commit.md` in workspace root
- **Attributes**:
  - `filePath`: Absolute path to the template file
  - `content`: Raw markdown text content of the file
- **Lifecycle**: Read from disk on each button click. Not cached.
- **Validation**: File must exist and be non-empty.

### Staged Diff

- **Source**: Output of `git diff --staged` in the workspace root
- **Attributes**:
  - `diffText`: Full unified diff string
  - `repositoryPath`: Path to the git repository root
- **Lifecycle**: Generated on each button click via child_process.
- **Validation**: Must be non-empty (indicates staged changes exist).

### Assembled Prompt

- **Source**: Constructed from Prompt Template + Staged Diff + instruction suffix
- **Attributes**:
  - `fullPrompt`: Concatenated string sent to Claude CLI stdin
- **Lifecycle**: Assembled in memory, sent to CLI, then discarded.
- **Validation**: Both template and diff must be present.

### Generated Commit Message

- **Source**: stdout from Claude CLI process
- **Attributes**:
  - `rawOutput`: Raw string from CLI stdout
  - `trimmedMessage`: Whitespace-trimmed version used for display
- **Lifecycle**: Received from CLI, trimmed, written to SCM input box, then discarded.
- **Validation**: Must be non-empty after trimming.

## Data Flow

```text
Button Click
    │
    ▼
┌─────────────┐     ┌──────────────┐
│ Prompt       │     │ Staged Diff  │
│ Template     │     │ (git diff    │
│ (.claude/    │     │  --staged)   │
│ commands/    │     │              │
│ git.commit.md)│    │              │
└──────┬──────┘     └──────┬───────┘
       │                    │
       ▼                    ▼
   ┌────────────────────────────┐
   │ Assembled Prompt           │
   │ (template + diff + suffix) │
   └─────────────┬──────────────┘
                 │
                 ▼ stdin
   ┌────────────────────────────┐
   │ Claude CLI                 │
   │ (claude -p --model ...)    │
   └─────────────┬──────────────┘
                 │ stdout
                 ▼
   ┌────────────────────────────┐
   │ Generated Commit Message   │
   │ (trimmed)                  │
   └─────────────┬──────────────┘
                 │
                 ▼
   ┌────────────────────────────┐
   │ SCM Input Box              │
   │ (repository.inputBox.value)│
   └────────────────────────────┘
```

## Relationships

- Assembled Prompt **requires** both Prompt Template and Staged Diff
- Generated Commit Message **requires** Assembled Prompt (via Claude CLI)
- SCM Input Box **receives** Generated Commit Message

## Configuration Entity

### Extension Setting

- **Key**: `sparkleCommit.claudeModel`
- **Type**: string
- **Default**: `"sonnet"`
- **Description**: Claude model to use for commit message generation
- **Lifecycle**: Read from VS Code workspace/user settings on each invocation
