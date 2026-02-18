# claude-code-commits

Generate conventional commit messages with Claude Code CLI, right from VS Code's Source Control panel.

Hit the sparkle button, get a well-crafted commit message. Review it, commit. That's it.

## Features

- **One-click commit messages** — A sparkle button appears in the Source Control title bar. Click it to generate a commit message from your staged changes.
- **Conventional Commits** — Messages follow the `<type>(<scope>): <description>` format with proper imperative mood, scoping, and 72-char line limits.
- **Style-aware** — Analyzes your recent commit history to match your project's existing conventions.
- **User-controlled** — The extension only generates and populates the message. It never commits, pushes, or performs any git write operations on your behalf.
- **Configurable model** — Choose which Claude model to use (sonnet, opus, haiku, etc.) via settings.

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) must be installed and available on your `PATH`.
- Git must be installed.
- VS Code 1.109.0 or later.

## How It Works

1. Stage your changes in Git as usual.
2. Click the sparkle button in the Source Control title bar, or run `Generate commit message with Claude Code CLI` from the command palette.
3. The extension sends your staged diff to Claude via the CLI.
4. Claude generates a conventional commit message and populates the SCM input box.
5. Review the message, edit if needed, and commit.

## Extension Settings

This extension contributes the following setting:

* `sparkleCommit.claudeModel`: Claude model alias or name (default: `"sonnet"`). Run `claude --models` to see available options.

## Known Issues

- Test suite is currently a stub — full test coverage is planned.
- This is a pre-release version (0.0.1).

## Release Notes

### 0.0.1

Initial release — core commit message generation with Claude Code CLI integration.

---

## License

See [LICENSE](LICENSE) for details.
