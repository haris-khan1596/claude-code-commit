import * as vscode from 'vscode';
import { isGitRepository, hasStagedChanges, getStagedDiff } from './git';
import { isClaudeInstalled, generateCommitMessage } from './claude';
import { loadPromptTemplate, assemblePrompt } from './prompt';
import type { GitExtension } from './git-extension';

const SHELL_METACHAR_PATTERN = /[;&|$`'"\\]|\n|\r/;

let isGenerating = false;

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('claude-code-commits.generateCommit', async () => {
		if (isGenerating) {
			return;
		}
		isGenerating = true;

		try {
			// (1) Get workspace root
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders || workspaceFolders.length === 0) {
				vscode.window.showWarningMessage('No Git repository found in the current workspace.');
				return;
			}
			const workspaceRoot = workspaceFolders[0].uri.fsPath;

			// (2) Check git repository
			if (!await isGitRepository(workspaceRoot)) {
				vscode.window.showWarningMessage('No Git repository found in the current workspace.');
				return;
			}

			// (3) Check staged changes
			if (!await hasStagedChanges(workspaceRoot)) {
				vscode.window.showWarningMessage('Please stage your changes before generating a commit message.');
				return;
			}

			// (4) Check Claude CLI installed
			if (!await isClaudeInstalled()) {
				const action = await vscode.window.showWarningMessage(
					'Claude Code CLI is not installed. Please install it first: https://docs.anthropic.com/claude-code',
					'View Documentation'
				);
				if (action === 'View Documentation') {
					vscode.env.openExternal(vscode.Uri.parse('https://docs.anthropic.com/claude-code'));
				}
				return;
			}

			// (5) Load prompt template
			let template: string;
			try {
				template = await loadPromptTemplate(workspaceRoot);
			} catch {
				const action = await vscode.window.showWarningMessage(
					'Prompt template not found at .claude/commands/git.commit.md',
					'View Documentation'
				);
				if (action === 'View Documentation') {
					vscode.env.openExternal(vscode.Uri.parse('https://docs.anthropic.com/claude-code'));
				}
				return;
			}

			// (6) Read model configuration
			const model = vscode.workspace.getConfiguration('sparkleCommit').get<string>('claudeModel', 'sonnet');
			if (!model || SHELL_METACHAR_PATTERN.test(model)) {
				vscode.window.showWarningMessage('Invalid Claude model name. Please check your sparkleCommit.claudeModel setting.');
				return;
			}

			// (7-10) Wrap generation in progress indicator
			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.SourceControl,
					title: 'Generating commit message with Claude...'
				},
				async () => {
					// (7) Get staged diff
					const diff = await getStagedDiff(workspaceRoot);

					// (8) Assemble prompt
					const prompt = assemblePrompt(template, diff);

					// (9-10) Generate commit message
					let message: string;
					try {
						message = await generateCommitMessage(prompt, model, workspaceRoot);
					} catch (err) {
						const errorMessage = err instanceof Error ? err.message : String(err);
						if (errorMessage.includes('empty message')) {
							vscode.window.showWarningMessage('Claude returned an empty message. Please try again.');
						} else if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timed out') || errorMessage.includes('killed')) {
							vscode.window.showWarningMessage('Claude Code CLI timed out. Please try again.');
						} else {
							vscode.window.showWarningMessage(`Claude Code CLI failed: ${errorMessage}. Please check your setup.`);
						}
						return;
					}

					// (11) Set SCM input box value
					const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git');
					if (!gitExtension) {
						vscode.window.showWarningMessage('VS Code Git extension not found.');
						return;
					}

					const git = gitExtension.exports.getAPI(1);
					const repo = git.repositories[0];
					if (!repo) {
						vscode.window.showWarningMessage('No Git repository found.');
						return;
					}

					repo.inputBox.value = message;

					// Focus SCM view to bring attention to the populated message (FR-008a)
					vscode.commands.executeCommand('workbench.view.scm');
				}
			);
		} finally {
			isGenerating = false;
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
