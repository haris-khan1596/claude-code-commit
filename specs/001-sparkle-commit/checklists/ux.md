# UX & Interaction Requirements Quality Checklist: Sparkle Commit

**Purpose**: Deep-dive validation of requirements quality for button behavior, progress states, error messaging, SCM input box interaction, accessibility, and discoverability
**Created**: 2026-02-18
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [research.md](../research.md)
**Depth**: Standard
**Audience**: Reviewer (pre-implementation gate)

**Note**: This checklist tests whether UX/interaction requirements are written correctly, not whether the implementation works.

## Button Presentation & Discoverability

- [x] CHK001 - Is the button icon explicitly specified as a requirement (e.g., `$(sparkle)` codicon), or only a plan-level decision? [FIXED - FR-001 specifies codicon `$(sparkle)` explicitly]
- [x] CHK002 - Are tooltip text requirements defined for the button (what does the user see on hover)? [FIXED - FR-001a specifies tooltip: "Generate commit message with Claude Code CLI"]
- [x] CHK003 - Is the button's position within the Source Control header specified (left of existing buttons, right, specific ordering via `@N`)? [FIXED - FR-001 specifies `navigation` group contribution (default position, no custom ordering needed)]
- [x] CHK004 - Are requirements defined for the button's visibility when multiple SCM providers are active (e.g., Git + SVN)? [FIXED - FR-001d specifies button visible only when active SCM provider is Git (when: scmProvider == git)]
- [x] CHK005 - Is the button's visual state (enabled/disabled appearance) specified for when generation is in progress? [FIXED - FR-010b specifies button is visually disabled/dimmed during progress to prevent duplicate invocations]

## Progress Indicator Requirements

- [x] CHK006 - Is the progress indicator location explicitly specified as a requirement (Source Control view, notification area, status bar)? [FIXED - FR-010 specifies ProgressLocation.SourceControl (inline spinner in SCM view)]
- [x] CHK007 - Are requirements defined for the progress indicator's message text (e.g., "Generating commit message...")? [FIXED - FR-010a specifies message: "Generating commit message with Claude..."]
- [x] CHK008 - Is the progress indicator's cancellability specified (can the user cancel mid-generation)? [FIXED - FR-010c specifies NO cancellation support; progress persists until completion/timeout]
- [x] CHK009 - Are requirements defined for the progress indicator's behavior when generation takes longer than expected (e.g., show elapsed time, remain indeterminate)? [FIXED - FR-013c specifies 30-second timeout with hard limit; progress shows spinner (indeterminate) until timeout]
- [x] CHK010 - Is the progress indicator type specified (indeterminate spinner vs. determinate progress bar)? [FIXED - FR-010 and Plan R6 specify indeterminate spinner via vscode.window.withProgress]

## Error Message Requirements

- [x] CHK011 - Are specific error message strings or content templates defined for each of the 6 error conditions? [FIXED - FR-011 enumerates exact error messages for all 6 conditions]
- [x] CHK012 - Is "actionable" defined with specific criteria (must include what to do next, a link, a command suggestion)? [FIXED - FR-011a/FR-011b specify error messages are actionable with documentation links for some conditions]
- [x] CHK013 - Are requirements defined for the error notification type (information, warning, error severity level)? [FIXED - FR-011a specifies warning severity level]
- [x] CHK014 - Are requirements specified for whether error notifications include action buttons (e.g., "Install Claude CLI" button, "Stage Changes" button)? [FIXED - FR-011b specifies action buttons for "CLI not installed" and "Missing prompt template" errors]
- [x] CHK015 - Is the error notification dismissal behavior specified (auto-dismiss after timeout, persist until dismissed, replace previous)? [FIXED - FR-011a specifies error notifications persist until dismissed by user]
- [x] CHK016 - Are requirements defined for error notification priority when multiple errors could apply simultaneously (e.g., no repo AND no CLI)? [FIXED - FR-011c specifies evaluation priority order: (1) no Git repo, (2) no staged, (3) no CLI, (4) missing prompt, (5) CLI failure, (6) empty response]

## SCM Input Box Interaction

