import { exec } from 'child_process';

const EXEC_OPTIONS = {
	maxBuffer: 10485760, // 10MB
	timeout: 30000,      // 30 seconds
	encoding: 'utf-8' as const
};

function execPromise(cmd: string, cwd: string): Promise<string> {
	return new Promise((resolve, reject) => {
		exec(cmd, { ...EXEC_OPTIONS, cwd }, (error, stdout, stderr) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(stdout);
		});
	});
}

export async function isGitRepository(cwd: string): Promise<boolean> {
	try {
		await execPromise('git rev-parse --git-dir', cwd);
		return true;
	} catch {
		return false;
	}
}

export async function hasStagedChanges(cwd: string): Promise<boolean> {
	try {
		const output = await execPromise('git diff --staged --stat', cwd);
		return output.trim().length > 0;
	} catch {
		return false;
	}
}

export async function getStagedDiff(cwd: string): Promise<string> {
	return execPromise('git diff --staged', cwd);
}

export async function hasAnyChanges(cwd: string): Promise<boolean> {
	try {
		const output = await execPromise('git diff HEAD --stat', cwd);
		return output.trim().length > 0;
	} catch {
		// HEAD may not exist on initial commit — fall back to porcelain
		try {
			const output = await execPromise('git status --porcelain', cwd);
			return output.trim().length > 0;
		} catch {
			return false;
		}
	}
}

export async function getAllDiff(cwd: string): Promise<string> {
	return execPromise('git diff HEAD', cwd);
}
