import { NativeTextInputSnapshot, NativeTextRange } from "./NativeTextInputTypes";

/** @internal */
export enum NativeTextInputAction {
    Default,
    Enter,
    Done,
    Next,
    Search,
    Send
}

/** @internal */
export enum NativeTextInputEndPolicy {
    CommitComposition,
    CancelComposition
}

/** @internal */
export interface NativeTextInputSessionConfig {
    multiline: boolean;
    editable: boolean;
    password: boolean;
    wordWrap: boolean;
    inputType: string;
    action: NativeTextInputAction;
    maxLength: number;
}

/** @internal */
export interface NativeTextInputRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** @internal */
export interface NativeTextInputCapabilities {
    composition: boolean;
    surroundingText: boolean;
    selection: boolean;
    candidateRect: boolean;
    virtualKeyboard: boolean;
    clipboard: boolean;
}

/**
 * Commands produced by an operating-system IME. Implementations must pass the
 * session id received by beginSession back unchanged.
 * @internal
 */
export interface INativeTextInputClient {
    querySnapshot(sessionId: number): NativeTextInputSnapshot | null;
    setComposition(sessionId: number, text: string, selection: NativeTextRange): void;
    commitText(sessionId: number, text: string): void;
    finishComposition(sessionId: number): void;
    cancelComposition(sessionId: number): void;
    replaceText(sessionId: number, range: NativeTextRange, text: string): void;
    setSelection(sessionId: number, selection: NativeTextRange): void;
    deleteSurroundingText(sessionId: number, before: number, after: number): void;
    undo(sessionId: number): void;
    redo(sessionId: number): void;
    performAction(sessionId: number, action: NativeTextInputAction): void;
    platformSuspended(sessionId: number): void;
    platformResumed(sessionId: number): void;
}

/**
 * Headless platform input context. It owns IME integration and candidate
 * positioning, but never owns or draws a visible input control.
 * @internal
 */
export interface INativeTextInputContext {
    readonly capabilities: NativeTextInputCapabilities;

    initialize(client: INativeTextInputClient): boolean;
    shutdown(): void;
    beginSession(sessionId: number, config: NativeTextInputSessionConfig, snapshot: NativeTextInputSnapshot): void;
    updateState(sessionId: number, snapshot: NativeTextInputSnapshot): void;
    updateCaretRect(sessionId: number, rect: NativeTextInputRect): void;
    suspendSession(sessionId: number): void;
    resumeSession(sessionId: number): void;
    endSession(sessionId: number, policy: NativeTextInputEndPolicy): void;
    showKeyboard(sessionId: number): void;
    hideKeyboard(sessionId: number): void;
    getClipboardText?(): string;
    setClipboardText?(text: string): boolean;
}
