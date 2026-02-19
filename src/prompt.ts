import * as fs from 'fs';
import * as path from 'path';

export type CommitStyle = 'conventional' | 'prefix' | 'simple';

const DEFAULT_RULES_PATH = '.vscode/commit-rules.md';

const SEPARATOR = '\n\n--- STAGED GIT DIFF BELOW ---\n\n';

const INSTRUCTION_SUFFIX = `

Return ONLY the recommended commit message.
No explanations. No markdown formatting. No code blocks.
Just the raw commit message text.`;

const CONVENTIONAL_TEMPLATE = `Analyze the staged Git diff below and generate a single commit message using the Conventional Commits format:

\`\`\`
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
\`\`\`

**Types** (pick the most appropriate):
feat, fix, docs, style, refactor, perf, test, build, ci, chore

**Scope**: derive from the primary directory/module affected (lowercase, kebab-case).

**Description rules**:
- Imperative mood ("add" not "added")
- Lowercase after colon, no trailing period
- Max 72 chars for the first line
- Focus on WHAT and WHY

**Body**: include only if the change is complex — explain motivation and contrast with previous behavior. Wrap at 72 chars.

**Footer**: include \`BREAKING CHANGE: <description>\` if applicable. Add \`Fixes #<issue>\` if relevant.

If changes are unrelated, suggest splitting into multiple commits.
Never include secrets, tokens, or sensitive data.`;

const PREFIX_TEMPLATE = `Analyze the staged Git diff below and generate a single commit message with this format:

\`\`\`
<type>: <description>
\`\`\`

**Types** (pick the most appropriate):
feat, fix, docs, style, refactor, perf, test, build, ci, chore

**Rules**:
- Imperative mood ("add" not "added")
- Lowercase after colon, no trailing period
- Max 72 chars for the entire line
- Focus on WHAT and WHY
- No scope, no body, no footer — just the single line

Never include secrets, tokens, or sensitive data.`;

const SIMPLE_TEMPLATE = `Analyze the staged Git diff below and generate a single commit message.

**Rules**:
- One concise line, imperative mood ("add" not "added")
- Max 72 characters
- Focus on WHAT changed and WHY
- No prefix, no type label, no scope — just a plain description
- Lowercase first letter, no trailing period

Never include secrets, tokens, or sensitive data.`;

const TEMPLATES: Record<CommitStyle, string> = {
	conventional: CONVENTIONAL_TEMPLATE,
	prefix: PREFIX_TEMPLATE,
	simple: SIMPLE_TEMPLATE,
};

export async function loadPromptTemplate(
	workspaceRoot: string,
	rulesPath?: string,
	commitStyle: CommitStyle = 'conventional'
): Promise<string> {
	try {
		const relativePath = rulesPath || DEFAULT_RULES_PATH;
		const templatePath = path.join(workspaceRoot, relativePath);
		return await fs.promises.readFile(templatePath, 'utf-8');
	} catch {
		return TEMPLATES[commitStyle] ?? TEMPLATES.conventional;
	}
}

export function assemblePrompt(template: string, diff: string): string {
	return template + SEPARATOR + diff + INSTRUCTION_SUFFIX;
}
