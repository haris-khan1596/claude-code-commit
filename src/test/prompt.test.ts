import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadPromptTemplate, assemblePrompt } from '../prompt';

suite('Prompt Module', () => {
	let tmpDir: string;

	setup(async () => {
		tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'sparkle-test-'));
	});

	teardown(async () => {
		await fs.promises.rm(tmpDir, { recursive: true, force: true });
	});

	suite('loadPromptTemplate', () => {
		test('returns conventional template by default when no file exists', async () => {
			const template = await loadPromptTemplate(tmpDir);
			assert.ok(template.includes('Conventional Commits'));
			assert.ok(template.includes('<type>(<scope>): <description>'));
		});

		test('returns conventional template when commitStyle is conventional', async () => {
			const template = await loadPromptTemplate(tmpDir, undefined, 'conventional');
			assert.ok(template.includes('<type>(<scope>): <description>'));
		});

		test('returns prefix template when commitStyle is prefix', async () => {
			const template = await loadPromptTemplate(tmpDir, undefined, 'prefix');
			assert.ok(template.includes('<type>: <description>'));
			assert.ok(!template.includes('<type>(<scope>)'));
			assert.ok(template.includes('No scope, no body, no footer'));
		});

		test('returns simple template when commitStyle is simple', async () => {
			const template = await loadPromptTemplate(tmpDir, undefined, 'simple');
			assert.ok(template.includes('No prefix, no type label, no scope'));
			assert.ok(!template.includes('Conventional Commits'));
		});

		test('custom rules file overrides commitStyle', async () => {
			const rulesDir = path.join(tmpDir, '.vscode');
			await fs.promises.mkdir(rulesDir, { recursive: true });
			const rulesFile = path.join(rulesDir, 'commit-rules.md');
			await fs.promises.writeFile(rulesFile, 'My custom rules');

			const template = await loadPromptTemplate(tmpDir, '.vscode/commit-rules.md', 'simple');
			assert.strictEqual(template, 'My custom rules');
		});

		test('custom rulesPath is used when provided', async () => {
			const customDir = path.join(tmpDir, 'custom');
			await fs.promises.mkdir(customDir, { recursive: true });
			await fs.promises.writeFile(path.join(customDir, 'my-rules.md'), 'Custom path rules');

			const template = await loadPromptTemplate(tmpDir, 'custom/my-rules.md');
			assert.strictEqual(template, 'Custom path rules');
		});

		test('falls back to style template when custom file does not exist', async () => {
			const template = await loadPromptTemplate(tmpDir, 'nonexistent/rules.md', 'prefix');
			assert.ok(template.includes('<type>: <description>'));
		});

		test('falls back to conventional for unknown style', async () => {
			// Simulates a user typing an invalid value in settings.json
			const template = await loadPromptTemplate(tmpDir, undefined, 'bogus' as never);
			assert.ok(template.includes('Conventional Commits'));
		});
	});

	suite('assemblePrompt', () => {
		test('concatenates template, separator, diff, and instruction suffix', () => {
			const result = assemblePrompt('TEMPLATE', 'DIFF');
			assert.ok(result.startsWith('TEMPLATE'));
			assert.ok(result.includes('--- STAGED GIT DIFF BELOW ---'));
			assert.ok(result.includes('DIFF'));
			assert.ok(result.includes('Return ONLY the recommended commit message'));
		});

		test('preserves template and diff content exactly', () => {
			const template = 'Generate a commit message with special chars: <>&"\'';
			const diff = '+ added line\n- removed line';
			const result = assemblePrompt(template, diff);
			assert.ok(result.includes(template));
			assert.ok(result.includes(diff));
		});
	});
});
