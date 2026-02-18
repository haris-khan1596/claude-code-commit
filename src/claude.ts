import { exec } from 'child_process';

const EXEC_OPTIONS = {
	maxBuffer: 10485760, // 10MB
	timeout: 30000,      // 30 seconds
	encoding: 'utf-8' as const
};

export async function isClaudeInstalled(): Promise<boolean> {
	return new Promise((resolve) => {
		exec('claude --version', { encoding: 'utf-8' }, (error) => {
			resolve(!error);
		});
	});
}

export async function generateCommitMessage(prompt: string, model: string, cwd: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const child = exec(
			`claude -p --model ${model} --output-format text --tools "" --max-turns 1`,
			{ ...EXEC_OPTIONS, cwd },
			(error, stdout, stderr) => {
				if (stderr) {
					console.log('[sparkle-commit] Claude CLI stderr:', stderr);
				}
				if (error) {
					reject(new Error(error.message));
					return;
				}
				const trimmed = stdout.trim();
				if (!trimmed) {
					reject(new Error('Claude returned an empty message. Please try again.'));
					return;
				}
				resolve(trimmed);
			}
		);
		if (child.stdin) {
			child.stdin.write(prompt);
			child.stdin.end();
		}
	});
}
