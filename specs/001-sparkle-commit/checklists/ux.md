# UX & Interaction Requirements Quality Checklist: Sparkle Commit

**Purpose**: Deep-dive validation of requirements quality for button behavior, progress states, error messaging, SCM input box interaction, accessibility, and discoverability
**Created**: 2026-02-18
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [research.md](../research.md)
**Depth**: Standard
**Audience**: Reviewer (pre-implementation gate)

**Note**: This checklist tests whether UX/interaction requirements are written correctly, not whether the implementation works.

## Button Presentation & Discoverability

- [ ] CHK001 - Is the button icon explicitly specified as a requirement (e.g., `$(sparkle)` codicon), or only a plan-level decision? [Gap - spec §FR-001 says "sparkle button" but icon name is only in research R1]
- [ ] CHK002 - Are tooltip text requirements defined for the button (what does the user see on hover)? [Gap - spec §FR-001 has no tooltip requirement]
- [ ] CHK003 - Is the button's position within the Source Control header specified (left of existing buttons, right, specific ordering via `@N`)? [Clarity, Spec §FR-001 - "header bar" but no positional requirement]
- [ ] CHK004 - Are requirements defined for the button's visibility when multiple SCM providers are active (e.g., Git + SVN)? [Gap - research R1 uses `when: scmProvider == git` but this isn't a spec requirement]
- [ ] CHK005 - Is the button's visual state (enabled/disabled appearance) specified for when generation is in progress? [Gap - spec §FR-010 mentions progress indicator but not button state]

## Progress Indicator Requirements

- [ ] CHK006 - Is the progress indicator location explicitly specified as a requirement (Source Control view, notification area, status bar)? [Gap - spec §FR-010 says "show a progress indicator" but not where; research R6 decides SourceControl location]
- [ ] CHK007 - Are requirements defined for the progress indicator's message text (e.g., "Generating commit message...")? [Gap, Spec §FR-010]
- [ ] CHK008 - Is the progress indicator's cancellability specified (can the user cancel mid-generation)? [Gap - edge case says "ignored during progress" but no cancel requirement exists]
- [ ] CHK009 - Are requirements defined for the progress indicator's behavior when generation takes longer than expected (e.g., show elapsed time, remain indeterminate)? [Gap]
- [ ] CHK010 - Is the progress indicator type specified (indeterminate spinner vs. determinate progress bar)? [Clarity, Spec §FR-010 - "progress indicator" is ambiguous]

## Error Message Requirements

- [ ] CHK011 - Are specific error message strings or content templates defined for each of the 6 error conditions? [Gap, Spec §FR-011 - says "actionable" but no message content specified]
- [ ] CHK012 - Is "actionable" defined with specific criteria (must include what to do next, a link, a command suggestion)? [Ambiguity, Spec §FR-011/SC-003]
- [ ] CHK013 - Are requirements defined for the error notification type (information, warning, error severity level)? [Gap, Spec §FR-011]
- [ ] CHK014 - Are requirements specified for whether error notifications include action buttons (e.g., "Install Claude CLI" button, "Stage Changes" button)? [Gap]
- [ ] CHK015 - Is the error notification dismissal behavior specified (auto-dismiss after timeout, persist until dismissed, replace previous)? [Gap]
- [ ] CHK016 - Are requirements defined for error notification priority when multiple errors could apply simultaneously (e.g., no repo AND no CLI)? [Gap - spec §FR-011 lists conditions but not evaluation order]

## SCM Input Box Interaction

- [ ] CHK017 - Is the requirement for "populate the commit message input box" specific about whether it sets text, appends text, or replaces text? [Clarity, Spec §FR-008 - US1 scenario 3 says "replaced" but FR-008 just says "populate"]
- [ ] CHK018 - Are requirements defined for preserving or discarding the user's existing commit message when generation completes? [Consistency - US1 scenario 3 says "replaced" but no confirmation/undo requirement exists]
- [ ] CHK019 - Is an undo/revert requirement specified for restoring the previous message after generation? [Gap - if the user had a partial message, replacing it is destructive]
- [ ] CHK020 - Are requirements defined for the cursor position after the message is populated (beginning, end, select all)? [Gap]
- [ ] CHK021 - Are requirements specified for how multi-line commit messages (with body and footer) are displayed in the input box? [Gap - spec §FR-014 only addresses trimming]

## Accessibility Requirements

- [ ] CHK022 - Are keyboard accessibility requirements defined for the sparkle button (focusable via Tab, activatable via Enter/Space)? [Gap - no accessibility requirements in spec]
- [ ] CHK023 - Are ARIA label or screen reader requirements specified for the button? [Gap]
- [ ] CHK024 - Are screen reader announcement requirements defined for progress state changes and completion? [Gap]
- [ ] CHK025 - Are screen reader requirements defined for error notifications? [Gap]
- [ ] CHK026 - Are keyboard shortcut requirements defined as an alternative to the button? [Gap - no keybinding requirement in spec]

## User Flow Completeness

- [ ] CHK027 - Is the complete happy-path user journey documented step-by-step as a requirement, or only described narratively? [Clarity, Spec §US1 - narrative form, not a precise flow diagram]
- [ ] CHK028 - Are requirements defined for what visual feedback the user receives at each step (button press acknowledged, progress visible, completion signaled)? [Gap - only progress indicator mentioned]
- [ ] CHK029 - Is a completion signal requirement specified (notification, sound, input box focus) to inform the user that generation is done? [Gap - spec implies the populated input box is sufficient but doesn't state this]
- [ ] CHK030 - Are requirements defined for the user flow when the extension is first installed (onboarding, first-use guidance)? [Gap]

## Consistency Across States

- [ ] CHK031 - Are button state requirements consistent between the idle, in-progress, error, and success states? [Consistency, Gap - only idle and in-progress mentioned]
- [ ] CHK032 - Are error message requirements consistent in tone, format, and actionability across all 6 error conditions? [Consistency, Spec §FR-011]
- [ ] CHK033 - Is the interaction pattern (button -> progress -> result) consistent with VS Code extension UX conventions? [Consistency, Gap - no reference to VS Code UX guidelines in spec]

## Notes

- Check items off as completed: `[x]`
- Items referencing [Gap] indicate missing requirements - accessibility (CHK022-CHK026) is the largest gap area
- Key theme: Error messaging requirements (CHK011-CHK016) are stated at a high level but lack specificity for implementation
- The destructive replacement of existing messages (CHK018-CHK019) is a usability risk with no undo path
- Priority: Address accessibility gaps (CHK022-CHK026), error message content (CHK011-CHK012), and progress cancellability (CHK008) before implementation
