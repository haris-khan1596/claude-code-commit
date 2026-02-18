---
description: Generate a conventional commit message from staged changes following project standards.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). User input may specify:
- Commit type override (feat, fix, docs, etc.)
- Scope override
- Additional context or ticket references

## Goal

Analyze staged Git changes and generate a well-structured commit message following the Conventional Commits specification. The message should be informative, concise, and follow project conventions.

## Execution Steps

### 1. Check Staged Changes

Run the following commands to understand what's being committed:

```bash
git status --porcelain
git diff --cached --stat
git diff --cached
```

**Abort** if no changes are staged. Instruct user to stage changes first with `git add`.

### 2. Analyze Recent Commit History

```bash
git log --oneline -10
```

Extract the commit message style used in this repository:
- Conventional commits (type(scope): description)?
- Simple descriptions?
- Ticket/issue references pattern?

### 3. Categorize Changes

Analyze the staged diff to determine:

**Change Type** (in priority order):
- `feat`: New feature or capability
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, whitespace (no code change)
- `refactor`: Code restructuring (no feature/fix)
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `build`: Build system or dependencies
- `ci`: CI/CD configuration
- `chore`: Maintenance tasks

**Scope** (derive from file paths):
- Primary directory or module affected
- Use lowercase, kebab-case
- Examples: `auth`, `api`, `logging`, `models`

**Breaking Changes**:
- Look for removed functions/classes
- Changed function signatures
- Modified public interfaces
- Database schema changes

### 4. Generate Commit Message

Use this format:

```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Rules for description**:
- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter after colon
- No period at the end
- Max 72 characters for first line
- Focus on WHAT and WHY, not HOW

**Body** (include if changes are complex):
- Explain motivation for change
- Contrast with previous behavior
- Wrap at 72 characters

**Footer** (include when applicable):
- `BREAKING CHANGE: <description>` if breaking
- `Fixes #<issue>` or `Closes #<issue>` if applicable
- Co-authored-by if pair programming

### 5. Present Options

Output 2-3 commit message options:

```markdown
## Suggested Commit Messages

### Option 1 (Recommended)
```
feat(logging): add structured JSON log formatter

Implement LoguruJsonFormatter for consistent log output across
all services. Supports correlation IDs and request tracing.
```

### Option 2 (Concise)
```
feat(logging): add JSON log formatter
```

### Option 3 (Detailed)
```
feat(logging): add structured JSON log formatter for observability

- Implement LoguruJsonFormatter class
- Add correlation ID injection middleware
- Configure log rotation and retention
- Update all services to use new formatter

Closes #42
```
```

### 6. User Confirmation

Ask: "Which option would you like to use? Or provide modifications?"

Once confirmed, execute:

```bash
git commit -m "<selected message>"
```

## Commit Message Templates

### Feature
```
feat(<scope>): <what the feature does>

<why it's needed>
<any important implementation notes>
```

### Bug Fix
```
fix(<scope>): <what was broken>

<root cause>
<how it's fixed>

Fixes #<issue>
```

### Breaking Change
```
feat(<scope>)!: <description>

BREAKING CHANGE: <what breaks and migration path>
```

## Operating Principles

- **Analyze before suggesting**: Read the full diff to understand context
- **Match project style**: Follow existing commit conventions in the repo
- **Be specific**: Vague messages like "update code" are not acceptable
- **Atomic commits**: If changes are unrelated, suggest splitting into multiple commits
- **No secrets**: Never include passwords, tokens, or sensitive data in messages