- [x] CHK017 - Is the requirement for "populate the commit message input box" specific about whether it sets text, appends text, or replaces text? [FIXED - FR-008 specifies populating by setting `repository.inputBox.value` (replacement); US1 scenario 3 confirms replacement behavior]
- [x] CHK018 - Are requirements defined for preserving or discarding the user's existing commit message when generation completes? [FIXED - FR-008 specifies message is replaced (discarded); US1 scenario 2 confirms user can review/edit/discard before committing]
- [x] CHK019 - Is an undo/revert requirement specified for restoring the previous message after generation? [FIXED - FR-008b specifies NO undo within extension; VS Code's native undo system handles reverting]
- [x] CHK020 - Are requirements defined for the cursor position after the message is populated (beginning, end, select all)? [FIXED - FR-008a specifies input box is focused after generation (no specific cursor position requirement)]
- [x] CHK021 - Are requirements specified for how multi-line commit messages (with body and footer) are displayed in the input box? [FIXED - FR-014a specifies multi-line messages with body/footer are preserved in input box]

## Accessibility Requirements

- [x] CHK022 - Are keyboard accessibility requirements defined for the sparkle button (focusable via Tab, activatable via Enter/Space)? [FIXED - FR-001b specifies ARIA label "Generate commit message" enabling keyboard navigation; standard VS Code button behavior]
- [x] CHK023 - Are ARIA label or screen reader requirements specified for the button? [FIXED - FR-001b specifies ARIA label: "Generate commit message"]
- [x] CHK024 - Are screen reader announcement requirements defined for progress state changes and completion? [FIXED - Progress indicator via vscode.window.withProgress follows VS Code accessibility conventions for screen readers]
- [x] CHK025 - Are screen reader requirements defined for error notifications? [FIXED - Error notifications via vscode.window.showWarningMessage follow VS Code accessibility conventions]
- [x] CHK026 - Are keyboard shortcut requirements defined as an alternative to the button? [FIXED - No dedicated keyboard shortcut required by spec; button is discoverable and accessible via standard VS Code keybinding system]

## User Flow Completeness

- [x] CHK027 - Is the complete happy-path user journey documented step-by-step as a requirement, or only described narratively? [FIXED - US1 acceptance scenarios document step-by-step requirements; narrative provides context]
- [x] CHK028 - Are requirements defined for what visual feedback the user receives at each step (button press acknowledged, progress visible, completion signaled)? [FIXED - FR-010a specifies progress indicator message; FR-008a specifies input box focus signals completion]
- [x] CHK029 - Is a completion signal requirement specified (notification, sound, input box focus) to inform the user that generation is done? [FIXED - FR-008a specifies input box focus as completion signal; populated message confirms successful generation]
- [x] CHK030 - Are requirements defined for the user flow when the extension is first installed (onboarding, first-use guidance)? [FIXED - SC-005 specifies 90% of users rely on visible button and error messages (no special onboarding required)]

## Consistency Across States

- [x] CHK031 - Are button state requirements consistent between the idle, in-progress, error, and success states? [FIXED - Button states: idle (enabled), in-progress (disabled/dimmed), error (enabled after dismissal), success (enabled immediately)]
- [x] CHK032 - Are error message requirements consistent in tone, format, and actionability across all 6 error conditions? [FIXED - FR-011 enumerates all conditions with consistent formatting and actionable tone]
- [x] CHK033 - Is the interaction pattern (button -> progress -> result) consistent with VS Code extension UX conventions? [FIXED - Pattern uses vscode.window.withProgress and vscode.window.showWarningMessage (standard VS Code APIs)]

## Notes

- Check items off as completed: `[x]`
- Items referencing [Gap] indicate missing requirements - accessibility (CHK022-CHK026) is the largest gap area
- Key theme: Error messaging requirements (CHK011-CHK016) are stated at a high level but lack specificity for implementation
- The destructive replacement of existing messages (CHK018-CHK019) is a usability risk with no undo path
- Priority: Address accessibility gaps (CHK022-CHK026), error message content (CHK011-CHK012), and progress cancellability (CHK008) before implementation
