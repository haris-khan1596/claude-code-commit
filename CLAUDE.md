# claude-code-commits Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-18

## Active Technologies

- TypeScript 5.9 (strict mode) + VS Code Extension API (`@types/vscode ^1.109.0`), Node.js `child_process` (built-in) (001-sparkle-commit)

## Project Structure

```text
src/
├── extension.ts         # Activation, command registration, SCM integration
├── git.ts               # Git operations: check repo, check staged, get diff
├── claude.ts            # Claude CLI invocation: check installed, run prompt
├── prompt.ts            # Prompt template: load file, assemble prompt string
└── test/
    └── extension.test.ts
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.9 (strict mode): Follow standard conventions

## Recent Changes

- 001-sparkle-commit: Added TypeScript 5.9 (strict mode) + VS Code Extension API (`@types/vscode ^1.109.0`), Node.js `child_process` (built-in)
- test commit from extension downloaded from marktetplace

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
