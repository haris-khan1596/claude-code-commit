# claude-code-commits

**Already using Claude Code? Get commit messages for free — one click, zero config.**

Stop writing commit messages by hand. This extension uses the Claude Code CLI you already have installed to analyze your staged changes and generate clean, conventional commit messages — right in the Source Control panel.

> No API keys. No extra subscriptions. If you have Claude Code CLI, you're ready to go.

## Quick Start

1. Install the extension
2. Stage your changes
3. Click the sparkle button in Source Control
4. Review, edit if needed, commit

That's it. Works out of the box.

## Features

- **One-click generation** — Sparkle button in the Source Control title bar, or use the command palette
- **Conventional Commits** — Generates `<type>(<scope>): <description>` format with proper imperative mood and 72-char limits
- **Zero config needed** — Built-in prompt works immediately; customize only if you want to
- **Custom commit rules** — Drop a markdown file in your workspace to define your own commit style
- **Model selection** — Switch between Haiku (fast), Sonnet (balanced), or Opus (most capable)
- **Safe by design** — Only populates the message box. Never commits, pushes, or runs any git write operations

## Requirements

| Requirement | Details |
|---|---|
| VS Code | `1.109.0` or later |
| Claude Code CLI | [Install here](https://docs.anthropic.com/en/docs/claude-code) — must be on your `PATH` and authenticated |
| Git | Installed and initialized in your workspace |

## Settings

| Setting | Default | Description |
|---|---|---|
| `sparkleCommit.claudeModel` | `haiku` | Model alias (`sonnet`, `opus`, `haiku`) or full model name |
| `sparkleCommit.commitRulesPath` | `.vscode/commit-rules.md` | Path to custom commit rules file (relative to workspace root) |

## Customizing the Prompt

By default the extension uses a built-in Conventional Commits prompt. To override it:

1. Create a file at `.vscode/commit-rules.md` (or set a custom path via `sparkleCommit.commitRulesPath`)
2. Write your commit rules in plain text or markdown
3. The extension will use your file instead of the default

If the file is missing or unreadable, the built-in default kicks in automatically.

## Feedback & Ideas

This extension is actively maintained and shaped by its users. If you have a feature request, found a bug, or just want to suggest how commit messages could be smarter — open an issue:

[**Open an issue on GitHub**](https://github.com/haris-khan1596/claude-code-commit/issues/new)

Some ideas to get you started:
- Commit styles you'd like supported (e.g., emoji, gitmoji, custom prefixes)
- Language support for non-English commit messages
- Workflow improvements (multi-repo, monorepo, staged file filtering)
- Anything that would make this your default commit workflow

Every suggestion helps. Even a quick "I wish it could..." is useful.

## Release Notes

### 1.1.0
- Built-in default prompt — works out of the box, no template file needed
- Custom prompt override via configurable rules file path
- Configurable commit rules path setting

### 1.0.1
- Initial release — one-click commit message generation with Claude Code CLI

---

## License

[LICENSE](LICENSE)
