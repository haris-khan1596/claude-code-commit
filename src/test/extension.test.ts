import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	test('extension is present', () => {
		const ext = vscode.extensions.getExtension('HarisKhan1596.claude-code-commits');
		assert.ok(ext, 'Extension should be installed');
	});

	test('command is registered after activation', async () => {
		const ext = vscode.extensions.getExtension('HarisKhan1596.claude-code-commits');
		assert.ok(ext, 'Extension should be installed');

		await ext.activate();

		const commands = await vscode.commands.getCommands();
		assert.ok(
			commands.includes('claude-code-commits.generateCommit'),
			'generateCommit command should be registered'
		);
	});
});
