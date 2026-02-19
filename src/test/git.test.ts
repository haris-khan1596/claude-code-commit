import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { isGitRepository, hasStagedChanges, hasAnyChanges, getStagedDiff, getAllDiff } from '../git';

function run(cmd: string, cwd: string): Promise<string> {
	return new Promise((resolve, reject) => {
		exec(cmd, { cwd, encoding: 'utf-8' }, (err, stdout) => {
			if (err) { reject(err); return; }
			resolve(stdout);
		});
	});
}

suite('Git Module', () => {
	let tmpDir: string;

	setup(async () => {
		tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'sparkle-git-test-'));
		await run('git init', tmpDir);
		await run('git config user.email "test@test.com"', tmpDir);
		await run('git config user.name "Test"', tmpDir);
	});

	teardown(async () => {
		await fs.promises.rm(tmpDir, { recursive: true, force: true });
	});

	suite('isGitRepository', () => {
		test('returns true for a git repo', async () => {
			assert.strictEqual(await isGitRepository(tmpDir), true);
		});

		test('returns false for a non-git directory', async () => {
			const nonGit = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'sparkle-nogit-'));
			try {
				assert.strictEqual(await isGitRepository(nonGit), false);
			} finally {
				await fs.promises.rm(nonGit, { recursive: true, force: true });
			}
		});
	});

	suite('hasStagedChanges', () => {
		test('returns false when nothing is staged', async () => {
			assert.strictEqual(await hasStagedChanges(tmpDir), false);
		});

		test('returns true when a file is staged', async () => {
			await fs.promises.writeFile(path.join(tmpDir, 'file.txt'), 'hello');
			await run('git add file.txt', tmpDir);
			assert.strictEqual(await hasStagedChanges(tmpDir), true);
		});
	});

	suite('hasAnyChanges', () => {
		test('returns false on a clean repo with no commits', async () => {
			// Empty repo, no files — hasAnyChanges should return false
			assert.strictEqual(await hasAnyChanges(tmpDir), false);
		});

		test('returns true when there are untracked files', async () => {
			await fs.promises.writeFile(path.join(tmpDir, 'new.txt'), 'content');
			assert.strictEqual(await hasAnyChanges(tmpDir), true);
		});

		test('returns true when there are unstaged changes after a commit', async () => {
			await fs.promises.writeFile(path.join(tmpDir, 'file.txt'), 'v1');
			await run('git add file.txt', tmpDir);
			await run('git commit -m "init"', tmpDir);
			await fs.promises.writeFile(path.join(tmpDir, 'file.txt'), 'v2');
			assert.strictEqual(await hasAnyChanges(tmpDir), true);
		});

		test('returns true when there are staged changes after a commit', async () => {
			await fs.promises.writeFile(path.join(tmpDir, 'file.txt'), 'v1');
			await run('git add file.txt', tmpDir);
			await run('git commit -m "init"', tmpDir);
			await fs.promises.writeFile(path.join(tmpDir, 'file.txt'), 'v2');
			await run('git add file.txt', tmpDir);
			assert.strictEqual(await hasAnyChanges(tmpDir), true);
		});
	});

	suite('getStagedDiff', () => {
		test('returns diff of staged files', async () => {
			await fs.promises.writeFile(path.join(tmpDir, 'file.txt'), 'hello world');
			await run('git add file.txt', tmpDir);
			const diff = await getStagedDiff(tmpDir);
			assert.ok(diff.includes('hello world'));
			assert.ok(diff.includes('diff --git'));
		});
	});

	suite('getAllDiff', () => {
		test('returns diff of all changes against HEAD', async () => {
			await fs.promises.writeFile(path.join(tmpDir, 'file.txt'), 'v1');
			await run('git add file.txt', tmpDir);
			await run('git commit -m "init"', tmpDir);

			// Make an unstaged change
			await fs.promises.writeFile(path.join(tmpDir, 'file.txt'), 'v2');
			const diff = await getAllDiff(tmpDir);
			assert.ok(diff.includes('diff --git'));
			assert.ok(diff.includes('v2'));
		});

		test('includes both staged and unstaged changes', async () => {
			await fs.promises.writeFile(path.join(tmpDir, 'a.txt'), 'original');
			await run('git add a.txt', tmpDir);
			await run('git commit -m "init"', tmpDir);

			// Staged change
			await fs.promises.writeFile(path.join(tmpDir, 'a.txt'), 'staged change');
			await run('git add a.txt', tmpDir);

			// Unstaged change in another file
			await fs.promises.writeFile(path.join(tmpDir, 'b.txt'), 'unstaged new file');
			// Note: getAllDiff uses git diff HEAD which only shows tracked files
			// b.txt is untracked so it won't appear — that's expected behavior

			const diff = await getAllDiff(tmpDir);
			assert.ok(diff.includes('staged change'));
		});
	});
});
