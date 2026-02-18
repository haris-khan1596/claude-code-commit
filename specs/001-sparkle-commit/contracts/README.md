# Contracts: Sparkle Commit

No API contracts apply to this feature. The Sparkle Commit extension is a
local VS Code extension that:

- Reads files from disk (prompt template)
- Invokes local CLI processes (git, claude)
- Writes to VS Code API surfaces (SCM input box)

There are no HTTP endpoints, REST APIs, GraphQL schemas, or inter-service
communication contracts to define.

## External Process Interfaces

### Claude CLI Invocation

```text
Command: claude -p --model <model> --output-format text --tools "" --max-turns 1
Stdin:   Assembled prompt (template + diff + instruction suffix)
Stdout:  Generated commit message (plain text)
Stderr:  Error messages (if any)
Exit 0:  Success
Exit !0: Failure
```

### Git CLI Invocations

```text
git rev-parse --git-dir
  → Exit 0: Git repository exists
  → Exit !0: Not a git repository

git diff --staged --stat
  → Non-empty stdout: Staged changes exist
  → Empty stdout: No staged changes

git diff --staged
  → Stdout: Full unified diff of staged changes
```
