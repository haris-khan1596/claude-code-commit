/**
 * Type declarations for VS Code Git Extension API (`vscode.git`).
 * Subset of interfaces needed for SCM input box access.
 */

export interface InputBox {
	value: string;
}

export interface Repository {
	inputBox: InputBox;
}

export interface API {
	repositories: Repository[];
}

export interface GitExtension {
	getAPI(version: 1): API;
}
