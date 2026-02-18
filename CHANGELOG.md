# Changelog

All notable changes to the "claude-code-commits" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## [1.0.0] - 2026-02-19

### Added

- One-click commit message generation via sparkle button in Source Control title bar
- Claude Code CLI integration for AI-powered message generation
- Conventional Commits format with automatic type, scope, and description
- Commit history analysis to match project style
- Configurable Claude model selection (`sparkleCommit.claudeModel` setting)
- Prompt template at `.claude/commands/git.commit.md` for customizable generation
- Extension icon for marketplace listing
- MIT license

### Technical

- TypeScript strict mode with webpack bundling
- Zero runtime dependencies
- 30-second CLI timeout with proper error handling
- Shell metacharacter sanitization for model name input
- Concurrent generation prevention
