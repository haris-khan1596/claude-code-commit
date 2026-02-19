import * as fs from 'fs';
import * as path from 'path';

const PROMPT_RELATIVE_PATH = ['.vscode', 'commit-rules.md'];

const SEPARATOR = '\n\n--- STAGED GIT DIFF BELOW ---\n\n';

const INSTRUCTION_SUFFIX = `

Return ONLY the recommended commit message.
No explanations. No markdown formatting. No code blocks.
Just the raw commit message text.`;

const DEFAULT_TEMPLATE = `Analyze the staged Git diff below and generate a single commit message using the Conventional Commits format:

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

export async function loadPromptTemplate(workspaceRoot: string): Promise<string> {
	try {
		const templatePath = path.join(workspaceRoot, ...PROMPT_RELATIVE_PATH);
		return await fs.promises.readFile(templatePath, 'utf-8');
	} catch {
		return DEFAULT_TEMPLATE;
	}
}

export function assemblePrompt(template: string, diff: string): string {
	return template + SEPARATOR + diff + INSTRUCTION_SUFFIX;
}
