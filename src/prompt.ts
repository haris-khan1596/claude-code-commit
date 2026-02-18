import * as fs from 'fs';
import * as path from 'path';

const PROMPT_RELATIVE_PATH = ['.claude', 'commands', 'git.commit.md'];

const SEPARATOR = '\n\n--- STAGED GIT DIFF BELOW ---\n\n';

const INSTRUCTION_SUFFIX = `

Return ONLY the recommended commit message.
No explanations. No markdown formatting. No code blocks.
Just the raw commit message text.`;

export async function loadPromptTemplate(workspaceRoot: string): Promise<string> {
	const templatePath = path.join(workspaceRoot, ...PROMPT_RELATIVE_PATH);
	return fs.promises.readFile(templatePath, 'utf-8');
}

export function assemblePrompt(template: string, diff: string): string {
	return template + SEPARATOR + diff + INSTRUCTION_SUFFIX;
}
