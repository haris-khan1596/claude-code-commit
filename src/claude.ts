import { exec, spawn } from 'child_process';

const TIMEOUT_MS = 30000; // 30 seconds

export async function isClaudeInstalled(): Promise<boolean> {
	return new Promise((resolve) => {
		exec('claude --version', { encoding: 'utf-8' }, (error) => {
			resolve(!error);
		});
	});
}

export async function generateCommitMessage(prompt: string, model: string, cwd: string): Promise<string> {
	return new Promise((resolve, reject) => {
		let settled = false;
		const args = ['-p', '--model', model, '--output-format', 'text', '--tools', '', '--max-turns', '1'];
		const child = spawn('claude', args, { cwd, shell: true, stdio: ['pipe', 'pipe', 'pipe'] });

		let stdout = '';
		let stderr = '';

		child.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
		child.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

		const timer = setTimeout(() => {
			if (!settled) {
				settled = true;
				child.kill();
				reject(new Error('Claude Code CLI timed out. Please try again.'));
			}
		}, TIMEOUT_MS);

		child.on('error', (err) => {
			if (!settled) {
				settled = true;
				clearTimeout(timer);
				reject(err);
			}
		});

		child.on('close', (code) => {
			if (settled) {
				return;
			}
			settled = true;
			clearTimeout(timer);

			if (stderr) {
				console.log('[sparkle-commit] Claude CLI stderr:', stderr);
			}

			if (code !== 0) {
				const detail = stderr.trim() || `Process exited with code ${code}`;
				reject(new Error(detail));
				return;
			}

			const trimmed = stdout.trim();
			if (!trimmed) {
				reject(new Error('Claude returned an empty message. Please try again.'));
				return;
			}
			resolve(trimmed);
		});

		child.stdin.write(prompt);
		child.stdin.end();
	});
}
